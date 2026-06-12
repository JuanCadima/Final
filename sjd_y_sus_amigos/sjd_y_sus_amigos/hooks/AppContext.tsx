'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export type Booking = {
  id: string;
  walkerName: string;
  service: string;
  date: string;
  time: string;
  price: number;
  status: 'confirmed' | 'pending' | 'rejected';
  userId?: string;
  walkerId?: string;
};

export type Dog = {
  id: string;
  name: string;
  breed: string;
  photoUrl: string;
  userId?: string;
};

export type Profile = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'client' | 'employee';
  avatarUrl?: string;
  createdAt?: string;
};

export type Walker = {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewsCount: number;
  price: number;
  imageUrl: string;
  tags: string[];
  tagline: string;
  aboutParagraphs: string[];
  photos: {
    large: string;
    sm1: string;
    sm2: string;
    tall: string;
  };
  experience: {
    icon: string;
    bg: string;
    color: string;
    title: string;
    desc: string;
  }[];
  reviews: {
    author: string;
    avatar: string;
    stars: number;
    quote: string;
  }[];
  userId?: string;
};

export const MOCK_WALKERS: Walker[] = [
  {
    id: 'sarah-mitchell',
    name: 'Sarah Mitchell',
    location: 'San Francisco, CA',
    rating: 5.0,
    reviewsCount: 148,
    price: 35,
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    tags: ['Más Valorada', 'Primeros Auxilios Certificados'],
    tagline: 'Llevando alegría, ejercicio y una sensación de calma a los miembros peludos de tu familia desde 2018.',
    aboutParagraphs: [
      "¡Hola! Soy Sarah, una entusiasta de los animales de toda la vida y compañera canina profesional. Creo que cada perro merece un paseo que no sea solo ejercicio físico, sino también estimulación mental y conexión emocional.",
      "Comencé Paws&Pause porque noté que muchos dueños de mascotas en la ciudad tenían dificultades para encontrar paseadores que realmente entendieran el comportamiento de los perros y las necesidades de cada raza. Mi enfoque es paciente, amable y siempre centrado en la seguridad y felicidad de tu mascota."
    ],
    photos: {
      large: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=500',
      sm1: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&q=80&w=300',
      sm2: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=300',
      tall: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
    },
    experience: [
      { icon: '✓', bg: '#dff2cc', color: '#5a8a29', title: 'Paseadora de Perros Profesional Certificada', desc: 'Asociación Internacional de Profesionales Caninos (IACP)' },
      { icon: '✚', bg: '#faeab1', color: '#9c750b', title: 'Certificada en Primeros Auxilios y RCP para Mascotas', desc: 'Certificación de la Cruz Roja (Vigente)' },
      { icon: '★', bg: '#fcdfc3', color: '#b05f25', title: 'Más de 5 Años de Experiencia Profesional', desc: 'Más de 2500 paseos exitosos completados en San Francisco.' }
    ],
    reviews: [
      {
        author: "Jessica K. y 'Cooper'",
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100',
        stars: 5,
        quote: "Sarah es absolutamente increíble. Cooper solía tener ansiedad cuando me iba a trabajar, pero desde que Sarah comenzó a pasearlo, es otro perro: tranquilo, feliz y claramente muy querido. ¡Sus fotos diarias son lo mejor de mi día!"
      },
      {
        author: "David M. y 'Luna'",
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100',
        stars: 5,
        quote: "Extremadamente confiable y comunicativa. Tengo un Husky de alta energía que necesita mucha actividad, y Sarah lo maneja a la perfección. ¡Recomiendo encarecidamente La Hora de la Aventura para dueños de razas grandes!"
      }
    ]
  },
  {
    id: 'elena-rodriguez',
    name: 'Elena Rodriguez',
    location: 'Oakland, CA',
    rating: 4.8,
    reviewsCount: 64,
    price: 28,
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400',
    tags: ['Cuidado de Cachorros', 'Trato Delicado'],
    tagline: 'Paciente y experimentada con perros mayores y cachorros que están aprendiendo a pasear.',
    aboutParagraphs: [
      "¡Hola, soy Elena! Tengo una profunda pasión por los cachorros y los perros de edad avanzada que requieren un toque más suave. Entiendo que el mundo puede ser un lugar grande e abrumador para un cachorro o un perro mayor delicado.",
      "Mis paseos se centran en la seguridad, el refuerzo positivo, los aspectos básicos del entrenamiento con correa y la exploración a ritmo lento adaptada al nivel de comodidad física de tu perro."
    ],
    photos: {
      large: 'https://images.unsplash.com/photo-1541599540903-216a46ca1ad0?auto=format&fit=crop&q=80&w=500',
      sm1: 'https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?auto=format&fit=crop&q=80&w=300',
      sm2: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=300',
      tall: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
    },
    experience: [
      { icon: '🍼', bg: '#ffe3e3', color: '#c92a2a', title: 'Experta en Socialización de Cachorros', desc: 'Se enfoca en buenos modales con la correa y en generar confianza al aire libre desde temprana edad.' },
      { icon: '🩺', bg: '#e3fafc', color: '#0b7285', title: 'Capacitada en Cuidado de Mascotas de Edad Avanzada', desc: 'Entrenada en consideraciones de movilidad articular y administración de medicamentos.' },
      { icon: '✓', bg: '#dff2cc', color: '#5a8a29', title: 'Cuidadora de Mascotas Certificada', desc: 'Miembro de Pet Sitters International (PSI).' }
    ],
    reviews: [
      {
        author: "Clara S. y 'Teddy'",
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
        stars: 5,
        quote: "Elena es muy paciente con nuestro Golden Retriever de 3 meses Teddy. ¡Nos ayudó a reforzar su entrenamiento para ir al baño y en su transportadora durante sus paseos, y él la adora!"
      }
    ]
  }
];

export const MOCK_DOGS: Dog[] = [
  {
    id: 'dog-1',
    name: 'Max',
    breed: 'Golden Retriever',
    photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=200',
    userId: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f'
  },
  {
    id: 'dog-2',
    name: 'Bella',
    breed: 'French Bulldog',
    photoUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=200',
    userId: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f'
  }
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'booking-1',
    walkerName: 'Sarah Mitchell',
    service: 'Paseo Estándar de 30 min',
    date: 'Mar 15',
    time: 'Mediodía',
    price: 35,
    status: 'confirmed',
    userId: 'mock-client-id',
    walkerId: 'sarah-mitchell'
  }
];

export const MOCK_PROFILES: Profile[] = [
  {
    id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'Administrador Demo',
    email: 'admin@pawsandpause.com',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100'
  }
];


interface AppContextType {
  walkers: Walker[];
  bookings: Booking[];
  dogs: Dog[];
  isLoading: boolean;
  user: any | null;
  profile: Profile | null;
  profiles: Profile[]; // admin view
  allBookings: Booking[]; // admin view
  allDogs: Dog[]; // admin view
  login: (email: string, password: string) => Promise<{ error: any }>;
  signup: (email: string, password: string, name: string, role: 'client' | 'employee') => Promise<{ error: any; data?: any }>;
  logout: () => Promise<void>;
  addBooking: (booking: Omit<Booking, 'id' | 'status'>) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  addDog: (dog: Omit<Dog, 'id'>) => Promise<void>;
  updateWalkerProfile: (walkerId: string, updates: Partial<Walker>) => Promise<void>;
  updateBookingStatus: (bookingId: string, status: 'confirmed' | 'pending' | 'rejected') => Promise<void>;
  updateUserProfileRole: (userId: string, role: 'admin' | 'client' | 'employee') => Promise<void>;
  addReview: (walkerId: string, stars: number, quote: string) => Promise<void>;
  deleteAccount: () => Promise<{ error: any }>;
  isMockMode: boolean;
  toggleMockMode: (val: boolean) => void;
  mockLogin: (role: 'admin' | 'client' | 'employee') => void;
}


const AppContext = createContext<AppContextType | undefined>(undefined);

function mapDbWalker(dbWalker: any): Walker {
  const photos = dbWalker.photos && Object.keys(dbWalker.photos).length > 0 && dbWalker.photos.large ? dbWalker.photos : {
    large: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=500',
    sm1: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&q=80&w=300',
    sm2: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=300',
    tall: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
  };

  const experience = dbWalker.experience && dbWalker.experience.length > 0 ? dbWalker.experience : [
    { icon: '✓', bg: '#dff2cc', color: '#5a8a29', title: 'Paseador de Perros Profesional Certificado', desc: 'Asociación Internacional de Profesionales Caninos (IACP)' },
    { icon: '✚', bg: '#faeab1', color: '#9c750b', title: 'Certificado en Primeros Auxilios y RCP para Mascotas', desc: 'Certificación de la Cruz Roja (Vigente)' },
    { icon: '★', bg: '#fcdfc3', color: '#b05f25', title: 'Más de 5 Años de Experiencia Profesional', desc: 'Más de 2500 paseos exitosos completados en San Francisco.' }
  ];

  return {
    id: dbWalker.id,
    name: dbWalker.name,
    location: dbWalker.location,
    rating: Number(dbWalker.rating),
    reviewsCount: dbWalker.reviews_count,
    price: Number(dbWalker.price),
    imageUrl: dbWalker.image_url,
    tags: dbWalker.tags || [],
    tagline: dbWalker.tagline,
    aboutParagraphs: dbWalker.about_paragraphs || [],
    photos,
    experience,
    reviews: dbWalker.reviews || [],
    userId: dbWalker.user_id
  };
}

function mapDbDog(dbDog: any): Dog {
  return {
    id: dbDog.id,
    name: dbDog.name,
    breed: dbDog.breed,
    photoUrl: dbDog.photo_url,
    userId: dbDog.user_id
  };
}

function mapDbBooking(dbBooking: any): Booking {
  return {
    id: dbBooking.id,
    walkerName: dbBooking.walker_name,
    service: dbBooking.service,
    date: dbBooking.date,
    time: dbBooking.time,
    price: Number(dbBooking.price),
    status: dbBooking.status as 'confirmed' | 'pending' | 'rejected',
    userId: dbBooking.user_id,
    walkerId: dbBooking.walker_id
  };
}

function mapDbProfile(dbProfile: any): Profile {
  return {
    id: dbProfile.id,
    name: dbProfile.name,
    email: dbProfile.email,
    role: dbProfile.role as 'admin' | 'client' | 'employee',
    avatarUrl: dbProfile.avatar_url,
    createdAt: dbProfile.created_at
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  // Global States
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [walkers, setWalkers] = useState<Walker[]>(MOCK_WALKERS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dogs, setDogs] = useState<Dog[]>([]);
  
  // Admin View States
  const [profiles, setProfiles] = useState<Profile[]>(MOCK_PROFILES);
  const [allBookings, setAllBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [allDogs, setAllDogs] = useState<Dog[]>(MOCK_DOGS);
  
  // App Config States
  const [isLoading, setIsLoading] = useState(true);
  const [isMockMode, setIsMockMode] = useState(false);

  // Initialize Auth & Detect Mock Mode fallback
  useEffect(() => {
    let authListener: any = null;

    const initAuth = async () => {
      try {
        setIsLoading(true);
        
        // Try getting session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }

        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            setUser(session.user);
            await fetchUserProfile(session.user.id);
          } else {
            setUser(null);
            setProfile(null);
          }
        });
        authListener = subscription;

      } catch (err) {
        console.warn('Supabase not connected. Defaulting to Mock Mode.', err);
        setIsMockMode(true);
        // Default mock setup: no logged in user initially
        setUser(null);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      if (authListener) authListener.unsubscribe();
    };
  }, [isMockMode]);

  // Load appropriate data based on auth status, role, and mock mode
  useEffect(() => {
    fetchData();
  }, [user, profile, isMockMode]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching user profile from database:', error);
      }
      
      if (data) {
        setProfile(mapDbProfile(data));
      } else {
        // Fallback: try to reconstruct a profile from auth user metadata
        const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) throw sessionErr;
        const currentUser = session?.user;
        if (currentUser && currentUser.id === userId) {
          const fallbackProfile: Profile = {
            id: currentUser.id,
            name: currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'Usuario',
            email: currentUser.email || '',
            role: (currentUser.user_metadata?.role as 'admin' | 'client' | 'employee') || 'client',
            avatarUrl: currentUser.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100',
            createdAt: currentUser.created_at
          };
          setProfile(fallbackProfile);
          
          // Also try to insert it back into the profiles table to fix it permanently
          try {
            await supabase.from('profiles').insert({
              id: fallbackProfile.id,
              name: fallbackProfile.name,
              email: fallbackProfile.email,
              role: fallbackProfile.role,
              avatar_url: fallbackProfile.avatarUrl
            });
          } catch (insertErr) {
            console.error('Could not auto-create missing profile:', insertErr);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };


  const fetchData = async () => {
    if (isMockMode) {
      setIsLoading(true);
      // Simulate API load
      setTimeout(() => {
        // Load appropriate mock data depending on role
        if (!profile) {
          // Logged out: can only see walkers
          setWalkers(MOCK_WALKERS);
          setBookings([]);
          setDogs([]);
        } else if (profile.role === 'admin') {
          setWalkers(MOCK_WALKERS);
          setProfiles(MOCK_PROFILES);
          setAllBookings(MOCK_BOOKINGS);
          setAllDogs(MOCK_DOGS);
        } else if (profile.role === 'employee') {
          setWalkers(MOCK_WALKERS);
          setBookings(MOCK_BOOKINGS.filter(b => b.walkerId === profile.id || b.walkerName.toLowerCase().includes(profile.name.split(' ')[0].toLowerCase())));
          setDogs(MOCK_DOGS);
          setProfiles(MOCK_PROFILES);
        } else if (profile.role === 'client') {
          setWalkers(MOCK_WALKERS);
          // Filter mock dogs and bookings belonging to this client
          setDogs(MOCK_DOGS.filter(d => d.userId === profile.id));
          setBookings(MOCK_BOOKINGS.filter(b => b.userId === profile.id));
        }
        setIsLoading(false);
      }, 300);
      return;
    }

    try {
      setIsLoading(true);
      
      // 1. Fetch Walkers (Always public)
      const { data: dbWalkers, error: walkersErr } = await supabase
        .from('walkers')
        .select('*')
        .order('name', { ascending: true });

      if (dbWalkers) {
        const filtered = dbWalkers
          .map(mapDbWalker)
          .filter(w => w.name !== 'David Chen' && w.name !== 'David Chen (Demo Walker)' && w.id !== 'david-chen' && w.id !== 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e');
        setWalkers(filtered);
      }

      if (!profile) {
        // Logged out
        setBookings([]);
        setDogs([]);
        setIsLoading(false);
        return;
      }

      // 2. Fetch data depending on user role
      if (profile.role === 'client') {
        // Fetch client's dogs
        const { data: dbDogs } = await supabase
          .from('dogs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });
        
        if (dbDogs) setDogs(dbDogs.map(mapDbDog));

        // Fetch client's bookings
        const { data: dbBookings } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });
        
        if (dbBookings) setBookings(dbBookings.map(mapDbBooking));

      } else if (profile.role === 'employee') {
        // Fetch employee's assigned bookings
        // Walker's ID is their user.id
        const { data: dbBookings } = await supabase
          .from('bookings')
          .select('*')
          .or(`walker_id.eq.${user.id},walker_name.ilike.%${profile.name.split(' ')[0]}%`)
          .order('created_at', { ascending: true });

        if (dbBookings) setBookings(dbBookings.map(mapDbBooking));

        // Fetch all dogs so the walker can match them to client bookings
        const { data: dbDogs } = await supabase
          .from('dogs')
          .select('*')
          .order('created_at', { ascending: true });
        if (dbDogs) setDogs(dbDogs.map(mapDbDog));

        // Fetch profiles so the walker can see client names
        const { data: dbProfiles } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: true });
        if (dbProfiles) setProfiles(dbProfiles.map(mapDbProfile));
        
      } else if (profile.role === 'admin') {
        // Fetch all bookings
        const { data: dbBookings } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (dbBookings) setAllBookings(dbBookings.map(mapDbBooking));

        // Fetch all dogs
        const { data: dbDogs } = await supabase
          .from('dogs')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (dbDogs) setAllDogs(dbDogs.map(mapDbDog));

        // Fetch all profiles
        const { data: dbProfiles } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (dbProfiles) setProfiles(dbProfiles.map(mapDbProfile));
      }

    } catch (err) {
      console.error('Error loading database data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auth Operations
  const login = async (email: string, password: string) => {
    if (isMockMode) {
      // Find matching mock user
      const match = MOCK_PROFILES.find(p => p.email === email);
      if (match) {
        setUser({ id: match.id, email: match.email });
        setProfile(match);
        return { error: null };
      }
      return { error: { message: 'Credenciales inválidas en modo demo. Prueba con: client@pawsandpause.com, walker@pawsandpause.com o admin@pawsandpause.com (contraseña: password123).' } };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        setUser(data.user);
        await fetchUserProfile(data.user.id);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signup = async (email: string, password: string, name: string, role: 'client' | 'employee') => {
    if (isMockMode) {
      const newId = `mock-id-${Date.now()}`;
      const newProf: Profile = {
        id: newId,
        name,
        email,
        role,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100'
      };
      
      MOCK_PROFILES.push(newProf);
      
      if (role === 'employee') {
        const newWalker: Walker = {
          id: newId,
          name,
          location: 'San Francisco, CA',
          rating: 5.0,
          reviewsCount: 0,
          price: 30,
          imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100',
          tags: ['Paseador Nuevo'],
          tagline: 'Llevando felicidad a tus perritos.',
          aboutParagraphs: ['¡Hola! Soy un nuevo paseador en la plataforma.'],
          photos: { large: '', sm1: '', sm2: '', tall: '' },
          experience: [],
          reviews: []
        };
        MOCK_WALKERS.push(newWalker);
      }

      setUser({ id: newId, email });
      setProfile(newProf);
      return { error: null, data: { user: { id: newId } } };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100'
          }
        }
      });
      if (error) throw error;
      return { error: null, data };
    } catch (err: any) {
      return { error: err };
    }
  };

  const logout = async () => {
    if (isMockMode) {
      setUser(null);
      setProfile(null);
      return;
    }
    
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  // Database Operations
  const addBooking = async (booking: Omit<Booking, 'id' | 'status'>) => {
    const defaultWalkerId = walkers.find(w => w.name === booking.walkerName)?.id || '';

    if (isMockMode) {
      const newB: Booking = {
        id: `mock-b-${Date.now()}`,
        walkerName: booking.walkerName,
        service: booking.service,
        date: booking.date,
        time: booking.time,
        price: booking.price,
        status: 'pending',
        userId: profile?.id,
        walkerId: defaultWalkerId
      };
      MOCK_BOOKINGS.push(newB);
      await fetchData();
      return;
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .insert({
          walker_name: booking.walkerName,
          service: booking.service,
          date: booking.date,
          time: booking.time,
          price: booking.price,
          status: 'pending',
          user_id: user?.id,
          walker_id: defaultWalkerId
        });

      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Failed to add booking:', err);
    }
  };

  const cancelBooking = async (id: string) => {
    if (isMockMode) {
      const idx = MOCK_BOOKINGS.findIndex(b => b.id === id);
      if (idx !== -1) {
        MOCK_BOOKINGS.splice(idx, 1);
      }
      await fetchData();
      return;
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Failed to cancel booking:', err);
    }
  };

  const addDog = async (dog: Omit<Dog, 'id'>) => {
    if (isMockMode) {
      const newD: Dog = {
        id: `mock-d-${Date.now()}`,
        name: dog.name,
        breed: dog.breed,
        photoUrl: dog.photoUrl,
        userId: profile?.id
      };
      MOCK_DOGS.push(newD);
      await fetchData();
      return;
    }

    try {
      const { error } = await supabase
        .from('dogs')
        .insert({
          name: dog.name,
          breed: dog.breed,
          photo_url: dog.photoUrl,
          user_id: user?.id
        });

      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Failed to add dog:', err);
    }
  };

  const updateWalkerProfile = async (walkerId: string, updates: Partial<Walker>) => {
    if (isMockMode) {
      const w = MOCK_WALKERS.find(walker => walker.id === walkerId);
      if (w) {
        Object.assign(w, updates);
      }
      await fetchData();
      return;
    }

    try {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.location !== undefined) dbUpdates.location = updates.location;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.tagline !== undefined) dbUpdates.tagline = updates.tagline;
      if (updates.aboutParagraphs !== undefined) dbUpdates.about_paragraphs = updates.aboutParagraphs;
      if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;

      const { error } = await supabase
        .from('walkers')
        .update(dbUpdates)
        .eq('id', walkerId);

      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Failed to update walker profile:', err);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'pending' | 'rejected') => {
    if (isMockMode) {
      const b = MOCK_BOOKINGS.find(booking => booking.id === bookingId);
      if (b) {
        b.status = status;
      }
      await fetchData();
      return;
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Failed to update booking status:', err);
    }
  };

  const updateUserProfileRole = async (userId: string, role: 'admin' | 'client' | 'employee') => {
    if (isMockMode) {
      const p = MOCK_PROFILES.find(profile => profile.id === userId);
      if (p) {
        p.role = role;
      }
      await fetchData();
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (error) throw error;
      
      // If updating our own role, refresh profile
      if (user && user.id === userId) {
        await fetchUserProfile(userId);
      } else {
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to update user role:', err);
    }
  };

  const addReview = async (walkerId: string, stars: number, quote: string) => {
    const walker = walkers.find(w => w.id === walkerId);
    if (!walker) {
      console.error('Walker not found to add review');
      return;
    }

    const newReview = {
      author: profile?.name || 'Cliente',
      avatar: profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100',
      stars: stars,
      quote: quote
    };

    const updatedReviews = [...(walker.reviews || []), newReview];
    const newCount = updatedReviews.length;
    const newRating = Number((updatedReviews.reduce((sum, r) => sum + r.stars, 0) / newCount).toFixed(1));

    if (isMockMode) {
      const mockW = MOCK_WALKERS.find(w => w.id === walkerId);
      if (mockW) {
        mockW.reviews = updatedReviews;
        mockW.reviewsCount = newCount;
        mockW.rating = newRating;
      }
      await fetchData();
      return;
    }

    try {
      const { error } = await supabase
        .from('walkers')
        .update({
          reviews: updatedReviews,
          reviews_count: newCount,
          rating: newRating
        })
        .eq('id', walkerId);

      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Failed to add review:', err);
    }
  };

  const deleteAccount = async (): Promise<{ error: any }> => {
    if (isMockMode) {
      // In mock mode, just log out
      setUser(null);
      setProfile(null);
      setIsMockMode(false);
      return { error: null };
    }

    try {
      if (!user) return { error: new Error('No user logged in') };

      // Delete profile first (cascade will handle auth.users on the DB side if set up)
      await supabase.from('profiles').delete().eq('id', user.id);

      // Delete auth user via Supabase admin function
      const { error } = await supabase.rpc('delete_user');
      if (error) {
        // Fallback: just sign out if RPC not available
        console.warn('delete_user RPC not available, signing out instead:', error);
      }

      await logout();
      return { error: null };
    } catch (err: any) {
      console.error('Failed to delete account:', err);
      return { error: err };
    }
  };
  // Setup mock login helper for testing
  const mockLogin = (role: 'admin' | 'client' | 'employee') => {
    setIsMockMode(true);
    let mockProf: Profile;
    if (role === 'admin') {
      mockProf = {
        id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        name: 'Administrador Demo',
        email: 'admin@pawsandpause.com',
        role: 'admin',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100'
      };
    } else if (role === 'employee') {
      mockProf = {
        id: 'sarah-mitchell',
        name: 'Sarah Mitchell',
        email: 'walker@pawsandpause.com',
        role: 'employee',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100'
      };
    } else {
      mockProf = {
        id: 'mock-client-id',
        name: 'Juan Perez',
        email: 'client@pawsandpause.com',
        role: 'client',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100'
      };
    }
    
    setUser({ id: mockProf.id, email: mockProf.email });
    setProfile(mockProf);
  };

  const toggleMockMode = (val: boolean) => {
    setIsMockMode(val);
    setUser(null);
    setProfile(null);
  };

  return (
    <AppContext.Provider value={{
      walkers,
      bookings,
      dogs,
      isLoading,
      user,
      profile,
      profiles,
      allBookings,
      allDogs,
      login,
      signup,
      logout,
      addBooking,
      cancelBooking,
      addDog,
      updateWalkerProfile,
      updateBookingStatus,
      updateUserProfileRole,
      addReview,
      deleteAccount,
      isMockMode,
      toggleMockMode,
      mockLogin
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
