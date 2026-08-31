import { Animal, MatchmakingQuestionnaire } from '../types/animal';

/**
 * Scores a pet against a user's matchmaking quiz.
 * Returns a value from 0–100 representing compatibility %.
 */
export function computeMatchScore(
  pet: Animal,
  quiz: MatchmakingQuestionnaire
): number {
  let score = 0;
  const max = 100;

  // 1. Species match — 25 pts
  if (quiz.targetPetType === 'any' || pet.species === quiz.targetPetType) {
    score += 25;
  }

  // 2. Budget match — 20 pts (sliding scale)
  if (pet.monthlyEstCost <= quiz.monthlyBudget) {
    score += 20;
  } else {
    // Partial credit if slightly over budget
    const over = pet.monthlyEstCost - quiz.monthlyBudget;
    if (over <= 20) score += 10;
    else if (over <= 40) score += 5;
  }

  // 3. Energy / time match — 20 pts
  const energyTimeMap: Record<Animal['energyLevel'], string[]> = {
    'Calm':        ['Under 1 Hour', '1 to 2 Hours'],
    'Moderate':    ['1 to 2 Hours', '3+ Hours'],
    'High Energy': ['3+ Hours'],
  };
  if (energyTimeMap[pet.energyLevel]?.includes(quiz.dailyTimeAvailable)) {
    score += 20;
  } else if (
    pet.energyLevel === 'Moderate' &&
    quiz.dailyTimeAvailable === 'Under 1 Hour'
  ) {
    score += 8; // partial
  }

  // 4. Home type match — 15 pts
  const homePetMap: Record<Animal['energyLevel'], string[]> = {
    'Calm':        ['Apartment', 'House with Yard', 'Farm / Large Property'],
    'Moderate':    ['House with Yard', 'Farm / Large Property', 'Apartment'],
    'High Energy': ['House with Yard', 'Farm / Large Property'],
  };
  if (homePetMap[pet.energyLevel]?.includes(quiz.homeType)) {
    score += 15;
  } else if (pet.energyLevel === 'High Energy' && quiz.homeType === 'Apartment') {
    score += 3;
  }

  // 5. Kids compatibility — 10 pts
  if (!quiz.hasChildren || pet.goodWithKids) {
    score += 10;
  }

  // 6. Other pets compatibility — 5 pts
  if (!quiz.hasOtherPets || pet.goodWithOtherPets) {
    score += 5;
  }

  // 7. Care level vs experience — 5 pts
  const careXpMap: Record<Animal['careLevel'], string[]> = {
    'Easy':         ['First-time Pet Owner', 'Owned Pets Before', 'Experienced Handler'],
    'Moderate':     ['Owned Pets Before', 'Experienced Handler'],
    'Special Care': ['Experienced Handler'],
  };
  if (careXpMap[pet.careLevel]?.includes(quiz.experienceLevel)) {
    score += 5;
  }

  return Math.min(Math.round(score), max);
}

/** Returns a label and colour class for a given score */
export function getMatchLabel(score: number): {
  label: string;
  colour: string;
  bg: string;
} {
  if (score >= 85) return { label: 'Perfect Match', colour: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-300' };
  if (score >= 65) return { label: 'Great Match',   colour: 'text-blue-700',    bg: 'bg-blue-100 border-blue-300' };
  if (score >= 45) return { label: 'Good Match',    colour: 'text-amber-700',   bg: 'bg-amber-100 border-amber-300' };
  return               { label: 'Low Match',        colour: 'text-slate-500',   bg: 'bg-slate-100 border-slate-300' };
}
