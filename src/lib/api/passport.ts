import { supabase, isSupabaseConfigured } from '../supabase';

export interface PassportScanLog {
  id: string;
  animalId: string;
  scannedBy: string;        // e.g. "Dr. Patel (Veterinarian)"
  scannedAt: string;        // ISO date string
  scanLocation: string;     // e.g. "City Vet Clinic, Bengaluru"
  notes?: string;
}

/** Log a QR code scan event */
export async function logPassportScan(
  animalId: string,
  scannedBy: string,
  scanLocation: string,
  notes?: string
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) return { error: null };

  const { error } = await supabase.from('passport_scans').insert({
    animal_id: animalId,
    scanned_by: scannedBy,
    scan_location: scanLocation,
    notes: notes || null,
    scanned_at: new Date().toISOString(),
  });

  return { error: error?.message || null };
}

/** Get scan history for a pet's passport */
export async function getPassportScanHistory(animalId: string): Promise<PassportScanLog[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('passport_scans')
    .select('*')
    .eq('animal_id', animalId)
    .order('scanned_at', { ascending: false })
    .limit(50);

  if (error || !data) return [];

  return data.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    animalId: row.animal_id as string,
    scannedBy: row.scanned_by as string,
    scannedAt: row.scanned_at as string,
    scanLocation: row.scan_location as string,
    notes: row.notes as string | undefined,
  }));
}

/** Get the public passport data (no auth required — for QR scan) */
export async function getPublicPassportData(animalId: string) {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('animals')
    .select(`
      id, name, species, breed, age_years, gender, weight_kg,
      microchip_id, photo_url, health_score,
      vaccinations:vaccine_records(vaccine_name, date_given, next_due_date, doctor_name, verified_stamp)
    `)
    .eq('id', animalId)
    .single();

  if (error || !data) return null;
  return data;
}
