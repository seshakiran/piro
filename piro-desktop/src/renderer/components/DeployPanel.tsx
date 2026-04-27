/**
 * DeployPanel - Cloud deployment interface
 * AWS, GCP, Azure deployment
 */

import React, { useState } from 'react';
import { PiroAPI, Deployment, CloudProvider } from '../api/piro-client';

interface DeployPanelProps {
  api: PiroAPI | null;
}

type CloudType = 'aws' | 'gcp' | 'azure';

const cloudProviders: { id: CloudType; name: string; icon: string; color: string }[] = [
  { id: 'aws', name: 'AWS', icon: '🐦', color: '#ff9900' },
  { id: 'gcp', name: 'Google Cloud', icon: '🌐', color: '#4285f4' },
  { id: 'azure', name: 'Azure', icon: '☁️', color: '#0078d4' },
];

const deploymentTypes = [
  { id: 'ec2', name: 'EC2 Instance', description: 'Virtual server' },
  { id: 'lambda', name: 'Lambda Function', description: 'Serverless function' },
  { id: 'ecs', name: 'ECS Container', description: 'Container service' },
  { id: 's3', name: 'S3 Bucket', description: 'Static hosting' },
  { id: 'cloudrun', name: 'Cloud Run', description: 'Container service' },
  { id: 'gke', name: 'GKE Cluster', description: 'Kubernetes' },
  { id: 'aks', name: 'AKS Cluster', description: 'Kubernetes' },
  { id: 'container', name: 'Container Instance', description: 'Container instance' },
];

export function DeployPanel({ api }: DeployPanelProps) {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<CloudType>('aws');
  const [selectedType, setSelectedType] = useState('');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  
  const deploy = async () => {
    if (!api || !selectedType) return;
    
    setLoading(true);
    setOutput(null);
    
    try {
      const result = await api.deploy(selectedProvider, selectedType, {});
      setDeployments(d => [...d, result]);
      setOutput(`Deployed to ${selectedProvider.toUpperCase()} successfully`);
    } catch (error) {
      setOutput(`Error: ${error}`);
    }
    
    setLoading(false);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'var(--color-success)';
      case 'stopped': return 'var(--color-error)';
      case 'pending': return 'var(--color-warning)';
      default: return 'var(--color-text-muted)';
    }
  };
  
  return (
    <div className="deploy-panel">
      <div className="deploy-sidebar">
        <div className="deploy-sidebar-header">
          <h3>Cloud Deploy</h3>
        </div>
        
        <div className="provider-list">
          {cloudProviders.map(provider => (
            <div
              key={provider.id}
              className={`provider-item ${selectedProvider === provider.id ? 'active' : ''}`}
              onClick={() => setSelectedProvider(provider.id)}
            >
              <span className="provider-icon">{provider.icon}</span>
              <span className="provider-name">{provider.name}</span>
              <span 
                className="provider-indicator"
                style={{ background: provider.color }}
              />
            </div>
          ))}
        </div>
        
        <div className="deployments-list">
          <h4>Recent Deployments</h4>
          {deployments.map((deployment, i) => (
            <div key={i} className="deployment-item">
              <div className="deployment-info">
                <span className="deployment-name">{deployment.name}</span>
                <span className="deployment-target">{deployment.target}</span>
              </div>
              <span 
                className="deployment-status"
                style={{ background: getStatusColor(deployment.status) }}
              />
            </div>
          ))}
          
          {deployments.length === 0 && (
            <div className="deployments-empty">
              No deployments yet.
            </div>
          )}
        </div>
      </div>
      
      <div className="deploy-content">
        <div className="deploy-header">
          <h2>Deploy to {cloudProviders.find(p => p.id === selectedProvider)?.name}</h2>
        </div>
        
        <div className="deploy-form">
          <div className="form-section">
            <h3>Select Deployment Type</h3>
            <div className="deployment-types">
              {deploymentTypes.map(type => (
                <div
                  key={type.id}
                  className={`deployment-type ${selectedType === type.id ? 'selected' : ''}`}
                  onClick={() => setSelectedType(type.id)}
                >
                  <span className="type-name">{type.name}</span>
                  <span className="type-desc">{type.description}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-section">
            <h3>Configuration</h3>
            <div className="config-fields">
              <div className="field">
                <label>Region</label>
                <select defaultValue="">
                  <option value="" disabled>Select region</option>
                  {selectedProvider === 'aws' && (
                    <>
                      <option value="us-east-1">US East (N. Virginia)</option>
                      <option value="us-west-2">US West (Oregon)</option>
                      <option value="eu-west-1">EU (Ireland)</option>
                    </>
                  )}
                  {selectedProvider === 'gcp' && (
                    <>
                      <option value="us-central1">US Central (Iowa)</option>
                      <option value="us-east1">US East (South Carolina)</option>
                      <option value="europe-west1">Europe (Belgium)</option>
                    </>
                  )}
                  {selectedProvider === 'azure' && (
                    <>
                      <option value="eastus">East US</option>
                      <option value="westus2">West US 2</option>
                      <option value="westeurope">West Europe</option>
                    </>
                  )}
                </select>
              </div>
              
              <div className="field">
                <label>Instance Size</label>
                <select defaultValue="medium">
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
          </div>
          
          <button 
            className="deploy-btn"
            onClick={deploy}
            disabled={loading || !selectedType}
          >
            {loading ? 'Deploying...' : `Deploy to ${cloudProviders.find(p => p.id === selectedProvider)?.name}`}
          </button>
          
          {output && (
            <div className="deploy-output">
              <pre>{output}</pre>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .deploy-panel {
          display: flex;
          height: 100%;
          background: var(--color-bg-primary);
        }
        
        .deploy-sidebar {
          width: 240px;
          border-right: 1px solid var(--color-border);
          background: var(--color-bg-secondary);
          display: flex;
          flex-direction: column;
        }
        
        .deploy-sidebar-header {
          padding: 12px 16px;
          border-bottom: 1px solid var(--color-border);
        }
        
        .deploy-sidebar-header h3 {
          font-size: 14px;
          font-weight: 600;
        }
        
        .provider-list {
          padding: 8px;
        }
        
        .provider-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: var(--radius-md);
          cursor: pointer;
          margin-bottom: 4px;
        }
        
        .provider-item:hover {
          background: var(--color-bg-tertiary);
        }
        
        .provider-item.active {
          background: var(--color-accent);
        }
        
        .provider-icon {
          font-size: 20px;
        }
        
        .provider-name {
          flex: 1;
          font-size: 13px;
          font-weight: 500;
        }
        
        .provider-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        
        .deployments-list {
          flex: 1;
          padding: 12px;
          border-top: 1px solid var(--color-border);
          overflow-y: auto;
        }
        
        .deployments-list h4 {
          font-size: 11px;
          color: var(--color-text-muted);
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        
        .deployment-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px;
          border-radius: var(--radius-sm);
          margin-bottom: 4px;
        }
        
        .deployment-item:hover {
          background: var(--color-bg-tertiary);
        }
        
        .deployment-info {
          display: flex;
          flex-direction: column;
        }
        
        .deployment-name {
          font-size: 12px;
          font-weight: 500;
        }
        
        .deployment-target {
          font-size: 10px;
          color: var(--color-text-muted);
        }
        
        .deployment-status {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        
        .deployments-empty {
          font-size: 12px;
          color: var(--color-text-muted);
          text-align: center;
          padding: 16px;
        }
        
        .deploy-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }
        
        .deploy-header {
          margin-bottom: 24px;
        }
        
        .deploy-header h2 {
          font-size: 18px;
        }
        
        .deploy-form {
          background: var(--color-bg-secondary);
          padding: 24px;
          border-radius: var(--radius-lg);
        }
        
        .form-section {
          margin-bottom: 24px;
        }
        
        .form-section h3 {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 12px;
          color: var(--color-text-secondary);
        }
        
        .deployment-types {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 8px;
        }
        
        .deployment-type {
          padding: 12px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
          cursor: pointer;
          border: 1px solid transparent;
        }
        
        .deployment-type:hover {
          border-color: var(--color-border);
        }
        
        .deployment-type.selected {
          border-color: var(--color-accent);
          background: rgba(124, 92, 255, 0.1);
        }
        
        .type-name {
          display: block;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 4px;
        }
        
        .type-desc {
          font-size: 11px;
          color: var(--color-text-muted);
        }
        
        .config-fields {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        
        .field label {
          display: block;
          font-size: 12px;
          margin-bottom: 6px;
          color: var(--color-text-secondary);
        }
        
        .field select {
          width: 100%;
          padding: 8px 12px;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
        }
        
        .deploy-btn {
          width: 100%;
          padding: 14px;
          background: var(--color-accent);
          color: white;
          border-radius: var(--radius-md);
          font-size: 14px;
          font-weight: 600;
        }
        
        .deploy-btn:hover:not(:disabled) {
          background: var(--color-accent-hover);
        }
        
        .deploy-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .deploy-output {
          margin-top: 16px;
          padding: 12px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
        }
        
        .deploy-output pre {
          font-family: var(--font-mono);
          font-size: 12px;
          white-space: pre-wrap;
        }
      `}</style>
    </div>
  );
}