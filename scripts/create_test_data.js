
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment from root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL; // OR NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // MUST use Service Role to create users/plans bypassing RLS

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('🔄 Iniciando criação de dados de teste...');

    try {
        // 1. Create Plan
        const { data: plan, error: planError } = await supabase
            .from('plans')
            .insert({
                name: 'Plano Teste VIP',
                price: 0.00, // It's a test plan
                stripe_price_id: 'price_test_' + Date.now(),
                description: 'Plano para teste de gratuidade'
            })
            .select()
            .single();

        if (planError) throw new Error(`Erro ao criar plano: ${planError.message}`);
        console.log(`✅ Plano criado: ${plan.name} (${plan.id})`);

        // 2. Link Plan to ALL Services (Discount 100%)
        // First get a service
        const { data: services } = await supabase.from('services').select('id').limit(5);
        if (!services || services.length === 0) throw new Error('Nenhum serviço encontrado para vincular.');

        const discounts = services.map(s => ({
            plan_id: plan.id,
            service_id: s.id,
            is_free: true // MAKE IT FREE
        }));

        const { error: discError } = await supabase.from('plan_discounts').insert(discounts);
        if (discError) throw new Error(`Erro ao criar descontos: ${discError.message}`);
        console.log(`✅ Descontos criados para ${services.length} serviços.`);

        // 3. Create Client User
        const email = `teste.cliente.${Date.now()}@example.com`;
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: email,
            password: 'password123',
            email_confirm: true,
            user_metadata: { name: 'Cliente Teste VIP' }
        });

        if (authError) throw new Error(`Erro ao criar usuário Auth: ${authError.message}`);
        const userId = authUser.user.id;
        console.log(`✅ Usuário criado: ${email} (${userId})`);

        // 3.5 Ensure user is in PUBLIC.users (Trigger might be slow or missing)
        const { error: publicUserError } = await supabase
            .from('users')
            .upsert({
                id: userId,
                name: 'Cliente Teste VIP',
                email: email,
                role: 'cliente',
                password_hash: '$2b$10$iHJvU/O.K8pY.tCJ999gbuGp/Dccj3gkSEopeRRocz7BSjCVewxkq'
            });

        if (publicUserError) throw new Error(`Erro ao sincar public.users: ${publicUserError.message}`);
        console.log(`✅ Usuário sincronizado em public.users`);

        // 4. Create Subscription
        const { error: subError } = await supabase
            .from('user_subscriptions')
            .insert({
                user_id: userId,
                plan_id: plan.id,
                status: 'active',
                stripe_customer_id: 'cus_test_' + Date.now(),
                stripe_subscription_id: 'sub_test_' + Date.now(),
                current_period_start: new Date().toISOString(),
                current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
            });

        if (subError) throw new Error(`Erro ao criar assinatura: ${subError.message}`);
        console.log(`✅ Assinatura ativa vinculada ao usuário.`);

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 DADOS DE TESTE CRIADOS COM SUCESSO!');
        console.log(`📧 Login: ${email}`);
        console.log(`🔑 Senha: password123`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('➡️ Agora faça login com este usuário e tente agendar.');
        console.log('➡️ O preço deve aparecer como R$ 0,00 ou "Grátis".');

        // Append IDs to a cleanup file
        const fs = require('fs');
        const cleanupData = `DELETE FROM plans WHERE id = '${plan.id}';\nDELETE FROM auth.users WHERE id = '${userId}';\n`;
        fs.appendFileSync('cleanup_test.sql', cleanupData);
        console.log('ℹ️ Comandos de limpeza salvos em cleanup_test.sql');

    } catch (error) {
        console.error('❌ Falha:', error.message);
    }
}

run();
