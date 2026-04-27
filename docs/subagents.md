# Piro Subagents

## Architecture

Piro implements a **Kiro-compatible subagent system**:

```
Coordinator (main)
    │
    ├── Architect (system design)
    ├── Implementer (code)
    ├── Tester (testing)
    ├── Docs Writer (documentation)
    └── Deployer (deployment)
```

## Subagent Types

| Role | Purpose | Tools |
|------|---------|-------|
| **Coordinator** | Orchestrates overall workflow | plan, delegate, monitor |
| **Architect** | System design, component structure | design, analyze |
| **Implementer** | Code implementation | code, refactor, test |
| **Tester** | Testing, verification | test, verify, debug |
| **Docs Writer** | Documentation | document, readme |
| **Deployer** | Cloud deployment | deploy, configure |
| **Reviewer** | Code review | review, approve |

## Parallel Execution

Subagents can execute tasks in parallel:

```typescript
const tasks = [
  { task: 'Implement user model', role: 'implementer' },
  { task: 'Write unit tests', role: 'tester' },
  { task: 'Create API docs', role: 'docs-writer' },
];

const results = await piro.executeParallel(tasks);
```

## Model

Each subagent uses **MiniMax-M2.7** by default (configurable):
- Provider: MiniMax
- Model: MiniMax-M2.7
- Temperature: 0.7
- Thinking: enabled

## Task Queue

Tasks are queued and distributed to available agents:

```typescript
piro.addTask('Implement feature', 'implementer');
piro.addTask('Write tests', 'tester');
await piro.executeAll(parallel = true);
```