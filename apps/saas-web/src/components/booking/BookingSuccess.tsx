import Link from 'next/link';

interface BookingSuccessProps {
    date: Date;
    time: string;
    barberName?: string;
    serviceName?: string;
}

export function BookingSuccess({ date, time, barberName, serviceName }: BookingSuccessProps) {
    return (
        <div className="animate-scale-in flex flex-col items-center justify-center text-center py-12">

            {/* Success Icon */}
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(34,197,94,0.4)] animate-bounce-subtle">
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            </div>

            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                Agendamento Confirmado!
            </h2>

            <p className="text-xl text-burgos-accent/80 mb-12 max-w-lg">
                Tudo certo, seu horário está reservado. Prepare-se para uma experiência de alto nível.
            </p>

            {/* Ticket Card */}
            <div className="bg-white text-burgos-dark p-8 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden mb-12 border-t-8 border-burgos-primary">
                {/* Dotted Lines */}
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <img src="/logo-dbb.png" alt="Logo" className="w-32" />
                </div>

                <div className="space-y-6 relative z-10">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-burgos-secondary font-bold mb-1">Serviço</p>
                        <p className="text-2xl font-bold">{serviceName}</p>
                    </div>

                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-burgos-secondary font-bold mb-1">Data</p>
                            <p className="text-xl font-bold capitalize">
                                {date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'long' })}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs uppercase tracking-widest text-burgos-secondary font-bold mb-1">Horário</p>
                            <p className="text-xl font-bold">{time}</p>
                        </div>
                    </div>

                    <div className="border-t border-burgos-secondary/20 pt-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-burgos-secondary/10 flex items-center justify-center text-xl">
                            💈
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-widest text-burgos-secondary font-bold">Profissional</p>
                            <p className="font-bold">{barberName}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <Link
                    href="/meus-agendamentos"
                    className="bg-burgos-primary text-white hover:bg-burgos-primary/90 px-8 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105 shadow-lg"
                >
                    Ver Meus Agendamentos
                </Link>
                <Link
                    href="/"
                    className="bg-white/10 text-white hover:bg-white/20 px-8 py-4 rounded-full font-bold text-lg transition-colors border border-white/10"
                >
                    Voltar ao Início
                </Link>
            </div>
        </div>
    );
}
