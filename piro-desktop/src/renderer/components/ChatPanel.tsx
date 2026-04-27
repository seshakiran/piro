/**
 * ChatPanel - Main AI chat interface with @ mentions and commands
 */

import React, { useState, useRef, useEffect } from 'react';
import { PiroAPI, Message, Spec } from '../api/piro-client';

interface ChatPanelProps {
  api: PiroAPI | null;
  workspacePath: string | null;
  onCreateProject?: (name: string, description: string) => void;
  onNavigate?: (panel: string) => void;
}

interface ChatState {
  messages: Message[];
  loading: boolean;
  spec: Spec | null;
  autopilot: boolean;
}

const agentMentions = [
  { name: 'implementer', desc: 'Write code' },
  { name: 'architect', desc: 'Design system' },
  { name: 'tester', desc: 'Write tests' },
  { name: 'docs-writer', desc: 'Write docs' },
  { name: 'deployer', desc: 'Deploy' },
  { name: 'reviewer', desc: 'Review code' },
];

export function ChatPanel({ api, workspacePath, onCreateProject, onNavigate }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    loading: false,
    spec: null,
    autopilot: false,
  });
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages]);
  
  // Handle @ mentions
  useEffect(() => {
    const lastAt = input.lastIndexOf('@');
    if (lastAt !== -1) {
      const afterAt = input.slice(lastAt + 1);
      if (!afterAt.includes(' ') && afterAt.length < 20) {
        setMentionFilter(afterAt.toLowerCase());
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  }, [input]);
  
  // Process special commands
  const processCommand = (text: string): { command: string; args: string } | null => {
    const lower = text.toLowerCase();
    
    if (lower.startsWith('create project ') || lower.startsWith('new project ')) {
      return { command: 'create_project', args: text };
    }
    if (lower.startsWith('generate spec ') || lower.startsWith('create spec ') || lower.startsWith('new spec ')) {
      return { command: 'generate_spec', args: text };
    }
    if (lower.startsWith('run tests') || lower.includes('run test')) {
      return { command: 'run_tests', args: text };
    }
    if (lower.startsWith('commit ') || lower.includes('git commit')) {
      return { command: 'git_commit', args: text };
    }
    if (lower.includes('deploy to ')) {
      return { command: 'deploy', args: text };
    }
    if (lower.startsWith('run agent ') || lower.startsWith('@')) {
      return { command: 'run_agent', args: text };
    }
    return null;
  };
  
  const insertMention = (agent: string) => {
    const lastAt = input.lastIndexOf('@');
    const newInput = input.slice(0, lastAt) + `@${agent} `;
    setInput(newInput);
    setShowMentions(false);
    inputRef.current?.focus();
  };
  
  const sendMessage = async () => {
    if (!input.trim() || !api || chatState.loading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    
    setChatState(s => ({
      ...s,
      messages: [...s.messages, userMessage],
      loading: true,
    }));
    
    setInput('');
    
    // Check for commands
    const command = processCommand(input);
    let responseText = '';
    
    if (command) {
      switch (command.command) {
        case 'create_project':
          responseText = `✅ Creating project from your prompt...\n\nI'll set up the project with:\n\n- Requirements gathering\n- System design\n- Technical design\n- Development workflow\n- Testing\n- Deployment\n\nNavigating to Requirements stage...`;
          setTimeout(() => {
            onCreateProject?.('New Project', command.args);
            onNavigate?.('requirements');
          }, 1500);
          break;
          
        case 'generate_spec':
          responseText = `📋 Generating spec from your prompt...\n\nI'll create:\n- EARS requirements\n- Task breakdown\n- Agent assignments\n\nNavigating to Spec view...`;
          setTimeout(() => {
            onNavigate?.('requirements');
          }, 1500);
          break;
          
        case 'run_tests':
          responseText = `🧪 Running tests...\n\nExecuting test suite and checking coverage...`;
          setTimeout(() => {
            onNavigate?.('testing');
          }, 1500);
          break;
          
        case 'git_commit':
          responseText = `🔀 Git commit: "${command.args}"\n\nI'll commit your changes with a descriptive message.`;
          break;
          
        case 'deploy':
          const provider = command.args.toLowerCase().includes('aws') ? 'AWS' :
                          command.args.toLowerCase().includes('gcp') ? 'GCP' :
                          command.args.toLowerCase().includes('azure') ? 'Azure' : 'cloud';
          responseText = `🚀 Deploying to ${provider}...\n\nSetting up deployment to ${provider}...`;
          setTimeout(() => {
            onNavigate?.('deployment');
          }, 1500);
          break;
          
        case 'run_agent':
          const agentType = command.args.toLowerCase().includes('@implementer') ? 'Implementer' :
                            command.args.toLowerCase().includes('@architect') ? 'Architect' :
                            command.args.toLowerCase().includes('@tester') ? 'Tester' :
                            command.args.toLowerCase().includes('@docs') ? 'Docs Writer' :
                            command.args.toLowerCase().includes('@deployer') ? 'Deployer' :
                            command.args.toLowerCase().includes('@reviewer') ? 'Reviewer' : 'Agent';
          responseText = `🤖 Spawning ${agentType} to execute your prompt...\n\nThe agent will work on:\n${command.args}\n\nNavigating to Agents panel...`;
          setTimeout(() => {
            onNavigate?.('subagents');
          }, 1500);
          break;
          
        default:
          const response = await api.sendMessage(input);
          responseText = response.message;
      }
    } else {
      const response = await api.sendMessage(input);
      responseText = response.message;
    }
    
    try {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
      };
      
      setChatState(s => ({
        ...s,
        messages: [...s.messages, assistantMessage],
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to send message:', error);
      setChatState(s => ({ ...s, loading: false }));
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentions) {
      if (e.key === 'Escape') {
        setShowMentions(false);
      }
      return;
    }
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const filteredMentions = agentMentions.filter(a => 
    a.name.toLowerCase().includes(mentionFilter)
  );
  
  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h2>Chat</h2>
        <div className="header-actions">
          <button 
            className={`autopilot-toggle ${chatState.autopilot ? 'active' : ''}`}
            onClick={() => setChatState(s => ({ ...s, autopilot: !s.autopilot }))}
          >
            <span>⭐</span> Autopilot
          </button>
        </div>
      </div>
      
      <div className="chat-messages">
        {chatState.messages.length === 0 ? (
          <div className="chat-welcome">
            <div className="welcome-logo">P</div>
            <h3>Welcome to Piro</h3>
            <p>Start a conversation or describe what you want to build.</p>
            <p className="hint">Try: "create project a todo app" or "@implementer write login"</p>
            <div className="example-prompts">
              <button onClick={() => setInput('create project a user authentication system')}>
                create project user auth
              </button>
              <button onClick={() => setInput('@implementer create a REST API')}>
                @implementer create REST API
              </button>
              <button onClick={() => setInput('deploy to AWS')}>
                deploy to AWS
              </button>
            </div>
          </div>
        ) : (
          chatState.messages.map(msg => (
            <div key={msg.id} className={`message message-${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message-content">
                <div className="message-text">{msg.content}</div>
                <div className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        
        {chatState.loading && (
          <div className="message message-assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input-area">
        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Piro... (commands: create project, generate spec, deploy to AWS, @agent)"
              rows={3}
            />
            
            {showMentions && (
              <div className="mentions-dropdown">
                <div className="mentions-header">Spawn Agent</div>
                {filteredMentions.map(agent => (
                  <div key={agent.name} className="mention-item" onClick={() => insertMention(agent.name)}>
                    <span className="mention-name">@{agent.name}</span>
                    <span className="mention-desc">{agent.desc}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="input-actions">
            <button 
              className="send-btn"
              onClick={sendMessage}
              disabled={chatState.loading || !input.trim()}
            >
              {chatState.loading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        .chat-panel { display: flex; flex-direction: column; height: 100%; background: var(--color-bg-primary); }
        
        .chat-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--color-border); background: var(--color-bg-secondary); }
        .chat-header h2 { font-size: 16px; font-weight: 600; }
        
        .autopilot-toggle { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: var(--radius-md); font-size: 12px; background: var(--color-bg-tertiary); color: var(--color-text-secondary); }
        .autopilot-toggle:hover { background: var(--color-bg-elevated); }
        .autopilot-toggle.active { background: linear-gradient(135deg, #ffd700, #ffaa00); color: #000; }
        
        .chat-messages { flex: 1; overflow-y: auto; padding: 16px; }
        
        .chat-welcome { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 40px; }
        .welcome-logo { width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--color-accent), var(--color-accent-secondary)); border-radius: var(--radius-xl); font-size: 32px; font-weight: bold; margin-bottom: 24px; }
        .chat-welcome h3 { font-size: 24px; margin-bottom: 8px; }
        .chat-welcome p { color: var(--color-text-secondary); margin-bottom: 16px; }
        .hint { font-size: 12px; color: var(--color-text-muted); margin-bottom: 24px; }
        
        .example-prompts { display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 400px; }
        .example-prompts button { padding: 12px 16px; background: var(--color-bg-tertiary); border-radius: var(--radius-md); text-align: left; transition: background var(--transition-fast); }
        .example-prompts button:hover { background: var(--color-bg-elevated); }
        
        .message { display: flex; gap: 12px; margin-bottom: 16px; }
        .message-user { flex-direction: row-reverse; }
        .message-avatar { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: var(--color-bg-tertiary); border-radius: var(--radius-md); font-size: 16px; flex-shrink: 0; }
        .message-content { max-width: 70%; background: var(--color-bg-secondary); border-radius: var(--radius-lg); padding: 12px 16px; }
        .message-user .message-content { background: var(--color-accent); color: white; }
        .message-text { white-space: pre-wrap; line-height: 1.6; }
        .message-time { font-size: 10px; color: var(--color-text-muted); margin-top: 4px; }
        .message-user .message-time { color: rgba(255, 255, 255, 0.6); }
        
        .typing-indicator { display: flex; gap: 4px; }
        .typing-indicator span { width: 8px; height: 8px; background: var(--color-text-muted); border-radius: 50%; animation: typing 1.4s infinite; }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-8px); } }
        
        .chat-input-area { padding: 16px; border-top: 1px solid var(--color-border); background: var(--color-bg-secondary); }
        .input-container { display: flex; gap: 8px; background: var(--color-bg-tertiary); border-radius: var(--radius-lg); padding: 8px; }
        .input-wrapper { flex: 1; position: relative; }
        .input-wrapper textarea { width: 100%; background: transparent; border: none; resize: none; min-height: 60px; padding: 8px; }
        .input-wrapper textarea:focus { outline: none; }
        
        .mentions-dropdown { position: absolute; bottom: 100%; left: 0; right: 0; background: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: var(--radius-md); margin-bottom: 8px; box-shadow: var(--shadow-lg); }
        .mentions-header { padding: 8px 12px; font-size: 11px; color: var(--color-text-muted); border-bottom: 1px solid var(--color-border); }
        .mention-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; cursor: pointer; }
        .mention-item:hover { background: var(--color-bg-tertiary); }
        .mention-name { font-weight: 600; color: var(--color-accent); }
        .mention-desc { font-size: 12px; color: var(--color-text-muted); }
        
        .input-actions { display: flex; align-items: flex-end; }
        .send-btn { padding: 8px 16px; background: var(--color-accent); color: white; border-radius: var(--radius-md); font-weight: 500; }
        .send-btn:hover:not(:disabled) { background: var(--color-accent-hover); }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}