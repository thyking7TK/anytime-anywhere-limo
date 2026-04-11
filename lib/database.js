import postgres from "postgres";

const connectionString =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.NEON_DATABASE_URL ||
  "";

function createClient() {
  if (!connectionString) {
    throw new Error(
      "Database connection is not configured. Add DATABASE_URL or POSTGRES_URL.",
    );
  }

  return postgres(connectionString, {
    prepare: false,
    max: 1,
  });
}

export function isDatabaseConfigured() {
  return Boolean(connectionString);
}

export function getDatabaseClient() {
  if (!globalThis.__anytimeAnywhereSql) {
    globalThis.__anytimeAnywhereSql = createClient();
  }

  return globalThis.__anytimeAnywhereSql;
}
