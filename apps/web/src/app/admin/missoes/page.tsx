'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Mission {
    id: string;
    title: string;
    description: string;
    type: string;
    target_value: number;
    reward_type: string;
    reward_value: number;
    start_date: string;
    end_date: string;
    is_active: boolean;
}

export default function AdminMissionsPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [missions, setMissions] = useState<Mission[]>([]);
    const [isMissionsLoading, setIsMissionsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'appointments_count',
        target_value: 10,
        reward_type: 'cash',
        reward_value: 50,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0]
    });

    useEffect(() => {
        if (user) fetchMissions();
    }, [user]);

    const fetchMissions = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/missions`, {
                credentials: 'include' // Use cookies instead of localStorage
            });
            const data = await res.json();
            setMissions(data.data || []);
        } catch (error) {
            console.error('Error fetching missions', error);
        } finally {
            setIsMissionsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/missions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // Use cookies instead of localStorage
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success('Missão criada com sucesso!');
                setShowForm(false);
                fetchMissions();
                // Reset form slightly
                setFormData(prev => ({ ...prev, title: '', description: '' }));
            } else {
                toast.error('Erro ao criar missão');
            }
        } catch (error) {
            console.error('Error creating mission', error);
            toast.error('Erro de conexão');
        }
    };

    if (isAuthLoading) return null; // Wait for auth first

    return (
        <div className="space-y-8 animate-fade-in p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Central de Missões ⚔️</h1>
                    <p className="text-burgos-accent/60">Crie desafios e engaje sua equipe na guerra de vendas.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-burgos-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-burgos-primary/90 transition-all flex items-center gap-2"
                >
                    {showForm ? 'Cancelar' : '+ Nova Missão'}
                </button>
            </div>

            {/* Create Mission Form */}
            {showForm && (
                <div className="bg-burgos-secondary/20 border border-burgos-primary/30 rounded-2xl p-6 animate-fade-in">
                    <h2 className="text-xl font-bold text-white mb-4">Nova Missão</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-burgos-accent/60 mb-1">Título</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-burgos-dark/50 border border-white/10 rounded-lg p-3 text-white focus:border-burgos-primary outline-none"
                                    placeholder="Ex: Rei da Pomada"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-burgos-accent/60 mb-1">Tipo de Meta</label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full bg-burgos-dark/50 border border-white/10 rounded-lg p-3 text-white focus:border-burgos-primary outline-none"
                                >
                                    <option value="appointments_count">Quantidade de Cortes</option>
                                    <option value="revenue_target">Faturamento (R$)</option>
                                    <option value="product_sales">Venda de Produtos</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-burgos-accent/60 mb-1">Meta (Valor Numérico)</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.target_value}
                                    onChange={e => setFormData({ ...formData, target_value: Number(e.target.value) })}
                                    className="w-full bg-burgos-dark/50 border border-white/10 rounded-lg p-3 text-white focus:border-burgos-primary outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm text-burgos-accent/60 mb-1">Prêmio (Tipo)</label>
                                    <select
                                        value={formData.reward_type}
                                        onChange={e => setFormData({ ...formData, reward_type: e.target.value })}
                                        className="w-full bg-burgos-dark/50 border border-white/10 rounded-lg p-3 text-white focus:border-burgos-primary outline-none"
                                    >
                                        <option value="cash">Dinheiro (R$)</option>
                                        <option value="points">Pontos</option>
                                        <option value="badge">Badge/Medalha</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-burgos-accent/60 mb-1">Valor do Prêmio</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.reward_value}
                                        onChange={e => setFormData({ ...formData, reward_value: Number(e.target.value) })}
                                        className="w-full bg-burgos-dark/50 border border-white/10 rounded-lg p-3 text-white focus:border-burgos-primary outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-burgos-accent/60 mb-1">Descrição</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-burgos-dark/50 border border-white/10 rounded-lg p-3 text-white focus:border-burgos-primary outline-none"
                                    rows={2}
                                    placeholder="Detalhes da missão..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm text-burgos-accent/60 mb-1">Início</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.start_date}
                                        onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                        className="w-full bg-burgos-dark/50 border border-white/10 rounded-lg p-3 text-white focus:border-burgos-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-burgos-accent/60 mb-1">Fim</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.end_date}
                                        onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                        className="w-full bg-burgos-dark/50 border border-white/10 rounded-lg p-3 text-white focus:border-burgos-primary outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-burgos-primary hover:bg-burgos-primary/90 text-white font-bold py-3 rounded-lg transition-colors">
                            Lançar Missão
                        </button>
                    </form>
                </div>
            )}

            {/* Missions List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {missions.map(mission => (
                    <div key={mission.id} className="bg-burgos-secondary/20 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-burgos-primary/30 transition-all">
                        <div className={`absolute top-0 right-0 p-2 text-xs font-bold ${mission.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} rounded-bl-xl`}>
                            {mission.is_active ? 'ATIVA' : 'ENCERRADA'}
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">{mission.title}</h3>
                        <p className="text-burgos-accent/60 text-sm mb-4 min-h-[40px]">{mission.description}</p>

                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-burgos-accent/60">Meta:</span>
                                <span className="text-white font-bold">{mission.target_value} {mission.type === 'revenue_target' ? 'R$' : 'Un/Cortes'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-burgos-accent/60">Prêmio:</span>
                                <span className="text-burgos-primary font-bold">
                                    {mission.reward_type === 'cash' && 'R$ '}
                                    {mission.reward_value}
                                    {mission.reward_type !== 'cash' && ` ${mission.reward_type}`}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-burgos-accent/60">Prazo:</span>
                                <span className="text-white">{new Date(mission.end_date).toLocaleDateString('pt-BR')}</span>
                            </div>
                        </div>

                        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                            {/* Placeholder for overall team progress if we had it */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
