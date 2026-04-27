/**
 * SpecPanel - Spec-driven development interface
 * EARS notation, task management, spec lifecycle
 */

import React, { useState, useEffect } from 'react';
import { PiroAPI, Spec, Task } from '../api/piro-client';

interface SpecPanelProps {
  api: PiroAPI | null;
}

type SpecStatus = 'draft' | 'review' | 'approved' | 'in_progress' | 'completed';

export function SpecPanel({ api }: SpecPanelProps) {
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [selectedSpec, setSelectedSpec] = useState<Spec | null>(null);
  const [newPrompt, setNewPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (api) {
      loadSpecs();
    }
  }, [api]);
  
  const loadSpecs = async () => {
    if (!api) return;
    try {
      const allSpecs = await api.getSpecs();
      setSpecs(allSpecs);
    } catch (error) {
      console.error('Failed to load specs:', error);
    }
  };
  
  const generateSpec = async () => {
    if (!api || !newPrompt.trim()) return;
    
    setLoading(true);
    try {
      const spec = await api.generateSpec(newPrompt);
      setSpecs(s => [spec, ...s]);
      setSelectedSpec(spec);
      setNewPrompt('');
    } catch (error) {
      console.error('Failed to generate spec:', error);
    }
    setLoading(false);
  };
  
  const updateSpecStatus = async (specId: string, status: SpecStatus) => {
    if (!api) return;
    try {
      await api.updateSpecStatus(specId, status);
      setSpecs(s => s.map(spec => 
        spec.id === specId ? { ...spec, status } : spec
      ));
      if (selectedSpec?.id === specId) {
        setSelectedSpec(s => s ? { ...s, status } : null);
      }
    } catch (error) {
      console.error('Failed to update spec status:', error);
    }
  };
  
  const executeTask = async (taskId: string, role: string) => {
    if (!api) return;
    try {
      await api.executeTask(taskId, role);
      loadSpecs();
    } catch (error) {
      console.error('Failed to execute task:', error);
    }
  };
  
  const statusColors: Record<SpecStatus, string> = {
    draft: '#6b697a',
    review: '#ffb85c',
    approved: '#5cff8f',
    in_progress: '#7c5cff',
    completed: '#5cff8f',
  };
  
  return (
    <div className="spec-panel">
      <div className="spec-sidebar">
        <div className="spec-sidebar-header">
          <h3>Specs</h3>
          <button onClick={() => loadSpecs()} title="Refresh">⟳</button>
        </div>
        
        <div className="spec-create">
          <textarea
            value={newPrompt}
            onChange={e => setNewPrompt(e.target.value)}
            placeholder="Describe your feature..."
            rows={3}
          />
          <button 
            onClick={generateSpec}
            disabled={loading || !newPrompt.trim()}
            className="create-btn"
          >
            {loading ? 'Generating...' : 'Generate Spec'}
          </button>
        </div>
        
        <div className="spec-list">
          {specs.map(spec => (
            <div
              key={spec.id}
              className={`spec-item ${selectedSpec?.id === spec.id ? 'active' : ''}`}
              onClick={() => setSelectedSpec(spec)}
            >
              <div className="spec-item-header">
                <span className="spec-item-title">{spec.title}</span>
                <span 
                  className="spec-item-status"
                  style={{ background: statusColors[spec.status as SpecStatus] }}
                />
              </div>
              <div className="spec-item-meta">
                {spec.tasks?.length || 0} tasks • {spec.status}
              </div>
            </div>
          ))}
          
          {specs.length === 0 && (
            <div className="spec-empty">
              No specs yet. Describe a feature to generate one.
            </div>
          )}
        </div>
      </div>
      
      <div className="spec-content">
        {selectedSpec ? (
          <>
            <div className="spec-header">
              <h2>{selectedSpec.title}</h2>
              <div className="spec-actions">
                {selectedSpec.status === 'draft' && (
                  <button 
                    className="action-btn review"
                    onClick={() => updateSpecStatus(selectedSpec.id, 'review')}
                  >
                    Move to Review
                  </button>
                )}
                {selectedSpec.status === 'review' && (
                  <button 
                    className="action-btn approve"
                    onClick={() => updateSpecStatus(selectedSpec.id, 'approved')}
                  >
                    Approve
                  </button>
                )}
                {selectedSpec.status === 'approved' && (
                  <button 
                    className="action-btn start"
                    onClick={() => updateSpecStatus(selectedSpec.id, 'in_progress')}
                  >
                    Start Implementation
                  </button>
                )}
              </div>
            </div>
            
            <div className="spec-section">
              <h3>Requirements (EARS Notation)</h3>
              <div className="requirements-list">
                {selectedSpec.requirements?.map((req, i) => (
                  <div key={i} className="requirement-item">
                    <span className="requirement-type">{req.type}</span>
                    <span className="requirement-text">{req.text}</span>
                  </div>
                )) || (
                  <div className="no-requirements">
                    Requirements will appear here after spec generation.
                  </div>
                )}
              </div>
            </div>
            
            <div className="spec-section">
              <h3>Tasks</h3>
              <div className="tasks-list">
                {selectedSpec.tasks?.map((task, i) => (
                  <div key={i} className={`task-item ${task.status}`}>
                    <div className="task-header">
                      <span className="task-title">{task.title}</span>
                      <span className="task-role">{task.role}</span>
                    </div>
                    <div className="task-description">{task.description}</div>
                    <div className="task-footer">
                      <span className={`task-status-badge ${task.status}`}>
                        {task.status || 'pending'}
                      </span>
                      {task.status !== 'completed' && (
                        <div className="task-actions">
                          <button onClick={() => executeTask(task.id, 'implementer')}>
                            Implement
                          </button>
                          <button onClick={() => executeTask(task.id, 'tester')}>
                            Test
                          </button>
                          <button onClick={() => executeTask(task.id, 'docs-writer')}>
                            Docs
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )) || (
                  <div className="no-tasks">
                    Tasks will appear here after spec generation.
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="spec-placeholder">
            <div className="placeholder-icon">📋</div>
            <h3>Select a Spec</h3>
            <p>Choose a spec from the list or create a new one.</p>
          </div>
        )}
      </div>
      
      <style>{`
        .spec-panel {
          display: flex;
          height: 100%;
          background: var(--color-bg-primary);
        }
        
        .spec-sidebar {
          width: 280px;
          border-right: 1px solid var(--color-border);
          background: var(--color-bg-secondary);
          display: flex;
          flex-direction: column;
        }
        
        .spec-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid var(--color-border);
        }
        
        .spec-sidebar-header h3 {
          font-size: 14px;
          font-weight: 600;
        }
        
        .spec-sidebar-header button {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          color: var(--color-text-secondary);
        }
        
        .spec-sidebar-header button:hover {
          background: var(--color-bg-tertiary);
        }
        
        .spec-create {
          padding: 12px;
          border-bottom: 1px solid var(--color-border);
        }
        
        .spec-create textarea {
          width: 100%;
          margin-bottom: 8px;
          font-size: 12px;
        }
        
        .create-btn {
          width: 100%;
          padding: 8px;
          background: var(--color-accent);
          color: white;
          border-radius: var(--radius-md);
          font-size: 12px;
          font-weight: 500;
        }
        
        .create-btn:hover:not(:disabled) {
          background: var(--color-accent-hover);
        }
        
        .create-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .spec-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }
        
        .spec-item {
          padding: 12px;
          border-radius: var(--radius-md);
          cursor: pointer;
          margin-bottom: 4px;
        }
        
        .spec-item:hover {
          background: var(--color-bg-tertiary);
        }
        
        .spec-item.active {
          background: var(--color-accent);
        }
        
        .spec-item-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        
        .spec-item-title {
          font-size: 13px;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .spec-item-status {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        
        .spec-item-meta {
          font-size: 11px;
          color: var(--color-text-muted);
        }
        
        .spec-item.active .spec-item-meta {
          color: rgba(255, 255, 255, 0.7);
        }
        
        .spec-empty {
          padding: 24px;
          text-align: center;
          color: var(--color-text-muted);
          font-size: 12px;
        }
        
        .spec-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }
        
        .spec-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--color-text-muted);
          text-align: center;
        }
        
        .placeholder-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        
        .spec-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--color-border);
        }
        
        .spec-header h2 {
          font-size: 20px;
          font-weight: 600;
        }
        
        .spec-actions {
          display: flex;
          gap: 8px;
        }
        
        .action-btn {
          padding: 8px 16px;
          border-radius: var(--radius-md);
          font-size: 12px;
          font-weight: 500;
        }
        
        .action-btn.review {
          background: var(--color-warning);
          color: #000;
        }
        
        .action-btn.approve {
          background: var(--color-success);
          color: #000;
        }
        
        .action-btn.start {
          background: var(--color-accent);
          color: white;
        }
        
        .spec-section {
          margin-bottom: 24px;
        }
        
        .spec-section h3 {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 12px;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .requirements-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .requirement-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-md);
          border-left: 3px solid var(--color-accent);
        }
        
        .requirement-type {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: bold;
          color: var(--color-accent);
          min-width: 20px;
        }
        
        .requirement-text {
          font-size: 13px;
          line-height: 1.5;
        }
        
        .no-requirements, .no-tasks {
          padding: 24px;
          text-align: center;
          color: var(--color-text-muted);
          background: var(--color-bg-secondary);
          border-radius: var(--radius-md);
        }
        
        .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .task-item {
          padding: 16px;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
        }
        
        .task-item.completed {
          opacity: 0.6;
          border-color: var(--color-success);
        }
        
        .task-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        
        .task-title {
          font-weight: 600;
        }
        
        .task-role {
          font-size: 11px;
          padding: 2px 8px;
          background: var(--color-accent);
          border-radius: var(--radius-sm);
          text-transform: uppercase;
        }
        
        .task-description {
          font-size: 13px;
          color: var(--color-text-secondary);
          margin-bottom: 12px;
          line-height: 1.5;
        }
        
        .task-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .task-status-badge {
          font-size: 11px;
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          text-transform: uppercase;
        }
        
        .task-status-badge.pending {
          background: var(--color-bg-tertiary);
          color: var(--color-text-muted);
        }
        
        .task-status-badge.in_progress {
          background: var(--color-warning);
          color: #000;
        }
        
        .task-status-badge.completed {
          background: var(--color-success);
          color: #000;
        }
        
        .task-actions {
          display: flex;
          gap: 8px;
        }
        
        .task-actions button {
          padding: 6px 12px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-sm);
          font-size: 11px;
        }
        
        .task-actions button:hover {
          background: var(--color-accent);
          color: white;
        }
      `}</style>
    </div>
  );
}