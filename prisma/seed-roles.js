"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_crypto_1 = require("node:crypto");
const pg_1 = require("pg");
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
}
function createPool(options) {
    return new pg_1.Pool({
        connectionString: databaseUrl,
        ssl: options?.ssl,
    });
}
let pool = createPool();
const roles = ['ADMIN', 'VENDOR', 'CUSTOMER'];
async function main() {
    let client;
    try {
        client = await pool.connect();
    }
    catch (error) {
        const isSelfSignedError = error instanceof Error &&
            'code' in error &&
            error.code === 'DEPTH_ZERO_SELF_SIGNED_CERT';
        const isSslNotSupportedError = error instanceof Error &&
            /does not support SSL connections/i.test(error.message);
        if (!isSelfSignedError && !isSslNotSupportedError) {
            throw error;
        }
        console.warn(isSelfSignedError
            ? 'Self-signed certificate detected. Retrying with rejectUnauthorized=false for seeding only.'
            : 'SSL is not supported by the database. Retrying without SSL for seeding only.');
        await pool.end();
        pool = createPool({
            ssl: isSelfSignedError ? { rejectUnauthorized: false } : false,
        });
        client = await pool.connect();
    }
    try {
        for (const role of roles) {
            const existing = await client.query('SELECT "id" FROM "Role" WHERE "role" = $1::"Roles" LIMIT 1', [role]);
            if (existing.rowCount && existing.rowCount > 0) {
                console.log(`Role already exists: ${role}`);
                continue;
            }
            const id = (0, node_crypto_1.randomUUID)();
            await client.query('INSERT INTO "Role" ("id", "role") VALUES ($1, $2::"Roles")', [id, role]);
            console.log(`Seeded role: ${role}`);
        }
    }
    finally {
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
//# sourceMappingURL=seed-roles.js.map