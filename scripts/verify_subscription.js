
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const API_URL = 'http://localhost:3001/api';

async function run() {
    console.log('🧪 Starting Robust Subscription E2E Test...');

    try {
        // 1. Setup Data: Plan, Barber, Service
        console.log('🛠️  Setting up test prerequisites...');

        // Get or Create Plan
        let { data: plan } = await supabase.from('plans').select('id, name').eq('price', 0).limit(1).single();
        if (!plan) {
            console.log('   Creating Test Plan...');
            const { data: newPlan, error } = await supabase.from('plans').insert({
                name: 'E2E Test Plan',
                price: 0.00,
                stripe_price_id: 'price_test_e2e_' + Date.now(),
                is_active: true
            }).select().single();
            if (error) throw error;
            plan = newPlan;
        }

        // Get Service and Link to Plan
        const { data: service } = await supabase.from('services').select('id, price').limit(1).single();
        if (!service) throw new Error('No services found in DB');

        // Ensure Discount Exists
        const { error: discError } = await supabase.from('plan_discounts').upsert({
            plan_id: plan.id,
            service_id: service.id,
            is_free: true
        }, { onConflict: 'plan_id, service_id' });
        if (discError) throw discError;

        // Get Barber
        const { data: barber } = await supabase.from('users').select('id').eq('role', 'barbeiro').limit(1).single();
        if (!barber) throw new Error('No admin/barber found');

        console.log('✅ Prerequisites Ready');

        // 2. Register New User
        const email = `test.e2e.${Date.now()}@example.com`;
        const password = 'password123';
        console.log(`👤 Registering user: ${email}`);

        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name: 'E2E Tester', phone: '123456789' })
        });

        if (!regRes.ok) {
            const txt = await regRes.text();
            throw new Error(`Registration failed: ${txt}`);
        }
        const regData = await regRes.json();
        const userId = regData.user.id;
        console.log(`✅ User Registered: ${userId}`);

        // 3. Login to get Token
        console.log('🔑 Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!loginRes.ok) throw new Error('Login failed');

        // Extract Cookie
        const cookieHeader = loginRes.headers.get('set-cookie');
        if (!cookieHeader) throw new Error('No set-cookie header received');
        const tokenMatch = cookieHeader.match(/access_token=([^;]+)/);
        if (!tokenMatch) throw new Error('access_token not found in cookies');
        const accessToken = tokenMatch[1];
        console.log('✅ Login Successful. Token obtained.');

        // 4. Inject Subscription
        console.log('💎 Injecting Active Subscription...');
        const { error: subError } = await supabase.from('user_subscriptions').insert({
            user_id: userId,
            plan_id: plan.id,
            status: 'active',
            stripe_customer_id: 'cus_e2e_' + Date.now(),
            stripe_subscription_id: 'sub_e2e_' + Date.now(),
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 86400000).toISOString()
        });
        if (subError) throw new Error(`Subscription injection failed: ${subError.message}`);
        console.log('✅ Subscription Active');

        // 5. Book Appointment
        console.log('📅 Booking Appointment...');
        const bookRes = await fetch(`${API_URL}/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `access_token=${accessToken}`
            },
            body: JSON.stringify({
                serviceId: service.id,
                barberId: barber.id,
                date: new Date().toISOString().split('T')[0],
                time: '12:00',
                preferences: { note: 'E2E Test' }
            })
        });

        if (!bookRes.ok) {
            const txt = await bookRes.text();
            throw new Error(`Booking failed: ${bookRes.status} - ${txt}`);
        }
        const bookData = await bookRes.json();
        const appointmentId = bookData.data.id;
        console.log(`✅ Appointment Created: ${appointmentId}`);

        // 6. Verify Price
        console.log('💰 Verifying Price...');
        const { data: payment } = await supabase.from('payments').select('*').eq('appointment_id', appointmentId).single();

        if (!payment) throw new Error('Payment record not found');

        console.log(`   Service Price: ${service.price}`);
        console.log(`   Charged Amount: ${payment.amount}`);

        if (Number(payment.amount) === 0) {
            console.log('🎉 SUCCESS: Price is 0.00!');
        } else {
            console.error('❌ FAILURE: Price was not zeroed out.');
            process.exit(1);
        }

        // Cleanup
        console.log('🧹 Cleaning up...');
        await supabase.from('users').delete().eq('id', userId); // Should cascade everything
        console.log('✅ Cleanup done.');

    } catch (error) {
        console.error('❌ ERROR:', error.message);
        process.exit(1);
    }
}

run();
