const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

async function check() {
    console.log('Connecting to DB...');
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    try {
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);

        console.log('📂 Tables in DB:');
        res.rows.forEach(r => console.log(` - ${r.table_name}`));

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await client.end();
    }
}

check();
