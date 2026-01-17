const { Client } = require('pg');
const path = require('path');
const envPath = path.resolve(__dirname, '../../../.env');
require('dotenv').config({ path: envPath });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function seedPlans() {
    try {
        await client.connect();

        // 1. Get Service IDs to link discounts
        const { rows: services } = await client.query('SELECT id, name FROM services');

        if (services.length === 0) {
            console.error('No services found. Run initial seed first.');
            return;
        }

        const classicCut = services.find(s => s.name === 'Corte Clássico');
        const beard = services.find(s => s.name === 'Barba');

        // 2. Create Plans
        const plans = [
            {
                name: 'VIP Mensal',
                description: 'Cortes ilimitados + Barba na faixa',
                price: 99.90,
                stripe_price_id: 'price_mock_vip_monthly',
                discounts: [
                    { service_id: classicCut?.id, is_free: true },
                    { service_id: beard?.id, is_free: true }
                ]
            },
            {
                name: 'Cabelo Ilimitado',
                description: 'Apenas cortes de cabelo ilimitados',
                price: 69.90,
                stripe_price_id: 'price_mock_hair_unlimited',
                discounts: [
                    { service_id: classicCut?.id, is_free: true },
                    { service_id: beard?.id, is_free: false, discount_percentage: 20 }
                ]
            }
        ];

        console.log('🌱 Seeding Plans...');

        for (const plan of plans) {
            // Check if plan exists
            const { rows: existing } = await client.query(
                'SELECT id FROM plans WHERE stripe_price_id = $1',
                [plan.stripe_price_id]
            );

            let planId;

            if (existing.length > 0) {
                console.log(`Plan ${plan.name} already exists.`);
                planId = existing[0].id;
            } else {
                const { rows: created } = await client.query(
                    `INSERT INTO plans (name, description, price, stripe_price_id)
                     VALUES ($1, $2, $3, $4)
                     RETURNING id`,
                    [plan.name, plan.description, plan.price, plan.stripe_price_id]
                );
                planId = created[0].id;
                console.log(`✅ Created Plan: ${plan.name}`);
            }

            // Create Discounts
            for (const discount of plan.discounts) {
                if (!discount.service_id) continue;

                // clear old discounts for this plan/service pair just in case
                await client.query(
                    'DELETE FROM plan_discounts WHERE plan_id = $1 AND service_id = $2',
                    [planId, discount.service_id]
                );

                await client.query(
                    `INSERT INTO plan_discounts (plan_id, service_id, is_free, discount_percentage)
                     VALUES ($1, $2, $3, $4)`,
                    [planId, discount.service_id, discount.is_free || false, discount.discount_percentage || 0]
                );
            }
        }

        console.log('✅ Plans seeding finished!');

    } catch (error) {
        console.error('Error seeding plans:', error);
    } finally {
        await client.end();
    }
}

seedPlans();
