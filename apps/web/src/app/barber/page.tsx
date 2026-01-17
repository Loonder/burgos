'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface Appointment {
    id: string;
    scheduled_at: string;
    status: 'agendado' | 'em_atendimento' | 'concluido' | 'cancelado';
    client: {
        id: string;
        name: string;
        phone: string;
        avatar_url: string;
    };
    service: {
        name: string;
        duration_minutes: number;
        price: number;
    };
    preferences?: {
        drink: string | null;
        music: string | null;
        notes: string;
    };
    barber: {
        id: string;
        name: string;
    };
}

export default function BarberPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const [selectedBarberId, setSelectedBarberId] = useState<string>('');
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);

    // View Controls
    const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showAllBarbers, setShowAllBarbers] = useState(false);

    const [barbersList, setBarbersList] = useState<any[]>([]);

    // Fetch Barbers
    useEffect(() => {
        const fetchBarbers = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/barbers`);
                const data = await res.json();
                setBarbersList(data.data || []);
            } catch (error) {
                console.error('Failed to load barbers', error);
            }
        };
        fetchBarbers();
    }, []);

    // Fetch appointments
    useEffect(() => {
        // If specific barber needed and not set, skip (unless showAll is true)
        if (!showAllBarbers && !selectedBarberId) return;

        const fetchAppointments = async () => {
            setLoading(true);
            try {
                let query = `${process.env.NEXT_PUBLIC_API_URL}/api/appointments?dummy=1`; // dummy to ease appending

                if (!showAllBarbers && selectedBarberId) {
                    query += `&barberId=${selectedBarberId}`;
                }

                if (viewMode === 'day') {
                    query += `&date=${selectedDate}`;
                } else if (viewMode === 'week') {
                    // Calculate start/end of week (Monday to Sunday)
                    const date = new Date(selectedDate);
                    const day = date.getDay();
                    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
                    const monday = new Date(date.setDate(diff));
                    const sunday = new Date(date.setDate(monday.getDate() + 6));
                    query += `&startDate=${monday.toISOString().split('T')[0]}&endDate=${sunday.toISOString().split('T')[0]}`;
                } else if (viewMode === 'month') {
                    const date = new Date(selectedDate);
                    const start = new Date(date.getFullYear(), date.getMonth(), 1);
                    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                    query += `&startDate=${start.toISOString().split('T')[0]}&endDate=${end.toISOString().split('T')[0]}`;
                }

                const res = await fetch(query);
                const data = await res.json();
                setAppointments(data.data || []);
            } catch (error) {
                console.error('Error fetching appointments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
        const interval = setInterval(fetchAppointments, 30000);
        return () => clearInterval(interval);
    }, [selectedBarberId, selectedDate, viewMode, showAllBarbers]);

    const updateStatus = async (appointmentId: string, newStatus: string) => {
        if (!confirm(`Mudar status para: ${newStatus.replace('_', ' ')}?`)) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/${appointmentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                setAppointments(prev => prev.map(a =>
                    a.id === appointmentId ? { ...a, status: newStatus as any } : a
                ));
            } else {
                alert('Erro ao atualizar status');
            }
        } catch (error) {
            console.error('Update failed', error);
        }
    };

    const currentBarber = barbersList.find(b => b.id === selectedBarberId) || (user?.role === 'barbeiro' ? user : null);

    // Auth & Check
    useEffect(() => {
        if (isLoading) return;

        if (!user) {
            const returnUrl = encodeURIComponent('/barber');
            router.push(`/auth/login?redirect=${returnUrl}`);
            return;
        }

        if (user.role !== 'barbeiro' && user.role !== 'admin') {
            alert('Acesso restrito a profissionais.');
            router.push('/');
            return;
        }

        if (user.role === 'barbeiro' && !showAllBarbers) {
            setSelectedBarberId(user.id);
        }
    }, [user, isLoading, router, showAllBarbers]);


    if (isLoading) {
        return <div className="min-h-screen bg-burgos-dark flex items-center justify-center text-white">Carregando...</div>;
    }

    // Selector View (Only for Admin with no ID set AND not showing all)
    if (!selectedBarberId && !showAllBarbers) {
        if (user?.role === 'barbeiro') {
            return <div className="min-h-screen bg-burgos-dark flex items-center justify-center text-white">Carregando perfil...</div>;
        }
        // ... (Existing Admin User Selection Code - keeping concise)
        return (
            <div className="min-h-screen bg-burgos-dark flex items-center justify-center p-4">
                <div className="max-w-3xl w-full glass-dark p-8 rounded-2xl border border-burgos-primary/20 text-center relative overflow-hidden">
                    <h1 className="text-3xl font-bold text-white mb-8">Painel de Gerência</h1>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {barbersList.map(b => (
                            <button key={b.id} onClick={() => setSelectedBarberId(b.id)} className="p-6 rounded-2xl bg-burgos-secondary/10 border border-white/5 hover:border-burgos-primary flex flex-col items-center">
                                <span className="font-bold text-white">{b.name}</span>
                            </button>
                        ))}
                    </div>
                    <div className="mt-8">
                        <button onClick={() => setShowAllBarbers(true)} className="text-burgos-primary font-bold hover:underline">
                            Ver Agendamentos Gerais
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-burgos-dark text-burgos-accent font-sans selection:bg-burgos-primary selection:text-white pb-20">
            {/* Header */}
            <header className="bg-burgos-dark/95 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Profile Info or 'Todos' */}
                        {showAllBarbers ? (
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-burgos-primary flex items-center justify-center text-burgos-dark font-bold">ALL</div>
                                <div>
                                    <h1 className="text-white font-bold text-xl leading-none">Todos</h1>
                                    <button onClick={() => setShowAllBarbers(false)} className="text-xs text-burgos-primary hover:text-white transition-colors">Voltar ao meu perfil</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full border-2 border-burgos-primary flex items-center justify-center bg-gray-800 text-white font-bold">
                                        {currentBarber?.name?.charAt(0)}
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-white font-bold text-xl leading-none">{currentBarber?.name}</h1>
                                    <p className="text-xs text-burgos-primary font-bold uppercase tracking-wider mt-1">Online</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {/* View Mode Toggles */}
                        <div className="hidden md:flex bg-burgos-secondary/20 rounded-full p-1 border border-white/5">
                            {(['day', 'week', 'month'] as const).map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-all ${viewMode === mode ? 'bg-burgos-primary text-burgos-dark shadow-lg' : 'text-burgos-accent hover:text-white'}`}
                                >
                                    {mode === 'day' ? 'Dia' : mode === 'week' ? 'Semana' : 'Mês'}
                                </button>
                            ))}
                        </div>

                        <div className="hidden md:flex items-center gap-2 bg-burgos-secondary/20 rounded-full p-1 pr-4 border border-white/5">
                            <span className="bg-burgos-secondary/40 rounded-full p-2">📅</span>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-transparent text-white outline-none text-sm font-bold w-32"
                            />
                        </div>

                        <Link
                            href="/agendamento"
                            className="bg-burgos-primary hover:bg-burgos-primary/90 text-white font-bold py-2 px-4 rounded-full text-sm flex items-center gap-2 shadow-lg shadow-burgos-primary/20 transition-all hover:scale-105"
                        >
                            <span>+</span>
                            <span className="hidden sm:inline">Novo</span>
                        </Link>

                        {/* Toggle Show All for Barber */}
                        {user?.role === 'barbeiro' && !showAllBarbers && (
                            <button onClick={() => setShowAllBarbers(true)} className="text-xs font-bold text-burgos-accent hover:text-white border px-2 py-1 rounded">
                                Ver Todos
                            </button>
                        )}

                        <button
                            onClick={() => { setSelectedBarberId(''); setShowAllBarbers(false); }}
                            className="w-10 h-10 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                            title="Sair"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Stats Row - Only show for DAY mode */}
                {viewMode === 'day' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="glass-dark p-4 rounded-2xl border border-white/5">
                            <p className="text-xs text-burgos-accent/60 uppercase font-bold">Total Hoje</p>
                            <p className="text-2xl font-bold text-white">{appointments.length}</p>
                        </div>
                        <div className="glass-dark p-4 rounded-2xl border border-white/5">
                            <p className="text-xs text-burgos-accent/60 uppercase font-bold">Pendentes</p>
                            <p className="text-2xl font-bold text-burgos-primary">{appointments.filter(a => a.status === 'agendado').length}</p>
                        </div>
                        {/* Mobile Toggles */}
                        <div className="md:hidden col-span-2 flex gap-2">
                            {(['day', 'week', 'month'] as const).map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`flex-1 py-3.5 rounded-xl text-xs font-bold uppercase border border-white/5 ${viewMode === mode ? 'bg-burgos-primary text-burgos-dark' : 'bg-glass-dark text-white'}`}
                                >
                                    {mode === 'day' ? 'Dia' : mode === 'week' ? 'Semana' : 'Mês'}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-burgos-primary mb-4"></div>
                        <p className="text-white">Carregando...</p>
                    </div>
                ) : (
                    <>
                        {viewMode === 'day' ? (
                            // DAY VIEW (Cards)
                            <div className="space-y-4 max-w-4xl mx-auto">
                                {appointments.length === 0 ? (
                                    <div className="text-center py-20">
                                        <div className="inline-block p-8 rounded-full bg-burgos-secondary/10 mb-6 animate-pulse text-5xl">☕</div>
                                        <h2 className="text-2xl text-white font-bold mb-2">Agenda Livre</h2>
                                    </div>
                                ) : (
                                    appointments.map((appt) => (
                                        <div key={appt.id} className="glass-dark border border-white/5 p-6 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="text-center min-w-[80px]">
                                                    <div className="text-2xl font-bold text-white">{new Date(appt.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                                                    <div className="text-xs text-burgos-accent uppercase">{showAllBarbers ? (appt.barber?.name || 'Barbeiro') : 'Horário'}</div>
                                                </div>
                                                <div className="h-10 w-px bg-white/10 mx-2"></div>
                                                <div>
                                                    <div className="text-lg font-bold text-white">{appt.client?.name}</div>
                                                    <div className="text-sm text-burgos-primary">{appt.service?.name}</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {appt.status === 'agendado' && (
                                                    <button onClick={() => updateStatus(appt.id, 'em_atendimento')} className="px-4 py-2 bg-burgos-primary text-burgos-dark font-bold rounded-lg hover:bg-white transition-colors">Iniciar</button>
                                                )}
                                                {appt.status === 'em_atendimento' && (
                                                    <button onClick={() => updateStatus(appt.id, 'concluido')} className="px-4 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-400 transition-colors">Finalizar</button>
                                                )}
                                                <div className="px-3 py-2 bg-white/5 rounded-lg text-xs font-bold uppercase tracking-wider text-burgos-accent border border-white/5">
                                                    {appt.status.replace('_', ' ')}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            // TABLE VIEW (Week/Month)
                            <div className="overflow-x-auto glass-dark rounded-2xl border border-white/5">
                                <table className="w-full text-left">
                                    <thead className="bg-burgos-secondary/20 text-xs uppercase text-burgos-accent font-bold">
                                        <tr>
                                            <th className="p-4">Data/Hora</th>
                                            {showAllBarbers && <th className="p-4">Barbeiro</th>}
                                            <th className="p-4">Cliente</th>
                                            <th className="p-4">Serviço</th>
                                            <th className="p-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-sm">
                                        {appointments.length === 0 ? (
                                            <tr><td colSpan={5} className="p-8 text-center text-white/50">Nenhum agendamento neste período.</td></tr>
                                        ) : (
                                            appointments.map(appt => (
                                                <tr key={appt.id} className="hover:bg-white/5 transition-colors text-white">
                                                    <td className="p-4 font-mono">
                                                        {new Date(appt.scheduled_at).toLocaleDateString('pt-BR')} <span className="text-burgos-primary ml-1">{new Date(appt.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </td>
                                                    {showAllBarbers && <td className="p-4 font-bold">{appt.barber?.name}</td>}
                                                    <td className="p-4">{appt.client?.name}</td>
                                                    <td className="p-4 text-burgos-accent">{appt.service?.name}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase 
                                                            ${appt.status === 'agendado' ? 'bg-blue-500/10 text-blue-400' :
                                                                appt.status === 'concluido' ? 'bg-green-500/10 text-green-400' : 'bg-white/10 text-white/50'}`}>
                                                            {appt.status.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
