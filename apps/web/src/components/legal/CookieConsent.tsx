'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Cookie } from 'lucide-react';

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('burgos-cookie-consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('burgos-cookie-consent', 'accepted');
        setIsVisible(false);
    };

    const handleReject = () => {
        localStorage.setItem('burgos-cookie-consent', 'rejected');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 md:p-6 animate-slide-up">
            <div className="max-w-4xl mx-auto bg-burgos-dark/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-6 md:flex gap-6 items-center justify-between">

                <div className="flex gap-4 items-start mb-4 md:mb-0">
                    <div className="bg-burgos-primary/10 p-3 rounded-full shrink-0">
                        <Cookie className="text-burgos-primary" size={24} />
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-1">Valorizamos sua privacidade</h4>
                        <p className="text-burgos-accent/70 text-sm leading-relaxed">
                            Utilizamos cookies para melhorar sua experiência, analisar o tráfego e personalizar conteúdo.
                            Ao continuar navegando, você concorda com nossa <Link href="/privacidade" className="text-burgos-primary hover:underline">Política de Privacidade</Link>.
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 shrink-0">
                    <button
                        onClick={handleReject}
                        className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        Recusar
                    </button>
                    <button
                        onClick={handleAccept}
                        className="px-6 py-2 text-sm font-bold text-white bg-burgos-primary hover:bg-burgos-primary/90 rounded-lg shadow-lg hover:shadow-burgos-primary/20 transition-all"
                    >
                        Aceitar Todos
                    </button>
                </div>
            </div>
        </div>
    );
}
