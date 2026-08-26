import React, { useState, useRef, useEffect } from 'react';
import { Animal, UserProfile, SpeciesType, MatchmakingQuestionnaire, VaccineRecord, MedicalRecord } from '../../types/animal';
import { MOCK_SHELTERS } from '../../data/mockShelters';
import { 
  User, 
  Heart, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  PawPrint, 
  QrCode, 
  Stethoscope, 
  ShieldAlert, 
  Plus, 
  CheckCircle, 
  Clock,
  Dog,
  Cat,
  Bird,
  Fish,
  Sparkles,
  Edit2,
  Bookmark,
  Check,
  Compass,
  ArrowRight,
  Info
} from 'lucide-react';

interface OwnerDashboardProps {
  user: UserProfile;
  animal: Animal | null;
  allAnimals: Animal[];
  onSelectAnimal: (id: string) => void;
  onOpen3DViewer: () => void;
  onOpenPassport: () => void;
  onOpenAITriage: () => void;
  onOpenEmergency: () => void;
  onAddAnimal?: (animal: Animal) => void;
  onUpdateAnimal?: (animal: Animal) => void;
  onUpdateUser?: (user: UserProfile) => void;
  onSelectTab?: (tab: string) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  user,
  animal,
  allAnimals,
  onSelectAnimal,
  onOpen3DViewer,
  onOpenPassport,
  onOpenAITriage,
  onOpenEmergency,
  onAddAnimal,
  onUpdateAnimal,
  onUpdateUser,
  onSelectTab
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // States
  const [showAddPetForm, setShowAddPetForm] = useState(false);
  const [showEditPetModal, setShowEditPetModal] = useState(false);
  
  // New Pet Form States
  const [newPetName, setNewPetName] = useState('');
  const [newPetSpecies, setNewPetSpecies] = useState<SpeciesType>('dog');
  const [newPetBreed, setNewPetBreed] = useState('');
  const [newPetAge, setNewPetAge] = useState(1);
  const [newPetWeight, setNewPetWeight] = useState(5);
  const [newPetMicrochip, setNewPetMicrochip] = useState('');
  const [newPetRisks, setNewPetRisks] = useState('');
  const [newPetPhotoUrl, setNewPetPhotoUrl] = useState('https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800');

  // Edit Pet Form States
  const [editName, setEditName] = useState('');
  const [editBreed, setEditBreed] = useState('');
  const [editAge, setEditAge] = useState(0);
  const [editWeight, setEditWeight] = useState(0);
  const [editMicrochip, setEditMicrochip] = useState('');

  // Questionnaire States (for Buyers)
  const [quizStep, setQuizStep] = useState(1);
  const [buyerQuiz, setBuyerQuiz] = useState<MatchmakingQuestionnaire>({
    targetPetType: 'any',
    homeType: 'Apartment',
    dailyTimeAvailable: '1 to 2 Hours',
    monthlyBudget: 80,
    experienceLevel: 'First-time Pet Owner',
    activityLevel: 'Moderate',
    hasChildren: false,
    hasOtherPets: false,
    patienceLevel: 'Medium',
    noiseTolerance: 'Medium',
    desiredTrait: 'playful'
  });
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [matchedPets, setMatchedPets] = useState<Array<{ pet: Animal; score: number }>>([]);
  const [selectedMatchPet, setSelectedMatchPet] = useState<Animal | null>(null);
  const [adoptionInquirySent, setAdoptionInquirySent] = useState(false);

  // Load active pet values for editing
  useEffect(() => {
    if (animal) {
      setEditName(animal.name);
      setEditBreed(animal.breed);
      setEditAge(animal.ageYears);
      setEditWeight(animal.weightKg);
      setEditMicrochip(animal.microchipId || '');
    }
  }, [animal]);

  // Dynamic 3D canvas rendering for header card (Pure Canvas, No gradients, Flat Colors)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    const render = () => {
      angle += 0.015;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Rotating Isometric grid platform in Brand Green
      ctx.save();
      ctx.translate(cx, cy + 30);
      ctx.scale(1, 0.4);
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 75, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, 95, -angle, -angle + Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Rotating 3D Paw print elements in flat solid Brand Blue & Orange
      ctx.save();
      ctx.translate(cx, cy - 25 + Math.sin(angle * 1.5) * 8);

      // Center Pad (Solid Orange)
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.ellipse(0, 5, 20, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      // Toe Pads (Solid Blue)
      ctx.fillStyle = '#1d4ed8';
      ctx.beginPath();
      ctx.arc(-14, -10, 6, 0, Math.PI * 2);
      ctx.arc(-5, -18, 7, 0, Math.PI * 2);
      ctx.arc(5, -18, 7, 0, Math.PI * 2);
      ctx.arc(14, -10, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  // Save new pet details
  const handleAddNewPet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetName.trim()) return;

    const newAnimal: Animal = {
      id: 'pet-' + Date.now(),
      name: newPetName,
      species: newPetSpecies,
      breed: newPetBreed || 'Mixed Breed',
      ageYears: newPetAge,
      gender: 'Male',
      weightKg: newPetWeight,
      microchipId: newPetMicrochip || undefined,
      photoUrl: newPetPhotoUrl,
      priceOrAdoptionFee: 'Owned Companion',
      aboutPet: `${newPetName} is our beloved registered family companion.`,
      energyLevel: 'Moderate',
      temperament: ['Friendly', 'Loyal'],
      goodWithKids: true,
      goodWithOtherPets: true,
      careLevel: 'Easy',
      monthlyEstCost: 80,
      shelterId: 'owned',
      isAvailableForAdoptionOrSale: false,
      healthScore: 92,
      bodyPins: [
        { id: 'bp-1', label: 'Heart Vitals', systemName: 'Heart & Chest', healthScore: 96, status: 'Healthy', position: [0, 0, 0], doctorNotes: 'Excellent heartbeat.', dailyCareTip: 'Regular exercise.' }
      ],
      vaccinations: [],
      medicalHistory: []
    };

    if (onAddAnimal) onAddAnimal(newAnimal);
    onSelectAnimal(newAnimal.id);
    setShowAddPetForm(false);
    setNewPetName('');
    setNewPetBreed('');
    setNewPetMicrochip('');
  };

  // Update existing pet details
  const handleSaveEditPet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!animal || !editName.trim()) return;

    const updated: Animal = {
      ...animal,
      name: editName,
      breed: editBreed,
      ageYears: editAge,
      weightKg: editWeight,
      microchipId: editMicrochip || undefined
    };

    if (onUpdateAnimal) onUpdateAnimal(updated);
    setShowEditPetModal(false);
  };

  // Run AI Matchmaking logic
  const handleRunMatchmaking = () => {
    // Score animals from allAnimals based on questionnaire characteristics compatibility
    const scores = allAnimals
      .filter(a => a.isAvailableForAdoptionOrSale)
      .map(pet => {
        let score = 70; // Baseline compatibility index

        // Species match
        if (buyerQuiz.targetPetType !== 'any' && pet.species !== buyerQuiz.targetPetType) {
          score -= 30;
        }

        // Budget match
        if (pet.monthlyEstCost <= buyerQuiz.monthlyBudget) {
          score += 10;
        } else {
          score -= 15;
        }

        // Energy vs Activity Level match
        if (buyerQuiz.activityLevel === 'Highly Active' && pet.energyLevel === 'High Energy') score += 10;
        if (buyerQuiz.activityLevel === 'Sedentary' && pet.energyLevel === 'Calm') score += 10;

        // Kids / Other pets constraints
        if (buyerQuiz.hasChildren && !pet.goodWithKids) score -= 25;
        if (buyerQuiz.hasOtherPets && !pet.goodWithOtherPets) score -= 20;

        // Clip constraints
        score = Math.min(100, Math.max(10, score));
        return { pet, score };
      })
      .sort((a, b) => b.score - a.score);

    setMatchedPets(scores);
    setIsQuizCompleted(true);
  };

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-xs font-semibold">
      
      {/* 1. PERSONALIZED USER WELCOME CARD */}
      <div className="bg-white rounded-3xl p-6 border-4 border-brand-solidBlue shadow-lg relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          <div className="md:col-span-8 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-20 h-20 rounded-3xl object-cover border-4 border-brand-solidOrange shadow-sm"
            />
            <div className="space-y-1">
              <div className="flex items-center space-x-2 justify-center sm:justify-start">
                <h2 className="text-2xl font-extrabold text-slate-900">Welcome, {user.name}!</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-brand-lightGreen text-brand-solidGreen font-extrabold text-[10px] uppercase border border-brand-solidGreen">
                  {user.role === 'pet_owner' ? 'Pet Guardian' : 'Pet Adopter'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-bold font-mono">
                Verification Hub Active • Bengaluru Emergency Area Unlocked
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-slate-600">
                <span className="flex items-center space-x-1"><Mail className="w-3.5 h-3.5 text-brand-solidBlue" /><span>{user.email}</span></span>
                <span className="flex items-center space-x-1"><Phone className="w-3.5 h-3.5 text-brand-solidBlue" /><span>{user.phone}</span></span>
                <span className="flex items-center space-x-1"><MapPin className="w-3.5 h-3.5 text-brand-solidBlue" /><span>{user.city}</span></span>
              </div>
            </div>
          </div>

          {/* 3D Animated canvas inside card */}
          <div className="md:col-span-4 h-[110px] flex items-center justify-center relative border-2 border-slate-200 rounded-2xl bg-slate-900 overflow-hidden">
            <canvas ref={canvasRef} width={200} height={110} className="w-full h-full object-contain" />
          </div>

        </div>
      </div>

      {/* DYNAMIC VIEW FOR PET OWNERS */}
      {user.role === 'pet_owner' && (
        <div className="space-y-6">
          
          {/* Header Switchers */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900">
                My Companion <span className="text-brand-solidOrange">Registered Pets</span>
              </h3>
              <p className="text-xs text-slate-500 font-semibold font-mono">Select active pet profile to launch 3D twin diagnoses or digital passport</p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAddPetForm(!showAddPetForm)}
                className="px-4 py-2 rounded-xl bg-brand-solidBlue text-white font-extrabold text-xs shadow-sm flex items-center space-x-1 border-2 border-brand-solidBlue"
              >
                <Plus className="w-4 h-4" />
                <span>{showAddPetForm ? 'Close Add Pet Form' : 'Register New Pet'}</span>
              </button>
            </div>
          </div>

          {/* REGISTER NEW PET FORM */}
          {showAddPetForm && (
            <form onSubmit={handleAddNewPet} className="bg-white rounded-3xl p-6 border-4 border-brand-solidOrange shadow-lg space-y-4 animate-fadeIn">
              <h4 className="text-sm font-extrabold text-slate-900 uppercase">Input Pet Profile Details</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Pet Name:</label>
                  <input type="text" required placeholder="Apollo" value={newPetName} onChange={e => setNewPetName(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 font-bold outline-none focus:border-brand-solidBlue" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Species Taxonomy:</label>
                  <select value={newPetSpecies} onChange={e => setNewPetSpecies(e.target.value as SpeciesType)} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 font-bold outline-none">
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="bird">Bird</option>
                    <option value="fish">Fish</option>
                    <option value="reptile">Reptile</option>
                    <option value="rabbit">Rabbit</option>
                    <option value="hamster">Hamster</option>
                    <option value="other">Other Companion</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Breed / Variant:</label>
                  <input type="text" required placeholder="Golden Retriever" value={newPetBreed} onChange={e => setNewPetBreed(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 font-bold outline-none focus:border-brand-solidBlue" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Age (Years):</label>
                  <input type="number" required min={0} value={newPetAge} onChange={e => setNewPetAge(Number(e.target.value))} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 font-bold outline-none focus:border-brand-solidBlue" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Weight (kg):</label>
                  <input type="number" required min={0} step={0.1} value={newPetWeight} onChange={e => setNewPetWeight(Number(e.target.value))} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 font-bold outline-none focus:border-brand-solidBlue" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Microchip Tag (Optional):</label>
                  <input type="text" placeholder="e.g. 985141002349012" value={newPetMicrochip} onChange={e => setNewPetMicrochip(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 font-bold outline-none focus:border-brand-solidBlue" />
                </div>
              </div>

              <button type="submit" className="w-full py-3.5 rounded-xl bg-brand-solidGreen text-white font-extrabold text-xs shadow-sm uppercase">
                Save Pet Profile to Dashboard
              </button>
            </form>
          )}

          {/* ACTIVE PET DETAILS BLOCK */}
          {animal ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Pet Info Card */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-brand-solidOrange uppercase">Active Companion Profile</span>
                  <button onClick={() => setShowEditPetModal(true)} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-brand-solidBlue">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center space-x-4">
                  <img src={animal.photoUrl} alt={animal.name} className="w-20 h-20 rounded-2xl object-cover border-4 border-brand-solidBlue shadow-sm" />
                  <div>
                    <h4 className="text-xl font-extrabold text-slate-900">{animal.name}</h4>
                    <p className="text-brand-solidOrange font-bold">{animal.breed} • {animal.ageYears} Years Old</p>
                    <p className="text-[10px] text-slate-400 font-mono">ID: {animal.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-slate-700">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-extrabold">Weight Vitals</span>
                    <span className="font-extrabold text-slate-950">{animal.weightKg} kg</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-extrabold">Microchip Tag</span>
                    <span className="font-extrabold text-slate-950 font-mono text-[10px]">
                      {animal.microchipId || 'Not Tagged'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button onClick={onOpenPassport} className="flex-1 py-3 rounded-xl bg-brand-solidBlue text-white font-extrabold flex items-center justify-center space-x-1">
                    <QrCode className="w-4 h-4" />
                    <span>Digital Passport</span>
                  </button>
                  <button onClick={onOpen3DViewer} className="flex-1 py-3 rounded-xl bg-brand-solidOrange text-white font-extrabold flex items-center justify-center space-x-1">
                    <Compass className="w-4 h-4" />
                    <span>3D Twin Diagnostics</span>
                  </button>
                </div>
              </div>

              {/* Shelters & care listings directly on dashboard */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md space-y-4">
                <h4 className="text-sm font-extrabold text-slate-900 uppercase flex items-center space-x-1.5">
                  <MapPin className="w-4.5 h-4.5 text-brand-solidGreen" />
                  <span>Nearby Animal Care & Shelter Hub</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex justify-between items-center font-extrabold text-slate-800">
                      <span>CUPA Shelter</span>
                      <span className="text-[9px] bg-brand-lightGreen text-brand-solidGreen px-2 py-0.5 rounded border border-brand-solidGreen">1.2 km</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Verified Adoption & Boarding Center</p>
                    <p className="text-brand-solidBlue font-bold text-[10px]">📞 +91 80 2294 7300</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex justify-between items-center font-extrabold text-slate-800">
                      <span>Streeties Rescue</span>
                      <span className="text-[9px] bg-brand-lightGreen text-brand-solidGreen px-2 py-0.5 rounded border border-brand-solidGreen">2.5 km</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Emergency Rescue & Med Shelter</p>
                    <p className="text-brand-solidBlue font-bold text-[10px]">📞 +91 98450 12345</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex justify-between items-center font-extrabold text-slate-800">
                      <span>Apex Vet Hospital</span>
                      <span className="text-[9px] bg-brand-lightGreen text-brand-solidGreen px-2 py-0.5 rounded border border-brand-solidGreen">3.8 km</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Emergency Surgery Clinic</p>
                    <p className="text-brand-solidBlue font-bold text-[10px]">📞 +91 99000 88776</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex justify-between items-center font-extrabold text-slate-800">
                      <span>Pet Pharmacy Care</span>
                      <span className="text-[9px] bg-brand-lightGreen text-brand-solidGreen px-2 py-0.5 rounded border border-brand-solidGreen">0.8 km</span>
                    </div>
                    <p className="text-[10px] text-slate-400">24/7 Specialized Vet Drugs</p>
                    <p className="text-brand-solidBlue font-bold text-[10px]">📞 +91 91000 55443</p>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button onClick={() => onSelectTab?.('buy-pets')} className="flex-1 py-2.5 rounded-xl border-2 border-brand-solidOrange text-brand-solidOrange font-extrabold text-center hover:bg-slate-50">
                    Adopt Another Pet
                  </button>
                  <button onClick={() => onSelectTab?.('shelters')} className="flex-1 py-2.5 rounded-xl bg-brand-solidGreen text-white font-extrabold text-center">
                    Full Shelter Directory & Map
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 text-center text-slate-500 border-2 border-slate-200">
              No active registered pets. Click "Register New Pet" to enter details.
            </div>
          )}

        </div>
      )}

      {/* DYNAMIC VIEW FOR PET BUYERS / ADOPTERS */}
      {user.role === 'looking_to_buy_or_adopt' && (
        <div className="space-y-6">
          
          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-slate-900">
              Adoption & <span className="text-brand-solidOrange">AI Matchmaking Portal</span>
            </h3>
            <p className="text-xs text-slate-500 font-semibold font-mono">Fill out user characteristics to evaluate matching percentage indices with rescue animals</p>
          </div>

          {/* QUESTIONNAIRE WIZARD */}
          {!isQuizCompleted ? (
            <div className="bg-white rounded-3xl p-6 border-4 border-brand-solidBlue shadow-lg space-y-6">
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-brand-solidBlue">lifestyle Questionnaire Wizard</span>
                <span className="text-[10px] font-extrabold bg-brand-lightOrange text-brand-solidOrange border border-brand-solidOrange px-3 py-1 rounded-full">
                  Step {quizStep} of 3
                </span>
              </div>

              {quizStep === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <h4 className="font-extrabold text-sm text-slate-900">Step 1: Desired Species & Living Space</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">What species are you looking for?</label>
                      <select value={buyerQuiz.targetPetType} onChange={e => setBuyerQuiz({...buyerQuiz, targetPetType: e.target.value as SpeciesType})} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 font-bold outline-none">
                        <option value="any">Show Me All Companion Animals</option>
                        <option value="dog">Dogs / Puppies</option>
                        <option value="cat">Cats / Kittens</option>
                        <option value="bird">Birds / Parrots</option>
                        <option value="fish">Betta Fish</option>
                        <option value="reptile">Reptiles / Bearded Dragons</option>
                        <option value="rabbit">Rabbits</option>
                        <option value="hamster">Hamsters</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">What is your housing structure?</label>
                      <select value={buyerQuiz.homeType} onChange={e => setBuyerQuiz({...buyerQuiz, homeType: e.target.value as any})} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 font-bold outline-none">
                        <option value="Apartment">Apartment / Flat (No Yard)</option>
                        <option value="House with Yard">House with Fenced Yard</option>
                        <option value="Farm / Large Property">Large Farm / Open Property</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {quizStep === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <h4 className="font-extrabold text-sm text-slate-900">Step 2: Time, Budget & Activity Level</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Daily attention time:</label>
                      <select value={buyerQuiz.dailyTimeAvailable} onChange={e => setBuyerQuiz({...buyerQuiz, dailyTimeAvailable: e.target.value as any})} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 font-bold outline-none">
                        <option value="Under 1 Hour">Under 1 Hour (Low demand)</option>
                        <option value="1 to 2 Hours">1 to 2 Hours</option>
                        <option value="3+ Hours">3+ Hours (High energy)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Monthly budget allotment ($):</label>
                      <input type="number" min={10} max={500} value={buyerQuiz.monthlyBudget} onChange={e => setBuyerQuiz({...buyerQuiz, monthlyBudget: Number(e.target.value)})} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 font-bold outline-none" />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Your regular activity style:</label>
                      <select value={buyerQuiz.activityLevel} onChange={e => setBuyerQuiz({...buyerQuiz, activityLevel: e.target.value as any})} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 font-bold outline-none">
                        <option value="Sedentary">Sedentary (Calm, quiet indoors)</option>
                        <option value="Moderate">Moderate (Daily walks)</option>
                        <option value="Highly Active">Highly Active (Agility/Agile runs)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {quizStep === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <h4 className="font-extrabold text-sm text-slate-900">Step 3: User Characteristic Profiles</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Noise Tolerance:</label>
                      <select value={buyerQuiz.noiseTolerance} onChange={e => setBuyerQuiz({...buyerQuiz, noiseTolerance: e.target.value as any})} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 font-bold outline-none">
                        <option value="Quiet">Quiet (Cannot tolerate barking)</option>
                        <option value="Medium">Medium</option>
                        <option value="Loud">Loud (Active parrots / vocal cats fine)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Patience Level:</label>
                      <select value={buyerQuiz.patienceLevel} onChange={e => setBuyerQuiz({...buyerQuiz, patienceLevel: e.target.value as any})} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 font-bold outline-none">
                        <option value="Low">Low (Needs fully trained pets)</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High (Happy to housebreak puppies)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Desired Temperament:</label>
                      <select value={buyerQuiz.desiredTrait} onChange={e => setBuyerQuiz({...buyerQuiz, desiredTrait: e.target.value as any})} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 font-bold outline-none">
                        <option value="calm">Calm & Independent</option>
                        <option value="playful">Playful & Cuddly</option>
                        <option value="protective">Protective & Alert</option>
                        <option value="independent">Quiet Companion</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" checked={buyerQuiz.hasChildren} onChange={e => setBuyerQuiz({...buyerQuiz, hasChildren: e.target.checked})} className="w-4 h-4 text-brand-solidBlue" id="ch-kids" />
                      <label className="font-bold text-slate-700 block cursor-pointer" id="lbl-kids" htmlFor="ch-kids">I have children at home</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" checked={buyerQuiz.hasOtherPets} onChange={e => setBuyerQuiz({...buyerQuiz, hasOtherPets: e.target.checked})} className="w-4 h-4 text-brand-solidBlue" id="ch-pets" />
                      <label className="font-bold text-slate-700 block cursor-pointer" id="lbl-pets" htmlFor="ch-pets">I have other pets at home</label>
                    </div>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setQuizStep(prev => Math.max(1, prev - 1))}
                  disabled={quizStep === 1}
                  className="px-4 py-2 border-2 border-slate-200 rounded-xl text-slate-700 font-extrabold hover:bg-slate-50 disabled:opacity-50"
                >
                  Previous
                </button>

                {quizStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => setQuizStep(prev => prev + 1)}
                    className="px-5 py-2.5 bg-brand-solidBlue text-white font-extrabold rounded-xl"
                  >
                    Next Questions
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRunMatchmaking}
                    className="px-6 py-2.5 bg-brand-solidGreen text-white font-extrabold rounded-xl flex items-center space-x-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Compatibility Match</span>
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Retake buttons */}
              <div className="flex justify-between items-center bg-white p-4 border-2 border-slate-200 rounded-2xl shadow-sm">
                <div className="flex items-center space-x-2 text-brand-solidGreen">
                  <CheckCircle className="w-5 h-5" />
                  <span>AI Matching Analysis Finished successfully!</span>
                </div>
                <button onClick={() => { setIsQuizCompleted(false); setQuizStep(1); }} className="px-4 py-2 bg-brand-solidBlue text-white font-extrabold rounded-xl text-[11px] uppercase">
                  Reset Questionnaire
                </button>
              </div>

              {/* Matched Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matchedPets.map(({ pet, score }) => (
                  <div key={pet.id} className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-md space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      
                      {/* Photo & Compatibility index badge */}
                      <div className="relative h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                        <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover" />
                        <div className="absolute top-3 left-3 bg-brand-solidGreen text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-md">
                          {score}% Match Rating
                        </div>
                        <div className="absolute bottom-3 right-3 bg-slate-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                          {pet.priceOrAdoptionFee}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-base font-extrabold text-slate-900">{pet.name}</h4>
                        <p className="text-brand-solidOrange text-[11px] font-bold">{pet.breed} • {pet.ageYears} Years Old</p>
                      </div>

                      <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-3">
                        "{pet.aboutPet}"
                      </p>

                      <div className="flex flex-wrap gap-1">
                        {pet.temperament.slice(0, 3).map(t => (
                          <span key={t} className="px-2 py-0.5 bg-brand-lightBlue text-brand-solidBlue text-[9px] font-bold rounded border border-brand-lightBlue">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => { setSelectedMatchPet(pet); setAdoptionInquirySent(false); }}
                      className="w-full py-2.5 rounded-xl bg-brand-solidBlue text-white font-extrabold text-[11px] uppercase tracking-wider shadow-sm"
                    >
                      Inquire & Apply Adoption
                    </button>

                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      )}

      {/* EDIT PET DETAILS MODAL */}
      {showEditPetModal && animal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleSaveEditPet} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border-4 border-brand-solidBlue text-xs font-semibold">
            <h3 className="text-lg font-extrabold text-slate-900">Edit Pet Profile</h3>
            
            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Name:</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 font-bold outline-none focus:border-brand-solidBlue" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Breed / Variant:</label>
                <input type="text" value={editBreed} onChange={e => setEditBreed(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 font-bold outline-none focus:border-brand-solidBlue" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Age (Years):</label>
                  <input type="number" min={0} value={editAge} onChange={e => setEditAge(Number(e.target.value))} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 font-bold outline-none" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Weight (kg):</label>
                  <input type="number" min={0} step={0.1} value={editWeight} onChange={e => setEditWeight(Number(e.target.value))} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 font-bold outline-none" />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Microchip Serial Tag (Optional):</label>
                <input type="text" value={editMicrochip} onChange={e => setEditMicrochip(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 font-bold outline-none focus:border-brand-solidBlue" />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button type="button" onClick={() => setShowEditPetModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700">Cancel</button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-brand-solidBlue text-white font-extrabold shadow-md">Save Changes</button>
            </div>
          </form>
        </div>
      )}

      {/* ADOPTION INQUIRY MODAL */}
      {selectedMatchPet && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border-4 border-brand-solidBlue text-xs font-semibold">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-base font-extrabold text-slate-900">Adopt companion: {selectedMatchPet.name}</h3>
              <button onClick={() => setSelectedMatchPet(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {!adoptionInquirySent ? (
              <div className="space-y-3">
                <img src={selectedMatchPet.photoUrl} alt={selectedMatchPet.name} className="w-full h-40 rounded-xl object-cover" />
                <p className="text-slate-700 leading-relaxed font-semibold">
                  You are submitting an adoption request for <strong>{selectedMatchPet.name}</strong> ({selectedMatchPet.breed}) at <strong>{MOCK_SHELTERS[0].name}</strong>.
                </p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 leading-relaxed">
                  <span className="font-bold text-slate-600 block">Current Address Location:</span>
                  <span>Indiranagar 12th Main Road, Apt 4B, Bengaluru</span>
                </div>

                <div className="p-3.5 bg-brand-lightBlue border border-brand-solidBlue rounded-xl text-brand-darkBlue font-semibold leading-relaxed">
                  Note: Digital Passport records and vaccinations stamps will be securely handed over to your account upon shelter staff review.
                </div>

                <button
                  onClick={() => setAdoptionInquirySent(true)}
                  className="w-full py-3 bg-brand-solidGreen text-white font-extrabold rounded-xl shadow-md uppercase"
                >
                  Send Adoption Application Request
                </button>
              </div>
            ) : (
              <div className="text-center py-4 space-y-3 animate-fadeIn">
                <div className="w-12 h-12 bg-brand-lightGreen text-brand-solidGreen rounded-full flex items-center justify-center mx-auto text-2xl">
                  ✓
                </div>
                <h4 className="text-lg font-extrabold text-slate-900">Application Submitted!</h4>
                <p className="text-slate-600 leading-relaxed font-semibold">
                  Adoption request for {selectedMatchPet.name} has been securely logged. The shelter at {MOCK_SHELTERS[0].address} will follow up with you.
                </p>
                <button
                  onClick={() => setSelectedMatchPet(null)}
                  className="w-full py-2.5 bg-slate-900 text-white font-extrabold rounded-xl"
                >
                  Return to Dashboard
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
