const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../apps/web/.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking for image column in services...');
    // Try to select ONLY the image column. If it doesn't exist, this should error.
    const { data, error } = await supabase.from('services').select('image').limit(1);

    if (error) {
        console.error('Error confirming schema:', error.message);
        console.log('COLUMN_MISSING'); // Sentinel for me to grep
    } else {
        console.log('Column exists. Data sample:', data);
    }
}

checkSchema();
