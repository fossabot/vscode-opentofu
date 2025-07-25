// Copyright (c) The OpenTofu Authors
// SPDX-License-Identifier: MPL-2.0
// Copyright (c) 2024 HashiCorp, Inc.
// SPDX-License-Identifier: MPL-2.0

import * as assert from 'assert';
import * as vscode from 'vscode';

import { activateExtension, getDocUri, open, testHover } from '../../helper';

suite('hover', () => {
  suite('core schema', function suite() {
    const docUri = getDocUri('main.tf');

    this.beforeAll(async () => {
      await open(docUri);
      await activateExtension();
    });

    teardown(async () => {
      await vscode.commands.executeCommand('workbench.action.closeAllEditors');
    });

    test('language is registered', async () => {
      const doc = await vscode.workspace.openTextDocument(docUri);
      assert.equal(doc.languageId, 'opentofu', 'document language should be `opentofu`');
    });

    test('returns docs for opentofu block', async () => {
      await testHover(docUri, new vscode.Position(0, 1), [
        new vscode.Hover(
          new vscode.MarkdownString(
            '**terraform** _Block_\n\n`terraform` block used to configure some high-level behaviors of OpenTofu',
          ),
          new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 9)),
        ),
      ]);
    });
  });

  suite('encryption block', function suite() {
    const docUri = getDocUri('encryption.tf');

    this.beforeAll(async () => {
      await open(docUri);
      await activateExtension();
    });

    teardown(async () => {
      await vscode.commands.executeCommand('workbench.action.closeAllEditors');
    });

    test('returns docs for encryption block', async () => {
      await testHover(docUri, new vscode.Position(6, 9), [
        new vscode.Hover(
          new vscode.MarkdownString(
            '**encryption** _Block, max: 1_\n\nState and Plan encryption configuration block\n\n[`encryption` on opentofu.org](https://opentofu.org/docs/language/state/encryption/#configuration)',
          ),
          new vscode.Range(new vscode.Position(6, 2), new vscode.Position(6, 12)),
        ),
      ]);
    });
  });

  suite('provider for_each', function suite() {
    const docUri = getDocUri('provider_foreach.tf');

    this.beforeAll(async () => {
      await open(docUri);
      await activateExtension();
    });

    teardown(async () => {
      await vscode.commands.executeCommand('workbench.action.closeAllEditors');
    });

    test('hovering for-each attribute at provider', async () => {
      await testHover(docUri, new vscode.Position(12, 2), [
        new vscode.Hover(
          new vscode.MarkdownString(
            '**for_each** _optional, map of any single type or set of string or object_\n\nA meta-argument that accepts a map or a set of strings, and creates an instance for each item in that map or set.\n\n**Note**: A given block cannot use both `count` and `for_each`.',
          ),
          new vscode.Range(new vscode.Position(12, 2), new vscode.Position(12, 35)),
        ),
      ]);
    });
  });
});
