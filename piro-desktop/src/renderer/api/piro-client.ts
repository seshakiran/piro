/**
 * Piro Desktop API Client
 * Communicates with Piro Core server
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface Requirement {
  type: 'U' | 'S' | 'C' | 'Q';
  text: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  role: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface Spec {
  id: string;
  title: string;
  description?: string;
  requirements?: Requirement[];
  tasks?: Task[];
  status: 'draft' | 'review' | 'approved' | 'in_progress' | 'completed';
  createdAt: Date;
}

export interface Agent {
  id: string;
  role: 'coordinator' | 'architect' | 'implementer' | 'tester' | 'docs-writer' | 'deployer' | 'reviewer';
  status: 'idle' | 'running' | 'completed' | 'failed';
  name: string;
}

export interface Hook {
  id: string;
  name: string;
  trigger: string;
  prompt: string;
  enabled: boolean;
}

export interface Power {
  id: string;
  name: string;
  category: string;
  description: string;
  enabled: boolean;
}

export interface Deployment {
  id: string;
  name: string;
  provider: string;
  target: string;
  status: 'pending' | 'running' | 'stopped' | 'failed';
  url?: string;
}

export class PiroAPI {
  private baseUrl: string;
  private ws: WebSocket | null = null;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Try to connect to REST API first
      fetch(`${this.baseUrl}/health`)
        .then(() => {
          console.log('Connected to Piro Core');
          resolve();
        })
        .catch(() => {
          console.warn('Piro Core not running, using offline mode');
          resolve(); // Don't reject, just work in offline mode
        });
    });
  }
  
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  
  // Chat
  async sendMessage(content: string): Promise<{ message: string; spec?: Spec }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      });
      
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    } catch (error) {
      // Return mock response in offline mode
      return {
        message: this.generateMockResponse(content),
      };
    }
  }
  
  private generateMockResponse(input: string): string {
    const lower = input.toLowerCase();
    
    if (lower.includes('auth') || lower.includes('login') || lower.includes('password')) {
      return `# User Authentication System

I've created a specification for a user authentication system with the following components:

## Features
- Email/password authentication
- JWT token-based sessions  
- OAuth integration (Google, GitHub)
- Password reset functionality

## Next Steps
1. Generate the spec (click "Generate Spec" above)
2. Review and approve the requirements
3. Run agents to implement each task

Would you like me to proceed with generating the full specification?`;
    }
    
    if (lower.includes('api') || lower.includes('rest') || lower.includes('crud')) {
      return `# REST API Specification

I'll help you build a REST API. Here's what I understand:

## Endpoints
- \`GET /resources\` - List all
- \`POST /resources\` - Create new
- \`GET /resources/:id\` - Get one
- \`PUT /resources/:id\` - Update
- \`DELETE /resources/:id\` - Delete

## Tech Stack Recommendations
- Node.js + Express or Fastify
- TypeScript for type safety
- PostgreSQL or MongoDB for data

Shall I generate the full specification with tasks?`;
    }
    
    if (lower.includes('test') || lower.includes('unit')) {
      return `# Testing Plan

I'll help you add unit tests. Here's my approach:

## Test Coverage Goals
- Core business logic: 80%+
- Edge cases and error handling
- Integration tests for API endpoints

## Tools
- Jest or Vitest for unit tests
- Supertest for API tests
- Coverage reports with Istanbul

Would you like me to generate the test tasks?`;
    }
    
    return `# I understand you want to: "${input.slice(0, 50)}..."

I'm ready to help you build this. Here's what I can do:

1. **Generate a Spec** - Turn your idea into detailed requirements
2. **Run Agents** - Have AI agents implement each task
3. **Manage Hooks** - Automate tasks on file save, commit, etc.
4. **Deploy** - Push your code to AWS, GCP, or Azure

What would you like me to do next?`;
  }
  
  // Specs
  async getSpecs(): Promise<Spec[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/specs`);
      if (!response.ok) throw new Error('Failed to fetch specs');
      return response.json();
    } catch (error) {
      // Return demo specs in offline mode
      return this.getDemoSpecs();
    }
  }
  
  async generateSpec(prompt: string): Promise<Spec> {
    try {
      const response = await fetch(`${this.baseUrl}/api/specs/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      if (!response.ok) throw new Error('Failed to generate spec');
      return response.json();
    } catch (error) {
      // Return demo spec in offline mode
      return this.createDemoSpec(prompt);
    }
  }
  
  async updateSpecStatus(specId: string, status: string): Promise<Spec> {
    try {
      const response = await fetch(`${this.baseUrl}/api/specs/${specId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) throw new Error('Failed to update spec');
      return response.json();
    } catch (error) {
      throw error;
    }
  }
  
  // Agents
  async runAgent(role: string, task: string): Promise<{ output: string; success: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/agents/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, task }),
      });
      
      if (!response.ok) throw new Error('Failed to run agent');
      return response.json();
    } catch (error) {
      return {
        output: `[Demo Mode] Agent "${role}" would execute: ${task}\n\nThis is a demo response. Connect to Piro Core to enable real agent execution.`,
        success: true,
      };
    }
  }
  
  async executeTask(taskId: string, role: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/tasks/${taskId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
    } catch (error) {
      console.error('Failed to execute task:', error);
    }
  }
  
  // Hooks
  async getHooks(): Promise<Hook[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/hooks`);
      if (!response.ok) throw new Error('Failed to fetch hooks');
      return response.json();
    } catch (error) {
      return this.getDemoHooks();
    }
  }
  
  async createHook(hook: Partial<Hook>): Promise<Hook> {
    try {
      const response = await fetch(`${this.baseUrl}/api/hooks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hook),
      });
      
      if (!response.ok) throw new Error('Failed to create hook');
      return response.json();
    } catch (error) {
      // Return mock hook in offline mode
      return {
        id: Date.now().toString(),
        name: hook.name || 'New Hook',
        trigger: hook.trigger || 'on_save',
        prompt: hook.prompt || '',
        enabled: hook.enabled ?? true,
      };
    }
  }
  
  async updateHook(id: string, updates: Partial<Hook>): Promise<Hook> {
    try {
      const response = await fetch(`${this.baseUrl}/api/hooks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) throw new Error('Failed to update hook');
      return response.json();
    } catch (error) {
      throw error;
    }
  }
  
  async deleteHook(id: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/hooks/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete hook:', error);
    }
  }
  
  async runHook(id: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/hooks/${id}/run`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to run hook:', error);
    }
  }
  
  // Powers
  async getPowers(): Promise<Power[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/powers`);
      if (!response.ok) throw new Error('Failed to fetch powers');
      return response.json();
    } catch (error) {
      return [];
    }
  }
  
  async executePower(powerId: string, params: Record<string, string>): Promise<{ output: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/powers/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ powerId, params }),
      });
      
      if (!response.ok) throw new Error('Failed to execute power');
      return response.json();
    } catch (error) {
      return {
        output: `[Demo Mode] Power "${powerId}" executed with params: ${JSON.stringify(params)}\n\nConnect to Piro Core to enable real power execution.`,
      };
    }
  }
  
  // Deploy
  async deploy(provider: string, target: string, config: Record<string, string>): Promise<Deployment> {
    try {
      const response = await fetch(`${this.baseUrl}/api/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, target, config }),
      });
      
      if (!response.ok) throw new Error('Failed to deploy');
      return response.json();
    } catch (error) {
      // Return mock deployment in offline mode
      return {
        id: Date.now().toString(),
        name: `deployment-${Date.now()}`,
        provider,
        target,
        status: 'running',
        url: `https://${provider}-deployment.example.com`,
      };
    }
  }
  
  // Demo data helpers
  private getDemoSpecs(): Spec[] {
    return [
      {
        id: '1',
        title: 'User Authentication System',
        description: 'Complete authentication with JWT and OAuth',
        requirements: [
          { type: 'U', text: 'The system shall authenticate users using email and password' },
          { type: 'S', text: 'Authentication must be required for all protected resources' },
          { type: 'C', text: 'Passwords must be at least 8 characters with complexity requirements' },
          { type: 'Q', text: 'Authentication must complete in under 2 seconds' },
        ],
        tasks: [
          { id: 't1', title: 'Create User model', description: 'Define User schema with email, password hash', role: 'implementer', status: 'completed' },
          { id: 't2', title: 'Implement login endpoint', description: 'POST /auth/login with JWT generation', role: 'implementer', status: 'completed' },
          { id: 't3', title: 'Write unit tests', description: 'Test authentication flow', role: 'tester', status: 'in_progress' },
          { id: 't4', title: 'Add OAuth providers', description: 'Google and GitHub OAuth', role: 'implementer', status: 'pending' },
        ],
        status: 'in_progress',
        createdAt: new Date(),
      },
      {
        id: '2',
        title: 'REST API for Todo List',
        description: 'Full CRUD API with database',
        requirements: [
          { type: 'U', text: 'The system shall provide CRUD operations for todos' },
          { type: 'S', text: 'Each user can only see their own todos' },
        ],
        tasks: [
          { id: 't5', title: 'Design database schema', description: 'Users and Todos tables', role: 'architect', status: 'completed' },
          { id: 't6', title: 'Implement API routes', description: 'Express routes for CRUD', role: 'implementer', status: 'pending' },
        ],
        status: 'approved',
        createdAt: new Date(Date.now() - 86400000),
      },
    ];
  }
  
  private createDemoSpec(prompt: string): Spec {
    const title = prompt.length > 50 ? prompt.slice(0, 50) + '...' : prompt;
    
    return {
      id: Date.now().toString(),
      title: title.charAt(0).toUpperCase() + title.slice(1),
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
  }
  
  private getDemoHooks(): Hook[] {
    return [
      {
        id: '1',
        name: 'Auto-generate tests on save',
        trigger: 'on_save',
        prompt: 'Analyze the saved file and generate unit tests if it is a source file',
        enabled: true,
      },
      {
        id: '2',
        name: 'Format code on commit',
        trigger: 'on_commit',
        prompt: 'Run prettier and eslint to format code before commit',
        enabled: true,
      },
      {
        id: '3',
        name: 'Generate docs on build',
        trigger: 'on_build',
        prompt: 'Generate API documentation from source files',
        enabled: false,
      },
    ];
  }
}