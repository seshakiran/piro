/**
 * Hook Commands
 */

import * as vscode from 'vscode';
import type { PiroClient } from '../api/piro-client';

export function registerHookCommands(
  context: vscode.ExtensionContext,
  client: PiroClient
): void {
  const openHooksManager = vscode.commands.registerCommand('piro.hooks', async () => {
    const panel = vscode.window.createWebviewPanel(
      'piro.hooks',
      'Piro Hooks Manager',
      vscode.ViewColumn.One,
      { enableScripts: true }
    );

    panel.webview.html = getHooksHtml();

    panel.webview.onDidReceiveMessage(async (message) => {
      const { action, data } = message;

      if (action === 'list') {
        const hooks = await client.listHooks();
        panel.webview.postMessage({ action: 'hooksList', data: hooks });
      }

      if (action === 'register') {
        const hook = await client.registerHook(data);
        panel.webview.postMessage({ action: 'hookCreated', data: hook });
      }
    });
  });

  context.subscriptions.push(openHooksManager);
}

function getHooksHtml(): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { padding: 20px; font-family: sans-serif; }
    .hook-item { padding: 10px; margin: 5px 0; background: #f0f0f0; border-radius: 4px; }
    .hook-form { margin: 20px 0; padding: 15px; background: #f9f9f9; }
    .hook-input { width: 100%; padding: 8px; margin: 5px 0; }
  </style>
</head>
<body>
  <h2>Hooks</h2>
  <div class="hook-form">
    <h3>Create Hook</h3>
    <select id="trigger" class="hook-input">
      <option value="on_save">On File Save</option>
      <option value="on_build">On Build</option>
      <option value="pre_commit">Pre Commit</option>
      <option value="on_error">On Error</option>
    </select>
    <input id="pattern" class="hook-input" placeholder="File pattern (e.g., *.ts)">
    <input id="action" class="hook-input" placeholder="Action (e.g., run agent, notify)">
    <button onclick="createHook()">Create Hook</button>
  </div>
  <div id="hooks"></div>
  <script>
    function listHooks() { vscode.postMessage({ action: 'list' }); }
    function createHook() {
      const trigger = document.getElementById('trigger').value;
      const pattern = document.getElementById('pattern').value;
      vscode.postMessage({ action: 'register', data: { trigger, pattern, enabled: true } });
    }
    window.addEventListener('message', e => {
      if (e.data.action === 'hooksList') {
        document.getElementById('hooks').innerHTML = e.data.data.map(h => 
          '<div class="hook-item">' + h.name + ' - ' + h.trigger + ' [' + (h.enabled ? 'ON' : 'OFF') + ']</div>'
        ).join('');
      }
    });
    listHooks();
  </script>
</body>
</html>
  `;
}