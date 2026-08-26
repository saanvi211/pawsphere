import { supabase, isSupabaseConfigured } from '../supabase';
import { MatchmakingQuestionnaire } from '../../types/animal';

/** Save a user's matchmaking quiz answers */
export async function saveMatchmakingQuiz(
  userId: string,
  quiz: MatchmakingQuestionnaire
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) return { error: null };

  // Upsert — replace if exists
  const { error } = await supabase.from('matchmaking_quiz').upsert({
    user_id: userId,
    target_pet_type: quiz.targetPetType,
    home_type: quiz.homeType,
    daily_time_available: quiz.dailyTimeAvailable,
    monthly_budget: quiz.monthlyBudget,
    experience_level: quiz.experienceLevel,
    activity_level: quiz.activityLevel,
    has_children: quiz.hasChildren,
    has_other_pets: quiz.hasOtherPets,
    patience_level: quiz.patienceLevel,
    noise_tolerance: quiz.noiseTolerance,
    desired_trait: quiz.desiredTrait,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  return { error: error?.message || null };
}

/** Get the user's saved quiz answers */
export async function getMatchmakingQuiz(userId: string): Promise<MatchmakingQuestionnaire | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('matchmaking_quiz')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;

  const row = data as Record<string, unknown>;
  return {
    targetPetType: row.target_pet_type as MatchmakingQuestionnaire['targetPetType'],
    homeType: row.home_type as MatchmakingQuestionnaire['homeType'],
    dailyTimeAvailable: row.daily_time_available as MatchmakingQuestionnaire['dailyTimeAvailable'],
    monthlyBudget: row.monthly_budget as number,
    experienceLevel: row.experience_level as MatchmakingQuestionnaire['experienceLevel'],
    activityLevel: row.activity_level as MatchmakingQuestionnaire['activityLevel'],
    hasChildren: row.has_children as boolean,
    hasOtherPets: row.has_other_pets as boolean,
    patienceLevel: row.patience_level as MatchmakingQuestionnaire['patienceLevel'],
    noiseTolerance: row.noise_tolerance as MatchmakingQuestionnaire['noiseTolerance'],
    desiredTrait: row.desired_trait as MatchmakingQuestionnaire['desiredTrait'],
  };
}
