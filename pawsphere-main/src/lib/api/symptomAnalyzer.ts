import { Animal } from '../../types/animal';

export type SeverityLevel =
  | 'MONITOR AT HOME'
  | 'VETERINARY CHECK RECOMMENDED'
  | 'URGENT VETERINARY CARE'
  | 'EMERGENCY';

export interface TriageResult {
  symptom: string;
  category: string;
  severity: SeverityLevel;
  summary: string;
  possibleCauses: string[];
  immediateFirstAid: string[];
  thingsToMonitor: string[];
  redFlags: string[];
  vetRecommendation: string;
  followUpQuestions?: string[];

  // Legacy compatibility fields
  careLevel: string;
  firstAidSteps: string[];
  warningSign: string;
  treatmentPlan: string;
  nearestClinicAdvice: string;
}

/** Normalize input text for rule matching */
export function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[''""`.,/#!$%^&*;:{}=\-_~()]/g, ' ');
}

/** Analyzes raw symptom text and pet context to generate a structured symptom-specific response */
export function buildStructuredSymptomAnalysis(
  rawInput: string,
  animal: Animal | null
): TriageResult {
  const norm = normalizeText(rawInput);
  const petName = animal?.name?.trim() || 'your pet';
  const petSpecies = animal?.species ? animal.species : 'pet';
  const petAgeStr = animal?.ageYears ? `, a ${animal.ageYears}-year-old ${animal.breed || petSpecies}` : '';
  const petContextName = `${petName}${petAgeStr}`;

  // ───────────────────────────────────────────────────────────────────────────
  // 1. RED FLAG / EMERGENCY OVERRIDES
  // ───────────────────────────────────────────────────────────────────────────

  // Anaphylaxis / Severe Allergy (itching/rash + swollen face or breathing trouble)
  const isSwollenFaceAllergy =
    (norm.includes('itch') || norm.includes('scratch') || norm.includes('rash') || norm.includes('bug bite')) &&
    (norm.includes('swollen face') || norm.includes('swelling face') || norm.includes('face is swollen') || norm.includes('hives') || norm.includes('swollen eyes'));

  // Severe respiratory distress
  const isRespiratoryEmergency =
    norm.includes('struggling to breathe') ||
    norm.includes('difficulty breathing') ||
    norm.includes('gasping') ||
    norm.includes('blue gums') ||
    norm.includes('pale gums') ||
    norm.includes('purple tongue') ||
    norm.includes('cannot breathe') ||
    norm.includes('choking');

  // Severe trauma
  const isMajorTrauma =
    norm.includes('hit by car') ||
    norm.includes('hit by vehicle') ||
    norm.includes('fell from height') ||
    norm.includes('cannot stand') ||
    (norm.includes('bleeding') && norm.includes('profuse')) ||
    norm.includes('deformity') ||
    norm.includes('exposed bone');

  // Seizure / Collapse
  const isSeizureEmergency =
    norm.includes('seizure') ||
    norm.includes('convulsion') ||
    norm.includes('collapse') ||
    norm.includes('unconscious') ||
    norm.includes('passed out');

  // Urinary Obstruction (Male cat / pet straining with no urine)
  const isUrinaryBlock =
    (norm.includes('straining to pee') || norm.includes('cannot pee') || norm.includes('unable to urinate')) &&
    (norm.includes('no urine') || norm.includes('crying') || norm.includes('block') || norm.includes('cat'));

  if (isSwollenFaceAllergy) {
    return createResult({
      symptom: 'Facial Swelling & Acute Allergic Reaction',
      category: 'Immunological & Allergic Emergency',
      severity: 'EMERGENCY',
      summary: `${petContextName} is displaying signs of an acute allergic reaction (anaphylactic risk) with facial swelling and skin irritation.`,
      possibleCauses: [
        'Insect sting or spider bite',
        'Acute drug or vaccine reaction',
        'Severe food or environmental allergen exposure',
        'Contact toxin'
      ],
      immediateFirstAid: [
        'Keep your pet calm and restrict all physical activity immediately.',
        'Ensure the airway remains open — check that breathing is not obstructed.',
        'Do NOT give human antihistamines (Benadryl, etc.) without explicit veterinary dosage instructions.',
        'Transport your pet to an emergency veterinary clinic right away.'
      ],
      thingsToMonitor: [
        'Airway obstruction or noisy, raspy breathing',
        'Spreading of swelling down the neck or throat',
        'Vomiting, weakness, or pale gums'
      ],
      redFlags: [
        'Breathing difficulty or raspy throat sounds',
        'Swelling extending to the neck',
        'Collapse, weakness, or pale/blue gums'
      ],
      vetRecommendation: 'Seek emergency veterinary care immediately. Anaphylactic reactions can escalate quickly.',
      followUpQuestions: [
        'Did the facial swelling start suddenly after a walk or sting?',
        'Is your pet breathing normally or making raspy sounds?',
        'Are there any red welts or hives on the belly or skin?'
      ]
    });
  }

  if (isRespiratoryEmergency) {
    return createResult({
      symptom: 'Severe Breathing Distress',
      category: 'Respiratory Emergency',
      severity: 'EMERGENCY',
      summary: `${petContextName} is experiencing severe breathing difficulty. This is a critical medical emergency requiring immediate professional intervention.`,
      possibleCauses: [
        'Severe pneumonia or fluid in the lungs (pulmonary edema)',
        'Congestive heart failure',
        'Tracheal collapse or airway obstruction',
        'Feline asthma or severe allergic spasm',
        'Thoracic trauma or pneumothorax'
      ],
      immediateFirstAid: [
        'Keep your pet completely quiet and calm — minimize stress and movement.',
        'Ensure maximum airflow; do not restrain or compress the chest.',
        'Remove any neck collar or neck leash immediately.',
        'Proceed directly to the nearest 24/7 emergency veterinary hospital.'
      ],
      thingsToMonitor: [
        'Gum color (pale, white, blue, or purple indicates hypoxia)',
        'Open-mouth breathing (especially critical in cats)',
        'Abdominal effort while breathing'
      ],
      redFlags: [
        'Blue or pale gray gums',
        'Open-mouth gasping in cats',
        'Inability to lie down comfortably',
        'Collapse or loss of consciousness'
      ],
      vetRecommendation: 'EMERGENCY: Transport your pet to a veterinary hospital immediately. Do not wait.',
      followUpQuestions: [
        'What color are your pet\'s gums right now?',
        'Is your pet gasping with an open mouth?',
        'Has your pet collapsed or become unresponsive?'
      ]
    });
  }

  if (isMajorTrauma) {
    return createResult({
      symptom: 'Major Trauma & Injury',
      category: 'Trauma & Musculoskeletal Emergency',
      severity: 'EMERGENCY',
      summary: `${petContextName} has suffered major physical trauma. Immediate emergency stabilization is necessary to assess internal injuries and shock.`,
      possibleCauses: [
        'Vehicular accident (hit by car)',
        'High fall (high-rise syndrome)',
        'Blunt force trauma or animal attack',
        'Bone fracture or joint dislocation'
      ],
      immediateFirstAid: [
        'Gently transfer your pet onto a flat rigid surface (stretcher/board) or blanket to prevent spinal movement.',
        'Apply direct gentle pressure with clean cloth if external bleeding is visible.',
        'Keep your pet warm with a light blanket to combat shock.',
        'Do NOT manipulate injured limbs or offer food and water.'
      ],
      thingsToMonitor: [
        'Breathing effort and pulse rate',
        'Gum color (white/pale indicates internal hemorrhage or shock)',
        'Level of consciousness and responsiveness'
      ],
      redFlags: [
        'Inability to stand or walk',
        'Visible bone deformity or spinal instability',
        'Profuse bleeding or pale white gums',
        'Disorientation, shock, or stupor'
      ],
      vetRecommendation: 'EMERGENCY: Transport to the emergency clinic immediately. Call ahead so the medical team can prepare.',
      followUpQuestions: [
        'Can your pet move any of their legs?',
        'Are the gums pale white or pink?',
        'Is there active bleeding from any wound?'
      ]
    });
  }

  if (isSeizureEmergency) {
    return createResult({
      symptom: 'Seizure / Convulsion',
      category: 'Neurological Emergency',
      severity: 'EMERGENCY',
      summary: `${petContextName} has experienced a seizure or convulsive episode. Neurological disturbances require prompt veterinary evaluation.`,
      possibleCauses: [
        'Idiopathic epilepsy',
        'Toxin ingestion (chocolate, pesticides, mycotoxins, human medications)',
        'Metabolic imbalance (hypoglycemia, hepatic encephalopathy)',
        'Brain lesion, trauma, or inflammatory disease'
      ],
      immediateFirstAid: [
        'STAY CALM. Clear furniture, wires, and sharp objects away from your pet to prevent injury.',
        'Do NOT place your hands near your pet\'s mouth (pets will NOT swallow their tongue).',
        'Time the exact duration of the seizure.',
        'Keep lights dim, lower room noise, and keep your pet cool post-seizure.'
      ],
      thingsToMonitor: [
        'Seizure duration (episodes >3 minutes require emergency intervention)',
        'Recurrence (cluster seizures in 24 hours)',
        'Post-ictal disorientation, blindness, or fever'
      ],
      redFlags: [
        'Seizure lasting longer than 3–5 minutes (Status Epilepticus)',
        'Multiple seizures within 24 hours (cluster seizures)',
        'Inability to regain consciousness or severe hyperthermia'
      ],
      vetRecommendation: 'Contact an emergency vet clinic immediately. If the seizure lasts >3 minutes, transport immediately.',
      followUpQuestions: [
        'How many minutes did the seizure last?',
        'Has your pet had more than one seizure today?',
        'Is your pet standing and aware now?'
      ]
    });
  }

  if (isUrinaryBlock) {
    return createResult({
      symptom: 'Straining to Urinate / Suspected Urinary Blockage',
      category: 'Renal & Urinary Emergency',
      severity: 'EMERGENCY',
      summary: `${petContextName} is straining to urinate with little or no urine production. Urinary tract obstruction is a life-threatening emergency, particularly in male cats.`,
      possibleCauses: [
        'Urethral plug or urinary crystals (struvite/calcium oxalate)',
        'Bladder stone obstruction',
        'Severe urinary tract inflammation (FLUTD / cystitis)',
        'Prostatic enlargement or neoplasia'
      ],
      immediateFirstAid: [
        'Do NOT squeeze or press on your pet\'s abdomen (risks bladder rupture).',
        'Prevent your pet from jumping or straining excessively.',
        'Do NOT give human painkillers or muscle relaxants.',
        'Transport immediately to an emergency veterinary clinic.'
      ],
      thingsToMonitor: [
        'Whether any drops of urine are exiting',
        'Vocalizing, crying in pain, or vomiting',
        'Abdominal tightness and lethargy'
      ],
      redFlags: [
        'Complete inability to pass urine for >12 hours',
        'Repeated crying in litterbox or on carpet',
        'Vomiting, weakness, or collapse due to toxin buildup (uremia)'
      ],
      vetRecommendation: 'EMERGENCY: Bring your pet to an emergency vet clinic NOW. Urethral blockage can be fatal within 24–48 hours.',
      followUpQuestions: [
        'Is your pet a male cat?',
        'Has any urine passed at all in the last 6 hours?',
        'Is your pet crying or vomiting?'
      ]
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 2. SYMPTOM CATEGORY CLASSIFICATION
  // ───────────────────────────────────────────────────────────────────────────

  // VOMITING
  const isVomiting =
    norm.includes('vomit') ||
    norm.includes('threw up') ||
    norm.includes('throwing up') ||
    norm.includes('sick after eating') ||
    norm.includes('puked') ||
    norm.includes('puking');

  // DIARRHEA
  const isDiarrhea =
    norm.includes('diarrhea') ||
    norm.includes('diarrhoea') ||
    norm.includes('loose stool') ||
    norm.includes('watery stool') ||
    norm.includes('runny poop') ||
    norm.includes('bloody stool') ||
    norm.includes('loose bowel');

  // ITCHING / SKIN
  const isSkinItch =
    norm.includes('itch') ||
    norm.includes('scratch') ||
    norm.includes('skin') ||
    norm.includes('rash') ||
    norm.includes('hair loss') ||
    norm.includes('licking skin') ||
    norm.includes('biting paw') ||
    norm.includes('dermatitis') ||
    norm.includes('hotspot');

  // LIMPING / JOINT
  const isLimping =
    norm.includes('limp') ||
    norm.includes('lame') ||
    norm.includes('favoring leg') ||
    norm.includes('not using leg') ||
    norm.includes('stiff joint') ||
    norm.includes('painful leg') ||
    norm.includes('difficulty walking') ||
    norm.includes('hobbling') ||
    norm.includes('won t jump') ||
    norm.includes('doesn t want to jump');

  // COUGHING / RESPIRATORY
  const isCoughing =
    norm.includes('cough') ||
    norm.includes('wheez') ||
    norm.includes('noisy breathing') ||
    norm.includes('panting') ||
    norm.includes('sneez') ||
    norm.includes('reverse sneeze');

  // APPETITE
  const isAppetite =
    norm.includes('not eating') ||
    norm.includes('loss of appetite') ||
    norm.includes('refusing food') ||
    norm.includes('doesn t want to eat') ||
    norm.includes('eating less') ||
    norm.includes('won t eat') ||
    norm.includes('inappetence');

  // THIRST / URINATION
  const isThirstUrination =
    norm.includes('drinking too much') ||
    norm.includes('excessive thirst') ||
    norm.includes('peeing frequently') ||
    norm.includes('frequent urination') ||
    norm.includes('excessive urination') ||
    norm.includes('drinking water') ||
    norm.includes('peeing');

  // DENTAL
  const isDental =
    norm.includes('bad breath') ||
    norm.includes('gum') ||
    norm.includes('tooth') ||
    norm.includes('teeth') ||
    norm.includes('drooling') ||
    norm.includes('dental') ||
    norm.includes('mouth');

  // EYE
  const isEye =
    norm.includes('eye') ||
    norm.includes('squint') ||
    norm.includes('tearing') ||
    norm.includes('cornea');

  // EAR
  const isEar =
    norm.includes('ear') ||
    norm.includes('head shaking') ||
    norm.includes('head shake');

  // BLEEDING / WOUND
  const isBleeding =
    norm.includes('bleed') ||
    norm.includes('wound') ||
    norm.includes('cut') ||
    norm.includes('blood') ||
    norm.includes('laceration');

  // LETHARGY / WEAKNESS
  const isLethargy =
    norm.includes('tired') ||
    norm.includes('weak') ||
    norm.includes('low energy') ||
    norm.includes('lethargic') ||
    norm.includes('sleeping too much') ||
    norm.includes('inactive') ||
    norm.includes('sluggish');

  // ───────────────────────────────────────────────────────────────────────────
  // 3. GENERATE CATEGORY RESPONSES
  // ───────────────────────────────────────────────────────────────────────────

  if (isSkinItch) {
    return createResult({
      symptom: 'Itching & Skin Irritation',
      category: 'Skin & Coat',
      severity: 'MONITOR AT HOME',
      summary: `${petContextName} is showing signs of skin irritation and itching. Excessive scratching can cause skin breaks and lead to secondary infections.`,
      possibleCauses: [
        'Environmental allergies (pollen, dust mites, grass)',
        'Flea infestation or flea allergy dermatitis (FAD)',
        'Food allergies or sensitivity',
        'Bacterial or yeast skin infection',
        'Dry skin or contact irritants (shampoo, household cleaners)'
      ],
      immediateFirstAid: [
        'Inspect the skin and coat for fleas, ticks, flea dirt, redness, or scabs.',
        'Prevent excessive scratching or biting (use an Elizabethan collar if available).',
        'Gently clean affected areas with lukewarm water or pet-safe hypoallergenic cleanser.',
        'Do NOT apply human hydrocortisone creams, ointments, or essential oils.'
      ],
      thingsToMonitor: [
        'Spreading redness, swelling, or localized heat',
        'Development of open sores, oozing, or scabbing',
        'Hair loss (alopecia) patterns',
        'Licking or biting at paws and belly'
      ],
      redFlags: [
        'Facial swelling, hives, or breathing difficulty (allergic emergency)',
        'Severe open wounds with foul-smelling pus',
        'Extreme distress preventing sleep or normal rest'
      ],
      vetRecommendation: 'Monitor mild symptoms at home. Schedule a veterinary checkup if itching persists beyond 3–5 days or if skin becomes raw and infected.',
      followUpQuestions: [
        'Is the itching all over the body or localized to paws, ears, or tail base?',
        'Have you noticed any fleas, ticks, or dark specks in the fur?',
        'Is there any hair loss, scabbing, or red bumps on the skin?'
      ]
    });
  }

  if (isVomiting) {
    const isMildSingle = norm.includes('once') || norm.includes('single') || norm.includes('minor');
    const isRepeated = norm.includes('repeated') || norm.includes('keeps') || norm.includes('blood') || norm.includes('water');

    const severity: SeverityLevel = isRepeated ? 'URGENT VETERINARY CARE' : isMildSingle ? 'MONITOR AT HOME' : 'VETERINARY CHECK RECOMMENDED';

    return createResult({
      symptom: 'Vomiting & Digestive Upset',
      category: 'Gastrointestinal',
      severity,
      summary: `${petContextName} has experienced vomiting. Vomiting can be caused by simple dietary indiscretion or more serious underlying gastrointestinal issues.`,
      possibleCauses: [
        'Dietary indiscretion (eating grass, garbage, or novel foods)',
        'Rapid diet change or food intolerance',
        'Ingestion of foreign object or toxic plant',
        'Gastrointestinal infection or internal parasites',
        'Pancreatitis, gastritis, or systemic illness'
      ],
      immediateFirstAid: [
        'Withhold food for 2 to 4 hours to let the stomach settle.',
        'Offer small sips of fresh water frequently to prevent dehydration.',
        'Gradually introduce a bland diet (boiled chicken breast and white rice) in small portions.',
        'Do NOT give human anti-nausea or pain medications.'
      ],
      thingsToMonitor: [
        'Frequency of vomiting over the next 12–24 hours',
        'Ability to keep water down',
        'Presence of blood, bile, or foreign material in vomit',
        'Energy levels and abdominal discomfort'
      ],
      redFlags: [
        'Repeated vomiting preventing water intake for >12 hours',
        'Blood in vomit (bright red or dark coffee-ground appearance)',
        'Swollen, hard, or painful abdomen',
        'Severe lethargy, weakness, or collapse',
        'Known ingestion of toxins (chocolate, raisins, lilies, medications)'
      ],
      vetRecommendation: isRepeated
        ? 'Urgent veterinary evaluation recommended due to repeated vomiting risk.'
        : 'Monitor closely. If vomiting recurs more than twice or continues past 24 hours, contact your veterinarian.',
      followUpQuestions: [
        'How many times has your pet vomited?',
        'Can your pet keep fresh water down?',
        'Is there any blood or foreign material in the vomit?',
        'Is your pet still alert and active?'
      ]
    });
  }

  if (isDiarrhea) {
    const isSevere = norm.includes('blood') || norm.includes('watery') || norm.includes('frequent') || norm.includes('puppy') || norm.includes('kitten');
    const severity: SeverityLevel = isSevere ? 'URGENT VETERINARY CARE' : 'VETERINARY CHECK RECOMMENDED';

    return createResult({
      symptom: 'Diarrhea / Loose Stool',
      category: 'Gastrointestinal',
      severity,
      summary: `${petContextName} is experiencing loose or watery stools. Diarrhea can lead to fluid loss and dehydration if unmanaged.`,
      possibleCauses: [
        'Dietary change, table scraps, or spoiled food',
        'Intestinal parasites (roundworms, Giardia, coccidia)',
        'Bacterial or viral gastroenteritis (e.g. Parvovirus in puppies)',
        'Stress, anxiety, or dietary allergy',
        'Inflammatory bowel disease (IBD)'
      ],
      immediateFirstAid: [
        'Ensure clean, fresh water is available at all times.',
        'Offer a bland diet of boiled lean chicken and plain white rice in small portions.',
        'Keep your pet resting in a clean, quiet environment.',
        'Do NOT give human anti-diarrheal medication without vet approval.'
      ],
      thingsToMonitor: [
        'Stool consistency, color, and frequency',
        'Signs of dehydration (sticky gums, skin tenting)',
        'Appetite and activity level',
        'Presence of blood or mucus in stool'
      ],
      redFlags: [
        'Profuse watery or bright red bloody diarrhea',
        'Black, tarry stools (melaena)',
        'Accompanying fever, vomiting, or extreme lethargy',
        'Puppy or kitten under 6 months old experiencing diarrhea'
      ],
      vetRecommendation: 'Schedule a veterinary consultation if diarrhea lasts more than 24–48 hours or contains blood.',
      followUpQuestions: [
        'What color and consistency is the stool?',
        'Is there any blood or mucus visible?',
        'Is your pet drinking water normally?',
        'Is your pet a young puppy or kitten?'
      ]
    });
  }

  if (isLimping) {
    const isSevere = norm.includes('cannot stand') || norm.includes('non weight') || norm.includes('swollen') || norm.includes('trauma');
    const severity: SeverityLevel = isSevere ? 'URGENT VETERINARY CARE' : 'VETERINARY CHECK RECOMMENDED';

    return createResult({
      symptom: 'Limping & Paw / Joint Discomfort',
      category: 'Musculoskeletal',
      severity,
      summary: `${petContextName} is demonstrating lameness or limping, indicating joint pain, muscle strain, paw pad injury, or ligament damage.`,
      possibleCauses: [
        'Paw pad wound, torn toenail, or embedded thorn/glass',
        'Soft tissue sprain or muscle strain',
        'Ligament tear (Cranial Cruciate Ligament / CCL injury)',
        'Arthritis or joint inflammation',
        'Bone fracture or joint dislocation'
      ],
      immediateFirstAid: [
        'Restrict all strenuous physical activity — enforce strict rest (no running, jumping, stairs).',
        'Carefully inspect the paw pads and between toes for thorns, burrs, cut pads, or torn nails.',
        'Do NOT manipulate or forcefully bend the leg joints.',
        'NEVER give human pain medications (Tylenol/Ibuprofen/Aspirin are toxic to pets).'
      ],
      thingsToMonitor: [
        'Ability to bear weight on the affected leg',
        'Visible swelling, heat, or joint stiffness',
        'Vocalizing, crying, or panting when moving',
        'Changes after 24 hours of rest'
      ],
      redFlags: [
        'Complete inability to bear any weight on the leg',
        'Visible limb deformity, joint dislocation, or swelling',
        'Limping resulting from major trauma (hit by car, fall)',
        'Severe pain response when touched'
      ],
      vetRecommendation: 'Keep your pet resting. If limping persists beyond 24 hours or is non-weight-bearing, seek veterinary evaluation and X-rays.',
      followUpQuestions: [
        'Which leg is your pet limping on?',
        'Can your pet put any weight on the leg when walking?',
        'Did the limping start suddenly or gradually?',
        'Have you checked the bottom of the paw for thorns or cut pads?'
      ]
    });
  }

  if (isCoughing) {
    return createResult({
      symptom: 'Coughing & Respiratory Irritation',
      category: 'Respiratory',
      severity: 'VETERINARY CHECK RECOMMENDED',
      summary: `${petContextName} has a cough or respiratory irritation. Coughing can stem from infectious agents, airway allergies, or cardiovascular issues.`,
      possibleCauses: [
        'Infectious tracheobronchitis (Kennel Cough in dogs, feline URI)',
        'Inhaled irritants, smoke, or asthma',
        'Foreign material or hairball in throat',
        'Heart disease or fluid in lungs',
        'Tracheal collapse or respiratory infection'
      ],
      immediateFirstAid: [
        'Keep your pet in a calm, temperature-controlled, well-ventilated room.',
        'Switch from a neck collar to a chest harness to avoid pressure on the windpipe.',
        'Use a humidifier or steam from a hot shower to help soothe airways.',
        'Do NOT give human cough syrups or medications.'
      ],
      thingsToMonitor: [
        'Resting breathing rate (normal is 15–30 breaths/min)',
        'Gum color (healthy pink vs pale/blue)',
        'Frequency and sound of cough (dry hacking vs wet phlegmy)',
        'Energy and appetite'
      ],
      redFlags: [
        'Difficulty breathing, gasping, or open-mouth breathing',
        'Pale, blue, or grayish gums',
        'Fever, severe lethargy, or coughing up blood/foam'
      ],
      vetRecommendation: 'Schedule a veterinary visit if the cough persists for more than 48 hours or worsens.',
      followUpQuestions: [
        'Is the cough dry and hacking or wet?',
        'Is your pet breathing normally between coughing fits?',
        'What color are your pet\'s gums?'
      ]
    });
  }

  if (isAppetite) {
    return createResult({
      symptom: 'Loss of Appetite / Refusing Food',
      category: 'Appetite & Metabolic',
      severity: 'VETERINARY CHECK RECOMMENDED',
      summary: `${petContextName} has reduced appetite or is refusing food. Prolonged inappetence requires evaluation to prevent liver and metabolic complications.`,
      possibleCauses: [
        'Dental pain, broken tooth, or oral inflammation',
        'Nausea or gastrointestinal discomfort',
        'Fever or systemic infection',
        'Stress, diet change, or unpalatable food',
        'Organ dysfunction (kidney or liver issues)'
      ],
      immediateFirstAid: [
        'Offer highly palatable, warmed food (plain boiled chicken, warm wet food).',
        'Ensure fresh water is available at all times.',
        'Gently check inside the mouth for foreign objects or red gums if safe.',
        'Do NOT force-feed unless directed by a veterinarian.'
      ],
      thingsToMonitor: [
        'Duration of food refusal (>24 hours in cats is concerning due to hepatic lipidosis risk)',
        'Water consumption',
        'Signs of nausea (drooling, lip smacking)',
        'Lethargy or weakness'
      ],
      redFlags: [
        'Complete refusal to eat for >24 hours (cats) or >48 hours (dogs)',
        'Refusal to drink water resulting in dehydration',
        'Accompanying jaundice (yellowing of gums/eyes), vomiting, or fever'
      ],
      vetRecommendation: 'Book a veterinary appointment if your pet refuses food for more than 24 hours.',
      followUpQuestions: [
        'How long has your pet refused food?',
        'Is your pet still drinking water normally?',
        'Are there signs of mouth pain or drooling?'
      ]
    });
  }

  if (isThirstUrination) {
    return createResult({
      symptom: 'Excessive Thirst & Frequent Urination',
      category: 'Renal & Urinary',
      severity: 'VETERINARY CHECK RECOMMENDED',
      summary: `${petContextName} is drinking or urinating more frequently than normal. Changes in thirst/urination can indicate metabolic or renal conditions.`,
      possibleCauses: [
        'Urinary Tract Infection (UTI) or bladder crystals',
        'Diabetes mellitus',
        'Kidney disease or renal insufficiency',
        'Cushing\'s disease or hormonal imbalance',
        'Medication side effect'
      ],
      immediateFirstAid: [
        'Provide unrestricted access to clean, fresh water.',
        'Allow frequent opportunities for urination.',
        'Do NOT restrict water intake.',
        'Collect a fresh urine sample in a clean container if visiting the vet.'
      ],
      thingsToMonitor: [
        'Whether urine flow is normal or strained',
        'Color of urine (clear, cloudy, pink, red)',
        'Daily water bowl refill frequency'
      ],
      redFlags: [
        'Straining to urinate with no urine coming out (urinary obstruction emergency)',
        'Blood in urine with crying or pain',
        'Vomiting, severe lethargy, or loss of appetite'
      ],
      vetRecommendation: 'Schedule a vet checkup with urinalysis to determine the root cause.',
      followUpQuestions: [
        'Is your pet producing urine normally or straining with no output?',
        'Is there any pink or red tinge in the urine?',
        'Has your pet\'s water drinking increased significantly?'
      ]
    });
  }

  if (isDental) {
    return createResult({
      symptom: 'Dental / Mouth Discomfort',
      category: 'Dental & Oral',
      severity: 'MONITOR AT HOME',
      summary: `${petContextName} has symptoms related to oral health or teeth. Dental issues can cause chronic discomfort and systemic bacterial inflammation.`,
      possibleCauses: [
        'Periodontal disease or tartar buildup',
        'Fractured, loose, or abscessed tooth',
        'Gingivitis or stomatitis',
        'Foreign object (stick, bone fragment) wedged in teeth',
        'Oral ulcer or growth'
      ],
      immediateFirstAid: [
        'Feed soft, moistened kibble or canned food to minimize chewing pain.',
        'Check mouth gently if safe to do so without risking a bite.',
        'Do NOT attempt to dislodge sharp objects or extract teeth manually.',
        'Avoid hard chew toys until evaluated.'
      ],
      thingsToMonitor: [
        'Swelling along the jawline or below the eye',
        'Bleeding from the mouth or reluctance to chew',
        'Drooling or dropping food while eating'
      ],
      redFlags: [
        'Facial swelling under the eye (tooth root abscess)',
        'Heavy oral bleeding or inability to close the mouth',
        'Inability to eat any food due to intense pain'
      ],
      vetRecommendation: 'Schedule a veterinary dental exam for professional evaluation and cleaning.',
      followUpQuestions: [
        'Is there facial swelling under the eye or on the jaw?',
        'Do you notice bleeding gums or broken teeth?',
        'Is your pet dropping food while chewing?'
      ]
    });
  }

  if (isEye) {
    return createResult({
      symptom: 'Eye Irritation / Discharge',
      category: 'Ocular',
      severity: 'VETERINARY CHECK RECOMMENDED',
      summary: `${petContextName} has eye irritation. Ocular symptoms should be evaluated promptly to protect corneal health and vision.`,
      possibleCauses: [
        'Corneal ulcer or scratch',
        'Conjunctivitis (bacterial or viral infection)',
        'Foreign body (dust, eyelash, seed)',
        'Allergies or dry eye syndrome (KCS)',
        'Glaucoma or uveitis'
      ],
      immediateFirstAid: [
        'Place an Elizabethan collar (E-collar) to prevent rubbing or scratching at the eye.',
        'Flush gently with sterile saline solution if dust/debris is suspected.',
        'Do NOT use human medicated eye drops (Visine/steroids can cause severe damage if an ulcer exists).',
        'Keep lighting dim to reduce photophobia.'
      ],
      thingsToMonitor: [
        'Squinting or keeping the eye tightly shut',
        'Color of discharge (clear vs yellow/green pus)',
        'Cloudiness or discoloration on the cornea',
        'Swelling around the eyelid'
      ],
      redFlags: [
        'Enlarged, bulging, or cloudy eye',
        'Sudden loss of vision or unequal pupil size',
        'Severe pain, constant squinting, or yellow pus discharge'
      ],
      vetRecommendation: 'Have a vet perform a stain test to check for corneal scratches before applying any drops.',
      followUpQuestions: [
        'Is one eye affected or both?',
        'Is your pet squinting or keeping the eye closed?',
        'What color is the discharge (clear, white, yellow, green)?'
      ]
    });
  }

  if (isEar) {
    return createResult({
      symptom: 'Ear Discomfort & Scratching',
      category: 'Otic / Ear',
      severity: 'MONITOR AT HOME',
      summary: `${petContextName} is demonstrating ear irritation. Ear infections are uncomfortable and require targeted diagnosis.`,
      possibleCauses: [
        'Yeast or bacterial ear infection (otitis externa)',
        'Ear mites (Otodectes cynotis)',
        'Allergies causing inflammation in the ear canal',
        'Foreign object (foxtail, debris) in ear canal',
        'Aural hematoma (blood swelling in ear flap)'
      ],
      immediateFirstAid: [
        'Inspect the outer ear flap and canal opening for discharge, redness, or odor.',
        'Prevent excessive head shaking to avoid bursting ear flap blood vessels.',
        'Do NOT insert cotton swabs (Q-tips) deep into the ear canal.',
        'Do NOT pour alcohol, vinegar, or hydrogen peroxide into the ear.'
      ],
      thingsToMonitor: [
        'Swelling of the ear flap (soft pillow-like hematoma)',
        'Dark brown, black, or yellowish discharge',
        'Head tilt or loss of balance'
      ],
      redFlags: [
        'Head tilt, uncoordinated walking, or flickering eyes (inner ear infection / neurological issue)',
        'Severe swelling of the ear flap (aural hematoma)',
        'Foul purulent discharge and extreme pain when touched'
      ],
      vetRecommendation: 'Schedule a vet visit for an otoscopic exam and cytology to get proper prescription ear drops.',
      followUpQuestions: [
        'Is there a strong odor or dark discharge in the ear?',
        'Is your pet tilting their head to one side?',
        'Is the ear flap swollen like a soft pillow?'
      ]
    });
  }

  if (isBleeding) {
    return createResult({
      symptom: 'Bleeding / Wound',
      category: 'Trauma & Vascular',
      severity: 'URGENT VETERINARY CARE',
      summary: `${petContextName} has a wound or bleeding. Wounds require proper cleaning and closure to prevent infection and blood loss.`,
      possibleCauses: [
        'Laceration, cut, or animal bite wound',
        'Torn toenail or paw pad injury',
        'Puncture wound or sharp object injury',
        'Ruptured skin mass or abscess'
      ],
      immediateFirstAid: [
        'Apply direct, firm pressure to external wounds using a clean cloth or gauze for 5 continuous minutes.',
        'Keep your pet calm and restricted in movement.',
        'Do NOT apply a tight tourniquet.',
        'Cover the wound loosely with a clean towel during transport.'
      ],
      thingsToMonitor: [
        'Whether bleeding stops with direct pressure',
        'Gum color (pink vs pale white)',
        'Depth of wound and swelling'
      ],
      redFlags: [
        'Continuous spurting bleeding that does not stop after 5 mins of pressure',
        'Pale, white, or blue gums',
        'Bite wounds from wild animals or unknown dogs (infection/rabies risk)',
        'Deep abdominal or chest puncture wounds'
      ],
      vetRecommendation: 'Seek urgent veterinary evaluation for wound cleaning, suturing, pain relief, and antibiotics.',
      followUpQuestions: [
        'Where on the body is the bleeding located?',
        'Does direct pressure slow down the bleeding?',
        'Are your pet\'s gums pink or pale?'
      ]
    });
  }

  if (isLethargy) {
    return createResult({
      symptom: 'Lethargy & Low Energy',
      category: 'Systemic & Energy',
      severity: 'VETERINARY CHECK RECOMMENDED',
      summary: `${petContextName} is showing lethargy and reduced energy. Lethargy is a primary sign of underlying illness, fever, or pain.`,
      possibleCauses: [
        'Fever or systemic viral/bacterial infection',
        'Dehydration or electrolyte imbalance',
        'Anemia or internal blood loss',
        'Pain, organ dysfunction, or metabolic condition'
      ],
      immediateFirstAid: [
        'Provide a warm, cushioned resting spot in a quiet area.',
        'Keep fresh water easily accessible nearby.',
        'Check gum color and feel paws/ears for heat or chill.',
        'Avoid forced activity.'
      ],
      thingsToMonitor: [
        'Ability to stand and walk',
        'Gum color (pink vs pale/white)',
        'Appetite and hydration'
      ],
      redFlags: [
        'Inability to stand up or total collapse',
        'Pale, white, or blue gums',
        'Lethargy combined with fever >39.5°C or severe hypothermia'
      ],
      vetRecommendation: 'Schedule a vet checkup if lethargy persists beyond 24 hours or is severe.',
      followUpQuestions: [
        'Can your pet stand up and walk on their own?',
        'What color are your pet\'s gums?',
        'When did you notice the drop in energy?'
      ]
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 4. DEFAULT GENERAL FALLBACK FOR UNRECOGNIZED INPUTS
  // ───────────────────────────────────────────────────────────────────────────

  return createResult({
    symptom: rawInput.trim() || 'General Health Concern',
    category: 'General Veterinary Assessment',
    severity: 'VETERINARY CHECK RECOMMENDED',
    summary: `${petContextName} is presenting with reported symptoms: "${rawInput}". Professional evaluation is recommended to determine the underlying cause.`,
    possibleCauses: [
      'Early-stage systemic or localized infection',
      'Mild metabolic or digestive variation',
      'Environmental stress or minor discomfort',
      'Non-specific pain or inflammation'
    ],
    immediateFirstAid: [
      'Provide a comfortable, quiet environment away from stressors.',
      'Ensure continuous access to fresh water.',
      'Monitor your pet closely for any changes in appetite, energy, or behavior.',
      'Avoid administering human medications or unprescribed treatments.'
    ],
    thingsToMonitor: [
      'Changes in appetite or water consumption',
      'Energy level and responsiveness',
      'Development of new symptoms (vomiting, diarrhea, limping, coughing)'
    ],
    redFlags: [
      'Difficulty breathing or open-mouth gasping',
      'Collapse, seizure, or inability to stand',
      'Pale white or blue gums',
      'Severe bleeding or severe pain'
    ],
    vetRecommendation: 'If symptoms persist or worsen over the next 24 hours, contact your veterinarian for advice.',
    followUpQuestions: [
      'When did you first notice these symptoms?',
      'Has your pet\'s appetite or water intake changed?',
      'Are there any other unusual behaviors?'
    ]
  });
}

/** Helper to construct the full TriageResult object with legacy fields */
function createResult(data: {
  symptom: string;
  category: string;
  severity: SeverityLevel;
  summary: string;
  possibleCauses: string[];
  immediateFirstAid: string[];
  thingsToMonitor: string[];
  redFlags: string[];
  vetRecommendation: string;
  followUpQuestions?: string[];
}): TriageResult {
  const careLevelMap: Record<SeverityLevel, string> = {
    'MONITOR AT HOME': 'MONITOR AT HOME',
    'VETERINARY CHECK RECOMMENDED': 'SEE VET SOON',
    'URGENT VETERINARY CARE': 'SEE VET SOON',
    'EMERGENCY': 'CRITICAL FIRST AID'
  };

  return {
    ...data,
    careLevel: careLevelMap[data.severity] || 'SEE VET SOON',
    firstAidSteps: data.immediateFirstAid,
    warningSign: data.thingsToMonitor[0] || 'Monitor for worsening symptoms.',
    treatmentPlan: data.vetRecommendation,
    nearestClinicAdvice: data.severity === 'EMERGENCY'
      ? 'Go to the nearest 24/7 emergency veterinary hospital immediately.'
      : 'Contact your regular veterinarian to schedule an evaluation.'
  };
}
