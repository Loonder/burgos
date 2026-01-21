'use client';

import { useEffect, useState } from 'react';
import { DollarSign, Scissors, Users, CalendarCheck } from 'lucide-react';
import axios from 'axios';
import { useSocket } from '../../contexts/SocketContext';

interface Stats {
    appointmentsToday: number;
    revenueToday: number;
    activeBarbers: number;
    activeServices: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    const socket = useSocket();

    const fetchStats = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/stats`);
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleUpdate = () => {
            console.log('Real-time update received');
            fetchStats();
        };

        socket.on('payment:confirmed', handleUpdate);
        socket.on('appointment:created', handleUpdate);
        socket.on('appointment:updated', handleUpdate);

        return () => {
            socket.off('payment:confirmed', handleUpdate);
            socket.off('appointment:created', handleUpdate);
            socket.off('appointment:updated', handleUpdate);
        };
    }, [socket]);

    const cards = [
        {
            label: 'Faturamento Hoje',
            value: stats ? `R$ ${stats.revenueToday.toFixed(2)}` : '...',
            icon: DollarSign,
            color: 'text-green-400',
            bg: 'bg-green-500/10'
        },
        {
            label: 'Agendamentos',
            value: stats ? stats.appointmentsToday : '...',
            icon: CalendarCheck,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10'
        },
        {
            label: 'Barbeiros Ativos',
            value: stats ? stats.activeBarbers : '...',
            icon: Users,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10'
        },
        {
            label: 'Serviços Ativos',
            value: stats ? stats.activeServices : '...',
            icon: Scissors,
            color: 'text-orange-400',
            bg: 'bg-orange-500/10'
        }
    ];

    if (loading) return <div className="text-white">Carregando dados...</div>;

    return (
        <div className="space-y-6 lg:space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                {cards.map((card, i) => (
                    <div key={i} className="glass-dark p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-white/5">
                        <div className="flex justify-between items-start mb-2 lg:mb-4">
                            <div className={`p-2 lg:p-3 rounded-lg lg:rounded-xl ${card.bg} ${card.color}`}>
                                <card.icon size={18} className="lg:w-6 lg:h-6" />
                            </div>
                            <span className="text-[10px] lg:text-xs text-burgos-text bg-white/5 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full">
                                Hoje
                            </span>
                        </div>
                        <p className="text-burgos-accent text-xs lg:text-sm font-medium truncate">{card.label}</p>
                        <h3 className="text-lg lg:text-3xl font-bold text-white mt-0.5 lg:mt-1 truncate">{card.value}</h3>
                    </div>
                ))}
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
                <div className="lg:col-span-2 glass-dark rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-white/5">
                    <h3 className="text-lg lg:text-xl font-bold text-white mb-4 lg:mb-6">Atividade Recente</h3>
                    <div className="space-y-3 lg:space-y-4">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-3 lg:p-4 bg-white/5 rounded-lg lg:rounded-xl border border-white/5">
                                <div className="flex items-center gap-3 lg:gap-4 min-w-0">
                                    <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-burgos-primary/20 flex items-center justify-center text-burgos-primary font-bold text-sm lg:text-base flex-shrink-0">
                                        C
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-white font-medium text-sm lg:text-base truncate">João Silva</h4>
                                        <p className="text-xs lg:text-sm text-burgos-text truncate">Corte Clássico • 14:00</p>
                                    </div>
                                </div>
                                <span className="px-2 lg:px-3 py-0.5 lg:py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] lg:text-xs font-bold border border-green-500/20 flex-shrink-0 ml-2">
                                    Confirmado
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-dark rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-white/5">
                    <h3 className="text-lg lg:text-xl font-bold text-white mb-4 lg:mb-6">Atalhos</h3>
                    <div className="space-y-2 lg:space-y-3">
                        <button
                            onClick={() => window.location.href = '/agendamento'}
                            className="w-full py-2.5 lg:py-3 px-4 bg-burgos-primary hover:bg-burgos-light text-burgos-dark font-bold rounded-lg lg:rounded-xl transition-all text-sm lg:text-base"
                        >
                            + Novo Agendamento
                        </button>
                        <button
                            onClick={() => alert('Em breve: Envio de avisos em massa via WhatsApp')}
                            className="w-full py-2.5 lg:py-3 px-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-lg lg:rounded-xl transition-all border border-white/10 text-sm lg:text-base"
                        >
                            📢 Enviar Aviso
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
