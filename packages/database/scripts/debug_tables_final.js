const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

async function debug() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    try {
        const tables = ['products', 'missions', 'active_missions', 'plans'];
        console.log('--- Checking Tables ---');

        for (const t of tables) {
            const res = await client.query(`
                SELECT to_regclass('public.${t}') as exists;
            `);
            const exists = res.rows[0].exists;
            console.log(`Table '${t}': ${exists ? '✅ EXISTS' : '❌ MISSING'}`);

            if (exists && t === 'products') {
                // Check columns for products
                const cols = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'products'`);
                console.log(' Products Columns:', cols.rows.map(r => r.column_name).join(', '));
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
debug();
