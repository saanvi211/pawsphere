import { Animal } from '../../types/animal';
import { supabase, isSupabaseConfigured } from '../supabase';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface TriageResult {
  careLevel: 'MONITOR AT HOME' | 'SEE VET SOON' | 'CRITICAL FIRST AID';
  summary: string;
  firstAidSteps: string[];
  warningSign: string;
  treatmentPlan: string;
  nearestClinicAdvice: string;
}

const SYSTEM_PROMPT = `You are an expert veterinary first-aid advisor inside the PawSphere pet care app.
IMPORTANT RULES:
- Always respond in JSON format only, no markdown.
- Provide practical, clear first-aid steps appropriate for a pet owner at home.
- Never replace a real vet. Always recommend professional consultation.
- Be concise but thorough.
- Classify careLevel as one of: "MONITOR AT HOME", "SEE VET SOON", or "CRITICAL FIRST AID".
- For critical symptoms (bleeding, collapse, seizure, poison ingestion), always say CRITICAL FIRST AID.

Respond with this exact JSON shape:
{
  "careLevel": "SEE VET SOON",
  "summary": "brief 1-2 sentence summary of what may be happening",
  "firstAidSteps": ["step 1", "step 2", "step 3", "step 4"],
  "warningSign": "specific symptom to watch for that means it is getting worse",
  "treatmentPlan": "general treatment approach a vet would recommend",
  "nearestClinicAdvice": "short actionable advice about when to go to an emergency clinic"
}`;

/** Call Gemini API to analyze pet symptoms */
export async function analyzePetSymptoms(
  symptomText: string,
  animal: Animal | null
): Promise<TriageResult> {
  const isConfigured = !!GEMINI_API_KEY && !GEMINI_API_KEY.includes('your-gemini');

  const petContext = animal
    ? `Pet: ${animal.name}, ${animal.breed} (${animal.species}), Age: ${animal.ageYears} years, Weight: ${animal.weightKg}kg`
    : 'Pet details: unknown';

  if (!isConfigured) {
    // Fallback: smart rule-based responses without API
    return buildOfflineResponse(symptomText, animal);
  }

  const userMessage = `${petContext}\n\nOwner reports: "${symptomText}"\n\nProvide veterinary first-aid guidance.`;

  try {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 512,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty Gemini response');

    const parsed = JSON.parse(text) as TriageResult;
    await saveTriageSession(symptomText, animal, parsed);
    return parsed;
  } catch (err) {
    console.error('[triage] Gemini API failed, using offline fallback:', err);
    const fallback = buildOfflineResponse(symptomText, animal);
    await saveTriageSession(symptomText, animal, fallback);
    return fallback;
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
      care_level: result.careLevel,
    });
  } catch {
    // Non-critical — don't block the UI
  }
}

/** Rule-based offline fallback triage (no API needed) */
function buildOfflineResponse(symptomText: string, animal: Animal | null): TriageResult {
  const lower = symptomText.toLowerCase();
  const petName = animal?.name || 'your pet';

  const isCritical =
    lower.includes('bleed') ||
    lower.includes('collapse') ||
    lower.includes('seizure') ||
    lower.includes('unconscious') ||
    lower.includes('poison') ||
    lower.includes('chocolate') ||
    lower.includes('not breathing') ||
    lower.includes('broken');

  const needsVet =
    lower.includes('vomit') ||
    lower.includes('diarrhea') ||
    lower.includes('limp') ||
    lower.includes('fever') ||
    lower.includes('not eating') ||
    lower.includes('lethargy') ||
    lower.includes('swollen') ||
    lower.includes('crying') ||
    lower.includes('pain');

  if (isCritical) {
    return {
      careLevel: 'CRITICAL FIRST AID',
      summary: `${petName} may be in immediate danger. Emergency veterinary care is required as soon as possible.`,
      firstAidSteps: [
        'Keep your pet calm and restrict all movement immediately.',
        'Do NOT administer human medications — paracetamol, ibuprofen, and aspirin are toxic to animals.',
        'If poison was ingested, do NOT induce vomiting unless a vet specifically instructs you to.',
        'Wrap your pet in a warm blanket and transport to the nearest emergency clinic NOW.',
      ],
      warningSign: 'Loss of consciousness, laboured breathing, or pale gums — call emergency vet immediately.',
      treatmentPlan: 'Emergency stabilisation, IV fluids, and diagnostic blood panel by a veterinarian.',
      nearestClinicAdvice: 'Go to the nearest 24/7 emergency veterinary hospital immediately. Do not wait.',
    };
  }

  if (needsVet) {
    return {
      careLevel: 'SEE VET SOON',
      summary: `${petName} is showing symptoms that warrant professional veterinary evaluation within 24 hours.`,
      firstAidSteps: [
        'Restrict physical activity — no running, jumping, or playing.',
        'Offer small amounts of water frequently. Withhold food for 2 hours if vomiting.',
        'Monitor temperature (normal: 38–39.2°C). Seek help if above 39.5°C.',
        'Document the frequency and appearance of symptoms to report to your vet.',
      ],
      warningSign: 'If symptoms worsen rapidly or your pet stops responding to you, escalate to emergency care.',
      treatmentPlan: 'Vet examination, possible blood panel, medication prescription, and follow-up in 3–5 days.',
      nearestClinicAdvice: 'Book a same-day vet appointment. If no slots available, visit an urgent care clinic.',
    };
  }

  return {
    careLevel: 'MONITOR AT HOME',
    summary: `${petName}'s symptoms appear mild and can be monitored at home for now.`,
    firstAidSteps: [
      'Keep your pet in a quiet, comfortable space away from stress.',
      'Ensure fresh water is always available.',
      'Check on your pet every 30 minutes for the next 2 hours.',
      'Resume normal feeding schedule unless vomiting or diarrhoea is present.',
    ],
    warningSign: 'If symptoms persist beyond 12 hours or any new symptoms appear, contact your vet.',
    treatmentPlan: 'Rest, hydration, and monitoring. No medications unless prescribed.',
    nearestClinicAdvice: 'Schedule a routine vet check within 2–3 days if symptoms do not improve.',
  };
}
