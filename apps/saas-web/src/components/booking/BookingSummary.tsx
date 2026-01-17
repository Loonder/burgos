interface BookingSummaryProps {
    service: { title: string; price: string; duration: string; image?: string } | undefined;
    barber: { name: string; avatar?: string; avatar_url?: string } | undefined;
    date: Date | null;
    time: string | null;
    onConfirm: () => void;
    discountLabel?: string;
    originalPrice?: string;
    productsPrice?: number;
    productsCount?: number;
}

export function BookingSummary({ service, barber, date, time, onConfirm, discountLabel, originalPrice, productsPrice, productsCount }: BookingSummaryProps) {
    if (!service || !barber || !date || !time) return null;

    return (
        <div className="max-w-xl mx-auto animate-fade-in space-y-8">
            <div className="glass-dark rounded-2xl p-8 border border-burgos-primary/20 relative overflow-hidden">
                {/* Decorative top shimmer */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-burgos-primary to-transparent opacity-50" />

                <h2 className="text-2xl font-display font-bold text-white mb-8 text-center">Confirmar Agendamento</h2>

                <div className="space-y-6">
                    {/* Barber Info */}
                    <div className="flex items-center space-x-4 pb-6 border-b border-white/5">
                        <img src={barber.avatar_url || barber.avatar || '/barbers/default.png'} alt={barber.name} className="w-16 h-16 rounded-full border-2 border-burgos-primary object-cover" />
                        <div>
                            <p className="text-sm text-burgos-accent/60">Profissional</p>
                            <h3 className="text-lg font-bold text-white">{barber.name}</h3>
                        </div>
                    </div>

                    {/* Service Info */}
                    <div className="flex items-center justify-between pb-6 border-b border-white/5">
                        <div className="flex items-center gap-4">
                            {service.image && (
                                <img
                                    src={service.image}
                                    alt={service.title}
                                    className="w-16 h-16 rounded-lg border border-white/10 object-cover"
                                />
                            )}
                            <div>
                                <p className="text-sm text-burgos-accent/60">Serviço</p>
                                <h3 className="text-lg font-bold text-white">{service.title}</h3>
                                <p className="text-sm text-burgos-primary">{service.duration}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-burgos-accent/60">Valor</p>
                            <div className="flex flex-col items-end">
                                {originalPrice && (
                                    <span className="text-sm text-red-400 line-through mr-1">{originalPrice}</span>
                                )}
                                <span className="text-2xl font-bold text-white">{service.price}</span>
                                {discountLabel && (
                                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full mt-1">
                                        {discountLabel}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Date Info */}
                    <div className="flex items-center space-x-4 bg-burgos-secondary/30 p-4 rounded-xl border border-white/5">
                        <div className="p-3 bg-burgos-primary/10 rounded-lg text-burgos-primary">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-burgos-accent/60">Data e Horário</p>
                            <h3 className="text-lg font-bold text-white capitalize">
                                {date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </h3>
                            <p className="text-burgos-primary font-bold">{time}</p>
                        </div>
                    </div>

                    {/* Products Info */}
                    {productsCount && productsCount > 0 && (
                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg border border-white/10 bg-burgos-secondary/20 flex items-center justify-center">
                                    <span className="text-xl">🛍️</span>
                                </div>
                                <div>
                                    <p className="text-sm text-burgos-accent/60">Adicionais</p>
                                    <h3 className="text-md font-bold text-white">{productsCount} Produto{productsCount > 1 ? 's' : ''}</h3>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-burgos-accent/60">Valor</p>
                                <span className="text-lg font-bold text-white">R$ {productsPrice?.toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <button
                onClick={onConfirm}
                className="w-full bg-burgos-primary hover:bg-burgos-primary/90 text-white text-lg font-bold py-4 rounded-xl shadow-[0_0_25px_rgba(255,159,28,0.3)] hover:shadow-[0_0_35px_rgba(255,159,28,0.5)] transition-all duration-300 transform hover:-translate-y-1 uppercase tracking-wider"
            >
                Confirmar Agendamento
            </button>
        </div>
    );
}
