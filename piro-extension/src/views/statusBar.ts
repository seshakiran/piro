/**
 * Piro Status Bar
 */

import * as vscode from 'vscode';
import type { PiroClient } from '../api/piro-client';

export class PiroStatusBar {
  private item: vscode.StatusBarItem;
  private client: PiroClient;

  constructor(client: PiroClient) {
    this.client = client;
    this.item = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this.item.text = '$(robot) Piro';
    this.item.tooltip = 'Piro - Spec-driven AI coding agent';
    this.item.command = 'piro.specs';

    this.update();
    this.item.show();
  }

  update(): void {
    if (this.client.isConnected()) {
      this.item.text = '$(robot) Piro: Connected';
      this.item.color = '#6c5ce7';
    } else {
      this.item.text = '$(robot) Piro: Disconnected';
      this.item.color = '#ff6b6b';
    }
  }

  setStatus(text: string, color?: string): void {
    this.item.text = text;
    if (color) this.item.color = color;
  }

  dispose(): void {
    this.item.dispose();
  }
}