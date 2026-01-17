
import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Check, Clock } from 'lucide-react';

interface ScheduleItem {
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_active: boolean;
}

const DAYS = [
    { id: 0, label: 'Domingo' },
    { id: 1, label: 'Segunda' },
    { id: 2, label: 'Terça' },
    { id: 3, label: 'Quarta' },
    { id: 4, label: 'Quinta' },
    { id: 5, label: 'Sexta' },
    { id: 6, label: 'Sábado' },
];

// Helper to format HH:MM:SS to HH:MM
const fmtTime = (t: string) => t?.slice(0, 5) || '';

interface ScheduleEditorProps {
    barberId: string;
    barberName: string;
    onClose: () => void;
}

export function ScheduleEditor({ barberId, barberName, onClose }: ScheduleEditorProps) {
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSchedule();
    }, [barberId]);

    const fetchSchedule = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/barbers/${barberId}/schedule`);
            const dbSchedule = res.data.schedule;

            // Merge with all days to ensure 7 days exist in state
            const merged = DAYS.map(day => {
                const existing = dbSchedule.find((s: any) => s.day_of_week === day.id);
                return {
                    day_of_week: day.id,
                    start_time: existing ? fmtTime(existing.start_time) : '09:00',
                    end_time: existing ? fmtTime(existing.end_time) : '18:00',
                    is_active: !!existing
                };
            });
            setSchedule(merged);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        const activeDays = schedule.filter(s => s.is_active);
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/barbers/${barberId}/schedule`, {
                schedule: activeDays
            });
            alert('Horários atualizados com sucesso!');
            onClose();
        } catch (error) {
            alert('Erro ao salvar horários');
        }
    };

    const updateDay = (dayId: number, field: keyof ScheduleItem, value: any) => {
        setSchedule(prev => prev.map(item =>
            item.day_of_week === dayId ? { ...item, [field]: value } : item
        ));
    };

    if (loading) return <div className="p-8 text-white">Carregando horários...</div>;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-burgos-dark border border-burgos-primary/20 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in-up">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10 bg-burgos-primary/5">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Clock className="text-burgos-primary" />
                        Horários de {barberName}
                    </h3>
                    <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
                    {schedule.map((item) => {
                        const dayLabel = DAYS.find(d => d.id === item.day_of_week)?.label;
                        return (
                            <div
                                key={item.day_of_week}
                                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${item.is_active
                                        ? 'bg-white/5 border-white/10'
                                        : 'bg-black/20 border-transparent opacity-60'
                                    }`}
                            >
                                {/* Toggle */}
                                <label className="flex items-center gap-3 cursor-pointer min-w-[120px]">
                                    <input
                                        type="checkbox"
                                        checked={item.is_active}
                                        onChange={(e) => updateDay(item.day_of_week, 'is_active', e.target.checked)}
                                        className="w-5 h-5 rounded border-burgos-primary text-burgos-primary focus:ring-burgos-primary bg-transparent"
                                    />
                                    <span className={`font-bold ${item.is_active ? 'text-white' : 'text-white/40'}`}>
                                        {dayLabel}
                                    </span>
                                </label>

                                {/* Inputs */}
                                <div className="flex-1 flex gap-4 items-center">
                                    <input
                                        type="time"
                                        value={item.start_time}
                                        disabled={!item.is_active}
                                        onChange={(e) => updateDay(item.day_of_week, 'start_time', e.target.value)}
                                        className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-burgos-primary outline-none disabled:opacity-50"
                                    />
                                    <span className="text-white/40">-</span>
                                    <input
                                        type="time"
                                        value={item.end_time}
                                        disabled={!item.is_active}
                                        onChange={(e) => updateDay(item.day_of_week, 'end_time', e.target.value)}
                                        className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-burgos-primary outline-none disabled:opacity-50"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-xl text-white hover:bg-white/5 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 rounded-xl bg-burgos-primary text-burgos-dark font-bold hover:bg-burgos-light transition-colors flex items-center gap-2 shadow-lg hover:shadow-burgos-primary/20"
                    >
                        <Check size={18} />
                        Salvar Alterações
                    </button>
                </div>

            </div>
        </div>
    );
}
