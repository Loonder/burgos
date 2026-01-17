'use client';

import { ClientSelect } from '@/components/booking/ClientSelect';
import { subscriptionAPI } from '@/lib/api';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BarberSelect } from '@/components/booking/BarberSelect';
import { TimeSlotPicker } from '@/components/booking/TimeSlotPicker';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { PreferenceSelection } from '@/components/booking/PreferenceSelection';
import { BookingSuccess } from '@/components/booking/BookingSuccess';
import { ServiceCard } from '@/components/booking/ServiceCard';
import { ProductSelection } from '@/components/booking/ProductSelection';





// Mock data for barbers (since we don't have a barbers API yet, or we use the seed ones)
// We should eventually fetch this too.
// Barbers will be fetched from API
interface Barber {
    id: string;
    name: string;
    avatar?: string;
}

interface Service {
    id: string;
    name: string;
    description?: string;
    price: number;
    duration_minutes: number;
    image?: string;
}

export default function BookingPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [step, setStep] = useState(1);

    // Data states
    const [services, setServices] = useState<Service[]>([]);
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [loadingServices, setLoadingServices] = useState(true);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // Client Selection (Staff Only)
    const [clients, setClients] = useState<any[]>([]);
    const [selectedClient, setSelectedClient] = useState<string>('');
    const [loadingClients, setLoadingClients] = useState(false);

    // Selection states
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [productsPrice, setProductsPrice] = useState(0);

    // Subscription Discount State
    const [discountInfo, setDiscountInfo] = useState<{ finalPrice: number, isDiscounted: boolean }>({ finalPrice: 0, isDiscounted: false });

    useEffect(() => {
        const checkDiscount = async () => {
            if (!selectedService || !user) return;
            const service = services.find(s => s.id === selectedService);
            if (!service) return;

            try {
                const result = await subscriptionAPI.checkPrice(selectedService, service.price);
                if (result.isDiscounted) {
                    setDiscountInfo(result);
                    // Use Sonner toast or similar for feedback?
                } else {
                    setDiscountInfo({ finalPrice: service.price, isDiscounted: false });
                }
            } catch (error) {
                console.error('Error checking price', error);
            }
        };
        checkDiscount();
    }, [selectedService, services, user]);

    // State Persistence
    useEffect(() => {
        // Restore state
        const savedState = localStorage.getItem('booking_state');
        if (savedState) {
            const parsed = JSON.parse(savedState);
            // Verify expiry (optional) or just restore
            setSelectedService(parsed.service);
            setSelectedBarber(parsed.barber);
            if (parsed.date) setSelectedDate(new Date(parsed.date));
            setSelectedTime(parsed.time);
            setSelectedProducts(parsed.products || []);
            setProductsPrice(parsed.productsPrice || 0);
            setStep(parsed.step); // Restore to the last step

            // Clean up
            localStorage.removeItem('booking_state');
        }
    }, []);

    // Fetch Services
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services`);
                const data = await res.json();
                setServices(data.data);
            } catch (error) {
                console.error('Failed to load services', error);
            } finally {
                setLoadingServices(false);
            }
        };

        const fetchBarbers = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/barbers`);
                const data = await res.json();
                setBarbers(data.data || []);
            } catch (error) {
                console.error('Failed to load barbers', error);
            }
        };

        fetchServices();
        fetchBarbers();
    }, []);


    const isStaff = user?.role === 'admin' || user?.role === 'barbeiro';

    // Fetch Clients (Staff Only)
    useEffect(() => {
        if (!isStaff) return;

        const fetchClients = async () => {
            setLoadingClients(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clients`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
                });
                const data = await res.json();
                setClients(data.data || []);
            } catch (error) {
                console.error('Error fetching clients', error);
            } finally {
                setLoadingClients(false);
            }
        };
        fetchClients();
    }, [isStaff]);

    // Fetch Slots
    const fetchSlots = async (date: Date) => {
        if (!selectedBarber || !selectedService) return;

        setLoadingSlots(true);
        try {
            const dateStr = date.toISOString().split('T')[0];
            const url = `${process.env.NEXT_PUBLIC_API_URL}/api/barbers/${selectedBarber}/available-slots?date=${dateStr}&serviceId=${selectedService}`;

            const res = await fetch(url);
            const data = await res.json();
            setAvailableSlots(data.slots || []);
        } catch (error) {
            console.error('Error fetching slots:', error);
            setAvailableSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    // Initial slot fetch when entering step 3
    useEffect(() => {
        if (step === 3 && selectedBarber && selectedService) {
            fetchSlots(selectedDate || new Date());
        }
    }, [step, selectedBarber, selectedService]);

    const handleBack = () => {
        setStep((prev) => Math.max(1, prev - 1));
    };

    const handleTimeSelect = (date: Date, time: string) => {
        setSelectedDate(date);
        setSelectedTime(time);
    };



    const handleConfirm = async () => {
        if (!user) {
            // Save state to safely restore after login
            const stateToSave = {
                step: 5, // Return to summary/confirm step (New Step 5)
                service: selectedService,
                barber: selectedBarber,
                date: selectedDate,
                time: selectedTime,
                products: selectedProducts,
                productsPrice: productsPrice
            };
            localStorage.setItem('booking_state', JSON.stringify(stateToSave));

            const returnUrl = encodeURIComponent('/agendamento');
            router.push(`/auth/login?redirect=${returnUrl}`);
            return;
        }
        setStep(6); // Go to Preferences (New Step 6)
    };

    const handleFinalize = async (preferences: any) => {
        try {
            const appointmentData = {
                serviceId: selectedService,
                barberId: selectedBarber,
                date: selectedDate?.toISOString().split('T')[0],
                time: selectedTime,
                preferences,
                productIds: selectedProducts, // Send products
                // clientId is handled by the backend via token, UNLESS staff override:
                clientId: (isStaff && selectedClient) ? selectedClient : undefined,
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.id ? localStorage.getItem('access_token') : ''}`
                },
                body: JSON.stringify(appointmentData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Falha ao criar agendamento');
            }

            // Success: Move to Success View
            setStep(7); // Success is now Step 7
            localStorage.removeItem('booking_state'); // Clear any preserved state
        } catch (error: any) {
            console.error('Error booking:', error);
            alert(`Erro ao realizar agendamento: ${error.message}`);
        }
    };

    const getServiceDetails = () => services.find(s => s.id === selectedService);
    const getBarberDetails = () => barbers.find(b => b.id === selectedBarber);

    const TOTAL_STEPS = 7; // Increased by 1

    // Preferences State
    const [initialPreferences, setInitialPreferences] = useState<any>(undefined);

    // Fetch Preferences when entering step 6 (was 5)
    useEffect(() => {
        if (step === 6) {
            const fetchPreferences = async () => {
                try {
                    // Start of Selection
                    if (user?.id) {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/preferences/${user.id}`);
                        const data = await res.json();
                        if (data.preferences) {
                            setInitialPreferences(data.preferences);
                        }
                    }
                    // End of Selection
                } catch (error) {
                    console.error('Error fetching preferences:', error);
                }
            };
            fetchPreferences();
        }
    }, [step]);

    return (
        <main className="min-h-screen bg-burgos-dark text-burgos-accent font-sans pb-20">
            {/* ... header ... */}
            <div className="bg-burgos-dark/90 backdrop-blur-md sticky top-0 z-50 border-b border-light-navy-100/10">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                    <a href="/" className="flex items-center gap-2">
                        <img src="/logo-dbb.png" alt="Burgos Barber" className="h-12 w-auto" />
                    </a>
                    <div className="flex items-center gap-4">
                        {step > 1 && (
                            <button
                                onClick={handleBack}
                                className="text-sm text-burgos-accent/60 hover:text-burgos-primary transition-colors"
                            >
                                ← Voltar
                            </button>
                        )}
                        <div className="text-sm font-semibold text-burgos-accent/60">
                            Passo {step} de {TOTAL_STEPS}
                        </div>
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="h-1 bg-burgos-secondary">
                    <div
                        className="h-full bg-burgos-primary transition-all duration-500 ease-out shadow-[0_0_10px_#FF9F1C]"
                        style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                    />
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">

                {/* Staff: Select Client Overlay or Top Bar */}
                {isStaff && (
                    <div className="mb-8 p-4 bg-burgos-secondary/20 border border-burgos-primary/30 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">👨‍💼</span>
                            <div>
                                <h3 className="text-white font-bold">Modo Staff</h3>
                                <p className="text-sm text-burgos-accent/70">Agendando para: <span className="text-burgos-primary font-bold">{clients.find(c => c.id === selectedClient)?.name || 'Nenhum selecionado'}</span></p>
                            </div>
                        </div>
                        <ClientSelect
                            clients={clients}
                            selectedClientId={selectedClient}
                            onSelect={setSelectedClient}
                        />
                    </div>
                )}

                {/* Step 1: Select Service */}
                {step === 1 && (
                    <div className="animate-fade-in max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 text-center">
                            Qual serviço você deseja?
                        </h1>
                        <p className="text-burgos-accent/60 text-center mb-12 text-lg">
                            Escolha o cuidado que você merece hoje.
                        </p>

                        <div className="grid md:grid-cols-2 gap-6">
                            {loadingServices ? (
                                <div className="col-span-2 text-center py-8 text-burgos-accent">Carregando serviços...</div>
                            ) : (
                                services.map((service) => (
                                    <ServiceCard
                                        key={service.id}
                                        title={service.name}
                                        price={`R$ ${service.price.toFixed(2).replace('.', ',')}`}
                                        duration={`${service.duration_minutes} min`}
                                        selected={selectedService === service.id}
                                        onClick={() => setSelectedService(service.id)}
                                        image={service.image}
                                    />
                                ))
                            )}
                        </div>

                        <div className="mt-12 flex justify-center">
                            <button
                                onClick={() => selectedService && setStep(2)}
                                disabled={!selectedService}
                                className={`
                                px-12 py-4 rounded-full font-bold text-lg uppercase tracking-wider transition-all duration-300
                                ${selectedService
                                        ? 'bg-burgos-primary text-white hover:shadow-[0_0_20px_rgba(255,159,28,0.4)] hover:-translate-y-1'
                                        : 'bg-burgos-secondary text-white/20 cursor-not-allowed'
                                    }
                            `}
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Select Barber */}
                {step === 2 && (
                    <div className="animate-fade-in max-w-5xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 text-center">
                            Escolha seu profissional
                        </h1>
                        <p className="text-burgos-accent/60 text-center mb-12 text-lg">
                            Nossa equipe de especialistas está pronta para te atender.
                        </p>

                        <BarberSelect
                            selectedBarber={selectedBarber}
                            onSelect={setSelectedBarber}
                            barbers={barbers}
                        />

                        <div className="mt-12 flex justify-center">
                            <button
                                onClick={() => selectedBarber && setStep(3)}
                                disabled={!selectedBarber}
                                className={`
                                px-12 py-4 rounded-full font-bold text-lg uppercase tracking-wider transition-all duration-300
                                ${selectedBarber
                                        ? 'bg-burgos-primary text-white hover:shadow-[0_0_20px_rgba(255,159,28,0.4)] hover:-translate-y-1'
                                        : 'bg-burgos-secondary text-white/20 cursor-not-allowed'
                                    }
                            `}
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Date & Time */}
                {step === 3 && (
                    <div className="animate-fade-in max-w-5xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 text-center">
                            Melhor dia e horário
                        </h1>
                        <p className="text-burgos-accent/60 text-center mb-12 text-lg">
                            Selecione a data para ver os horários disponíveis.
                        </p>

                        <TimeSlotPicker
                            selectedDate={selectedDate}
                            selectedTime={selectedTime}
                            onSelect={handleTimeSelect}
                            onDateChange={fetchSlots}
                            availableSlots={availableSlots}
                            isLoading={loadingSlots}
                        />

                        <div className="mt-12 flex justify-center">
                            <button
                                onClick={() => selectedDate && selectedTime && setStep(4)} // Go to Products
                                disabled={!selectedDate || !selectedTime}
                                className={`
                                px-12 py-4 rounded-full font-bold text-lg uppercase tracking-wider transition-all duration-300
                                ${selectedDate && selectedTime
                                        ? 'bg-burgos-primary text-white hover:shadow-[0_0_20px_rgba(255,159,28,0.4)] hover:-translate-y-1'
                                        : 'bg-burgos-secondary text-white/20 cursor-not-allowed'
                                    }
                            `}
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Product Selection */}
                {step === 4 && (
                    <ProductSelection
                        serviceId={selectedService}
                        selectedProducts={selectedProducts}
                        onToggleProduct={(id, price) => {
                            if (selectedProducts.includes(id)) {
                                setSelectedProducts(prev => prev.filter(p => p !== id));
                                setProductsPrice(prev => prev - price);
                            } else {
                                setSelectedProducts(prev => [...prev, id]);
                                setProductsPrice(prev => prev + price);
                            }
                        }}
                        onContinue={() => setStep(5)}
                        onSkip={() => {
                            setSelectedProducts([]);
                            setProductsPrice(0);
                            setStep(5);
                        }}
                    />
                )}

                {/* Step 5: Summary */}
                {step === 5 && (
                    <div className="animate-fade-in max-w-4xl mx-auto">
                        <BookingSummary
                            service={getServiceDetails() ? {
                                title: getServiceDetails()!.name,
                                // Logic: If discounted, show weird format or pass raw values?
                                // BookingSummary expects a string price. Let's format it.
                                price: discountInfo.isDiscounted
                                    ? `R$ ${discountInfo.finalPrice.toFixed(2).replace('.', ',')}`
                                    : `R$ ${getServiceDetails()!.price.toFixed(2).replace('.', ',')}`,
                                duration: `${getServiceDetails()!.duration_minutes} min`,
                                image: getServiceDetails()!.image
                            } : undefined}
                            barber={getBarberDetails()}
                            date={selectedDate}
                            time={selectedTime}
                            onConfirm={handleConfirm}
                            // Pass discount metadata can be helpful if we update BookingSummary component
                            discountLabel={discountInfo.isDiscounted ? (discountInfo.finalPrice === 0 ? 'Assinatura VIP (Grátis)' : `Desconto Assinante`) : undefined}
                            originalPrice={discountInfo.isDiscounted ? `R$ ${getServiceDetails()!.price.toFixed(2)}` : undefined}
                            // Add product info to summary if we updated BookingSummary props (we didn't yet, but let's pass it anyway or update it next)
                            productsPrice={productsPrice}
                            productsCount={selectedProducts.length}
                        />
                    </div>
                )}

                {/* Step 6: Preferences */}
                {step === 6 && (
                    <div className="animate-fade-in max-w-5xl mx-auto">
                        <PreferenceSelection
                            onComplete={handleFinalize}
                            initialPreferences={initialPreferences}
                        />
                    </div>
                )}

                {/* Step 7: Success */}
                {step === 7 && selectedDate && selectedTime && (
                    <div className="animate-fade-in max-w-4xl mx-auto">
                        <BookingSuccess
                            date={selectedDate}
                            time={selectedTime}
                            barberName={getBarberDetails()?.name}
                            serviceName={getServiceDetails()?.name}
                        />
                    </div>
                )}
            </div>

            {/* Location Footer (Hide on Success) */}
            {step !== 7 && (
                <div className="border-t border-white/10 mt-12 bg-burgos-secondary/30 backdrop-blur-sm">
                    <div className="container mx-auto px-4 py-8 text-center">
                        <h3 className="text-xl font-display font-bold text-white mb-2">Unidade Parque Assunção</h3>
                        <p className="text-burgos-accent/80 flex items-center justify-center gap-2">
                            <svg className="w-5 h-5 text-burgos-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Praça Miguel Ortega, 366
                        </p>
                    </div>
                </div>
            )}
        </main>
    );
}
