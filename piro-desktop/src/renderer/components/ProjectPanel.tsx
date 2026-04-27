/**
 * ProjectPanel - Project setup and management
 * Functional project creation integrated with AI
 */

import React, { useState, useEffect } from 'react';
import { PiroAPI, Spec } from '../api/piro-client';
import type { Stage } from '../App';

interface ProjectPanelProps {
  api: PiroAPI | null;
  workspacePath: string | null;
  currentProject: { id: string; name: string; description: string; stage: Stage; spec?: Spec } | null;
  setCurrentProject: (project: { id: string; name: string; description: string; stage: Stage; spec?: Spec } | null) => void;
  onProjectCreate: (name: string, description: string) => void;
  addNotification: (type: 'info' | 'warning' | 'error' | 'success', title: string, message: string) => void;
}

export function ProjectPanel({ currentProject, setCurrentProject, onProjectCreate, addNotification }: ProjectPanelProps) {
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectType, setProjectType] = useState('web');
  const [isCreating, setIsCreating] = useState(false);
  
  const projectTypes = [
    { id: 'web', name: 'Web Application', icon: '🌐' },
    { id: 'mobile', name: 'Mobile App', icon: '📱' },
    { id: 'api', name: 'API/Backend', icon: '🔌' },
    { id: 'cli', name: 'CLI Tool', icon: '💻' },
    { id: 'library', name: 'Library/Package', icon: '📦' },
    { id: 'custom', name: 'Custom', icon: '🔧' },
  ];
  
  const recentProjects = [
    { id: '1', name: 'E-commerce Platform', lastOpened: '2 hours ago', status: 'in_progress' },
    { id: '2', name: 'Task Management API', lastOpened: 'Yesterday', status: 'completed' },
    { id: '3', name: 'Mobile App MVP', lastOpened: '3 days ago', status: 'draft' },
  ];
  
  const handleCreate = async () => {
    if (!projectName.trim()) {
      addNotification('error', 'Invalid Name', 'Please enter a project name');
      return;
    }
    
    setIsCreating(true);
    
    // Simulate AI processing
    addNotification('info', 'AI Analysis', 'Analyzing requirements and creating project structure...');
    
    // Simulate delay for AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onProjectCreate(projectName, projectDesc);
    setIsCreating(false);
  };
  
  const stageIndex = (stage: Stage): number => {
    const stages: Stage[] = ['project', 'requirements', 'system-design', 'tech-design', 'development', 'testing', 'deployment'];
    return stages.indexOf(stage);
  };
  
  return (
    <div className="project-panel">
      {!currentProject ? (
        <>
          <div className="create-project-section">
            <h2>Create New Project</h2>
            <p className="subtitle">Describe what you want to build in the chat, or fill in details below</p>
            
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
                placeholder="My Awesome Project"
              />
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={projectDesc}
                onChange={e => setProjectDesc(e.target.value)}
                placeholder="Describe what you want to build in detail..."
                rows={4}
              />
            </div>
            
            <button 
              className="create-btn" 
              onClick={handleCreate}
              disabled={isCreating || !projectName.trim()}
            >
              {isCreating ? (
                <>
                  <span className="spinner">⟳</span>
                  Creating Project...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  Create Project
                </>
              )}
            </button>
            
            <div className="or-divider">
              <span>OR</span>
            </div>
            
            <div className="chat-hint">
              <span className="hint-icon">💬</span>
              <div>
                <strong>Use Chat to create:</strong>
                <p>Type "create project a todo app with user auth" in the Chat panel</p>
              </div>
            </div>
          </div>
          
          <div className="recent-projects-section">
            <h3>Recent Projects</h3>
            <div className="recent-list">
              {recentProjects.map(project => (
                <div key={project.id} className="recent-item" onClick={() => {
                  addNotification('info', 'Opening Project', `Opening ${project.name}...`);
                }}>
                  <span className="recent-icon">📁</span>
                  <div className="recent-info">
                    <span className="recent-name">{project.name}</span>
                    <span className="recent-meta">
                      {project.lastOpened}
                      <span className={`status-badge ${project.status}`}>{project.status}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="project-dashboard">
          <div className="dashboard-header">
            <div className="project-title-section">
              <h2>{currentProject.name}</h2>
              <span className="project-type-badge">{projectType}</span>
            </div>
            <p>{currentProject.description || 'No description provided'}</p>
          </div>
          
          <div className="sdlc-overview">
            <h3>SDLC Progress</h3>
            <div className="sdlc-steps">
              {['Project Setup', 'Requirements', 'System Design', 'Tech Design', 'Development', 'Testing', 'Deployment'].map((step, index) => {
                const stages: Stage[] = ['project', 'requirements', 'system-design', 'tech-design', 'development', 'testing', 'deployment'];
                const currentIndex = stageIndex(currentProject.stage);
                const isCompleted = index < currentIndex;
                const isCurrent = index === currentIndex;
                
                return (
                  <div key={step} className={`sdlc-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                    <div className="step-marker">
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <div className="step-label">{step}</div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="project-spec-section">
            <h3>Project Specification</h3>
            {currentProject.spec ? (
              <div className="spec-preview">
                <div className="spec-status">
                  <span className="status-label">Status: {currentProject.spec.status}</span>
                </div>
                <div className="spec-requirements">
                  <h4>Requirements ({currentProject.spec.requirements?.length || 0})</h4>
                  {currentProject.spec.requirements?.map((req, i) => (
                    <div key={i} className="requirement-row">
                      <span className="req-type">{req.type}</span>
                      <span className="req-text">{req.text}</span>
                    </div>
                  ))}
                </div>
                <div className="spec-tasks">
                  <h4>Tasks ({currentProject.spec.tasks?.length || 0})</h4>
                  <div className="tasks-grid">
                    {currentProject.spec.tasks?.map((task, i) => (
                      <div key={i} className={`task-badge ${task.status}`}>
                        <span className="task-role">{task.role}</span>
                        <span className="task-title">{task.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-spec">
                <p>No spec generated yet. Go to Requirements stage to generate one.</p>
              </div>
            )}
          </div>
          
          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="actions-grid">
              <button className="action-card" onClick={() => addNotification('info', 'Open Folder', 'Opening folder dialog...')}>
                <span className="action-icon">📂</span>
                <span className="action-label">Open Folder</span>
              </button>
              <button className="action-card" onClick={() => addNotification('info', 'New Spec', 'Creating new specification...')}>
                <span className="action-icon">📋</span>
                <span className="action-label">Generate Spec</span>
              </button>
              <button className="action-card" onClick={() => addNotification('info', 'Run Agent', 'Opening agents panel...')}>
                <span className="action-icon">🤖</span>
                <span className="action-label">Run Agent</span>
              </button>
              <button className="action-card" onClick={() => addNotification('info', 'Settings', 'Opening settings...')}>
                <span className="action-icon">⚡</span>
                <span className="action-label">Power Tools</span>
              </button>
            </div>
          </div>
          
          <button className="delete-project-btn" onClick={() => setCurrentProject(null)}>
            Start New Project
          </button>
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
          font-size: 14px;
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
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .create-btn:hover:not(:disabled) {
          background: var(--color-accent-hover);
        }
        
        .create-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .spinner {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .or-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 24px 0;
          color: var(--color-text-muted);
          font-size: 12px;
        }
        
        .or-divider::before, .or-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--color-border);
        }
        
        .chat-hint {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-lg);
          border: 1px dashed var(--color-border);
        }
        
        .hint-icon {
          font-size: 24px;
        }
        
        .chat-hint strong {
          display: block;
          margin-bottom: 4px;
        }
        
        .chat-hint p {
          font-size: 12px;
          color: var(--color-text-muted);
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
          gap: 4px;
        }
        
        .recent-name {
          font-weight: 500;
        }
        
        .recent-meta {
          font-size: 11px;
          color: var(--color-text-muted);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .status-badge {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          text-transform: uppercase;
        }
        
        .status-badge.in_progress {
          background: var(--color-warning);
          color: #000;
        }
        
        .status-badge.completed {
          background: var(--color-success);
          color: #000;
        }
        
        .status-badge.draft {
          background: var(--color-bg-tertiary);
          color: var(--color-text-muted);
        }
        
        .project-dashboard {
          flex: 1;
        }
        
        .dashboard-header {
          margin-bottom: 24px;
        }
        
        .project-title-section {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        
        .dashboard-header h2 {
          font-size: 28px;
          margin: 0;
        }
        
        .project-type-badge {
          padding: 4px 12px;
          background: var(--color-accent);
          border-radius: 20px;
          font-size: 11px;
          text-transform: uppercase;
        }
        
        .dashboard-header p {
          color: var(--color-text-secondary);
        }
        
        .sdlc-overview {
          margin: 24px 0;
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
        
        .project-spec-section {
          margin: 24px 0;
          padding: 24px;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-lg);
        }
        
        .project-spec-section h3 {
          font-size: 14px;
          margin-bottom: 16px;
          color: var(--color-text-secondary);
        }
        
        .spec-preview {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .spec-status {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .status-label {
          padding: 4px 12px;
          background: var(--color-warning);
          color: #000;
          border-radius: 4px;
          font-size: 11px;
          text-transform: uppercase;
        }
        
        .spec-requirements h4, .spec-tasks h4 {
          font-size: 12px;
          margin-bottom: 8px;
          color: var(--color-text-muted);
        }
        
        .requirement-row {
          display: flex;
          gap: 12px;
          padding: 8px 12px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-sm);
          margin-bottom: 6px;
        }
        
        .req-type {
          font-family: var(--font-mono);
          font-weight: bold;
          color: var(--color-accent);
        }
        
        .req-text {
          font-size: 13px;
        }
        
        .tasks-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .task-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--color-bg-tertiary);
          border-radius: 20px;
          font-size: 12px;
        }
        
        .task-badge.completed {
          background: var(--color-success);
          color: #000;
        }
        
        .task-badge.in_progress {
          background: var(--color-warning);
          color: #000;
        }
        
        .task-role {
          font-size: 10px;
          text-transform: uppercase;
          opacity: 0.7;
        }
        
        .no-spec {
          padding: 24px;
          text-align: center;
          color: var(--color-text-muted);
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
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
        
        .delete-project-btn {
          margin-top: 24px;
          padding: 12px;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-md);
          font-size: 13px;
          color: var(--color-text-muted);
        }
        
        .delete-project-btn:hover {
          background: var(--color-error);
          color: white;
        }
      `}</style>
    </div>
  );
}