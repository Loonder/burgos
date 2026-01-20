'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash, Edit2, User, Phone, Mail, Clock } from 'lucide-react';
import { ScheduleEditor } from '@/components/admin/ScheduleEditor';

interface Barber {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    commission_rate?: number;
    is_active: boolean;
}

export default function BarbersPage() {
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        email: '',
        phone: '',
        commission_rate: 40,
        password: 'password123' // Temp default
    });
    const [selectedBarberForSchedule, setSelectedBarberForSchedule] = useState<{ id: string, name: string } | null>(null);

    const fetchBarbers = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/barbers`);
            setBarbers(res.data.data);
        } catch (error) {
            console.error('Failed to load barbers', error);
        }
    };

    useEffect(() => {
        fetchBarbers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (formData.id) {
                // Update
                await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/barbers/${formData.id}`, formData);
            } else {
                // Create
                await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/barbers`, formData);
            }
            setIsFormOpen(false);
            fetchBarbers();
            setFormData({ id: '', name: '', email: '', phone: '', commission_rate: 40, password: 'password123' });
        } catch (error) {
            alert('Error saving barber');
        }
    };

    const handleEdit = (barber: Barber) => {
        setFormData({
            id: barber.id,
            name: barber.name || '',
            email: barber.email || '',
            phone: barber.phone || '',
            commission_rate: barber.commission_rate || 40,
            password: '' // Don't wipe password on edit unless changed
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to deactivate this professional?')) return;
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/barbers/${id}`);
            fetchBarbers();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <User className="text-burgos-primary" />
                    Gerenciar Profissionais
                </h1>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center gap-2 bg-burgos-primary hover:bg-burgos-light text-burgos-dark px-4 py-2 rounded-xl font-bold transition-all"
                >
                    <Plus size={20} />
                    Novo Profissional
                </button>
            </div>

            {/* Creation Form (Inline) */}
            {isFormOpen && (
                <div className="glass-dark p-6 rounded-2xl border border-white/10 animate-fade-in-down">
                    <h3 className="text-white font-bold mb-4">{formData.id ? 'Editar Barbeiro' : 'Novo Barbeiro'}</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            placeholder="Nome Completo"
                            className="bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-burgos-primary outline-none"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <input
                            placeholder="Email"
                            type="email"
                            className="bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-burgos-primary outline-none"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                        <input
                            placeholder="Telefone"
                            className="bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-burgos-primary outline-none"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            required
                        />
                        <div className="relative">
                            <input
                                placeholder="Comissão (%)"
                                type="number"
                                min="0"
                                max="100"
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-burgos-primary outline-none"
                                value={formData.commission_rate}
                                onChange={e => setFormData({ ...formData, commission_rate: Number(e.target.value) })}
                                required
                            />
                            <span className="absolute right-3 top-3 text-burgos-accent/40 text-sm">%</span>
                        </div>
                        <div className="flex gap-2 justify-end mt-2 items-end">
                            <button type="button" onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-white px-4 py-2">Cancelar</button>
                            <button type="submit" className="bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-2 rounded-lg">Salvar</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Barbers List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {barbers.map((barber) => (
                    <div key={barber.id} className={`glass-dark p-6 rounded-2xl border hover:border-burgos-primary/30 transition-all group ${!barber.is_active ? 'opacity-50 border-red-500/20' : 'border-white/5'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-16 w-16 rounded-full bg-burgos-primary/20 flex items-center justify-center text-burgos-primary text-xl font-bold border-2 border-burgos-primary/20">
                                {barber.name.charAt(0)}
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {barber.is_active && (
                                    <>
                                        <button
                                            onClick={() => handleEdit(barber)}
                                            className="p-2 hover:bg-white/10 rounded-lg text-burgos-primary"
                                            title="Editar"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(barber.id)}
                                            className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300"
                                            title="Desativar"
                                        >
                                            <Trash size={16} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">{barber.name}</h3>
                        <div className="space-y-2 mt-4">
                            <div className="flex items-center gap-3 text-burgos-accent/80 text-sm">
                                <Mail size={14} />
                                {barber.email}
                            </div>
                            <div className="flex items-center gap-3 text-burgos-accent/80 text-sm">
                                <Phone size={14} />
                                {barber.phone}
                            </div>
                            <div className="flex items-center gap-3 text-burgos-accent/80 text-sm">
                                <span className="text-burgos-primary">💰</span>
                                {barber.commission_rate || 40}% Comissão
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedBarberForSchedule({ id: barber.id, name: barber.name })}
                            className="mt-4 w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 p-2 rounded-lg text-sm text-white font-medium transition-colors border border-white/5"
                        >
                            <Clock size={16} className="text-burgos-primary" />
                            Gerenciar Horários
                        </button>

                        {!barber.is_active && (
                            <div className="mt-4 text-xs bg-red-500/10 text-red-400 px-3 py-1 rounded-full w-fit">
                                Desativado
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {selectedBarberForSchedule && (
                <ScheduleEditor
                    barberId={selectedBarberForSchedule.id}
                    barberName={selectedBarberForSchedule.name}
                    onClose={() => setSelectedBarberForSchedule(null)}
                />
            )}
        </div>
    );
}
