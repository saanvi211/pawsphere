import { supabase, isSupabaseConfigured } from '../supabase';
import { Shelter } from '../../types/animal';
import { MOCK_SHELTERS } from '../../data/mockShelters';

function rowToShelter(row: Record<string, unknown>): Shelter {
  return {
    id: row.id as string,
    name: row.name as string,
    type: row.type as Shelter['type'],
    address: row.address as string,
    city: row.city as string,
    phone: row.phone as string,
    email: row.email as string,
    openingHours: (row.opening_hours as string) || '9AM - 6PM',
    lat: row.lat as number,
    lng: row.lng as number,
    availablePetsCount: (row.available_pets_count as number) || 0,
  };
}

/** Get all shelters/breeders — falls back to mock data offline */
export async function getShelters(): Promise<Shelter[]> {
  if (!isSupabaseConfigured) return MOCK_SHELTERS;

  const { data, error } = await supabase
    .from('shelters')
    .select('*')
    .order('name');

  if (error || !data || data.length === 0) return MOCK_SHELTERS;
  return data.map((row: Record<string, unknown>) => rowToShelter(row));
}

/** Get shelters within approximate distance (simple bounding box) */
export async function getSheltersNearby(
  lat: number,
  lng: number,
  radiusDeg = 0.5 // ~55km
): Promise<Shelter[]> {
  if (!isSupabaseConfigured) return MOCK_SHELTERS;

  const { data, error } = await supabase
    .from('shelters')
    .select('*')
    .gte('lat', lat - radiusDeg)
    .lte('lat', lat + radiusDeg)
    .gte('lng', lng - radiusDeg)
    .lte('lng', lng + radiusDeg);

  if (error || !data || data.length === 0) return MOCK_SHELTERS;
  return data.map((row: Record<string, unknown>) => rowToShelter(row));
}
