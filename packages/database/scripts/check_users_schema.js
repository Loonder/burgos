const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking users table schema...');
    // Attempt to select birth_date
    const { data, error } = await supabase
        .from('users')
        .select('birth_date')
        .limit(1);

    if (error) {
        console.error('Error selecting birth_date:', error.message);
        if (error.message.includes('column') && error.message.includes('does not exist')) {
            console.log('COLUMN_MISSING');
        }
    } else {
        console.log('Column birth_date exists.');
    }
}

checkSchema();
