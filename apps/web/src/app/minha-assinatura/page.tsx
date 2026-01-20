'use client';

import { useEffect, useState, Suspense } from 'react';
import { subscriptionAPI } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard, CheckCircle, AlertTriangle } from 'lucide-react';

function SubscriptionContent() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [subscription, setSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const isCheckoutSuccess = searchParams.get('checkout_success') === 'true';
    const sessionId = searchParams.get('session_id');

    // Handle mock activation
    useEffect(() => {
        if (isCheckoutSuccess && sessionId && sessionId.includes('mock') && !subscription) {
            // Need to activate manually for mock
            // But we don't know the plan ID here easily from URL unless we passed it.
            // Wait, the API mock logic was: create_checkout returns a URL.
            // If I am here, maybe the subscription is already active? 
            // Ideally the backend webhook would have fired.
            // For Mock, let's assume valid state fetch or manual trigger if needed.
            // Let's just fetch existing sub.
        }
    }, [isCheckoutSuccess, sessionId, subscription]);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push('/auth/login');
            return;
        }

        const fetchSub = async () => {
            try {
                // If we just arrived from "Mock Checkout", we might need to Trigger the "Mock Activate" functionality 
                // IF it wasn't done automatically.
                // But normally stripe checkout confirms via webhook.
                // For this user demo, let's just fetch.
                const data = await subscriptionAPI.getMySubscription();
                setSubscription(data.subscription);

                // If no sub found but we have success params, maybe trigger mock activation?
                // This is a bit hacky for the mock but useful.
                // To do this properly, we'd need the plan ID in the URL.
            } catch (error) {
                console.error('Error fetching sub', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSub();
    }, [user, authLoading]);

    if (loading || authLoading) return <div className="min-h-screen bg-burgos-dark flex items-center justify-center text-white">Carregando...</div>;

    if (!subscription) {
        return (
            <div className="bg-burgos-secondary/20 p-8 rounded-2xl border border-light-navy-100/10 text-center">
                <AlertTriangle className="mx-auto text-yellow-500 mb-4" size={48} />
                <h2 className="text-xl font-bold text-white mb-2">Nenhuma assinatura ativa</h2>
                <p className="text-burgos-accent/70 mb-6">Você ainda não possui um plano VIP.</p>
                <button
                    onClick={() => router.push('/planos')}
                    className="bg-burgos-primary text-white px-8 py-3 rounded-xl font-bold hover:opacity-90"
                >
                    Ver Planos Disponíveis
                </button>
            </div>
        );
    }

    return (
        <div className="bg-burgos-secondary/20 p-8 rounded-2xl border border-burgos-primary/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-burgos-primary to-yellow-400" />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <p className="text-sm text-burgos-accent/60 uppercase tracking-widest mb-1">PLANO ATUAL</p>
                    <h2 className="text-3xl font-bold text-white">{subscription.plan.name}</h2>
                </div>
                <div className="bg-green-500/20 text-green-400 px-4 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                    <CheckCircle size={14} /> ATIVO
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                    <p className="text-sm text-burgos-accent/60 mb-1">Próxima Renovação</p>
                    <p className="text-xl text-white font-mono">
                        {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-burgos-accent/60 mb-1">Valor</p>
                    <p className="text-xl text-white font-mono">
                        R$ {subscription.plan.price.toFixed(2)}
                    </p>
                </div>
            </div>

            <div className="border-t border-white/10 pt-6 flex justify-between items-center">
                <div className="flex items-center gap-2 text-burgos-accent/60">
                    <CreditCard size={16} />
                    <span>Gerenciado via Stripe</span>
                </div>
                <button
                    onClick={() => alert('Em produção, isso abriria o Portal do Cliente Stripe.')}
                    className="text-burgos-primary hover:text-white transition-colors text-sm font-semibold"
                >
                    Gerenciar Assinatura
                </button>
            </div>
        </div>
    );
}

export default function MySubscriptionPage() {
    return (
        <main className="min-h-screen bg-burgos-dark text-burgos-accent">
            <div className="container mx-auto px-4 py-12 max-w-3xl">
                <h1 className="text-3xl font-display font-bold text-white mb-8">Minha Assinatura</h1>
                <Suspense fallback={<div className="text-center text-white">Carregando dados da assinatura...</div>}>
                    <SubscriptionContent />
                </Suspense>
            </div>
        </main>
    );
}
