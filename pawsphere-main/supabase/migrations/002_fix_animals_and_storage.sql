-- ============================================================
-- PawSphere — Database & Storage Migration
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  city          TEXT,
  address       TEXT,
  username      TEXT,
  role          TEXT NOT NULL DEFAULT 'pet_owner',
  avatar_url    TEXT,
  member_since  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  favorite_pet_ids UUID[] DEFAULT '{}'
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Own profile readable" ON public.profiles;
DROP POLICY IF EXISTS "Own profile writable" ON public.profiles;

CREATE POLICY "Own profile readable" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Own profile writable" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- 3. ANIMALS TABLE
CREATE TABLE IF NOT EXISTS public.animals (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id                  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shelter_id                TEXT,
  name                      TEXT NOT NULL,
  species                   TEXT NOT NULL,
  breed                     TEXT,
  age_years                 NUMERIC(4,1) NOT NULL DEFAULT 0,
  gender                    TEXT NOT NULL DEFAULT 'Male',
  weight_kg                 NUMERIC(6,2) NOT NULL DEFAULT 0,
  microchip_id              TEXT,
  photo_url                 TEXT,
  price_or_adoption_fee     TEXT DEFAULT 'Free Adoption',
  about_pet                 TEXT,
  energy_level              TEXT DEFAULT 'Moderate',
  temperament               TEXT[] DEFAULT '{}',
  good_with_kids            BOOLEAN DEFAULT false,
  good_with_other_pets      BOOLEAN DEFAULT false,
  care_level                TEXT DEFAULT 'Moderate',
  monthly_est_cost          INT DEFAULT 0,
  is_available              BOOLEAN DEFAULT false,
  health_score              INT DEFAULT 100,
  body_pins                 JSONB DEFAULT '[]',
  vaccination_status        TEXT DEFAULT 'Up to date',
  health_status             TEXT DEFAULT 'Healthy',
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Animals owner select" ON public.animals;
DROP POLICY IF EXISTS "Animals owner insert" ON public.animals;
DROP POLICY IF EXISTS "Animals owner update" ON public.animals;
DROP POLICY IF EXISTS "Animals owner delete" ON public.animals;

CREATE POLICY "Animals owner select" ON public.animals
  FOR SELECT USING (auth.uid() = owner_id OR is_available = true);

CREATE POLICY "Animals owner insert" ON public.animals
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Animals owner update" ON public.animals
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Animals owner delete" ON public.animals
  FOR DELETE USING (auth.uid() = owner_id);

-- 4. VACCINE & MEDICAL RECORDS
CREATE TABLE IF NOT EXISTS public.vaccine_records (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id       UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  vaccine_name    TEXT NOT NULL,
  date_given      DATE NOT NULL,
  next_due_date   DATE,
  doctor_name     TEXT,
  verified_stamp  BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.vaccine_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vaccine records via animal owner" ON public.vaccine_records;
CREATE POLICY "Vaccine records via animal owner" ON public.vaccine_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.animals
      WHERE animals.id = vaccine_records.animal_id
        AND animals.owner_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS public.medical_records (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id    UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  date         DATE NOT NULL,
  title        TEXT NOT NULL,
  doctor_notes TEXT,
  status       TEXT DEFAULT 'Normal',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Medical records via animal owner" ON public.medical_records;
CREATE POLICY "Medical records via animal owner" ON public.medical_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.animals
      WHERE animals.id = medical_records.animal_id
        AND animals.owner_id = auth.uid()
    )
  );

-- 5. STORAGE BUCKET ('pet-photos' & 'avatars')
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pet-photos', 'pet-photos', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true) 
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "Pet photos public read" ON storage.objects;
DROP POLICY IF EXISTS "Pet photos auth insert" ON storage.objects;
DROP POLICY IF EXISTS "Pet photos auth update" ON storage.objects;
DROP POLICY IF EXISTS "Pet photos auth delete" ON storage.objects;

CREATE POLICY "Pet photos public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'pet-photos');

CREATE POLICY "Pet photos auth insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'pet-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Pet photos auth update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'pet-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Pet photos auth delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'pet-photos' AND auth.role() = 'authenticated');
