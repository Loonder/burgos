import { useState } from 'react';

interface BarberSelectProps {
    selectedBarber: string | null;
    onSelect: (id: string) => void;
    barbers: any[];
}

export function BarberSelect({ selectedBarber, onSelect, barbers = [] }: BarberSelectProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-fade-in">
            {barbers.map((barber) => {
                const isSelected = selectedBarber === barber.id;
                return (
                    <div
                        key={barber.id}
                        onClick={() => onSelect(barber.id)}
                        className={`
                            relative overflow-hidden rounded-2xl p-6 cursor-pointer border transition-all duration-300 group
                            ${isSelected
                                ? 'bg-burgos-primary text-white border-burgos-primary shadow-[0_0_20px_rgba(255,159,28,0.4)] scale-105'
                                : 'glass-dark border-burgos-secondary hover:border-burgos-primary/50 text-burgos-accent hover:bg-white/5'
                            }
                        `}
                    >
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className={`
                                w-24 h-24 rounded-full border-4 overflow-hidden
                                ${isSelected ? 'border-white' : 'border-burgos-primary/20 group-hover:border-burgos-primary'}
                            `}>
                                <img
                                    src={barber.avatar_url || barber.avatar || '/barbers/default.png'}
                                    alt={barber.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + barber.name + '&background=C9A962&color=fff';
                                    }}
                                />
                            </div>

                            <div>
                                <h3 className={`text-xl font-bold font-display ${isSelected ? 'text-white' : 'text-burgos-primary'}`}>
                                    {barber.name}
                                </h3>
                                <p className={`text-sm ${isSelected ? 'text-white/80' : 'text-burgos-accent/60'}`}>
                                    {barber.role || 'Barbeiro'}
                                </p>
                            </div>

                            <div className="flex items-center space-x-1 bg-black/20 px-3 py-1 rounded-full">
                                <span className="text-yellow-400">★</span>
                                <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-burgos-accent'}`}>
                                    {barber.rating || '5.0'}
                                </span>
                            </div>
                        </div>

                        {isSelected && (
                            <div className="absolute top-4 right-4 bg-white/20 p-1 rounded-full animate-fade-in">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
