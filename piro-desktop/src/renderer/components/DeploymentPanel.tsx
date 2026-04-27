/**
 * DeploymentPanel - Deployment (SDLC Step 6)
 */

import React, { useState } from 'react';
import type { Stage } from '../App';

interface DeploymentPanelProps {
  api: any;
  workspacePath: string | null;
  currentProject: { id: string; name: string; stage: Stage } | null;
  setCurrentProject: (p: any) => void;
  addNotification: (t: any, ti: string, m: string) => void;
}

const providers = [
  { id: 'aws', name: 'AWS', icon: '☁️', color: '#ff9900' },
  { id: 'gcp', name: 'Google Cloud', icon: '🌐', color: '#4285f4' },
  { id: 'azure', name: 'Azure', icon: '🔷', color: '#0078d4' },
  { id: 'vercel', name: 'Vercel', icon: '▲', color: '#000' },
  { id: 'netlify', name: 'Netlify', icon: '⚡', color: '#00ad9f' },
];

export function DeploymentPanel({ addNotification }: DeploymentPanelProps) {
  const [selectedProvider, setSelectedProvider] = useState('vercel');
  const [deployments, setDeployments] = useState([
    { id: '1', name: 'Production', url: 'https://myapp.com', status: 'active', time: '2 hours ago' },
    { id: '2', name: 'Staging', url: 'https://staging.myapp.com', status: 'active', time: '1 day ago' },
  ]);
  
  const deploy = () => {
    addNotification('info', 'Deploying', 'Starting deployment...');
  };
  
  return (
    <div className="deployment-panel">
      <div className="panel-header">
        <h2>Deployment</h2>
        <p className="subtitle">Deploy your project to the cloud</p>
      </div>
      
      <div className="deploy-content">
        <div className="providers-section">
          <h3>Select Provider</h3>
          <div className="provider-grid">
            {providers.map(p => (
              <div key={p.id} className={`provider-card ${selectedProvider === p.id ? 'selected' : ''}`} onClick={() => setSelectedProvider(p.id)}>
                <span className="provider-icon" style={{ color: p.color }}>{p.icon}</span>
                <span className="provider-name">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="config-section">
          <h3>Deployment Config</h3>
          <div className="config-form">
            <div className="field">
              <label>Environment</label>
              <select defaultValue="production">
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
              </select>
            </div>
            <div className="field">
              <label>Region</label>
              <select defaultValue="us-east">
                <option value="us-east">US East (N. Virginia)</option>
                <option value="us-west">US West (Oregon)</option>
                <option value="eu-west">EU (Ireland)</option>
              </select>
            </div>
          </div>
        </div>
        
        <button className="deploy-btn" onClick={deploy}>🚀 Deploy Now</button>
        
        <div className="deployments-section">
          <h3>Recent Deployments</h3>
          <div className="deployment-list">
            {deployments.map(d => (
              <div key={d.id} className="deployment-item">
                <div className="deploy-info">
                  <span className="deploy-name">{d.name}</span>
                  <span className="deploy-url">{d.url}</span>
                </div>
                <div className="deploy-meta">
                  <span className="deploy-status">● {d.status}</span>
                  <span className="deploy-time">{d.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style>{`
        .deployment-panel { display: flex; flex-direction: column; height: 100%; padding: 24px; overflow-y: auto; }
        .panel-header h2 { font-size: 24px; margin-bottom: 8px; }
        .subtitle { color: var(--color-text-secondary); margin-bottom: 24px; }
        .deploy-content { display: flex; flex-direction: column; gap: 24px; max-width: 900px; }
        
        .providers-section h3, .config-section h3, .deployments-section h3 { font-size: 14px; margin-bottom: 12px; }
        
        .provider-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
        .provider-card { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 20px; background: var(--color-bg-secondary); border-radius: var(--radius-lg); cursor: pointer; border: 2px solid transparent; }
        .provider-card:hover { background: var(--color-bg-tertiary); }
        .provider-card.selected { border-color: var(--color-accent); background: rgba(124,92,255,0.1); }
        .provider-icon { font-size: 28px; }
        .provider-name { font-size: 12px; font-weight: 500; }
        
        .config-form { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .field label { display: block; font-size: 12px; margin-bottom: 6px; color: var(--color-text-secondary); }
        .field select { width: 100%; padding: 10px; background: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); }
        
        .deploy-btn { padding: 14px; background: var(--color-accent); color: white; border-radius: var(--radius-md); font-weight: 600; font-size: 14px; }
        
        .deployment-list { display: flex; flex-direction: column; gap: 8px; }
        .deployment-item { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--color-bg-secondary); border-radius: var(--radius-md); }
        .deploy-info { display: flex; flex-direction: column; gap: 4px; }
        .deploy-name { font-weight: 600; }
        .deploy-url { font-size: 12px; color: var(--color-accent); }
        .deploy-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
        .deploy-status { font-size: 12px; color: var(--color-success); }
        .deploy-time { font-size: 11px; color: var(--color-text-muted); }
      `}</style>
    </div>
  );
}