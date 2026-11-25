// =============================================================================
// HEKAYATY — DB Client
// =============================================================================
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/index';

const DATABASE_URL = process.env['DATABASE_URL'];
if (!DATABASE_URL) {
  console.warn('⚠️ [DB Warning]: DATABASE_URL is not set. Operating in offline/memory mode.');
}

const pool = new Pool(DATABASE_URL ? { connectionString: DATABASE_URL, max: 10 } : {});

export const db = drizzle(pool, { schema });
export * from './schema/index';
