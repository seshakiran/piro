/**
 * Sidebar - Navigation sidebar with all panels
 */

import React from 'react';
import type { Panel, Stage } from '../App';

interface SidebarProps {
  activePanel: Panel;
  onPanelChange: (panel: Panel) => void;
  connected: boolean;
  currentProject: { id: string; name: string; stage: Stage } | null;
  activeStage: Stage;
}

const panelLabels: Record<Panel, string> = {
  'project': 'Project',
  'requirements': 'Requirements',
  'system-design': 'System Design',
  'tech-design': 'Tech Design',
  'development': 'Development',
  'testing': 'Testing',
  'deployment': 'Deployment',
  'chat': 'Chat',
  'subagents': 'Agents',
  'settings': 'Settings',
  'help': 'Help',
  'notifications': 'Notifications',
  'explorer': 'Explorer',
};

export function Sidebar({ activePanel, onPanelChange, connected, currentProject, activeStage }: SidebarProps) {
  const stages: Panel[] = ['project', 'requirements', 'system-design', 'tech-design', 'development', 'testing', 'deployment'];
  const tools: Panel[] = ['chat', 'subagents', 'explorer'];
  const system: Panel[] = ['settings', 'help', 'notifications'];
  
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">P</span>
          <div className="logo-text">
            <span className="logo-name">Piro</span>
            <span className="logo-tagline">AI Coding IDE</span>
          </div>
        </div>
      </div>
      
      {currentProject && (
        <div className="project-indicator">
          <span className="project-name">{currentProject.name}</span>
          <span className="project-stage">{panelLabels[currentProject.stage as Panel]}</span>
        </div>
      )}
      
      <div className="sidebar-section">
        <div className="section-title">SDLC Workflow</div>
        {stages.map(panel => (
          <button
            key={panel}
            className={`nav-item ${activePanel === panel ? 'active' : ''}`}
            onClick={() => onPanelChange(panel)}
          >
            <span className="nav-icon">{getStageIcon(panel)}</span>
            <span className="nav-label">{panelLabels[panel]}</span>
          </button>
        ))}
      </div>
      
      <div className="sidebar-section">
        <div className="section-title">AI Tools</div>
        {tools.map(panel => (
          <button
            key={panel}
            className={`nav-item ${activePanel === panel ? 'active' : ''}`}
            onClick={() => onPanelChange(panel)}
          >
            <span className="nav-icon">{getToolIcon(panel)}</span>
            <span className="nav-label">{panelLabels[panel]}</span>
          </button>
        ))}
      </div>
      
      <div className="sidebar-section">
        <div className="section-title">System</div>
        {system.map(panel => (
          <button
            key={panel}
            className={`nav-item ${activePanel === panel ? 'active' : ''}`}
            onClick={() => onPanelChange(panel)}
          >
            <span className="nav-icon">{getSystemIcon(panel)}</span>
            <span className="nav-label">{panelLabels[panel]}</span>
          </button>
        ))}
      </div>
      
      <div className="sidebar-footer">
        <div className={`connection-indicator ${connected ? 'connected' : 'disconnected'}`}>
          <span className="indicator-dot"></span>
          <span className="indicator-text">{connected ? 'Connected' : 'Offline'}</span>
        </div>
      </div>
      
      <style>{`
        .sidebar {
          width: 220px;
          display: flex;
          flex-direction: column;
          background: var(--color-bg-secondary);
          border-right: 1px solid var(--color-border);
        }
        
        .sidebar-header {
          padding: 16px;
          border-bottom: 1px solid var(--color-border);
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .logo-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--color-accent), var(--color-accent-secondary));
          border-radius: var(--radius-lg);
          font-weight: bold;
          font-size: 22px;
        }
        
        .logo-text {
          display: flex;
          flex-direction: column;
        }
        
        .logo-name {
          font-weight: bold;
          font-size: 16px;
        }
        
        .logo-tagline {
          font-size: 10px;
          color: var(--color-text-muted);
        }
        
        .project-indicator {
          padding: 12px 16px;
          background: var(--color-bg-tertiary);
          border-bottom: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .project-name {
          font-weight: 600;
          font-size: 13px;
        }
        
        .project-stage {
          font-size: 11px;
          color: var(--color-accent);
        }
        
        .sidebar-section {
          padding: 8px;
        }
        
        .section-title {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--color-text-muted);
          padding: 8px 12px 4px;
          letter-spacing: 0.5px;
        }
        
        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          text-align: left;
          transition: background var(--transition-fast);
          color: var(--color-text-secondary);
          width: 100%;
        }
        
        .nav-item:hover {
          background: var(--color-bg-tertiary);
          color: var(--color-text-primary);
        }
        
        .nav-item.active {
          background: var(--color-accent);
          color: white;
        }
        
        .nav-icon {
          font-size: 16px;
        }
        
        .nav-label {
          font-size: 13px;
          font-weight: 500;
        }
        
        .sidebar-footer {
          margin-top: auto;
          padding: 12px;
          border-top: 1px solid var(--color-border);
        }
        
        .connection-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          border-radius: var(--radius-md);
          font-size: 11px;
        }
        
        .indicator-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        
        .connection-indicator.connected .indicator-dot {
          background: var(--color-success);
          box-shadow: 0 0 8px var(--color-success);
        }
        
        .connection-indicator.disconnected .indicator-dot {
          background: var(--color-error);
        }
        
        .indicator-text {
          color: var(--color-text-secondary);
        }
      `}</style>
    </div>
  );
}

function getStageIcon(panel: Panel): string {
  const icons: Record<Panel, string> = {
    'project': '📁',
    'requirements': '📝',
    'system-design': '🏗️',
    'tech-design': '⚙️',
    'development': '💻',
    'testing': '🧪',
    'deployment': '����',
    'chat': '💬',
    'subagents': '🤖',
    'settings': '⚙️',
    'help': '❓',
    'notifications': '🔔',
  };
  return icons[panel] || '📄';
}

function getToolIcon(panel: Panel): string {
  if (panel === 'explorer') return '📁';
  return panel === 'chat' ? '💬' : '🤖';
}

function getSystemIcon(panel: Panel): string {
  const icons: Record<Panel, string> = {
    'settings': '⚙️',
    'help': '❓',
    'notifications': '🔔',
  };
  return icons[panel] || '⚙️';
}