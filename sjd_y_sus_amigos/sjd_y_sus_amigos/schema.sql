-- ==========================================================
-- UNIFIED DATABASE SCHEMA FOR PAWS&PAUSE
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ==========================================================

-- Enable pgcrypto extension for password hashing if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 1. Tables Creation
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'client', 'employee')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Public profile and metadata for walkers
CREATE TABLE IF NOT EXISTS public.walkers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    rating NUMERIC NOT NULL DEFAULT 0.0,
    reviews_count INTEGER NOT NULL DEFAULT 0,
    price NUMERIC NOT NULL,
    image_url TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    tagline TEXT NOT NULL,
    about_paragraphs TEXT[] NOT NULL DEFAULT '{}',
    photos JSONB NOT NULL DEFAULT '{}',
    experience JSONB NOT NULL DEFAULT '[]',
    reviews JSONB NOT NULL DEFAULT '[]',
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    allowed_sizes TEXT[] NOT NULL DEFAULT '{}', -- Pequeño, Mediano, Grande
    specialties TEXT[] NOT NULL DEFAULT '{}',   -- Cachorros, Adultos Mayores, Medicados, etc.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Registered dogs under clients
CREATE TABLE IF NOT EXISTS public.dogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    breed TEXT NOT NULL,
    photo_url TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    age TEXT NOT NULL DEFAULT '',                -- e.g. "3 años", "6 meses"
    size TEXT NOT NULL DEFAULT 'Mediano',        -- Pequeño, Mediano, Grande
    notes TEXT NOT NULL DEFAULT '',              -- Características y comportamientos
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Scheduled and requested bookings
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    walker_name TEXT NOT NULL,
    service TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    price NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    walker_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Private profiles for contact details and identification
CREATE TABLE IF NOT EXISTS public.private_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    id_number TEXT NOT NULL DEFAULT '',         -- DNI o número de identidad
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.walkers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Drop all policies to prevent conflicts if re-run
DROP POLICY IF EXISTS "Allow authenticated SELECT on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin all access on profiles" ON public.profiles;

DROP POLICY IF EXISTS "Allow public read on walkers" ON public.walkers;
DROP POLICY IF EXISTS "Allow authenticated users to update walkers" ON public.walkers;
DROP POLICY IF EXISTS "Allow authenticated users to insert walkers" ON public.walkers;
DROP POLICY IF EXISTS "Allow admin all access on walkers" ON public.walkers;

DROP POLICY IF EXISTS "Allow users to read own dogs" ON public.dogs;
DROP POLICY IF EXISTS "Allow users to insert own dogs" ON public.dogs;
DROP POLICY IF EXISTS "Allow users to update own dogs" ON public.dogs;
DROP POLICY IF EXISTS "Allow users to delete own dogs" ON public.dogs;

DROP POLICY IF EXISTS "Allow users to read related bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow clients to insert bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow related users to update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow clients or admins to delete bookings" ON public.bookings;

DROP POLICY IF EXISTS "Allow owner and admin to read private profiles" ON public.private_profiles;
DROP POLICY IF EXISTS "Allow owner to insert own private profile" ON public.private_profiles;
DROP POLICY IF EXISTS "Allow owner and admin to update private profiles" ON public.private_profiles;
DROP POLICY IF EXISTS "Allow admin to delete private profiles" ON public.private_profiles;

-- 4. Create RLS Policies

-- Profiles
CREATE POLICY "Allow authenticated SELECT on profiles" ON public.profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow users to update own profile" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow admin all access on profiles" ON public.profiles
    FOR ALL TO authenticated USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Walkers
CREATE POLICY "Allow public read on walkers" ON public.walkers
    FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to update walkers" ON public.walkers
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert walkers" ON public.walkers
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow admin all access on walkers" ON public.walkers
    FOR ALL TO authenticated USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Dogs
CREATE POLICY "Allow users to read own dogs" ON public.dogs
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'employee');

CREATE POLICY "Allow users to insert own dogs" ON public.dogs
    FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow users to update own dogs" ON public.dogs
    FOR UPDATE TO authenticated 
    USING (user_id = auth.uid() OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin') 
    WITH CHECK (user_id = auth.uid() OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow users to delete own dogs" ON public.dogs
    FOR DELETE TO authenticated 
    USING (user_id = auth.uid() OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Bookings
CREATE POLICY "Allow users to read related bookings" ON public.bookings
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR walker_id = auth.uid()::text OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow clients to insert bookings" ON public.bookings
    FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow related users to update bookings" ON public.bookings
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid() OR walker_id = auth.uid()::text OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
    WITH CHECK (user_id = auth.uid() OR walker_id = auth.uid()::text OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow clients or admins to delete bookings" ON public.bookings
    FOR DELETE TO authenticated
    USING (user_id = auth.uid() OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Private Profiles
CREATE POLICY "Allow owner and admin to read private profiles" ON public.private_profiles
    FOR SELECT TO authenticated USING (auth.uid() = id OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow owner to insert own private profile" ON public.private_profiles
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow owner and admin to update private profiles" ON public.private_profiles
    FOR UPDATE TO authenticated 
    USING (auth.uid() = id OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
    WITH CHECK (auth.uid() = id OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Allow admin to delete private profiles" ON public.private_profiles
    FOR DELETE TO authenticated USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');


-- 5. Trigger to automate profile/walker/private creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.profiles
  INSERT INTO public.profiles (id, name, email, role, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'client'),
    COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100&h=100')
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    role = COALESCE(EXCLUDED.role, public.profiles.role),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);

  -- Insert blank row into public.private_profiles
  INSERT INTO public.private_profiles (id, phone, address, id_number)
  VALUES (new.id, '', '', '')
  ON CONFLICT (id) DO NOTHING;

  -- If user is employee/walker, automatically create entry in public.walkers table
  IF COALESCE(new.raw_user_meta_data->>'role', 'client') = 'employee' THEN
    INSERT INTO public.walkers (id, name, location, price, image_url, tagline, about_paragraphs, user_id)
    VALUES (
      new.id::text,
      COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
      'San Francisco, CA',
      30,
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100&h=100',
      'Paseador profesional de Paws&Pause.',
      ARRAY['¡Hola! Estoy muy feliz de poder pasear a tus perritos.'],
      new.id
    ) ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 6. Cleanup obsolete demo profiles, walks, and dogs to leave a clean production environment
DELETE FROM public.bookings WHERE walker_id IN ('sarah-mitchell', 'elena-rodriguez', 'david-chen') OR walker_name IN ('Sarah Mitchell', 'Elena Rodriguez', 'David Chen');
DELETE FROM public.walkers WHERE id IN ('sarah-mitchell', 'elena-rodriguez', 'david-chen');
DELETE FROM public.dogs WHERE name = 'Max' AND breed = 'Golden Retriever';
DELETE FROM auth.users WHERE email IN ('walker@pawsandpause.com', 'client@pawsandpause.com', 'sarah@pawsandpause.com', 'elena@pawsandpause.com');
DELETE FROM public.profiles WHERE email IN ('walker@pawsandpause.com', 'client@pawsandpause.com', 'sarah@pawsandpause.com', 'elena@pawsandpause.com');


-- 7. Seed Single Admin Production Account
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud
)
VALUES (
  'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  '00000000-0000-0000-0000-000000000000',
  'admin@pawsandpause.com',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Administrador", "role": "admin", "avatar_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100"}',
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, name, email, role, avatar_url, created_at)
VALUES (
  'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  'Administrador',
  'admin@pawsandpause.com',
  'admin',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100',
  NOW()
) ON CONFLICT (id) DO UPDATE 
SET role = 'admin', name = 'Administrador', email = 'admin@pawsandpause.com';

INSERT INTO public.private_profiles (id, phone, address, id_number)
VALUES (
  'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  '+1 (555) 0199',
  'Oficinas Centrales Paws&Pause, San Francisco, CA',
  'ADMIN-001'
) ON CONFLICT (id) DO NOTHING;


-- 8. RPC Functions

-- Allows any authenticated user to delete their own auth.users row (self-delete)
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.delete_user() TO authenticated;

-- Admin-callable function to delete any user from auth.users
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS void AS $$
BEGIN
  IF (auth.jwt() -> 'user_metadata' ->> 'role') <> 'admin' THEN
    RAISE EXCEPTION 'Unauthorized: only admin can delete other users';
  END IF;
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;
