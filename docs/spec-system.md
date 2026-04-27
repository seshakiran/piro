# Piro Spec System

## Overview

Piro uses **spec-driven development** similar to Kiro. Features:
- Natural language → Feature Spec
- Feature Spec → EARS Requirements
- EARS Requirements → Task Breakdown
- Task Breakdown → Implementation

## EARS Notation

EARS (Enhanced Arithmetic Requirements Specification):
- **U**: Undefined - What the feature should do
- **S**: Scope - Boundary conditions
- **C**: Constraint - Limitations
- **Q**: Quality - Non-functional requirements

### Example

```
The system shall authenticate users using email and password.
Scope: Authentication must be required for all protected resources.
Constraint: Passwords must be at least 8 characters.
Quality: Authentication must complete in under 2 seconds.
```

## Spec Lifecycle

1. **Draft** - Initial spec created
2. **Review** - Reviewing requirements
3. **Approved** - Approved for implementation
4. **In Progress** - Tasks being executed
5. **Completed** - All tasks done

## Task Decomposition

Tasks are decomposed from requirements and assigned to subagents:
- architect: System design
- implementer: Code implementation  
- tester: Testing
- docs-writer: Documentation
- deployer: Deployment

## API

```typescript
const spec = await piro.generateSpec(`
  Create a user authentication system with:
  - Login with email/password
  - OAuth (Google, GitHub)
  - JWT tokens
  - Password reset
`);

// Approve spec
piro.approveSpec(spec.id);

// Tasks are automatically created
spec.tasks.forEach(task => {
  piro.executeTask(task, task.role);
});
```