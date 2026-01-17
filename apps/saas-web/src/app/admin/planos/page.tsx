'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, Shield, Zap, TrendingUp, Users, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Plan {
    id: string;
    name: string;
    slug: string;
    price_monthly: number;
    features: string[]; // JSON array
    is_active: boolean;
}

interface Subscription {
    id: string;
    status: string;
    plan: Plan;
    current_period_end: string;
}

export default function PlansPage() {
    const { user } = useAuth();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpgrading, setIsUpgrading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [plansRes, subRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/plans`),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/me`)
            ]);
            setPlans(plansRes.data.data);
            setSubscription(subRes.data.data);
        } catch (error) {
            console.error('Error fetching plans', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpgrade = async (planSlug: string) => {
        if (!confirm(`Confirma a mudança para o plano ${planSlug.toUpperCase()}?`)) return;

        setIsUpgrading(true);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/change-plan`, { planSlug });
            toast.success('Plano atualizado com sucesso! 🚀');
            fetchData(); // Refresh state

            // Optional: Force reload to apply new feature flags if necessary
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            toast.error('Erro ao mudar de plano.');
            console.error(error);
        } finally {
            setIsUpgrading(false);
        }
    };

    if (isLoading) return <div className="p-8 text-white">Carregando planos...</div>;

    const currentPlanSlug = subscription?.plan?.slug || 'basic'; // Default to basic if no sub

    return (
        <div className="space-y-8 animate-fade-in p-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
                <h1 className="text-4xl font-bold text-white mb-4">Escolha seu Poder ⚡</h1>
                <p className="text-burgos-accent/60 text-lg">
                    Desbloqueie recursos exclusivos e leve sua barbearia para o próximo nível.
                    Mude de plano a qualquer momento.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {plans.map((plan) => {
                    const isCurrent = currentPlanSlug === plan.slug;
                    const isWar = plan.slug === 'war';

                    return (
                        <div
                            key={plan.id}
                            className={`
                                relative rounded-3xl p-8 border transition-all duration-300
                                ${isCurrent
                                    ? 'bg-burgos-primary/10 border-burgos-primary ring-2 ring-burgos-primary/50'
                                    : 'glass-dark border-white/5 hover:border-white/20'
                                }
                                ${isWar && !isCurrent ? 'bg-gradient-to-b from-red-900/20 to-black border-red-500/30' : ''}
                            `}
                        >
                            {isCurrent && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-burgos-primary text-black font-bold px-4 py-1 rounded-full text-sm">
                                    SEU PLANO ATUAL
                                </div>
                            )}

                            {isWar && (
                                <div className="absolute top-4 right-4 text-2xl animate-pulse">
                                    ⚔️
                                </div>
                            )}

                            <h3 className={`text-2xl font-bold mb-2 ${isWar ? 'text-red-500' : 'text-white'}`}>
                                {plan.name}
                            </h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-bold text-white">R$ {Math.floor(plan.price_monthly)}</span>
                                <span className="text-burgos-accent/60">/mês</span>
                            </div>

                            <button
                                onClick={() => !isCurrent && handleUpgrade(plan.slug)}
                                disabled={isCurrent || isUpgrading}
                                className={`
                                    w-full py-4 rounded-xl font-bold mb-8 transition-all
                                    ${isCurrent
                                        ? 'bg-white/10 text-white/50 cursor-default'
                                        : isWar
                                            ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-lg shadow-red-900/20'
                                            : 'bg-burgos-primary hover:bg-burgos-light text-burgos-dark'
                                    }
                                `}
                            >
                                {isCurrent ? 'Ativo' : isUpgrading ? 'Processando...' : isWar ? 'ATIVAR WAR MODE' : 'Assinar Agora'}
                            </button>

                            <div className="space-y-4">
                                {parseFeatures(plan.features).map((feature: string, idx: number) => (
                                    <div key={idx} className="flex items-start gap-3 text-burgos-accent/80">
                                        <Check size={18} className={isWar ? "text-red-500" : "text-burgos-primary"} />
                                        <span className="text-sm">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Helper to format feature strings clearly
function parseFeatures(features: any): string[] {
    const list = Array.isArray(features) ? features : JSON.parse(features as string || '[]');
    const map: Record<string, string> = {
        'appointments': 'Agenda Inteligente',
        'clients': 'Gestão de Clientes',
        'finance': 'Controle Financeiro Completo',
        'whatsapp': 'Bot de Confirmação WhatsApp 🤖',
        'gamification': 'Gamificação "War Mode" ⚔️',
        'multi_location': 'Gestão Multi-Unidades 🌎'
    };
    return list.map((f: string) => map[f] || f);
}
