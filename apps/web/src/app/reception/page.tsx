'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Appointment {
    id: string;
    scheduled_at: string;
    status: 'agendado' | 'em_atendimento' | 'concluido' | 'cancelado';
    client: {
        name: string;
        avatar_url: string;
        phone: string;
    };
    barber: {
        name: string;
        avatar_url: string;
    };
    service: {
        name: string;
    };
}

interface CRMData {
    confirmations: Appointment[];
    reminders: Appointment[];
    birthdays: any[];
    retention: any[];
}

export default function ReceptionPage() {
    const { user, isLoading } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [crmData, setCrmData] = useState<CRMData | null>(null);
    const [showCRM, setShowCRM] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchAppointments = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments?date=${today}`);
            const data = await res.json();
            setAppointments(data.data || []);
        } catch (error) {
            console.error('Error fetching reception data', error);
        }
    };

    const fetchCRM = async () => {
        try {
            // Access token logic might be needed if endpoint is protected.
            // Assuming useAuth/Axios interceptor handles it, or we manually add header if needed.
            // For now, using fetch directly might fail if auth is strict.
            // Ideally we use a wrapper like api.get() but keeping it simple.
            const token = localStorage.getItem('access_token'); // Simplification
            if (!token) return;

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/crm/alerts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setCrmData(data);
        } catch (error) {
            console.error('Error fetching CRM data', error);
        }
    };

    useEffect(() => {
        fetchAppointments();
        fetchCRM();
        const interval = setInterval(fetchAppointments, 15000);
        return () => clearInterval(interval);
    }, []);

    // Filter for active view
    const upcoming = appointments.filter(a => a.status === 'agendado').sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
    const inService = appointments.filter(a => a.status === 'em_atendimento');

    const handleWhatsApp = (phone: string, message: string) => {
        const cleanPhone = phone.replace(/\D/g, ''); // Remove non-digits
        // Add country code if missing (assuming BR +55)
        const fullPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
        window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-burgos-dark text-white overflow-hidden flex font-sans">

            {/* Sidebar / Concierge Toggle */}
            <div className={`fixed inset-y-0 right-0 w-96 bg-burgos-secondary/10 backdrop-blur-xl border-l border-white/10 transform transition-transform duration-300 z-50 overflow-y-auto ${showCRM ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold font-display text-white">Concierge CRM</h2>
                        <button onClick={() => setShowCRM(false)} className="text-white/50 hover:text-white">✕</button>
                    </div>

                    {/* CRM Sections */}
                    <div className="space-y-8">

                        {/* 1. Birthdays */}
                        <section>
                            <h3 className="text-sm font-bold uppercase text-burgos-primary mb-4 flex items-center gap-2">
                                🎂 Aniversariantes do Dia
                            </h3>
                            {crmData?.birthdays?.length === 0 ? <p className="text-white/30 text-sm">Nenhum hoje.</p> : (
                                <div className="space-y-3">
                                    {crmData?.birthdays.map((client: any) => (
                                        <div key={client.id} className="bg-white/5 p-4 rounded-xl flex items-center justify-between">
                                            <div>
                                                <div className="font-bold">{client.name}</div>
                                                <div className="text-xs text-white/50">{client.phone}</div>
                                            </div>
                                            <button
                                                onClick={() => handleWhatsApp(client.phone, `Olá ${client.name}! A Barbearia Burgos deseja um feliz aniversário! 🎂 Venha comemorar com a gente!`)}
                                                className="bg-green-600 p-2 rounded-lg hover:bg-green-500 transition-colors"
                                            >
                                                📱
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* 2. Confirmations (Tomorrow) */}
                        <section>
                            <h3 className="text-sm font-bold uppercase text-blue-400 mb-4 flex items-center gap-2">
                                ✅ Confirmar Amanhã (24h)
                            </h3>
                            {crmData?.confirmations?.length === 0 ? <p className="text-white/30 text-sm">Nada para confirmar.</p> : (
                                <div className="space-y-3">
                                    {crmData?.confirmations.map((appt: any) => (
                                        <div key={appt.id} className="bg-white/5 p-4 rounded-xl flex items-center justify-between">
                                            <div>
                                                <div className="font-bold">{appt.client?.name}</div>
                                                <div className="text-xs text-blue-300">
                                                    {new Date(appt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} com {appt.barber?.name}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleWhatsApp(appt.client?.phone, `Olá ${appt.client?.name}, confirmamos seu horário amanhã às ${new Date(appt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} com ${appt.barber?.name}?`)}
                                                className="bg-green-600 p-2 rounded-lg hover:bg-green-500 transition-colors"
                                            >
                                                📱
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* 3. Retention */}
                        <section>
                            <h3 className="text-sm font-bold uppercase text-red-400 mb-4 flex items-center gap-2">
                                🔄 Retenção (+30 Dias)
                            </h3>
                            {crmData?.retention?.length === 0 ? <p className="text-white/30 text-sm">Ninguém sumido.</p> : (
                                <div className="space-y-3">
                                    {crmData?.retention.map((client: any) => (
                                        <div key={client.id} className="bg-white/5 p-4 rounded-xl flex items-center justify-between">
                                            <div>
                                                <div className="font-bold">{client.name}</div>
                                                <div className="text-xs text-white/50">Sumido desde {new Date(client.last_appointment_at).toLocaleDateString()}</div>
                                            </div>
                                            <button
                                                onClick={() => handleWhatsApp(client.phone, `Olá ${client.name}, faz tempo que não te vemos! Que tal dar um trato no visual? Temos horários disponíveis!`)}
                                                className="bg-green-600 p-2 rounded-lg hover:bg-green-500 transition-colors"
                                            >
                                                📱
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={`flex-1 flex flex-col h-full transition-all duration-300 ${showCRM ? 'mr-96' : ''}`}>
                {/* Top Bar with Crm Toggle */}
                <header className="px-8 py-6 flex justify-between items-center border-b border-white/10 bg-burgos-secondary/10 backdrop-blur-md">
                    <div className="flex items-center gap-6">
                        <img src="/logo-dbb.png" alt="Logo" className="h-20" />
                        <div className="h-12 w-px bg-white/10"></div>
                        <div>
                            <h1 className="text-3xl font-bold font-display tracking-tight">Recepção</h1>
                            <p className="text-burgos-primary uppercase tracking-widest font-bold text-sm">Bem-vindo à Don Burgos</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-8">
                        <button
                            onClick={() => { fetchCRM(); setShowCRM(!showCRM); }}
                            className="bg-burgos-primary/10 hover:bg-burgos-primary/20 text-burgos-primary border border-burgos-primary/50 px-6 py-3 rounded-full font-bold uppercase text-xs tracking-widest transition-all"
                        >
                            Concierge 🔥
                        </button>
                        <div className="text-right border-l border-white/10 pl-8">
                            <div className="text-5xl font-bold font-mono tracking-tight">
                                {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="text-burgos-accent uppercase font-bold mt-1">
                                {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-8 grid grid-cols-3 gap-8 overflow-hidden">
                    {/* ... (Existing Columns Code) ... */}
                    {/* Using the same logic as previous step but preserved here */}
                    {/* Column 1: Next Up / Waiting */}
                    <div className="col-span-1 flex flex-col gap-6 h-full">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_15px_#60A5FA]"></div>
                            <h2 className="text-2xl font-bold uppercase tracking-wider text-burgos-accent">Próximos Horários</h2>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            {upcoming.length === 0 ? (
                                <div className="h-full flex items-center justify-center border-2 border-dashed border-white/5 rounded-3xl">
                                    <p className="text-white/30 text-xl font-bold">Sem agendamentos</p>
                                </div>
                            ) : (
                                upcoming.map(appt => (
                                    <div key={appt.id} className="bg-glass-dark border border-white/5 p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
                                        <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-500/50"></div>
                                        <div className="text-3xl font-bold font-mono text-white min-w-[90px]">
                                            {new Date(appt.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-2xl font-bold truncate">{appt.client.name}</div>
                                            <div className="text-burgos-primary flex items-center gap-2">
                                                <span>com {appt.barber.name}</span>
                                                <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                                                <span>{appt.service.name}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Column 2 & 3: In Service (Featured) */}
                    <div className="col-span-2 flex flex-col gap-6 h-full">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-3 h-3 rounded-full bg-burgos-primary shadow-[0_0_15px_#FF9F1C] animate-pulse"></div>
                            <h2 className="text-2xl font-bold uppercase tracking-wider text-burgos-accent">Em Atendimento</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-6 auto-rows-max">
                            {inService.length === 0 ? (
                                <div className="col-span-2 h-64 flex items-center justify-center border-2 border-dashed border-white/5 rounded-3xl bg-white/5">
                                    <p className="text-white/30 text-2xl font-bold">Nenhum atendimento em andamento</p>
                                </div>
                            ) : (
                                inService.map(appt => (
                                    <div key={appt.id} className="relative bg-gradient-to-br from-burgos-secondary/20 to-burgos-dark border border-burgos-primary/30 p-8 rounded-3xl flex flex-col gap-6 shadow-2xl">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-4">
                                                {appt.client.avatar_url ? (
                                                    <img src={appt.client.avatar_url} className="w-20 h-20 rounded-2xl object-cover border-2 border-burgos-primary shadow-lg" />
                                                ) : (
                                                    <div className="w-20 h-20 rounded-2xl bg-burgos-secondary flex items-center justify-center text-3xl font-bold border-2 border-burgos-primary">
                                                        {appt.client.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="text-xs text-burgos-primary font-bold uppercase tracking-widest mb-1">Cliente</div>
                                                    <div className="text-3xl font-bold text-white leading-none">{appt.client.name}</div>
                                                </div>
                                            </div>
                                            <div className="px-4 py-2 rounded-full bg-burgos-primary/20 text-burgos-primary border border-burgos-primary/50 text-sm font-bold animate-pulse">
                                                EM ANDAMENTO
                                            </div>
                                        </div>

                                        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                                        <div className="flex justify-between items-end">
                                            <div>
                                                <div className="text-xs text-burgos-accent font-bold uppercase tracking-widest mb-1">Profissional</div>
                                                <div className="text-xl font-bold text-white flex items-center gap-3">
                                                    {appt.barber.avatar_url && <img src={appt.barber.avatar_url} className="w-8 h-8 rounded-full" />}
                                                    {appt.barber.name}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-burgos-accent font-bold uppercase tracking-widest mb-1">Serviço</div>
                                                <div className="text-xl font-bold text-white">{appt.service.name}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
}
