#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';

const envPath = fileURLToPath(new URL('../../../.env', import.meta.url));
config({ path: envPath });

const [, , command, ...args] = process.argv;

if (!command) {
  console.error('Usage: node run-with-root-env.mjs <command> [args...]');
  process.exit(1);
}

const result = spawnSync(command, args, {
  stdio: 'inherit',
  env: process.env,
});

process.exit(result.status ?? 1);