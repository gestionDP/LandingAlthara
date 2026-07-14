import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { env } from '../config';

let _db: ReturnType<typeof createDb> | null = null;

function createDb() {
  const sql = neon(env.databaseUrl());
  return drizzle(sql, { schema });
}

/** Lazy singleton — safe in serverless, avoids connecting at build time. */
export function db() {
  if (!_db) _db = createDb();
  return _db;
}

export { schema };
