# Piro: Spec-Driven AI Coding Agent

**Piro** is a Kiro-compatible, spec-driven AI coding agent with:
- Spec-driven development (feature specs → EARS → tasks → code)
- Subagent system (architect, implementer, tester, docs-writer, deployer)
- Power system (file, git, test, deploy)
- Hooks (on_save, on_build, pre_commit, etc.)
- Cloud deployment (AWS → GCP → Azure)
- VS Code fork with full IDE

Built on **Pi** (the coding agent harness) with **MiniMax-M2.7** as the primary model.

## Architecture

```
Piro GUI (VS Code Fork)
        │
        │ WebSocket/REST
        ▼
Piro Core Server
        │
        │ Pi Session
        ▼
Pi + MiniMax-M2.7
```

## Quick Start

```bash
# Install dependencies
cd piro-core && npm install

# Start Piro Core server
npm run dev

# Connect VS Code extension
# Or use CLI
piro --help
```

## Features

| Feature | Description |
|---------|-------------|
| **Spec Engine** | Convert prompts to EARS specs to tasks |
| **Subagents** | Coordinator + specialized subagents |
| **Powers** | Modular tool capabilities |
| **Hooks** | Event-triggered automation |
| **Cloud Deploy** | AWS, GCP, Azure support |

## Documentation

- [Spec System](./docs/spec-system.md)
- [Subagent Architecture](./docs/subagents.md)
- [Powers](./docs/powers.md)
- [Hooks](./docs/hooks.md)
- [Cloud Connectors](./docs/cloud.md)
- [VS Code Extension](./docs/extension.md)

## License

MIT