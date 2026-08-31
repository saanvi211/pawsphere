import { supabase, isSupabaseConfigured } from '../supabase';
import { MedicalRecord } from '../../types/animal';

/** Add a new medical record */
export async function addMedicalRecord(
  animalId: string,
  record: Omit<MedicalRecord, 'id'>
): Promise<{ record: MedicalRecord | null; error: string | null }> {
  if (!isSupabaseConfigured) {
    return {
      record: { ...record, id: 'local-m-' + Date.now() },
      error: null,
    };
  }

  const { data, error } = await supabase
    .from('medical_records')
    .insert({
      animal_id: animalId,
      date: record.date,
      title: record.title,
      doctor_notes: record.doctorNotes,
      status: record.status,
    })
    .select()
    .single();

  if (error || !data) return { record: null, error: error?.message || 'Failed to save record.' };

  const row = data as Record<string, unknown>;
  return {
    record: {
      id: row.id as string,
      date: row.date as string,
      title: row.title as string,
      doctorNotes: row.doctor_notes as string,
      status: row.status as MedicalRecord['status'],
    },
    error: null,
  };
}

/** Get all medical records for a pet */
export async function getMedicalRecords(animalId: string): Promise<MedicalRecord[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('medical_records')
    .select('*')
    .eq('animal_id', animalId)
    .order('date', { ascending: false });

  if (error || !data) return [];

  return data.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    date: row.date as string,
    title: row.title as string,
    doctorNotes: row.doctor_notes as string,
    status: row.status as MedicalRecord['status'],
  }));
}

/** Update the status of a medical record */
export async function updateMedicalRecordStatus(
  id: string,
  status: MedicalRecord['status']
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) return { error: null };

  const { error } = await supabase
    .from('medical_records')
    .update({ status })
    .eq('id', id);

  return { error: error?.message || null };
}
