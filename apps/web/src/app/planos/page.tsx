'use client';

import { useEffect, useState } from 'react';
import { subscriptionAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';

interface Plan {
    id: string;
    name: string;
    description: string;
    price: number;
    discounts: { service_id: string, is_free: boolean, discount_percentage: number }[];
}

export default function PlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await subscriptionAPI.getPlans();
                setPlans(data || []);
            } catch (error) {
                console.error('Error fetching plans', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const handleSubscribe = async (plan: Plan) => {
        if (!user) {
            router.push('/auth/login?redirect=/planos');
            return;
        }

        try {
            // Mock Checkout Flow
            // In production, this redirects to Stripe
            const successUrl = `${window.location.origin}/minha-assinatura?checkout_success=true`;
            const cancelUrl = `${window.location.origin}/planos`;

            const session = await subscriptionAPI.createCheckoutSession(plan.id, successUrl, cancelUrl);

            // Redirect (Mock or Real)
            // For mock, we likely get a URL or we force the success here if it's purely internal logic
            // The service returns { url: ... }
            if (session.url) {
                window.location.href = session.url;
            }
        } catch (error) {
            alert('Erro ao iniciar assinatura');
        }
    };

    return (
        <main className="min-h-screen bg-burgos-dark text-burgos-accent pb-20">
            {/* Header */}
            <header className="bg-burgos-secondary/20 backdrop-blur border-b border-light-navy-100/10 py-6">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-3xl font-display font-bold text-white mb-2">Planos Burgos VIP</h1>
                    <p className="text-burgos-accent/70">Economize mantendo seu estilo sempre em dia.</p>
                </div>
            </header>

            <div className="container mx-auto px-4 py-12">
                {loading ? (
                    <div className="text-center">Carregando planos...</div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {plans.map((plan) => (
                            <div key={plan.id} className="relative group bg-burgos-secondary/30 rounded-2xl p-8 border border-light-navy-100/10 hover:border-burgos-primary transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,159,28,0.1)]">
                                <div className="absolute top-0 right-0 p-4 opacity-50 text-6xl font-bold text-white/5 select-none">
                                    VIP
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                <p className="text-burgos-accent/70 mb-6 h-12">{plan.description}</p>

                                <div className="flex items-end gap-1 mb-8">
                                    <span className="text-4xl font-bold text-burgos-primary">R$ {plan.price.toFixed(2).replace('.', ',')}</span>
                                    <span className="text-burgos-accent/60 mb-1">/mês</span>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {plan.discounts?.map((discount, i) => (
                                        <li key={i} className="flex items-start gap-3 text-burgos-accent/90">
                                            <div className="bg-burgos-primary/20 p-1 rounded-full mt-1">
                                                <Check size={14} className="text-burgos-primary" />
                                            </div>
                                            <span>
                                                {discount.is_free ? (
                                                    <span className="font-bold text-green-400">100% OFF</span>
                                                ) : (
                                                    <span className="font-bold text-yellow-400">{discount.discount_percentage}% OFF</span>
                                                )}
                                                {' '}no serviço vinculado.
                                            </span>
                                        </li>
                                    ))}
                                    <li className="flex items-start gap-3 text-burgos-accent/90">
                                        <div className="bg-burgos-primary/20 p-1 rounded-full mt-1">
                                            <Check size={14} className="text-burgos-primary" />
                                        </div>
                                        <span>Cancelamento a qualquer momento</span>
                                    </li>
                                </ul>

                                <button
                                    onClick={() => handleSubscribe(plan)}
                                    className="w-full py-4 bg-burgos-primary text-white font-bold rounded-xl hover:bg-opacity-90 transition-all hover:scale-[1.02] shadow-lg shadow-burgos-primary/20"
                                >
                                    ASSINAR AGORA
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
