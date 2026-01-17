// User types
export type UserRole = 'cliente' | 'barbeiro' | 'recepcionista' | 'admin';

export interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    role: UserRole;
    avatar_url?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// Appointment types
export type AppointmentStatus =
    | 'agendado'
    | 'aguardando'
    | 'em_atendimento'
    | 'finalizado'
    | 'cancelado';

export interface Appointment {
    id: string;
    client_id: string;
    barber_id: string;
    service_id: string;
    scheduled_at: string;
    duration_minutes: number;
    status: AppointmentStatus;
    checked_in_at?: string;
    started_at?: string;
    finished_at?: string;
    internal_notes?: string;
    client_notes?: string;
    created_at: string;
    updated_at: string;
}

// Client preferences
export interface ClientPreferences {
    id: string;
    client_id: string;
    favorite_music?: string;
    music_style?: string;
    spotify_track_uri?: string;
    spotify_playlist_uri?: string;
    preferred_drink?: string;
    personal_notes?: string;
    created_at: string;
    updated_at: string;
}

// Service types
export interface Service {
    id: string;
    name: string;
    description?: string;
    duration_minutes: number;
    price: number;
    commission_percentage: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// Payment types
export type PaymentMethod = 'dinheiro' | 'pix' | 'cartao_debito' | 'cartao_credito';
export type PaymentStatus = 'pendente' | 'confirmado' | 'cancelado';

export interface Payment {
    id: string;
    appointment_id: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    confirmed_at?: string;
    confirmed_by?: string;
    gateway_transaction_id?: string;
    created_at: string;
    updated_at: string;
}

// Auth types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: Omit<User, 'password_hash'>;
    access_token: string;
    refresh_token: string;
    expires_in: number;
}

export * from './src/preferences';
