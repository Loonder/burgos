
'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);

    // Placeholder data
    const [settings, setSettings] = useState({
        shopName: 'Barbearia Burgos',
        address: 'Rua das Flores, 123',
        phone: '(11) 99999-9999',
        instagram: '@barbeariaburgos'
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
        alert('Configurações salvas (Simulação)');
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <h1 className="text-2xl font-bold text-white mb-8">Configurações Gerais</h1>

            <div className="glass-dark p-8 rounded-2xl border border-white/5 max-w-2xl">
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white ml-1">Nome da Barbearia</label>
                        <input
                            value={settings.shopName}
                            onChange={e => setSettings({ ...settings, shopName: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-burgos-primary outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white ml-1">Endereço</label>
                        <input
                            value={settings.address}
                            onChange={e => setSettings({ ...settings, address: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-burgos-primary outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white ml-1">Telefone</label>
                            <input
                                value={settings.phone}
                                onChange={e => setSettings({ ...settings, phone: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-burgos-primary outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white ml-1">Instagram</label>
                            <input
                                value={settings.instagram}
                                onChange={e => setSettings({ ...settings, instagram: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-burgos-primary outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-burgos-primary hover:bg-burgos-light text-burgos-dark font-bold rounded-xl transition-all flex items-center gap-2"
                        >
                            <Save size={20} />
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
