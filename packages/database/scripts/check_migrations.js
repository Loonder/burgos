const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

async function check() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    try {
        const res = await client.query('SELECT filename, applied_at FROM _migrations ORDER BY filename');
        console.table(res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
check();
