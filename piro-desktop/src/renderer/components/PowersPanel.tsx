/**
 * PowersPanel - Power tools management
 * File, Git, Test, Deploy powers
 */

import React, { useState } from 'react';
import { PiroAPI, Power } from '../api/piro-client';

interface PowersPanelProps {
  api: PiroAPI | null;
}

const powerCategories = [
  { id: 'file', icon: '📁', label: 'File Operations', description: 'Read, write, create, delete files' },
  { id: 'git', icon: '🔀', label: 'Git Operations', description: 'Commit, push, pull, branch management' },
  { id: 'test', icon: '🧪', label: 'Testing', description: 'Run tests, generate coverage reports' },
  { id: 'deploy', icon: '🚀', label: 'Deployment', description: 'Deploy to cloud platforms' },
  { id: 'search', icon: '🔍', label: 'Search', description: 'Search files, grep content' },
  { id: 'terminal', icon: '💻', label: 'Terminal', description: 'Execute shell commands' },
];

export function PowersPanel({ api }: PowersPanelProps) {
  const [powers, setPowers] = useState<Power[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('file');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  
  // Power execution state
  const [selectedPower, setSelectedPower] = useState<string | null>(null);
  const [powerParams, setPowerParams] = useState<Record<string, string>>({});
  
  const loadPowers = async () => {
    if (!api) return;
    try {
      const allPowers = await api.getPowers();
      setPowers(allPowers);
    } catch (error) {
      console.error('Failed to load powers:', error);
    }
  };
  
  const executePower = async (powerId: string, params: Record<string, string>) => {
    if (!api) return;
    
    setLoading(true);
    setOutput(null);
    
    try {
      const result = await api.executePower(powerId, params);
      setOutput(result.output || 'Power executed successfully');
    } catch (error) {
      setOutput(`Error: ${error}`);
    }
    
    setLoading(false);
  };
  
  const getPowersByCategory = (category: string) => {
    return powers.filter(p => p.category === category);
  };
  
  const defaultPowers: Power[] = [
    // File operations
    { id: 'file:read', name: 'Read File', category: 'file', description: 'Read contents of a file', enabled: true },
    { id: 'file:write', name: 'Write File', category: 'file', description: 'Write content to a file', enabled: true },
    { id: 'file:create', name: 'Create File', category: 'file', description: 'Create a new file', enabled: true },
    { id: 'file:delete', name: 'Delete File', category: 'file', description: 'Delete a file', enabled: true },
    { id: 'file:list', name: 'List Directory', category: 'file', description: 'List files in a directory', enabled: true },
    { id: 'file:mkdir', name: 'Create Directory', category: 'file', description: 'Create a new directory', enabled: true },
    
    // Git operations
    { id: 'git:status', name: 'Git Status', category: 'git', description: 'Show working tree status', enabled: true },
    { id: 'git:commit', name: 'Git Commit', category: 'git', description: 'Commit changes', enabled: true },
    { id: 'git:push', name: 'Git Push', category: 'git', description: 'Push to remote', enabled: true },
    { id: 'git:pull', name: 'Git Pull', category: 'git', description: 'Pull from remote', enabled: true },
    { id: 'git:branch', name: 'Git Branch', category: 'git', description: 'Manage branches', enabled: true },
    { id: 'git:log', name: 'Git Log', category: 'git', description: 'Show commit history', enabled: true },
    
    // Testing
    { id: 'test:run', name: 'Run Tests', category: 'test', description: 'Run test suite', enabled: true },
    { id: 'test:coverage', name: 'Test Coverage', category: 'test', description: 'Generate coverage report', enabled: true },
    { id: 'test:watch', name: 'Watch Mode', category: 'test', description: 'Run tests in watch mode', enabled: true },
    
    // Deployment
    { id: 'deploy:aws', name: 'Deploy to AWS', category: 'deploy', description: 'Deploy to AWS', enabled: true },
    { id: 'deploy:gcp', name: 'Deploy to GCP', category: 'deploy', description: 'Deploy to Google Cloud', enabled: true },
    { id: 'deploy:azure', name: 'Deploy to Azure', category: 'deploy', description: 'Deploy to Azure', enabled: true },
    { id: 'deploy:vercel', name: 'Deploy to Vercel', category: 'deploy', description: 'Deploy to Vercel', enabled: true },
    
    // Search
    { id: 'search:grep', name: 'Grep', category: 'search', description: 'Search file contents', enabled: true },
    { id: 'search:find', name: 'Find Files', category: 'search', description: 'Find files by name', enabled: true },
    
    // Terminal
    { id: 'terminal:exec', name: 'Execute Command', category: 'terminal', description: 'Run a shell command', enabled: true },
  ];
  
  const displayPowers = powers.length > 0 ? powers : defaultPowers;
  
  return (
    <div className="powers-panel">
      <div className="powers-sidebar">
        <div className="powers-sidebar-header">
          <h3>Powers</h3>
          <button onClick={loadPowers} title="Refresh">⟳</button>
        </div>
        
        <div className="category-list">
          {powerCategories.map(cat => (
            <div
              key={cat.id}
              className={`category-item ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span className="category-icon">{cat.icon}</span>
              <div className="category-info">
                <span className="category-label">{cat.label}</span>
                <span className="category-desc">{cat.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="powers-content">
        <div className="powers-header">
          <h2>{powerCategories.find(c => c.id === selectedCategory)?.label}</h2>
          <span className="power-count">
            {getPowersByCategory(selectedCategory).length} powers
          </span>
        </div>
        
        <div className="powers-grid">
          {getPowersByCategory(selectedCategory).map(power => (
            <div
              key={power.id}
              className={`power-card ${selectedPower === power.id ? 'selected' : ''}`}
              onClick={() => setSelectedPower(power.id)}
            >
              <div className="power-card-header">
                <span className="power-name">{power.name}</span>
                <span className={`power-status ${power.enabled ? 'enabled' : 'disabled'}`}>
                  {power.enabled ? '●' : '○'}
                </span>
              </div>
              <p className="power-description">{power.description}</p>
              <button 
                className="power-execute-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  executePower(power.id, powerParams);
                }}
                disabled={loading}
              >
                Execute
              </button>
            </div>
          ))}
        </div>
        
        {output && (
          <div className="power-output">
            <div className="output-header">
              <h4>Output</h4>
              <button onClick={() => setOutput(null)}>Clear</button>
            </div>
            <pre>{output}</pre>
          </div>
        )}
      </div>
      
      <style>{`
        .powers-panel {
          display: flex;
          height: 100%;
          background: var(--color-bg-primary);
        }
        
        .powers-sidebar {
          width: 260px;
          border-right: 1px solid var(--color-border);
          background: var(--color-bg-secondary);
          display: flex;
          flex-direction: column;
        }
        
        .powers-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid var(--color-border);
        }
        
        .powers-sidebar-header h3 {
          font-size: 14px;
          font-weight: 600;
        }
        
        .powers-sidebar-header button {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          color: var(--color-text-secondary);
        }
        
        .powers-sidebar-header button:hover {
          background: var(--color-bg-tertiary);
        }
        
        .category-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }
        
        .category-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          cursor: pointer;
          margin-bottom: 4px;
        }
        
        .category-item:hover {
          background: var(--color-bg-tertiary);
        }
        
        .category-item.active {
          background: var(--color-accent);
        }
        
        .category-icon {
          font-size: 20px;
        }
        
        .category-info {
          display: flex;
          flex-direction: column;
        }
        
        .category-label {
          font-size: 13px;
          font-weight: 500;
        }
        
        .category-desc {
          font-size: 10px;
          color: var(--color-text-muted);
        }
        
        .category-item.active .category-desc {
          color: rgba(255, 255, 255, 0.7);
        }
        
        .powers-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }
        
        .powers-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        
        .powers-header h2 {
          font-size: 18px;
        }
        
        .power-count {
          font-size: 12px;
          color: var(--color-text-muted);
        }
        
        .powers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 12px;
          margin-bottom: 24px;
        }
        
        .power-card {
          padding: 16px;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          cursor: pointer;
          transition: border-color var(--transition-fast);
        }
        
        .power-card:hover {
          border-color: var(--color-accent);
        }
        
        .power-card.selected {
          border-color: var(--color-accent);
          background: var(--color-bg-tertiary);
        }
        
        .power-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        
        .power-name {
          font-weight: 600;
          font-size: 14px;
        }
        
        .power-status {
          font-size: 10px;
        }
        
        .power-status.enabled {
          color: var(--color-success);
        }
        
        .power-status.disabled {
          color: var(--color-text-muted);
        }
        
        .power-description {
          font-size: 12px;
          color: var(--color-text-secondary);
          margin-bottom: 12px;
        }
        
        .power-execute-btn {
          width: 100%;
          padding: 8px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-sm);
          font-size: 12px;
        }
        
        .power-execute-btn:hover:not(:disabled) {
          background: var(--color-accent);
          color: white;
        }
        
        .power-execute-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .power-output {
          background: var(--color-bg-secondary);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
        }
        
        .output-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid var(--color-border);
        }
        
        .output-header h4 {
          font-size: 12px;
          font-weight: 600;
        }
        
        .output-header button {
          font-size: 11px;
          color: var(--color-text-muted);
          padding: 4px 8px;
          border-radius: var(--radius-sm);
        }
        
        .output-header button:hover {
          background: var(--color-bg-tertiary);
        }
        
        .power-output pre {
          padding: 16px;
          font-family: var(--font-mono);
          font-size: 12px;
          white-space: pre-wrap;
          max-height: 200px;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}