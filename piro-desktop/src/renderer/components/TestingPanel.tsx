/**
 * TestingPanel - Testing (SDLC Step 5)
 */

import React, { useState } from 'react';
import type { Stage } from '../App';

interface TestingPanelProps {
  api: any;
  workspacePath: string | null;
  currentProject: { id: string; name: string; stage: Stage } | null;
  setCurrentProject: (p: any) => void;
  addNotification: (t: any, ti: string, m: string) => void;
}

export function TestingPanel({ addNotification }: TestingPanelProps) {
  const [testResults, setTestResults] = useState<{ name: string; status: string; time: string }[]>([
    { name: 'User Authentication', status: 'passed', time: '0.2s' },
    { name: 'API Endpoints', status: 'passed', time: '0.5s' },
    { name: 'Database Operations', status: 'passed', time: '0.3s' },
    { name: 'Error Handling', status: 'failed', time: '0.1s' },
  ]);
  
  const runTests = () => {
    addNotification('info', 'Running Tests', 'Executing test suite...');
  };
  
  const coverage = 78;
  
  return (
    <div className="testing-panel">
      <div className="panel-header">
        <h2>Testing</h2>
        <p className="subtitle">Quality assurance and test coverage</p>
      </div>
      
      <div className="test-content">
        <div className="test-actions">
          <button className="primary-btn" onClick={runTests}>▶ Run All Tests</button>
          <button className="secondary-btn" onClick={() => addNotification('info', 'AI', 'Generating tests...')}>🤖 Generate Tests</button>
        </div>
        
        <div className="coverage-section">
          <h3>Coverage</h3>
          <div className="coverage-bar">
            <div className="coverage-fill" style={{ width: `${coverage}%` }} />
            <span>{coverage}%</span>
          </div>
          <div className="coverage-details">
            <span>Statements: 85%</span>
            <span>Branches: 72%</span>
            <span>Functions: 80%</span>
            <span>Lines: 78%</span>
          </div>
        </div>
        
        <div className="results-section">
          <h3>Test Results</h3>
          <div className="test-list">
            {testResults.map((test, i) => (
              <div key={i} className={`test-item ${test.status}`}>
                <span className="test-icon">{test.status === 'passed' ? '✓' : '✗'}</span>
                <span className="test-name">{test.name}</span>
                <span className="test-time">{test.time}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="ai-analysis">
          <h3>AI Analysis</h3>
          <div className="analysis-card">
            <span className="analysis-icon">🤖</span>
            <p>Error handling test failed. The code throws a generic error instead of specific exceptions. Consider using custom error classes for better error handling.</p>
            <button onClick={() => addNotification('info', 'Fix Applied', 'Error handling has been fixed')}>Apply Fix</button>
          </div>
        </div>
      </div>
      
      <style>{`
        .testing-panel { display: flex; flex-direction: column; height: 100%; padding: 24px; overflow-y: auto; }
        .panel-header h2 { font-size: 24px; margin-bottom: 8px; }
        .subtitle { color: var(--color-text-secondary); margin-bottom: 24px; }
        
        .test-content { display: flex; flex-direction: column; gap: 24px; max-width: 900px; }
        
        .test-actions { display: flex; gap: 12px; }
        .primary-btn { padding: 12px 24px; background: var(--color-accent); color: white; border-radius: var(--radius-md); font-weight: 600; }
        .secondary-btn { padding: 12px 24px; background: var(--color-bg-tertiary); border-radius: var(--radius-md); }
        .secondary-btn:hover { background: var(--color-bg-elevated); }
        
        .coverage-section h3, .results-section h3, .ai-analysis h3 { font-size: 14px; margin-bottom: 12px; }
        
        .coverage-bar { height: 24px; background: var(--color-bg-tertiary); border-radius: var(--radius-md); position: relative; margin-bottom: 12px; }
        .coverage-fill { height: 100%; background: linear-gradient(90deg, var(--color-accent), var(--color-success)); border-radius: var(--radius-md); }
        .coverage-bar span { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 12px; font-weight: 600; }
        .coverage-details { display: flex; gap: 24px; font-size: 12px; color: var(--color-text-secondary); }
        
        .test-list { display: flex; flex-direction: column; gap: 8px; }
        .test-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--color-bg-secondary); border-radius: var(--radius-md); }
        .test-item.passed .test-icon { color: var(--color-success); }
        .test-item.failed .test-icon { color: var(--color-error); }
        .test-icon { font-size: 16px; }
        .test-name { flex: 1; }
        .test-time { font-size: 12px; color: var(--color-text-muted); }
        
        .analysis-card { background: var(--color-bg-secondary); padding: 16px; border-radius: var(--radius-lg); }
        .analysis-icon { font-size: 24px; }
        .analysis-card p { margin: 12px 0; font-size: 13px; line-height: 1.5; }
        .analysis-card button { padding: 8px 16px; background: var(--color-accent); color: white; border-radius: var(--radius-md); font-size: 12px; }
      `}</style>
    </div>
  );
}