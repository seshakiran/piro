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
  
  async connect(): Promise<boolean> {
    return new Promise((resolve) => {
      fetch(`${this.baseUrl}/health`)
        .then(res => res.json())
        .then(data => {
          console.log('Connected to Piro Core:', data);
          resolve(true);
        })
        .catch(() => {
          console.warn('Piro Core not running - using offline mode');
          resolve(false);
        });
    });
  }
  
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  
  // Chat - sends message and gets AI response
  async sendMessage(content: string): Promise<{ message: string; spec?: Spec }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      });
      
      if (!response.ok) throw new Error('Failed to send message');
      const data = await response.json();
      return { message: data.message, spec: data.spec };
    } catch (error) {
      // Return smart mock response when offline
      return this.generateSmartResponse(content);
    }
  }
  
  // Generate intelligent responses based on context
  private generateSmartResponse(input: string): { message: string; spec?: Spec } {
    const lower = input.toLowerCase();
    let response = '';
    let spec: Spec | undefined;
    
    if (lower.includes('create project') || lower.includes('new project')) {
      const projectName = this.extractProjectName(input);
      response = `✅ **Creating Project: ${projectName}**

I've analyzed your request and here's what I'll set up:

**Project Type:** Web Application
**Stack:** TypeScript + Node.js

I'll now proceed to **Requirements Gathering** to define what this project needs.

**Next Steps:**
1. Define core features
2. Identify user stories
3. Set up acceptance criteria

Shall I proceed to Requirements stage?`;

      spec = this.generateSpecForProject(projectName, input);
    }
    else if (lower.includes('requirement') || lower.includes('feature') || lower.includes('should')) {
      response = `📝 **Requirements Analysis**

Based on your input, I've identified these key requirements:

**Functional Requirements:**
- User authentication system
- Login/logout functionality
- Password management

**Non-Functional Requirements:**
- Performance: Response time < 2s
- Security: Password hashing, JWT tokens
- Scalability: RESTful API design

I'll convert these to **EARS notation** and create task breakdown.

**EARS Requirements:**
- **U** (Undefined): The system shall authenticate users
- **S** (Scope): All protected routes require auth
- **C** (Constraint): Passwords min 8 chars with complexity
- **Q** (Quality): Auth completes in < 2 seconds`;

      spec = this.generateRequirementsSpec(input);
    }
    else if (lower.includes('auth') || lower.includes('login') || lower.includes('password')) {
      response = `# User Authentication System

**Creating specification for:**

- Email/password authentication
- JWT token-based sessions
- OAuth integration (Google, GitHub)
- Password reset functionality

I'll generate the full spec with EARS requirements and task breakdown.

**Draft Spec:**
- **Title:** User Authentication System
- **Status:** Draft

Proceed with generating full spec?`;
    }
    else {
      response = `I understand you want to work on: "${input.slice(0, 60)}..."

**What I can help with:**

1. **Start Project:** "create project [description]"
2. **Add Requirements:** "The system should have user login"
3. **Design System:** "design the architecture"
4. **Write Code:** "@implementer create user model"
5. **Run Tests:** "run tests"
6. **Deploy:** "deploy to AWS"

What would you like to do?`;
    }
    
    return { message: response, spec };
  }
  
  private extractProjectName(input: string): string {
    // Extract project name from "create project X" or "new project X"
    const match = input.replace(/create project|new project/gi, '').trim();
    return match.charAt(0).toUpperCase() + match.slice(1) || 'My Project';
  }
  
  private generateSpecForProject(name: string, description: string): Spec {
    return {
      id: Date.now().toString(),
      title: name,
      description: description,
      requirements: [
        { type: 'U', text: `The system shall provide ${name} functionality` },
        { type: 'S', text: 'All features accessible via web interface' },
        { type: 'C', text: 'Must use modern web technologies' },
        { type: 'Q', text: 'Code must be well-documented and testable' },
      ],
      tasks: [
        { id: 't1', title: 'Analyze requirements', description: 'Review and clarify project requirements', role: 'architect', status: 'pending' },
        { id: 't2', title: 'Design system architecture', description: 'Create system design and component structure', role: 'architect', status: 'pending' },
        { id: 't3', title: 'Set up project structure', description: 'Initialize project with dependencies', role: 'implementer', status: 'pending' },
        { id: 't4', title: 'Implement core features', description: 'Build main functionality', role: 'implementer', status: 'pending' },
        { id: 't5', title: 'Write unit tests', description: 'Create test coverage', role: 'tester', status: 'pending' },
      ],
      status: 'draft',
      createdAt: new Date(),
    };
  }
  
  private generateRequirementsSpec(description: string): Spec {
    return {
      id: Date.now().toString(),
      title: 'Feature Requirements',
      description: description,
      requirements: [
        { type: 'U', text: `The system shall: ${description.slice(0, 100)}` },
        { type: 'S', text: 'Scope: Web-based application' },
        { type: 'C', text: 'Constraint: Modern JavaScript/TypeScript' },
        { type: 'Q', text: 'Quality: Testable, documented, secure code' },
      ],
      tasks: [
        { id: 't1', title: 'Define user stories', description: 'Create detailed user stories', role: 'architect', status: 'pending' },
        { id: 't2', title: 'Create acceptance criteria', description: 'Define what "done" means', role: 'architect', status: 'pending' },
        { id: 't3', title: 'Break into tasks', description: 'Decompose into implementable tasks', role: 'architect', status: 'pending' },
      ],
      status: 'draft',
      createdAt: new Date(),
    };
  }
  
  // Specs API
  async getSpecs(): Promise<Spec[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/specs`);
      if (!response.ok) throw new Error('Failed to fetch specs');
      return response.json();
    } catch {
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
    } catch {
      return this.generateSpecForProject(prompt, prompt);
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
    } catch {
      throw new Error('Failed to update spec');
    }
  }
  
  // Agents API
  async runAgent(role: string, task: string): Promise<{ output: string; success: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/agents/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, task }),
      });
      if (!response.ok) throw new Error('Failed to run agent');
      return response.json();
    } catch {
      return this.simulateAgentExecution(role, task);
    }
  }
  
  private simulateAgentExecution(role: string, task: string): { output: string; success: boolean } {
    const agentEmoji: Record<string, string> = {
      architect: '🏗️',
      implementer: '💻',
      tester: '🧪',
      'docs-writer': '📚',
      deployer: '🚀',
      reviewer: '👀',
    };
    
    return {
      output: `${agentEmoji[role] || '🤖'} **${role}** executing: "${task}"

Analyzing requirements...
Designing solution...
Implementing code...

✓ Task completed successfully!

In production, this would use Pi + AI model to actually execute the task.`,
      success: true,
    };
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
  
  // Hooks API
  async getHooks(): Promise<Hook[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/hooks`);
      if (!response.ok) throw new Error('Failed to fetch hooks');
      return response.json();
    } catch {
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
    } catch {
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
    } catch {
      throw new Error('Failed to update hook');
    }
  }
  
  async deleteHook(id: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/hooks/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Failed to delete hook:', error);
    }
  }
  
  async runHook(id: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/hooks/${id}/run`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to run hook:', error);
    }
  }
  
  // Powers API
  async getPowers(): Promise<Power[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/powers`);
      if (!response.ok) throw new Error('Failed to fetch powers');
      return response.json();
    } catch {
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
    } catch {
      return {
        output: `Executed power: ${powerId}\n\nIn production, this would perform actual file/git/deploy operations.`,
      };
    }
  }
  
  // Deploy API
  async deploy(provider: string, target: string, config: Record<string, string>): Promise<Deployment> {
    try {
      const response = await fetch(`${this.baseUrl}/api/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, target, config }),
      });
      if (!response.ok) throw new Error('Failed to deploy');
      return response.json();
    } catch {
      return {
        id: Date.now().toString(),
        name: `${provider}-deployment`,
        provider,
        target,
        status: 'running',
        url: `https://${provider}-deployment.example.com`,
      };
    }
  }
  
  // Demo data
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
    ];
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
    ];
  }
}