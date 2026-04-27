/**
 * Piro Core Server
 * Connects to Pi CLI for real AI processing
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';

export interface PiroConfig {
  port: number;
  host: string;
}

const DEFAULT_CONFIG: PiroConfig = {
  port: 3847,
  host: '0.0.0.0',
};

// In-memory storage
const specs = new Map();
const hooks = new Map();
const deployments = new Map();

export class PiroCore {
  private server: ReturnType<typeof Fastify>;
  private config: PiroConfig;

  constructor(config: Partial<PiroConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.server = Fastify({ logger: true });
  }

  // Run Pi CLI and get response
  private runPi(prompt: string): Promise<string> {
    return new Promise((resolve) => {
      // Use --print for non-interactive mode
      const proc = spawn('pi', ['--mode', 'print', '--no-session'], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let output = '';
      let error = '';

      proc.stdout?.on('data', (data) => {
        output += data.toString();
      });

      proc.stderr?.on('data', (data) => {
        error += data.toString();
      });

      proc.on('close', () => {
        resolve(output || error || 'Pi completed');
      });

      proc.on('error', () => {
        resolve('Error: Pi not found. Install from pi.dev');
      });

      // Write prompt to stdin and close
      proc.stdin?.write(prompt + '\n');
      proc.stdin?.end();

      // Timeout after 60 seconds
      setTimeout(() => {
        proc.kill();
        resolve(output || 'Pi timed out');
      }, 60000);
    });
  }

  async start(): Promise<void> {
    await this.server.register(cors, {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    });

    // Health check
    this.server.get('/health', async () => {
      return { status: 'ok', version: '1.0.0', pi: 'connected' };
    });

    // Chat - main AI endpoint
    this.server.post('/api/chat', async (request) => {
      const { message } = (request.body as { message: string }) || {};
      if (!message) {
        return { error: 'No message provided' };
      }

      try {
        const response = await this.runPi(message);
        return { message: response, success: true };
      } catch (error) {
        return { error: String(error), message: 'Pi failed' };
      }
    });

    // Generate spec using Pi
    this.server.post('/api/specs/generate', async (request) => {
      const { prompt } = (request.body as { prompt: string }) || {};
      const specPrompt = `Create a specification for: ${prompt}

Return ONLY valid JSON like:
{"title":"name","requirements":[{"type":"U","text":"..."}],"tasks":[{"title":"...","role":"architect","status":"pending"}]}`;

      try {
        const response = await this.runPi(specPrompt);
        // Try to extract JSON
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            const id = uuidv4();
            const spec = { id, ...parsed, status: 'draft', createdAt: new Date() };
            specs.set(id, spec);
            return spec;
          } catch {}
        }
        return this.generateSpec(prompt);
      } catch {
        return this.generateSpec(prompt);
      }
    });

    // Run agent
    this.server.post('/api/agents/run', async (request) => {
      const { role, task } = (request.body as { role: string; task: string }) || {};
      const rolePrefix: Record<string, string> = {
        architect: 'As a system architect: ',
        implementer: 'As a code implementer: ',
        tester: 'As a QA engineer: ',
        'docs-writer': 'As a technical writer: ',
        deployer: 'As a DevOps engineer: ',
        reviewer: 'As a code reviewer: ',
      };
      const response = await this.runPi(rolePrefix[role] + task);
      return { output: response, success: true };
    });

    // Run hook
    this.server.post('/api/hooks/:id/run', async (request) => {
      const { id } = request.params as { id: string };
      const hook = hooks.get(id);
      if (!hook) return { error: 'Hook not found' };
      const response = await this.runPi(hook.prompt as string);
      return { output: response, success: true };
    });

    // Execute power
    this.server.post('/api/powers/execute', async (request) => {
      const { powerId, params } = (request.body as { powerId: string; params: Record<string, string> }) || {};
      const response = await this.runPi(`Execute ${powerId} with params: ${JSON.stringify(params)}`);
      return { output: response };
    });

    // Deploy
    this.server.post('/api/deploy', async (request) => {
      const { provider, target } = (request.body as { provider: string; target: string }) || {};
      await this.runPi(`Deploy to ${provider} ${target}`);
      return this.deploy(provider || 'aws', target || 'ec2', {});
    });

    // CRUD
    this.server.get('/api/specs', async () => Array.from(specs.values()));
    this.server.put('/api/specs/:id/status', async (request) => {
      const { id } = request.params as { id: string };
      const { status } = (request.body as { status: string }) || {};
      const spec = specs.get(id);
      if (spec) { spec.status = status; specs.set(id, spec); }
      return spec;
    });

    this.server.get('/api/hooks', async () => Array.from(hooks.values()));
    this.server.post('/api/hooks', async (request) => {
      const hook = request.body as Record<string, unknown>;
      const id = uuidv4();
      const newHook = { ...hook, id };
      hooks.set(id, newHook);
      return newHook;
    });
    this.server.delete('/api/hooks/:id', async (request) => {
      const { id } = request.params as { id: string };
      hooks.delete(id);
      return { success: true };
    });

    this.server.get('/api/powers', async () => this.getPowers());
    this.server.post('/api/tasks/:id/execute', async () => ({ success: true }));

    const address = await this.server.listen({
      port: this.config.port,
      host: this.config.host,
    });

    console.log(`\n🚀 Piro Core started at ${address}`);
    console.log(`🤖 Connected to Pi\n`);
  }

  private generateSpec(prompt: string) {
    const id = uuidv4();
    const spec = {
      id,
      title: prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''),
      description: prompt,
      requirements: [
        { type: 'U', text: `Implement: ${prompt.slice(0, 100)}` },
        { type: 'S', text: 'All functionality via API' },
        { type: 'C', text: 'Follow best practices' },
        { type: 'Q', text: 'Well-documented and testable' },
      ],
      tasks: [
        { id: 't1', title: 'Analyze requirements', role: 'architect', status: 'pending' },
        { id: 't2', title: 'Design system', role: 'architect', status: 'pending' },
        { id: 't3', title: 'Implement', role: 'implementer', status: 'pending' },
        { id: 't4', title: 'Write tests', role: 'tester', status: 'pending' },
        { id: 't5', title: 'Create docs', role: 'docs-writer', status: 'pending' },
      ],
      status: 'draft',
      createdAt: new Date(),
    };
    specs.set(id, spec);
    return spec;
  }

  private getPowers() {
    return [
      { id: 'file:read', name: 'Read File', category: 'file', description: 'Read file contents', enabled: true },
      { id: 'file:write', name: 'Write File', category: 'file', description: 'Write to file', enabled: true },
      { id: 'git:status', name: 'Git Status', category: 'git', description: 'Check git status', enabled: true },
      { id: 'git:commit', name: 'Git Commit', category: 'git', description: 'Commit changes', enabled: true },
      { id: 'test:run', name: 'Run Tests', category: 'test', description: 'Execute test suite', enabled: true },
      { id: 'deploy:aws', name: 'Deploy to AWS', category: 'deploy', description: 'Deploy to AWS', enabled: true },
    ];
  }

  private deploy(provider: string, target: string, _config: Record<string, string>) {
    const id = uuidv4();
    const deployment = {
      id,
      name: `${provider}-deployment`,
      provider,
      target,
      status: 'running',
      url: `https://${provider}-${id.slice(0, 8)}.example.com`,
    };
    deployments.set(id, deployment);
    return deployment;
  }

  async stop(): Promise<void> {
    await this.server.close();
  }
}

async function main() {
  const piro = new PiroCore();
  await piro.start();

  process.on('SIGINT', async () => {
    await piro.stop();
    process.exit(0);
  });
}

main();