// Copyright (c) The OpenTofu Authors
// SPDX-License-Identifier: MPL-2.0
// Copyright (c) 2024 HashiCorp, Inc.
// SPDX-License-Identifier: MPL-2.0

import * as vscode from 'vscode';

const requiredVersion = vscode.languages.createLanguageStatusItem('opentofu.requiredVersion', [
  { language: 'opentofu' },
  { language: 'opentofu-vars' },
]);
requiredVersion.name = 'OpenTofuRequiredVersion';
requiredVersion.detail = 'OpenTofu Required';

export function setVersion(version: string) {
  requiredVersion.text = version;
}

export function setReady() {
  requiredVersion.busy = false;
}

export function setWaiting() {
  requiredVersion.busy = true;
}
