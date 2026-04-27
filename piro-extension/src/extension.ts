/**
 * Piro Extension for VS Code
 * 
 * Connects VS Code with Piro Core for spec-driven AI coding
 */

import * as vscode from 'vscode';
import { PiroClient } from './api/piro-client';
import { registerSpecCommands } from './commands/spec-commands';
import { registerAgentCommands } from './commands/agent-commands';
import { registerHookCommands } from './commands/hook-commands';
import { registerDeployCommands } from './commands/deploy-commands';
import { PiroStatusBar } from './views/statusBar';

// Global state
let piroClient: PiroClient | null = null;
let statusBar: PiroStatusBar | null = null;

/**
 * Activate the extension
 */
export function activate(context: vscode.ExtensionContext): void {
  // Get configuration
  const config = vscode.workspace.getConfiguration('piro');
  const coreUrl = config.get<string>('coreUrl', 'http://localhost:3847');

  // Initialize Piro client
  piroClient = new PiroClient(coreUrl);

  // Connect to Piro Core
  const autoConnect = config.get<boolean>('autoConnect', true);
  if (autoConnect) {
    piroClient.connect().catch(err => {
      vscode.window.showWarningMessage(
        `Piro Core not available at ${coreUrl}. Run 'piro-core' to enable.`
      );
    });
  }

  // Initialize status bar
  statusBar = new PiroStatusBar(piroClient);

  // Register commands
  registerSpecCommands(context, piroClient);
  registerAgentCommands(context, piroClient);
  registerHookCommands(context, piroClient);
  registerDeployCommands(context, piroClient);

  // Show welcome message
  vscode.window.showInformationMessage('Piro extension activated!');

  // Subscriptions
  context.subscriptions.push({
    dispose: () => {
      piroClient?.disconnect();
    },
  });
}

/**
 * Deactivate the extension
 */
export function deactivate(): void {
  piroClient?.disconnect();
}