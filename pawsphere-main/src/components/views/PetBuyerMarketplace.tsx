import React, { useState, useMemo } from 'react';
import { Animal, Shelter, MatchmakingQuestionnaire } from '../../types/animal';
import { MOCK_SHELTERS } from '../../data/mockShelters';
import { PetImage } from '../PetImage';
import { computeMatchScore, getMatchLabel } from '../../lib/matchScore';
import { 
  Heart, 
  MapPin, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  Info, 
  CheckCircle2, 
  X, 
  Sparkles,
  Zap,
  Check,
  PawPrint
} from 'lucide-react';

interface PetBuyerMarketplaceProps {
  availablePets: Animal[];
  userPets: Animal[];
  quiz: MatchmakingQuestionnaire | null;
  onOpenMatchmakingQuiz: () => void;
  onSelectPetForHandover: (animal: Animal) => void;
  onAdoptPet: (animal: Animal) => Promise<void> | void;
}

export const PetBuyerMarketplace: React.FC<PetBuyerMarketplaceProps> = ({
  availablePets,
  userPets,
  quiz,
  onOpenMatchmakingQuiz,
  onSelectPetForHandover,
  onAdoptPet
}) => {
  const [speciesFilter, setSpeciesFilter] = useState<string>(quiz?.targetPetType || 'all');
  const [selectedPetDetails, setSelectedPetDetails] = useState<Animal | null>(null);
  const [adoptingPet, setAdoptingPet] = useState<Animal | null>(null);
  const [bookingPet, setBookingPet] = useState<Animal | null>(null);
  const [visitDate, setVisitDate] = useState<string>('2026-08-28');
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [adoptionSuccessOverlay, setAdoptionSuccessOverlay] = useState<Animal | null>(null);

  // Filter out pets that are already owned by the logged-in user
  const filteredAnimals = useMemo(() => {
    const ownedIds = new Set(userPets.map(p => p.id));
    const ownedNames = new Set(userPets.map(p => p.name.toLowerCase()));

    const available = availablePets.filter(a => {
      if (ownedIds.has(a.id) || ownedNames.has(a.name.toLowerCase())) return false;
      if (speciesFilter !== 'all' && a.species !== speciesFilter) return false;
      return true;
    });

    if (!quiz) return available;

    return [...available].sort(
      (a, b) => computeMatchScore(b, quiz) - computeMatchScore(a, quiz)
    );
  }, [availablePets, userPets, speciesFilter, quiz]);

  const getShelterForPet = (shelterId: string): Shelter => {
    return MOCK_SHELTERS.find(s => s.id === shelterId) || MOCK_SHELTERS[0];
  };

  const handleConfirmAdoption = async () => {
    if (!adoptingPet) return;
    const petToAdopt = adoptingPet;
    setAdoptingPet(null);
    setSelectedPetDetails(null);
    setAdoptionSuccessOverlay(petToAdopt);

    await onAdoptPet(petToAdopt);

    setTimeout(() => {
      setAdoptionSuccessOverlay(null);
    }, 1800);
  };

  const handleConfirmBooking = () => {
    setBookingSuccess(true);
  };

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative">
      
      {/* Holographic Adoption Complete Overlay */}
      {adoptionSuccessOverlay && (
        <div className="fixed inset-0 z-50 bg-[#060b17]/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-cyan-400 p-1 animate-bounce shadow-[0_0_50px_rgba(245,158,11,0.6)] flex items-center justify-center mb-6">
            <div className="w-full h-full rounded-full bg-[#091122] flex items-center justify-center">
              <PawPrint className="w-12 h-12 text-amber-400 animate-pulse" />
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-wider glow-text-cyan uppercase">
            ✨ ADOPTION COMPLETE ✨
          </h2>
          <p className="mt-3 text-lg font-bold text-cyan-200 max-w-lg">
            Welcome <span className="text-amber-400 font-extrabold">{adoptionSuccessOverlay.name}</span> to your PawSphere family! 🐾
          </p>
          <p className="mt-2 text-xs font-mono text-cyan-300 uppercase tracking-widest bg-cyan-950/80 px-4 py-1.5 rounded-full border border-cyan-400/50">
            ACTIVATING 3D PET SANCTUARY & DIGITAL PASSPORT...
          </p>
        </div>
      )}

      {/* Header Banner */}
      <div className="glass-panel-dark rounded-3xl p-6 sm:p-8 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2">
            <span className="px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 text-xs font-extrabold uppercase tracking-wider flex items-center space-x-1.5 border border-cyan-400/40">
              <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
              <span>PAWSPHERE 3D ADOPTION MARKETPLACE</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Find & Adopt Your <span className="text-amber-400 glow-text-cyan">Forever Companion</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Browse verified adoption animals from top sanctuaries and ethical rescues. Adopt instantly to build their 3D Digital Twin, Passport, and Health Sanctuary.
          </p>
        </div>

        <button
          onClick={onOpenMatchmakingQuiz}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-amber-300/40 transition-all flex items-center space-x-2 whitespace-nowrap hover:scale-105"
        >
          <Sparkles className="w-4 h-4 text-white animate-spin" style={{ animationDuration: '6s' }} />
          <span>{quiz ? 'Retake Matchmaking Quiz' : 'Take 60-Sec Pet Quiz'}</span>
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-cyan-500/20">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center space-x-2">
          <span>AVAILABLE PETS</span>
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-400/40 text-xs">
            {filteredAnimals.length}
          </span>
        </h3>

        <div className="flex space-x-1.5 bg-[#091122]/90 p-1.5 rounded-2xl border border-cyan-500/30 shadow-inner overflow-x-auto">
          {[
            { id: 'all', label: 'All Pets' },
            { id: 'dog', label: '🐕 Dogs' },
            { id: 'cat', label: '🐱 Cats' },
            { id: 'bird', label: '🦜 Birds' },
            { id: 'fish', label: '🐠 Fish' },
            { id: 'reptile', label: '🦎 Reptiles' },
            { id: 'rabbit', label: '🐇 Rabbits' },
            { id: 'hamster', label: '🐹 Hamsters' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSpeciesFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                speciesFilter === f.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'text-slate-300 hover:text-cyan-200 hover:bg-cyan-950/50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAnimals.map(pet => {
          const shelter = getShelterForPet(pet.shelterId);
          const matchScore = quiz ? computeMatchScore(pet, quiz) : null;
          const matchMeta = matchScore !== null ? getMatchLabel(matchScore) : null;
          return (
            <div key={pet.id} className="glass-panel-dark glass-card-hover rounded-3xl p-5 border border-cyan-500/30 shadow-xl space-y-4 flex flex-col justify-between relative overflow-hidden group">
              
              <div className="space-y-3">
                {/* Photo & Price Tag */}
                <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-950 border border-cyan-500/20">
                  <PetImage pet={pet} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                  {/* Match Score Badge */}
                  {matchMeta && matchScore !== null && (
                    <div className={`absolute top-3 right-3 flex items-center space-x-1 px-2.5 py-1 rounded-full border text-[11px] font-extrabold shadow-md ${matchMeta.bg} ${matchMeta.colour}`}>
                      <Sparkles className="w-3 h-3" />
                      <span>{matchScore}% {matchMeta.label}</span>
                    </div>
                  )}
                  
                  {/* Price Tag Pill */}
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-md border border-orange-300/40">
                    {pet.priceOrAdoptionFee}
                  </div>

                  <div className="absolute bottom-3 right-3 bg-[#060b17]/90 backdrop-blur-md text-cyan-300 border border-cyan-400/40 text-[10px] font-extrabold px-2.5 py-1 rounded-lg font-mono">
                    Est. ${pet.monthlyEstCost}/mo Care
                  </div>
                </div>

                {/* Name, Breed & Traits */}
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-lg text-white group-hover:text-cyan-300 transition-colors">{pet.name}</h4>
                    <span className="text-xs text-cyan-200 font-bold">{pet.ageYears} Yrs • {pet.gender}</span>
                  </div>
                  <p className="text-xs font-bold text-amber-400">{pet.breed}</p>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  "{pet.aboutPet}"
                </p>

                {/* Temperament Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {pet.temperament.map(t => (
                    <span key={t} className="px-2.5 py-0.5 rounded-lg bg-cyan-950/80 text-cyan-300 text-[10px] font-extrabold border border-cyan-500/30">
                      {t}
                    </span>
                  ))}
                </div>

                {/* Shelter Location Info */}
                <div className="p-3 rounded-2xl bg-[#091122]/80 border border-cyan-500/20 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white">{shelter.name}</span>
                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded">
                      Verified Sanctuary
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px] flex items-center space-x-1 truncate">
                    <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="truncate">{shelter.address}, {shelter.city}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setSelectedPetDetails(pet)}
                  className="flex-1 py-2.5 rounded-xl bg-[#091122] hover:bg-cyan-950 text-cyan-300 font-bold text-xs border border-cyan-500/40 transition-colors flex items-center justify-center space-x-1"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>View Pet</span>
                </button>

                <button
                  onClick={() => setAdoptingPet(pet)}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-[0_0_15px_rgba(245,158,11,0.4)] border border-orange-400 transition-transform hover:scale-105 flex items-center justify-center space-x-1 uppercase tracking-wider"
                >
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  <span>Adopt</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Full Pet Info Modal */}
      {selectedPetDetails && (
        <div className="fixed inset-0 z-50 bg-[#060b17]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel-dark bg-[#091122] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-cyan-400 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
              <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
                <PawPrint className="w-5 h-5 text-cyan-400" />
                <span>Pet Details — {selectedPetDetails.name}</span>
              </h3>
              <button onClick={() => setSelectedPetDetails(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden h-56 border border-cyan-500/30">
              <PetImage pet={selectedPetDetails} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-md">
                {selectedPetDetails.priceOrAdoptionFee}
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between bg-cyan-950/60 p-3 rounded-xl border border-cyan-500/30 font-bold">
                <span className="text-cyan-300">Species & Breed:</span>
                <span className="text-white font-extrabold">{selectedPetDetails.breed} ({selectedPetDetails.species.toUpperCase()})</span>
              </div>

              <div>
                <span className="font-extrabold text-white uppercase block mb-1">About This Companion:</span>
                <p className="text-slate-300 leading-relaxed bg-[#060b17] p-3 rounded-xl border border-slate-800">
                  {selectedPetDetails.aboutPet}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#060b17] p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-bold block text-[10px]">ENERGY LEVEL</span>
                  <span className="font-extrabold text-white text-xs">{selectedPetDetails.energyLevel}</span>
                </div>
                <div className="bg-[#060b17] p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-bold block text-[10px]">FAMILY SUITABILITY</span>
                  <span className="font-extrabold text-emerald-400 text-xs">{selectedPetDetails.goodWithKids ? 'Yes, Family Friendly' : 'Adult Companion'}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setSelectedPetDetails(null)}
                className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const pet = selectedPetDetails;
                  setSelectedPetDetails(null);
                  setAdoptingPet(pet);
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-lg shadow-amber-500/30 uppercase tracking-wider flex items-center justify-center space-x-1"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>Adopt {selectedPetDetails.name} Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adoption Confirmation Modal */}
      {adoptingPet && (
        <div className="fixed inset-0 z-50 bg-[#060b17]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel-dark bg-[#091122] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border-2 border-cyan-400 animate-fadeIn">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 p-1 mx-auto shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center">
                <Heart className="w-8 h-8 text-white fill-white" />
              </div>
              <h3 className="text-xl font-extrabold text-white">
                READY TO GIVE {adoptingPet.name.toUpperCase()} A FOREVER HOME? 🐾
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                By confirming adoption, <strong className="text-cyan-300">{adoptingPet.name}</strong> ({adoptingPet.breed}) will be added to your PawSphere Pet World, header, status HUD, Digital Twin, and Passport.
              </p>
            </div>

            <div className="p-3 bg-[#060b17] rounded-xl border border-cyan-500/30 text-xs space-y-1">
              <div className="flex justify-between text-slate-300 font-bold">
                <span>Adoption Companion:</span>
                <span className="text-white">{adoptingPet.name} ({adoptingPet.breed})</span>
              </div>
              <div className="flex justify-between text-slate-300 font-bold">
                <span>Verification & Health:</span>
                <span className="text-emerald-400">✓ Fully Checked</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setAdoptingPet(null)}
                className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-800"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirmAdoption}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-lg shadow-amber-500/40 uppercase tracking-wider flex items-center justify-center space-x-1"
              >
                <Check className="w-4 h-4" />
                <span>CONFIRM ADOPTION</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
