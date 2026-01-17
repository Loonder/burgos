const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function listUsers() {
    try {
        await client.connect();

        const res = await client.query("SELECT id, name, email, role, phone FROM users");
        console.table(res.rows);

        const demoId = '2f246e7b-80e3-4fc2-b062-094154941914'; // From previous context if known, or just check generic
        const demoUser = res.rows.find(u => u.id === demoId);

        if (demoUser) {
            console.log('\n✅ Demo Client found:', demoUser);
        } else {
            console.log('\n❌ Demo Client ID not found in DB');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

listUsers();
