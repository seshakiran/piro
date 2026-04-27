/**
 * HelpPanel - Documentation and Help
 */

import React, { useState } from 'react';

export function HelpPanel() {
  const [search, setSearch] = useState('');
  
  const helpSections = [
    {
      title: 'Getting Started',
      items: [
        { q: 'How to create a project via chat?', a: 'Simply type "create project" followed by your idea in the chat. For example: "create project a todo app with user auth" - Piro will set up the entire SDLC workflow.' },
        { q: 'How does SDLC workflow work?', a: 'The SDLC has 7 stages: Project → Requirements → System Design → Tech Design → Development → Testing → Deployment. Complete in order or jump between stages with sidebar.' },
        { q: 'How to spawn agents via chat?', a: 'Use @ mentions in chat: @implementer, @architect, @tester, @docs-writer, @deployer, @reviewer. Type "@implementer create login form" to spawn.' },
      ]
    },
    {
      title: 'Chat & AI',
      items: [
        { q: 'How does spec-driven development work?', a: 'In chat, type "generate spec" then your idea, or just describe what you want. Piro creates EARS requirements, breaks into tasks, and lets you run agents.' },
        { q: 'What is Autopilot mode?', a: 'Enable Autopilot in chat header - AI agents work autonomously on large tasks without step-by-step confirmation. Great for big feature implementation.' },
        { q: 'What commands work in chat?', a: '"create project [idea]" - starts project\n"generate spec [idea]" - creates specification\n"@agent [task]" - spawns agent\n"deploy to aws/gcp/azure" - deploys' },
      ]
    },
    {
      title: 'Power Tools',
      items: [
        { q: 'What are Powers?', a: 'Powers are modular tool capabilities that AI agents use:\n\n- 📁 File: read, write, create, delete files\n- 🔀 Git: status, commit, push, pull, branch\n- 🧪 Test: run tests, coverage\n- 🚀 Deploy: AWS, GCP, Azure, Vercel\n- 🔍 Search: find files, grep content\n- 💻 Terminal: execute commands\n\nAccess from Powers panel in sidebar.' },
        { q: 'How to use Powers?', a: 'Open Powers panel → select category → click Execute on any power. Powers are also used automatically by agents when needed.' },
        { q: 'What are Hooks?', a: 'Hooks automate Powers on events:\n\n- on_save: run when file is saved\n- on_build: run when build executes\n- on_commit: run before git commit\n- on_test: run when tests run\n- pre_deploy: run before deployment\n\nConfigure in Hooks panel.' },
      ]
    },
    {
      title: 'Testing & Deployment',
      items: [
        { q: 'How to run tests?', a: 'Go to Testing panel → click "Run All Tests" or ask AI: "@tester run all tests". View coverage in the panel.' },
        { q: 'Deploy to cloud?', a: 'In chat: "deploy to AWS" or use Deployment panel to select provider and configure.' },
        { q: 'What is code coverage?', a: 'Shows % of code tested. Green = >80% good. Piro shows statements, branches, functions, lines coverage in Testing panel.' },
      ]
    },
    {
      title: 'Configuration',
      items: [
        { q: 'How to change AI model?', a: 'Settings → Model Selection. Choose MiniMax (default), Anthropic, OpenAI, Google, or custom. Enter API key in API Configuration.' },
        { q: 'How to set API key?', a: 'Settings → API Configuration → enter your provider API key. Keys are stored locally.' },
        { q: 'What is MCP?', a: 'Model Context Protocol - connect external tools (databases, APIs, docs) to Piro. Add MCP servers in Settings.' },
      ]
    },
    {
      title: 'Keyboard Shortcuts',
      items: [
        { q: 'Ctrl+B / Cmd+B', a: 'Toggle sidebar' },
        { q: 'Ctrl+` / Cmd+`', a: 'Toggle terminal' },
        { q: 'Ctrl+, / Cmd+,', a: 'Open settings' },
        { q: 'Ctrl+N / Cmd+N', a: 'New chat' },
        { q: 'Ctrl+G / Cmd+G', a: 'Generate spec' },
      ]
    },
  ];
  
  const featuredGuides = [
    { title: 'Your First Project', desc: 'Create via chat', icon: '💬' },
    { title: 'Using Specs', desc: 'Generate via chat', icon: '📋' },
    { title: 'Agent Mentions', desc: 'Spawn via @', icon: '@' },
    { title: 'Cloud Deploy', desc: 'Deploy via chat', icon: '☁️' },
  ];
  
  return (
    <div className="help-panel">
      <div className="panel-header">
        <h2>Help & Documentation</h2>
        <div className="search-box">
          <span>🔍</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search help..." />
        </div>
      </div>
      
      <div className="help-content">
        <section className="quick-start">
          <h3>Quick Start</h3>
          <div className="guide-grid">
            {featuredGuides.map((guide, i) => (
              <div key={i} className="guide-card">
                <span className="guide-icon">{guide.icon}</span>
                <div className="guide-info">
                  <span className="guide-title">{guide.title}</span>
                  <span className="guide-desc">{guide.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {helpSections.map((section, i) => (
          <section key={i} className="help-section">
            <h3>{section.title}</h3>
            <div className="faq-list">
              {section.items.map((item, j) => (
                <details key={j} className="faq-item">
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
        
        <section className="piro-info">
          <div className="info-card">
            <span className="info-logo">P</span>
            <div className="info-text">
              <h4>Piro - AI Coding IDE</h4>
              <p>Version 1.0.0</p>
              <p>Powered by Pi + MiniMax</p>
            </div>
          </div>
        </section>
      </div>
      
      <style>{`
        .help-panel { display: flex; flex-direction: column; height: 100%; overflow: hidden; }
        
        .panel-header { padding: 24px 24px 0; display: flex; gap: 16px; align-items: center; }
        .panel-header h2 { font-size: 24px; }
        
        .search-box { flex: 1; display: flex; align-items: center; gap: 8px; padding: 0 16px; background: var(--color-bg-secondary); border-radius: var(--radius-md); max-width: 400px; }
        .search-box input { flex: 1; border: none; background: transparent; padding: 12px 0; }
        
        .help-content { flex: 1; overflow-y: auto; padding: 24px; }
        
        .quick-start { margin-bottom: 32px; }
        .quick-start h3, .help-section h3 { font-size: 14px; margin-bottom: 16px; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
        
        .guide-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .guide-card { display: flex; align-items: center; gap: 12px; padding: 16px; background: var(--color-bg-secondary); border-radius: var(--radius-lg); cursor: pointer; }
        .guide-card:hover { background: var(--color-bg-tertiary); }
        .guide-icon { font-size: 28px; }
        .guide-title { display: block; font-weight: 600; font-size: 13px; }
        .guide-desc { font-size: 11px; color: var(--color-text-muted); }
        
        .help-section { margin-bottom: 24px; }
        .faq-list { display: flex; flex-direction: column; gap: 8px; }
        .faq-item { background: var(--color-bg-secondary); border-radius: var(--radius-md); }
        .faq-item summary { padding: 12px 16px; cursor: pointer; font-weight: 500; }
        .faq-item[open] summary { border-bottom: 1px solid var(--color-border); }
        .faq-item p { padding: 12px 16px; font-size: 13px; color: var(--color-text-secondary); line-height: 1.5; white-space: pre-wrap; }
        
        .piro-info { margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--color-border); }
        .info-card { display: flex; align-items: center; gap: 16px; padding: 16px; background: var(--color-bg-secondary); border-radius: var(--radius-lg); }
        .info-logo { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--color-accent), var(--color-accent-secondary)); border-radius: var(--radius-lg); font-size: 24px; font-weight: bold; }
        .info-text h4 { font-size: 16px; margin-bottom: 4px; }
        .info-text p { font-size: 12px; color: var(--color-text-muted); }
      `}</style>
    </div>
  );
}