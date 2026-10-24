#!/usr/bin/env node
// vault-system inventory: deterministic report of a vault, no LLM. Usage: node inventory.mjs <vault>
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || '.');
const SKIP = new Set(['.obsidian', '.trash', '.git', 'node_modules']);
const notes = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP.has(e.name)) walk(p); }
    else if (e.name.endsWith('.md')) notes.push(p);
  }
})(root);

const rel = (p) => path.relative(root, p).split(path.sep).join('/');
const byName = new Map(); // basename without .md -> [rel paths]
const info = new Map();
for (const p of notes) {
  const r = rel(p);
  const text = fs.readFileSync(p, 'utf8');
  const end = text.startsWith('---') ? text.indexOf('\n---', 3) : -1;
  const fm = end > 0 ? text.slice(3, end) : null;
  const keys = fm ? [...fm.matchAll(/^([A-Za-z_][\w-]*):/gm)].map((m) => m[1]) : [];
  const status = fm ? (fm.match(/^status:\s*(.+)$/m) || [])[1] : undefined;
  // note links only: skip code (examples like [[nota-vigente]]) and links to attachments (png, pdf, ...)
  const body = text.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
  // inside a markdown table the alias separator is escaped as \| : drop that trailing backslash
  const links = [...body.matchAll(/\[\[([^\]|#]+)(?:[#|][^\]]*)?\]\]/g)].map((m) => m[1].trim().replace(/\\$/, '')).filter((l) => !/\.(?!md$)[a-z0-9]{2,5}$/i.test(l));
  info.set(r, { keys, status, links, isIndex: /(^|\/)INDEX\.md$/i.test(r), top: r.split('/')[0] });
  const base = path.basename(r, '.md');
  byName.set(base, [...(byName.get(base) || []), r]);
}
const resolve = (link) => {
  const clean = link.replace(/\.md$/, '');
  if (info.has(clean + '.md')) return clean + '.md';
  const hits = byName.get(path.posix.basename(clean));
  return hits && hits.length ? hits[0] : null;
};

const perTop = {};
for (const [, i] of info) perTop[i.top] = (perTop[i.top] || 0) + 1;
const keyCount = {};
const statusCount = {};
const noFm = [];
const linkedFromIndex = new Set();
const unresolved = [];
for (const [r, i] of info) {
  if (!i.keys.length) noFm.push(r);
  for (const k of i.keys) keyCount[k] = (keyCount[k] || 0) + 1;
  if (i.status) statusCount[i.status] = (statusCount[i.status] || 0) + 1;
  for (const l of i.links) {
    const t = resolve(l);
    if (!t) unresolved.push(`${r} -> [[${l}]]`);
    else if (i.isIndex) linkedFromIndex.add(t);
  }
}
const orphans = [...info.keys()].filter((r) => !info.get(r).isIndex && !linkedFromIndex.has(r) && !r.startsWith('Arquivo/') && !/^(AGENTS|CLAUDE)\.md$/.test(r));
const dirs = {};
for (const r of info.keys()) { const d = path.posix.dirname(r); dirs[d] = [...(dirs[d] || []), path.posix.basename(r)]; }
const stateLike = (f) => /estado|status|decis|adr|roadmap/i.test(f);
const candidates = Object.entries(dirs)
  .filter(([d, files]) => d !== '.' && (files.length >= 5 || files.some(stateLike)))
  .map(([d, files]) => `${d} (${files.length} notas${files.some(stateLike) ? ', tem nota de estado ou decisão' : ''})`);

const list = (arr, max = 40) => (arr.length ? arr.slice(0, max).map((x) => `- ${x}`).join('\n') + (arr.length > max ? `\n- ... e mais ${arr.length - max}` : '') : '- nenhuma');
const counts = (obj) => Object.entries(obj).sort((a, b) => b[1] - a[1]).map(([k, v]) => `- ${v}  ${k}`).join('\n') || '- nenhum';
console.log(`# Inventário do vault: ${root}\n`);
console.log(`Notas: ${notes.length}\n`);
console.log('## Notas por pasta de topo\n');
console.log(counts(perTop));
console.log('\n## Chaves de frontmatter em uso\n');
console.log(counts(keyCount));
console.log('\n## Valores de status\n');
console.log(counts(statusCount));
console.log(`\n## Notas sem frontmatter (${noFm.length})\n`);
console.log(list(noFm));
console.log(`\n## Notas que nenhum INDEX cita, fora de Arquivo/ (${orphans.length})\n`);
console.log(list(orphans));
console.log(`\n## Links não resolvidos (${unresolved.length})\n`);
console.log(list(unresolved));
console.log(`\n## Pastas candidatas a projeto (${candidates.length})\n`);
console.log(list(candidates, 60));
