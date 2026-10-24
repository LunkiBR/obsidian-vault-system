#!/usr/bin/env node
// vault-system install: copies the hook, registers VAULT_DIR and the two hooks in ~/.claude/settings.json,
// copies the commands. Idempotent. Usage: node install.mjs --vault <path> [--dry-run]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const vi = args.indexOf('--vault');
const vaultArg = vi >= 0 ? args[vi + 1] : undefined;
const dry = args.includes('--dry-run');
if (!vaultArg) { console.error('usage: node install.mjs --vault <path> [--dry-run]'); process.exit(2); }
const vault = path.resolve(vaultArg);
if (!fs.existsSync(path.join(vault, 'Sistema', 'projetos.md'))) console.warn(`warning: ${vault} has no Sistema/projetos.md yet; the hook prints nothing useful until it exists`);

const kit = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const home = os.homedir();
const claudeDir = path.join(home, '.claude');
const hookDst = path.join(claudeDir, 'hooks', 'vault-state.js');
const settingsPath = path.join(claudeDir, 'settings.json');
const log = (m) => console.log((dry ? '[dry-run] ' : '') + m);

// 1. hook file
const hookSrc = fs.readFileSync(path.join(kit, 'hooks', 'vault-state.js'), 'utf8');
if (fs.existsSync(hookDst) && fs.readFileSync(hookDst, 'utf8') !== hookSrc) {
  const bak = hookDst + '.bak-' + new Date().toISOString().slice(0, 10);
  if (!dry) fs.copyFileSync(hookDst, bak);
  log(`existing hook differs: backup at ${bak}`);
}
if (!dry) { fs.mkdirSync(path.dirname(hookDst), { recursive: true }); fs.writeFileSync(hookDst, hookSrc); }
log(`hook -> ${hookDst}`);

// 2. settings.json: env.VAULT_DIR + hooks
let settings = {};
if (fs.existsSync(settingsPath)) settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
settings.env = settings.env || {};
settings.env.VAULT_DIR = vault;
settings.hooks = settings.hooks || {};
const cmd = `node "${hookDst.replace(/\\/g, '/')}"`;
const has = (list) => (list || []).some((g) => (g.hooks || []).some((h) => h.command === cmd));
if (!has(settings.hooks.SessionStart)) {
  settings.hooks.SessionStart = [...(settings.hooks.SessionStart || []), { matcher: 'startup|resume|clear|compact', hooks: [{ type: 'command', command: cmd, timeout: 10, statusMessage: 'Reading vault state...' }] }];
  log('settings.json: SessionStart hook added');
} else log('settings.json: SessionStart hook already present');
if (!has(settings.hooks.UserPromptSubmit)) {
  settings.hooks.UserPromptSubmit = [...(settings.hooks.UserPromptSubmit || []), { hooks: [{ type: 'command', command: cmd, timeout: 5 }] }];
  log('settings.json: UserPromptSubmit hook added');
} else log('settings.json: UserPromptSubmit hook already present');
if (!dry) fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
log(`settings.json: env.VAULT_DIR = ${vault}`);

// 3. commands
const cmdDir = path.join(claudeDir, 'commands');
if (!dry) fs.mkdirSync(cmdDir, { recursive: true });
for (const f of fs.readdirSync(path.join(kit, 'commands'))) {
  const dst = path.join(cmdDir, f);
  if (fs.existsSync(dst)) { log(`command ${f}: exists, left as is`); continue; }
  if (!dry) fs.copyFileSync(path.join(kit, 'commands', f), dst);
  log(`command ${f} -> ${dst}`);
}

// 4. CLAUDE.md section: shown, never written
const section = fs.readFileSync(path.join(kit, 'templates', 'claude-md-section.md'), 'utf8').replace(/<VAULT>/g, vault);
console.log('\nAdd this to ~/.claude/CLAUDE.md by hand (the agent shows it, you place it):\n');
console.log(section);
