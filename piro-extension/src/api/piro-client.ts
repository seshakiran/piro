/**
 * Piro API Client
 * 
 * Connects to Piro Core server via REST and WebSocket
 */

import * as vscode from 'vscode';

export interface PiroConfig {
  coreUrl: string;
  wsUrl?: string;
}

export interface Spec {
  id: string;
  name: string;
  description: string;
  status: string;
}

export interface Subagent {
  id: string;
  role: string;
  status: string;
}

export interface Hook {
  id: string;
  name: string;
  trigger: string;
  enabled: boolean;
}

/**
 * Piro REST Client
 */
export class PiroClient {
  private coreUrl: string;
  private wsUrl: string | null = null;
  private ws: WebSocket | null = null;
  private connected: boolean = false;

  constructor(coreUrl: string) {
    this.coreUrl = coreUrl.replace(/\/$/, '');
    this.wsUrl = this.coreUrl.replace('http', 'ws') + '/ws';
  }

  /**
   * Connect to Piro Core
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl!);

      this.ws.onopen = () => {
        this.connected = true;
        resolve();
      };

      this.ws.onerror = (error) => {
        reject(error);
      };

      this.ws.onclose = () => {
        this.connected = false;
      };
    });
  }

  /**
   * Disconnect from Piro Core
   */
  disconnect(): void {
    this.ws?.close();
    this.connected = false;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  // ==================== REST API ====================

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.coreUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Specs
  async listSpecs(): Promise<Spec[]> {
    return this.request('/api/specs');
  }

  async getSpec(id: string): Promise<Spec> {
    return this.request(`/api/specs/${id}`);
  }

  async generateSpec(description: string): Promise<Spec> {
    return this.request('/api/specs', {
      method: 'POST',
      body: JSON.stringify({ description }),
    });
  }

  async approveSpec(id: string): Promise<Spec> {
    return this.request(`/api/specs/${id}/approve`, { method: 'PUT' });
  }

  // Agents
  async listAgents(): Promise<Subagent[]> {
    return this.request('/api/agents');
  }

  async createAgent(role: string): Promise<Subagent> {
    return this.request(`/api/agents/${role}`, { method: 'POST' });
  }

  async executeTask(task: string, role: string): Promise<unknown> {
    return this.request('/api/agents/execute', {
      method: 'POST',
      body: JSON.stringify({ task, role }),
    });
  }

  // Powers
  async listPowers(): Promise<unknown[]> {
    return this.request('/api/powers');
  }

  async enablePower(name: string): Promise<void> {
    await this.request(`/api/powers/${name}/enable`, { method: 'POST' });
  }

  // Hooks
  async listHooks(): Promise<Hook[]> {
    return this.request('/api/hooks');
  }

  async registerHook(hook: Partial<Hook>): Promise<Hook> {
    return this.request('/api/hooks', {
      method: 'POST',
      body: JSON.stringify(hook),
    });
  }

  // Cloud Deploy
  async deployLambda(config: unknown): Promise<string> {
    return this.request('/api/cloud/aws/lambda', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async deployEcs(config: unknown): Promise<string> {
    return this.request('/api/cloud/aws/ecs', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async deployToGcp(config: unknown): Promise<string> {
    return this.request('/api/cloud/gcp/function', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async deployToAzure(config: unknown): Promise<string> {
    return this.request('/api/cloud/azure/function', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  // ==================== WebSocket ====================

  /**
   * Send WebSocket message and wait for response
   */
  async sendWS<T>(type: string, payload: unknown): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.ws || !this.connected) {
        reject(new Error('Not connected to Piro Core'));
        return;
      }

      const requestId = `req-${Date.now()}`;
      const message = JSON.stringify({ type, payload, requestId });

      const handler = (data: MessageEvent) => {
        const response = JSON.parse(data.toString());
        if (response.requestId === requestId) {
          this.ws?.removeListener('message', handler);
          if (response.type.includes('error')) {
            reject(new Error(response.payload?.error));
          } else {
            resolve(response.payload as T);
          }
        }
      };

      this.ws.on('message', handler);
      this.ws.send(message);
    });
  }

  /**
   * Stream task execution
   */
  async *streamTask(task: string, role: string): AsyncGenerator<string> {
    if (!this.ws || !this.connected) {
      throw new Error('Not connected to Piro Core');
    }

    // This would implement streaming updates
    yield 'Starting task...';
    yield 'Processing...';
    yield 'Completed!';
  }
}