/**
 * TechDesignPanel - Technical Design (SDLC Step 3)
 */

import React, { useState } from 'react';
import type { Stage } from '../App';

interface TechDesignPanelProps {
  api: any;
  workspacePath: string | null;
  currentProject: { id: string; name: string; stage: Stage } | null;
  setCurrentProject: (p: any) => void;
  addNotification: (t: any, ti: string, m: string) => void;
}

export function TechDesignPanel({ currentProject, addNotification }: TechDesignPanelProps) {
  const [apiSpec, setApiSpec] = useState('');
  const [dbSchema, setDbSchema] = useState('');
  const useAI = () => addNotification('info', 'AI', 'Generating technical design...');
  
  return (
    <div className="tech-design-panel">
      <div className="panel-header">
        <h2>Technical Design</h2>
        <p className="subtitle">Detailed technical specifications</p>
      </div>
      
      <div className="design-content">
        <div className="section">
          <h3>API Specification</h3>
          <textarea value={apiSpec} onChange={e => setApiSpec(e.target.value)} placeholder="Define API endpoints, request/response formats..." rows={6} />
          <button className="ai-btn" onClick={useAI}><span>🤖</span> Generate with AI</button>
        </div>
        
        <div className="section">
          <h3>Database Schema</h3>
          <textarea value={dbSchema} onChange={e => setDbSchema(e.target.value)} placeholder="Define database tables and relationships..." rows={6} />
          <button className="ai-btn" onClick={useAI}><span>🤖</span> Generate Schema</button>
        </div>
        
        <div className="section">
          <h3>File Structure</h3>
          <div className="tree">
            <div className="tree-item">📁 src/</div>
            <div className="tree-item">  📁 components/</div>
            <div className="tree-item">  📁 services/</div>
            <div className="tree-item">  📁 utils/</div>
            <div className="tree-item">  📁 tests/</div>
            <div className="tree-item">📄 index.ts</div>
            <div className="tree-item">📄 package.json</div>
          </div>
        </div>
        
        <button className="save-btn">Save Technical Design</button>
      </div>
      
      <style>{`
        .tech-design-panel { display: flex; flex-direction: column; height: 100%; padding: 24px; overflow-y: auto; }
        .panel-header h2 { font-size: 24px; margin-bottom: 8px; }
        .subtitle { color: var(--color-text-secondary); margin-bottom: 24px; }
        .design-content { display: flex; flex-direction: column; gap: 24px; max-width: 900px; }
        .section h3 { font-size: 16px; margin-bottom: 12px; }
        .section textarea { width: 100%; margin-bottom: 12px; }
        .ai-btn { display: flex; align-items: center; gap: 8px; padding: 10px; background: var(--color-bg-tertiary); border-radius: var(--radius-md); }
        .ai-btn:hover { background: var(--color-accent); color: white; }
        .tree { background: var(--color-bg-secondary); padding: 16px; border-radius: var(--radius-md); font-family: var(--font-mono); font-size: 13px; }
        .tree-item { padding: 4px 0; }
        .save-btn { padding: 14px; background: var(--color-accent); color: white; border-radius: var(--radius-md); font-weight: 600; }
      `}</style>
    </div>
  );
}