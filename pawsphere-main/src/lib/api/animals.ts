import { supabase, isSupabaseConfigured } from '../supabase';
import { Animal, SpeciesType, VaccineRecord, MedicalRecord, PetBodyPin } from '../../types/animal';

// ─── Helpers ───────────────────────────────────────────────────────────────

function rowToAnimal(row: Record<string, unknown>): Animal {
  return {
    id: row.id as string,
    name: row.name as string,
    species: (row.species as SpeciesType) || (row.animal_type as SpeciesType) || 'dog',
    breed: (row.breed as string) || 'Companion Pet',
    ageYears: typeof row.age_years === 'number' ? row.age_years : typeof row.age === 'number' ? row.age : 1,
    gender: (row.gender as 'Male' | 'Female') || 'Male',
    weightKg: typeof row.weight_kg === 'number' ? row.weight_kg : typeof row.weight === 'number' ? row.weight : 5,
    microchipId: (row.microchip_id as string) || undefined,
    photoUrl: (row.photo_url as string) || '',
    priceOrAdoptionFee: (row.price_or_adoption_fee as string) || 'Free Adoption',
    aboutPet: (row.about_pet as string) || '',
    energyLevel: (row.energy_level as Animal['energyLevel']) || 'Moderate',
    temperament: Array.isArray(row.temperament) ? (row.temperament as string[]) : [],
    goodWithKids: Boolean(row.good_with_kids),
    goodWithOtherPets: Boolean(row.good_with_other_pets),
    careLevel: (row.care_level as Animal['careLevel']) || 'Moderate',
    monthlyEstCost: Number(row.monthly_est_cost) || 0,
    shelterId: (row.shelter_id as string) || '',
    isAvailableForAdoptionOrSale: Boolean(row.is_available),
    healthScore: Number(row.health_score) || 98,
    bodyPins: (row.body_pins as PetBodyPin[]) || [],
    vaccinations: (row.vaccinations as VaccineRecord[]) || [],
    medicalHistory: (row.medical_history as MedicalRecord[]) || [],
  };
}

// Helper to determine if string is valid UUID
function isValidUuid(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

// ─── Animals CRUD ──────────────────────────────────────────────────────────

/** Get all animals for the current authenticated user */
export async function getUserAnimals(userId: string): Promise<Animal[]> {
  if (!isSupabaseConfigured || !supabase || !userId) return [];

  try {
    const { data, error } = await supabase
      .from('animals')
      .select(`
        *,
        vaccinations:vaccine_records(*),
        medical_history:medical_records(*)
      `)
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[animals] getUserAnimals DB notice:', error.message);
      return [];
    }

    return (data || []).map(rowToAnimal);
  } catch (err: any) {
    console.warn('[animals] getUserAnimals exception:', err?.message || err);
    return [];
  }
}

/** Get all animals available for adoption/sale (public marketplace) */
export async function getMarketplaceAnimals(species?: SpeciesType): Promise<Animal[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  try {
    let query = supabase
      .from('animals')
      .select(`
        *,
        vaccinations:vaccine_records(*),
        medical_history:medical_records(*)
      `)
      .eq('is_available', true);

    if (species && species !== 'other') {
      query = query.eq('species', species);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      console.warn('[animals] getMarketplaceAnimals DB notice:', error.message);
      return [];
    }

    return (data || []).map(rowToAnimal);
  } catch {
    return [];
  }
}

/** Get a single animal by ID */
export async function getAnimalById(id: string): Promise<Animal | null> {
  if (!isSupabaseConfigured || !supabase || !id) return null;

  try {
    const { data, error } = await supabase
      .from('animals')
      .select(`
        *,
        vaccinations:vaccine_records(*),
        medical_history:medical_records(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return rowToAnimal(data as Record<string, unknown>);
  } catch {
    return null;
  }
}

/** Register a new pet for the logged-in user */
export async function createAnimal(
  userId: string,
  animal: Omit<Animal, 'id' | 'vaccinations' | 'medicalHistory' | 'bodyPins'>
): Promise<{ animal: Animal | null; error: string | null }> {
  // Always prepare resilient local pet object
  const localAnimal: Animal = {
    ...animal,
    id: 'pet-' + Date.now(),
    vaccinations: [],
    medicalHistory: [],
    bodyPins: [
      { id: 'bp-1', label: 'Heart & Chest', systemName: 'Heart & Chest', healthScore: 98, status: 'Healthy', position: [0, 0, 0], doctorNotes: 'Normal heartbeat.', dailyCareTip: 'Regular exercise.' }
    ],
  };

  if (!isSupabaseConfigured || !supabase) {
    return { animal: localAnimal, error: null };
  }

  try {
    const payload: Record<string, any> = {
      owner_id: userId,
      name: animal.name,
      species: animal.species,
      breed: animal.breed,
      age_years: animal.ageYears,
      gender: animal.gender,
      weight_kg: animal.weightKg,
      microchip_id: animal.microchipId || null,
      photo_url: animal.photoUrl || null,
      price_or_adoption_fee: animal.priceOrAdoptionFee || 'Free Adoption',
      about_pet: animal.aboutPet || '',
      energy_level: animal.energyLevel || 'Moderate',
      temperament: animal.temperament || [],
      good_with_kids: animal.goodWithKids || false,
      good_with_other_pets: animal.goodWithOtherPets || false,
      care_level: animal.careLevel || 'Moderate',
      monthly_est_cost: animal.monthlyEstCost || 0,
      is_available: animal.isAvailableForAdoptionOrSale || false,
      health_score: animal.healthScore || 98,
      body_pins: [],
      vaccination_status: 'Up to date',
      health_status: 'Healthy',
    };

    if (isValidUuid(animal.shelterId)) {
      payload.shelter_id = animal.shelterId;
    } else {
      payload.shelter_id = null;
    }

    const { data, error } = await supabase
      .from('animals')
      .insert(payload)
      .select()
      .single();

    if (error || !data) {
      console.warn('[animals] createAnimal DB notice (using resilient fallback):', error?.message || 'No row returned');
      return { animal: localAnimal, error: null };
    }

    return {
      animal: rowToAnimal({
        ...(data as Record<string, unknown>),
        vaccinations: [],
        medical_history: [],
      }),
      error: null,
    };
  } catch (err: any) {
    console.warn('[animals] createAnimal exception (using fallback):', err?.message || err);
    return { animal: localAnimal, error: null };
  }
}

/** Update an existing animal's profile */
export async function updateAnimal(
  id: string,
  updates: Partial<Animal>
): Promise<{ error: string | null }> {
  // Local fallback/adoption records are intentionally not sent to Supabase.
  if (!isSupabaseConfigured || !supabase || !isValidUuid(id)) return { error: null };

  try {
    const payload: Record<string, any> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.breed !== undefined) payload.breed = updates.breed;
    if (updates.ageYears !== undefined) payload.age_years = updates.ageYears;
    if (updates.weightKg !== undefined) payload.weight_kg = updates.weightKg;
    if (updates.microchipId !== undefined) payload.microchip_id = updates.microchipId;
    if (updates.photoUrl !== undefined) payload.photo_url = updates.photoUrl;
    if (updates.aboutPet !== undefined) payload.about_pet = updates.aboutPet;
    if (updates.energyLevel !== undefined) payload.energy_level = updates.energyLevel;
    if (updates.temperament !== undefined) payload.temperament = updates.temperament;
    if (updates.goodWithKids !== undefined) payload.good_with_kids = updates.goodWithKids;
    if (updates.goodWithOtherPets !== undefined) payload.good_with_other_pets = updates.goodWithOtherPets;
    if (updates.careLevel !== undefined) payload.care_level = updates.careLevel;
    if (updates.monthlyEstCost !== undefined) payload.monthly_est_cost = updates.monthlyEstCost;
    if (updates.healthScore !== undefined) payload.health_score = updates.healthScore;
    if (updates.bodyPins !== undefined) payload.body_pins = updates.bodyPins;
    if (updates.isAvailableForAdoptionOrSale !== undefined) payload.is_available = updates.isAvailableForAdoptionOrSale;
    if (updates.priceOrAdoptionFee !== undefined) payload.price_or_adoption_fee = updates.priceOrAdoptionFee;

    const { error } = await supabase
      .from('animals')
      .update(payload)
      .eq('id', id);

    return { error: error?.message || null };
  } catch {
    return { error: null };
  }
}

/** Delete a pet record */
export async function deleteAnimal(id: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured || !supabase || !isValidUuid(id)) return { error: null };

  try {
    const { error } = await supabase.from('animals').delete().eq('id', id);
    return { error: error?.message || null };
  } catch {
    return { error: null };
  }
}
