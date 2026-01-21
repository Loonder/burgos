'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSubscribersPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [plans, setPlans] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSub, setCurrentSub] = useState<any>(null);
    const [formData, setFormData] = useState({ user_id: '', plan_id: '', status: 'active', days: 30 });

    useEffect(() => {
        if (!isLoading && user?.role !== 'admin') {
            router.push('/');
        }
    }, [user, isLoading, router]);

    const fetchData = async () => {
        try {
            const [subsRes, plansRes, clientsRes] = await Promise.all([
                api.get('/api/admin/plans/subscribers'),
                api.get('/api/admin/plans'),
                api.get('/api/clients')
            ]);
            setSubscribers(subsRes.data.data || []);
            setPlans(plansRes.data.data || []);
            setClients(clientsRes.data.data || []);
        } catch (error) {
            console.error('Error fetching data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchData();
        }
    }, [user]);

    const handleSave = async () => {
        try {
            if (currentSub) {
                // Update
                await api.put(`/api/admin/subscriptions/${currentSub.id}`, {
                    status: formData.status,
                    plan_id: formData.plan_id
                });
                toast.success('Assinatura atualizada!');
            } else {
                // Create new
                await api.post('/api/admin/subscriptions', {
                    user_id: formData.user_id,
                    plan_id: formData.plan_id,
                    status: formData.status,
                    days: formData.days
                });
                toast.success('Assinatura criada!');
            }
            setIsModalOpen(false);
            setCurrentSub(null);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Erro ao salvar');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja remover esta assinatura?')) return;
        try {
            await api.delete(`/api/admin/subscriptions/${id}`);
            toast.success('Assinatura removida!');
            fetchData();
        } catch (error) {
            toast.error('Erro ao remover assinatura');
        }
    };

    const openCreateModal = () => {
        setCurrentSub(null);
        setFormData({ user_id: '', plan_id: plans[0]?.id || '', status: 'active', days: 30 });
        setIsModalOpen(true);
    };

    const openEditModal = (sub: any) => {
        setCurrentSub(sub);
        setFormData({
            user_id: sub.user_id,
            plan_id: sub.plan_id,
            status: sub.status,
            days: 30
        });
        setIsModalOpen(true);
    };

    if (loading || isLoading) return <div className="text-white text-center p-12">Carregando assinantes...</div>;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <span className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-1 rounded-full text-xs font-bold"><CheckCircle size={12} /> Ativo</span>;
            case 'trialing':
                return <span className="flex items-center gap-1 text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full text-xs font-bold"><Clock size={12} /> Trial</span>;
            case 'canceled':
                return <span className="flex items-center gap-1 text-red-400 bg-red-400/10 px-2 py-1 rounded-full text-xs font-bold"><XCircle size={12} /> Cancelado</span>;
            default:
                return <span className="text-gray-400 bg-gray-400/10 px-2 py-1 rounded-full text-xs font-bold uppercase">{status}</span>;
        }
    };

    // Filter out users who already have active subscriptions
    const availableClients = clients.filter(c =>
        !subscribers.some(s => s.user_id === c.id && s.status === 'active')
    );

    return (
        <div className="p-8 pb-32">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Gestão de Assinantes</h1>
                <button
                    onClick={openCreateModal}
                    className="bg-burgos-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90"
                >
                    <Plus size={20} /> Nova Assinatura
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-burgos-secondary p-8 rounded-2xl w-full max-w-md border border-burgos-primary/30">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">
                                {currentSub ? 'Editar Assinatura' : 'Nova Assinatura'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-white/50 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {!currentSub && (
                                <div>
                                    <label className="block text-burgos-accent/70 mb-1">Cliente</label>
                                    <select
                                        value={formData.user_id}
                                        onChange={e => setFormData({ ...formData, user_id: e.target.value })}
                                        className="w-full bg-burgos-dark border border-white/10 rounded-lg p-3 text-white"
                                    >
                                        <option value="">Selecione um cliente</option>
                                        {availableClients.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-burgos-accent/70 mb-1">Plano</label>
                                <select
                                    value={formData.plan_id}
                                    onChange={e => setFormData({ ...formData, plan_id: e.target.value })}
                                    className="w-full bg-burgos-dark border border-white/10 rounded-lg p-3 text-white"
                                >
                                    {plans.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} - R$ {p.price.toFixed(2)}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-burgos-accent/70 mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full bg-burgos-dark border border-white/10 rounded-lg p-3 text-white"
                                >
                                    <option value="active">Ativo</option>
                                    <option value="trialing">Trial</option>
                                    <option value="canceled">Cancelado</option>
                                    <option value="past_due">Pagamento Pendente</option>
                                </select>
                            </div>

                            {!currentSub && (
                                <div>
                                    <label className="block text-burgos-accent/70 mb-1">Duração (dias)</label>
                                    <input
                                        type="number"
                                        value={formData.days}
                                        onChange={e => setFormData({ ...formData, days: Number(e.target.value) })}
                                        className="w-full bg-burgos-dark border border-white/10 rounded-lg p-3 text-white"
                                        min={1}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 rounded-lg bg-burgos-primary text-white hover:bg-opacity-90 flex items-center gap-2"
                            >
                                <Save size={18} /> Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-burgos-secondary/20 rounded-xl overflow-hidden border border-light-navy-100/10">
                <table className="w-full text-left">
                    <thead className="bg-burgos-secondary/50 text-burgos-accent/70 uppercase text-xs font-bold">
                        <tr>
                            <th className="p-4">Cliente</th>
                            <th className="p-4">Plano</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Desde</th>
                            <th className="p-4">Renovação</th>
                            <th className="p-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {subscribers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-burgos-accent/50">Nenhum assinante encontrado.</td>
                            </tr>
                        ) : (
                            subscribers.map((sub) => (
                                <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div>
                                            <p className="font-bold text-white">{sub.user?.name || 'Usuário Removido'}</p>
                                            <p className="text-xs text-burgos-accent/50">{sub.user?.email}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 text-white">{sub.plan?.name || 'Plano Removido'}</td>
                                    <td className="p-4">{getStatusBadge(sub.status)}</td>
                                    <td className="p-4 text-burgos-accent/70 text-sm">
                                        {new Date(sub.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-burgos-accent/70 text-sm font-mono">
                                        {new Date(sub.current_period_end).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(sub)}
                                                className="p-2 hover:bg-white/10 rounded-lg text-burgos-primary"
                                                title="Editar"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(sub.id)}
                                                className="p-2 hover:bg-white/10 rounded-lg text-red-400"
                                                title="Remover"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
