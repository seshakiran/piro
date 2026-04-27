/**
 * SettingsPanel - Configuration and Model Selection
 */

import React, { useState } from 'react';
import { PiroAPI } from '../api/piro-client';

interface SettingsPanelProps {
  api: PiroAPI | null;
}

const modelProviders = [
  { id: 'minimax', name: 'MiniMax', models: ['MiniMax-M2.7', 'MiniMax-M2', 'MiniMax-M1.5'] },
  { id: 'anthropic', name: 'Anthropic', models: ['claude-sonnet-4.5', 'claude-opus-4', 'claude-sonnet-4', 'claude-haiku-3.5'] },
  { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'] },
  { id: 'google', name: 'Google', models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'] },
  { id: 'custom', name: 'Custom', models: ['Custom Model'] },
];

export function SettingsPanel({ }: SettingsPanelProps) {
  const [provider, setProvider] = useState('minimax');
  const [model, setModel] = useState('MiniMax-M2.7');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  
  const searchModels = (query: string) => {
    // In real implementation, this would search via pi
    console.log('Searching models:', query);
  };
  
  return (
    <div className="settings-panel">
      <div className="panel-header">
        <h2>Settings</h2>
        <p className="subtitle">Configure Piro for your workflow</p>
      </div>
      
      <div className="settings-content">
        <section className="settings-section">
          <h3>🤖 Model Selection</h3>
          <p className="section-desc">Choose your AI model provider</p>
          
          <div className="provider-grid">
            {modelProviders.map(p => (
              <div key={p.id} className={`provider-card ${provider === p.id ? 'selected' : ''}`} onClick={() => setProvider(p.id)}>
                <span className="provider-name">{p.name}</span>
              </div>
            ))}
          </div>
          
          <div className="model-search">
            <div className="search-box">
              <span>🔍</span>
              <input type="text" placeholder="Search models..." onKeyDown={e => e.key === 'Enter' && searchModels(e.currentTarget.value)} />
            </div>
            <select value={model} onChange={e => setModel(e.target.value)}>
              {modelProviders.find(p => p.id === provider)?.models.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </section>
        
        <section className="settings-section">
          <h3>🔑 API Configuration</h3>
          
          <div className="field">
            <label>API Key</label>
            <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Enter your API key..." />
          </div>
          
          {provider === 'custom' && (
            <div className="field">
              <label>Base URL</label>
              <input type="text" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} placeholder="https://api.example.com/v1" />
            </div>
          )}
        </section>
        
        <section className="settings-section">
          <h3>⚡ Pi Integration</h3>
          <div className="feature-list">
            <label className="feature-item">
              <input type="checkbox" defaultChecked /> Enable Pi Session
              <span className="feature-desc">Use Pi agent harness for advanced capabilities</span>
            </label>
            <label className="feature-item">
              <input type="checkbox" defaultChecked /> Auto-connect
              <span className="feature-desc">Automatically connect on startup</span>
            </label>
            <label className="feature-item">
              <input type="checkbox" defaultChecked /> Streaming Responses
              <span className="feature-desc">Stream AI responses in real-time</span>
            </label>
          </div>
        </section>
        
        <section className="settings-section">
          <h3>🎨 Appearance</h3>
          <div className="field">
            <label>Theme</label>
            <select defaultValue="dark">
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </select>
          </div>
          <div className="field">
            <label>Font Size</label>
            <select defaultValue="14">
              <option value="12">12px</option>
              <option value="14">14px</option>
              <option value="16">16px</option>
              <option value="18">18px</option>
            </select>
          </div>
        </section>
        
        <section className="settings-section">
          <h3>🔌 MCP Integration</h3>
          <p className="section-desc">Model Context Protocol for external tools</p>
          <button className="add-mcp-btn">+ Add MCP Server</button>
        </section>
        
        <button className="save-btn">Save Settings</button>
      </div>
      
      <style>{`
        .settings-panel { display: flex; flex-direction: column; height: 100%; padding: 24px; overflow-y: auto; }
        .panel-header h2 { font-size: 24px; margin-bottom: 8px; }
        .subtitle { color: var(--color-text-secondary); margin-bottom: 24px; }
        
        .settings-content { display: flex; flex-direction: column; gap: 32px; max-width: 700px; }
        
        .settings-section h3 { font-size: 16px; margin-bottom: 8px; }
        .section-desc { font-size: 12px; color: var(--color-text-muted); margin-bottom: 16px; }
        
        .provider-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 16px; }
        .provider-card { padding: 12px; background: var(--color-bg-secondary); border-radius: var(--radius-md); text-align: center; cursor: pointer; border: 2px solid transparent; font-size: 13px; }
        .provider-card:hover { background: var(--color-bg-tertiary); }
        .provider-card.selected { border-color: var(--color-accent); background: rgba(124,92,255,0.1); }
        
        .model-search { display: flex; gap: 12px; }
        .search-box { flex: 1; display: flex; align-items: center; gap: 8px; padding: 0 12px; background: var(--color-bg-secondary); border-radius: var(--radius-md); }
        .search-box input { flex: 1; border: none; background: transparent; padding: 10px 0; }
        .model-search select { width: 200px; padding: 10px; background: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
        
        .field { margin-bottom: 16px; }
        .field label { display: block; font-size: 12px; margin-bottom: 6px; color: var(--color-text-secondary); }
        .field input, .field select { width: 100%; padding: 10px; background: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
        
        .feature-list { display: flex; flex-direction: column; gap: 12px; }
        .feature-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--color-bg-secondary); border-radius: var(--radius-md); cursor: pointer; }
        .feature-item input { width: 18px; height: 18px; }
        .feature-item span:first-of-type { flex: 1; }
        .feature-desc { font-size: 11px; color: var(--color-text-muted); }
        
        .add-mcp-btn { padding: 10px; background: var(--color-bg-tertiary); border-radius: var(--radius-md); font-size: 13px; }
        .add-mcp-btn:hover { background: var(--color-accent); color: white; }
        
        .save-btn { padding: 14px; background: var(--color-accent); color: white; border-radius: var(--radius-md); font-weight: 600; margin-top: 16px; }
      `}</style>
    </div>
  );
}