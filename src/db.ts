import { SQL } from "bun";
import { config } from "./config";
import { log } from "./logger";

let sql = new SQL(config.db);
let schemaReady: Promise<void> | undefined;

export function rebuildClient(): void {
  log.warn("rebuilding db pool");
  const old = sql;
  sql = new SQL(config.db);
  schemaReady = undefined;
  old.close({ timeout: 0 }).catch(() => {});
}

export function ensureSchema(): Promise<void> {
  schemaReady ??= sql`CREATE TABLE IF NOT EXISTS visits (
      id BIGSERIAL PRIMARY KEY,
      ts TIMESTAMPTZ NOT NULL DEFAULT now()
    )`
    .then(() => undefined)
    .catch((err) => {
      schemaReady = undefined;
      throw err;
    });
  return schemaReady;
}

export async function recordVisit(): Promise<number> {
  await ensureSchema();
  await sql`INSERT INTO visits DEFAULT VALUES`;
  const rows = await sql`SELECT count(*)::int AS count FROM visits`;
  return rows[0].count;
}

export async function ping(): Promise<boolean> {
  try {
    await sql`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export async function closePool(): Promise<void> {
  await sql.close({ timeout: 5 }).catch(() => {});
}
