import { useState } from 'react';

interface TimeSlotPickerProps {
    onSelect: (date: Date, time: string) => void;
    onDateChange: (date: Date) => void;
    selectedDate: Date | null;
    selectedTime: string | null;
    availableSlots: string[];
    isLoading: boolean;
}

const DATES = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
});

export function TimeSlotPicker({
    onSelect,
    onDateChange,
    selectedDate,
    selectedTime,
    availableSlots,
    isLoading
}: TimeSlotPickerProps) {
    const [viewDate, setViewDate] = useState<Date>(selectedDate || new Date());

    const isSameDay = (d1: Date, d2: Date) =>
        d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth();

    const handleDateClick = (date: Date) => {
        setViewDate(date);
        onDateChange(date);
    };

    return (
        <div className="animate-fade-in space-y-8">
            {/* Date Scroller */}
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                {DATES.map((date) => {
                    const isSelected = isSameDay(date, viewDate);
                    return (
                        <button
                            key={date.toISOString()}
                            onClick={() => handleDateClick(date)}
                            className={`
                                flex-shrink-0 w-20 h-24 rounded-2xl flex flex-col items-center justify-center space-y-1 transition-all duration-300 border
                                ${isSelected
                                    ? 'bg-burgos-primary text-white border-burgos-primary shadow-[0_0_15px_rgba(255,159,28,0.4)] scale-105'
                                    : 'glass-dark border-burgos-secondary text-burgos-accent hover:border-burgos-primary/50 hover:bg-white/5'
                                }
                            `}
                        >
                            <span className="text-sm font-medium uppercase opacity-80">
                                {date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                            </span>
                            <span className="text-2xl font-bold font-display">
                                {date.getDate()}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Time Grid */}
            <div className="glass-dark rounded-2xl p-6 md:p-8 space-y-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Horários Disponíveis</h3>
                    <span className="text-sm text-burgos-accent/60">
                        {viewDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>

                {isLoading ? (
                    <div className="text-center py-8 text-burgos-accent/60 animate-pulse">
                        Verificando disponibilidade...
                    </div>
                ) : availableSlots.length === 0 ? (
                    <div className="text-center py-8 text-burgos-accent/60">
                        Nenhum horário disponível para esta data.
                    </div>
                ) : (
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {availableSlots.map((time) => {
                            const isSelected = selectedTime === time && selectedDate && isSameDay(viewDate, selectedDate);
                            return (
                                <button
                                    key={time}
                                    onClick={() => onSelect(viewDate, time)}
                                    className={`
                                        py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 border
                                        ${isSelected
                                            ? 'bg-white text-burgos-dark border-white shadow-lg transform scale-105'
                                            : 'bg-burgos-secondary/50 border-burgos-secondary text-burgos-accent hover:border-burgos-primary hover:text-burgos-primary'
                                        }
                                    `}
                                >
                                    {time}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
