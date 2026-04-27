/**
 * Deploy Commands
 */

import * as vscode from 'vscode';
import type { PiroClient } from '../api/piro-client';

export function registerDeployCommands(
  context: vscode.ExtensionContext,
  client: PiroClient
): void {
  // Open Deploy Panel
  const openDeployPanel = vscode.commands.registerCommand('piro.deploy', async () => {
    const panel = vscode.window.createWebviewPanel(
      'piro.deploy',
      'Piro Cloud Deploy',
      vscode.ViewColumn.One,
      { enableScripts: true }
    );

    panel.webview.html = getDeployHtml();

    panel.webview.onDidReceiveMessage(async (message) => {
      const { action, data } = message;

      if (action === 'deploy') {
        try {
          let result: string;
          const { provider, type, config } = data;

          switch (provider) {
            case 'aws':
              if (type === 'lambda') result = await client.deployLambda(config);
              else if (type === 'ecs') result = await client.deployEcs(config);
              break;
            case 'gcp':
              result = await client.deployToGcp(config);
              break;
            case 'azure':
              result = await client.deployToAzure(config);
              break;
          }

          panel.webview.postMessage({ action: 'deployed', data: result });
        } catch (error) {
          panel.webview.postMessage({ action: 'error', data: String(error) });
        }
      }
    });
  });

  context.subscriptions.push(openDeployPanel);
}

function getDeployHtml(): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { padding: 20px; font-family: sans-serif; }
    .providers { display: flex; gap: 20px; margin-bottom: 20px; }
    .provider { flex: 1; padding: 20px; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; }
    .provider:hover { border-color: #6c5ce7; }
    .provider.selected { border-color: #6c5ce7; background: #f5f0ff; }
    .deploy-form { display: none; padding: 20px; background: #f9f9f9; }
    .deploy-form.active { display: block; }
    .form-group { margin: 10px 0; }
    .form-input { width: 100%; padding: 8px; }
    .deploy-btn { padding: 10px 30px; background: #6c5ce7; color: white; border: none; cursor: pointer; }
  </style>
</head>
<body>
  <h2>Cloud Deploy</h2>
  
  <div class="providers">
    <div class="provider" onclick="selectProvider('aws')">
      <h3>AWS</h3>
      <p>Lambda, ECS, S3, CloudFormation</p>
    </div>
    <div class="provider" onclick="selectProvider('gcp')">
      <h3>GCP</h3>
      <p>Cloud Functions, Cloud Run</p>
    </div>
    <div class="provider" onclick="selectProvider('azure')">
      <h3>Azure</h3>
      <p>Functions, Containers</p>
    </div>
  </div>
  
  <div id="aws-form" class="deploy-form">
    <h3>AWS Deployment</h3>
    <select id="aws-type" class="form-input">
      <option value="lambda">Lambda Function</option>
      <option value="ecs">ECS Service</option>
    </select>
    <input id="aws-function-name" class="form-input" placeholder="Function Name">
    <input id="aws-runtime" class="form-input" placeholder="Runtime (nodejs18.x)">
    <button class="deploy-btn" onclick="deploy('aws')">Deploy</button>
  </div>
  
  <div id="gcp-form" class="deploy-form">
    <h3>GCP Deployment</h3>
    <input id="gcp-name" class="form-input" placeholder="Function Name">
    <input id="gcp-runtime" class="form-input" placeholder="Runtime">
    <button class="deploy-btn" onclick="deploy('gcp')">Deploy</button>
  </div>
  
  <div id="azure-form" class="deploy-form">
    <h3>Azure Deployment</h3>
    <input id="azure-name" class="form-input" placeholder="Function Name">
    <input id="azure-runtime" class="form-input" placeholder="Runtime">
    <button class="deploy-btn" onclick="deploy('azure')">Deploy</button>
  </div>
  
  <div id="result"></div>
  
  <script>
    function selectProvider(p) {
      document.querySelectorAll('.provider').forEach(el => el.classList.remove('selected'));
      event.target.closest('.provider').classList.add('selected');
      document.querySelectorAll('.deploy-form').forEach(el => el.classList.remove('active'));
      document.getElementById(p + '-form').classList.add('active');
    }
    
    function deploy(provider) {
      const config = {};
      if (provider === 'aws') {
        config.functionName = document.getElementById('aws-function-name').value;
        config.runtime = document.getElementById('aws-runtime').value;
      }
      vscode.postMessage({ action: 'deploy', data: { provider, type: 'lambda', config } });
    }
    
    window.addEventListener('message', e => {
      if (e.data.action === 'deployed') {
        document.getElementById('result').innerHTML = '<h3 style="color:green">Deployed!</h3><pre>' + e.data.data + '</pre>';
      }
    });
  </script>
</body>
</html>
  `;
}