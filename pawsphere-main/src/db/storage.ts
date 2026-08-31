import { Animal, UserProfile, MatchmakingQuestionnaire, VaccineRecord } from '../types/animal';
import { MealPlanDay, NutritionData } from '../types/nutrition';
import { CommunityPost } from '../types/community';

const KEYS = {
  USER: 'pawsphere_user_v2',
  USERS_REGISTRY: 'pawsphere_registered_users_v2',
  ANIMALS: 'pawsphere_animals_v2',
  ACTIVE_PET_ID: 'pawsphere_active_pet_v2',
  MATCH_QUIZ: 'pawsphere_quiz_v2',
  NUTRITION: 'pawsphere_nutrition_v1',
  COMMUNITY: 'pawsphere_community_v1'
};

export interface StoredUserAccount {
  profile: UserProfile;
  username: string;
  password: string;
}

export const getStorageUser = (): UserProfile | null => {
  const data = localStorage.getItem(KEYS.USER);
  if (!data) return null;
  try {
    const parsed = JSON.parse(data) as UserProfile | null;
    if (!parsed || !parsed.id || !parsed.name) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const saveStorageUser = (user: UserProfile): void => {
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
};

export const clearStorageUser = (): void => {
  localStorage.removeItem(KEYS.USER);
};

// ─── Registered Users Database ───────────────────────────────────────────────

export const getRegisteredUsers = (): StoredUserAccount[] => {
  const data = localStorage.getItem(KEYS.USERS_REGISTRY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const findUserByEmail = (email: string): StoredUserAccount | null => {
  const users = getRegisteredUsers();
  const lower = email.trim().toLowerCase();
  return users.find(u => u.profile.email.toLowerCase() === lower) || null;
};

export const findUserByUsername = (username: string): StoredUserAccount | null => {
  const users = getRegisteredUsers();
  const lower = username.trim().toLowerCase();
  return users.find(u => u.username.toLowerCase() === lower) || null;
};

export const saveRegisteredUserAccount = (account: StoredUserAccount): void => {
  const users = getRegisteredUsers();
  const existingIdx = users.findIndex(
    u => u.profile.id === account.profile.id || u.profile.email.toLowerCase() === account.profile.email.toLowerCase()
  );
  if (existingIdx >= 0) {
    users[existingIdx] = account;
  } else {
    users.push(account);
  }
  localStorage.setItem(KEYS.USERS_REGISTRY, JSON.stringify(users));
};

// ─── Pets Storage — Defaults to MOCK_ANIMALS so dashboard features are rich as before ──────────

export const getUserStorageAnimals = (userId: string | null): Animal[] => {
  if (!userId) return [];

  const key = `${KEYS.ANIMALS}_${userId}`;
  const data = localStorage.getItem(key);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};


export const saveUserStorageAnimals = (userId: string, animals: Animal[]): void => {
  const key = `${KEYS.ANIMALS}_${userId}`;
  localStorage.setItem(key, JSON.stringify(animals));
  localStorage.setItem(KEYS.ANIMALS, JSON.stringify(animals));
};

export const getStorageAnimals = (): Animal[] => {
  const user = getStorageUser();
  if (user) {
    return getUserStorageAnimals(user.id);
  }
  const data = localStorage.getItem(KEYS.ANIMALS);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveStorageAnimals = (animals: Animal[]): void => {
  const user = getStorageUser();
  if (user) {
    saveUserStorageAnimals(user.id, animals);
  } else {
    localStorage.setItem(KEYS.ANIMALS, JSON.stringify(animals));
  }
};

export const getActivePetId = (): string => {
  return localStorage.getItem(KEYS.ACTIVE_PET_ID) || '';
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

const emptyNutritionData = (): NutritionData => ({
  meals: [],
  water: [],
  weights: [],
  treats: [],
  goalWeightKg: null
});

export const getNutritionData = (userId: string | null, petId: string | null): NutritionData => {
  if (!userId || !petId) return emptyNutritionData();

  const data = localStorage.getItem(`${KEYS.NUTRITION}_${userId}_${petId}`);
  if (!data) return emptyNutritionData();

  try {
    const parsed = JSON.parse(data) as Partial<NutritionData>;
    return {
      meals: Array.isArray(parsed.meals) ? parsed.meals : [],
      water: Array.isArray(parsed.water) ? parsed.water : [],
      weights: Array.isArray(parsed.weights) ? parsed.weights : [],
      treats: Array.isArray(parsed.treats) ? parsed.treats : [],
      goalWeightKg: typeof parsed.goalWeightKg === 'number' ? parsed.goalWeightKg : null
    };
  } catch {
    return emptyNutritionData();
  }
};

export const saveNutritionData = (userId: string, petId: string, data: NutritionData): void => {
  localStorage.setItem(`${KEYS.NUTRITION}_${userId}_${petId}`, JSON.stringify(data));
};

export const getMealPlan = (userId: string | null, petId: string | null): MealPlanDay[] | null => {
  if (!userId || !petId) return null;
  const data = localStorage.getItem(`${KEYS.NUTRITION}_plan_${userId}_${petId}`);
  if (!data) return null;
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const saveMealPlan = (userId: string, petId: string, plan: MealPlanDay[]): void => {
  localStorage.setItem(`${KEYS.NUTRITION}_plan_${userId}_${petId}`, JSON.stringify(plan));
};

export const clearMealPlan = (userId: string, petId: string): void => {
  localStorage.removeItem(`${KEYS.NUTRITION}_plan_${userId}_${petId}`);
};

export const getCommunityPosts = (): CommunityPost[] => {
  const data = localStorage.getItem(KEYS.COMMUNITY);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveCommunityPosts = (posts: CommunityPost[]): void => {
  localStorage.setItem(KEYS.COMMUNITY, JSON.stringify(posts));
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
