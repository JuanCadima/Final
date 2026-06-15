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
  age?: string;
  size?: string;
  notes?: string;
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
  allowedSizes?: string[];
  specialties?: string[];
};

// Clear mock arrays for clean production setup
export const MOCK_WALKERS: Walker[] = [];
export const MOCK_DOGS: Dog[] = [];
export const MOCK_BOOKINGS: Booking[] = [];
export const MOCK_PROFILES: Profile[] = [];

interface AppContextType {
  walkers: Walker[];
  bookings: Booking[];
  dogs: Dog[];
  isLoading: boolean;
  user: any | null;
  profile: Profile | null;
  privateProfile: { phone: string; address: string; id_number: string } | null;
  profiles: Profile[]; // admin view
  allBookings: Booking[]; // admin view
  allDogs: Dog[]; // admin view
  login: (email: string, password: string) => Promise<{ error: any }>;
  signup: (email: string, password: string, name: string, role: 'client' | 'employee') => Promise<{ error: any; data?: any }>;
  logout: () => Promise<void>;
  addBooking: (booking: Omit<Booking, 'id' | 'status'>) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  addDog: (dog: Omit<Dog, 'id'>) => Promise<void>;
  deleteDog: (dogId: string) => Promise<void>;
  updateWalkerProfile: (walkerId: string, updates: Partial<Walker>) => Promise<void>;
  updateBookingStatus: (bookingId: string, status: 'confirmed' | 'pending' | 'rejected') => Promise<void>;
  updateUserProfileRole: (userId: string, role: 'admin' | 'client' | 'employee') => Promise<void>;
  addReview: (walkerId: string, stars: number, quote: string) => Promise<void>;
  deleteAccount: () => Promise<{ error: any }>;
  fetchPrivateProfile: (userId: string) => Promise<any>;
  updatePrivateProfile: (updates: { phone: string; address: string; id_number: string }) => Promise<void>;
  getPrivateProfileForAdmin: (userId: string) => Promise<any>;
  deleteUserAccount: (userId: string) => Promise<void>;
  deleteWalkerProfile: (walkerId: string) => Promise<void>;
  updateProfileAvatar: (avatarUrl: string) => Promise<void>;
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
    { icon: '✚', bg: '#faeab1', color: '#9c750b', title: 'Certificada en Primeros Auxilios y RCP para Mascotas', desc: 'Certificación de la Cruz Roja (Vigente)' },
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
    userId: dbWalker.user_id,
    allowedSizes: dbWalker.allowed_sizes || [],
    specialties: dbWalker.specialties || []
  };
}

function mapDbDog(dbDog: any): Dog {
  return {
    id: dbDog.id,
    name: dbDog.name,
    breed: dbDog.breed,
    photoUrl: dbDog.photo_url,
    userId: dbDog.user_id,
    age: dbDog.age || '',
    size: dbDog.size || 'Mediano',
    notes: dbDog.notes || ''
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
  const [privateProfile, setPrivateProfile] = useState<{ phone: string; address: string; id_number: string } | null>(null);
  const [walkers, setWalkers] = useState<Walker[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dogs, setDogs] = useState<Dog[]>([]);
  
  // Admin View States
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [allDogs, setAllDogs] = useState<Dog[]>([]);
  
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
          await fetchPrivateProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setPrivateProfile(null);
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            setUser(session.user);
            await fetchUserProfile(session.user.id);
            await fetchPrivateProfile(session.user.id);
          } else {
            setUser(null);
            setProfile(null);
            setPrivateProfile(null);
          }
        });
        authListener = subscription;

      } catch (err) {
        console.warn('Supabase not connected. Defaulting to Mock Mode.', err);
        setIsMockMode(true);
        setUser(null);
        setProfile(null);
        setPrivateProfile(null);
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
        const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) throw sessionErr;
        const currentUser = session?.user;
        if (currentUser && currentUser.id === userId) {
          const fallbackProfile: Profile = {
            id: currentUser.id,
            name: currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'Usuario',
            email: currentUser.email || '',
            role: (currentUser.user_metadata?.role as 'admin' | 'client' | 'employee') || 'client',
            avatarUrl: currentUser.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100&h=100',
            createdAt: currentUser.created_at
          };
          setProfile(fallbackProfile);
          
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

  const fetchPrivateProfile = async (userId: string) => {
    if (isMockMode) {
      setPrivateProfile({ phone: '', address: '', id_number: '' });
      return { phone: '', address: '', id_number: '' };
    }
    try {
      const { data, error } = await supabase
        .from('private_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        setPrivateProfile({
          phone: data.phone || '',
          address: data.address || '',
          id_number: data.id_number || ''
        });
        return data;
      } else {
        const { data: newData } = await supabase
          .from('private_profiles')
          .insert({ id: userId, phone: '', address: '', id_number: '' })
          .select()
          .maybeSingle();
        if (newData) {
          setPrivateProfile({
            phone: newData.phone || '',
            address: newData.address || '',
            id_number: newData.id_number || ''
          });
          return newData;
        }
      }
    } catch (err) {
      console.error('Error fetching private profile:', err);
    }
    return null;
  };

  const updatePrivateProfile = async (updates: { phone: string; address: string; id_number: string }) => {
    if (isMockMode) {
      setPrivateProfile(updates);
      return;
    }
    if (!user) return;
    try {
      const { error } = await supabase
        .from('private_profiles')
        .upsert({
          id: user.id,
          phone: updates.phone,
          address: updates.address,
          id_number: updates.id_number,
          updated_at: new Date().toISOString()
        });
      if (error) throw error;
      setPrivateProfile(updates);
    } catch (err) {
      console.error('Error updating private profile:', err);
    }
  };

  const getPrivateProfileForAdmin = async (userId: string) => {
    if (isMockMode) {
      return { phone: '+1 (555) 0123-MOCK', address: 'Calle Mock 456', id_number: '1234567-MC' };
    }
    try {
      const { data, error } = await supabase
        .from('private_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error getting private profile for admin:', err);
      return null;
    }
  };

  const deleteUserAccount = async (userId: string) => {
    if (isMockMode) {
      setProfiles(prev => prev.filter(p => p.id !== userId));
      return;
    }
    try {
      // Remove walker record first if it exists
      await supabase.from('walkers').delete().eq('id', userId);
      // Remove profile (cascades to dogs, bookings, private_profiles via ON DELETE CASCADE)
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;
      // Also remove auth.users row via admin RPC
      await supabase.rpc('admin_delete_user', { target_user_id: userId });
      await fetchData();
    } catch (err) {
      console.error('Error deleting user account:', err);
    }
  };

  const deleteWalkerProfile = async (walkerId: string) => {
    if (isMockMode) {
      setWalkers(prev => prev.filter(w => w.id !== walkerId));
      return;
    }
    try {
      const { error } = await supabase.from('walkers').delete().eq('id', walkerId);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error deleting walker profile:', err);
    }
  };

  const deleteDog = async (dogId: string) => {
    if (isMockMode) {
      setDogs(prev => prev.filter(d => d.id !== dogId));
      setAllDogs(prev => prev.filter(d => d.id !== dogId));
      return;
    }
    try {
      const { error } = await supabase.from('dogs').delete().eq('id', dogId);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error deleting dog:', err);
    }
  };

  const updateProfileAvatar = async (avatarUrl: string) => {
    if (isMockMode) {
      if (profile) {
        setProfile({ ...profile, avatarUrl });
      }
      return;
    }
    if (!user || !profile) return;
    try {
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);
      if (profileErr) throw profileErr;
      
      setProfile(prev => prev ? { ...prev, avatarUrl } : null);
      
      if (profile.role === 'employee') {
        await supabase
          .from('walkers')
          .update({ image_url: avatarUrl })
          .eq('id', user.id);
      }
      
      await fetchData();
    } catch (err) {
      console.error('Error updating avatar:', err);
    }
  };

  const fetchData = async () => {
    if (isMockMode) {
      setIsLoading(true);
      setTimeout(() => {
        if (!profile) {
          setWalkers([]);
          setBookings([]);
          setDogs([]);
        } else if (profile.role === 'admin') {
          setWalkers([]);
          setProfiles([]);
          setAllBookings([]);
          setAllDogs([]);
        } else if (profile.role === 'employee') {
          setWalkers([]);
          setBookings([]);
          setDogs([]);
          setProfiles([]);
        } else if (profile.role === 'client') {
          setWalkers([]);
          setDogs([]);
          setBookings([]);
        }
        setIsLoading(false);
      }, 100);
      return;
    }

    try {
      setIsLoading(true);
      
      // 1. Fetch Walkers
      const { data: dbWalkers } = await supabase
        .from('walkers')
        .select('*')
        .order('name', { ascending: true });

      if (dbWalkers) {
        setWalkers(dbWalkers.map(mapDbWalker));
      }

      if (!profile) {
        setBookings([]);
        setDogs([]);
        setIsLoading(false);
        return;
      }

      // 2. Fetch data depending on user role
      if (profile.role === 'client') {
        const { data: dbDogs } = await supabase
          .from('dogs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });
        
        if (dbDogs) setDogs(dbDogs.map(mapDbDog));

        const { data: dbBookings } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });
        
        if (dbBookings) setBookings(dbBookings.map(mapDbBooking));

      } else if (profile.role === 'employee') {
        const { data: dbBookings } = await supabase
          .from('bookings')
          .select('*')
          .or(`walker_id.eq.${user.id},walker_name.ilike.%${profile.name.split(' ')[0]}%`)
          .order('created_at', { ascending: true });

        if (dbBookings) setBookings(dbBookings.map(mapDbBooking));

        const { data: dbDogs } = await supabase
          .from('dogs')
          .select('*')
          .order('created_at', { ascending: true });
        if (dbDogs) setDogs(dbDogs.map(mapDbDog));

        const { data: dbProfiles } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: true });
        if (dbProfiles) setProfiles(dbProfiles.map(mapDbProfile));
        
      } else if (profile.role === 'admin') {
        const { data: dbBookings } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (dbBookings) setAllBookings(dbBookings.map(mapDbBooking));

        const { data: dbDogs } = await supabase
          .from('dogs')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (dbDogs) setAllDogs(dbDogs.map(mapDbDog));

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
      return { error: { message: 'Supabase está desconectado. No es posible iniciar sesión en producción.' } };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        setUser(data.user);
        await fetchUserProfile(data.user.id);
        await fetchPrivateProfile(data.user.id);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signup = async (email: string, password: string, name: string, role: 'client' | 'employee') => {
    if (isMockMode) {
      return { error: { message: 'Supabase está desconectado. No es posible registrar usuarios en producción.' } };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100&h=100'
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
      setPrivateProfile(null);
      return;
    }
    
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setPrivateProfile(null);
  };

  const addBooking = async (booking: Omit<Booking, 'id' | 'status'>) => {
    const defaultWalkerId = walkers.find(w => w.name === booking.walkerName)?.id || '';

    if (isMockMode) {
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
      return;
    }

    try {
      const { error } = await supabase
        .from('dogs')
        .insert({
          name: dog.name,
          breed: dog.breed,
          photo_url: dog.photoUrl,
          user_id: user?.id,
          age: dog.age || '',
          size: dog.size || 'Mediano',
          notes: dog.notes || ''
        });

      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Failed to add dog:', err);
    }
  };

  const updateWalkerProfile = async (walkerId: string, updates: Partial<Walker>) => {
    if (isMockMode) {
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
      if (updates.allowedSizes !== undefined) dbUpdates.allowed_sizes = updates.allowedSizes;
      if (updates.specialties !== undefined) dbUpdates.specialties = updates.specialties;

      const { error } = await supabase
        .from('walkers')
        .update(dbUpdates)
        .eq('id', walkerId);

      if (error) throw error;
      
      // If we are updating ourselves, update profile name as well
      if (user && user.id === walkerId && updates.name) {
        await supabase
          .from('profiles')
          .update({ name: updates.name })
          .eq('id', user.id);
        if (profile) {
          setProfile({ ...profile, name: updates.name });
        }
      }

      await fetchData();
    } catch (err) {
      console.error('Failed to update walker profile:', err);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'pending' | 'rejected') => {
    if (isMockMode) {
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
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (error) throw error;
      
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
      avatar: profile?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100&h=100',
      stars: stars,
      quote: quote
    };

    const updatedReviews = [...(walker.reviews || []), newReview];
    const newCount = updatedReviews.length;
    const newRating = Number((updatedReviews.reduce((sum, r) => sum + r.stars, 0) / newCount).toFixed(1));

    if (isMockMode) {
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
      setUser(null);
      setProfile(null);
      setIsMockMode(false);
      return { error: null };
    }

    try {
      if (!user) return { error: new Error('No user logged in') };

      await supabase.from('walkers').delete().eq('id', user.id);
      await supabase.from('profiles').delete().eq('id', user.id);

      const { error } = await supabase.rpc('delete_user');
      if (error) {
        console.warn('delete_user RPC failed:', error);
      }

      await logout();
      return { error: null };
    } catch (err: any) {
      console.error('Failed to delete account:', err);
      return { error: err };
    }
  };

  const mockLogin = (role: 'admin' | 'client' | 'employee') => {
    // Deprecated for production clean layout
  };

  const toggleMockMode = (val: boolean) => {
    setIsMockMode(val);
  };

  return (
    <AppContext.Provider value={{
      walkers,
      bookings,
      dogs,
      isLoading,
      user,
      profile,
      privateProfile,
      profiles,
      allBookings,
      allDogs,
      login,
      signup,
      logout,
      addBooking,
      cancelBooking,
      addDog,
      deleteDog,
      updateWalkerProfile,
      updateBookingStatus,
      updateUserProfileRole,
      addReview,
      deleteAccount,
      fetchPrivateProfile,
      updatePrivateProfile,
      getPrivateProfileForAdmin,
      deleteUserAccount,
      deleteWalkerProfile,
      updateProfileAvatar,
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
