/**
 * Editor - Simple code editor component
 * Used in the Piro Desktop IDE
 */

import React, { useState } from 'react';

interface EditorProps {
  value?: string;
  language?: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}

const languageLabels: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  csharp: 'C#',
  go: 'Go',
  rust: 'Rust',
  html: 'HTML',
  css: 'CSS',
  json: 'JSON',
  yaml: 'YAML',
  markdown: 'Markdown',
  sql: 'SQL',
  shell: 'Shell',
};

export function Editor({ 
  value = '', 
  language = 'typescript',
  readOnly = false,
  onChange,
}: EditorProps) {
  const [lineNumbers, setLineNumbers] = useState(true);
  
  const lines = value.split('\n');
  
  return (
    <div className="editor-wrapper">
      <div className="editor-header">
        <span className="language-badge">
          {languageLabels[language] || language}
        </span>
        <div className="editor-actions">
          <button 
            className={`toggle-lines ${lineNumbers ? 'active' : ''}`}
            onClick={() => setLineNumbers(!lineNumbers)}
            title="Toggle line numbers"
          >
            #
          </button>
        </div>
      </div>
      
      <div className="editor-container">
        {lineNumbers && (
          <div className="line-numbers">
            {lines.map((_, i) => (
              <div key={i} className="line-number">{i + 1}</div>
            ))}
          </div>
        )}
        
        <textarea
          className="code-editor"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={readOnly}
          spellCheck={false}
          placeholder="// Start coding..."
        />
      </div>
      
      <div className="editor-footer">
        <span>Ln {lines.length}, Col 1</span>
        <span>{languageLabels[language] || language}</span>
        <span>UTF-8</span>
      </div>
      
      <style>{`
        .editor-wrapper {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #0f0f14;
          overflow: hidden;
        }
        
        .editor-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: #1a1a24;
          border-bottom: 1px solid #3a3a52;
        }
        
        .language-badge {
          font-size: 11px;
          padding: 4px 8px;
          background: #7c5cff;
          border-radius: 4px;
          color: white;
          text-transform: uppercase;
          font-weight: 600;
        }
        
        .editor-actions {
          display: flex;
          gap: 4px;
        }
        
        .toggle-lines {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          font-size: 14px;
          color: #6b697a;
        }
        
        .toggle-lines:hover {
          background: #24243a;
          color: #a8a6b8;
        }
        
        .toggle-lines.active {
          background: #7c5cff;
          color: white;
        }
        
        .editor-container {
          flex: 1;
          display: flex;
          overflow: hidden;
        }
        
        .line-numbers {
          padding: 16px 12px;
          background: #0f0f14;
          border-right: 1px solid #3a3a52;
          text-align: right;
          user-select: none;
          overflow-y: auto;
        }
        
        .line-number {
          font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
          font-size: 13px;
          line-height: 1.5;
          color: #6b697a;
        }
        
        .code-editor {
          flex: 1;
          background: #0f0f14;
          color: #e8e6f0;
          border: none;
          resize: none;
          font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
          font-size: 13px;
          line-height: 1.5;
          padding: 16px;
          tab-size: 2;
        }
        
        .code-editor:focus {
          outline: none;
        }
        
        .code-editor::placeholder {
          color: #6b697a;
        }
        
        .editor-footer {
          display: flex;
          gap: 16px;
          padding: 6px 12px;
          background: #1a1a24;
          border-top: 1px solid #3a3a52;
          font-size: 11px;
          color: #6b697a;
        }
      `}</style>
    </div>
  );
}