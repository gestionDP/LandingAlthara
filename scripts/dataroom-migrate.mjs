#!/usr/bin/env node
/**
 * Runs the dataroom SQL migrations against DATABASE_URL (idempotent).
 * Usage: DATABASE_URL=postgres://... npm run dataroom:migrate
 * Alternative: psql "$DATABASE_URL" -f src/dataroom/db/migrations/0001_dataroom_init.sql
 */
import { neon } from '@neondatabase/serverless';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'dataroom', 'db', 'migrations');
const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

/** Split SQL into statements, respecting dollar-quoted blocks ($$, $fn$, ...). */
function splitStatements(sqlText) {
  const statements = [];
  let current = '';
  let dollarTag = null;
  let i = 0;
  while (i < sqlText.length) {
    if (dollarTag) {
      const end = sqlText.indexOf(dollarTag, i);
      if (end === -1) { current += sqlText.slice(i); break; }
      current += sqlText.slice(i, end + dollarTag.length);
      i = end + dollarTag.length;
      dollarTag = null;
      continue;
    }
    const ch = sqlText[i];
    if (ch === '$') {
      const m = /^\$[A-Za-z_]*\$/.exec(sqlText.slice(i));
      if (m) { dollarTag = m[0]; current += m[0]; i += m[0].length; continue; }
    }
    if (ch === '-' && sqlText[i + 1] === '-') {
      const nl = sqlText.indexOf('\n', i);
      i = nl === -1 ? sqlText.length : nl + 1;
      continue;
    }
    if (ch === ';') {
      if (current.trim()) statements.push(current.trim());
      current = '';
      i++;
      continue;
    }
    current += ch;
    i++;
  }
  if (current.trim()) statements.push(current.trim());
  return statements;
}

const sql = neon(url);
const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

for (const file of files) {
  console.log(`Applying ${file}...`);
  const statements = splitStatements(readFileSync(join(dir, file), 'utf8'));
  for (const [idx, stmt] of statements.entries()) {
    try {
      await sql.query(stmt);
    } catch (err) {
      console.error(`  Statement ${idx + 1} failed:\n${stmt.slice(0, 200)}\n  -> ${err.message}`);
      process.exit(1);
    }
  }
  console.log(`  OK (${statements.length} statements)`);
}
console.log('Dataroom migrations applied.');
