import { Animal } from '../types/animal';

export const MOCK_ANIMALS: Animal[] = [
  {
    id: 'pet-dog-01',
    name: 'Apollo',
    species: 'dog',
    breed: 'Golden Retriever',
    ageYears: 3,
    gender: 'Male',
    weightKg: 28.5,
    microchipId: '985141002349012', // Optional microchip
    photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800',
    priceOrAdoptionFee: '$150 Adoption Fee',
    aboutPet: 'Apollo is a joyful, affectionate Golden Retriever who loves belly rubs, outdoor games, and cuddling. Great for families with kids!',
    energyLevel: 'High Energy',
    temperament: ['Friendly', 'Playful', 'Loyal', 'Good with Kids'],
    goodWithKids: true,
    goodWithOtherPets: true,
    careLevel: 'Easy',
    monthlyEstCost: 110,
    shelterId: 'shelter-cupa-01',
    isAvailableForAdoptionOrSale: true,
    healthScore: 95,
    bodyPins: [
      {
        id: 'pin-1',
        label: 'Heart & Chest',
        systemName: 'Heart & Chest',
        healthScore: 98,
        status: 'Healthy',
        position: [0, 0.4, 0.3],
        doctorNotes: 'Heart rhythm is strong and steady at 78 beats per minute. No murmurs.',
        dailyCareTip: 'Keep up with 45 minutes of fun daily walks or playing fetch.'
      },
      {
        id: 'pin-2',
        label: 'Stomach & Digestion',
        systemName: 'Stomach & Digestion',
        healthScore: 92,
        status: 'Healthy',
        position: [0, 0.1, -0.2],
        doctorNotes: 'Healthy appetite and good digestion. Slight sensitivity to chicken.',
        dailyCareTip: 'Feed salmon and sweet potato kibble twice a day.'
      },
      {
        id: 'pin-3',
        label: 'Joints & Legs',
        systemName: 'Joints & Movement',
        healthScore: 88,
        status: 'Needs Attention',
        position: [0, -0.3, -0.5],
        doctorNotes: 'Mild tightness in rear hip joints. Flexible movement overall.',
        dailyCareTip: 'Add glucosamine joint supplement to daily breakfast.'
      },
      {
        id: 'pin-4',
        label: 'Teeth & Mouth',
        systemName: 'Teeth & Mouth',
        healthScore: 96,
        status: 'Healthy',
        position: [0, 0.6, 0.8],
        doctorNotes: 'Clean white teeth with healthy pink gums.',
        dailyCareTip: 'Provide dental chew treats 3 times a week.'
      },
      {
        id: 'pin-5',
        label: 'Skin & Coat',
        systemName: 'Skin & Fur',
        healthScore: 94,
        status: 'Healthy',
        position: [0, 0.2, 0.1],
        doctorNotes: 'Shiny golden coat with healthy skin hydration.',
        dailyCareTip: 'Brush coat twice a week to remove loose fur.'
      }
    ],
    vaccinations: [
      { id: 'v1', vaccineName: 'Rabies Vaccination', dateGiven: '2025-05-10', nextDueDate: '2028-05-10', doctorName: 'Dr. Sarah Jenkins', verifiedStamp: true },
      { id: 'v2', vaccineName: 'Distemper & Parvo Core Vaccine', dateGiven: '2026-02-14', nextDueDate: '2027-02-14', doctorName: 'Dr. Sarah Jenkins', verifiedStamp: true }
    ],
    medicalHistory: [
      { id: 'm1', date: '2026-07-15', title: 'Annual Health Check', doctorNotes: 'Apollo is in excellent physical condition.', status: 'Normal' }
    ]
  },
  {
    id: 'pet-cat-02',
    name: 'Luna',
    species: 'cat',
    breed: 'Domestic Short Hair (Indie Cat)',
    ageYears: 2,
    gender: 'Female',
    weightKg: 4.1,
    microchipId: undefined, // Microchip is OPTIONAL - undefined here!
    photoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800',
    priceOrAdoptionFee: '$90 Adoption Fee',
    aboutPet: 'Luna is a gentle, sweet indoor cat who loves sunbathing on windowsills and purring on your lap.',
    energyLevel: 'Moderate',
    temperament: ['Gentle', 'Quiet', 'Lap Cat', 'Clean'],
    goodWithKids: true,
    goodWithOtherPets: true,
    careLevel: 'Easy',
    monthlyEstCost: 65,
    shelterId: 'shelter-streeties-02',
    isAvailableForAdoptionOrSale: true,
    healthScore: 97,
    bodyPins: [
      {
        id: 'pin-cat-1',
        label: 'Kidneys & Urinary Health',
        systemName: 'Stomach & Digestion',
        healthScore: 98,
        status: 'Healthy',
        position: [0, 0.1, -0.3],
        doctorNotes: 'Kidneys and urinary tract are in perfect health.',
        dailyCareTip: 'Keep a clean water fountain filled with fresh water.'
      },
      {
        id: 'pin-cat-2',
        label: 'Heart & Lungs',
        systemName: 'Heart & Chest',
        healthScore: 96,
        status: 'Healthy',
        position: [0, 0.3, 0.2],
        doctorNotes: 'Heartbeat clear at 140 BPM with zero murmurs.',
        dailyCareTip: 'Play with feather wand toys for 15 minutes daily.'
      },
      {
        id: 'pin-cat-3',
        label: 'Fur & Coat Health',
        systemName: 'Skin & Fur',
        healthScore: 95,
        status: 'Healthy',
        position: [0, 0, -0.1],
        doctorNotes: 'Soft, clean coat with no hairball issues.',
        dailyCareTip: 'Groom with a soft brush once a week.'
      }
    ],
    vaccinations: [
      { id: 'vc1', vaccineName: 'Feline Core 3-in-1 Vaccine', dateGiven: '2026-03-01', nextDueDate: '2027-03-01', doctorName: 'Dr. Anita Roy', verifiedStamp: true }
    ],
    medicalHistory: []
  },
  {
    id: 'pet-bird-03',
    name: 'Rio',
    species: 'bird',
    breed: 'Blue & Gold Macaw',
    ageYears: 4,
    gender: 'Male',
    weightKg: 1.1,
    microchipId: '900085001122334', // Optional microchip
    photoUrl: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&q=80&w=800',
    priceOrAdoptionFee: '$350 Purchase / Adoption',
    aboutPet: 'Rio is a smart, playful macaw bird who can whistle tunes, say "Hello!", and loves climbing wooden perches.',
    energyLevel: 'High Energy',
    temperament: ['Vocal', 'Smart', 'Social', 'Playful'],
    goodWithKids: false,
    goodWithOtherPets: false,
    careLevel: 'Moderate',
    monthlyEstCost: 75,
    shelterId: 'shelter-cupa-01',
    isAvailableForAdoptionOrSale: true,
    healthScore: 93,
    bodyPins: [
      {
        id: 'pin-bird-1',
        label: 'Feathers & Wings',
        systemName: 'Skin & Fur',
        healthScore: 94,
        status: 'Healthy',
        position: [0, 0.3, 0],
        doctorNotes: 'Bright blue and yellow feathers in top condition.',
        dailyCareTip: 'Mist feathers with warm water spray every morning.'
      },
      {
        id: 'pin-bird-2',
        label: 'Beak & Diet',
        systemName: 'Teeth & Mouth',
        healthScore: 92,
        status: 'Healthy',
        position: [0, 0.5, 0.4],
        doctorNotes: 'Beak shape and strength normal.',
        dailyCareTip: 'Provide organic bird pellets and fresh apple slices.'
      }
    ],
    vaccinations: [],
    medicalHistory: []
  },
  {
    id: 'pet-fish-04',
    name: 'Bubbles',
    species: 'fish',
    breed: 'Crown Tail Betta Fish',
    ageYears: 1,
    gender: 'Male',
    weightKg: 0.005,
    microchipId: undefined, // No microchip for fish!
    photoUrl: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&q=80&w=800',
    priceOrAdoptionFee: '$25 Purchase',
    aboutPet: 'Bubbles is a colorful royal blue Betta fish who swims gracefully around his live aquatic plant tank.',
    energyLevel: 'Calm',
    temperament: ['Quiet', 'Beautiful', 'Easy Care'],
    goodWithKids: true,
    goodWithOtherPets: true,
    careLevel: 'Easy',
    monthlyEstCost: 20,
    shelterId: 'shelter-ethical-03',
    isAvailableForAdoptionOrSale: true,
    healthScore: 98,
    bodyPins: [
      {
        id: 'pin-fish-1',
        label: 'Fins & Tail',
        systemName: 'Skin & Fur',
        healthScore: 98,
        status: 'Healthy',
        position: [0, 0.1, 0.2],
        doctorNotes: 'Crown tail fins fully extended and vibrant.',
        dailyCareTip: 'Change 25% tank water weekly and keep water at 26°C.'
      }
    ],
    vaccinations: [],
    medicalHistory: []
  },
  {
    id: 'pet-dragon-05',
    name: 'Spike',
    species: 'reptile',
    breed: 'Citrus Bearded Dragon',
    ageYears: 2,
    gender: 'Male',
    weightKg: 0.45,
    microchipId: undefined, // Optional microchip
    photoUrl: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=800',
    priceOrAdoptionFee: '$180 Purchase',
    aboutPet: 'Spike is a calm yellow bearded dragon lizard who loves sitting under his sun lamp and eating fresh greens.',
    energyLevel: 'Calm',
    temperament: ['Gentle', 'Quiet', 'Sun-Lover'],
    goodWithKids: true,
    goodWithOtherPets: false,
    careLevel: 'Moderate',
    monthlyEstCost: 40,
    shelterId: 'shelter-ethical-03',
    isAvailableForAdoptionOrSale: true,
    healthScore: 92,
    bodyPins: [
      {
        id: 'pin-dragon-1',
        label: 'Basking & Skin Shed',
        systemName: 'Skin & Fur',
        healthScore: 92,
        status: 'Healthy',
        position: [0, 0, 0],
        doctorNotes: 'Strong bone structure and clear skin shed.',
        dailyCareTip: 'Keep basking spot temperature at 39°C.'
      }
    ],
    vaccinations: [],
    medicalHistory: []
  }
];
