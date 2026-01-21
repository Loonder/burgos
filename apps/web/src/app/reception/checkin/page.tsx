'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckInPage() {
    const router = useRouter();
    const [phone, setPhone] = useState('');
    const [status, setStatus] = useState<'idle' | 'searching' | 'confirming' | 'success' | 'error'>('idle');
    const [foundAppointment, setFoundAppointment] = useState<any>(null);
    const [message, setMessage] = useState('');

    const handleNumberClick = (num: string) => {
        if (phone.length < 11) { // Limit to 11 digits (DDD + 9 digits)
            setPhone(prev => prev + num);
        }
    };

    const handleBackspace = () => {
        setPhone(prev => prev.slice(0, -1));
    };

    const handleClear = () => {
        setPhone('');
        setStatus('idle');
        setFoundAppointment(null);
    };

    const handleSearch = async () => {
        if (phone.length < 8) {
            setMessage('Por favor, digite o número completo.');
            return;
        }

        setStatus('searching');
        setMessage('');

        try {
            // 1. Fetch appointments for today
            // In a real app, we would have a specific endpoint or filter by phone directly in the API
            // For MVP, we fetch today's appointments and find the match client-side
            const today = new Date().toISOString().split('T')[0];
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments?date=${today}`, {
                credentials: 'include'
            });
            const data = await res.json();

            if (!data.data) throw new Error('Falha ao buscar agendamentos');

            // 2. Find appointment with matching client phone
            // We strip formatting to compare raw numbers
            const targetPhone = phone.replace(/\D/g, '');

            const match = data.data.find((appt: any) => {
                // Assuming client.phone exists and matches
                const clientPhone = appt.client?.phone?.replace(/\D/g, '') || '';
                return clientPhone.includes(targetPhone) && (appt.status === 'agendado' || appt.status === 'aguardando');
            });

            if (match) {
                setFoundAppointment(match);
                setStatus('confirming');
            } else {
                setStatus('error');
                setMessage('Nenhum agendamento encontrado para hoje com este número.');
            }

        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage('Erro ao buscar agendamentos. Tente novamente.');
        }
    };

    const handleConfirmCheckIn = async () => {
        if (!foundAppointment) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/${foundAppointment.id}/check-in`, {
                method: 'POST',
                credentials: 'include'
            });

            if (res.ok) {
                setStatus('success');
                // Auto-reset after 5 seconds
                setTimeout(() => {
                    handleClear();
                }, 5000);
            } else {
                throw new Error('Check-in failed');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Erro ao realizar check-in.');
        }
    };

    return (
        <div className="min-h-screen bg-burgos-dark text-white flex flex-col">

            {/* Header */}
            <header className="p-6 flex justify-center border-b border-light-navy-100/10">
                <img src="/logo-dbb.png" alt="Burgos Barber" className="h-12" />
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-4">

                {status === 'success' ? (
                    <div className="text-center animate-fade-in space-y-6">
                        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,197,94,0.5)]">
                            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-4xl font-display font-bold text-white">Bem-vindo!</h1>
                        <p className="text-xl text-burgos-accent">Seu check-in foi confirmado.</p>
                        <p className="text-lg text-white/60">Aguarde, logo iremos te chamar.</p>
                    </div>
                ) : status === 'confirming' ? (
                    <div className="max-w-md w-full bg-burgos-secondary/20 p-8 rounded-2xl border border-burgos-primary/30 animate-fade-in text-center space-y-6">
                        <h2 className="text-2xl font-bold text-white">Confirmar Check-in</h2>

                        <div className="flex items-center gap-4 bg-black/20 p-4 rounded-xl text-left">
                            <img
                                src={foundAppointment.client.avatar_url || '/barbers/andre.png'}
                                className="w-16 h-16 rounded-full object-cover bg-burgos-secondary"
                            />
                            <div>
                                <h3 className="text-xl font-bold text-white">{foundAppointment.client.name}</h3>
                                <p className="text-burgos-primary">{foundAppointment.service.name}</p>
                                <p className="text-sm text-burgos-accent/60">
                                    {new Date(foundAppointment.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} com {foundAppointment.barber?.name}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <button
                                onClick={handleClear}
                                className="py-4 rounded-xl border border-white/10 text-white hover:bg-white/5 font-bold transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmCheckIn}
                                className="py-4 rounded-xl bg-burgos-primary text-burgos-dark font-bold hover:shadow-[0_0_20px_rgba(255,159,28,0.4)] transition-all"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-md w-full space-y-8 animate-fade-in">
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-display font-bold text-white">Check-in Digital</h1>
                            <p className="text-burgos-accent/60">Digite seu telefone para se identificar</p>
                        </div>

                        {/* Display */}
                        <div className="bg-black/30 p-6 rounded-2xl border border-white/5 text-center mb-8 h-24 flex items-center justify-center relative">
                            <span className={`text-4xl font-mono tracking-widest ${phone ? 'text-white' : 'text-white/20'}`}>
                                {phone || '___.___.__'}
                            </span>
                            {phone && (
                                <button
                                    onClick={handleBackspace}
                                    className="absolute right-4 text-burgos-accent hover:text-white p-2"
                                >
                                    ⌫
                                </button>
                            )}
                        </div>

                        {/* Keypad */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <button
                                    key={num}
                                    onClick={() => handleNumberClick(num.toString())}
                                    className="aspect-square rounded-2xl bg-burgos-secondary/20 hover:bg-burgos-secondary/40 border border-white/5 text-2xl font-bold text-white transition-all active:scale-95"
                                >
                                    {num}
                                </button>
                            ))}
                            <button
                                onClick={handleClear}
                                className="aspect-square rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold transition-all active:scale-95 flex items-center justify-center text-sm uppercase tracking-wide"
                            >
                                Limpar
                            </button>
                            <button
                                onClick={() => handleNumberClick('0')}
                                className="aspect-square rounded-2xl bg-burgos-secondary/20 hover:bg-burgos-secondary/40 border border-white/5 text-2xl font-bold text-white transition-all active:scale-95"
                            >
                                0
                            </button>
                            <button
                                onClick={handleSearch}
                                disabled={phone.length < 3 || status === 'searching'}
                                className="aspect-square rounded-2xl bg-burgos-primary text-burgos-dark hover:bg-burgos-primary/90 font-bold text-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {status === 'searching' ? '...' : 'OK'}
                            </button>
                        </div>

                        {message && (
                            <div className={`text-center p-4 rounded-xl ${status === 'error' ? 'bg-red-500/20 text-red-200' : 'bg-burgos-secondary/20 text-burgos-accent'}`}>
                                {message}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
