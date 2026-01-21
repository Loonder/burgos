'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AppointmentCardSkeleton } from '@/components/skeletons/AppointmentCardSkeleton';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import axios from 'axios';

interface Appointment {
    id: string;
    scheduled_at: string;
    status: 'agendado' | 'aguardando' | 'em_atendimento' | 'finalizado' | 'cancelado';
    service: {
        name: string;
        price: number;
        duration_minutes: number;
    };
    barber: {
        name: string;
        avatar_url: string;
    };
}

export default function MyAppointments() {
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isLoading) return;
        if (!user) {
            router.push('/auth/login');
            return;
        }

        const fetchAppointments = async () => {
            try {
                const { data } = await api.get(`/api/appointments?clientId=${user.id}`);
                setAppointments(data.data || []);
            } catch (error) {
                console.error(error);
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    // Optional: handle token expiration
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [user, isLoading]);



    // ... 

    const handleCancel = async (id: string) => {
        // Simple confirm for now, better to use a Dialog later
        if (!confirm('Tem certeza que deseja cancelar?')) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/${id}`, {
                method: 'DELETE',
                credentials: 'include', // Important: Include cookies for auth
            });

            if (!response.ok) throw new Error('Falha ao cancelar');

            // Refresh list
            setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelado' } : a));
            toast.success('Agendamento cancelado com sucesso');
        } catch (error) {
            console.error('Error cancelling', error);
            toast.error('Erro ao cancelar agendamento');
        }
    };

    return (
        <main className="min-h-screen bg-burgos-dark text-burgos-text pb-20">
            {/* Header */}
            <div className="bg-burgos-secondary/50 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={() => router.push('/')}
                        className="text-burgos-accent hover:text-white transition-colors"
                    >
                        ← Voltar
                    </button>
                    <h1 className="text-xl font-display font-bold text-white">Meus Agendamentos</h1>
                    <button
                        onClick={() => router.push('/agendamento')}
                        className="bg-burgos-primary/10 text-burgos-primary hover:bg-burgos-primary/20 p-2 rounded-full transition-colors"
                        title="Novo Agendamento"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-2xl">
                {loading ? (
                    <div className="space-y-4">
                        <AppointmentCardSkeleton />
                        <AppointmentCardSkeleton />
                        <AppointmentCardSkeleton />
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-burgos-accent mb-6">Você não tem agendamentos.</p>
                        <button
                            onClick={() => router.push('/agendamento')}
                            className="bg-burgos-primary text-burgos-dark font-bold py-3 px-8 rounded-full hover:bg-white transition-all transform hover:scale-105"
                        >
                            Agendar Agora
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {appointments.map((appointment) => (
                            <div
                                key={appointment.id}
                                className="bg-burgos-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 hover:bg-white/5 transition-colors"
                            >
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-1">{appointment.service.name}</h3>
                                            <p className="text-burgos-primary font-medium">
                                                {new Date(appointment.scheduled_at).toLocaleDateString()} às {new Date(appointment.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <span className={`
                                            px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                            ${appointment.status === 'agendado' ? 'bg-blue-500/20 text-blue-400' : ''}
                                            ${appointment.status === 'cancelado' ? 'bg-red-500/20 text-red-400' : ''}
                                            ${appointment.status === 'finalizado' ? 'bg-green-500/20 text-green-400' : ''}
                                            ${appointment.status === 'em_atendimento' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                                        `}>
                                            {appointment.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3 text-sm text-burgos-accent/80">
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-burgos-secondary">
                                            {appointment.barber?.avatar_url && (
                                                <img src={appointment.barber.avatar_url} alt={appointment.barber.name} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <span>com {appointment.barber?.name || 'Barbeiro'}</span>
                                        <span className="w-1 h-1 bg-burgos-accent/40 rounded-full"></span>
                                        <span>R$ {appointment.service.price}</span>
                                    </div>
                                </div>

                                {appointment.status === 'agendado' && (
                                    <div className="flex flex-col justify-center border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-6 mt-4 sm:mt-0">
                                        <button
                                            onClick={() => handleCancel(appointment.id)}
                                            className="text-red-400 hover:text-red-300 text-sm font-medium py-2 px-4 rounded-lg hover:bg-red-500/10 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
