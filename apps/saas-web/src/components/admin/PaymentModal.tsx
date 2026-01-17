'use client';

import { useState } from 'react';
import axios from 'axios';
import { X, CreditCard, Banknote, QrCode, CheckCircle, Loader2 } from 'lucide-react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: {
        id: string;
        serviceName: string;
        price: number;
        clientName: string;
    } | null;
    onSuccess: () => void;
}

export const PaymentModal = ({ isOpen, onClose, appointment, onSuccess }: PaymentModalProps) => {
    const [method, setMethod] = useState<'dinheiro' | 'pix' | 'cartao_debito' | 'cartao_credito' | null>(null);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!isOpen || !appointment) return null;

    const handleConfirm = async () => {
        if (!method) return;
        setProcessing(true);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/payments`, {
                appointmentId: appointment.id,
                amount: appointment.price,
                method: method,
                userId: '7253459c-6e60-4447-9097-906d4411135c' // Mock Admin ID from seed or context
            });
            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                onClose();
                setSuccess(false);
                setMethod(null);
            }, 2000);
        } catch (error) {
            alert('Falha no pagamento');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="glass-dark p-8 rounded-2xl w-full max-w-md border border-white/10 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X size={20} />
                </button>

                {success ? (
                    <div className="text-center py-8">
                        <CheckCircle size={64} className="text-green-500 mx-auto mb-4 animate-bounce" />
                        <h2 className="text-2xl font-bold text-white">Pagamento Confirmado!</h2>
                        <p className="text-gray-400 mt-2">O agendamento foi finalizado.</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-white mb-2">Receber Pagamento</h2>
                        <p className="text-burgos-text mb-6">
                            {appointment.clientName} • <span className="text-burgos-primary font-bold">{appointment.serviceName}</span>
                        </p>

                        <div className="text-center mb-8">
                            <span className="text-sm text-gray-400 uppercase tracking-widest">Valor Total</span>
                            <div className="text-4xl font-bold text-white">R$ {Number(appointment.price).toFixed(2)}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-8">
                            <button
                                onClick={() => setMethod('cartao_credito')}
                                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${method === 'cartao_credito' ? 'bg-burgos-primary text-black border-burgos-primary' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'}`}
                            >
                                <CreditCard size={24} />
                                <span className="text-sm font-bold">Crédito</span>
                            </button>
                            <button
                                onClick={() => setMethod('cartao_debito')}
                                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${method === 'cartao_debito' ? 'bg-burgos-primary text-black border-burgos-primary' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'}`}
                            >
                                <CreditCard size={24} />
                                <span className="text-sm font-bold">Débito</span>
                            </button>
                            <button
                                onClick={() => setMethod('pix')}
                                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${method === 'pix' ? 'bg-burgos-primary text-black border-burgos-primary' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'}`}
                            >
                                <QrCode size={24} />
                                <span className="text-sm font-bold">Pix</span>
                            </button>
                            <button
                                onClick={() => setMethod('dinheiro')}
                                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${method === 'dinheiro' ? 'bg-burgos-primary text-black border-burgos-primary' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'}`}
                            >
                                <Banknote size={24} />
                                <span className="text-sm font-bold">Dinheiro</span>
                            </button>
                        </div>

                        <button
                            onClick={handleConfirm}
                            disabled={!method || processing}
                            className="w-full py-4 bg-green-500 hover:bg-green-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="animate-spin" /> Processando...
                                </>
                            ) : (
                                'Confirmar Pagamento'
                            )}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
