/**
 * Terminal - Simple terminal component
 * Integrated terminal for Piro Desktop
 */

import React, { useState } from 'react';

interface TerminalProps {
  onClose: () => void;
}

interface TerminalLine {
  type: 'input' | 'output' | 'error';
  content: string;
}

export function Terminal({ onClose }: TerminalProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: 'output', content: '╔════════════════════════════════════════╗' },
    { type: 'output', content: '║        Piro Terminal                  ║' },
    { type: 'output', content: '║   Kiro-compatible AI coding IDE     ║' },
    { type: 'output', content: '╚════════════════════════════════════════╝' },
    { type: 'output', content: '' },
    { type: 'output', content: 'Type a command and press Enter to execute' },
    { type: 'output', content: '' },
  ]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setHistory(h => [
      ...h,
      { type: 'input', content: `$ ${input}` },
      { type: 'output', content: `Executing: ${input}` },
      { type: 'output', content: '(Command execution - connect to Piro Core server)' },
      { type: 'output', content: '' },
    ]);
    setInput('');
  };
  
  return (
    <div className="terminal-wrapper">
      <div className="terminal-header">
        <span className="terminal-title">Terminal</span>
        <div className="terminal-actions">
          <button onClick={() => setHistory([])} title="Clear">⌫</button>
          <button onClick={onClose} title="Close">×</button>
        </div>
      </div>
      
      <div className="terminal-output">
        {history.map((line, i) => (
          <div key={i} className={`terminal-line ${line.type}`}>
            {line.content}
          </div>
        ))}
      </div>
      
      <form className="terminal-input-area" onSubmit={handleSubmit}>
        <span className="terminal-prompt">$</span>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter command..."
          className="terminal-input"
        />
      </form>
      
      <style>{`
        .terminal-wrapper {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #0f0f14;
          font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
          font-size: 13px;
        }
        
        .terminal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: #1a1a24;
          border-bottom: 1px solid #3a3a52;
        }
        
        .terminal-title {
          font-size: 12px;
          font-weight: 500;
          color: #e8e6f0;
        }
        
        .terminal-actions {
          display: flex;
          gap: 4px;
        }
        
        .terminal-actions button {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          font-size: 14px;
          color: #a8a6b8;
        }
        
        .terminal-actions button:hover {
          background: #24243a;
          color: #e8e6f0;
        }
        
        .terminal-output {
          flex: 1;
          padding: 12px;
          overflow-y: auto;
        }
        
        .terminal-line {
          color: #e8e6f0;
          line-height: 1.5;
        }
        
        .terminal-line.input {
          color: #5cff8f;
        }
        
        .terminal-line.output {
          color: #a8a6b8;
        }
        
        .terminal-line.error {
          color: #ff5c5c;
        }
        
        .terminal-input-area {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #1a1a24;
          border-top: 1px solid #3a3a52;
        }
        
        .terminal-prompt {
          color: #5cff8f;
          font-weight: bold;
        }
        
        .terminal-input {
          flex: 1;
          background: transparent !important;
          border: none !important;
          color: #e8e6f0;
          font-family: inherit;
          font-size: inherit;
          padding: 0;
        }
        
        .terminal-input:focus {
          outline: none;
          box-shadow: none;
        }
      `}</style>
    </div>
  );
}