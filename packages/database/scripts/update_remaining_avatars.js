const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function updateAllAvatars() {
    await client.connect();
    try {
        await client.query('BEGIN');

        const helpers = [
            { name: 'Max', file: 'max.png' },
            { name: 'Jotta', file: 'jotta.png' },
            { name: 'Amanda', file: 'amanda.png' },
            { name: 'Gabriel', file: 'gabriel.png' },
        ];

        for (const h of helpers) {
            await client.query("UPDATE users SET avatar_url = $1 WHERE name = $2 AND role = 'barbeiro'", [`/barbers/${h.file}`, h.name]);
            console.log(`Updated ${h.name}`);
        }

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
    } finally {
        await client.end();
    }
}

updateAllAvatars();
