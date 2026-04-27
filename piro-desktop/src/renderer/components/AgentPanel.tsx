/**
 * AgentPanel - Subagent management interface
 * Architect, Implementer, Tester, Docs Writer, Deployer
 */

import React, { useState } from 'react';
import { PiroAPI, Agent } from '../api/piro-client';

interface AgentPanelProps {
  api: PiroAPI | null;
}

interface TaskQueueItem {
  id: string;
  title: string;
  role: Agent['role'];
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
}

const agentRoles: Agent['role'][] = [
  'coordinator',
  'architect',
  'implementer',
  'tester',
  'docs-writer',
  'deployer',
  'reviewer',
];

const roleDescriptions: Record<Agent['role'], string> = {
  coordinator: 'Orchestrates overall workflow',
  architect: 'System design, component structure',
  implementer: 'Code implementation, refactoring',
  tester: 'Testing, verification, debugging',
  'docs-writer': 'Documentation, READMEs',
  deployer: 'Cloud deployment, configuration',
  reviewer: 'Code review, approvals',
};

export function AgentPanel({ api }: AgentPanelProps) {
  const [activeAgents, setActiveAgents] = useState<Agent[]>([]);
  const [taskQueue, setTaskQueue] = useState<TaskQueueItem[]>([]);
  const [selectedRole, setSelectedRole] = useState<Agent['role']>('implementer');
  const [taskInput, setTaskInput] = useState('');
  const [parallelMode, setParallelMode] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const startAgent = async (role: Agent['role'], task: string) => {
    if (!api || !task.trim()) return;
    
    const taskItem: TaskQueueItem = {
      id: Date.now().toString(),
      title: task,
      role,
      status: 'pending',
    };
    
    setTaskQueue(t => [...t, taskItem]);
    setLoading(true);
    
    try {
      // Mark as running
      setTaskQueue(t => t.map(item => 
        item.id === taskItem.id ? { ...item, status: 'running' } : item
      ));
      
      const result = await api.runAgent(role, task);
      
      setTaskQueue(t => t.map(item => 
        item.id === taskItem.id ? { 
          ...item, 
          status: 'completed' as const,
          output: result.output || 'Task completed successfully',
        } : item
      ));
    } catch (error) {
      console.error('Agent failed:', error);
      setTaskQueue(t => t.map(item => 
        item.id === taskItem.id ? { 
          ...item, 
          status: 'failed' as const,
          output: String(error),
        } : item
      ));
    }
    
    setLoading(false);
  };
  
  const runSelectedAgent = () => {
    startAgent(selectedRole, taskInput);
    setTaskInput('');
  };
  
  const clearTask = (id: string) => {
    setTaskQueue(t => t.filter(item => item.id !== id));
  };
  
  const statusColors = {
    pending: '#6b697a',
    running: '#7c5cff',
    completed: '#5cff8f',
    failed: '#ff5c5c',
  };
  
  return (
    <div className="agent-panel">
      <div className="agent-sidebar">
        <div className="agent-sidebar-header">
          <h3>Agents</h3>
        </div>
        
        <div className="agent-list">
          {agentRoles.map(role => (
            <div
              key={role}
              className={`agent-item ${selectedRole === role ? 'active' : ''}`}
              onClick={() => setSelectedRole(role)}
            >
              <div className="agent-icon">{getAgentIcon(role)}</div>
              <div className="agent-info">
                <span className="agent-name">{formatRole(role)}</span>
                <span className="agent-desc">{roleDescriptions[role]}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="agent-stats">
          <h4>Active Agents</h4>
          <div className="stat">
            <span className="stat-value">{activeAgents.length}</span>
            <span className="stat-label">Running</span>
          </div>
          <div className="stat">
            <span className="stat-value">{taskQueue.filter(t => t.status === 'completed').length}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
      </div>
      
      <div className="agent-content">
        <div className="agent-header">
          <div className="selected-agent">
            <span className="agent-emoji">{getAgentIcon(selectedRole)}</span>
            <div>
              <h2>{formatRole(selectedRole)}</h2>
              <p>{roleDescriptions[selectedRole]}</p>
            </div>
          </div>
          
          <div className="mode-toggle">
            <label>
              <input 
                type="checkbox" 
                checked={parallelMode}
                onChange={e => setParallelMode(e.target.checked)}
              />
              Parallel Execution
            </label>
          </div>
        </div>
        
        <div className="task-input-section">
          <h3>Run Task</h3>
          <div className="task-input-row">
            <textarea
              value={taskInput}
              onChange={e => setTaskInput(e.target.value)}
              placeholder={`Describe the task for ${formatRole(selectedRole)}...`}
              rows={3}
            />
            <button 
              onClick={runSelectedAgent}
              disabled={loading || !taskInput.trim()}
              className="run-btn"
            >
              {loading ? 'Running...' : `Run ${formatRole(selectedRole)}`}
            </button>
          </div>
        </div>
        
        <div className="task-queue-section">
          <div className="queue-header">
            <h3>Task Queue</h3>
            <button 
              onClick={() => setTaskQueue([])}
              className="clear-btn"
              disabled={taskQueue.length === 0}
            >
              Clear All
            </button>
          </div>
          
          <div className="task-queue">
            {taskQueue.map(task => (
              <div key={task.id} className={`queue-item ${task.status}`}>
                <div className="queue-item-status" style={{ background: statusColors[task.status] }}>
                  {task.status === 'running' && <span className="spinner"></span>}
                </div>
                <div className="queue-item-content">
                  <div className="queue-item-header">
                    <span className="queue-item-title">{task.title}</span>
                    <span className="queue-item-role">{formatRole(task.role)}</span>
                  </div>
                  {task.output && (
                    <div className="queue-item-output">{task.output}</div>
                  )}
                </div>
                <button 
                  className="queue-item-remove"
                  onClick={() => clearTask(task.id)}
                >
                  ×
                </button>
              </div>
            ))}
            
            {taskQueue.length === 0 && (
              <div className="queue-empty">
                No tasks in queue. Enter a task above to get started.
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        .agent-panel {
          display: flex;
          height: 100%;
          background: var(--color-bg-primary);
        }
        
        .agent-sidebar {
          width: 240px;
          border-right: 1px solid var(--color-border);
          background: var(--color-bg-secondary);
          display: flex;
          flex-direction: column;
        }
        
        .agent-sidebar-header {
          padding: 12px 16px;
          border-bottom: 1px solid var(--color-border);
        }
        
        .agent-sidebar-header h3 {
          font-size: 14px;
          font-weight: 600;
        }
        
        .agent-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }
        
        .agent-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          cursor: pointer;
          margin-bottom: 4px;
        }
        
        .agent-item:hover {
          background: var(--color-bg-tertiary);
        }
        
        .agent-item.active {
          background: var(--color-accent);
        }
        
        .agent-icon {
          font-size: 20px;
        }
        
        .agent-info {
          display: flex;
          flex-direction: column;
        }
        
        .agent-name {
          font-size: 13px;
          font-weight: 500;
        }
        
        .agent-desc {
          font-size: 10px;
          color: var(--color-text-muted);
        }
        
        .agent-item.active .agent-desc {
          color: rgba(255, 255, 255, 0.7);
        }
        
        .agent-stats {
          padding: 12px;
          border-top: 1px solid var(--color-border);
        }
        
        .agent-stats h4 {
          font-size: 11px;
          color: var(--color-text-muted);
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        
        .agent-stats .stat {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          padding: 4px 0;
        }
        
        .stat-value {
          font-weight: 600;
          color: var(--color-accent);
        }
        
        .agent-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }
        
        .agent-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        
        .selected-agent {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .agent-emoji {
          font-size: 40px;
        }
        
        .selected-agent h2 {
          font-size: 20px;
          margin-bottom: 4px;
        }
        
        .selected-agent p {
          font-size: 12px;
          color: var(--color-text-secondary);
        }
        
        .mode-toggle label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          cursor: pointer;
        }
        
        .mode-toggle input {
          width: 16px;
          height: 16px;
        }
        
        .task-input-section {
          margin-bottom: 24px;
        }
        
        .task-input-section h3 {
          font-size: 14px;
          margin-bottom: 12px;
          color: var(--color-text-secondary);
        }
        
        .task-input-row {
          display: flex;
          gap: 12px;
        }
        
        .task-input-row textarea {
          flex: 1;
        }
        
        .run-btn {
          padding: 12px 24px;
          background: var(--color-accent);
          color: white;
          border-radius: var(--radius-md);
          font-weight: 500;
          white-space: nowrap;
        }
        
        .run-btn:hover:not(:disabled) {
          background: var(--color-accent-hover);
        }
        
        .run-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .task-queue-section {
          flex: 1;
        }
        
        .queue-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        
        .queue-header h3 {
          font-size: 14px;
          color: var(--color-text-secondary);
        }
        
        .clear-btn {
          font-size: 12px;
          color: var(--color-text-muted);
          padding: 4px 8px;
          border-radius: var(--radius-sm);
        }
        
        .clear-btn:hover:not(:disabled) {
          background: var(--color-bg-tertiary);
          color: var(--color-text-primary);
        }
        
        .clear-btn:disabled {
          opacity: 0.5;
        }
        
        .task-queue {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .queue-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
        }
        
        .queue-item.completed {
          border-color: var(--color-success);
        }
        
        .queue-item.failed {
          border-color: var(--color-error);
        }
        
        .queue-item-status {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-top: 4px;
          flex-shrink: 0;
        }
        
        .spinner {
          display: block;
          width: 12px;
          height: 12px;
          border: 2px solid transparent;
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .queue-item-content {
          flex: 1;
        }
        
        .queue-item-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }
        
        .queue-item-title {
          font-weight: 500;
        }
        
        .queue-item-role {
          font-size: 10px;
          padding: 2px 6px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-sm);
          text-transform: uppercase;
        }
        
        .queue-item-output {
          font-size: 12px;
          color: var(--color-text-secondary);
          font-family: var(--font-mono);
          background: var(--color-bg-tertiary);
          padding: 8px;
          border-radius: var(--radius-sm);
          margin-top: 8px;
          white-space: pre-wrap;
        }
        
        .queue-item-remove {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          font-size: 16px;
          color: var(--color-text-muted);
        }
        
        .queue-item-remove:hover {
          background: var(--color-bg-tertiary);
          color: var(--color-error);
        }
        
        .queue-empty {
          padding: 40px;
          text-align: center;
          color: var(--color-text-muted);
          background: var(--color-bg-secondary);
          border-radius: var(--radius-md);
        }
      `}</style>
    </div>
  );
}

function getAgentIcon(role: Agent['role']): string {
  const icons: Record<Agent['role'], string> = {
    coordinator: '🎯',
    architect: '🏗️',
    implementer: '💻',
    tester: '🧪',
    'docs-writer': '📚',
    deployer: '🚀',
    reviewer: '👀',
  };
  return icons[role] || '🤖';
}

function formatRole(role: Agent['role']): string {
  return role.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}