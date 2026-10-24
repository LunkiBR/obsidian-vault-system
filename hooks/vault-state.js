#!/usr/bin/env node
// Claude Code hook (SessionStart + UserPromptSubmit). Deterministic, no LLM.
// The vault path comes from VAULT_DIR (the env block of ~/.claude/settings.json; install.mjs sets it).
// SessionStart: prints the project registry (Sistema/projetos.md) and flags ESTADO-ATUAL.md files not registered.
// UserPromptSubmit: if the prompt names a registered project (alias match), prints a 2-line pointer once per session per project.
'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const VAULT = process.env.VAULT_DIR ? process.env.VAULT_DIR.replace(/[\\/]+$/, '') : '';
const REGISTRY = path.join(VAULT, 'Sistema', 'projetos.md');
const SKIP = new Set(['.obsidian', '.trash', '.git', 'node_modules']);
const TOOLS = 'ToolSearch "select:mcp__obsidian__vault_list,mcp__obsidian__vault_read,mcp__obsidian__vault_get_document_map,mcp__obsidian__search_query,mcp__obsidian__vault_patch,mcp__obsidian__vault_append,mcp__obsidian__vault_move"';

// Event JSON arrives on stdin. readFileSync(0) is unreliable on Windows pipes, so stream it.
function readStdinJson() {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) return resolve({});
    let raw = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => { raw += c; });
    process.stdin.on('end', () => { try { resolve(raw.trim() ? JSON.parse(raw) : {}); } catch { resolve({}); } });
    process.stdin.on('error', () => resolve({}));
    setTimeout(() => resolve({}), 2000).unref();
  });
}

function walk(dir, depth, out) {
  if (depth > 6) return;
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    // Cloud-synced placeholders are reparse points: readdir reports them as symlinks, so stat to learn what they are.
    let isDir = e.isDirectory();
    if (!isDir && e.isSymbolicLink()) { try { isDir = fs.statSync(p).isDirectory(); } catch { continue; } }
    if (isDir) { if (!SKIP.has(e.name)) walk(p, depth + 1, out); }
    else if (e.name === 'ESTADO-ATUAL.md') out.push(p);
  }
}

function atualizado(file) {
  try {
    const m = fs.readFileSync(file, 'utf8').slice(0, 800).match(/^atualizado:\s*(\S+)/m);
    if (m) return m[1];
  } catch { /* fall through */ }
  try { return fs.statSync(file).mtime.toISOString().slice(0, 10); } catch { return '????-??-??'; }
}

// Parses the markdown table in Sistema/projetos.md: | slug | aliases | pasta | repo | uma linha |
function loadRegistry() {
  let text;
  try { text = fs.readFileSync(REGISTRY, 'utf8'); } catch { return []; }
  const rows = [];
  for (const line of text.split('\n')) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 5 || cells[0] === 'slug' || /^-+$/.test(cells[0])) continue;
    const split = (s) => s.split(';').map((x) => x.trim()).filter((x) => x && x !== '-');
    rows.push({ slug: cells[0], aliases: [cells[0], ...split(cells[1])], pasta: cells[2], repos: split(cells[3]), resumo: cells[4] });
  }
  return rows;
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function mentions(text, alias) {
  // whole-word match, unicode-aware, case-insensitive
  return new RegExp(`(^|[^\\p{L}\\p{N}_])${esc(alias)}(?=$|[^\\p{L}\\p{N}_])`, 'iu').test(text);
}
function underRepo(cwd, repos) {
  const c = (cwd || '').toLowerCase().replace(/\//g, '\\');
  return repos.some((r) => c.startsWith(r.toLowerCase().replace(/\//g, '\\')));
}

function sessionStart(input, registry) {
  const files = [];
  walk(VAULT, 0, files);
  if (files.length === 0 && registry.length === 0) {
    console.log(`Vault: nothing found under ${VAULT} (is the drive mounted? is Sistema/projetos.md there?)`);
    return;
  }
  const dates = new Map(files.map((f) => [path.relative(VAULT, path.dirname(f)).split(path.sep).join('/'), atualizado(f)]));
  console.log('Vault registry (Sistema/projetos.md): slug | aliases | ESTADO-ATUAL atualizado | pasta | resumo. Read the project\'s ESTADO-ATUAL.md before asking the user anything about it.');
  for (const r of registry) {
    console.log(`- ${r.slug} | ${r.aliases.slice(1).join('; ')} | ${dates.get(r.pasta) || 'sem ESTADO-ATUAL'} | ${r.pasta} | ${r.resumo}`);
  }
  const registered = new Set(registry.map((r) => r.pasta));
  for (const [rel, when] of dates) if (!registered.has(rel)) console.log(`- (unregistered, add a row) | ${when} | ${rel}/ESTADO-ATUAL.md`);
  const here = registry.find((r) => underRepo(input.cwd, r.repos));
  if (here) console.log(`cwd is inside project "${here.slug}": its vault folder is ${here.pasta}/.`);
  console.log(`Rules: Sistema/protocolo-memoria.md. Navigate INDEX.md -> MOC -> note, never scan. Vault tools: ${TOOLS}.`);
}

function userPrompt(input, registry) {
  const prompt = String(input.prompt || '');
  if (!prompt) return;
  const stateFile = path.join(os.tmpdir(), `claude-vault-state-${input.session_id || 'nosession'}.json`);
  let seen = [];
  try { seen = JSON.parse(fs.readFileSync(stateFile, 'utf8')); } catch { /* first prompt */ }
  const hits = registry.filter((r) => r.aliases.some((a) => mentions(prompt, a)));
  const fresh = hits.filter((r) => !seen.includes(r.slug));
  if (fresh.length === 0) return;
  for (const r of fresh) {
    console.log(`[vault] The prompt names project "${r.slug}" (${r.pasta}/). Before asking the user any fact about it, read ${r.pasta}/ESTADO-ATUAL.md and run search_query on that folder; the answer is probably already there.`);
    console.log(`[vault] If the user states something new about "${r.slug}" (a fact, a decision, a preference, a path) that the vault lacks, append it dated to ${r.pasta}/capturas.md in this same turn and say so. A changed decision goes through /decisao instead.`);
  }
  try { fs.writeFileSync(stateFile, JSON.stringify([...seen, ...fresh.map((r) => r.slug)])); } catch { /* best effort */ }
}

readStdinJson().then((input) => {
  if (!VAULT) { console.log('vault-state: VAULT_DIR is not set (env block of ~/.claude/settings.json); run vault-system/scripts/install.mjs --vault <path>.'); return; }
  const registry = loadRegistry();
  const event = input.hook_event_name || process.argv[2] || 'SessionStart';
  if (event === 'UserPromptSubmit') userPrompt(input, registry);
  else sessionStart(input, registry);
});
