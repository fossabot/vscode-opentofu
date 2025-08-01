// Copyright (c) The OpenTofu Authors
// SPDX-License-Identifier: MPL-2.0
// Copyright (c) 2024 HashiCorp, Inc.
// SPDX-License-Identifier: MPL-2.0

import { StatusBar } from 'wdio-vscode-service';
import { browser, expect } from '@wdio/globals';

import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('OpenTofu language tests', () => {
  let statusBar: StatusBar;

  before(async () => {
    const workbench = await browser.getWorkbench();
    statusBar = workbench.getStatusBar();

    const testFile = path.join(__dirname, '../../../', 'fixtures', `sample.tf`);
    browser.executeWorkbench((vscode, fileToOpen) => {
      vscode.commands.executeCommand('vscode.open', vscode.Uri.file(fileToOpen));
    }, testFile);
  });

  after(async () => {
    // TODO: Close the file
  });

  it('can detect correct language', async () => {
    expect(await statusBar.getCurrentLanguage()).toContain('OpenTofu');
  });
});
