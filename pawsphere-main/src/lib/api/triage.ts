import { Animal } from '../../types/animal';
import { supabase, isSupabaseConfigured } from '../supabase';
import {
  buildStructuredSymptomAnalysis,
  TriageResult,
  SeverityLevel
} from './symptomAnalyzer';

export type { TriageResult, SeverityLevel };

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const SYSTEM_PROMPT = `You are an expert veterinary first-aid advisor inside the PawSphere pet care app.
IMPORTANT RULES:
- Always respond in JSON format only, with no markdown fences.
- Provide practical, clear, symptom-specific first-aid guidance appropriate for a pet owner at home.
- Never replace a real vet. Use cautious language ("possible causes include", "may indicate").
- Classify severity as ONE of: "MONITOR AT HOME", "VETERINARY CHECK RECOMMENDED", "URGENT VETERINARY CARE", or "EMERGENCY".
- For critical symptoms (active bleeding, collapse, seizure, poison ingestion, breathing distress), ALWAYS specify "EMERGENCY" or "URGENT VETERINARY CARE".
- Do NOT recommend human medications or dosages.

Respond with this exact JSON shape:
{
  "symptom": "Primary symptom identified",
  "category": "Medical category (e.g. Skin & Coat, Gastrointestinal, Musculoskeletal, Respiratory, etc.)",
  "severity": "MONITOR AT HOME | VETERINARY CHECK RECOMMENDED | URGENT VETERINARY CARE | EMERGENCY",
  "summary": "2-3 sentence pet-specific assessment",
  "possibleCauses": ["cause 1", "cause 2", "cause 3"],
  "immediateFirstAid": ["step 1", "step 2", "step 3"],
  "thingsToMonitor": ["monitoring point 1", "monitoring point 2"],
  "redFlags": ["red flag 1", "red flag 2"],
  "vetRecommendation": "Actionable veterinary recommendation",
  "followUpQuestions": ["question 1", "question 2"]
}`;

/** Call Gemini API or offline symptom analyzer to assess pet symptoms */
export async function analyzePetSymptoms(
  symptomText: string,
  animal: Animal | null
): Promise<TriageResult> {
  const localAnalysis = buildStructuredSymptomAnalysis(symptomText, animal);

  const isConfigured = !!GEMINI_API_KEY && !GEMINI_API_KEY.includes('your-gemini') && GEMINI_API_KEY.length > 20;

  if (!isConfigured) {
    return localAnalysis;
  }

  const petContext = animal
    ? `Pet: ${animal.name}, ${animal.breed} (${animal.species}), Age: ${animal.ageYears} years, Weight: ${animal.weightKg}kg`
    : 'Pet details: unknown';

  const userMessage = `${petContext}\n\nOwner reports: "${symptomText}"\n\nProvide structured veterinary triage & first-aid guidance.`;

  try {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 768,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty Gemini response');

    const parsed = JSON.parse(text) as Partial<TriageResult>;

    // Merge Gemini result with offline analysis for complete fields and safety override
    const mergedResult: TriageResult = {
      symptom: parsed.symptom || localAnalysis.symptom,
      category: parsed.category || localAnalysis.category,
      severity: (localAnalysis.severity === 'EMERGENCY' ? 'EMERGENCY' : parsed.severity) as SeverityLevel || localAnalysis.severity,
      summary: parsed.summary || localAnalysis.summary,
      possibleCauses: parsed.possibleCauses && parsed.possibleCauses.length > 0 ? parsed.possibleCauses : localAnalysis.possibleCauses,
      immediateFirstAid: parsed.immediateFirstAid && parsed.immediateFirstAid.length > 0 ? parsed.immediateFirstAid : localAnalysis.immediateFirstAid,
      thingsToMonitor: parsed.thingsToMonitor && parsed.thingsToMonitor.length > 0 ? parsed.thingsToMonitor : localAnalysis.thingsToMonitor,
      redFlags: parsed.redFlags && parsed.redFlags.length > 0 ? parsed.redFlags : localAnalysis.redFlags,
      vetRecommendation: parsed.vetRecommendation || localAnalysis.vetRecommendation,
      followUpQuestions: parsed.followUpQuestions && parsed.followUpQuestions.length > 0 ? parsed.followUpQuestions : localAnalysis.followUpQuestions,
      // Legacy compat
      careLevel: localAnalysis.careLevel,
      firstAidSteps: parsed.immediateFirstAid || localAnalysis.immediateFirstAid,
      warningSign: (parsed.thingsToMonitor && parsed.thingsToMonitor[0]) || localAnalysis.warningSign,
      treatmentPlan: parsed.vetRecommendation || localAnalysis.treatmentPlan,
      nearestClinicAdvice: localAnalysis.nearestClinicAdvice,
    };

    await saveTriageSession(symptomText, animal, mergedResult);
    return mergedResult;
  } catch (err) {
    console.warn('[triage] Gemini API call failed or unavailable, using local structured analyzer:', err);
    await saveTriageSession(symptomText, animal, localAnalysis);
    return localAnalysis;
  }
}

/** Persist triage session to Supabase (fire-and-forget) */
async function saveTriageSession(
  symptomText: string,
  animal: Animal | null,
  result: TriageResult
): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from('ai_triage_sessions').insert({
      user_id: session?.user?.id ?? null,
      animal_id: animal?.id ?? null,
      symptom_text: symptomText,
      ai_response: result as unknown as Record<string, unknown>,
      care_level: result.severity || result.careLevel,
    });
  } catch {
    // Non-critical — don't block UI
  }
}
