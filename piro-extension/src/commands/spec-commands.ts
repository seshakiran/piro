/**
 * Spec Commands
 */

import * as vscode from 'vscode';
import type { PiroClient } from '../api/piro-client';

/**
 * Register spec commands
 */
export function registerSpecCommands(
  context: vscode.ExtensionContext,
  client: PiroClient
): void {
  // Open Spec Builder
  const openSpecBuilder = vscode.commands.registerCommand('piro.specs', async () => {
    try {
      // Get or create webview
      const panel = vscode.window.createWebviewPanel(
        'piro.specs',
        'Piro Spec Builder',
        vscode.ViewColumn.One,
        { enableScripts: true }
      );

      panel.webview.html = getSpecBuilderHtml();

      // Handle messages from webview
      panel.webview.onDidReceiveMessage(async (message) => {
        const { action, data } = message;

        switch (action) {
          case 'generate':
            try {
              const spec = await client.generateSpec(data.description);
              panel.webview.postMessage({ action: 'specCreated', data: spec });
            } catch (error) {
              panel.webview.postMessage({ action: 'error', data: String(error) });
            }
            break;

          case 'approve':
            try {
              await client.approveSpec(data.id);
              panel.webview.postMessage({ action: 'specApproved', data: data.id });
            } catch (error) {
              panel.webview.postMessage({ action: 'error', data: String(error) });
            }
            break;

          case 'list':
            try {
              const specs = await client.listSpecs();
              panel.webview.postMessage({ action: 'specsList', data: specs });
            } catch (error) {
              panel.webview.postMessage({ action: 'error', data: String(error) });
            }
            break;
        }
      });
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to open Spec Builder: ${error}`);
    }
  });

  // Generate spec from selection
  const generateFromSelection = vscode.commands.registerCommand(
    'piro.generateSpec',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('No active editor');
        return;
      }

      const selection = editor.selection;
      const text = editor.document.getText(selection);

      if (!text) {
        vscode.window.showWarningMessage('No text selected');
        return;
      }

      try {
        const spec = await client.generateSpec(text);
        vscode.window.showInformationMessage(
          `Spec created: ${spec.name} (${spec.id})`
        );
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to generate spec: ${error}`);
      }
    }
  );

  context.subscriptions.push(openSpecBuilder, generateFromSelection);
}

/**
 * Get Spec Builder HTML
 */
function getSpecBuilderHtml(): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .header {
      margin-bottom: 20px;
    }
    .description {
      width: 100%;
      height: 150px;
      margin-bottom: 10px;
      padding: 10px;
      font-size: 14px;
    }
    .generate-btn {
      padding: 10px 20px;
      background: #6c5ce7;
      color: white;
      border: none;
      cursor: pointer;
    }
    .specs-list {
      margin-top: 20px;
    }
    .spec-item {
      padding: 10px;
      margin: 5px 0;
      background: #f5f5f5;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h2>Piro Spec Builder</h2>
    <p>Describe the feature you want to build:</p>
  </div>
  
  <textarea id="description" class="description" placeholder="Example: Create a user authentication system with login, logout, and password reset. Should support email and OAuth. Must be secure and scalable..."></textarea>
  
  <button class="generate-btn" onclick="generateSpec()">Generate Spec</button>
  
  <div id="specs-list" class="specs-list"></div>
  
  <script>
    function generateSpec() {
      const desc = document.getElementById('description').value;
      vscode.postMessage({ action: 'generate', data: { description: desc } });
    }
    
    function listSpecs() {
      vscode.postMessage({ action: 'list', data: {} });
    }
    
    function approveSpec(id) {
      vscode.postMessage({ action: 'approve', data: { id } });
    }
    
    window.addEventListener('message', (event) => {
      const { action, data } = event.data;
      
      if (action === 'specCreated') {
        document.getElementById('specs-list').innerHTML += 
          '<div class="spec-item"><strong>' + data.name + '</strong> - ' + data.status + 
          ' <button onclick="approveSpec(\\'' + data.id + '\\')">Approve</button></div>';
      }
      
      if (action === 'specsList') {
        document.getElementById('specs-list').innerHTML = data.map(spec => 
          '<div class="spec-item"><strong>' + spec.name + '</strong> - ' + spec.status + '</div>'
        ).join('');
      }
    });
  </script>
</body>
</html>
  `;
}