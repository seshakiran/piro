# Piro - AI Coding IDE

**Piro** is an AI-powered coding IDE with a full Software Development Life Cycle (SDLC) workflow. It combines spec-driven development, AI subagents, and cloud deployment into a single desktop application.

![Piro](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows-orange)

## 🚀 Features

### Full SDLC Workflow
Piro guides you through the complete software development lifecycle:

| Stage | Description |
|-------|-------------|
| **📁 Project Setup** | Create new projects with type selection (Web, Mobile, API, CLI, Library) |
| **📝 Requirements** | Gather requirements using EARS notation (Undefined, Scope, Constraints, Quality) |
| **🏗️ System Design** | Design system architecture, components, and technology stack |
| **⚙️ Technical Design** | Define API specifications, database schemas, and file structure |
| **💻 Development** | Build with AI-assisted code editor and task tracking |
| **🧪 Testing** | Run tests, view coverage, and get AI-powered analysis |
| **🚀 Deployment** | Deploy to AWS, GCP, Azure, Vercel, or Netlify |

### AI Chat Interface

Natural language commands that trigger actions:

```
# Create project from description
"create project a todo app with user authentication"

# Generate specification
"generate spec REST API for blog"

# Spawn AI agents
"@implementer create a login form"
"@tester add unit tests for auth module"
"@architect design the system architecture"

# Deploy to cloud
"deploy to AWS"
"deploy to GCP"

# Run tests
"run tests"

# Git operations
"commit the changes with message: added login feature"
```

### AI Subagents

Spawn specialized AI agents anytime:

| Agent | Role |
|-------|------|
| 🎯 **Coordinator** | Orchestrates overall workflow |
| 🏗️ **Architect** | System design and component structure |
| 💻 **Implementer** | Code implementation and refactoring |
| 🧪 **Tester** | Testing, verification, and debugging |
| 📚 **Docs Writer** | Documentation and READMEs |
| 🚀 **Deployer** | Cloud deployment and configuration |
| 👀 **Reviewer** | Code review and approvals |

### Power Tools

Modular tool capabilities:

| Category | Powers |
|----------|--------|
| 📁 **File** | Read, Write, Create, Delete, List |
| 🔀 **Git** | Status, Commit, Push, Pull, Branch |
| 🧪 **Test** | Run Tests, Coverage Reports |
| 🚀 **Deploy** | AWS, GCP, Azure, Vercel, Netlify |
| 🔍 **Search** | Grep, Find Files |
| 💻 **Terminal** | Execute Commands |

### Hooks Automation

Automate tasks on events:

- `on_save` - Run when file is saved
- `on_build` - Run when build executes
- `on_commit` - Run before git commit
- `on_test` - Run when tests execute
- `pre_deploy` - Run before deployment
- `manual` - Manually triggered

### Model Configuration

Multiple AI model providers:

- **MiniMax** (default) - MiniMax-M2.7
- **Anthropic** - Claude Sonnet 4.5, Opus 4, Haiku 3.5
- **OpenAI** - GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo
- **Google** - Gemini 1.5 Pro/Flash
- **Custom** - Bring your own model

## 📦 Installation

### macOS

1. Download `Piro-1.0.0-arm64.dmg` from releases
2. Mount the DMG file
3. Drag **Piro.app** to Applications
4. Launch Piro from Applications

### Build from Source

```bash
# Clone the repository
git clone https://github.com/seshakiran/piro.git
cd piro

# Install dependencies for piro-core
cd piro-core
npm install

# Install dependencies for piro-desktop
cd ../piro-desktop
npm install

# Run in development mode
npm run dev

# Build for macOS
npm run package
```

### Windows

```bash
# Clone the repository
git clone https://github.com/seshakiran/piro.git
cd piro/piro-desktop

# Install dependencies
npm install

# Build for Windows
npm run package:win
```

## 🏃 Getting Started

### 1. Launch Piro

Start the application. Piro Core will attempt to auto-connect on startup.

### 2. Create Your First Project

**Via Chat:**
```
"create project an e-commerce platform with user auth and payments"
```

**Via UI:**
1. Click **Project** in the sidebar
2. Choose project type (Web, Mobile, API, etc.)
3. Enter project name and description
4. Click **Create Project**

### 3. Work Through SDLC Stages

Navigate through stages via the top bar or sidebar:

1. **Requirements** - Describe what you want to build
2. **System Design** - Architecture and components
3. **Tech Design** - API specs and schemas
4. **Development** - Write code with AI assistance
5. **Testing** - Run tests and view coverage
6. **Deployment** - Deploy to your cloud provider

### 4. Use AI Agents

**In Chat:**
```
"@implementer create a user model with email and password"
"@tester write tests for the payment module"
```

**In Agents Panel:**
1. Click **Agents** in the sidebar
2. Select agent type
3. Describe the task
4. Click **Run Agent**

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + B` | Toggle sidebar |
| `Ctrl/Cmd + `` ` ` | Toggle terminal |
| `Ctrl/Cmd + ,` | Open settings |
| `Ctrl/Cmd + N` | New chat |
| `Ctrl/Cmd + Shift + E` | Open Explorer |

## 📁 Project Structure

```
piro/
├── piro-core/           # Backend AI server
│   ├── src/
│   │   └── index.ts     # Main server entry
│   └── package.json
│
├── piro-desktop/        # Desktop application
│   ├── src/
│   │   ├── main/        # Electron main process
│   │   │   ├── main.ts
│   │   │   └── preload.ts
│   │   └── renderer/     # React frontend
│   │       ├── components/
│   │       │   ├── ChatPanel.tsx
│   │       │   ├── ProjectPanel.tsx
│   │       │   ├── SubagentsPanel.tsx
│   │       │   ├── FileTreePanel.tsx
│   │       │   └── ...
│   │       ├── api/
│   │       │   └── piro-client.ts
│   │       ├── App.tsx
│   │       └── main.tsx
│   └── package.json
│
├── piro-extension/      # VS Code extension
│   └── src/
│
└── docs/                # Documentation
    ├── spec-system.md
    ├── subagents.md
    └── cloud.md
```

## 🔌 API Reference

Piro Core exposes a REST API on port `3847`:

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/chat` | Send chat message |
| `GET` | `/api/specs` | List all specs |
| `POST` | `/api/specs/generate` | Generate new spec |
| `GET` | `/api/hooks` | List all hooks |
| `POST` | `/api/hooks` | Create new hook |
| `GET` | `/api/powers` | List all powers |
| `POST` | `/api/agents/run` | Run an agent |
| `POST` | `/api/deploy` | Deploy to cloud |

### WebSocket

Connect to `ws://localhost:3847/ws` for real-time updates.

## 🔧 Configuration

### Settings Panel

Access via `Ctrl/Cmd + ,` or Settings in sidebar:

- **Model Selection** - Choose AI provider and model
- **API Key** - Configure your API key
- **Pi Integration** - Enable/disable Pi features
- **Theme** - Dark/Light/System
- **MCP** - Model Context Protocol configuration

### Config File

Location: `~/Library/Application Support/piro/config.json` (macOS)

```json
{
  "port": 3847,
  "host": "localhost",
  "model": {
    "provider": "minimax",
    "model": "MiniMax-M2.7"
  },
  "theme": "dark"
}
```

## 📖 Documentation

- [Spec System](./docs/spec-system.md) - Spec-driven development
- [Subagents](./docs/subagents.md) - AI agent architecture
- [Cloud Deployment](./docs/cloud.md) - AWS, GCP, Azure setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- UI components styled with custom CSS
- Powered by [Pi](https://pi.dev) agent harness
- AI models from MiniMax, Anthropic, OpenAI, and Google

---

**Piro** - AI Coding IDE for the full development lifecycle.