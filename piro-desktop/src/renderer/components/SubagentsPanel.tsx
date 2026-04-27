/**
 * SubagentsPanel - AI Subagents Management (spawn anytime)
 */

import React, { useState } from 'react';
import { PiroAPI } from '../api/piro-client';

interface SubagentsPanelProps {
  api: PiroAPI | null;
}

const agentTypes = [
  { id: 'coordinator', name: 'Coordinator', icon: '🎯', desc: 'Orchestrates workflow' },
  { id: 'architect', name: 'Architect', icon: '🏗️', desc: 'System design' },
  { id: 'implementer', name: 'Implementer', icon: '💻', desc: 'Code implementation' },
  { id: 'tester', name: 'Tester', icon: '🧪', desc: 'Testing & QA' },
  { id: 'docs-writer', name: 'Docs Writer', icon: '📚', desc: 'Documentation' },
  { id: 'deployer', name: 'Deployer', icon: '🚀', desc: 'Deployment' },
  { id: 'reviewer', name: 'Reviewer', icon: '👀', desc: 'Code review' },
];

export function SubagentsPanel({ }: SubagentsPanelProps) {
  const [activeAgents, setActiveAgents] = useState<{ id: string; type: string; status: string }[]>([]);
  const [newAgentType, setNewAgentType] = useState('implementer');
  const [agentTask, setAgentTask] = useState('');
  
  const spawnAgent = () => {
    if (!agentTask.trim()) return;
    setActiveAgents([...activeAgents, {
      id: Date.now().toString(),
      type: newAgentType,
      status: 'running',
    }]);
    setAgentTask('');
  };
  
  return (
    <div className="subagents-panel">
      <div className="panel-header">
        <h2>AI Subagents</h2>
        <p className="subtitle">Spawn agents anytime during development</p>
      </div>
      
      <div className="main-content">
        <div className="spawn-section">
          <h3>Spawn New Agent</h3>
          <div className="agent-selector">
            {agentTypes.map(agent => (
              <div key={agent.id} className={`agent-option ${newAgentType === agent.id ? 'selected' : ''}`} onClick={() => setNewAgentType(agent.id)}>
                <span className="agent-icon">{agent.icon}</span>
                <div className="agent-info">
                  <span className="agent-name">{agent.name}</span>
                  <span className="agent-desc">{agent.desc}</span>
                </div>
              </div>
            ))}
          </div>
          <textarea value={agentTask} onChange={e => setAgentTask(e.target.value)} placeholder="Describe the task for the agent..." rows={4} />
          <button className="spawn-btn" onClick={spawnAgent}>🤖 Spawn Agent</button>
        </div>
        
        <div className="active-section">
          <h3>Active Agents</h3>
          <div className="active-list">
            {activeAgents.length === 0 ? (
              <p className="empty-text">No active agents. Spawn one from above.</p>
            ) : (
              activeAgents.map(agent => {
                const info = agentTypes.find(t => t.id === agent.type);
                return (
                  <div key={agent.id} className="agent-card">
                    <span className="agent-icon">{info?.icon}</span>
                    <div className="agent-details">
                      <span className="agent-type">{info?.name}</span>
                      <span className={`agent-status ${agent.status}`}>{agent.status}</span>
                    </div>
                    <div className="agent-actions">
                      <button>▶</button>
                      <button>⏹</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        <div className="chat-mention">
          <h3>Quick Access</h3>
          <p>Use <code>@agent</code> in chat to spawn agents instantly</p>
          <div className="mention-examples">
            <code>@implementer Create a login form</code>
            <code>@tester Add unit tests for auth</code>
            <code>@docs-writer Create API docs</code>
          </div>
        </div>
      </div>
      
      <style>{`
        .subagents-panel { display: flex; flex-direction: column; height: 100%; padding: 24px; overflow-y: auto; }
        .panel-header h2 { font-size: 24px; margin-bottom: 8px; }
        .subtitle { color: var(--color-text-secondary); margin-bottom: 24px; }
        
        .main-content { display: flex; flex-direction: column; gap: 32px; max-width: 900px; }
        
        .spawn-section h3, .active-section h3, .chat-mention h3 { font-size: 14px; margin-bottom: 12px; }
        
        .agent-selector { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
        .agent-option { display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--color-bg-secondary); border-radius: var(--radius-md); cursor: pointer; border: 2px solid transparent; }
        .agent-option:hover { background: var(--color-bg-tertiary); }
        .agent-option.selected { border-color: var(--color-accent); background: rgba(124,92,255,0.1); }
        .agent-icon { font-size: 24px; }
        .agent-info { display: flex; flex-direction: column; }
        .agent-name { font-weight: 600; font-size: 13px; }
        .agent-desc { font-size: 11px; color: var(--color-text-muted); }
        
        .spawn-section textarea { width: 100%; margin-bottom: 12px; }
        .spawn-btn { padding: 12px; background: var(--color-accent); color: white; border-radius: var(--radius-md); font-weight: 600; }
        
        .active-list { display: flex; flex-direction: column; gap: 8px; }
        .agent-card { display: flex; align-items: center; gap: 12px; padding: 16px; background: var(--color-bg-secondary); border-radius: var(--radius-md); }
        .agent-details { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .agent-type { font-weight: 600; }
        .agent-status { font-size: 12px; text-transform: capitalize; }
        .agent-status.running { color: var(--color-accent); }
        .agent-actions { display: flex; gap: 8px; }
        .agent-actions button { width: 32px; height: 32px; background: var(--color-bg-tertiary); border-radius: var(--radius-sm); }
        
        .empty-text { color: var(--color-text-muted); font-size: 13px; padding: 24px; text-align: center; }
        
        .chat-mention code { display: block; padding: 8px 12px; background: var(--color-bg-tertiary); border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 12px; margin: 4px 0; }
      `}</style>
    </div>
  );
}