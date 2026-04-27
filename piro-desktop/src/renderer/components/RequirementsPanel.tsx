/**
 * RequirementsPanel - Requirements gathering (SDLC Step 1)
 */

import React, { useState } from 'react';
import type { Stage } from '../App';

interface RequirementsPanelProps {
  api: any;
  workspacePath: string | null;
  currentProject: { id: string; name: string; description: string; stage: Stage } | null;
  setCurrentProject: (project: any) => void;
  addNotification: (type: any, title: string, message: string) => void;
}

export function RequirementsPanel({ currentProject, addNotification }: RequirementsPanelProps) {
  const [requirements, setRequirements] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  
  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature]);
      setNewFeature('');
    }
  };
  
  const useAI = async () => {
    if (!requirements.trim()) {
      addNotification('warning', 'No Input', 'Describe your requirements first');
      return;
    }
    addNotification('info', 'AI Analysis', 'Generating requirements with AI...');
    // In real implementation, this would call the API
  };
  
  return (
    <div className="requirements-panel">
      <div className="panel-header">
        <h2>Requirements Gathering</h2>
        <p className="subtitle">Define what your project should do</p>
      </div>
      
      <div className="requirements-content">
        <div className="input-section">
          <h3>Describe Your Requirements</h3>
          <textarea
            value={requirements}
            onChange={e => setRequirements(e.target.value)}
            placeholder="Describe the features and functionality you want..."
            rows={6}
          />
          <button className="ai-btn" onClick={useAI}>
            <span>🤖</span> Generate Requirements with AI
          </button>
        </div>
        
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
                <span>{feature}</span>
                <button onClick={() => setFeatures(f => f.filter((_, idx) => idx !== i))}>×</button>
              </div>
            ))}
            {features.length === 0 && (
              <p className="empty-text">Add features or use AI to generate them</p>
            )}
          </div>
        </div>
        
        <div className="ears-section">
          <h3>EARS Requirements</h3>
          <p className="help-text">Enhanced Arithmetic Requirements Specification</p>
          
          <div className="ears-form">
            <div className="ear-type">
              <label>U - Undefined (What it should do)</label>
              <textarea placeholder="The system shall..." rows={2} />
            </div>
            <div className="ear-type">
              <label>S - Scope (Boundaries)</label>
              <textarea placeholder="Scope: ..." rows={2} />
            </div>
            <div className="ear-type">
              <label>C - Constraints (Limitations)</label>
              <textarea placeholder="Constraint: ..." rows={2} />
            </div>
            <div className="ear-type">
              <label>Q - Quality (Non-functional)</label>
              <textarea placeholder="Quality: ..." rows={2} />
            </div>
          </div>
        </div>
        
        <button className="save-btn">Save Requirements</button>
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
          max-width: 800px;
        }
        
        .input-section h3, .features-section h3, .ears-section h3 {
          font-size: 16px;
          margin-bottom: 12px;
        }
        
        .input-section textarea {
          width: 100%;
          margin-bottom: 12px;
        }
        
        .ai-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
          font-weight: 500;
        }
        
        .ai-btn:hover {
          background: var(--color-accent);
          color: white;
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
        
        .feature-item button {
          margin-left: auto;
          color: var(--color-text-muted);
        }
        
        .empty-text {
          color: var(--color-text-muted);
          font-size: 13px;
          padding: 16px;
          text-align: center;
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
          display: block;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 6px;
          color: var(--color-accent);
        }
        
        .ear-type textarea {
          width: 100%;
        }
        
        .save-btn {
          padding: 14px;
          background: var(--color-accent);
          color: white;
          border-radius: var(--radius-md);
          font-weight: 600;
          margin-top: 16px;
        }
      `}</style>
    </div>
  );
}