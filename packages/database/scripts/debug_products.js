const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

async function debug() {
    console.log('Connecting to DB...');
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    try {
        console.log('--- Checking Products Table Schema ---');
        const schema = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'products';
        `);
        console.table(schema.rows);

        console.log('--- Selecting All Products ---');
        const res = await client.query('SELECT * FROM products LIMIT 5');
        console.log('Rows found:', res.rowCount);
        console.log(res.rows);

    } catch (e) {
        console.error('❌ Error querying products:', e);
    } finally {
        await client.end();
    }
}

debug();
