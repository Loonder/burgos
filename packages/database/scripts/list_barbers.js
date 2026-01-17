const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function listBarbers() {
    await client.connect();
    try {
        const res = await client.query("SELECT id, name, role, avatar_url FROM users WHERE role = 'barbeiro'");
        console.log('BARBERS:', JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

listBarbers();
