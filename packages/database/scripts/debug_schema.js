const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

async function debug() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    try {
        console.log('--- PRODUCTS COLUMNS ---');
        const prodCols = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'products';
        `);
        prodCols.rows.forEach(r => console.log(r.column_name));

        console.log('\n--- USERS COLUMNS ---');
        const userCols = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `);
        userCols.rows.forEach(r => console.log(r.column_name));

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await client.end();
    }
}

debug();
