/**
 * Agent Commands
 */

import * as vscode from 'vscode';
import type { PiroClient } from '../api/piro-client';

/**
 * Register agent commands
 */
export function registerAgentCommands(
  context: vscode.ExtensionContext,
  client: PiroClient
): void {
  // Open Agent Manager
  const openAgentManager = vscode.commands.registerCommand('piro.agents', async () => {
    const panel = vscode.window.createWebviewPanel(
      'piro.agents',
      'Piro Agent Manager',
      vscode.ViewColumn.One,
      { enableScripts: true }
    );

    panel.webview.html = getAgentManagerHtml();

    panel.webview.onDidReceiveMessage(async (message) => {
      const { action, data } = message;

      switch (action) {
        case 'list':
          try {
            const agents = await client.listAgents();
            panel.webview.postMessage({ action: 'agentsList', data: agents });
          } catch (error) {
            panel.webview.postMessage({ action: 'error', data: String(error) });
          }
          break;

        case 'create':
          try {
            const agent = await client.createAgent(data.role);
            panel.webview.postMessage({ action: 'agentCreated', data: agent });
          } catch (error) {
            panel.webview.postMessage({ action: 'error', data: String(error) });
          }
          break;

        case 'execute':
          try {
            const result = await client.executeTask(data.task, data.role);
            panel.webview.postMessage({ action: 'taskResult', data: result });
          } catch (error) {
            panel.webview.postMessage({ action: 'error', data: String(error) });
          }
          break;
      }
    });
  });

  // Execute task command
  const executeTask = vscode.commands.registerCommand('piro.executeTask', async () => {
    const role = await vscode.window.showQuickPick(
      ['implementer', 'tester', 'docs-writer', 'deployer', 'architect'],
      { placeHolder: 'Select agent role' }
    );

    if (!role) return;

    const task = await vscode.window.showInputBox({
      prompt: 'Enter the task description',
    });

    if (!task) return;

    try {
      const result = await client.executeTask(task, role);
      vscode.window.showInformationMessage('Task completed!');
    } catch (error) {
      vscode.window.showErrorMessage(`Task failed: ${error}`);
    }
  });

  context.subscriptions.push(openAgentManager, executeTask);
}

function getAgentManagerHtml(): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { padding: 20px; font-family: -apple-system, sans-serif; }
    .agents-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
    .agent-card { padding: 15px; background: #f5f5f5; border-radius: 8px; }
    .agent-role { font-weight: bold; font-size: 18px; }
    .agent-status { color: #666; margin-top: 5px; }
    .task-form { margin-top: 20px; padding: 15px; background: #eee; border-radius: 8px; }
    .task-input { width: 100%; padding: 10px; margin: 10px 0; }
  </style>
</head>
<body>
  <h2>Agent Pool</h2>
  <div id="agents" class="agents-grid"></div>
  
  <div class="task-form">
    <h3>Execute Task</h3>
    <select id="role" class="task-input">
      <option value="implementer">Implementer</option>
      <option value="architect">Architect</option>
      <option value="tester">Tester</option>
      <option value="docs-writer">Docs Writer</option>
      <option value="deployer">Deployer</option>
    </select>
    <textarea id="task" class="task-input" placeholder="Describe the task..."></textarea>
    <button onclick="executeTask()">Execute</button>
  </div>
  
  <script>
    function listAgents() {
      vscode.postMessage({ action: 'list' });
    }
    
    function createAgent(role) {
      vscode.postMessage({ action: 'create', data: { role } });
    }
    
    function executeTask() {
      const role = document.getElementById('role').value;
      const task = document.getElementById('task').value;
      vscode.postMessage({ action: 'execute', data: { task, role } });
    }
    
    window.addEventListener('message', (e) => {
      const { action, data } = e.data;
      if (action === 'agentsList') {
        document.getElementById('agents').innerHTML = data.map(a => 
          '<div class="agent-card"><div class="agent-role">' + a.role + '</div><div class="agent-status">' + a.status + '</div></div>'
        ).join('');
      }
    });
    
    listAgents();
  </script>
</body>
</html>
  `;
}