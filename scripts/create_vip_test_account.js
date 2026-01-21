/**
 * Creates a VIP Test Account for manual testing
 * Run: node scripts/create_vip_test_account.js
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const API_URL = 'http://localhost:3001/api';

// Test Account Credentials
const TEST_ACCOUNT = {
    email: 'vip@teste.com',
    password: 'vip123',
    name: 'Cliente VIP Teste',
    phone: '11999999999'
};

async function run() {
    console.log('🎯 Creating VIP Test Account...\n');

    try {
        // 1. Check if user already exists
        let { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', TEST_ACCOUNT.email)
            .single();

        let userId;

        if (existingUser) {
            console.log('👤 User already exists, reusing...');
            userId = existingUser.id;
        } else {
            // Register via API (handles password hashing)
            console.log('👤 Registering new user via API...');

            const regRes = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(TEST_ACCOUNT)
            });

            if (!regRes.ok) {
                const txt = await regRes.text();
                throw new Error(`Registration failed: ${txt}`);
            }

            const regData = await regRes.json();
            userId = regData.user.id;
            console.log(`   ✅ User registered: ${userId}`);
        }

        // 2. Get or Create VIP Plan (Price = 0)
        let { data: plan } = await supabase
            .from('plans')
            .select('id, name')
            .eq('price', 0)
            .limit(1)
            .single();

        if (!plan) {
            console.log('📋 Creating VIP Plan...');
            const { data: newPlan, error: planError } = await supabase
                .from('plans')
                .insert({
                    name: 'Plano VIP Teste',
                    price: 0.00,
                    stripe_price_id: 'price_vip_manual_test',
                    is_active: true
                })
                .select()
                .single();

            if (planError) throw planError;
            plan = newPlan;
        }
        console.log(`   📋 Using Plan: ${plan.name} (ID: ${plan.id})`);

        // 3. Get all services and link them to the plan (100% free)
        const { data: services } = await supabase.from('services').select('id, name');

        if (services && services.length > 0) {
            console.log(`   🔗 Linking ${services.length} services to plan with 100% discount...`);

            for (const svc of services) {
                await supabase.from('plan_discounts').upsert({
                    plan_id: plan.id,
                    service_id: svc.id,
                    is_free: true,
                    discount_percentage: 100
                }, { onConflict: 'plan_id, service_id' });
            }
        }

        // 4. Create/Update Subscription
        console.log('💎 Creating Active Subscription...');

        // Delete old subscription if exists
        await supabase.from('user_subscriptions').delete().eq('user_id', userId);

        const { error: subError } = await supabase.from('user_subscriptions').insert({
            user_id: userId,
            plan_id: plan.id,
            status: 'active',
            stripe_customer_id: 'cus_manual_vip_' + Date.now(),
            stripe_subscription_id: 'sub_manual_vip_' + Date.now(),
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        });

        if (subError) throw subError;

        console.log('\n' + '='.repeat(50));
        console.log('🎉 VIP TEST ACCOUNT READY!');
        console.log('='.repeat(50));
        console.log(`   📧 Email:    ${TEST_ACCOUNT.email}`);
        console.log(`   🔑 Password: ${TEST_ACCOUNT.password}`);
        console.log(`   💎 Plan:     ${plan.name} (FREE)`);
        console.log(`   📅 Valid:    30 days`);
        console.log('='.repeat(50));
        console.log('\n✅ Login at the website and book any service - it should be R$ 0.00!\n');

    } catch (error) {
        console.error('❌ ERROR:', error.message);
        process.exit(1);
    }
}

run();

