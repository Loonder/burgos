
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    try {
        await client.connect();

        // Get all barbers
        const res = await client.query("SELECT * FROM users WHERE role = 'barbeiro'");

        if (res.rows.length === 0) {
            console.log("No barbers found.");
            return;
        }

        const defaultPass = 'burgos123';
        const defaultHash = await bcrypt.hash(defaultPass, 10);

        for (const user of res.rows) {
            const match = await bcrypt.compare(defaultPass, user.password_hash);
            console.log(`Checking ${user.name} (${user.email})... Password match: ${match}`);

            if (!match) {
                console.log(`   🔄 Resetting password for ${user.name}...`);
                await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [defaultHash, user.id]);
                console.log(`   ✅ Done.`);
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

main();
