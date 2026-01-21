'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Mission {
    id: string;
    title: string;
    description: string;
    type: string;
    target_value: number;
    current_value: number;
    reward_type: string;
    reward_value: number;
    is_completed: boolean;
}

interface BarberStats {
    total_appointments: number;
    total_revenue: number;
    avg_rating: number;
    rank?: number;
    score?: number;
}

export default function BarberDashboard() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<BarberStats | null>(null);
    const [missions, setMissions] = useState<Mission[]>([]);
    const [commission, setCommission] = useState<{ total: number, period: any } | null>(null);
    const [showBalance, setShowBalance] = useState(false);

    useEffect(() => {
        if (!isLoading && (!user || user.role !== 'barbeiro')) {
            // Redirect if not barber (uncomment in prod, or handle elegantly)
            // router.push('/'); 
        }

        if (user) {
            fetchStats();
            fetchMissions();
            fetchCommission();
        }
    }, [user, isLoading]);

    const fetchStats = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gamification/barber/${user!.id}/stats`, {
                credentials: 'include'
            });
            const data = await res.json();
            setStats(data.stats);
        } catch (error) {
            console.error('Error fetching stats', error);
        }
    };

    const fetchMissions = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/missions`, {
                credentials: 'include'
            });
            const data = await res.json();
            setMissions(data.data || []);
        } catch (error) {
            console.error('Error fetching missions', error);
        }
    };

    const fetchCommission = async () => {
        // This endpoint might need to be created or adapted from financial
        // For now, let's use the financial/by-barber endpoint filtering for THIS barber
        // Or create a specific /api/financial/my-commission endpoint
        // Let's mock it or use the existing one if possible. 
        // Ideally we use a dedicated route.
    };

    if (isLoading) return <div className="min-h-screen bg-burgos-dark flex items-center justify-center text-white">Carregando...</div>;

    return (
        <main className="min-h-screen bg-burgos-dark pb-20">
            {/* Header / Profile */}
            <header className="bg-gradient-to-b from-burgos-primary/20 to-burgos-dark pt-8 pb-6 px-4">
                <div className="flex items-center gap-4">
                    <img
                        src={user?.avatar_url || '/barbers/default.png'}
                        alt={user?.name}
                        className="w-16 h-16 rounded-full border-2 border-burgos-primary object-cover"
                    />
                    <div>
                        <h1 className="text-xl font-bold text-white">Olá, {user?.name?.split(' ')[0]}!</h1>
                        <p className="text-burgos-accent/60 text-sm">Pronto para a guerra? ⚔️</p>
                    </div>
                </div>

                {/* Balance Card */}
                <div className="mt-6 bg-burgos-secondary/30 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <span className="text-6xl">💰</span>
                    </div>
                    <p className="text-sm text-burgos-accent/60 mb-1">Comissão Estimada (Mês)</p>
                    <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold text-white">
                            {showBalance ? `R$ ${(stats?.total_revenue || 0) * 0.4}` : 'R$ ••••'}
                        </span>
                        <button onClick={() => setShowBalance(!showBalance)} className="text-burgos-accent/40 hover:text-white">
                            {showBalance ? '👁️' : '🔒'}
                        </button>
                    </div>
                    <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                        <span>📈</span> +12% vs mês passado (Simulado)
                    </p>
                </div>
            </header>

            <div className="px-4 space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-burgos-secondary/20 p-4 rounded-xl border border-white/5">
                        <div className="text-2xl mb-1">✂️</div>
                        <div className="text-2xl font-bold text-white">{stats?.total_appointments || 0}</div>
                        <div className="text-xs text-burgos-accent/60">Cortes Totais</div>
                    </div>
                    <div className="bg-burgos-secondary/20 p-4 rounded-xl border border-white/5">
                        <div className="text-2xl mb-1">⭐</div>
                        <div className="text-2xl font-bold text-white">{stats?.avg_rating || '5.0'}</div>
                        <div className="text-xs text-burgos-accent/60">Avaliação Média</div>
                    </div>
                </div>

                {/* Active Missions */}
                <div>
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                        <span>Missões Ativas</span>
                        <span className="text-xs bg-burgos-primary/20 text-burgos-primary px-2 py-1 rounded-full">{missions.length}</span>
                    </h2>

                    <div className="space-y-4">
                        {missions.length === 0 ? (
                            <p className="text-burgos-accent/40 text-center py-8">Nenhuma missão ativa no momento.</p>
                        ) : (
                            missions.map(mission => (
                                <div key={mission.id} className="bg-burgos-secondary/10 border border-white/5 rounded-xl p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-bold text-white">{mission.title}</h3>
                                            <p className="text-xs text-burgos-accent/60">{mission.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-bold text-burgos-primary bg-burgos-primary/10 px-2 py-1 rounded">
                                                +{mission.reward_value} {mission.reward_type === 'cash' ? 'R$' : 'pts'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-burgos-primary to-orange-500 h-full transition-all duration-500"
                                            style={{ width: `${Math.min((mission.current_value / mission.target_value) * 100, 100)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-burgos-accent/60 mt-2">
                                        <span>{mission.current_value} / {mission.target_value}</span>
                                        <span>{Math.round((mission.current_value / mission.target_value) * 100)}%</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 gap-3">
                    <button onClick={() => router.push('/admin/agenda')} className="w-full bg-burgos-secondary/30 hover:bg-burgos-secondary/50 text-white py-3 rounded-xl border border-white/10 font-semibold transition-colors">
                        Minha Agenda
                    </button>
                    <button onClick={() => router.push('/admin/gamificacao')} className="w-full bg-burgos-secondary/30 hover:bg-burgos-secondary/50 text-white py-3 rounded-xl border border-white/10 font-semibold transition-colors">
                        Ver Ranking Geral
                    </button>
                </div>
            </div>
        </main>
    );
}
