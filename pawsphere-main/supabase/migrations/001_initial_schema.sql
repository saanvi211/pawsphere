-- ============================================================
-- PawSphere — Initial Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- 1. PROFILES (extends Supabase auth.users)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  phone         TEXT,
  city          TEXT,
  address       TEXT,
  username      TEXT UNIQUE,
  role          TEXT NOT NULL DEFAULT 'pet_owner'
                  CHECK (role IN ('pet_owner', 'looking_to_buy_or_adopt', 'vet', 'shelter_staff')),
  avatar_url    TEXT,
  member_since  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  favorite_pet_ids UUID[] DEFAULT '{}'
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies: users can only see and edit their own profile
CREATE POLICY "Own profile readable" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Own profile writable" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- ────────────────────────────────────────────────────────────
-- 2. SHELTERS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shelters (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                 TEXT NOT NULL,
  type                 TEXT NOT NULL DEFAULT 'Verified Adoption Shelter'
                         CHECK (type IN ('Verified Adoption Shelter', 'Licensed Ethical Breeder')),
  address              TEXT,
  city                 TEXT,
  phone                TEXT,
  email                TEXT,
  opening_hours        TEXT DEFAULT '9AM - 6PM',
  lat                  DOUBLE PRECISION,
  lng                  DOUBLE PRECISION,
  available_pets_count INT DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Shelters are public readable
ALTER TABLE public.shelters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shelters public readable" ON public.shelters
  FOR SELECT USING (true);

-- ────────────────────────────────────────────────────────────
-- 3. ANIMALS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.animals (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id                  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  shelter_id                UUID REFERENCES public.shelters(id),
  name                      TEXT NOT NULL,
  species                   TEXT NOT NULL
                              CHECK (species IN ('dog','cat','bird','fish','reptile','rabbit','hamster','other')),
  breed                     TEXT NOT NULL,
  age_years                 NUMERIC(4,1) NOT NULL DEFAULT 0,
  gender                    TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
  weight_kg                 NUMERIC(6,2) NOT NULL DEFAULT 0,
  microchip_id              TEXT,
  photo_url                 TEXT,
  price_or_adoption_fee     TEXT DEFAULT 'Free Adoption',
  about_pet                 TEXT,
  energy_level              TEXT DEFAULT 'Moderate'
                              CHECK (energy_level IN ('Calm', 'Moderate', 'High Energy')),
  temperament               TEXT[] DEFAULT '{}',
  good_with_kids            BOOLEAN DEFAULT false,
  good_with_other_pets      BOOLEAN DEFAULT false,
  care_level                TEXT DEFAULT 'Moderate'
                              CHECK (care_level IN ('Easy', 'Moderate', 'Special Care')),
  monthly_est_cost          INT DEFAULT 0,
  is_available              BOOLEAN DEFAULT false,
  health_score              INT DEFAULT 100 CHECK (health_score BETWEEN 0 AND 100),
  body_pins                 JSONB DEFAULT '[]',
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;

-- Owners can manage their own animals
CREATE POLICY "Owner animals full access" ON public.animals
  FOR ALL USING (auth.uid() = owner_id);

-- Available animals are publicly readable (marketplace)
CREATE POLICY "Available animals public" ON public.animals
  FOR SELECT USING (is_available = true);

-- Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER animals_updated_at
  BEFORE UPDATE ON public.animals
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ────────────────────────────────────────────────────────────
-- 4. VACCINE RECORDS
-- ────────────────────────────────────────────────────────────
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

-- Access via animal ownership
CREATE POLICY "Vaccine records via animal owner" ON public.vaccine_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.animals
      WHERE animals.id = vaccine_records.animal_id
        AND animals.owner_id = auth.uid()
    )
  );

-- Vaccine records on available animals are publicly readable (passport)
CREATE POLICY "Vaccine records public for available animals" ON public.vaccine_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.animals
      WHERE animals.id = vaccine_records.animal_id
        AND animals.is_available = true
    )
  );

-- ────────────────────────────────────────────────────────────
-- 5. MEDICAL RECORDS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.medical_records (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id    UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  date         DATE NOT NULL,
  title        TEXT NOT NULL,
  doctor_notes TEXT,
  status       TEXT DEFAULT 'Normal' CHECK (status IN ('Normal', 'Follow Up Needed')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Medical records via animal owner" ON public.medical_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.animals
      WHERE animals.id = medical_records.animal_id
        AND animals.owner_id = auth.uid()
    )
  );

-- ────────────────────────────────────────────────────────────
-- 6. MATCHMAKING QUIZ
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.matchmaking_quiz (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_pet_type      TEXT DEFAULT 'any',
  home_type            TEXT,
  daily_time_available TEXT,
  monthly_budget       INT DEFAULT 100,
  experience_level     TEXT,
  activity_level       TEXT,
  has_children         BOOLEAN DEFAULT false,
  has_other_pets       BOOLEAN DEFAULT false,
  patience_level       TEXT,
  noise_tolerance      TEXT,
  desired_trait        TEXT,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.matchmaking_quiz ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own quiz access" ON public.matchmaking_quiz
  FOR ALL USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 7. PASSPORT SCANS (QR Code logs)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.passport_scans (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id     UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  scanned_by    TEXT NOT NULL,       -- e.g. "Dr. Patel (Veterinarian)"
  scan_location TEXT,
  notes         TEXT,
  scanned_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.passport_scans ENABLE ROW LEVEL SECURITY;

-- Owner can view scan history for their pets
CREATE POLICY "Scan history via owner" ON public.passport_scans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.animals
      WHERE animals.id = passport_scans.animal_id
        AND animals.owner_id = auth.uid()
    )
  );

-- Anyone can INSERT a scan (public QR scanning — no login required)
CREATE POLICY "Anyone can log a scan" ON public.passport_scans
  FOR INSERT WITH CHECK (true);

-- ────────────────────────────────────────────────────────────
-- 8. AI TRIAGE SESSIONS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_triage_sessions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES public.profiles(id),
  animal_id     UUID REFERENCES public.animals(id),
  symptom_text  TEXT NOT NULL,
  ai_response   JSONB,
  care_level    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ai_triage_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own triage sessions" ON public.ai_triage_sessions
  FOR ALL USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 9. STORAGE BUCKETS (run separately in Supabase Storage UI
--    or via SQL if using service role key)
-- ────────────────────────────────────────────────────────────
-- Create via Supabase Dashboard → Storage → New Bucket:
--   Bucket name: "pet-photos" (public: true)
--   Bucket name: "avatars"    (public: true)
--
-- Or via SQL (requires service role):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('pet-photos', 'pet-photos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- ────────────────────────────────────────────────────────────
-- SEED: Sample shelters (optional — paste into SQL editor)
-- ────────────────────────────────────────────────────────────
INSERT INTO public.shelters (name, type, address, city, phone, email, opening_hours, lat, lng, available_pets_count)
VALUES
  ('Paws & Claws Shelter', 'Verified Adoption Shelter', '12th Main Road, Indiranagar', 'Bengaluru', '+91 80 2345 6789', 'contact@pawsclaws.in', 'Mon-Sat 9AM-6PM', 12.9716, 77.5946, 42),
  ('Happy Tails Rescue', 'Verified Adoption Shelter', 'Koramangala 5th Block', 'Bengaluru', '+91 80 4567 8901', 'hello@happytails.in', 'Mon-Sun 10AM-7PM', 12.9352, 77.6244, 31),
  ('Golden Breeders', 'Licensed Ethical Breeder', 'HSR Layout Sector 2', 'Bengaluru', '+91 98 7654 3210', 'info@goldenbreeders.in', 'By Appointment', 12.9116, 77.6389, 8),
  ('City Vet & Shelter', 'Verified Adoption Shelter', 'MG Road', 'Bengaluru', '+91 80 2222 3333', 'cityvet@pawsphere.in', 'Mon-Fri 8AM-8PM', 12.9767, 77.5713, 19)
ON CONFLICT DO NOTHING;
