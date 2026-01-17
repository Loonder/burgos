
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    try {
        await client.connect();

        // Delete any OLD user that holds the email 'andre@burgos.com' (but is not our correct ID)
        await client.query("DELETE FROM users WHERE email = 'andre@burgos.com' AND id != '964b843d-68bd-48a7-9cbf-b71819c360ee'");
        console.log("Deleted conflicting old user.");

        // Update André's email to remove accent
        await client.query("UPDATE users SET email = 'andre@burgos.com' WHERE id = '964b843d-68bd-48a7-9cbf-b71819c360ee'");
        console.log("✅ Updated André's email to: andre@burgos.com");

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

main();
