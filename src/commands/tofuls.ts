// Copyright (c) The OpenTofu Authors
// SPDX-License-Identifier: MPL-2.0
// Copyright (c) 2024 HashiCorp, Inc.
// SPDX-License-Identifier: MPL-2.0

import * as vscode from 'vscode';

import { config, getScope } from '../utils/vscode';

export class TofuLSCommands implements vscode.Disposable {
  private commands: vscode.Disposable[];

  constructor() {
    this.commands = [
      vscode.workspace.onDidChangeConfiguration(async (event: vscode.ConfigurationChangeEvent) => {
        if (event.affectsConfiguration('opentofu') || event.affectsConfiguration('tofu-ls')) {
          const reloadMsg = 'Reload VSCode window to apply language server changes';
          const selected = await vscode.window.showInformationMessage(reloadMsg, 'Reload');
          if (selected === 'Reload') {
            vscode.commands.executeCommand('workbench.action.reloadWindow');
          }
        }
      }),
      vscode.commands.registerCommand('opentofu.enableLanguageServer', async () => {
        if (config('opentofu').get('languageServer.enable') === true) {
          return;
        }

        const scope: vscode.ConfigurationTarget = getScope('opentofu', 'languageServer.enable');

        await config('opentofu').update('languageServer.enable', true, scope);
      }),
      vscode.commands.registerCommand('opentofu.disableLanguageServer', async () => {
        if (config('opentofu').get('languageServer.enable') === false) {
          return;
        }

        const scope: vscode.ConfigurationTarget = getScope('opentofu', 'languageServer.enable');

        await config('opentofu').update('languageServer.enable', false, scope);
      }),
      vscode.commands.registerCommand('opentofu.openSettingsJson', async () => {
        // this opens the default settings window (either UI or json)
        const s = await vscode.workspace.getConfiguration('workbench').get('settings.editor');
        if (s === 'json') {
          return await vscode.commands.executeCommand('workbench.action.openSettingsJson', {
            revealSetting: { key: 'opentofu.languageServer.enable', edit: true },
          });
        } else {
          return await vscode.commands.executeCommand('workbench.action.openSettings', {
            focusSearch: true,
            query: '@ext:opentofu.opentofu',
          });
        }
      }),
    ];
  }

  dispose() {
    this.commands.forEach((c) => c.dispose());
  }
}
