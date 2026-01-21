'use client';

import { ClientSelect } from '@/components/booking/ClientSelect';
import { api, subscriptionAPI } from '@/lib/api';
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
import { ServiceCardSkeleton } from '@/components/skeletons/ServiceCardSkeleton';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';




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
    const [loadingBarbers, setLoadingBarbers] = useState(true);

    // Client Selection (Staff Only)
    const [clients, setClients] = useState<any[]>([]);
    const [selectedClient, setSelectedClient] = useState<string>('');
    const [loadingClients, setLoadingClients] = useState(false);

    // Booking Loading State
    const [loadingBooking, setLoadingBooking] = useState(false);

    // Selection states
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [productsPrice, setProductsPrice] = useState(0);

    // Subscription discounts map: service_id -> { is_free, discount_percentage }
    const [subscriptionDiscounts, setSubscriptionDiscounts] = useState<Map<string, { is_free: boolean, discount_percentage: number }>>(new Map());
    const [hasSubscription, setHasSubscription] = useState(false);

    // Helper to calculate total price of selected services
    const getServicesTotal = () => {
        let total = 0;
        selectedServices.forEach(id => {
            const service = services.find(s => s.id === id);
            if (service) {
                const discount = subscriptionDiscounts.get(id);
                if (discount?.is_free) {
                    // 0
                } else if (discount?.discount_percentage) {
                    total += service.price * (1 - discount.discount_percentage / 100);
                } else {
                    total += service.price;
                }
            }
        });
        return total;
    };

    // State Persistence
    useEffect(() => {
        // Restore state
        const savedState = localStorage.getItem('booking_state');
        if (savedState) {
            const parsed = JSON.parse(savedState);
            // Verify expiry (optional) or just restore
            if (parsed.services) setSelectedServices(parsed.services);
            else if (parsed.service) setSelectedServices([parsed.service]); // Legacy support

            setSelectedBarber(parsed.barber);
            if (parsed.date) setSelectedDate(new Date(parsed.date));
            setSelectedTime(parsed.time);
            setSelectedProducts(parsed.products || []);
            setProductsPrice(parsed.productsPrice || 0);
            setStep(parsed.step); // Restore to the last step

            // Do NOT remove immediatey. Let it persist until success or manual clear.
            // This prevents issues with React Strict Mode (double mount) or page refreshes.
        }
    }, []);

    // Fetch Services
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services`, {
                    credentials: 'include'
                });
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
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/barbers`, {
                    credentials: 'include'
                });
                const data = await res.json();
                setBarbers(data.data || []);
            } catch (error) {
                console.error('Failed to load barbers', error);
            } finally {
                setLoadingBarbers(false);
            }
        };

        fetchServices();
        fetchBarbers();
    }, []);

    // Fetch Subscription Discounts
    useEffect(() => {
        const fetchSubscription = async () => {
            if (!user) {
                setSubscriptionDiscounts(new Map());
                setHasSubscription(false);
                return;
            }
            try {
                const result = await subscriptionAPI.getMySubscription();
                if (result.subscription && result.subscription.plan) {
                    setHasSubscription(true);
                    // Build discount map from plan.discounts
                    const discounts = result.subscription.plan.discounts || [];
                    const discountMap = new Map<string, { is_free: boolean, discount_percentage: number }>();
                    discounts.forEach((d: any) => {
                        discountMap.set(d.service_id, { is_free: d.is_free, discount_percentage: d.discount_percentage || 0 });
                    });
                    setSubscriptionDiscounts(discountMap);
                } else {
                    setSubscriptionDiscounts(new Map());
                    setHasSubscription(false);
                }
            } catch (error) {
                console.error('Error fetching subscription', error);
                setSubscriptionDiscounts(new Map());
                setHasSubscription(false);
            }
        };
        fetchSubscription();
    }, [user]);


    const isStaff = user?.role === 'admin' || user?.role === 'barbeiro';

    // Fetch Clients (Staff Only)
    useEffect(() => {
        if (!isStaff) return;

        const fetchClients = async () => {
            setLoadingClients(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clients`, {
                    credentials: 'include' // Use cookies instead of localStorage
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

    // Helper to get selected services details with discount applied
    const getSelectedServicesDetails = () => {
        return selectedServices.map(id => {
            const service = services.find(s => s.id === id);
            if (!service) return null;

            const discount = subscriptionDiscounts.get(id);
            let finalPrice = service.price;
            let discountLabel = undefined;
            let originalPrice = undefined;

            if (discount?.is_free) {
                finalPrice = 0;
                discountLabel = '100% OFF';
                originalPrice = `R$ ${service.price.toFixed(2).replace('.', ',')}`;
            } else if (discount?.discount_percentage) {
                finalPrice = service.price * (1 - discount.discount_percentage / 100);
                discountLabel = `${discount.discount_percentage}% OFF`;
                originalPrice = `R$ ${service.price.toFixed(2).replace('.', ',')}`;
            }

            return {
                ...service,
                title: service.name,
                duration: `${service.duration_minutes} min`,
                discountLabel,
                originalPrice,
                price: `R$ ${finalPrice.toFixed(2).replace('.', ',')}`
            };
        }).filter((s): s is NonNullable<typeof s> => s !== null);
    };

    // Fetch Slots
    const fetchSlots = async (date: Date) => {
        if (!selectedBarber || selectedServices.length === 0) return;

        setLoadingSlots(true);
        try {
            const dateStr = date.toISOString().split('T')[0];
            const url = `${process.env.NEXT_PUBLIC_API_URL}/api/barbers/${selectedBarber}/available-slots`;

            console.log('Fetching slots for date:', dateStr);
            const { data } = await api.get(url, {
                params: {
                    date: dateStr,
                    serviceIds: selectedServices.join(',')
                },
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            console.log('Slots received:', data.slots);
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
        if (step === 3 && selectedBarber && selectedServices.length > 0) {
            fetchSlots(selectedDate || new Date());
        }
    }, [step, selectedBarber, selectedServices]);

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
                services: selectedServices,
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
        setLoadingBooking(true);
        try {
            const appointmentData = {
                serviceIds: selectedServices,
                barberId: selectedBarber,
                date: selectedDate?.toISOString().split('T')[0],
                time: selectedTime,
                preferences,
                productIds: selectedProducts, // Send products
                // clientId is handled by the backend via token, UNLESS staff override:
                clientId: (isStaff && selectedClient) ? selectedClient : undefined,
            };

            const response = await api.post('/api/appointments', appointmentData);

            // Confetti Effect
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                // Barber Pole Theme: Red, White, Blue + Gold for celebration
                const colors = ['#dc2626', '#ffffff', '#2563eb', '#FFD700'];

                confetti({
                    particleCount: 4,
                    angle: 60,
                    spread: 70,
                    origin: { x: 0 },
                    colors: colors
                });
                confetti({
                    particleCount: 4,
                    angle: 120,
                    spread: 70,
                    origin: { x: 1 },
                    colors: colors
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();

            // Success: Move to Success View
            setStep(7); // Success is now Step 7
            localStorage.removeItem('booking_state'); // Clear any preserved state
            toast.success('Agendamento realizado com sucesso!');
        } catch (error: any) {
            console.error('Error booking:', error);
            // Handle specific error codes
            if (error.response?.status === 409) {
                toast.error('Este horário já foi reservado. Por favor, escolha outro horário.');
                setStep(3); // Go back to time selection
            } else {
                toast.error(error.response?.data?.error || error.message || 'Erro ao realizar agendamento');
            }
        } finally {
            setLoadingBooking(false);
        }
    };


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
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/preferences/${user.id}`, {
                            credentials: 'include'
                        });
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
                                <>
                                    <ServiceCardSkeleton />
                                    <ServiceCardSkeleton />
                                    <ServiceCardSkeleton />
                                    <ServiceCardSkeleton />
                                </>
                            ) : (
                                services.map((service) => {
                                    const discount = subscriptionDiscounts.get(service.id);
                                    const isFree = discount?.is_free || false;
                                    const discountPct = discount?.discount_percentage || 0;
                                    const discountedPrice = isFree ? 0 : service.price * (1 - discountPct / 100);

                                    return (
                                        <ServiceCard
                                            key={service.id}
                                            title={service.name}
                                            price={`R$ ${service.price.toFixed(2).replace('.', ',')}`}
                                            duration={`${service.duration_minutes} min`}
                                            selected={selectedServices.includes(service.id)}
                                            onClick={() => {
                                                if (selectedServices.includes(service.id)) {
                                                    setSelectedServices(prev => prev.filter(id => id !== service.id));
                                                } else {
                                                    setSelectedServices(prev => [...prev, service.id]);
                                                }
                                            }}
                                            image={service.image}
                                            // Discount props
                                            isFree={isFree}
                                            originalPrice={`R$ ${service.price.toFixed(2).replace('.', ',')}`}
                                            discountedPrice={discountPct > 0 ? `R$ ${discountedPrice.toFixed(2).replace('.', ',')}` : undefined}
                                            discountLabel={discountPct > 0 && !isFree ? `${discountPct}% OFF` : undefined}
                                        />
                                    );
                                })
                            )}
                        </div>

                        <div className="mt-12 flex justify-center flex-col items-center gap-4">
                            {selectedServices.length > 0 && (
                                <div className="text-white text-lg">
                                    {selectedServices.length} serviço(s) selecionado(s) • Total: R$ {getServicesTotal().toFixed(2).replace('.', ',')}
                                </div>
                            )}
                            <button
                                onClick={() => selectedServices.length > 0 && setStep(2)}
                                disabled={selectedServices.length === 0}
                                className={`
                                px-12 py-4 rounded-full font-bold text-lg uppercase tracking-wider transition-all duration-300
                                ${selectedServices.length > 0
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
                            isLoading={loadingBarbers}
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
                        // ServiceId is optional or unused logic inside ProductSelection for now
                        // If it uses it to filter, we might need to update it to accept array or Primary Service
                        serviceId={selectedServices[0]}
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
                            services={getSelectedServicesDetails()}
                            barber={getBarberDetails()}
                            date={selectedDate}
                            time={selectedTime}
                            onConfirm={handleConfirm}
                            productsPrice={productsPrice}
                            productsCount={selectedProducts.length}
                            isLoading={loadingBooking}
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
                            serviceName={selectedServices.map(id => services.find(s => s.id === id)?.name).join(', ')}
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
