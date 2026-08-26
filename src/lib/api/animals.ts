import { supabase, isSupabaseConfigured } from '../supabase';
import { Animal, SpeciesType, VaccineRecord, MedicalRecord, PetBodyPin } from '../../types/animal';

// ─── Helpers ───────────────────────────────────────────────────────────────

function rowToAnimal(row: Record<string, unknown>): Animal {
  return {
    id: row.id as string,
    name: row.name as string,
    species: row.species as SpeciesType,
    breed: row.breed as string,
    ageYears: row.age_years as number,
    gender: row.gender as 'Male' | 'Female',
    weightKg: row.weight_kg as number,
    microchipId: row.microchip_id as string | undefined,
    photoUrl: (row.photo_url as string) || '',
    priceOrAdoptionFee: (row.price_or_adoption_fee as string) || 'Free Adoption',
    aboutPet: (row.about_pet as string) || '',
    energyLevel: (row.energy_level as Animal['energyLevel']) || 'Moderate',
    temperament: (row.temperament as string[]) || [],
    goodWithKids: (row.good_with_kids as boolean) || false,
    goodWithOtherPets: (row.good_with_other_pets as boolean) || false,
    careLevel: (row.care_level as Animal['careLevel']) || 'Moderate',
    monthlyEstCost: (row.monthly_est_cost as number) || 0,
    shelterId: (row.shelter_id as string) || '',
    isAvailableForAdoptionOrSale: (row.is_available as boolean) || false,
    healthScore: (row.health_score as number) || 100,
    bodyPins: (row.body_pins as PetBodyPin[]) || [],
    vaccinations: (row.vaccinations as VaccineRecord[]) || [],
    medicalHistory: (row.medical_history as MedicalRecord[]) || [],
  };
}

// ─── Animals CRUD ──────────────────────────────────────────────────────────

/** Get all animals for the current authenticated user */
export async function getUserAnimals(userId: string): Promise<Animal[]> {
  if (!isSupabaseConfigured) return [];

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
    console.error('[animals] getUserAnimals:', error.message);
    return [];
  }

  return (data || []).map(rowToAnimal);
}

/** Get all animals available for adoption/sale (public marketplace) */
export async function getMarketplaceAnimals(species?: SpeciesType): Promise<Animal[]> {
  if (!isSupabaseConfigured) return [];

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
    console.error('[animals] getMarketplaceAnimals:', error.message);
    return [];
  }

  return (data || []).map(rowToAnimal);
}

/** Get a single animal by ID */
export async function getAnimalById(id: string): Promise<Animal | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('animals')
    .select(`
      *,
      vaccinations:vaccine_records(*),
      medical_history:medical_records(*)
    `)
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return rowToAnimal(data as Record<string, unknown>);
}

/** Register a new pet for the logged-in user */
export async function createAnimal(
  userId: string,
  animal: Omit<Animal, 'id' | 'vaccinations' | 'medicalHistory' | 'bodyPins'>
): Promise<{ animal: Animal | null; error: string | null }> {
  if (!isSupabaseConfigured) {
    return {
      animal: {
        ...animal,
        id: 'local-' + Date.now(),
        vaccinations: [],
        medicalHistory: [],
        bodyPins: [],
      },
      error: null,
    };
  }

  const { data, error } = await supabase
    .from('animals')
    .insert({
      owner_id: userId,
      name: animal.name,
      species: animal.species,
      breed: animal.breed,
      age_years: animal.ageYears,
      gender: animal.gender,
      weight_kg: animal.weightKg,
      microchip_id: animal.microchipId,
      photo_url: animal.photoUrl,
      price_or_adoption_fee: animal.priceOrAdoptionFee,
      about_pet: animal.aboutPet,
      energy_level: animal.energyLevel,
      temperament: animal.temperament,
      good_with_kids: animal.goodWithKids,
      good_with_other_pets: animal.goodWithOtherPets,
      care_level: animal.careLevel,
      monthly_est_cost: animal.monthlyEstCost,
      shelter_id: animal.shelterId,
      is_available: animal.isAvailableForAdoptionOrSale,
      health_score: animal.healthScore,
      body_pins: [],
    })
    .select()
    .single();

  if (error || !data) return { animal: null, error: error?.message || 'Failed to create pet.' };

  return {
    animal: rowToAnimal({
      ...(data as Record<string, unknown>),
      vaccinations: [],
      medical_history: [],
    }),
    error: null,
  };
}

/** Update an existing animal's profile */
export async function updateAnimal(
  id: string,
  updates: Partial<Animal>
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) return { error: null };

  const { error } = await supabase
    .from('animals')
    .update({
      name: updates.name,
      breed: updates.breed,
      age_years: updates.ageYears,
      weight_kg: updates.weightKg,
      microchip_id: updates.microchipId,
      photo_url: updates.photoUrl,
      about_pet: updates.aboutPet,
      energy_level: updates.energyLevel,
      temperament: updates.temperament,
      good_with_kids: updates.goodWithKids,
      good_with_other_pets: updates.goodWithOtherPets,
      care_level: updates.careLevel,
      monthly_est_cost: updates.monthlyEstCost,
      health_score: updates.healthScore,
      body_pins: updates.bodyPins,
      is_available: updates.isAvailableForAdoptionOrSale,
      price_or_adoption_fee: updates.priceOrAdoptionFee,
    })
    .eq('id', id);

  return { error: error?.message || null };
}

/** Delete a pet record */
export async function deleteAnimal(id: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) return { error: null };

  const { error } = await supabase.from('animals').delete().eq('id', id);
  return { error: error?.message || null };
}
