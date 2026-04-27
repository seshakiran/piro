/**
 * StatusBar - Bottom status bar with project info
 */

import React from 'react';
import type { Panel, Stage } from '../App';

interface StatusBarProps {
  connected: boolean;
  activePanel: Panel;
  currentProject: { id: string; name: string; stage: Stage } | null;
  onToggleTerminal: () => void;
  onShowNotifications: () => void;
  notificationCount: number;
}

const stageLabels: Record<Stage, string> = {
  'project': 'Project',
  'requirements': 'Requirements',
  'system-design': 'System Design',
  'tech-design': 'Tech Design',
  'development': 'Development',
  'testing': 'Testing',
  'deployment': 'Deployment',
};

export function StatusBar({ connected, activePanel, currentProject, onToggleTerminal, onShowNotifications, notificationCount }: StatusBarProps) {
  return (
    <div className="status-bar">
      <div className="status-left">
        <div className={`status-item connection ${connected ? 'connected' : 'disconnected'}`}>
          <span className="status-dot"></span>
          <span>{connected ? 'Piro Core Connected' : 'Offline Mode'}</span>
        </div>
        
        {currentProject && (
          <div className="status-item project">
            <span>📁 {currentProject.name}</span>
            <span className="stage-badge">{stageLabels[currentProject.stage]}</span>
          </div>
        )}
      </div>
      
      <div className="status-center">
        <div className="status-item panel">
          <span>MiniMax-M2.7</span>
        </div>
      </div>
      
      <div className="status-right">
        <button className="status-action" onClick={onShowNotifications}>
          🔔
          {notificationCount > 0 && <span className="badge">{notificationCount}</span>}
        </button>
        
        <button className="status-action" onClick={onToggleTerminal}>
          Terminal
        </button>
      </div>
      
      <style>{`
        .status-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 28px;
          padding: 0 12px;
          background: var(--color-accent);
          font-size: 12px;
          color: white;
        }
        
        .status-left, .status-center, .status-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .status-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-error);
        }
        
        .connection.connected .status-dot {
          background: var(--color-success);
          box-shadow: 0 0 8px var(--color-success);
        }
        
        .stage-badge {
          padding: 2px 6px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          font-size: 10px;
        }
        
        .status-action {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          color: white;
          position: relative;
        }
        
        .status-action:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-error);
          border-radius: 50%;
          font-size: 10px;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}