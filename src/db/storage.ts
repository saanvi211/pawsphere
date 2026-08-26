import { Animal, UserProfile, MatchmakingQuestionnaire, VaccineRecord, MedicalRecord } from '../types/animal';
import { MOCK_ANIMALS } from '../data/mockAnimals';

const KEYS = {
  USER: 'pawsphere_user_v2',
  ANIMALS: 'pawsphere_animals_v2',
  ACTIVE_PET_ID: 'pawsphere_active_pet_v2',
  MATCH_QUIZ: 'pawsphere_quiz_v2'
};

const DEFAULT_USER: UserProfile = {
  id: 'usr-101',
  name: 'Alex Rivera',
  email: 'alex.rivera@gmail.com',
  phone: '+1 (555) 234-5678',
  city: 'Bengaluru',
  address: 'Indiranagar 12th Main Road, Apt 4B',
  role: 'pet_owner',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  memberSince: 'January 2026',
  favoritePetIds: ['pet-dog-01', 'pet-cat-02']
};

export const getStorageUser = (): UserProfile => {
  const data = localStorage.getItem(KEYS.USER);
  if (!data) return DEFAULT_USER;
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_USER;
  }
};

export const saveStorageUser = (user: UserProfile): void => {
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
};

export const getStorageAnimals = (): Animal[] => {
  const data = localStorage.getItem(KEYS.ANIMALS);
  if (!data) return MOCK_ANIMALS;
  try {
    return JSON.parse(data);
  } catch {
    return MOCK_ANIMALS;
  }
};

export const saveStorageAnimals = (animals: Animal[]): void => {
  localStorage.setItem(KEYS.ANIMALS, JSON.stringify(animals));
};

export const getActivePetId = (): string => {
  const id = localStorage.getItem(KEYS.ACTIVE_PET_ID);
  if (id) return id;
  const animals = getStorageAnimals();
  return animals[0]?.id || 'pet-dog-01';
};

export const setActivePetId = (id: string): void => {
  localStorage.setItem(KEYS.ACTIVE_PET_ID, id);
};

export const getStorageQuiz = (): MatchmakingQuestionnaire | null => {
  const data = localStorage.getItem(KEYS.MATCH_QUIZ);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const saveStorageQuiz = (quiz: MatchmakingQuestionnaire): void => {
  localStorage.setItem(KEYS.MATCH_QUIZ, JSON.stringify(quiz));
};

export const addVaccineRecord = (animalId: string, rec: Omit<VaccineRecord, 'id'>): Animal => {
  const animals = getStorageAnimals();
  const index = animals.findIndex(a => a.id === animalId);
  if (index >= 0) {
    const newRec: VaccineRecord = { ...rec, id: 'v-' + Date.now() };
    animals[index].vaccinations.unshift(newRec);
    saveStorageAnimals(animals);
    return animals[index];
  }
  return animals[0];
};
