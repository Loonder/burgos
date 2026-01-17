'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Save, Upload, Palette } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';

export default function BrandingPage() {
    const { tenant, isLoading: isContextLoading } = useTenant();
    const [isLoading, setIsLoading] = useState(false);

    // Default form data
    const [formData, setFormData] = useState({
        name: '',
        primary_color: '#D4AF37',
        secondary_color: '#000000',
        logo_url: '',
        welcome_message: '',
        cover_images: '' // Stored as comma-separated string for editing
    });

    useEffect(() => {
        if (tenant) {
            setFormData({
                name: tenant.name,
                primary_color: tenant.primary_color,
                secondary_color: tenant.secondary_color,
                logo_url: tenant.logo_url || '',
                welcome_message: tenant.welcome_message || '',
                cover_images: tenant.cover_images ? tenant.cover_images.join(', ') : ''
            });
        }
    }, [tenant]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = {
                ...formData,
                cover_images: formData.cover_images.split(',').map(s => s.trim()).filter(Boolean)
            };

            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/tenants/me/branding`, payload);
            toast.success('Marca atualizada com sucesso!');

            // Updates CSS variables in real-time
            document.documentElement.style.setProperty('--primary', formData.primary_color);

            // Reload to reflect all changes
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar marca.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in p-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Palette className="text-burgos-primary" />
                Personalidade da Marca (White-Label)
            </h1>
            <p className="text-burgos-accent/60">
                Defina como seus clientes verão sua barbearia. Isso afetará seu site, agendamento e app.
            </p>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">

                {/* Visual Preview */}
                <div className="space-y-4">
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-6 text-center h-full flex flex-col items-center justify-center gap-4">
                        <h3 className="text-white font-bold mb-2">Pré-visualização</h3>

                        {/* Fake Mobile Screen */}
                        <div className="w-64 h-[450px] bg-white rounded-[2rem] border-8 border-gray-800 relative overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="h-14 w-full flex items-center justify-center shadow-md" style={{ backgroundColor: formData.secondary_color }}>
                                {formData.logo_url ? (
                                    <img src={formData.logo_url} alt="Logo" className="h-8 max-w-[100px] object-contain" />
                                ) : (
                                    <span className="font-bold text-white text-xs">{formData.name}</span>
                                )}
                            </div>
                            {/* Body */}
                            <div className="bg-gray-100 flex-1 p-4 space-y-3">
                                <div className="h-24 rounded-lg items-center justify-center flex shadow-sm" style={{ backgroundColor: formData.primary_color }}>
                                    <span className="text-black/80 font-bold text-sm">Botão Principal</span>
                                </div>
                                <div className="h-8 bg-white rounded w-full shadow-sm"></div>
                                <div className="h-8 bg-white rounded w-3/4 shadow-sm"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4 bg-glass-dark p-6 rounded-2xl border border-white/5">

                    <div>
                        <label className="text-sm text-burgos-accent/80 block mb-2">Nome da Barbearia</label>
                        <input
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-black/30 border border-white/10 p-3 rounded-lg text-white"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-burgos-accent/80 block mb-2">Link da Logo (URL)</label>
                        <div className="flex gap-2">
                            <input
                                value={formData.logo_url}
                                onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
                                className="w-full bg-black/30 border border-white/10 p-3 rounded-lg text-white"
                                placeholder="https://..."
                            />
                            {/* Simulating Upload */}
                            <button type="button" className="p-3 bg-white/10 rounded-lg hover:bg-white/20">
                                <Upload size={20} className="text-white" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-burgos-accent/80 block mb-2">Cor Primária (Ouro)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={formData.primary_color}
                                    onChange={e => setFormData({ ...formData, primary_color: e.target.value })}
                                    className="h-10 w-10 rounded overflow-hidden cursor-pointer border-none"
                                />
                                <input
                                    value={formData.primary_color}
                                    onChange={e => setFormData({ ...formData, primary_color: e.target.value })}
                                    className="flex-1 bg-black/30 border border-white/10 p-2 rounded-lg text-white uppercase"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-burgos-accent/80 block mb-2">Cor Secundária (Fundo)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={formData.secondary_color}
                                    onChange={e => setFormData({ ...formData, secondary_color: e.target.value })}
                                    className="h-10 w-10 rounded overflow-hidden cursor-pointer border-none"
                                />
                                <input
                                    value={formData.secondary_color}
                                    onChange={e => setFormData({ ...formData, secondary_color: e.target.value })}
                                    className="flex-1 bg-black/30 border border-white/10 p-2 rounded-lg text-white uppercase"
                                />
                            </div>
                        </div>
                    </div>

                    {/* CMS Fields */}
                    <div className="pt-4 border-t border-white/10">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <span className="bg-burgos-primary text-black text-xs px-2 py-1 rounded">CMS</span>
                            Personalização do Site
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-burgos-accent/80 block mb-2">Mensagem de Boas Vindas</label>
                                <input
                                    value={formData.welcome_message}
                                    onChange={e => setFormData({ ...formData, welcome_message: e.target.value })}
                                    className="w-full bg-black/30 border border-white/10 p-3 rounded-lg text-white"
                                    placeholder="Ex: O melhor corte da região!"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-burgos-accent/80 block mb-2">Imagens de Capa (URLs)</label>
                                <p className="text-xs text-gray-500 mb-2">Separe por vírgula. Elas aparecerão no carrossel.</p>
                                <textarea
                                    value={formData.cover_images}
                                    onChange={e => setFormData({ ...formData, cover_images: e.target.value })}
                                    className="w-full bg-black/30 border border-white/10 p-3 rounded-lg text-white h-24 text-xs font-mono"
                                    placeholder="https://imgur.com/..., https://..."
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-6 bg-green-500 hover:bg-green-600 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                        {isLoading ? 'Salvando...' : <><Save size={20} /> Salvar Identidade</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
