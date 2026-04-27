/**
 * RequirementsPanel - Requirements gathering (SDLC Step 1)
 * Functional with AI integration
 */

import React, { useState, useEffect } from 'react';
import type { Stage } from '../App';
import { PiroAPI, Spec, Requirement } from '../api/piro-client';

interface RequirementsPanelProps {
  api: PiroAPI | null;
  workspacePath: string | null;
  currentProject: { id: string; name: string; description: string; stage: Stage; spec?: Spec } | null;
  setCurrentProject: (project: any) => void;
  addNotification: (type: 'info' | 'warning' | 'error' | 'success', title: string, message: string) => void;
}

export function RequirementsPanel({ api, currentProject, setCurrentProject, addNotification }: RequirementsPanelProps) {
  const [requirements, setRequirements] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSpec, setGeneratedSpec] = useState<Spec | null>(null);
  
  // Local EARS requirements
  const [earRequirements, setEarRequirements] = useState<Requirement[]>([
    { type: 'U', text: '' },
    { type: 'S', text: '' },
    { type: 'C', text: '' },
    { type: 'Q', text: '' },
  ]);
  
  useEffect(() => {
    if (currentProject?.spec) {
      setGeneratedSpec(currentProject.spec);
      setEarRequirements(currentProject.spec.requirements || earRequirements);
    }
  }, [currentProject]);
  
  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature]);
      setNewFeature('');
    }
  };
  
  const removeFeature = (index: number) => {
    setFeatures(f => f.filter((_, i) => i !== index));
  };
  
  // Generate requirements using AI
  const useAI = async () => {
    if (!requirements.trim()) {
      addNotification('warning', 'No Input', 'Describe your requirements first');
      return;
    }
    
    setIsGenerating(true);
    addNotification('info', 'AI Analysis', 'Analyzing requirements and converting to EARS notation...');
    
    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate spec via API
      const spec = await api!.generateSpec(requirements);
      
      setGeneratedSpec(spec);
      setEarRequirements(spec.requirements || earRequirements);
      
      // Update project
      setCurrentProject({
        ...currentProject,
        spec,
        stage: 'requirements',
      });
      
      addNotification('success', 'Spec Generated', `Created spec with ${spec.tasks?.length || 0} tasks`);
    } catch (error) {
      console.error('Failed to generate spec:', error);
      addNotification('error', 'Generation Failed', 'Could not generate specification');
    }
    
    setIsGenerating(false);
  };
  
  const updateEarRequirement = (index: number, text: string) => {
    const updated = [...earRequirements];
    updated[index].text = text;
    setEarRequirements(updated);
  };
  
  const saveRequirements = () => {
    const filteredEars = earRequirements.filter(r => r.text.trim());
    
    const spec: Spec = {
      id: generatedSpec?.id || Date.now().toString(),
      title: currentProject?.name || 'Project',
      description: requirements,
      requirements: filteredEars,
      tasks: generatedSpec?.tasks || [
        { id: 't1', title: 'Analyze requirements', description: 'Review all requirements for clarity', role: 'architect', status: 'pending' },
        { id: 't2', title: 'Create acceptance criteria', description: 'Define clear acceptance criteria for each feature', role: 'architect', status: 'pending' },
        { id: 't3', title: 'Break into tasks', description: 'Decompose requirements into actionable tasks', role: 'architect', status: 'pending' },
      ],
      status: 'review',
      createdAt: new Date(),
    };
    
    setGeneratedSpec(spec);
    setCurrentProject({
      ...currentProject,
      spec,
      stage: 'requirements',
    });
    
    addNotification('success', 'Requirements Saved', 'Requirements saved for review');
  };
  
  const approveRequirements = () => {
    if (!generatedSpec) return;
    
    const approved = { ...generatedSpec, status: 'approved' as const };
    setGeneratedSpec(approved);
    setCurrentProject({
      ...currentProject,
      spec: approved,
      stage: 'system-design',
    });
    
    addNotification('success', 'Requirements Approved', 'Proceeding to System Design');
  };
  
  return (
    <div className="requirements-panel">
      <div className="panel-header">
        <h2>Requirements Gathering</h2>
        <p className="subtitle">Define what your {currentProject?.name || 'project'} should do</p>
      </div>
      
      <div className="requirements-content">
        {/* Describe requirements section */}
        <div className="input-section">
          <h3>Describe Your Requirements</h3>
          <textarea
            value={requirements}
            onChange={e => setRequirements(e.target.value)}
            placeholder="The system should allow users to register, login, and manage their profiles with secure authentication..."
            rows={6}
          />
          
          <div className="ai-actions">
            <button className="ai-btn" onClick={useAI} disabled={isGenerating || !requirements.trim()}>
              {isGenerating ? (
                <>
                  <span className="spinner">⟳</span>
                  AI Analyzing...
                </>
              ) : (
                <>
                  <span>🤖</span> Generate with AI
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Key Features */}
        <div className="features-section">
          <h3>Key Features</h3>
          <div className="feature-input">
            <input
              type="text"
              value={newFeature}
              onChange={e => setNewFeature(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addFeature()}
              placeholder="Add a feature..."
            />
            <button onClick={addFeature}>+</button>
          </div>
          <div className="features-list">
            {features.map((feature, i) => (
              <div key={i} className="feature-item">
                <span className="feature-bullet">•</span>
                <span className="feature-text">{feature}</span>
                <button className="feature-remove" onClick={() => removeFeature(i)}>×</button>
              </div>
            ))}
            {features.length === 0 && (
              <p className="empty-hint">Add features or use AI to generate them</p>
            )}
          </div>
        </div>
        
        {/* EARS Requirements */}
        <div className="ears-section">
          <div className="ears-header">
            <h3>EARS Requirements</h3>
            <a href="https://kiro.dev/docs/specs/ears" target="_blank" className="ears-help">What's this?</a>
          </div>
          <p className="help-text">Enhanced Arithmetic Requirements Specification</p>
          
          <div className="ears-form">
            <div className="ear-type">
              <label>
                <span className="ear-label">U</span>
                Undefined - What the feature should do
              </label>
              <textarea 
                value={earRequirements[0].text}
                onChange={e => updateEarRequirement(0, e.target.value)}
                placeholder="The system shall..."
                rows={2}
              />
            </div>
            
            <div className="ear-type">
              <label>
                <span className="ear-label">S</span>
                Scope - Boundary conditions
              </label>
              <textarea 
                value={earRequirements[1].text}
                onChange={e => updateEarRequirement(1, e.target.value)}
                placeholder="Scope: ..."
                rows={2}
              />
            </div>
            
            <div className="ear-type">
              <label>
                <span className="ear-label">C</span>
                Constraint - Limitations
              </label>
              <textarea 
                value={earRequirements[2].text}
                onChange={e => updateEarRequirement(2, e.target.value)}
                placeholder="Constraint: ..."
                rows={2}
              />
            </div>
            
            <div className="ear-type">
              <label>
                <span className="ear-label">Q</span>
                Quality - Non-functional requirements
              </label>
              <textarea 
                value={earRequirements[3].text}
                onChange={e => updateEarRequirement(3, e.target.value)}
                placeholder="Quality: ..."
                rows={2}
              />
            </div>
          </div>
        </div>
        
        {/* Generated Spec Preview */}
        {generatedSpec && (
          <div className="generated-spec">
            <div className="spec-header">
              <h3>Generated Specification</h3>
              <span className={`spec-status ${generatedSpec.status}`}>{generatedSpec.status}</span>
            </div>
            
            <div className="spec-section">
              <h4>Requirements</h4>
              {generatedSpec.requirements?.map((req, i) => (
                <div key={i} className="spec-req">
                  <span className="req-type">{req.type}</span>
                  <span>{req.text}</span>
                </div>
              ))}
            </div>
            
            <div className="spec-section">
              <h4>Task Breakdown ({generatedSpec.tasks?.length || 0} tasks)</h4>
              <div className="task-list">
                {generatedSpec.tasks?.map((task, i) => (
                  <div key={i} className={`task-item ${task.status}`}>
                    <span className="task-num">{i + 1}</span>
                    <div className="task-info">
                      <span className="task-title">{task.title}</span>
                      <span className="task-role">{task.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="save-btn" onClick={saveRequirements}>
            💾 Save Requirements
          </button>
          
          {generatedSpec?.status === 'review' && (
            <button className="approve-btn" onClick={approveRequirements}>
              ✓ Approve & Continue to System Design
            </button>
          )}
        </div>
        
        {/* Chat Hint */}
        <div className="chat-tip">
          <span className="tip-icon">💡</span>
          <div>
            <strong>Pro Tip:</strong> You can also create requirements directly in Chat by typing:
            <code>"generate spec user authentication system"</code>
          </div>
        </div>
      </div>
      
      <style>{`
        .requirements-panel {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 24px;
          overflow-y: auto;
        }
        
        .panel-header h2 {
          font-size: 24px;
          margin-bottom: 8px;
        }
        
        .subtitle {
          color: var(--color-text-secondary);
          margin-bottom: 24px;
        }
        
        .requirements-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 900px;
        }
        
        .input-section h3, .features-section h3, .ears-section h3 {
          font-size: 16px;
          margin-bottom: 12px;
        }
        
        .input-section textarea {
          width: 100%;
          margin-bottom: 12px;
        }
        
        .ai-actions {
          display: flex;
          gap: 12px;
        }
        
        .ai-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: var(--color-accent);
          color: white;
          border-radius: var(--radius-md);
          font-weight: 500;
        }
        
        .ai-btn:hover:not(:disabled) {
          background: var(--color-accent-hover);
        }
        
        .ai-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .spinner {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .feature-input {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }
        
        .feature-input input {
          flex: 1;
        }
        
        .feature-input button {
          padding: 8px 16px;
          background: var(--color-accent);
          color: white;
          border-radius: var(--radius-md);
        }
        
        .features-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .feature-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-md);
        }
        
        .feature-bullet {
          color: var(--color-accent);
        }
        
        .feature-text {
          flex: 1;
        }
        
        .feature-remove {
          color: var(--color-text-muted);
          font-size: 18px;
        }
        
        .feature-remove:hover {
          color: var(--color-error);
        }
        
        .empty-hint {
          color: var(--color-text-muted);
          font-size: 13px;
          padding: 16px;
          text-align: center;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-md);
        }
        
        .ears-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        
        .ears-help {
          font-size: 12px;
        }
        
        .help-text {
          font-size: 12px;
          color: var(--color-text-muted);
          margin-bottom: 16px;
        }
        
        .ears-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .ear-type label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 6px;
        }
        
        .ear-label {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: var(--color-accent);
          color: white;
          border-radius: 50%;
          font-size: 12px;
          font-weight: bold;
        }
        
        .ear-type textarea {
          width: 100%;
        }
        
        .generated-spec {
          background: var(--color-bg-secondary);
          border-radius: var(--radius-lg);
          padding: 20px;
        }
        
        .spec-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        
        .spec-header h3 {
          margin: 0;
        }
        
        .spec-status {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          text-transform: uppercase;
        }
        
        .spec-status.draft {
          background: var(--color-bg-tertiary);
        }
        
        .spec-status.review {
          background: var(--color-warning);
          color: #000;
        }
        
        .spec-status.approved {
          background: var(--color-success);
          color: #000;
        }
        
        .spec-section {
          margin-top: 16px;
        }
        
        .spec-section h4 {
          font-size: 12px;
          color: var(--color-text-muted);
          margin-bottom: 8px;
        }
        
        .spec-req {
          display: flex;
          gap: 12px;
          padding: 8px 12px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-sm);
          margin-bottom: 6px;
        }
        
        .req-type {
          font-weight: bold;
          color: var(--color-accent);
        }
        
        .task-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .task-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
        }
        
        .task-num {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-primary);
          border-radius: 50%;
          font-size: 12px;
          font-weight: bold;
        }
        
        .task-info {
          display: flex;
          flex-direction: column;
        }
        
        .task-title {
          font-weight: 500;
          font-size: 13px;
        }
        
        .task-role {
          font-size: 11px;
          color: var(--color-text-muted);
          text-transform: capitalize;
        }
        
        .action-buttons {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }
        
        .save-btn {
          padding: 12px 24px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
          font-weight: 500;
        }
        
        .save-btn:hover {
          background: var(--color-accent);
          color: white;
        }
        
        .approve-btn {
          padding: 12px 24px;
          background: var(--color-success);
          color: #000;
          border-radius: var(--radius-md);
          font-weight: 600;
        }
        
        .approve-btn:hover {
          background: #4de07a;
        }
        
        .chat-tip {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-lg);
          margin-top: 16px;
        }
        
        .tip-icon {
          font-size: 20px;
        }
        
        .chat-tip strong {
          display: block;
          margin-bottom: 4px;
        }
        
        .chat-tip code {
          display: block;
          padding: 4px 8px;
          background: var(--color-bg-tertiary);
          border-radius: 4px;
          font-size: 12px;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
}