# Copyright (c) The OpenTofu Authors
# SPDX-License-Identifier: MPL-2.0
# Copyright (c) 2024 HashiCorp, Inc.
# SPDX-License-Identifier: MPL-2.0

provider "vault" {
}

resource "vault_auth_backend" "b" {
}

module "local" {
  source = "./modules"
}
