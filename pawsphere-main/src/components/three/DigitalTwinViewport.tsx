import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Animal } from '../../types/animal';
import { PetImage } from '../PetImage';
import { 
  Activity, 
  ZoomIn, 
  ZoomOut,
  Sparkles,
  Heart,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Zap,
  CheckCircle,
  ShieldCheck
} from 'lucide-react';

interface Spatial3DHealthViewerProps {
  animal: Animal;
  allAnimals: Animal[];
  onSelectAnimal: (id: string) => void;
  onOpenPassport: () => void;
  onOpenAITriage: () => void;
}

export interface SpeciesProfileConfig {
  name: string;
  defaultBpm: number;
  staminaLabel: string;
  stressLabel: string;
  primaryColor: number;
  emissiveColor: number;
  hexColor: string;
  modelPath: string;
  animations?: string[];
  diagnosticLabels?: Partial<Record<'heart' | 'stomach' | 'joints' | 'teeth' | 'skin', string>>;
  targetHeight: number;
  viewportCenterOffset: [number, number, number];
  organPins: {
    heart: [number, number, number];
    stomach: [number, number, number];
    joints: [number, number, number];
    teeth: [number, number, number];
    skin: [number, number, number];
  };
  tests: {
    food: Array<{ id: string; label: string; hrEffect: number; staminaEffect: number; anxietyEffect: number }>;
    activity: Array<{ id: string; label: string; hrEffect: number; staminaEffect: number; anxietyEffect: number }>;
    stress: Array<{ id: string; label: string; hrEffect: number; staminaEffect: number; anxietyEffect: number }>;
  };
  treatmentPlans: {
    heart: { title: string; condition: string; plan: string; nextVetCheck: string };
    stomach: { title: string; condition: string; plan: string; nextVetCheck: string };
    joints: { title: string; condition: string; plan: string; nextVetCheck: string };
    teeth: { title: string; condition: string; plan: string; nextVetCheck: string };
    skin: { title: string; condition: string; plan: string; nextVetCheck: string };
  };
}

const SPECIES_PRESENTATION: Record<string, {
  animations: string[];
  diagnosticLabels: Partial<Record<'heart' | 'stomach' | 'joints' | 'teeth' | 'skin', string>>;
}> = {
  dog: {
    animations: ['Idle', 'Walk', 'Run', 'Sit', 'Fetch', 'Tail Wag', 'Alert'],
    diagnosticLabels: { heart: 'Heart Rate', stomach: 'Respiratory', joints: 'Joints', teeth: 'Dental', skin: 'Skin & Coat' },
  },
  cat: {
    animations: ['Idle', 'Walk', 'Sit', 'Stretch', 'Groom', 'Jump', 'Tail Movement'],
    diagnosticLabels: { heart: 'Heart Rate', stomach: 'Digestive', joints: 'Joints', teeth: 'Dental', skin: 'Skin & Coat' },
  },
  bird: {
    animations: ['Idle', 'Head Movement', 'Wing Flap', 'Fly', 'Perch'],
    diagnosticLabels: { heart: 'Heart Rate', stomach: 'Respiratory', joints: 'Wing Health', teeth: 'Beak Health', skin: 'Feather Health' },
  },
  fish: {
    animations: ['Idle', 'Cruise', 'Swim Sprint', 'Turn', 'Surface Feed'],
    diagnosticLabels: { heart: 'Heart Rate', stomach: 'Gills', joints: 'Fin Health', teeth: 'Mouth Health', skin: 'Scale Health' },
  },
  reptile: {
    animations: ['Idle', 'Bask', 'Crawl', 'Climb', 'Strike'],
    diagnosticLabels: { heart: 'Heart Rate', stomach: 'Digestive', joints: 'Mobility', teeth: 'Jaw Health', skin: 'Scale Health' },
  },
  rabbit: {
    animations: ['Idle', 'Hop', 'Eat', 'Groom', 'Sprint'],
    diagnosticLabels: { heart: 'Heart Rate', stomach: 'Digestive', joints: 'Mobility', teeth: 'Dental', skin: 'Fur Health' },
  },
  horse: {
    animations: ['Idle', 'Walk', 'Trot', 'Run', 'Head Movement'],
    diagnosticLabels: { heart: 'Heart Rate', stomach: 'Respiratory', joints: 'Hoof Health', teeth: 'Mobility', skin: 'Muscle Health' },
  },
  hamster: {
    animations: ['Idle', 'Wheel Run', 'Burrow', 'Eat', 'Groom'],
    diagnosticLabels: { heart: 'Heart Rate', stomach: 'Digestive', joints: 'Mobility', teeth: 'Dental', skin: 'Fur Health' },
  },
  other: {
    animations: ['Idle', 'Explore', 'Rest'],
    diagnosticLabels: { heart: 'Heart Rate', stomach: 'Digestive', joints: 'Mobility', teeth: 'Dental', skin: 'Body Health' },
  },
};

// ─── DATA-DRIVEN SPECIES CONFIG MAPPING TO REAL GLB MODELS ──────────────────
export const SPECIES_CONFIG: Record<string, SpeciesProfileConfig> = {
  dog: {
    name: 'Canine (Dog)',
    defaultBpm: 78,
    staminaLabel: 'Muscle Stamina',
    stressLabel: 'Anxiety Index',
    primaryColor: 0x06b6d4, // Cyan
    emissiveColor: 0x0284c7,
    hexColor: '#06b6d4',
    modelPath: '/models/animals/dog.glb',
    targetHeight: 2.2,
    viewportCenterOffset: [0, -0.4, 0],
    organPins: {
      heart: [0.1, 0.4, 0.3],
      stomach: [-0.2, 0.3, -0.2],
      joints: [-0.4, -0.2, -0.4],
      teeth: [0.65, 0.6, 0],
      skin: [0, 0.5, 0],
    },
    tests: {
      food: [
        { id: 'raw', label: 'Raw Meat', hrEffect: 5, staminaEffect: 15, anxietyEffect: -5 },
        { id: 'kibble', label: 'High-Protein Kibble', hrEffect: 0, staminaEffect: 5, anxietyEffect: 0 },
        { id: 'supplement', label: 'Salmon Oil', hrEffect: -5, staminaEffect: 10, anxietyEffect: -10 },
      ],
      activity: [
        { id: 'fetch', label: 'Play Fetch', hrEffect: 35, staminaEffect: -20, anxietyEffect: -15 },
        { id: 'sprint', label: 'Agility Sprint', hrEffect: 65, staminaEffect: -45, anxietyEffect: 5 },
      ],
      stress: [
        { id: 'thunder', label: 'Thunderstorm', hrEffect: 40, staminaEffect: -15, anxietyEffect: 65 },
        { id: 'sun', label: 'Extreme Heat', hrEffect: 20, staminaEffect: -25, anxietyEffect: 20 },
      ],
    },
    treatmentPlans: {
      heart: {
        title: 'Canine Cardiovascular System',
        condition: 'Healthy strong sinus rhythm (78 BPM). Clear valve contractions.',
        plan: 'Maintain 30 min daily aerobic walks. Include Omega-3 fatty supplements.',
        nextVetCheck: 'February 2027',
      },
      stomach: {
        title: 'Canine Gastric & Digestive Tract',
        condition: 'Slight sensitivity to synthetic kibble fillers observed.',
        plan: 'Transition to grain-free raw diet blend. Add 1 tbsp Salmon Oil weekly.',
        nextVetCheck: 'September 2026',
      },
      joints: {
        title: 'Canine Hips & Locomotion',
        condition: 'Rear hip tightness common in mature retrievers and shepherds.',
        plan: 'Administer Glucosamine & Chondroitin chewables twice daily. Avoid high leaps.',
        nextVetCheck: 'October 2026',
      },
      teeth: {
        title: 'Canine Dental & Oral Cavity',
        condition: 'Minor tartar accumulation on upper molars.',
        plan: 'Manual weekly brushing and raw organic bone dental chews.',
        nextVetCheck: 'November 2026',
      },
      skin: {
        title: 'Canine Coat & Epidermis',
        condition: 'Healthy coat density; slight dry flakiness near underbelly.',
        plan: 'Brush 3 times weekly to distribute natural skin oils. Hydrate regularly.',
        nextVetCheck: 'January 2027',
      },
    },
  },

  cat: {
    name: 'Feline (Cat)',
    defaultBpm: 140,
    staminaLabel: 'Agility Reserve',
    stressLabel: 'Arousal / Stress Index',
    primaryColor: 0xa855f7, // Purple
    emissiveColor: 0x7e22ce,
    hexColor: '#a855f7',
    modelPath: '/models/animals/cat.glb',
    targetHeight: 2.1,
    viewportCenterOffset: [0, -0.35, 0],
    organPins: {
      heart: [0.1, 0.35, 0.25],
      stomach: [-0.2, 0.25, -0.2],
      joints: [-0.35, -0.15, -0.3],
      teeth: [0.55, 0.5, 0],
      skin: [0, 0.45, 0],
    },
    tests: {
      food: [
        { id: 'wet', label: 'Gourmet Wet Food', hrEffect: 5, staminaEffect: 12, anxietyEffect: -10 },
        { id: 'kibble', label: 'Dry Crunchies', hrEffect: 0, staminaEffect: 5, anxietyEffect: 0 },
        { id: 'tuna', label: 'Tuna Fillet', hrEffect: 10, staminaEffect: 20, anxietyEffect: -15 },
      ],
      activity: [
        { id: 'laser', label: 'Laser Pointer Chase', hrEffect: 45, staminaEffect: -25, anxietyEffect: -10 },
        { id: 'climb', label: 'Cat Tree Sprint', hrEffect: 55, staminaEffect: -35, anxietyEffect: 0 },
      ],
      stress: [
        { id: 'thunder', label: 'Thunder / Fireworks', hrEffect: 50, staminaEffect: -20, anxietyEffect: 70 },
        { id: 'heat', label: 'Extreme Room Heat', hrEffect: 25, staminaEffect: -30, anxietyEffect: 25 },
      ],
    },
    treatmentPlans: {
      heart: {
        title: 'Feline Cardiac Chamber',
        condition: 'Rapid feline pulse rate (140 BPM). Normal athletic contraction.',
        plan: 'Keep quiet environment after active play sessions.',
        nextVetCheck: 'March 2027',
      },
      stomach: {
        title: 'Feline Digestive System & Hairball Control',
        condition: 'Occasional hairball buildup in digestive tract.',
        plan: 'Add hairball remedy paste twice weekly. Ensure fresh running water fountain.',
        nextVetCheck: 'August 2026',
      },
      joints: {
        title: 'Feline Spine & Hind Joints',
        condition: 'Excellent lumbar flexibility and jumping impact absorption.',
        plan: 'Provide soft climbing pads and scratching posts.',
        nextVetCheck: 'December 2026',
      },
      teeth: {
        title: 'Feline Fangs & Gingiva',
        condition: 'Clean canine teeth with healthy pink gums.',
        plan: 'Provide enzymatic dental treats daily.',
        nextVetCheck: 'October 2026',
      },
      skin: {
        title: 'Feline Fur & Whiskers',
        condition: 'Glossy coat with responsive tactical whiskers.',
        plan: 'Daily grooming with fine stainless-steel comb.',
        nextVetCheck: 'January 2027',
      },
    },
  },

  bird: {
    name: 'Avian (Bird)',
    defaultBpm: 280,
    staminaLabel: 'Flight Stamina',
    stressLabel: 'Environmental Stress',
    primaryColor: 0x10b981, // Emerald Green
    emissiveColor: 0x047857,
    hexColor: '#10b981',
    modelPath: '/models/animals/bird.glb',
    targetHeight: 2.0,
    viewportCenterOffset: [0, -0.2, 0],
    organPins: {
      heart: [0, 0.3, 0.15],
      stomach: [-0.1, 0.1, -0.1],
      joints: [0.4, 0.2, 0],
      teeth: [0.45, 0.5, 0],
      skin: [0, 0.4, 0],
    },
    tests: {
      food: [
        { id: 'seeds', label: 'Fortified Seed Mix', hrEffect: 5, staminaEffect: 10, anxietyEffect: -5 },
        { id: 'pellets', label: 'Organic Pellets', hrEffect: 0, staminaEffect: 15, anxietyEffect: 0 },
        { id: 'fruit', label: 'Fresh Papaya & Berries', hrEffect: 15, staminaEffect: 25, anxietyEffect: -15 },
      ],
      activity: [
        { id: 'wing', label: 'Wing Flap Workout', hrEffect: 50, staminaEffect: -30, anxietyEffect: -20 },
        { id: 'perch', label: 'Perch Balance & Climb', hrEffect: 25, staminaEffect: -15, anxietyEffect: -5 },
      ],
      stress: [
        { id: 'noise', label: 'Loud Household Noise', hrEffect: 60, staminaEffect: -20, anxietyEffect: 75 },
        { id: 'draft', label: 'Cold Window Draft', hrEffect: 35, staminaEffect: -35, anxietyEffect: 40 },
      ],
    },
    treatmentPlans: {
      heart: {
        title: 'Avian High-Speed Cardiovascular Engine',
        condition: 'Rapid rapid avian pulse (280 BPM). Excellent oxygen transport.',
        plan: 'Ensure adequate flight space and draft-free roosting environment.',
        nextVetCheck: 'May 2027',
      },
      stomach: {
        title: 'Avian Crop & Gizzard Digestor',
        condition: 'Efficient seed breakdown; crop motility normal.',
        plan: 'Provide fresh insoluble grit and clean water daily.',
        nextVetCheck: 'September 2026',
      },
      joints: {
        title: 'Avian Perching Feet & Wing Joints',
        condition: 'Strong perch grip and flexible wing humerus joints.',
        plan: 'Use varied natural wood perch diameters to prevent bumblefoot.',
        nextVetCheck: 'November 2026',
      },
      teeth: {
        title: 'Avian Beak & Keratin Structure',
        condition: 'Beak length symmetrical with healthy keratin alignment.',
        plan: 'Provide cuttlebone and mineral block chews.',
        nextVetCheck: 'December 2026',
      },
      skin: {
        title: 'Avian Plumage & Preen Gland',
        condition: 'Bright feather luster; healthy molting cycle.',
        plan: 'Offer tepid misting baths 3 times weekly.',
        nextVetCheck: 'February 2027',
      },
    },
  },

  fish: {
    name: 'Aquatic (Fish)',
    defaultBpm: 100,
    staminaLabel: 'Swimming Hydro-Stamina',
    stressLabel: 'Water Stress Index',
    primaryColor: 0xf97316, // Golden Orange
    emissiveColor: 0xc2410c,
    hexColor: '#f97316',
    modelPath: '/models/animals/fish.glb',
    targetHeight: 2.1,
    viewportCenterOffset: [0, 0, 0],
    organPins: {
      heart: [0.1, 0.1, 0.2],
      stomach: [-0.2, 0, -0.1],
      joints: [0.3, 0.2, 0.1],
      teeth: [0.5, 0.15, 0],
      skin: [0, 0.2, 0],
    },
    tests: {
      food: [
        { id: 'flakes', label: 'High-Protein Flakes', hrEffect: 5, staminaEffect: 10, anxietyEffect: -5 },
        { id: 'pellets', label: 'Sinking Pellets', hrEffect: 0, staminaEffect: 15, anxietyEffect: 0 },
        { id: 'shrimp', label: 'Live Brine Shrimp', hrEffect: 15, staminaEffect: 25, anxietyEffect: -10 },
      ],
      activity: [
        { id: 'swim', label: 'Current Swim Sprint', hrEffect: 35, staminaEffect: -25, anxietyEffect: -10 },
        { id: 'endurance', label: 'Deep Tank Navigation', hrEffect: 20, staminaEffect: -15, anxietyEffect: -5 },
      ],
      stress: [
        { id: 'temp', label: 'Water Temp Fluctuations', hrEffect: 45, staminaEffect: -40, anxietyEffect: 60 },
        { id: 'ph', label: 'pH Balance Shift', hrEffect: 55, staminaEffect: -50, anxietyEffect: 70 },
      ],
    },
    treatmentPlans: {
      heart: {
        title: 'Aquatic Circulation & Gill Aeration',
        condition: 'Rhythmic operculum gill movement with steady aquatic circulation.',
        plan: 'Maintain dissolved oxygen levels above 6.5 mg/L via air pump.',
        nextVetCheck: 'June 2027',
      },
      stomach: {
        title: 'Aquatic Digestive Tract',
        condition: 'No swim bladder bloat; feeding response sharp.',
        plan: 'Avoid overfeeding; fast 1 day per week for clear digestion.',
        nextVetCheck: 'October 2026',
      },
      joints: {
        title: 'Aquatic Lateral Line & Fin Rays',
        condition: 'Clear fin ray membrane with responsive lateral line sensing.',
        plan: 'Maintain clean water flow without aggressive current.',
        nextVetCheck: 'December 2026',
      },
      teeth: {
        title: 'Aquatic Mouth & Operculum Gills',
        condition: 'Clean pink gill filaments with no parasite fraying.',
        plan: 'Perform 25% weekly water changes with conditioned water.',
        nextVetCheck: 'November 2026',
      },
      skin: {
        title: 'Aquatic Scales & Slime Coat',
        condition: 'Intact mucous protective slime coat.',
        plan: 'Add water conditioner with Aloe Vera during water changes.',
        nextVetCheck: 'January 2027',
      },
    },
  },

  rabbit: {
    name: 'Lagomorph (Rabbit)',
    defaultBpm: 210,
    staminaLabel: 'Hop & Agility Reserve',
    stressLabel: 'Startle & Anxiety Index',
    primaryColor: 0x38bdf8, // Ice Blue
    emissiveColor: 0x0284c7,
    hexColor: '#38bdf8',
    modelPath: '/models/animals/rabbit.glb',
    targetHeight: 2.0,
    viewportCenterOffset: [0, -0.3, 0],
    organPins: {
      heart: [0.1, 0.3, 0.2],
      stomach: [-0.2, 0.2, -0.2],
      joints: [-0.35, -0.1, -0.3],
      teeth: [0.45, 0.45, 0],
      skin: [0, 0.4, 0],
    },
    tests: {
      food: [
        { id: 'hay', label: 'Timothy Hay', hrEffect: -5, staminaEffect: 20, anxietyEffect: -10 },
        { id: 'pellets', label: 'Fiber Pellets', hrEffect: 0, staminaEffect: 10, anxietyEffect: 0 },
        { id: 'carrot', label: 'Fresh Carrot Treat', hrEffect: 10, staminaEffect: 15, anxietyEffect: -5 },
      ],
      activity: [
        { id: 'tunnel', label: 'Tunnel Run', hrEffect: 40, staminaEffect: -25, anxietyEffect: -15 },
        { id: 'hop', label: 'Binky & Hop Sprint', hrEffect: 60, staminaEffect: -40, anxietyEffect: -20 },
      ],
      stress: [
        { id: 'noise', label: 'Sudden Loud Noise', hrEffect: 65, staminaEffect: -20, anxietyEffect: 80 },
        { id: 'heat', label: 'Heat Wave', hrEffect: 35, staminaEffect: -35, anxietyEffect: 45 },
      ],
    },
    treatmentPlans: {
      heart: {
        title: 'Lagomorph Cardiac Pulse',
        condition: 'Rapid alert rabbit heartbeat (210 BPM). Normal vascular tone.',
        plan: 'Provide quiet, sheltered hidey-boxes to keep stress low.',
        nextVetCheck: 'April 2027',
      },
      stomach: {
        title: 'Lagomorph Cecal Digestive Chamber',
        condition: 'Active cecotrophe digestion; GI tract motility normal.',
        plan: 'Provide 80% Timothy Hay daily diet for continuous digestive health.',
        nextVetCheck: 'September 2026',
      },
      joints: {
        title: 'Lagomorph Rear Hock & Spine',
        condition: 'Strong rear leg flexors; no sore hocks observed.',
        plan: 'Provide soft rug surfaces and padded enclosures.',
        nextVetCheck: 'November 2026',
      },
      teeth: {
        title: 'Lagomorph Open-Rooted Incisors',
        condition: 'Symmetrical tooth alignment; healthy wear pattern.',
        plan: 'Provide wooden chew toys and apple tree branches.',
        nextVetCheck: 'October 2026',
      },
      skin: {
        title: 'Lagomorph Soft Fur Coat',
        condition: 'Dense fur with no shedding dandruff spots.',
        plan: 'Groom gently twice weekly with soft brush.',
        nextVetCheck: 'January 2027',
      },
    },
  },

  horse: {
    name: 'Equine (Horse)',
    defaultBpm: 36,
    staminaLabel: 'Equine Endurance',
    stressLabel: 'Spook & Stress Index',
    primaryColor: 0x0284c7, // Electric Blue
    emissiveColor: 0x0369a1,
    hexColor: '#0284c7',
    modelPath: '/models/animals/horse.glb',
    targetHeight: 2.4,
    viewportCenterOffset: [0, -0.6, 0],
    organPins: {
      heart: [0.1, 0.7, 0.4],
      stomach: [-0.2, 0.6, -0.3],
      joints: [-0.5, -0.4, -0.6],
      teeth: [0.85, 0.9, 0],
      skin: [0, 0.8, 0],
    },
    tests: {
      food: [
        { id: 'hay', label: 'Alfalfa Hay', hrEffect: 2, staminaEffect: 20, anxietyEffect: -5 },
        { id: 'oats', label: 'Fortified Oats', hrEffect: 5, staminaEffect: 25, anxietyEffect: 0 },
        { id: 'apple', label: 'Fresh Apple & Carrots', hrEffect: 8, staminaEffect: 15, anxietyEffect: -10 },
      ],
      activity: [
        { id: 'trot', label: 'Paddock Trot', hrEffect: 25, staminaEffect: -20, anxietyEffect: -10 },
        { id: 'gallop', label: 'Full Gallop Sprint', hrEffect: 55, staminaEffect: -50, anxietyEffect: 5 },
      ],
      stress: [
        { id: 'thunder', label: 'Storm & Lightning', hrEffect: 35, staminaEffect: -15, anxietyEffect: 65 },
        { id: 'trailer', label: 'Trailer Transport', hrEffect: 25, staminaEffect: -25, anxietyEffect: 45 },
      ],
    },
    treatmentPlans: {
      heart: {
        title: 'Equine Athletic Cardiovascular Engine',
        condition: 'Low resting pulse rate (36 BPM). Massive stroke volume.',
        plan: 'Warm up thoroughly before high-intensity trotting or galloping.',
        nextVetCheck: 'March 2027',
      },
      stomach: {
        title: 'Equine Hindgut Digestor',
        condition: 'Healthy gut sounds in all four quadrants.',
        plan: 'Provide continuous forage hay to prevent stomach ulcers.',
        nextVetCheck: 'September 2026',
      },
      joints: {
        title: 'Equine Fetlock & Stifle Joints',
        condition: 'Clear leg tendons with clean hoof balance.',
        plan: 'Schedule farrier trimming every 6 weeks.',
        nextVetCheck: 'October 2026',
      },
      teeth: {
        title: 'Equine Dental Molars',
        condition: 'Good molar grinding surfaces.',
        plan: 'Schedule annual veterinary dental floating.',
        nextVetCheck: 'December 2026',
      },
      skin: {
        title: 'Equine Mane, Tail & Coat',
        condition: 'Glossy coat with intact mane hair follicles.',
        plan: 'Curry-comb daily and wash with equine coat shampoo.',
        nextVetCheck: 'January 2027',
      },
    },
  },

  turtle: {
    name: 'Chelonian (Turtle)',
    defaultBpm: 40,
    staminaLabel: 'Shell Integrity & Reserve',
    stressLabel: 'Environmental Cold Index',
    primaryColor: 0x84cc16, // Forest Green
    emissiveColor: 0x4d7c0f,
    hexColor: '#84cc16',
    modelPath: '/models/animals/turtle.glb',
    targetHeight: 1.9,
    viewportCenterOffset: [0, -0.3, 0],
    organPins: {
      heart: [0, 0.2, 0.1],
      stomach: [-0.2, 0.1, -0.1],
      joints: [-0.45, -0.1, -0.2],
      teeth: [0.55, 0.25, 0],
      skin: [0, 0.3, 0],
    },
    tests: {
      food: [
        { id: 'pellets', label: 'Aquatic Turtle Pellets', hrEffect: 2, staminaEffect: 15, anxietyEffect: -5 },
        { id: 'greens', label: 'Dandelion Greens', hrEffect: 0, staminaEffect: 10, anxietyEffect: 0 },
        { id: 'worms', label: 'Dried Mealworms', hrEffect: 5, staminaEffect: 20, anxietyEffect: -5 },
      ],
      activity: [
        { id: 'swim', label: 'Basking Platform Climb', hrEffect: 15, staminaEffect: -15, anxietyEffect: -10 },
        { id: 'sprint', label: 'Underwater Swim Sprint', hrEffect: 25, staminaEffect: -30, anxietyEffect: -5 },
      ],
      stress: [
        { id: 'cold', label: 'Water Temp Drop', hrEffect: -15, staminaEffect: -40, anxietyEffect: 50 },
        { id: 'uv', label: 'Missing UVB Light', hrEffect: -10, staminaEffect: -35, anxietyEffect: 40 },
      ],
    },
    treatmentPlans: {
      heart: {
        title: 'Chelonian Ectothermic Heart',
        condition: 'Stable low-frequency reptilian pulse (40 BPM).',
        plan: 'Maintain water temperature at 25-27°C for steady metabolic heart rate.',
        nextVetCheck: 'July 2027',
      },
      stomach: {
        title: 'Chelonian Slow Gastrointestinal Tract',
        condition: 'Good appetite; digestion pace normal for species.',
        plan: 'Dust food with Calcium + D3 twice weekly.',
        nextVetCheck: 'November 2026',
      },
      joints: {
        title: 'Chelonian Flipper Limbs & Claws',
        condition: 'Strong claw flexors for basking rock climbing.',
        plan: 'Provide gradual non-slip basking ramp.',
        nextVetCheck: 'October 2026',
      },
      teeth: {
        title: 'Chelonian Jaw Beak Sheath',
        condition: 'Clean beak trim; no overgrown jaw edges.',
        plan: 'Provide cuttlebone blocks for natural beak trimming.',
        nextVetCheck: 'December 2026',
      },
      skin: {
        title: 'Chelonian Carapace & Plastron Shell',
        condition: 'Hard scutes with zero pyramid softness.',
        plan: 'Provide 10-12 hours daily high-output UVB lighting.',
        nextVetCheck: 'January 2027',
      },
    },
  },

  snake: {
    name: 'Serpent (Snake)',
    defaultBpm: 60,
    staminaLabel: 'Muscle Constriction Energy',
    stressLabel: 'Shedding & Stress Index',
    primaryColor: 0xef4444, // Crimson Red
    emissiveColor: 0xb91c1c,
    hexColor: '#ef4444',
    modelPath: '/models/animals/snake.glb',
    targetHeight: 1.9,
    viewportCenterOffset: [0, -0.2, 0],
    organPins: {
      heart: [0.2, 0.25, 0.3],
      stomach: [0, 0.15, 0],
      joints: [-0.3, 0.1, -0.3],
      teeth: [0.55, 0.35, 0.4],
      skin: [0, 0.2, 0],
    },
    tests: {
      food: [
        { id: 'rodent', label: 'Thawed Feeder Prey', hrEffect: 10, staminaEffect: 25, anxietyEffect: -10 },
        { id: 'supplement', label: 'Vitamin Mineral Dust', hrEffect: 0, staminaEffect: 10, anxietyEffect: 0 },
      ],
      activity: [
        { id: 'climb', label: 'Branch Climbing Test', hrEffect: 30, staminaEffect: -25, anxietyEffect: -10 },
        { id: 'slither', label: 'Enclosure Slither Sprint', hrEffect: 20, staminaEffect: -15, anxietyEffect: -5 },
      ],
      stress: [
        { id: 'humidity', label: 'Low Enclosure Humidity', hrEffect: 25, staminaEffect: -30, anxietyEffect: 55 },
        { id: 'handling', label: 'Excessive Handling', hrEffect: 35, staminaEffect: -20, anxietyEffect: 65 },
      ],
    },
    treatmentPlans: {
      heart: {
        title: 'Serpentine Linear Cardiovascular Loop',
        condition: 'Rhythmic vascular pulsation (60 BPM).',
        plan: 'Maintain thermal gradient (28-32°C warm side).',
        nextVetCheck: 'August 2027',
      },
      stomach: {
        title: 'Serpentine Gastric Digestion',
        condition: 'Full digestive breakdown of recent feeder prey.',
        plan: 'Leave undisturbed for 48 hours after feeding.',
        nextVetCheck: 'September 2026',
      },
      joints: {
        title: 'Serpentine Vertebral Column',
        condition: 'Extremely flexible 200+ vertebrae alignment.',
        plan: 'Provide climbing perches and smooth rock substrate.',
        nextVetCheck: 'December 2026',
      },
      teeth: {
        title: 'Serpentine Jaws & Vomeronasal Organ',
        condition: 'Responsive scent flicking tongue and clean jaw hinge.',
        plan: 'Ensure clean drinking water bowl large enough for soaking.',
        nextVetCheck: 'November 2026',
      },
      skin: {
        title: 'Serpentine Epidermal Scales',
        condition: 'Smooth scales; complete single-piece ecdysis shed.',
        plan: 'Maintain 60-70% humidity during shedding cycles.',
        nextVetCheck: 'January 2027',
      },
    },
  },

  hamster: {
    name: 'Rodent (Hamster)',
    defaultBpm: 360,
    staminaLabel: 'Wheel Stamina',
    stressLabel: 'Hyper-Alertness Index',
    primaryColor: 0xeab308, // Warm Yellow
    emissiveColor: 0xca8a04,
    hexColor: '#eab308',
    modelPath: '/models/animals/hamster.glb',
    targetHeight: 1.8,
    viewportCenterOffset: [0, -0.2, 0],
    organPins: {
      heart: [0.05, 0.25, 0.15],
      stomach: [-0.15, 0.15, -0.15],
      joints: [-0.25, -0.1, -0.2],
      teeth: [0.35, 0.35, 0],
      skin: [0, 0.3, 0],
    },
    tests: {
      food: [
        { id: 'seeds', label: 'Lab-Grade Seed Mix', hrEffect: 10, staminaEffect: 15, anxietyEffect: -5 },
        { id: 'mealworms', label: 'Dried Mealworms', hrEffect: 15, staminaEffect: 25, anxietyEffect: -10 },
      ],
      activity: [
        { id: 'wheel', label: 'Silent Wheel Marathon', hrEffect: 80, staminaEffect: -40, anxietyEffect: -25 },
        { id: 'burrow', label: 'Bedding Burrowing', hrEffect: 40, staminaEffect: -20, anxietyEffect: -15 },
      ],
      stress: [
        { id: 'light', label: 'Sudden Bright Light', hrEffect: 90, staminaEffect: -30, anxietyEffect: 85 },
        { id: 'noise', label: 'High Frequency Noise', hrEffect: 70, staminaEffect: -25, anxietyEffect: 75 },
      ],
    },
    treatmentPlans: {
      heart: {
        title: 'Hamster High-Metabolism Pulse',
        condition: 'Hyper-fast hamster heart rate (360 BPM). Energetic metabolism.',
        plan: 'Provide uninterrupted nocturnal sleeping hours.',
        nextVetCheck: 'June 2027',
      },
      stomach: {
        title: 'Hamster Cheek Pouches & Gastric System',
        condition: 'Clean cheek pouches; no impacted food items.',
        plan: 'Check cheek pouches weekly; feed high-fiber seed pelleted diet.',
        nextVetCheck: 'September 2026',
      },
      joints: {
        title: 'Hamster Paws & Pacing Joints',
        condition: 'Nimble paw flexors for seed handling.',
        plan: 'Provide solid-surface exercise wheel (no mesh wire).',
        nextVetCheck: 'October 2026',
      },
      teeth: {
        title: 'Hamster Incisor Chisels',
        condition: 'Symmetrical orange enamel incisors.',
        plan: 'Provide wooden chew blocks and pumice stones.',
        nextVetCheck: 'November 2026',
      },
      skin: {
        title: 'Hamster Fur & Scent Glands',
        condition: 'Fluffy fur coat; clean lateral scent glands.',
        plan: 'Provide daily sand bath dish for natural coat degreasing.',
        nextVetCheck: 'January 2027',
      },
    },
  },
};

const FALLBACK_SPECIES_CONFIG: SpeciesProfileConfig = SPECIES_CONFIG.dog;

export const DigitalTwinViewport: React.FC<Spatial3DHealthViewerProps> = ({
  animal,
  allAnimals,
  onSelectAnimal,
  onOpenPassport,
  onOpenAITriage
}) => {
  if (!animal) {
    return (
      <div className="p-12 text-center space-y-4 glass-panel-dark rounded-3xl border border-cyan-500/30 max-w-lg mx-auto my-12 selection:bg-brand-solidOrange">
        <div className="w-16 h-16 rounded-full bg-cyan-950/80 border border-cyan-400 text-cyan-400 mx-auto flex items-center justify-center animate-pulse">
          <Activity className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-extrabold text-white glow-text-cyan uppercase">NO ACTIVE PET SELECTED</h3>
        <p className="text-xs text-slate-300">
          Please register or select a pet companion to activate the 3D Digital Twin scanning chamber.
        </p>
      </div>
    );
  }

  const speciesKey = (animal.species || 'dog').toLowerCase();
  const config: SpeciesProfileConfig = SPECIES_CONFIG[speciesKey] || FALLBACK_SPECIES_CONFIG;
  const presentation = SPECIES_PRESENTATION[speciesKey] || SPECIES_PRESENTATION.other;

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Holographic Scanner Loader States
  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(true);
  const [modelError, setModelError] = useState<string | null>(null);
  const [modelNotice, setModelNotice] = useState<string | null>(null);
  const [transitionText, setTransitionText] = useState<string>('SYNCING PET PROFILE...');

  // Camera & Rotation Controls
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [rotationDirection, setRotationDirection] = useState<1 | -1>(1);

  // Mouse / Touch Dragging States
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number>(0);

  // Active Biometric Diagnostic Region
  const [selectedRegion, setSelectedRegion] = useState<'heart' | 'stomach' | 'joints' | 'teeth' | 'skin'>('heart');

  // Reactivity Test Bench States
  const [selectedFoodId, setSelectedFoodId] = useState<string>('none');
  const [selectedActivityId, setSelectedActivityId] = useState<string>('none');
  const [selectedStressId, setSelectedStressId] = useState<string>('none');
  const [selectedAnimation, setSelectedAnimation] = useState<string>(presentation.animations[0]);

  // Vitals Telemetry
  const [currentBpm, setCurrentBpm] = useState<number>(config.defaultBpm);
  const [staminaPercent, setStaminaPercent] = useState<number>(90);
  const [stressPercent, setStressPercent] = useState<number>(10);
  const zoomRef = useRef(zoomLevel);
  const autoRotateRef = useRef(isAutoRotating);
  const draggingRef = useRef(isDragging);
  const rotationDirectionRef = useRef(rotationDirection);
  const selectedAnimationRef = useRef(selectedAnimation);

  zoomRef.current = zoomLevel;
  autoRotateRef.current = isAutoRotating;
  draggingRef.current = isDragging;
  rotationDirectionRef.current = rotationDirection;
  selectedAnimationRef.current = selectedAnimation;

  // Trigger Dissolve & Materialize Sequence on Pet / Species Change
  useEffect(() => {
    setIsLoadingModel(true);
    setModelError(null);
    setModelNotice(null);
    setTransitionText('Synchronizing Digital Twin...');

    const timer1 = setTimeout(() => setTransitionText(`Loading ${animal.breed || animal.species}...`), 400);
    const timer2 = setTimeout(() => setTransitionText('Calibrating species biometrics...'), 800);

    setSelectedFoodId('none');
    setSelectedActivityId('none');
    setSelectedStressId('none');
    setSelectedAnimation(presentation.animations[0]);
    setCurrentBpm(config.defaultBpm);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [animal.id, animal.species]);

  // Recalculate Vitals based on Reactivity Test Bench
  useEffect(() => {
    let hr = config.defaultBpm;
    let stam = 90;
    let stress = 10;

    const activeFood = config.tests.food.find(f => f.id === selectedFoodId);
    if (activeFood) {
      hr += activeFood.hrEffect;
      stam += activeFood.staminaEffect;
      stress += activeFood.anxietyEffect;
    }

    const activeAct = config.tests.activity.find(a => a.id === selectedActivityId);
    if (activeAct) {
      hr += activeAct.hrEffect;
      stam += activeAct.staminaEffect;
      stress += activeAct.anxietyEffect;
    }

    const activeStress = config.tests.stress.find(s => s.id === selectedStressId);
    if (activeStress) {
      hr += activeStress.hrEffect;
      stam += activeStress.staminaEffect;
      stress += activeStress.anxietyEffect;
    }

    setCurrentBpm(Math.max(20, Math.min(500, hr)));
    setStaminaPercent(Math.max(0, Math.min(100, stam)));
    setStressPercent(Math.max(0, Math.min(100, stress)));
  }, [selectedFoodId, selectedActivityId, selectedStressId, config]);

  // Create a deterministic placeholder when a species asset cannot be fetched.
  const createFallbackModel = (species: string, color: number): THREE.Group => {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.35, transparent: true, opacity: 0.88 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.7, 20, 14), material);
    group.add(body);
    if (species === 'bird') {
      const wing = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 10), material);
      wing.scale.set(1.5, 0.25, 0.8);
      wing.position.x = 0.55;
      group.add(wing);
    } else if (species === 'horse' || species === 'dog' || species === 'cat' || species === 'rabbit') {
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), material);
      head.position.set(0.65, 0.35, 0);
      group.add(head);
      for (const x of [-0.4, 0.4]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.8, 12), material);
        leg.position.set(x, -0.65, 0);
        group.add(leg);
      }
    }
    return group;
  };

  // THREE.JS model lifecycle: one fetch/parse per pet, with cancellation and disposal.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer Setup
    const scene = new THREE.Scene();
    const width = container.clientWidth || 700;
    const height = container.clientHeight || 450;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.5 / zoomLevel);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.appendChild(renderer.domElement);

    // 2. Volumetric Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const mainPointLight = new THREE.PointLight(config.primaryColor, 3.5, 12);
    mainPointLight.position.set(2, 3, 2);
    scene.add(mainPointLight);

    const rimSpotLight = new THREE.SpotLight(config.emissiveColor, 2.5, 10, Math.PI / 4, 0.5);
    rimSpotLight.position.set(-2, 3, -2);
    scene.add(rimSpotLight);

    // 3. Multi-Tiered Holographic Platform Base
    const platformGeo = new THREE.RingGeometry(0.8, 1.4, 32);
    const platformMat = new THREE.MeshBasicMaterial({
      color: config.primaryColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
      wireframe: true,
    });
    const platformMesh = new THREE.Mesh(platformGeo, platformMat);
    platformMesh.rotation.x = Math.PI / 2;
    platformMesh.position.set(0, -1.2, 0);
    scene.add(platformMesh);

    // 4. Fetch GLB Binary ArrayBuffer & Parse via GLTFLoader
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    const loader = new GLTFLoader();
    let disposed = false;
    let animId: number;
    const clock = new THREE.Clock();
    let mixer: THREE.AnimationMixer | null = null;
    let motionObject: THREE.Object3D | null = null;
    let motionBasePosition = new THREE.Vector3();

    const disposeObject = (object: THREE.Object3D) => {
      object.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        child.geometry.dispose();
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach(material => material.dispose());
      });
    };

    const addFallback = () => {
      if (disposed) return;
      motionObject = createFallbackModel(speciesKey, config.primaryColor);
      motionBasePosition.copy(motionObject.position);
      modelGroup.add(motionObject);
      setModelNotice('3D model unavailable - showing species fallback.');
      setIsLoadingModel(false);
    };

    fetch(config.modelPath)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.arrayBuffer();
      })
      .then(arrayBuffer => {
        if (disposed) return;
        loader.parse(
          arrayBuffer,
          '',
          (gltf) => {
            if (disposed) {
              disposeObject(gltf.scene);
              return;
            }
            const loadedSceneObject = gltf.scene;
            motionObject = loadedSceneObject;
            motionBasePosition.copy(loadedSceneObject.position);
            if (gltf.animations.length > 0) {
              mixer = new THREE.AnimationMixer(loadedSceneObject);
              mixer.clipAction(gltf.animations[0]).play();
            }

            // Bounding Box Calculation & Scale Normalization to 50-65% of viewport
            const bbox = new THREE.Box3().setFromObject(loadedSceneObject);
            const size = bbox.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z) || 1.0;
            const scaleFactor = (config.targetHeight / maxDim);
            
            loadedSceneObject.scale.set(scaleFactor, scaleFactor, scaleFactor);

            // Center Model
            const center = bbox.getCenter(new THREE.Vector3());
            loadedSceneObject.position.set(-center.x * scaleFactor, -center.y * scaleFactor, -center.z * scaleFactor);

            // Holographic Shader Layering
            const holoMaterial = new THREE.MeshStandardMaterial({
              color: config.primaryColor,
              emissive: config.emissiveColor,
              emissiveIntensity: 0.6,
              roughness: 0.2,
              metalness: 0.8,
              transparent: true,
              opacity: 0.88,
            });

            const wireframeMaterial = new THREE.MeshBasicMaterial({
              color: config.primaryColor,
              wireframe: true,
              transparent: true,
              opacity: 0.25,
            });

            const meshes: THREE.Mesh[] = [];
            loadedSceneObject.traverse((child) => {
              if (child instanceof THREE.Mesh) meshes.push(child);
            });
            meshes.forEach((mesh) => {
              mesh.material = holoMaterial;
              const wireframeMesh = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), wireframeMaterial);
              mesh.add(wireframeMesh);
            });

            modelGroup.add(loadedSceneObject);

            // Attached Organ Marker Sphere
            const pinPinPos = config.organPins[selectedRegion] || [0, 0, 0];
            const organMarkerGeo = new THREE.SphereGeometry(0.12, 16, 16);
            const organMarkerMat = new THREE.MeshBasicMaterial({
              color: selectedRegion === 'heart' ? 0xef4444 : config.primaryColor,
              wireframe: true,
            });
            const organMarkerMesh = new THREE.Mesh(organMarkerGeo, organMarkerMat);
            organMarkerMesh.position.set(...pinPinPos);
            modelGroup.add(organMarkerMesh);

            setIsLoadingModel(false);
          },
          (error) => {
            console.error('Error parsing GLTF binary buffer:', error);
            addFallback();
          }
        );
      })
      .catch(err => {
        console.error('Error fetching GLB file:', err);
        addFallback();
      });

    // 5. Render & Animation Loop
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      mixer?.update(delta);

      // Continuous 360° Rotation on the Model Group
      if (autoRotateRef.current && !draggingRef.current) {
        modelGroup.rotation.y += delta * 0.5 * rotationDirectionRef.current;
      }

      if (motionObject && !mixer) {
        const animation = selectedAnimationRef.current.toLowerCase();
        const phase = clock.elapsedTime;
        const motionAmount = speciesKey === 'bird' ? 0.035 : speciesKey === 'fish' ? 0.025 : speciesKey === 'rabbit' ? 0.03 : 0.015;
        motionObject.position.y = motionBasePosition.y + Math.sin(phase * (animation.includes('run') || animation.includes('sprint') || animation.includes('fly') ? 4 : 2)) * motionAmount;
        if (speciesKey === 'bird' || speciesKey === 'fish') {
          motionObject.rotation.z = Math.sin(phase * 2) * motionAmount;
        } else if (animation.includes('head') || animation.includes('stretch') || animation.includes('groom')) {
          motionObject.rotation.x = Math.sin(phase * 2) * motionAmount;
        }
      }

      // Camera distance interpolation based on zoomLevel
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 4.5 / zoomRef.current, 0.1);

      renderer.render(scene, camera);
    };

    animate();

    // 6. Memory & Renderer Cleanup
    return () => {
      disposed = true;
      cancelAnimationFrame(animId);
      modelGroup.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
          child.geometry.dispose();
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach(material => material.dispose());
        }
      });
      renderer.dispose();
      scene.clear();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [
    animal.id,
    speciesKey,
    config.modelPath,
    config.targetHeight,
    config.primaryColor,
    config.emissiveColor,
    presentation.animations
  ]);

  // Mouse / Touch Drag Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX;
    setDragStartX(e.clientX);
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel Zoom Handler
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY < 0) {
      setZoomLevel(prev => Math.min(prev + 0.1, 1.5));
    } else {
      setZoomLevel(prev => Math.max(prev - 0.1, 0.6));
    }
  };

  const handleResetControls = () => {
    setZoomLevel(1.0);
    setIsAutoRotating(true);
    setRotationDirection(1);
  };

  const activeTreatmentPlan = config.treatmentPlans[selectedRegion];

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-xs font-semibold text-slate-100 selection:bg-brand-solidOrange">
      
      {/* ACTIVE PET HEADER & IDENTITY BANNER */}
      <div className="glass-panel-dark rounded-3xl p-5 border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <PetImage
            pet={animal}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] shrink-0"
          />
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-400/40 inline-flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>{config.name.toUpperCase()} DIGITAL TWIN</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 font-mono">ID: {animal.id.slice(0, 10)}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white glow-text-cyan uppercase">
              {animal.name}
            </h2>
            <p className="text-xs text-cyan-200 font-semibold">
              {animal.breed} • {animal.ageYears} Years Old • {animal.weightKg} kg
            </p>
          </div>
        </div>

        {/* Pet Switcher Dropdown */}
        <div className="flex items-center space-x-3 shrink-0">
          <label className="text-xs font-extrabold text-cyan-300 uppercase tracking-wider hidden sm:inline">
            Active Companion:
          </label>
          <select
            value={animal.id}
            onChange={(e) => onSelectAnimal(e.target.value)}
            className="bg-[#091122] border-2 border-cyan-500/50 text-cyan-100 text-xs font-extrabold p-2.5 rounded-xl outline-none shadow-md cursor-pointer hover:border-cyan-400 transition-colors"
          >
            {allAnimals.map((pet) => (
              <option key={pet.id} value={pet.id} className="bg-[#091122] text-white">
                {pet.name} ({pet.species.toUpperCase()} • {pet.breed})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* MAIN 3D SANDBOX GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: 3D VIEWPORT & SIMULATION TELEMETRY */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel-dark rounded-3xl p-5 border border-cyan-500/40 shadow-xl relative overflow-hidden">
            
            {/* Viewport Header Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-cyan-500/20 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                  3D Holographic Chamber: {config.name}
                </span>
              </div>

              {/* Viewport Toolbar */}
              <div className="flex items-center space-x-1.5 bg-[#091122]/90 p-1.5 rounded-xl border border-cyan-500/30">
                <button 
                  onClick={() => setRotationDirection(prev => (prev === 1 ? -1 : 1))}
                  className="p-1.5 text-cyan-300 hover:text-white hover:bg-cyan-900/50 rounded-lg transition-colors"
                  title="Reverse Rotation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsAutoRotating(!isAutoRotating)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isAutoRotating ? 'bg-cyan-900/80 text-cyan-300 border border-cyan-400/50' : 'text-slate-400 hover:text-white'
                  }`}
                  title={isAutoRotating ? 'Pause Rotation' : 'Resume Rotation'}
                >
                  {isAutoRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.5))}
                  className="p-1.5 text-cyan-300 hover:text-white hover:bg-cyan-900/50 rounded-lg transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.6))}
                  className="p-1.5 text-cyan-300 hover:text-white hover:bg-cyan-900/50 rounded-lg transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleResetControls}
                  className="px-2.5 py-1 text-[10px] font-extrabold bg-slate-800 hover:bg-slate-700 text-cyan-200 rounded-lg border border-slate-700 transition-colors uppercase tracking-wider"
                >
                  Reset View
                </button>
              </div>
            </div>

            {/* THREE.JS WEBGL CONTAINER & FLOATING 3D BIOMETRIC CALLOUT CARDS */}
            <div 
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              className="relative w-full h-[450px] bg-[#060b17] rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border border-cyan-500/30 cursor-grab active:cursor-grabbing select-none"
            >

              {/* Scanner Transition Loader Overlay */}
              {isLoadingModel && !modelError && (
                <div className="absolute inset-0 z-30 bg-[#060b17]/90 backdrop-blur-md flex flex-col items-center justify-center space-y-4 animate-fadeIn">
                  <div className="w-32 h-32 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin flex items-center justify-center shadow-[0_0_30px_#06b6d4]">
                    <Zap className="w-12 h-12 text-cyan-300 animate-pulse" />
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-cyan-950/90 border border-cyan-400 text-cyan-300 text-xs font-mono font-extrabold uppercase tracking-widest animate-pulse shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                    {transitionText}
                  </div>
                </div>
              )}

              {/* Model Loading Error Overlay */}
              {modelError && (
                <div className="absolute inset-0 z-30 bg-[#060b17]/95 backdrop-blur-md flex flex-col items-center justify-center space-y-3 p-6 text-center">
                  <AlertTriangle className="w-12 h-12 text-red-500 animate-bounce" />
                  <h3 className="text-lg font-extrabold text-white uppercase tracking-wider">DIGITAL TWIN MODEL UNAVAILABLE</h3>
                  <p className="text-xs text-slate-300 max-w-md">{modelError}</p>
                </div>
              )}

              {modelNotice && !isLoadingModel && !modelError && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-xl bg-amber-950/90 border border-amber-400/60 text-amber-200 text-[10px] font-extrabold uppercase tracking-wide">
                  {modelNotice}
                </div>
              )}

              {/* FLOATING 3D BIOMETRIC CALLOUT CARDS MATCHING REFERENCE DESIGN */}
              {!isLoadingModel && !modelError && (
                <>
                  {/* 1. HEART CALLOUT CARD (Top Left / Chest Area) */}
                  <div 
                    className="absolute top-16 left-28 z-20 px-3 py-2 rounded-2xl bg-[#091122]/90 backdrop-blur-xl border-2 border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center space-x-2 text-white animate-pulse"
                    style={{ borderColor: config.hexColor }}
                  >
                    <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-ping" />
                    <div>
                      <div className="text-[9px] font-mono text-cyan-300 uppercase tracking-widest font-extrabold">HEART</div>
                      <div className="text-xs font-extrabold text-white">{currentBpm} BPM</div>
                    </div>
                  </div>

                  {/* 2. DIGESTIVE CALLOUT CARD (Top Right / Abdomen Area) */}
                  <div 
                    className="absolute top-20 right-28 z-20 px-3 py-2 rounded-2xl bg-[#091122]/90 backdrop-blur-xl border border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center space-x-2 text-white"
                  >
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-[9px] font-mono text-cyan-300 uppercase tracking-widest font-extrabold">DIGESTIVE</div>
                      <div className="text-xs font-extrabold text-emerald-400">Good</div>
                    </div>
                  </div>

                  {/* 3. JOINTS CALLOUT CARD (Bottom Left / Hind Leg Area) */}
                  <div 
                    className="absolute bottom-24 left-24 z-20 px-3 py-2 rounded-2xl bg-[#091122]/90 backdrop-blur-xl border border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center space-x-2 text-white"
                  >
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="text-[9px] font-mono text-cyan-300 uppercase tracking-widest font-extrabold">JOINTS</div>
                      <div className="text-xs font-extrabold text-cyan-300">Good</div>
                    </div>
                  </div>

                  {/* 4. SKIN & COAT CALLOUT CARD (Bottom Right / Flank Area) */}
                  <div 
                    className="absolute bottom-20 right-24 z-20 px-3 py-2 rounded-2xl bg-[#091122]/90 backdrop-blur-xl border border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center space-x-2 text-white"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="text-[9px] font-mono text-cyan-300 uppercase tracking-widest font-extrabold">SKIN & COAT</div>
                      <div className="text-xs font-extrabold text-amber-300">Excellent</div>
                    </div>
                  </div>
                </>
              )}

              {/* Active Biometric Diagnostics Overlay */}
              <div className="absolute top-4 left-4 z-20 bg-[#091122]/90 backdrop-blur-md p-3 rounded-2xl border border-cyan-500/40 space-y-2 text-white shadow-xl">
                <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider block">
                  Active Biometric Diagnostics
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setSelectedRegion('heart')}
                    className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold transition-all border ${
                      selectedRegion === 'heart'
                        ? 'bg-red-600/90 text-white border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-cyan-500/40'
                    }`}
                  >
                    {presentation.diagnosticLabels.heart || 'Heart Rate'}
                  </button>
                  <button
                    onClick={() => setSelectedRegion('stomach')}
                    className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold transition-all border ${
                      selectedRegion === 'stomach'
                        ? 'bg-amber-600/90 text-white border-amber-400 shadow-[0_0_10px_rgba(217,119,6,0.5)]'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-cyan-500/40'
                    }`}
                  >
                    {presentation.diagnosticLabels.stomach || 'Digestive'}
                  </button>
                  <button
                    onClick={() => setSelectedRegion('joints')}
                    className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold transition-all border ${
                      selectedRegion === 'joints'
                        ? 'bg-blue-600/90 text-white border-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.5)]'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-cyan-500/40'
                    }`}
                  >
                    {presentation.diagnosticLabels.joints || 'Mobility'}
                  </button>
                  <button
                    onClick={() => setSelectedRegion('teeth')}
                    className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold transition-all border ${
                      selectedRegion === 'teeth'
                        ? 'bg-emerald-600/90 text-white border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-cyan-500/40'
                    }`}
                  >
                    {presentation.diagnosticLabels.teeth || 'Dental'}
                  </button>
                  <button
                    onClick={() => setSelectedRegion('skin')}
                    className={`col-span-2 px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold transition-all border ${
                      selectedRegion === 'skin'
                        ? 'bg-purple-600/90 text-white border-purple-400 shadow-[0_0_10px_rgba(147,51,234,0.5)]'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-cyan-500/40'
                    }`}
                  >
                    {presentation.diagnosticLabels.skin || 'Body Health'}
                  </button>
                </div>
              </div>

              {/* Stress Warning Badge */}
              {stressPercent >= 55 && (
                <div className="absolute top-4 right-4 z-20 bg-red-600/90 border border-red-400 text-white font-extrabold text-[10px] py-1.5 px-3 rounded-full flex items-center space-x-1.5 shadow-[0_0_15px_rgba(220,38,38,0.6)] animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>HIGH {config.stressLabel.toUpperCase()}</span>
                </div>
              )}
            </div>

            {/* Vitals Telemetry Panel */}
            <div className="mt-4 grid grid-cols-3 gap-3 text-xs font-extrabold">
              <div className="p-3 bg-[#091122]/80 border border-cyan-500/30 rounded-2xl space-y-1">
                <span className="text-slate-400 text-[10px] block uppercase">{config.name} Heart Rate</span>
                <span className="text-lg font-extrabold text-red-400 flex items-center space-x-1.5">
                  <Activity className="w-4.5 h-4.5 animate-pulse" />
                  <span>{currentBpm} BPM</span>
                </span>
              </div>
              <div className="p-3 bg-[#091122]/80 border border-cyan-500/30 rounded-2xl space-y-1">
                <span className="text-slate-400 text-[10px] block uppercase">{config.staminaLabel}</span>
                <span className="text-lg font-extrabold text-cyan-300">{staminaPercent}%</span>
              </div>
              <div className="p-3 bg-[#091122]/80 border border-cyan-500/30 rounded-2xl space-y-1">
                <span className="text-slate-400 text-[10px] block uppercase">{config.stressLabel}</span>
                <span className={`text-lg font-extrabold ${stressPercent >= 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {stressPercent}%
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: REACTIVITY TEST BENCH & TREATMENT PLAN */}
        <div className="lg:col-span-4 space-y-6 text-xs font-semibold">
          
          {/* Reactivity Test Bench Panel */}
          <div className="glass-panel-dark rounded-3xl p-5 border border-cyan-500/40 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-cyan-500/20">
              <h4 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>{config.name.toUpperCase()} REACTIVITY TEST BENCH</span>
              </h4>
              <button 
                onClick={() => {
                  setSelectedFoodId('none');
                  setSelectedActivityId('none');
                  setSelectedStressId('none');
                }}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-extrabold underline uppercase"
              >
                Reset Tests
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-slate-300 uppercase block">Species Animation Profile:</span>
                <div className="flex flex-wrap gap-1.5">
                  {presentation.animations.map(animation => (
                    <button
                      key={animation}
                      onClick={() => setSelectedAnimation(animation)}
                      className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-extrabold transition-all ${selectedAnimation === animation ? 'bg-cyan-600/90 text-white border-cyan-300' : 'bg-[#091122]/70 border-slate-800 text-slate-300 hover:border-cyan-500/40'}`}
                    >
                      {animation}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dietary Ingestion Test */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-slate-300 uppercase block">
                  Dietary Ingestion Test:
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {config.tests.food.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFoodId(selectedFoodId === f.id ? 'none' : f.id)}
                      className={`py-2 px-3 rounded-xl border text-left font-extrabold text-[11px] transition-all flex items-center justify-between ${
                        selectedFoodId === f.id
                          ? 'bg-emerald-600/90 text-white border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                          : 'bg-[#091122]/70 border-slate-800 text-slate-300 hover:border-cyan-500/40'
                      }`}
                    >
                      <span>{f.label}</span>
                      {selectedFoodId === f.id && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Physical Activity Test */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-slate-300 uppercase block">
                  Physical Activity Test:
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {config.tests.activity.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setSelectedActivityId(selectedActivityId === a.id ? 'none' : a.id)}
                      className={`py-2 px-3 rounded-xl border text-left font-extrabold text-[11px] transition-all flex items-center justify-between ${
                        selectedActivityId === a.id
                          ? 'bg-blue-600/90 text-white border-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                          : 'bg-[#091122]/70 border-slate-800 text-slate-300 hover:border-cyan-500/40'
                      }`}
                    >
                      <span>{a.label}</span>
                      {selectedActivityId === a.id && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Environmental Stress Test */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-slate-300 uppercase block">
                  Environmental Stress Test:
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {config.tests.stress.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStressId(selectedStressId === s.id ? 'none' : s.id)}
                      className={`py-2 px-3 rounded-xl border text-left font-extrabold text-[11px] transition-all flex items-center justify-between ${
                        selectedStressId === s.id
                          ? 'bg-red-600/90 text-white border-red-400 shadow-[0_0_10px_rgba(220,38,38,0.4)]'
                          : 'bg-[#091122]/70 border-slate-800 text-slate-300 hover:border-cyan-500/40'
                      }`}
                    >
                      <span>{s.label}</span>
                      {selectedStressId === s.id && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostic Treatment Plan Panel */}
          <div className="glass-panel-dark rounded-3xl p-5 border border-cyan-500/40 shadow-xl space-y-4">
            <h4 className="font-extrabold text-xs text-white uppercase tracking-wider border-b border-cyan-500/20 pb-2">
              DIAGNOSTIC TREATMENT PLAN
            </h4>

            <div className="space-y-3">
              <div className="p-3 bg-cyan-950/60 border border-cyan-400/40 rounded-2xl text-cyan-200">
                <span className="text-[10px] font-extrabold block uppercase text-cyan-400">Target System</span>
                <span className="font-extrabold text-xs text-white">{activeTreatmentPlan.title}</span>
              </div>

              <div className="p-3 bg-[#091122]/80 rounded-2xl border border-slate-800 space-y-1">
                <span className="font-extrabold text-slate-400 block uppercase text-[9px]">Observed Condition</span>
                <p className="font-semibold text-cyan-100 text-xs">"{activeTreatmentPlan.condition}"</p>
              </div>

              <div className="p-3 bg-emerald-950/50 rounded-2xl border border-emerald-500/40 space-y-1">
                <span className="font-extrabold text-emerald-400 block uppercase text-[9px]">Prescribed Plan</span>
                <p className="font-extrabold text-white text-xs">"{activeTreatmentPlan.plan}"</p>
              </div>

              <div className="flex justify-between items-center text-[10px] pt-1 text-slate-400 border-t border-slate-800">
                <span>Next Scheduled Routine Checkup:</span>
                <span className="font-extrabold text-cyan-300 font-mono">{activeTreatmentPlan.nextVetCheck}</span>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={onOpenAITriage}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI Helper</span>
                </button>
                <button
                  onClick={onOpenPassport}
                  className="flex-1 py-2.5 rounded-xl bg-[#091122] border border-cyan-500/40 text-cyan-200 hover:text-white font-extrabold text-[11px] uppercase tracking-wider"
                >
                  View Passport
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
