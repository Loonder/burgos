const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

async function fix() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    try {
        const res = await client.query('SELECT filename FROM _migrations');
        const files = res.rows.map(r => r.filename);
        console.log('Applied:', files);

        if (files.includes('004_shop_financial_gamification.sql')) {
            console.log('004 found. Deleting to force re-run...');
            await client.query("DELETE FROM _migrations WHERE filename = '004_shop_financial_gamification.sql'");
            console.log('Deleted 004.');
        } else {
            console.log('004 NOT found.');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
fix();
