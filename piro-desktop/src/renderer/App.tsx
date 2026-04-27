/**
 * Piro Desktop - Main Application
 * Piro - AI Coding IDE with Full SDLC Workflow
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatPanel } from './components/ChatPanel';
import { ProjectPanel } from './components/ProjectPanel';
import { RequirementsPanel } from './components/RequirementsPanel';
import { SystemDesignPanel } from './components/SystemDesignPanel';
import { TechDesignPanel } from './components/TechDesignPanel';
import { DevelopmentPanel } from './components/DevelopmentPanel';
import { TestingPanel } from './components/TestingPanel';
import { DeploymentPanel } from './components/DeploymentPanel';
import { SubagentsPanel } from './components/SubagentsPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { HelpPanel } from './components/HelpPanel';
import { NotificationsPanel } from './components/NotificationsPanel';
import { FileTreePanel } from './components/FileTreePanel';
import { Editor } from './components/Editor';
import { Terminal } from './components/Terminal';
import { StatusBar } from './components/StatusBar';
import { PiroAPI } from './api/piro-client';

export type Stage = 'project' | 'requirements' | 'system-design' | 'tech-design' | 'development' | 'testing' | 'deployment';
export type Panel = 'chat' | 'project' | 'requirements' | 'system-design' | 'tech-design' | 'development' | 'testing' | 'deployment' | 'subagents' | 'settings' | 'help' | 'notifications' | 'explorer';

interface Tab {
  id: string;
  name: string;
  filePath?: string;
  modified?: boolean;
}

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
}

interface Project {
  id: string;
  name: string;
  description: string;
  stage: Stage;
  requirements?: string;
  systemDesign?: string;
  techDesign?: string;
  createdAt: Date;
}

const stageOrder: Stage[] = ['project', 'requirements', 'system-design', 'tech-design', 'development', 'testing', 'deployment'];
const stageLabels: Record<Stage, string> = {
  'project': 'Project Setup',
  'requirements': 'Requirements',
  'system-design': 'System Design',
  'tech-design': 'Technical Design',
  'development': 'Development',
  'testing': 'Testing',
  'deployment': 'Deployment',
};

export function App() {
  const [activePanel, setActivePanel] = useState<Panel>('project');
  const [activeStage, setActiveStage] = useState<Stage>('project');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [terminalVisible, setTerminalVisible] = useState(false);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [api, setApi] = useState<PiroAPI | null>(null);
  const [connected, setConnected] = useState(false);
  const [workspacePath, setWorkspacePath] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Initialize API connection
  useEffect(() => {
    const initAPI = async () => {
      try {
        const piroApi = new PiroAPI('http://localhost:3847');
        await piroApi.connect();
        setApi(piroApi);
        setConnected(true);
      } catch (error) {
        console.error('Failed to connect to Piro Core:', error);
        setConnected(false);
      }
    };
    initAPI();
  }, []);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'b':
            setSidebarVisible(v => !v);
            break;
          case '`':
            setTerminalVisible(v => !v);
            break;
          case ',':
            e.preventDefault();
            setActivePanel('settings');
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Add notification
  const addNotification = useCallback((type: Notification['type'], title: string, message: string) => {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date(),
    };
    setNotifications(n => [notification, ...n]);
  }, []);
  
  // Check stage progression
  const checkStageProgression = useCallback((targetStage: Stage) => {
    if (!currentProject) return true;
    
    const currentIndex = stageOrder.indexOf(currentProject.stage);
    const targetIndex = stageOrder.indexOf(targetStage);
    
    // Allow jumping forward within 1 stage, or backward freely
    if (targetIndex > currentIndex + 1) {
      addNotification('warning', 'Stage Skipped', `Please complete ${stageLabels[stageOrder[currentIndex + 1]]} before moving to ${stageLabels[targetStage]}`);
      return false;
    }
    return true;
  }, [currentProject, addNotification]);
  
  // Stage navigation with validation
  const navigateToStage = useCallback((stage: Stage) => {
    if (checkStageProgression(stage)) {
      setActiveStage(stage);
      setActivePanel(stage as Panel);
      if (stage !== 'project' && !currentProject) {
        addNotification('warning', 'No Project', 'Please create or open a project first');
        return;
      }
      if (currentProject && stage !== currentProject.stage) {
        setCurrentProject(p => p ? { ...p, stage } : null);
      }
    }
  }, [checkStageProgression, currentProject, addNotification]);
  
  // Create new project
  const createProject = useCallback((name: string, description: string) => {
    const project: Project = {
      id: Date.now().toString(),
      name,
      description,
      stage: 'project',
      createdAt: new Date(),
    };
    setCurrentProject(project);
    setActiveStage('project');
    setActivePanel('project');
    addNotification('success', 'Project Created', `Project "${name}" has been created`);
  }, [addNotification]);
  
  const renderPanel = () => {
    const panelProps = { api, workspacePath, currentProject, setCurrentProject, addNotification };
    
    switch (activePanel) {
      case 'project':
        return <ProjectPanel {...panelProps} onProjectCreate={createProject} />;
      case 'requirements':
        return <RequirementsPanel {...panelProps} />;
      case 'system-design':
        return <SystemDesignPanel {...panelProps} />;
      case 'tech-design':
        return <TechDesignPanel {...panelProps} />;
      case 'development':
        return <DevelopmentPanel {...panelProps} />;
      case 'testing':
        return <TestingPanel {...panelProps} />;
      case 'deployment':
        return <DeploymentPanel {...panelProps} />;
      case 'explorer':
        return (
          <div className="explorer-panel">
            <div className="explorer-sidebar">
              <FileTreePanel onFileSelect={(path) => console.log('Selected:', path)} />
            </div>
            <div className="explorer-editor">
              <Editor 
                value="// Select a file from the explorer\n\nfunction hello() {\n  console.log('Hello from Piro!');\n}\n\nexport default hello;" 
                language="typescript" 
              />
            </div>
          </div>
        );
      case 'chat':
        return <ChatPanel api={api} workspacePath={workspacePath} onCreateProject={createProject} onNavigate={(panel) => setActivePanel(panel as Panel)} />;
      case 'subagents':
        return <SubagentsPanel api={api} />;
      case 'settings':
        return <SettingsPanel api={api} />;
      case 'help':
        return <HelpPanel />;
      case 'notifications':
        return <NotificationsPanel notifications={notifications} onClear={() => setNotifications([])} />;
      default:
        return <ProjectPanel {...panelProps} onProjectCreate={createProject} />;
    }
  };
  
  return (
    <div className="app">
      <div className="app-content">
        {/* Sidebar */}
        {sidebarVisible && (
          <Sidebar 
            activePanel={activePanel}
            onPanelChange={(panel) => {
              if (stageOrder.includes(panel as Stage)) {
                navigateToStage(panel as Stage);
              } else {
                setActivePanel(panel);
              }
            }}
            connected={connected}
            currentProject={currentProject}
            activeStage={activeStage}
          />
        )}
        
        {/* Main content area */}
        <div className="main-area">
          {/* SDLC Stage Bar */}
          {currentProject && (
            <div className="stage-bar">
              <button 
                className="sidebar-toggle"
                onClick={() => setSidebarVisible(v => !v)}
              >
                {sidebarVisible ? '◀' : '▶'}
              </button>
              
              <div className="stage-tabs">
                {stageOrder.map((stage, index) => (
                  <React.Fragment key={stage}>
                    <button
                      className={`stage-tab ${activeStage === stage ? 'active' : ''} ${stageOrder.indexOf(currentProject.stage) > index ? 'completed' : ''}`}
                      onClick={() => navigateToStage(stage)}
                    >
                      <span className="stage-number">{index + 1}</span>
                      <span className="stage-label">{stageLabels[stage]}</span>
                    </button>
                    {index < stageOrder.length - 1 && (
                      <span className="stage-connector">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
          
          {/* Tabs bar */}
          <div className="tabs-bar">
            {tabs.map(tab => (
              <div 
                key={tab.id}
                className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-name">{tab.name}</span>
                {tab.modified && <span className="tab-modified">●</span>}
                <button 
                  className="tab-close"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTabs(t => t.filter(x => x.id !== tab.id));
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            
            <button 
              className="new-tab"
              onClick={() => setActivePanel('chat')}
              title="New Chat"
            >
              +
            </button>
          </div>
          
          {/* Panel content */}
          <div className="panel-content">
            {renderPanel()}
          </div>
          
          {/* Terminal */}
          {terminalVisible && (
            <div className="terminal-panel">
              <Terminal onClose={() => setTerminalVisible(false)} />
            </div>
          )}
        </div>
      </div>
      
      {/* Status bar */}
      <StatusBar 
        connected={connected}
        activePanel={activePanel}
        currentProject={currentProject}
        onToggleTerminal={() => setTerminalVisible(v => !v)}
        onShowNotifications={() => setActivePanel('notifications')}
        notificationCount={notifications.length}
      />
      
      <style>{`
        .app {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: var(--color-bg-primary);
        }
        
        .app-content {
          display: flex;
          flex: 1;
          overflow: hidden;
        }
        
        .main-area {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
        }
        
        .stage-bar {
          display: flex;
          align-items: center;
          height: 48px;
          background: var(--color-bg-secondary);
          border-bottom: 1px solid var(--color-border);
          padding: 0 8px;
          gap: 8px;
        }
        
        .sidebar-toggle {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-muted);
          border-radius: var(--radius-sm);
          font-size: 12px;
          flex-shrink: 0;
        }
        
        .sidebar-toggle:hover {
          background: var(--color-bg-tertiary);
          color: var(--color-text-primary);
        }
        
        .stage-tabs {
          display: flex;
          align-items: center;
          gap: 4px;
          overflow-x: auto;
          flex: 1;
        }
        
        .stage-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: var(--radius-md);
          font-size: 12px;
          color: var(--color-text-muted);
          white-space: nowrap;
          transition: all var(--transition-fast);
        }
        
        .stage-tab:hover {
          background: var(--color-bg-tertiary);
          color: var(--color-text-primary);
        }
        
        .stage-tab.active {
          background: var(--color-accent);
          color: white;
        }
        
        .stage-tab.completed {
          color: var(--color-success);
        }
        
        .stage-number {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-tertiary);
          border-radius: 50%;
          font-size: 10px;
          font-weight: 600;
        }
        
        .stage-tab.active .stage-number {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .stage-tab.completed .stage-number {
          background: var(--color-success);
          color: #000;
        }
        
        .stage-label {
          font-weight: 500;
        }
        
        .stage-connector {
          color: var(--color-text-muted);
          font-size: 12px;
          padding: 0 4px;
        }
        
        .tabs-bar {
          display: flex;
          align-items: center;
          height: 36px;
          background: var(--color-bg-secondary);
          border-bottom: 1px solid var(--color-border);
          padding: 0 4px;
          gap: 2px;
        }
        
        .tab {
          display: flex;
          align-items: center;
          height: 28px;
          padding: 0 8px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-sm) var(--radius-sm) 0 0;
          font-size: 12px;
          gap: 6px;
          cursor: pointer;
          max-width: 160px;
        }
        
        .tab:hover {
          background: var(--color-bg-elevated);
        }
        
        .tab.active {
          background: var(--color-bg-primary);
        }
        
        .tab-name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .tab-modified {
          color: var(--color-accent);
          font-size: 10px;
        }
        
        .tab-close {
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          font-size: 14px;
          opacity: 0;
        }
        
        .tab:hover .tab-close {
          opacity: 1;
        }
        
        .tab-close:hover {
          background: var(--color-border);
        }
        
        .new-tab {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          font-size: 18px;
          color: var(--color-text-muted);
        }
        
        .new-tab:hover {
          background: var(--color-bg-tertiary);
          color: var(--color-text-primary);
        }
        
        .panel-content {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        
        .terminal-panel {
          height: 250px;
          border-top: 1px solid var(--color-border);
          background: var(--color-bg-primary);
        }
        
        .explorer-panel {
          display: flex;
          flex: 1;
          overflow: hidden;
        }
        
        .explorer-sidebar {
          width: 250px;
          border-right: 1px solid var(--color-border);
        }
        
        .explorer-editor {
          flex: 1;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}