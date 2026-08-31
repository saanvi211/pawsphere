import { useState, useEffect, useCallback, useRef } from 'react';
import { Animal } from '../types/animal';
import { isSupabaseConfigured } from '../lib/supabase';
import { getUserAnimals, createAnimal, updateAnimal, deleteAnimal } from '../lib/api/animals';
import {
  getUserStorageAnimals,
  saveUserStorageAnimals,
  getActivePetId,
  setActivePetId
} from '../db/storage';

interface UseAnimalsReturn {
  animals: Animal[];
  activePet: Animal | null;
  activePetId: string;
  isLoading: boolean;
  setActivePetId: (id: string) => void;
  addAnimal: (animalData: Omit<Animal, 'id' | 'vaccinations' | 'medicalHistory' | 'bodyPins'>, userId: string) => Promise<Animal | null>;
  updateLocalAnimal: (animal: Animal) => Promise<void>;
  removeAnimal: (id: string) => Promise<void>;
  refreshAnimals: (userId: string) => Promise<void>;
}

/**
 * Central animals hook.
 * - Enforces strict per-user pet data isolation.
 * - With Supabase: fetches from DB per owner_id.
 * - Local fallback: fetches from per-user local storage key.
 */
export function useAnimals(userId: string | null): UseAnimalsReturn {
  const [animals, setAnimals] = useState<Animal[]>(() => getUserStorageAnimals(userId));
  const [activePetIdState, setActivePetIdState] = useState<string>(() => getActivePetId());
  const [isLoading, setIsLoading] = useState(false);
  const activePetIdRef = useRef(activePetIdState);

  const refreshAnimals = useCallback(async (uid: string) => {
    if (!uid) {
      setAnimals([]);
      setActivePetIdState('');
      setActivePetId('');
      return;
    }

    setIsLoading(true);
    let fetched: Animal[] = [];

    if (isSupabaseConfigured) {
      try {
        fetched = await getUserAnimals(uid);
      } catch (err) {
        console.warn('[useAnimals] Supabase fetch error, fallback to local storage:', err);
      }
    }

    if (fetched.length === 0) {
      fetched = getUserStorageAnimals(uid);
    }

    setAnimals(fetched);

    if (fetched.length > 0) {
      const currentActiveExists = fetched.some(a => a.id === activePetIdRef.current);
      if (!currentActiveExists) {
        setActivePetIdState(fetched[0].id);
        activePetIdRef.current = fetched[0].id;
        setActivePetId(fetched[0].id);
      }
    } else {
      setActivePetIdState('');
      setActivePetId('');
    }
    setIsLoading(false);
  }, []);

  // Sync / Refresh when userId changes
  useEffect(() => {
    if (userId) {
      refreshAnimals(userId);
    } else {
      setAnimals([]);
      setActivePetIdState('');
      setActivePetId('');
    }
  }, [userId, refreshAnimals]);

  const handleSetActivePetId = useCallback((id: string) => {
    activePetIdRef.current = id;
    setActivePetIdState(id);
    setActivePetId(id);
  }, []);

  const addAnimal = useCallback(async (
    animalData: Omit<Animal, 'id' | 'vaccinations' | 'medicalHistory' | 'bodyPins'>,
    uid: string
  ): Promise<Animal | null> => {
    let created: Animal | null = null;

    if (!isSupabaseConfigured) {
      created = {
        ...animalData,
        id: 'local-pet-' + Date.now(),
        vaccinations: [],
        medicalHistory: [],
        bodyPins: [
          { id: 'bp-1', label: 'Heart Vitals', systemName: 'Heart & Chest', healthScore: 96, status: 'Healthy', position: [0, 0, 0], doctorNotes: 'Excellent heartbeat.', dailyCareTip: 'Regular exercise.' }
        ],
      };
      setAnimals(prev => {
        const next = [created!, ...prev];
        if (uid) saveUserStorageAnimals(uid, next);
        return next;
      });
    } else {
      const { animal, error } = await createAnimal(uid, animalData);
      if (error || !animal) {
        console.error('[useAnimals] addAnimal error:', error);
        return null;
      }
      created = animal;
      setAnimals(prev => {
        const next = [created!, ...prev];
        if (uid) saveUserStorageAnimals(uid, next);
        return next;
      });
    }

    // AUTOMATICALLY SELECT THE NEWLY CREATED PET AS ACTIVE PET
    if (created) {
      setActivePetIdState(created.id);
      setActivePetId(created.id);
    }
    return created;
  }, []);

  const updateLocalAnimal = useCallback(async (updated: Animal) => {
    setAnimals(prev => {
      const next = prev.map(a => a.id === updated.id ? updated : a);
      if (userId) saveUserStorageAnimals(userId, next);
      return next;
    });
    if (isSupabaseConfigured) {
      const { error } = await updateAnimal(updated.id, updated);
      if (error) console.error('[useAnimals] updateAnimal error:', error);
    }
  }, [userId]);

  const removeAnimal = useCallback(async (id: string) => {
    setAnimals(prev => {
      const next = prev.filter(a => a.id !== id);
      if (userId) saveUserStorageAnimals(userId, next);
      return next;
    });
    if (isSupabaseConfigured) {
      const { error } = await deleteAnimal(id);
      if (error) console.error('[useAnimals] deleteAnimal error:', error);
    }
    if (activePetIdState === id) {
      const remaining = animals.filter(a => a.id !== id);
      const nextActive = remaining[0]?.id || '';
      setActivePetIdState(nextActive);
      setActivePetId(nextActive);
    }
  }, [animals, userId, activePetIdState]);

  // Derived activePet strictly bound to user's fetched animals
  const activePet = animals.find(a => a.id === activePetIdState) || (animals.length > 0 ? animals[0] : null);

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
