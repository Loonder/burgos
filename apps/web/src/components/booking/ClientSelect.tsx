'use client';

import { useState, useMemo } from 'react';

interface Client {
    id: string;
    name: string;
    phone: string;
}

interface ClientSelectProps {
    clients: Client[];
    selectedClientId: string;
    onSelect: (id: string) => void;
}

export function ClientSelect({ clients, selectedClientId, onSelect }: ClientSelectProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const filteredClients = useMemo(() => {
        if (!searchTerm) return clients;
        const lowerTerm = searchTerm.toLowerCase();
        return clients.filter(client =>
            client.name.toLowerCase().includes(lowerTerm) ||
            (client.phone && client.phone.includes(lowerTerm))
        );
    }, [clients, searchTerm]);

    const selectedClient = clients.find(c => c.id === selectedClientId);

    return (
        <div className="relative w-full md:w-80">
            <div
                className="bg-burgos-dark border border-white/10 rounded-lg px-4 py-2 text-white cursor-pointer flex justify-between items-center"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={!selectedClient ? 'text-white/50' : ''}>
                    {selectedClient ? selectedClient.name : 'Pesquisar Cliente...'}
                </span>
                <span className="text-xs">▼</span>
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-burgos-dark border border-burgos-primary/30 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <input
                        type="text"
                        placeholder="Nome ou Telefone..."
                        className="w-full p-3 bg-white/5 text-white border-b border-white/10 outline-none focus:bg-white/10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {filteredClients.map(client => (
                            <div
                                key={client.id}
                                className={`p-3 hover:bg-burgos-primary/20 cursor-pointer border-b border-white/5 ${client.id === selectedClientId ? 'bg-burgos-primary/10' : ''}`}
                                onClick={() => {
                                    onSelect(client.id);
                                    setIsOpen(false);
                                    setSearchTerm('');
                                }}
                            >
                                <div className="font-bold text-sm">{client.name}</div>
                                {client.phone && <div className="text-xs text-burgos-primary">{client.phone}</div>}
                            </div>
                        ))}
                        {filteredClients.length === 0 && (
                            <div className="p-4 text-center text-white/30 text-sm">
                                Nenhum cliente encontrado.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Backdrop to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
