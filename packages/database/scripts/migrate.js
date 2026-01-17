// Burgos Experience System - Database Migration Script
// Burgos Experience System - Database Migration Script
const path = require('path');
const fs = require('fs');

// Debugging .env resolution
const relativeEnvPath = path.join(__dirname, '../../../.env');
const cwdEnvPath = path.resolve(process.cwd(), '.env');

console.log('--- DEBUG INFO ---');
console.log('Script location:', __dirname);
console.log('CWD:', process.cwd());
console.log('Looking for .env at relative path:', relativeEnvPath);
console.log('Exists?', fs.existsSync(relativeEnvPath));
console.log('Looking for .env at CWD path:', cwdEnvPath);
console.log('Exists?', fs.existsSync(cwdEnvPath));

const envPath = fs.existsSync(relativeEnvPath) ? relativeEnvPath : cwdEnvPath;
console.log('Selected .env path:', envPath);

const result = require('dotenv').config({ path: envPath, debug: true });
if (result.error) {
    console.log('Dotenv error:', result.error);
} else {
    console.log('Dotenv parsed keys:', Object.keys(result.parsed || {}));
}
console.log('DATABASE_URL value:', process.env.DATABASE_URL ? 'Defined (Hidden)' : 'UNDEFINED');
console.log('------------------');

const { Client } = require('pg');

async function migrate() {
    // Check for variable again
    if (!process.env.DATABASE_URL) {
        console.error('❌ CRITICAL: DATABASE_URL is missing. Migration cannot proceed.');
        process.exit(1);
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    console.log('Using database URL:', process.env.DATABASE_URL ? 'Defined' : 'UNDEFINED');

    try {
        console.log('Connecting...');
        await client.connect();
        console.log('🔌 Connected to database');

        // 1. Create migrations table
        await client.query(`
            CREATE TABLE IF NOT EXISTS _migrations (
                id SERIAL PRIMARY KEY,
                filename TEXT UNIQUE NOT NULL,
                applied_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // 2. Get applied migrations
        const { rows: appliedRows } = await client.query('SELECT filename FROM _migrations');
        const appliedMigrations = new Set(appliedRows.map(r => r.filename));

        const migrationsDir = path.join(__dirname, '..', 'migrations');
        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        console.log(`📦 Found ${files.length} migrations files`);

        for (const file of files) {
            if (appliedMigrations.has(file)) {
                console.log(`⏭ Skipping ${file} (already applied)`);
                continue;
            }

            console.log(`▶ Running ${file}...`);
            const sqlPath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(sqlPath, 'utf8');
            try {
                await client.query('BEGIN'); // Transaction
                await client.query(sql);
                await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
                await client.query('COMMIT');
                console.log(`✔ ${file} done`);
            } catch (err) {
                await client.query('ROLLBACK');

                // Special handling for 001 already existing
                if (file.includes('001') && (err.message.includes('already exists') || err.message.includes('duplicate object'))) {
                    console.warn(`⚠ Warning in ${file}: Schema seems to exist. Marking as applied.`);
                    await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
                } else {
                    console.error(`❌ FATAL ERROR in ${file}: ${err.message}`);
                    process.exit(1);
                }
            }
        }

        console.log('✅ Migrations process finished!');
    } catch (error) {
        console.error('❌ Migration FATAL error:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

migrate();
