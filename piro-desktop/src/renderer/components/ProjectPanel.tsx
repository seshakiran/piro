/**
 * ProjectPanel - Project setup and management
 */

import React, { useState } from 'react';
import { PiroAPI } from '../api/piro-client';
import type { Stage } from '../App';

interface ProjectPanelProps {
  api: PiroAPI | null;
  workspacePath: string | null;
  currentProject: { id: string; name: string; description: string; stage: Stage } | null;
  setCurrentProject: (project: { id: string; name: string; description: string; stage: Stage } | null) => void;
  onProjectCreate: (name: string, description: string) => void;
  addNotification: (type: 'info' | 'warning' | 'error' | 'success', title: string, message: string) => void;
}

export function ProjectPanel({ currentProject, setCurrentProject, onProjectCreate, addNotification }: ProjectPanelProps) {
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectType, setProjectType] = useState('web');
  
  const projectTypes = [
    { id: 'web', name: 'Web Application', icon: '🌐' },
    { id: 'mobile', name: 'Mobile App', icon: '📱' },
    { id: 'api', name: 'API/Backend', icon: '🔌' },
    { id: 'cli', name: 'CLI Tool', icon: '💻' },
    { id: 'library', name: 'Library/Package', icon: '📦' },
    { id: 'custom', name: 'Custom', icon: '🔧' },
  ];
  
  const handleCreate = () => {
    if (!projectName.trim()) {
      addNotification('error', 'Invalid Name', 'Please enter a project name');
      return;
    }
    onProjectCreate(projectName, projectDesc);
  };
  
  const recentProjects = [
    { id: '1', name: 'E-commerce Platform', lastOpened: '2 hours ago' },
    { id: '2', name: 'Task Management API', lastOpened: 'Yesterday' },
    { id: '3', name: 'Mobile App MVP', lastOpened: '3 days ago' },
  ];
  
  return (
    <div className="project-panel">
      {!currentProject ? (
        <>
          <div className="create-project-section">
            <h2>Create New Project</h2>
            <p className="subtitle">Start a new project to begin the SDLC workflow</p>
            
            <div className="project-type-grid">
              {projectTypes.map(type => (
                <div
                  key={type.id}
                  className={`project-type-card ${projectType === type.id ? 'selected' : ''}`}
                  onClick={() => setProjectType(type.id)}
                >
                  <span className="type-icon">{type.icon}</span>
                  <span className="type-name">{type.name}</span>
                </div>
              ))}
            </div>
            
            <div className="form-group">
              <label>Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                placeholder="Enter project name..."
              />
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={projectDesc}
                onChange={e => setProjectDesc(e.target.value)}
                placeholder="Describe what you want to build..."
                rows={4}
              />
            </div>
            
            <button className="create-btn" onClick={handleCreate}>
              Create Project
            </button>
          </div>
          
          <div className="recent-projects-section">
            <h3>Recent Projects</h3>
            <div className="recent-list">
              {recentProjects.map(project => (
                <div key={project.id} className="recent-item">
                  <span className="recent-icon">📁</span>
                  <div className="recent-info">
                    <span className="recent-name">{project.name}</span>
                    <span className="recent-time">{project.lastOpened}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="project-dashboard">
          <div className="dashboard-header">
            <h2>{currentProject.name}</h2>
            <p>{currentProject.description || 'No description provided'}</p>
          </div>
          
          <div className="sdlc-overview">
            <h3>SDLC Progress</h3>
            <div className="sdlc-steps">
              {['Project Setup', 'Requirements', 'System Design', 'Tech Design', 'Development', 'Testing', 'Deployment'].map((step, index) => (
                <div key={step} className={`sdlc-step ${index <= ['project', 'requirements', 'system-design', 'tech-design', 'development', 'testing', 'deployment'].indexOf(currentProject.stage) ? 'completed' : ''} ${index === ['project', 'requirements', 'system-design', 'tech-design', 'development', 'testing', 'deployment'].indexOf(currentProject.stage) ? 'current' : ''}`}>
                  <div className="step-marker">{index + 1}</div>
                  <div className="step-label">{step}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="actions-grid">
              <button className="action-card" onClick={() => addNotification('info', 'Open Folder', 'Open folder dialog')}>
                <span className="action-icon">📂</span>
                <span className="action-label">Open Folder</span>
              </button>
              <button className="action-card">
                <span className="action-icon">📋</span>
                <span className="action-label">New Spec</span>
              </button>
              <button className="action-card">
                <span className="action-icon">🤖</span>
                <span className="action-label">Run Agent</span>
              </button>
              <button className="action-card">
                <span className="action-icon">⚡</span>
                <span className="action-label">Power Tools</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        .project-panel {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 24px;
          overflow-y: auto;
          gap: 32px;
        }
        
        .create-project-section {
          max-width: 600px;
          margin: 0 auto;
          width: 100%;
        }
        
        .create-project-section h2 {
          font-size: 24px;
          margin-bottom: 8px;
        }
        
        .subtitle {
          color: var(--color-text-secondary);
          margin-bottom: 24px;
        }
        
        .project-type-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        
        .project-type-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-lg);
          cursor: pointer;
          border: 2px solid transparent;
          transition: all var(--transition-fast);
        }
        
        .project-type-card:hover {
          background: var(--color-bg-tertiary);
        }
        
        .project-type-card.selected {
          border-color: var(--color-accent);
          background: rgba(124, 92, 255, 0.1);
        }
        
        .type-icon {
          font-size: 28px;
        }
        
        .type-name {
          font-size: 12px;
          font-weight: 500;
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
        
        .form-group input, .form-group textarea {
          width: 100%;
        }
        
        .create-btn {
          width: 100%;
          padding: 14px;
          background: var(--color-accent);
          color: white;
          border-radius: var(--radius-md);
          font-size: 14px;
          font-weight: 600;
        }
        
        .create-btn:hover {
          background: var(--color-accent-hover);
        }
        
        .recent-projects-section {
          max-width: 600px;
          margin: 0 auto;
          width: 100%;
        }
        
        .recent-projects-section h3 {
          font-size: 14px;
          margin-bottom: 12px;
          color: var(--color-text-secondary);
        }
        
        .recent-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .recent-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-md);
          cursor: pointer;
        }
        
        .recent-item:hover {
          background: var(--color-bg-tertiary);
        }
        
        .recent-icon {
          font-size: 20px;
        }
        
        .recent-info {
          display: flex;
          flex-direction: column;
        }
        
        .recent-name {
          font-weight: 500;
        }
        
        .recent-time {
          font-size: 11px;
          color: var(--color-text-muted);
        }
        
        .project-dashboard {
          flex: 1;
        }
        
        .dashboard-header h2 {
          font-size: 28px;
          margin-bottom: 8px;
        }
        
        .dashboard-header p {
          color: var(--color-text-secondary);
        }
        
        .sdlc-overview {
          margin: 32px 0;
          padding: 24px;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-lg);
        }
        
        .sdlc-overview h3 {
          font-size: 14px;
          margin-bottom: 16px;
          color: var(--color-text-secondary);
        }
        
        .sdlc-steps {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
        }
        
        .sdlc-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          min-width: 80px;
        }
        
        .step-marker {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-tertiary);
          border-radius: 50%;
          font-weight: 600;
          font-size: 14px;
        }
        
        .sdlc-step.completed .step-marker {
          background: var(--color-success);
          color: #000;
        }
        
        .sdlc-step.current .step-marker {
          background: var(--color-accent);
          color: white;
        }
        
        .step-label {
          font-size: 11px;
          color: var(--color-text-muted);
          white-space: nowrap;
        }
        
        .sdlc-step.completed .step-label,
        .sdlc-step.current .step-label {
          color: var(--color-text-primary);
        }
        
        .quick-actions h3 {
          font-size: 14px;
          margin-bottom: 16px;
          color: var(--color-text-secondary);
        }
        
        .actions-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        
        .action-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 20px;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .action-card:hover {
          background: var(--color-bg-tertiary);
          transform: translateY(-2px);
        }
        
        .action-icon {
          font-size: 24px;
        }
        
        .action-label {
          font-size: 12px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}