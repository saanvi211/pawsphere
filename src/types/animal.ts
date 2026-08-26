// ─── Core Enums / Union Types ──────────────────────────────────────────────

export type SpeciesType =
  | 'dog'
  | 'cat'
  | 'bird'
  | 'fish'
  | 'reptile'
  | 'rabbit'
  | 'hamster'
  | 'other';

export type UserRole =
  | 'pet_owner'
  | 'looking_to_buy_or_adopt'
  | 'vet'
  | 'shelter_staff';

// ─── Pet Body Pin (Digital Twin 3D marker) ────────────────────────────────

export interface PetBodyPin {
  id: string;
  label: string;
  systemName: string;
  healthScore: number;           // 0–100
  status: 'Healthy' | 'Needs Attention' | 'Critical';
  position: [number, number, number]; // [x, y, z] in 3D space
  doctorNotes: string;
  dailyCareTip: string;
}

// ─── Vaccine Record ────────────────────────────────────────────────────────

export interface VaccineRecord {
  id: string;
  vaccineName: string;
  dateGiven: string;       // ISO date string e.g. "2025-05-10"
  nextDueDate: string | null;  // nullable — not all vaccines have a next due date
  doctorName: string;
  verifiedStamp: boolean;
}

// ─── Medical Record ────────────────────────────────────────────────────────

export interface MedicalRecord {
  id: string;
  date: string;            // ISO date string
  title: string;
  doctorNotes: string | null;  // nullable
  status: 'Normal' | 'Follow Up Needed';
}

// ─── Animal / Pet ──────────────────────────────────────────────────────────

export interface Animal {
  id: string;
  name: string;
  species: SpeciesType;
  breed: string;
  ageYears: number;
  gender: 'Male' | 'Female';
  weightKg: number;
  microchipId?: string;          // Optional
  photoUrl: string;
  priceOrAdoptionFee: string;    // e.g. "$150 Adoption Fee" or "Owned Companion"
  aboutPet: string;
  energyLevel: 'Calm' | 'Moderate' | 'High Energy';
  temperament: string[];
  goodWithKids: boolean;
  goodWithOtherPets: boolean;
  careLevel: 'Easy' | 'Moderate' | 'Special Care';
  monthlyEstCost: number;
  shelterId: string;
  isAvailableForAdoptionOrSale: boolean;
  healthScore: number;           // 0–100
  bodyPins: PetBodyPin[];
  vaccinations: VaccineRecord[];
  medicalHistory: MedicalRecord[];
}

// ─── User Profile ──────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  role: UserRole;
  avatarUrl: string;
  memberSince: string;           // e.g. "January 2026"
  favoritePetIds: string[];
}

// ─── Shelter ───────────────────────────────────────────────────────────────

export interface Shelter {
  id: string;
  name: string;
  type: 'Verified Adoption Shelter' | 'Licensed Ethical Breeder';
  address: string;
  city: string;
  phone: string;
  email: string;
  openingHours: string;
  lat: number;
  lng: number;
  availablePetsCount: number;
}

// ─── Matchmaking Questionnaire ─────────────────────────────────────────────

export interface MatchmakingQuestionnaire {
  targetPetType: SpeciesType | 'any';
  homeType: 'Apartment' | 'House with Yard' | 'Farm / Large Property';
  dailyTimeAvailable: 'Under 1 Hour' | '1 to 2 Hours' | '3+ Hours';
  monthlyBudget: number;
  experienceLevel:
    | 'First-time Pet Owner'
    | 'Owned Pets Before'
    | 'Experienced Handler';
  activityLevel: 'Sedentary' | 'Moderate' | 'Highly Active';
  hasChildren: boolean;
  hasOtherPets: boolean;
  patienceLevel: 'Low' | 'Medium' | 'High';
  noiseTolerance: 'Quiet' | 'Medium' | 'Loud';
  desiredTrait:
    | 'playful'
    | 'calm'
    | 'loyal'
    | 'independent'
    | 'affectionate'
    | 'protective';
}
