const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function updateAvatars() {
    await client.connect();
    try {
        // START TRANSACTION
        await client.query('BEGIN');

        // Update Guilherme
        await client.query("UPDATE users SET avatar_url = '/barbers/guilherme.png' WHERE name = 'Guilherme' AND role = 'barbeiro'");
        console.log('Updated Guilherme');

        // Update André
        await client.query("UPDATE users SET avatar_url = '/barbers/andre.png' WHERE name = 'André' AND role = 'barbeiro'");
        console.log('Updated André');

        // COMMIT
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
    } finally {
        await client.end();
    }
}

updateAvatars();
