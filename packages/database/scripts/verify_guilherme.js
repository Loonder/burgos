
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

        // Fetch Guilherme
        const res = await client.query("SELECT * FROM users WHERE email = 'guilherme@burgos.com'");

        if (res.rows.length === 0) {
            console.log("❌ User Guilherme NOT found with email 'guilherme@burgos.com'");
            // Try to find by name to see if email is different
            const resName = await client.query("SELECT * FROM users WHERE name LIKE '%Guilherme%'");
            if (resName.rows.length > 0) {
                console.log("Found by name:", resName.rows[0]);
            }
            return;
        }

        const user = res.rows[0];
        console.log(`👤 User Found: ${user.email}`);

        // Verify Password
        const match = await bcrypt.compare('burgos123', user.password_hash);
        console.log(`🔐 Password 'burgos123' matches? ${match ? 'YES ✅' : 'NO ❌'}`);

        if (!match) {
            console.log("Resetting password to 'burgos123'...");
            const newHash = await bcrypt.hash('burgos123', 10);
            await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, user.id]);
            console.log("✅ Password reset.");
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

main();
