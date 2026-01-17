
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

        // Fetch André by correct ID
        const res = await client.query("SELECT * FROM users WHERE id = '964b843d-68bd-48a7-9cbf-b71819c360ee'");

        if (res.rows.length === 0) {
            console.log("❌ User André not found in DB!");
            return;
        }

        const user = res.rows[0];
        console.log(`👤 User Found:`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);

        // Verify Password
        const match = await bcrypt.compare('burgos123', user.password_hash);
        console.log(`🔐 Password 'burgos123' matches? ${match ? 'YES ✅' : 'NO ❌'}`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

main();
