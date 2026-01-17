export interface Preference {
    drink?: 'water' | 'coffee' | 'beer' | 'whiskey' | 'soda' | null;
    musicStyle?: 'rock' | 'pop' | 'jazz' | 'lo-fi' | 'rap' | 'podcast' | null;
    notes?: string;
}

export interface Appointment {
    id: number;
    serviceId: number;
    barberId: number;
    date: Date;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    preferences?: Preference;
}
