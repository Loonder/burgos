'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Trophy, Medal, Star, Flame, Crown } from 'lucide-react';

export default function GamificationPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [period, setPeriod] = useState('month'); // week, month, all
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoading && user?.role !== 'admin' && user?.role !== 'barbeiro') {
            router.push('/');
        }
    }, [isLoading, user, router]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/api/gamification/leaderboard?period=${period}`);
                setLeaderboard(res.data.data || []);
            } catch (error) {
                console.error('Error fetching leaderboard', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchLeaderboard();
    }, [user, period]);

    if (loading || isLoading) return <div className="text-white text-center p-12">Carregando ranking...</div>;

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Crown size={24} className="text-yellow-400" />;
            case 2: return <Medal size={24} className="text-gray-300" />;
            case 3: return <Medal size={24} className="text-amber-700" />;
            default: return <span className="text-burgos-accent/50 font-bold">#{rank}</span>;
        }
    };

    return (
        <div className="px-4 lg:p-8 pb-32 max-w-5xl mx-auto">
            <div className="text-center mb-6 lg:mb-10">
                <h1 className="text-2xl lg:text-4xl font-display font-bold text-white mb-2 flex items-center justify-center gap-2 lg:gap-3">
                    <Trophy className="text-yellow-400 w-7 h-7 lg:w-10 lg:h-10" /> Ranking de Barbeiros
                </h1>
                <p className="text-burgos-accent/60 text-sm lg:text-base">Quem são os lendas da tesoura?</p>
            </div>

            <div className="flex justify-center gap-1 lg:gap-2 mb-6 lg:mb-8 bg-burgos-secondary/30 p-1 rounded-xl w-fit mx-auto border border-white/5">
                {['week', 'month', 'all'].map((p) => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`px-3 lg:px-6 py-2 rounded-lg text-xs lg:text-sm font-bold transition-all capitalize ${period === p
                            ? 'bg-burgos-primary text-white shadow-lg'
                            : 'text-burgos-accent/50 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {p === 'week' ? 'Semana' : p === 'month' ? 'Mês' : 'Geral'}
                    </button>
                ))}
            </div>

            <div className="bg-burgos-secondary/20 rounded-2xl overflow-hidden border border-light-navy-100/10 backdrop-blur-sm">
                {leaderboard.length === 0 ? (
                    <div className="p-12 text-center text-burgos-accent/40">
                        Nenhum dado encontrado para este período.
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {leaderboard.map((barber, index) => (
                            <div key={barber.barber_id} className={`p-4 lg:p-6 flex items-center gap-3 lg:gap-6 transition-colors ${index === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-transparent' : 'hover:bg-white/5'
                                }`}>
                                <div className="w-8 h-8 lg:w-12 lg:h-12 flex items-center justify-center shrink-0">
                                    {getRankIcon(index + 1)}
                                </div>

                                <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0">
                                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-burgos-dark border-2 border-white/10 overflow-hidden relative flex-shrink-0">
                                        {barber.avatar_url ? (
                                            <img src={barber.avatar_url} alt={barber.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-burgos-accent/30 tracking-widest">IMG</div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-sm lg:text-lg font-bold text-white flex items-center gap-2 truncate">
                                            {barber.name}
                                            {index === 0 && <span className="bg-yellow-500/20 text-yellow-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Líder</span>}
                                        </h3>
                                        <div className="flex gap-4 text-sm mt-1">
                                            <span className="text-burgos-accent/60 flex items-center gap-1">
                                                <Star size={12} className="text-burgos-primary" /> {barber.appointments_count} cortes
                                            </span>
                                            {user?.role === 'admin' && ( // Only admin sees revenue
                                                <span className="text-green-400/80 font-mono text-xs flex items-center gap-1">
                                                    R$ {Number(barber.total_revenue).toFixed(0)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right flex-shrink-0">
                                    <p className="text-[10px] lg:text-xs text-burgos-accent/40 uppercase tracking-widest mb-0.5 lg:mb-1">Score</p>
                                    <p className="text-lg lg:text-2xl font-bold text-white font-mono">{barber.score}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-8 lg:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
                <BadgeCard icon={<Flame size={20} />} title="Semana de Fogo" desc="7 dias seguidos" />
                <BadgeCard icon={<Star size={20} />} title="5 Estrelas" desc="Avaliação 4.8+" />
                <BadgeCard icon={<Crown size={20} />} title="Rei da Tesoura" desc="Top 1 do Mês" />
                <BadgeCard icon={<Trophy size={20} />} title="Lendário" desc="1000 Cortes" />
            </div>
        </div>
    );
}

function BadgeCard({ icon, title, desc }: any) {
    return (
        <div className="bg-white/5 p-3 lg:p-4 rounded-xl border border-white/5 flex items-center gap-2 lg:gap-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 hover:bg-white/10 transition-all cursor-help" title="Conquista Bloqueada">
            <div className="p-2 bg-burgos-dark rounded-lg text-burgos-primary shadow-inner">
                {icon}
            </div>
            <div className="min-w-0">
                <h4 className="font-bold text-white text-xs lg:text-sm truncate">{title}</h4>
                <p className="text-burgos-accent/40 text-[10px] lg:text-xs truncate">{desc}</p>
            </div>
        </div>
    );
}
