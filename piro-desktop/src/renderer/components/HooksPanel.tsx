/**
 * HooksPanel - Agent hooks configuration
 * on_save, on_build, pre_commit hooks
 */

import React, { useState } from 'react';
import { PiroAPI, Hook } from '../api/piro-client';

interface HooksPanelProps {
  api: PiroAPI | null;
}

type TriggerType = 'on_save' | 'on_build' | 'on_commit' | 'on_test' | 'pre_deploy' | 'manual';

const triggerDescriptions: Record<TriggerType, string> = {
  on_save: 'Triggered when a file is saved',
  on_build: 'Triggered when build is executed',
  on_commit: 'Triggered before git commit',
  on_test: 'Triggered when tests are run',
  pre_deploy: 'Triggered before deployment',
  manual: 'Manually triggered by user',
};

export function HooksPanel({ api }: HooksPanelProps) {
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [selectedHook, setSelectedHook] = useState<Hook | null>(null);
  const [editingHook, setEditingHook] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [hookName, setHookName] = useState('');
  const [hookTrigger, setHookTrigger] = useState<TriggerType>('on_save');
  const [hookPrompt, setHookPrompt] = useState('');
  const [hookEnabled, setHookEnabled] = useState(true);
  
  const loadHooks = async () => {
    if (!api) return;
    try {
      const allHooks = await api.getHooks();
      setHooks(allHooks);
    } catch (error) {
      console.error('Failed to load hooks:', error);
    }
  };
  
  const createHook = async () => {
    if (!api || !hookName.trim() || !hookPrompt.trim()) return;
    
    setLoading(true);
    try {
      const newHook = await api.createHook({
        name: hookName,
        trigger: hookTrigger,
        prompt: hookPrompt,
        enabled: hookEnabled,
      });
      setHooks(h => [...h, newHook]);
      resetForm();
    } catch (error) {
      console.error('Failed to create hook:', error);
    }
    setLoading(false);
  };
  
  const updateHook = async () => {
    if (!api || !selectedHook) return;
    
    setLoading(true);
    try {
      const updated = await api.updateHook(selectedHook.id, {
        name: hookName,
        trigger: hookTrigger,
        prompt: hookPrompt,
        enabled: hookEnabled,
      });
      setHooks(h => h.map(hook => hook.id === updated.id ? updated : hook));
      resetForm();
    } catch (error) {
      console.error('Failed to update hook:', error);
    }
    setLoading(false);
  };
  
  const deleteHook = async (id: string) => {
    if (!api) return;
    try {
      await api.deleteHook(id);
      setHooks(h => h.filter(hook => hook.id !== id));
      if (selectedHook?.id === id) {
        setSelectedHook(null);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to delete hook:', error);
    }
  };
  
  const toggleHook = async (id: string) => {
    if (!api) return;
    const hook = hooks.find(h => h.id === id);
    if (!hook) return;
    
    try {
      const updated = await api.updateHook(id, { enabled: !hook.enabled });
      setHooks(h => h.map(item => item.id === updated.id ? updated : item));
    } catch (error) {
      console.error('Failed to toggle hook:', error);
    }
  };
  
  const resetForm = () => {
    setHookName('');
    setHookTrigger('on_save');
    setHookPrompt('');
    setHookEnabled(true);
    setSelectedHook(null);
    setEditingHook(false);
  };
  
  const editHook = (hook: Hook) => {
    setSelectedHook(hook);
    setHookName(hook.name);
    setHookTrigger(hook.trigger as TriggerType);
    setHookPrompt(hook.prompt);
    setHookEnabled(hook.enabled);
    setEditingHook(true);
  };
  
  const runHook = async (id: string) => {
    if (!api) return;
    try {
      await api.runHook(id);
      await loadHooks();
    } catch (error) {
      console.error('Failed to run hook:', error);
    }
  };
  
  return (
    <div className="hooks-panel">
      <div className="hooks-sidebar">
        <div className="hooks-sidebar-header">
          <h3>Hooks</h3>
          <button onClick={loadHooks} title="Refresh">⟳</button>
        </div>
        
        <div className="hooks-list">
          {hooks.map(hook => (
            <div
              key={hook.id}
              className={`hook-item ${selectedHook?.id === hook.id ? 'active' : ''} ${hook.enabled ? '' : 'disabled'}`}
              onClick={() => editHook(hook)}
            >
              <div className="hook-item-header">
                <span className="hook-item-name">{hook.name}</span>
                <button 
                  className={`toggle-btn ${hook.enabled ? 'on' : 'off'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleHook(hook.id);
                  }}
                >
                  {hook.enabled ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className="hook-item-trigger">{triggerDescriptions[hook.trigger as TriggerType] || hook.trigger}</div>
            </div>
          ))}
          
          {hooks.length === 0 && (
            <div className="hooks-empty">
              No hooks configured yet.
            </div>
          )}
        </div>
      </div>
      
      <div className="hooks-content">
        <div className="hooks-header">
          <h2>{editingHook ? 'Edit Hook' : 'Create Hook'}</h2>
        </div>
        
        <div className="hook-form">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={hookName}
              onChange={e => setHookName(e.target.value)}
              placeholder="e.g., Auto-generate tests on save"
            />
          </div>
          
          <div className="form-group">
            <label>Trigger</label>
            <select value={hookTrigger} onChange={e => setHookTrigger(e.target.value as TriggerType)}>
              {Object.entries(triggerDescriptions).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Prompt</label>
            <textarea
              value={hookPrompt}
              onChange={e => setHookPrompt(e.target.value)}
              placeholder="Enter the prompt for this hook..."
              rows={6}
            />
            <span className="form-hint">
              This prompt will be sent to the agent when the hook triggers.
            </span>
          </div>
          
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={hookEnabled}
                onChange={e => setHookEnabled(e.target.checked)}
              />
              Enabled
            </label>
          </div>
          
          <div className="form-actions">
            {editingHook ? (
              <>
                <button 
                  className="save-btn"
                  onClick={updateHook}
                  disabled={loading || !hookName.trim() || !hookPrompt.trim()}
                >
                  Save Changes
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => selectedHook && deleteHook(selectedHook.id)}
                >
                  Delete
                </button>
                <button 
                  className="cancel-btn"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button 
                  className="create-btn"
                  onClick={createHook}
                  disabled={loading || !hookName.trim() || !hookPrompt.trim()}
                >
                  {loading ? 'Creating...' : 'Create Hook'}
                </button>
                <button 
                  className="cancel-btn"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
        
        {selectedHook && (
          <div className="hook-run-section">
            <button 
              className="run-hook-btn"
              onClick={() => runHook(selectedHook.id)}
            >
              ▶ Run Hook Now
            </button>
          </div>
        )}
      </div>
      
      <style>{`
        .hooks-panel {
          display: flex;
          height: 100%;
          background: var(--color-bg-primary);
        }
        
        .hooks-sidebar {
          width: 280px;
          border-right: 1px solid var(--color-border);
          background: var(--color-bg-secondary);
          display: flex;
          flex-direction: column;
        }
        
        .hooks-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid var(--color-border);
        }
        
        .hooks-sidebar-header h3 {
          font-size: 14px;
          font-weight: 600;
        }
        
        .hooks-sidebar-header button {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          color: var(--color-text-secondary);
        }
        
        .hooks-sidebar-header button:hover {
          background: var(--color-bg-tertiary);
        }
        
        .hooks-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }
        
        .hook-item {
          padding: 12px;
          border-radius: var(--radius-md);
          cursor: pointer;
          margin-bottom: 4px;
        }
        
        .hook-item:hover {
          background: var(--color-bg-tertiary);
        }
        
        .hook-item.active {
          background: var(--color-accent);
        }
        
        .hook-item.disabled {
          opacity: 0.5;
        }
        
        .hook-item-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        
        .hook-item-name {
          font-size: 13px;
          font-weight: 500;
        }
        
        .toggle-btn {
          font-size: 10px;
          padding: 2px 6px;
          border-radius: var(--radius-sm);
          font-weight: bold;
        }
        
        .toggle-btn.on {
          background: var(--color-success);
          color: #000;
        }
        
        .toggle-btn.off {
          background: var(--color-bg-tertiary);
          color: var(--color-text-muted);
        }
        
        .hook-item-trigger {
          font-size: 11px;
          color: var(--color-text-muted);
        }
        
        .hook-item.active .hook-item-trigger {
          color: rgba(255, 255, 255, 0.7);
        }
        
        .hooks-empty {
          padding: 24px;
          text-align: center;
          color: var(--color-text-muted);
          font-size: 12px;
        }
        
        .hooks-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }
        
        .hooks-header {
          margin-bottom: 24px;
        }
        
        .hooks-header h2 {
          font-size: 18px;
        }
        
        .hook-form {
          background: var(--color-bg-secondary);
          padding: 20px;
          border-radius: var(--radius-lg);
        }
        
        .form-group {
          margin-bottom: 16px;
        }
        
        .form-group label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 6px;
          color: var(--color-text-secondary);
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
        }
        
        .form-group select {
          padding: 8px 12px;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
        }
        
        .form-group.checkbox label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        
        .form-group.checkbox input {
          width: 16px;
          height: 16px;
        }
        
        .form-hint {
          display: block;
          font-size: 11px;
          color: var(--color-text-muted);
          margin-top: 4px;
        }
        
        .form-actions {
          display: flex;
          gap: 8px;
          margin-top: 24px;
        }
        
        .save-btn, .create-btn {
          padding: 10px 20px;
          background: var(--color-accent);
          color: white;
          border-radius: var(--radius-md);
          font-weight: 500;
        }
        
        .save-btn:hover:not(:disabled), .create-btn:hover:not(:disabled) {
          background: var(--color-accent-hover);
        }
        
        .save-btn:disabled, .create-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .delete-btn {
          padding: 10px 20px;
          background: var(--color-error);
          color: white;
          border-radius: var(--radius-md);
          font-weight: 500;
        }
        
        .delete-btn:hover {
          background: #ff4040;
        }
        
        .cancel-btn {
          padding: 10px 20px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
        }
        
        .cancel-btn:hover {
          background: var(--color-bg-elevated);
        }
        
        .hook-run-section {
          margin-top: 24px;
        }
        
        .run-hook-btn {
          padding: 12px 24px;
          background: var(--color-success);
          color: #000;
          border-radius: var(--radius-md);
          font-weight: 500;
        }
        
        .run-hook-btn:hover {
          background: #4de07a;
        }
      `}</style>
    </div>
  );
}