import { useState } from 'react';

interface PreferenceSelectionProps {
    onComplete: (preferences: any) => void;
    initialPreferences?: {
        drink: string | null;
        music: string | null;
        notes: string;
    };
}

const DRINKS = [
    { id: 'coffee', name: 'Café Premium', image: '/drink-coffee.png' },
    { id: 'beer', name: 'Cerveja Gelada', image: '/drink-beer.png' },
    { id: 'water', name: 'Água com Gás', image: '/drink-water.png' },
    { id: 'whiskey', name: 'Old Fashioned', image: '/drink-whiskey.png' },
    { id: 'coke', name: 'Coca-Cola', image: '/drink-coke.png' },
];

const MUSIC_STYLES = [
    { id: 'sertanejo', name: 'Sertanejo', image: '/music-sertanejo.png', icon: '🤠' },
    { id: 'pagode', name: 'Pagode', image: '/music-pagode.png', icon: '🥁' },
    { id: 'pop', name: 'Pop Hits', image: '/music-pop.png', icon: '🎤' },
    { id: 'rock', name: 'Rock Clássico', image: null, icon: '🎸' }, // Keep logic for no-image if needed, or generate later
    { id: 'lo-fi', name: 'Lo-Fi Chill', image: null, icon: '🎧' },
    { id: 'jazz', name: 'Jazz Lounge', image: null, icon: '🎷' },
];

export function PreferenceSelection({ onComplete, initialPreferences }: PreferenceSelectionProps) {
    const [drink, setDrink] = useState<string | null>(initialPreferences?.drink || null);
    const [music, setMusic] = useState<string | null>(initialPreferences?.music || null);
    const [notes, setNotes] = useState(initialPreferences?.notes || '');

    const handleFinish = () => {
        onComplete({ drink, music, notes });
    };

    return (
        <div className="animate-fade-in space-y-12">

            {/* Intro */}
            <div className="text-center">
                <h2 className="text-3xl font-display font-bold text-white mb-2">Personalize sua Experiência</h2>
                <p className="text-burgos-accent/60">Queremos que seu momento seja perfeito.</p>
            </div>

            {/* Drink Selection */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-burgos-primary border-l-4 border-burgos-primary pl-3">
                    O que vai beber hoje? (Cortesia)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {DRINKS.map((d) => (
                        <button
                            key={d.id}
                            onClick={() => setDrink(d.id)}
                            className={`
                                relative group overflow-hidden rounded-xl aspect-square flex flex-col items-center justify-end p-4 transition-all duration-300 border
                                ${drink === d.id
                                    ? 'border-burgos-primary shadow-[0_0_15px_rgba(255,159,28,0.5)] scale-105'
                                    : 'border-burgos-secondary glass-dark hover:border-burgos-primary/50'
                                }
                            `}
                        >
                            {d.image && (
                                <div className="absolute inset-0 z-0">
                                    <img src={d.image} alt={d.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                                </div>
                            )}

                            <span className="relative z-10 font-bold text-white text-sm md:text-base text-center leading-tight drop-shadow-lg">{d.name}</span>

                            {drink === d.id && (
                                <div className="absolute top-2 right-2 bg-burgos-primary text-burgos-dark rounded-full p-1 z-20">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Music Selection */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-burgos-primary border-l-4 border-burgos-primary pl-3">
                    Vibe Musical
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {MUSIC_STYLES.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => setMusic(m.id)}
                            className={`
                                relative group overflow-hidden rounded-xl h-24 md:h-32 flex items-center justify-center p-4 transition-all duration-300 border
                                ${music === m.id
                                    ? 'border-burgos-primary shadow-[0_0_15px_rgba(255,159,28,0.5)] scale-105'
                                    : 'border-burgos-secondary glass-dark hover:border-burgos-primary/50'
                                }
                            `}
                        >
                            {m.image ? (
                                <div className="absolute inset-0 z-0">
                                    <img src={m.image} alt={m.name} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" />
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                                </div>
                            ) : (
                                <div className="absolute inset-0 z-0 bg-burgos-secondary/20" />
                            )}

                            <div className="relative z-10 flex flex-col items-center gap-1">
                                <span className="text-2xl filter drop-shadow-md">{m.icon}</span>
                                <span className="font-bold text-white text-lg drop-shadow-lg">{m.name}</span>
                            </div>

                            {music === m.id && (
                                <div className="absolute top-2 right-2 bg-green-500 text-black rounded-full p-1 z-20">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notes */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-burgos-primary border-l-4 border-burgos-primary pl-3">
                    Algum pedido especial?
                </h3>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: Prefiro o ar condicionado mais fraco, não gosto de conversa durante o corte..."
                    className="w-full h-32 rounded-xl bg-burgos-dark/50 border border-burgos-secondary p-4 text-burgos-accent focus:border-burgos-primary focus:outline-none transition-colors resize-none glass-dark"
                />
            </div>

            <button
                onClick={handleFinish}
                className="w-full bg-gradient-to-r from-burgos-primary to-burgos-gold-500 text-white font-bold py-4 rounded-xl shadow-[0_0_30px_rgba(255,159,28,0.3)] hover:shadow-[0_0_40px_rgba(255,159,28,0.5)] transition-all duration-300 transform hover:-translate-y-1 uppercase tracking-wider text-xl"
            >
                Finalizar Experiência
            </button>
        </div>
    );
}
