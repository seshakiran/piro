/**
 * ChatPanel - Natural conversational AI interface
 * Like talking to an intelligent assistant, not a command line
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

export function ChatPanel({ api, workspacePath, onCreateProject, onNavigate }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    loading: false,
    spec: null,
    autopilot: false,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Welcome message
  useEffect(() => {
    if (chatState.messages.length === 0) {
      setChatState(s => ({
        ...s,
        messages: [{
          id: 'welcome',
          role: 'assistant',
          content: `👋 Hi! I'm your AI coding assistant.

I can help you build anything - from a simple script to a full application. Just tell me what you want in natural language, and I'll guide you through the process.

For example, you can say:
• "I want to build a todo app with user login"
• "Create a REST API for my startup"
• "Add tests to our payment system"

What would you like to build?`,
          timestamp: new Date(),
        }],
      }));
    }
  }, []);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages]);
  
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
    
    const userInput = input;
    setInput('');
    
    try {
      // Process natural language - understand what user wants
      const response = await processNaturalLanguage(userInput, api);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
      };
      
      setChatState(s => ({
        ...s,
        messages: [...s.messages, assistantMessage],
        loading: false,
        spec: response.spec || s.spec,
      }));
    } catch (error) {
      console.error('Chat error:', error);
      setChatState(s => ({
        ...s,
        messages: [...s.messages, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Let me try again!',
          timestamp: new Date(),
        }],
        loading: false,
      }));
    }
  };
  
  // Natural language processing - understands intent
  const processNaturalLanguage = async (text: string, api: PiroAPI): Promise<{ message: string; spec?: Spec }> => {
    const lower = text.toLowerCase();
    
    // Project creation
    if (lower.includes('build') || lower.includes('create') || lower.includes('make') || lower.includes('want to')) {
      const projectName = extractProjectName(text);
      
      // Create project
      onCreateProject?.(projectName, text);
      
      return {
        message: `🎉 Great! I've created a new project called **"${projectName}"**.

Now let's gather the requirements. What features should this ${projectName.toLowerCase()} have?

For example:
• Who are the users?
• What should it do?
• Any specific features or requirements?

Or, if you want me to help define the requirements, just tell me more about what you're building!`,
        spec: await api.generateSpec(text),
      };
    }
    
    // Requirements / features
    if (lower.includes('feature') || lower.includes('requirement') || lower.includes('should') || lower.includes('need')) {
      return {
        message: `📝 Interesting! Let me help you define those requirements.

I've noted:
"${text.slice(0, 100)}..."

Let's convert this into a proper specification using EARS notation. I'll ask you clarifying questions:

1. **Scope** - What specifically should be included?
2. **Constraints** - Any limitations or requirements?
3. **Quality** - What performance, security, or other standards?

Shall I generate a spec from this?`,
        spec: await api.generateSpec(text),
      };
    }
    
    // Generate spec
    if (lower.includes('generat') && (lower.includes('spec') || lower.includes('design'))) {
      const spec = await api.generateSpec(text);
      return {
        message: `📋 I've generated a specification from your request!

**Spec Details:**
- ${spec.tasks?.length || 0} tasks identified
- ${spec.requirements?.length || 0} requirements documented

Want me to:
- 📝 Show you the full spec?
- ✅ Approve and move to System Design?
- 💻 Start implementing?`,
        spec,
      };
    }
    
    // Testing
    if (lower.includes('test')) {
      return {
        message: `🧪 I can help with testing!

For your project, I can:
- Write unit tests
- Generate test coverage reports
- Run automated tests

What would you like to test specifically?`,
      };
    }
    
    // Deploy
    if (lower.includes('deploy') || lower.includes('launch') || lower.includes('host')) {
      const provider = lower.includes('aws') ? 'AWS' : 
                      lower.includes('gcp') || lower.includes('google') ? 'GCP' :
                      lower.includes('azure') ? 'Azure' : 'cloud';
      
      return {
        message: `🚀 I'd be happy to help deploy to ${provider}!

To deploy, I need to know:
- What's your deployment target (server, container, static site)?
- Any specific configuration?

Or I can set up deployment pipelines for you.`,
      };
    }
    
    // Help / questions
    if (lower.includes('how') || lower.includes('what') || lower.includes('can you')) {
      return {
        message: `🤖 I'm here to help! Here's what I can do:

**Building:**
• "I want to build a [app description]" - Creates a new project
• "Create a REST API for X" - Generates API specs

**Working:**
• "@implementer [task]" - Spawns a code-writing agent
• "@tester [task]" - Creates tests
• "@architect" - Designs your system

**Running:**
• "run tests" - Executes your test suite
• "deploy to AWS" - Deploys to cloud

What would you like to do?`,
      };
    }
    
    // Default - just chat naturally
    const response = await api.sendMessage(text);
    return { message: response.message };
  };
  
  const extractProjectName = (text: string): string => {
    // Extract project name from natural text
    const afterBuild = text.replace(/(build|create|make|want to|i want to)/gi, '').trim();
    const afterFor = afterBuild.split('for')[0].trim();
    const name = afterFor.split(',')[0].trim();
    
    if (name.length > 3) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return 'My Project';
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  return (
    <div className="chat-panel">
      <div className="chat-header">
        <span className="chat-title">💬 Chat</span>
        {chatState.autopilot && <span className="autopilot-badge">⭐ Autopilot</span>}
      </div>
      
      <div className="chat-messages">
        {chatState.messages.map(msg => (
          <div key={msg.id} className={`message ${msg.role}`}>
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
        ))}
        
        {chatState.loading && (
          <div className="message assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tell me what you want to build..."
          rows={2}
        />
        <button onClick={sendMessage} disabled={chatState.loading || !input.trim()}>
          {chatState.loading ? '...' : '➤'}
        </button>
      </div>
      
      <style>{`
        .chat-panel {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--color-bg-primary);
        }
        
        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid var(--color-border);
          background: var(--color-bg-secondary);
        }
        
        .chat-title {
          font-weight: 600;
          font-size: 14px;
        }
        
        .autopilot-badge {
          font-size: 10px;
          padding: 2px 8px;
          background: linear-gradient(135deg, #ffd700, #ffaa00);
          color: #000;
          border-radius: 10px;
        }
        
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }
        
        .message {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
        }
        
        .message.user {
          flex-direction: row-reverse;
        }
        
        .message-avatar {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-secondary);
          border-radius: 50%;
          font-size: 14px;
          flex-shrink: 0;
        }
        
        .message.assistant .message-avatar {
          background: var(--color-accent);
        }
        
        .message-content {
          max-width: 85%;
          background: var(--color-bg-secondary);
          border-radius: 16px;
          padding: 12px 16px;
        }
        
        .message.user .message-content {
          background: var(--color-accent);
          color: white;
        }
        
        .message-text {
          white-space: pre-wrap;
          line-height: 1.5;
          font-size: 14px;
        }
        
        .message-time {
          font-size: 10px;
          color: var(--color-text-muted);
          margin-top: 4px;
        }
        
        .message.user .message-time {
          color: rgba(255, 255, 255, 0.7);
        }
        
        .typing {
          display: flex;
          gap: 4px;
          padding: 8px 0;
        }
        
        .typing span {
          width: 8px;
          height: 8px;
          background: var(--color-text-muted);
          border-radius: 50%;
          animation: typing 1s infinite;
        }
        
        .typing span:nth-child(2) { animation-delay: 0.2s; }
        .typing span:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        
        .chat-input {
          display: flex;
          gap: 8px;
          padding: 12px;
          border-top: 1px solid var(--color-border);
          background: var(--color-bg-secondary);
        }
        
        .chat-input textarea {
          flex: 1;
          resize: none;
          border: none;
          background: transparent;
          color: var(--color-text-primary);
          font-size: 14px;
          padding: 8px;
        }
        
        .chat-input textarea:focus {
          outline: none;
        }
        
        .chat-input textarea::placeholder {
          color: var(--color-text-muted);
        }
        
        .chat-input button {
          width: 40px;
          height: 40px;
          background: var(--color-accent);
          border: none;
          border-radius: 50%;
          color: white;
          font-size: 18px;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .chat-input button:hover {
          background: var(--color-accent-hover);
        }
        
        .chat-input button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}