function num(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    throw new Error(`${name} must be a number, got "${raw}"`);
  }
  return n;
}

function str(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const config = {
  port: num("PORT", 8080),
  maxWork: num("MAX_WORK", 3_000_000),
  shutdownGraceMs: num("SHUTDOWN_GRACE_MS", 5_000),
  version: str("APP_VERSION", "dev"),
  db: {
    adapter: "postgres",
    hostname: str("DB_HOST", "localhost"),
    port: num("DB_PORT", 5432),
    database: str("DB_NAME", "appdb"),
    username: str("DB_USER", "postgres"),
    password: str("DB_PASSWORD", ""),
    max: num("DB_POOL_MAX", 4),
    connectionTimeout: num("DB_CONNECT_TIMEOUT", 3),
  },
} as const;

export type Config = typeof config;
