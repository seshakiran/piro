/**
 * DevelopmentPanel - Development (SDLC Step 4)
 */

import React, { useState } from 'react';
import type { Stage } from '../App';
import { Editor } from './Editor';

interface DevelopmentPanelProps {
  api: any;
  workspacePath: string | null;
  currentProject: { id: string; name: string; stage: Stage } | null;
  setCurrentProject: (p: any) => void;
  addNotification: (t: any, ti: string, m: string) => void;
}

export function DevelopmentPanel({ currentProject, addNotification }: DevelopmentPanelProps) {
  const [code, setCode] = useState('// Start coding here...\n\nfunction hello() {\n  console.log("Hello from Piro!");\n}\n\nexport default hello;');
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Set up project structure', status: 'completed' },
    { id: '2', title: 'Implement core functionality', status: 'in_progress' },
    { id: '3', title: 'Add error handling', status: 'pending' },
  ]);
  
  return (
    <div className="development-panel">
      <div className="panel-header">
        <h2>Development</h2>
        <p className="subtitle">Build your project with AI assistance</p>
      </div>
      
      <div className="dev-content">
        <div className="tasks-sidebar">
          <h3>Tasks</h3>
          <div className="task-list">
            {tasks.map(task => (
              <div key={task.id} className={`task-item ${task.status}`}>
                <span className="task-status">{task.status === 'completed' ? '✓' : task.status === 'in_progress' ? '▶' : '○'}</span>
                <span>{task.title}</span>
              </div>
            ))}
          </div>
          <button className="add-task-btn">+ Add Task</button>
        </div>
        
        <div className="code-area">
          <div className="code-header">
            <span className="file-name">main.ts</span>
            <div className="code-actions">
              <button onClick={() => addNotification('info', 'AI', 'Running autopilot...')}>🤖 Autopilot</button>
              <button onClick={() => addNotification('info', 'AI', 'Refactoring code...')}>♻️ Refactor</button>
              <button onClick={() => addNotification('info', 'AI', 'Analyzing code...')}>🔍 Analyze</button>
            </div>
          </div>
          <Editor value={code} language="typescript" onChange={setCode} />
        </div>
      </div>
      
      <style>{`
        .development-panel { display: flex; flex-direction: column; height: 100%; overflow: hidden; }
        .panel-header { padding: 24px 24px 0; }
        .panel-header h2 { font-size: 24px; margin-bottom: 8px; }
        .subtitle { color: var(--color-text-secondary); }
        
        .dev-content { display: flex; flex: 1; overflow: hidden; }
        
        .tasks-sidebar { width: 260px; border-right: 1px solid var(--color-border); padding: 16px; overflow-y: auto; }
        .tasks-sidebar h3 { font-size: 14px; margin-bottom: 12px; color: var(--color-text-secondary); }
        
        .task-list { display: flex; flex-direction: column; gap: 8px; }
        .task-item { display: flex; align-items: center; gap: 8px; padding: 10px; background: var(--color-bg-secondary); border-radius: var(--radius-md); font-size: 13px; }
        .task-item.completed { opacity: 0.6; }
        .task-item.completed .task-status { color: var(--color-success); }
        .task-item.in_progress { border-left: 3px solid var(--color-accent); }
        .task-status { font-size: 12px; }
        
        .add-task-btn { width: 100%; margin-top: 12px; padding: 10px; background: var(--color-bg-tertiary); border-radius: var(--radius-md); font-size: 12px; }
        .add-task-btn:hover { background: var(--color-accent); color: white; }
        
        .code-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .code-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 16px; background: var(--color-bg-secondary); border-bottom: 1px solid var(--color-border); }
        .file-name { font-size: 13px; font-family: var(--font-mono); }
        .code-actions { display: flex; gap: 8px; }
        .code-actions button { padding: 6px 12px; background: var(--color-bg-tertiary); border-radius: var(--radius-sm); font-size: 12px; }
        .code-actions button:hover { background: var(--color-accent); color: white; }
      `}</style>
    </div>
  );
}