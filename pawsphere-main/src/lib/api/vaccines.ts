import { supabase, isSupabaseConfigured } from '../supabase';
import { VaccineRecord } from '../../types/animal';

/** Add a new vaccine record for a pet */
export async function addVaccineRecord(
  animalId: string,
  record: Omit<VaccineRecord, 'id'>
): Promise<{ record: VaccineRecord | null; error: string | null }> {
  if (!isSupabaseConfigured) {
    return {
      record: { ...record, id: 'local-v-' + Date.now() },
      error: null,
    };
  }

  const { data, error } = await supabase
    .from('vaccine_records')
    .insert({
      animal_id: animalId,
      vaccine_name: record.vaccineName,
      date_given: record.dateGiven,
      next_due_date: record.nextDueDate,
      doctor_name: record.doctorName,
      verified_stamp: record.verifiedStamp,
    })
    .select()
    .single();

  if (error || !data) return { record: null, error: error?.message || 'Failed to save vaccine.' };

  const row = data as Record<string, unknown>;
  return {
    record: {
      id: row.id as string,
      vaccineName: row.vaccine_name as string,
      dateGiven: row.date_given as string,
      nextDueDate: row.next_due_date as string,
      doctorName: row.doctor_name as string,
      verifiedStamp: row.verified_stamp as boolean,
    },
    error: null,
  };
}

/** Get all vaccine records for a pet */
export async function getVaccineRecords(animalId: string): Promise<VaccineRecord[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('vaccine_records')
    .select('*')
    .eq('animal_id', animalId)
    .order('date_given', { ascending: false });

  if (error || !data) return [];

  return data.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    vaccineName: row.vaccine_name as string,
    dateGiven: row.date_given as string,
    nextDueDate: row.next_due_date as string,
    doctorName: row.doctor_name as string,
    verifiedStamp: row.verified_stamp as boolean,
  }));
}

/** Mark a vaccine as verified */
export async function verifyVaccineRecord(id: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) return { error: null };

  const { error } = await supabase
    .from('vaccine_records')
    .update({ verified_stamp: true })
    .eq('id', id);

  return { error: error?.message || null };
}

/** Delete a vaccine record */
export async function deleteVaccineRecord(id: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) return { error: null };

  const { error } = await supabase.from('vaccine_records').delete().eq('id', id);
  return { error: error?.message || null };
}
