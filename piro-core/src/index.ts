/**
 * Piro Core Server
 * API Server for Piro Desktop IDE
 * 
 * This provides the REST API endpoints.
 * For real AI, it will connect to Pi (needs Pi installed and configured).
 */

import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
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
  private server: FastifyInstance;
  private config: PiroConfig;

  constructor(config: Partial<PiroConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.server = Fastify({ logger: true });
  }

  async start(): Promise<void> {
    await this.server.register(cors, {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    });

    // Health check
    this.server.get('/health', async () => {
      return { 
        status: 'ok', 
        version: '1.0.0',
        note: 'Piro Core ready - for AI, run: pi --mode rpc',
      };
    });

    // Chat endpoint - AI processing
    this.server.post('/api/chat', async (request) => {
      const { message } = (request.body as { message: string }) || {};
      
      if (!message) {
        return { error: 'No message provided' };
      }

      // For now, generate smart responses
      // Later this will connect to Pi
      const response = this.processMessage(message);
      
      return { 
        message: response,
        success: true,
      };
    });

    // Generate spec
    this.server.post('/api/specs/generate', async (request) => {
      const { prompt } = (request.body as { prompt: string }) || {};
      return this.generateSpec(prompt || 'New Project');
    });

    // Run agent
    this.server.post('/api/agents/run', async (request) => {
      const { role, task } = (request.body as { role: string; task: string }) || {};
      return this.runAgent(role || 'implementer', task || '');
    });

    // Run hook
    this.server.post('/api/hooks/:id/run', async (request) => {
      const { id } = request.params as { id: string };
      const hook = hooks.get(id);
      if (!hook) return { error: 'Hook not found' };
      return { output: `Running hook: ${hook.prompt}`, success: true };
    });

    // Execute power
    this.server.post('/api/powers/execute', async (request) => {
      const { powerId, params } = (request.body as { powerId: string; params: Record<string, string> }) || {};
      return { output: `Executed ${powerId} with params: ${JSON.stringify(params)}` };
    });

    // Deploy
    this.server.post('/api/deploy', async (request) => {
      const { provider, target } = (request.body as { provider: string; target: string }) || {};
      return this.deploy(provider || 'aws', target || 'ec2', {});
    });

    // Specs CRUD
    this.server.get('/api/specs', async () => Array.from(specs.values()));
    this.server.put('/api/specs/:id/status', async (request) => {
      const { id } = request.params as { id: string };
      const { status } = (request.body as { status: string }) || {};
      const spec = specs.get(id);
      if (spec) {
        spec.status = status;
        specs.set(id, spec);
      }
      return spec;
    });

    // Hooks CRUD
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

    // Powers list
    this.server.get('/api/powers', async () => this.getPowers());

    // Tasks
    this.server.post('/api/tasks/:id/execute', async () => ({ success: true }));

    const address = await this.server.listen({
      port: this.config.port,
      host: this.config.host,
    });

    console.log(`\n🚀 Piro Core started at ${address}\n`);
  }

  // Smart message processing
  private processMessage(message: string): string {
    const lower = message.toLowerCase();
    
    // Project creation
    if (lower.includes('build') || lower.includes('create') || lower.includes('make') || lower.includes('want to')) {
      const name = this.extractProjectName(message);
      return `🎉 Great! I've created a new project called **"${name}"**.

Now let's gather requirements. Tell me more about what you want to build:
- What are the main features?
- Who are the users?
- Any specific technologies?

Or I can help you write a specification automatically!`;
    }
    
    // Requirements
    if (lower.includes('feature') || lower.includes('requirement') || lower.includes('should')) {
      return `📝 I've noted your requirements!

Let me convert these into a proper specification using EARS notation:

**EARS Requirements:**
- **U** (Undefined): What the feature should do
- **S** (Scope): Boundaries and limits
- **C** (Constraints): Technical limitations
- **Q** (Quality): Performance, security standards

Want me to generate the full spec?`;
    }
    
    // Spec generation
    if (lower.includes('generat') && lower.includes('spec')) {
      return `📋 I'll generate a specification from your request!

I've identified:
- 4 requirements (U, S, C, Q)
- 5 tasks for different agents

The spec is ready. Want me to:
- ✅ Approve and move to System Design?
- 📝 Review requirements?
- 💻 Start implementing?`;
    }
    
    // Testing
    if (lower.includes('test')) {
      return `🧪 I'll help with testing!

For your project I can:
- Write unit tests
- Run test suite
- Check coverage
- Fix failing tests

Which would you like?`;
    }
    
    // Deploy
    if (lower.includes('deploy') || lower.includes('launch')) {
      const provider = lower.includes('aws') ? 'AWS' : 
                      lower.includes('gcp') || lower.includes('google') ? 'GCP' :
                      lower.includes('azure') ? 'Azure' : 'cloud';
      
      return `🚀 Deploy to ${provider}!

I can set up:
- Infrastructure
- CI/CD pipeline
- Environment config
- Health checks

Ready to deploy?`;
    }
    
    // Help
    if (lower.includes('how') || lower.includes('what can')) {
      return `🤖 Here's what I can help with:

**Building:**
• "I want to build a todo app"
• "Create an API for..."

**Working:**
• Tell me what you need in plain English
• I'll understand and take action

**Running:**
• Run tests, deploy, etc.

Just tell me what you want!`;
    }
    
    // Default
    return `I understand: "${message.slice(0, 50)}..."

I'm your AI coding assistant. Just tell me what you want to build or do, and I'll help!

Try:
• "Create a project for a todo app"
• "Add user authentication"
• "Write tests for the payment module"`;
  }

  private extractProjectName(text: string): string {
    const after = text
      .replace(/(build|create|make|want to|i want to)/gi, '')
      .replace(/(for|with|and)/gi, ',')
      .split(',')[0]
      .trim();
    
    return after.length > 3 
      ? after.charAt(0).toUpperCase() + after.slice(1)
      : 'My Project';
  }

  private generateSpec(prompt: string): unknown {
    const id = uuidv4();
    const spec = {
      id,
      title: prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''),
      description: prompt,
      requirements: [
        { type: 'U', text: `The system shall implement: ${prompt.slice(0, 100)}` },
        { type: 'S', text: 'All functionality accessible via API' },
        { type: 'C', text: 'Must follow best practices' },
        { type: 'Q', text: 'Code must be documented and testable' },
      ],
      tasks: [
        { id: 't1', title: 'Analyze requirements', role: 'architect', status: 'pending' },
        { id: 't2', title: 'Design system', role: 'architect', status: 'pending' },
        { id: 't3', title: 'Implement features', role: 'implementer', status: 'pending' },
        { id: 't4', title: 'Write tests', role: 'tester', status: 'pending' },
        { id: 't5', title: 'Create docs', role: 'docs-writer', status: 'pending' },
      ],
      status: 'draft',
      createdAt: new Date(),
    };
    specs.set(id, spec);
    return spec;
  }

  private runAgent(role: string, task: string): unknown {
    const emojis: Record<string, string> = {
      architect: '🏗️', implementer: '💻', tester: '🧪',
      'docs-writer': '📚', deployer: '🚀', reviewer: '👀',
    };
    
    return {
      output: `${emojis[role] || '🤖'} **[${role}]** executing: "${task}"

✓ Task analyzed
✓ Solution designed
✓ Implementation complete

The agent has completed the task successfully.`,
      success: true,
    };
  }

  private getPowers(): unknown[] {
    return [
      { id: 'file:read', name: 'Read File', category: 'file', description: 'Read contents of a file', enabled: true },
      { id: 'file:write', name: 'Write File', category: 'file', description: 'Write content to a file', enabled: true },
      { id: 'file:create', name: 'Create File', category: 'file', description: 'Create a new file', enabled: true },
      { id: 'git:status', name: 'Git Status', category: 'git', description: 'Show working tree status', enabled: true },
      { id: 'git:commit', name: 'Git Commit', category: 'git', description: 'Commit changes', enabled: true },
      { id: 'git:push', name: 'Git Push', category: 'git', description: 'Push to remote', enabled: true },
      { id: 'test:run', name: 'Run Tests', category: 'test', description: 'Run test suite', enabled: true },
      { id: 'test:coverage', name: 'Coverage', category: 'test', description: 'Generate coverage report', enabled: true },
      { id: 'deploy:aws', name: 'Deploy to AWS', category: 'deploy', description: 'Deploy to AWS', enabled: true },
      { id: 'deploy:gcp', name: 'Deploy to GCP', category: 'deploy', description: 'Deploy to Google Cloud', enabled: true },
      { id: 'deploy:azure', name: 'Deploy to Azure', category: 'deploy', description: 'Deploy to Azure', enabled: true },
      { id: 'search:grep', name: 'Grep', category: 'search', description: 'Search file contents', enabled: true },
      { id: 'terminal:exec', name: 'Execute', category: 'terminal', description: 'Run shell command', enabled: true },
    ];
  }

  private deploy(provider: string, target: string, _config: Record<string, string>): unknown {
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
    console.log('Piro Core stopped');
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