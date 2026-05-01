import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

function createPool(options?: {
  ssl?: boolean | Record<string, unknown>;
}): Pool {
  return new Pool({
    connectionString: databaseUrl,
    ssl: options?.ssl,
  });
}

let pool = createPool();

const roles = ['ADMIN', 'VENDOR', 'CUSTOMER'];

async function main() {
  let client: PoolClient;

  try {
    client = await pool.connect();
  } catch (error: unknown) {
    const isSelfSignedError =
      error instanceof Error &&
      'code' in error &&
      error.code === 'DEPTH_ZERO_SELF_SIGNED_CERT';
    const isSslNotSupportedError =
      error instanceof Error &&
      /does not support SSL connections/i.test(error.message);

    if (!isSelfSignedError && !isSslNotSupportedError) {
      throw error;
    }

    console.warn(
      isSelfSignedError
        ? 'Self-signed certificate detected. Retrying with rejectUnauthorized=false for seeding only.'
        : 'SSL is not supported by the database. Retrying without SSL for seeding only.',
    );

    await pool.end();
    pool = createPool({
      ssl: isSelfSignedError ? { rejectUnauthorized: false } : false,
    });
    client = await pool.connect();
  }

  try {
    for (const role of roles) {
      const existing = await client.query<{ id: string }>(
        'SELECT "id" FROM "Role" WHERE "role" = $1::"Roles" LIMIT 1',
        [role],
      );

      if (existing.rowCount && existing.rowCount > 0) {
        console.log(`Role already exists: ${role}`);
        continue;
      }

      const id = randomUUID();

      await client.query(
        'INSERT INTO "Role" ("id", "role") VALUES ($1, $2::"Roles")',
        [id, role],
      );

      console.log(`Seeded role: ${role}`);
    }
  } finally {
    client.release();
  }
}

main()
  .catch((error) => {
    console.error('Role seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
