/**
 * Piro Core Server
 * Spec-driven AI coding agent backend - Lightweight version
 */

import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { v4 as uuidv4 } from 'uuid';

export interface PiroConfig {
  port: number;
  host: string;
  model: {
    provider: 'minimax' | 'anthropic' | 'openai' | 'google';
    model: string;
    apiKey?: string;
  };
}

const DEFAULT_CONFIG: Partial<PiroConfig> = {
  port: 3847,
  host: '0.0.0.0',
  model: {
    provider: 'minimax',
    model: 'MiniMax-M2.7',
  },
};

// In-memory storage
const specs = new Map();
const hooks = new Map();
const deployments = new Map();

export class PiroCore {
  private server: FastifyInstance;
  private config: PiroConfig;

  constructor(config: Partial<PiroConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config } as PiroConfig;
    this.server = Fastify({ logger: true });
  }

  async start(): Promise<void> {
    // Register plugins
    await this.server.register(cors, {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    });

    await this.server.register(websocket);

    // Health check
    this.server.get('/health', async () => {
      return { status: 'ok', version: '1.0.0', model: this.config.model };
    });

    // Chat endpoint
    this.server.post('/api/chat', async (request) => {
      const { message } = (request.body as { message: string }) || {};
      return this.handleChat(message || '');
    });

    // Specs endpoints
    this.server.get('/api/specs', async () => {
      return Array.from(specs.values());
    });

    this.server.post('/api/specs/generate', async (request) => {
      const { prompt } = (request.body as { prompt: string }) || {};
      return this.generateSpec(prompt || '');
    });

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

    // Hooks endpoints
    this.server.get('/api/hooks', async () => {
      return Array.from(hooks.values());
    });

    this.server.post('/api/hooks', async (request) => {
      const hook = request.body as Record<string, unknown>;
      const id = uuidv4();
      const newHook = { ...hook, id };
      hooks.set(id, newHook);
      return newHook;
    });

    this.server.put('/api/hooks/:id', async (request) => {
      const { id } = request.params as { id: string };
      const updates = request.body as Record<string, unknown>;
      const hook = hooks.get(id);
      if (hook) {
        const updated = { ...hook, ...updates };
        hooks.set(id, updated);
        return updated;
      }
      return { error: 'Hook not found' };
    });

    this.server.delete('/api/hooks/:id', async (request) => {
      const { id } = request.params as { id: string };
      hooks.delete(id);
      return { success: true };
    });

    this.server.post('/api/hooks/:id/run', async (request) => {
      const { id } = request.params as { id: string };
      return { output: `Hook ${id} executed`, success: true };
    });

    // Powers endpoint
    this.server.get('/api/powers', async () => {
      return this.getPowers();
    });

    this.server.post('/api/powers/execute', async (request) => {
      const { powerId, params } = (request.body as { powerId: string; params: Record<string, string> }) || {};
      return { output: `Power ${powerId} executed with params: ${JSON.stringify(params)}` };
    });

    // Deploy endpoint
    this.server.post('/api/deploy', async (request) => {
      const { provider, target, config: deployConfig } = (request.body as { provider: string; target: string; config: Record<string, string> }) || {};
      return this.deploy(provider || 'aws', target || 'ec2', deployConfig || {});
    });

    // Agents endpoint
    this.server.post('/api/agents/run', async (request) => {
      const { role, task } = (request.body as { role: string; task: string }) || {};
      return this.runAgent(role || 'implementer', task || '');
    });

    this.server.post('/api/tasks/:id/execute', async (request) => {
      const { id } = request.params as { id: string };
      return { taskId: id, output: 'Task executed' };
    });

    // WebSocket endpoint
    this.server.get('/ws', { websocket: true }, (connection) => {
      connection.socket.on('message', (message: Buffer) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleWebSocket(connection, data);
        } catch (e) {
          console.error('WebSocket message parse error');
        }
      });
    });

    // Start server
    const address = await this.server.listen({
      port: this.config.port,
      host: this.config.host,
    });

    console.log(`\n🚀 Piro Core started at ${address}`);
    console.log(`🤖 Model: ${this.config.model.provider}/${this.config.model.model}\n`);
  }

  private handleChat(message: string): { message: string; spec?: unknown } {
    const lower = message.toLowerCase();
    let response = '';
    let spec: unknown = null;

    if (lower.includes('auth') || lower.includes('login') || lower.includes('password')) {
      response = `# User Authentication System

I've created a specification for a user authentication system:

## Features
- Email/password authentication
- JWT token-based sessions
- OAuth integration (Google, GitHub)
- Password reset functionality

## Next Steps
1. Review requirements in Spec panel
2. Run @implementer to create User model
3. Run @tester to create tests`;

      spec = this.generateSpec('User authentication system with login, JWT, OAuth');
    } else if (lower.includes('api') || lower.includes('rest') || lower.includes('crud')) {
      response = `# REST API Specification

Building a REST API with endpoints:

- GET /resources - List all
- POST /resources - Create new  
- GET /resources/:id - Get one
- PUT /resources/:id - Update
- DELETE /resources/:id - Delete

## Tech Stack
- Node.js + Express/Fastify
- TypeScript for type safety
- PostgreSQL for data

Shall I generate the full spec?`;
    } else if (lower.includes('test')) {
      response = `# Testing Plan

I'll help you add unit tests:

## Coverage Goals
- Core business logic: 80%+
- Edge cases and error handling
- Integration tests for API

## Tools
- Jest/Vitest for unit tests
- Supertest for API tests

Want me to generate test tasks?`;
    } else if (lower.includes('deploy')) {
      response = `# Deployment

I'll deploy your project to the cloud.

Which provider?
- AWS (EC2, Lambda, ECS, S3)
- Google Cloud (Cloud Run, GKE)
- Azure (Container Instances, AKS)
- Vercel, Netlify

Just say "deploy to [provider]" and I'll set it up!`;
    } else {
      response = `I understand: "${message.slice(0, 50)}..."

Here's what I can do:

**Commands:**
- "create project [idea]" - Start new project
- "generate spec [idea]" - Create specification  
- "deploy to aws/gcp/azure" - Deploy to cloud

**Agent Mentions:**
- @implementer - Write code
- @architect - Design system
- @tester - Write tests
- @docs-writer - Create docs
- @deployer - Deploy

Just tell me what you need!`;
    }

    return { message: response, spec };
  }

  private generateSpec(prompt: string): unknown {
    const id = uuidv4();
    const spec = {
      id,
      title: prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''),
      description: prompt,
      requirements: [
        { type: 'U', text: `The system shall implement: ${prompt.slice(0, 100)}` },
        { type: 'S', text: 'All functionality must be accessible via API' },
        { type: 'C', text: 'Must follow best practices and coding standards' },
        { type: 'Q', text: 'Code must be well-documented and testable' },
      ],
      tasks: [
        { id: 't1', title: 'Analyze requirements', description: 'Review and clarify requirements', role: 'architect', status: 'pending' },
        { id: 't2', title: 'Design system', description: 'Create architecture and component design', role: 'architect', status: 'pending' },
        { id: 't3', title: 'Implement core features', description: 'Write the main implementation', role: 'implementer', status: 'pending' },
        { id: 't4', title: 'Write tests', description: 'Create unit and integration tests', role: 'tester', status: 'pending' },
        { id: 't5', title: 'Create documentation', description: 'Document API and usage', role: 'docs-writer', status: 'pending' },
      ],
      status: 'draft',
      createdAt: new Date(),
    };
    specs.set(id, spec);
    return spec;
  }

  private getPowers(): unknown[] {
    return [
      { id: 'file:read', name: 'Read File', category: 'file', description: 'Read contents of a file', enabled: true },
      { id: 'file:write', name: 'Write File', category: 'file', description: 'Write content to a file', enabled: true },
      { id: 'file:create', name: 'Create File', category: 'file', description: 'Create a new file', enabled: true },
      { id: 'file:delete', name: 'Delete File', category: 'file', description: 'Delete a file', enabled: true },
      { id: 'file:list', name: 'List Directory', category: 'file', description: 'List files in a directory', enabled: true },
      { id: 'git:status', name: 'Git Status', category: 'git', description: 'Show working tree status', enabled: true },
      { id: 'git:commit', name: 'Git Commit', category: 'git', description: 'Commit changes', enabled: true },
      { id: 'git:push', name: 'Git Push', category: 'git', description: 'Push to remote', enabled: true },
      { id: 'git:pull', name: 'Git Pull', category: 'git', description: 'Pull from remote', enabled: true },
      { id: 'test:run', name: 'Run Tests', category: 'test', description: 'Run test suite', enabled: true },
      { id: 'test:coverage', name: 'Test Coverage', category: 'test', description: 'Generate coverage report', enabled: true },
      { id: 'deploy:aws', name: 'Deploy to AWS', category: 'deploy', description: 'Deploy to AWS', enabled: true },
      { id: 'deploy:gcp', name: 'Deploy to GCP', category: 'deploy', description: 'Deploy to Google Cloud', enabled: true },
      { id: 'deploy:azure', name: 'Deploy to Azure', category: 'deploy', description: 'Deploy to Azure', enabled: true },
      { id: 'search:grep', name: 'Grep', category: 'search', description: 'Search file contents', enabled: true },
      { id: 'search:find', name: 'Find Files', category: 'search', description: 'Find files by name', enabled: true },
      { id: 'terminal:exec', name: 'Execute Command', category: 'terminal', description: 'Run a shell command', enabled: true },
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

  private runAgent(role: string, task: string): unknown {
    return {
      output: `[${role.toUpperCase()}] Executing: ${task}\n\n✓ Task completed successfully.\n\nIn production, this would use Pi + AI model to execute the task.`,
      success: true,
    };
  }

  private handleWebSocket(connection: { socket: { send: (msg: string) => void } }, data: Record<string, unknown>): void {
    if (data.type === 'subscribe') {
      connection.socket.send(JSON.stringify({
        type: 'subscribed',
        channel: data.channel,
      }));
    } else if (data.type === 'chat') {
      const response = this.handleChat(data.message as string);
      connection.socket.send(JSON.stringify({ type: 'chat', ...response }));
    }
  }

  async stop(): Promise<void> {
    await this.server.close();
    console.log('Piro Core stopped');
  }
}

// CLI entry point
async function main() {
  const piro = new PiroCore();
  await piro.start();

  process.on('SIGINT', async () => {
    await piro.stop();
    process.exit(0);
  });
}

main();