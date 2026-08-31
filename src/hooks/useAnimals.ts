import { useState, useEffect, useCallback } from 'react';
import { Animal } from '../types/animal';
import { isSupabaseConfigured } from '../lib/supabase';
import { getUserAnimals, createAnimal, updateAnimal, deleteAnimal } from '../lib/api/animals';
import { getStorageAnimals, saveStorageAnimals, getActivePetId, setActivePetId } from '../db/storage';

interface UseAnimalsReturn {
  animals: Animal[];
  activePet: Animal | undefined;
  activePetId: string;
  isLoading: boolean;
  setActivePetId: (id: string) => void;
  addAnimal: (animal: Omit<Animal, 'id' | 'vaccinations' | 'medicalHistory' | 'bodyPins'>, userId: string) => Promise<Animal | null>;
  updateLocalAnimal: (animal: Animal) => Promise<void>;
  removeAnimal: (id: string) => Promise<void>;
  refreshAnimals: (userId: string) => Promise<void>;
}

/**
 * Central animals hook.
 * - With Supabase: fetches from DB, keeps localStorage in sync.
 * - Without Supabase: uses localStorage only (offline mode).
 */
export function useAnimals(userId: string | null): UseAnimalsReturn {
  const [animals, setAnimals] = useState<Animal[]>(() => getStorageAnimals());
  const [activePetIdState, setActivePetIdState] = useState<string>(() => getActivePetId());
  const [isLoading, setIsLoading] = useState(false);

  // Sync to localStorage whenever animals change
  useEffect(() => {
    saveStorageAnimals(animals);
  }, [animals]);

  // Fetch from Supabase when userId becomes available
  useEffect(() => {
    if (!userId || !isSupabaseConfigured) return;
    refreshAnimals(userId);
  }, [userId]);

  const refreshAnimals = useCallback(async (uid: string) => {
    setIsLoading(true);
    const fetched = await getUserAnimals(uid);
    if (fetched.length > 0) {
      setAnimals(fetched);
    }
    setIsLoading(false);
  }, []);

  const handleSetActivePetId = useCallback((id: string) => {
    setActivePetIdState(id);
    setActivePetId(id);
  }, []);

  const addAnimal = useCallback(async (
    animalData: Omit<Animal, 'id' | 'vaccinations' | 'medicalHistory' | 'bodyPins'>,
    uid: string
  ): Promise<Animal | null> => {
    if (!isSupabaseConfigured) {
      // Offline: generate local ID
      const newAnimal: Animal = {
        ...animalData,
        id: 'local-pet-' + Date.now(),
        vaccinations: [],
        medicalHistory: [],
        bodyPins: [],
      };
      setAnimals(prev => [newAnimal, ...prev]);
      return newAnimal;
    }

    const { animal, error } = await createAnimal(uid, animalData);
    if (error || !animal) {
      console.error('[useAnimals] addAnimal error:', error);
      return null;
    }
    setAnimals(prev => [animal, ...prev]);
    return animal;
  }, []);

  const updateLocalAnimal = useCallback(async (updated: Animal) => {
    setAnimals(prev => prev.map(a => a.id === updated.id ? updated : a));
    if (isSupabaseConfigured) {
      const { error } = await updateAnimal(updated.id, updated);
      if (error) console.error('[useAnimals] updateAnimal error:', error);
    }
  }, []);

  const removeAnimal = useCallback(async (id: string) => {
    setAnimals(prev => prev.filter(a => a.id !== id));
    if (isSupabaseConfigured) {
      const { error } = await deleteAnimal(id);
      if (error) console.error('[useAnimals] deleteAnimal error:', error);
    }
  }, []);

  const activePet = animals.find(a => a.id === activePetIdState) || animals[0];

  return {
    animals,
    activePet,
    activePetId: activePetIdState,
    isLoading,
    setActivePetId: handleSetActivePetId,
    addAnimal,
    updateLocalAnimal,
    removeAnimal,
    refreshAnimals,
  };
}
