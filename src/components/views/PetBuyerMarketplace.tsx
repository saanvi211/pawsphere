import React, { useState, useMemo } from 'react';
import { Animal, Shelter, MatchmakingQuestionnaire } from '../../types/animal';
import { MOCK_SHELTERS } from '../../data/mockShelters';
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
  DollarSign, 
  Sparkles,
  Dog,
  Cat,
  Bird,
  Fish
} from 'lucide-react';

interface PetBuyerMarketplaceProps {
  animals: Animal[];
  quiz: MatchmakingQuestionnaire | null;
  onOpenMatchmakingQuiz: () => void;
  onSelectPetForHandover: (animal: Animal) => void;
}

export const PetBuyerMarketplace: React.FC<PetBuyerMarketplaceProps> = ({
  animals,
  quiz,
  onOpenMatchmakingQuiz,
  onSelectPetForHandover
}) => {
  const [speciesFilter, setSpeciesFilter] = useState<string>(quiz?.targetPetType || 'all');
  const [selectedPetDetails, setSelectedPetDetails] = useState<Animal | null>(null);
  const [bookingPet, setBookingPet] = useState<Animal | null>(null);
  const [visitDate, setVisitDate] = useState<string>('2026-08-28');
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

  const filteredAnimals = useMemo(() => {
    const available = animals.filter(a => {
      if (speciesFilter !== 'all' && a.species !== speciesFilter) return false;
      return a.isAvailableForAdoptionOrSale;
    });

    if (!quiz) return available;

    // Sort by match score descending
    return [...available].sort(
      (a, b) => computeMatchScore(b, quiz) - computeMatchScore(a, quiz)
    );
  }, [animals, speciesFilter, quiz]);

  const getShelterForPet = (shelterId: string): Shelter => {
    return MOCK_SHELTERS.find(s => s.id === shelterId) || MOCK_SHELTERS[0];
  };

  const handleConfirmBooking = () => {
    setBookingSuccess(true);
  };

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2">
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold uppercase tracking-wider flex items-center space-x-1">
              <Heart className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>Pet Buyers & Adopters Hub</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Find Your Dream Pet <span className="text-amber-600">to Adopt or Buy</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Browse available Dogs, Cats, Birds, Fish, and Reptiles from verified local adoption shelters and ethical breeders with full location and contact info.
          </p>
        </div>

        <button
          onClick={onOpenMatchmakingQuiz}
          className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-lg shadow-amber-500/30 transition-all flex items-center space-x-2 whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4" />
          <span>{quiz ? 'Retake Matchmaking Quiz' : 'Take 60-Sec Pet Quiz'}</span>
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700">
          Available Pets ({filteredAnimals.length})
        </h3>

        <div className="flex space-x-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          {[
            { id: 'all', label: 'All Pets' },
            { id: 'dog', label: 'Dogs' },
            { id: 'cat', label: 'Cats' },
            { id: 'bird', label: 'Birds' },
            { id: 'fish', label: 'Fish' },
            { id: 'reptile', label: 'Reptiles' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSpeciesFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                speciesFilter === f.id
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-amber-50'
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
            <div key={pet.id} className="glass-card glass-card-hover rounded-3xl p-5 border border-white shadow-lg space-y-4 flex flex-col justify-between">
              
              <div className="space-y-3">
                {/* Photo & Price Tag */}
                <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-100">
                  <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover" />

                  {/* Match Score Badge */}
                  {matchMeta && matchScore !== null && (
                    <div className={`absolute top-3 right-3 flex items-center space-x-1 px-2.5 py-1 rounded-full border text-[11px] font-extrabold shadow-sm ${matchMeta.bg} ${matchMeta.colour}`}>
                      <Sparkles className="w-3 h-3" />
                      <span>{matchScore}% {matchMeta.label}</span>
                    </div>
                  )}
                  
                  {/* Price Tag Pill */}
                  <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-md">
                    {pet.priceOrAdoptionFee}
                  </div>

                  <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg">
                    Est. ${pet.monthlyEstCost}/mo Care
                  </div>
                </div>


                {/* Name, Breed & Traits */}
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-lg text-slate-900">{pet.name}</h4>
                    <span className="text-xs text-slate-500 font-bold">{pet.ageYears} Yrs • {pet.gender}</span>
                  </div>
                  <p className="text-xs font-bold text-amber-700">{pet.breed}</p>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  "{pet.aboutPet}"
                </p>

                {/* Temperament Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {pet.temperament.map(t => (
                    <span key={t} className="px-2.5 py-0.5 rounded-lg bg-amber-100/70 text-amber-900 text-[10px] font-bold border border-amber-200">
                      {t}
                    </span>
                  ))}
                </div>

                {/* Shelter Location Info */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900">{shelter.name}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Verified
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px] flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>{shelter.address}, {shelter.city}</span>
                  </div>
                  <div className="text-slate-500 text-[11px] flex items-center space-x-1">
                    <Phone className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>{shelter.phone}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setSelectedPetDetails(pet)}
                  className="flex-1 py-2.5 rounded-xl glass-card hover:bg-white text-slate-800 font-bold text-xs border border-slate-300 transition-colors"
                >
                  Full Pet Details
                </button>

                <button
                  onClick={() => setBookingPet(pet)}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md shadow-amber-500/30 transition-transform hover:scale-105"
                >
                  Book Visit to Get Pet
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Full Pet Info Modal */}
      {selectedPetDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-lg font-extrabold text-slate-900">Complete Info for {selectedPetDetails.name}</h3>
              <button onClick={() => setSelectedPetDetails(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <img src={selectedPetDetails.photoUrl} alt={selectedPetDetails.name} className="w-full h-56 rounded-2xl object-cover" />

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between bg-amber-50 p-3 rounded-xl border border-amber-200 font-bold">
                <span className="text-amber-900">Price / Adoption Fee:</span>
                <span className="text-amber-900 text-sm">{selectedPetDetails.priceOrAdoptionFee}</span>
              </div>

              <div>
                <span className="font-extrabold text-slate-800 uppercase block mb-1">About This Pet:</span>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {selectedPetDetails.aboutPet}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-bold block">Energy Level</span>
                  <span className="font-extrabold text-slate-900">{selectedPetDetails.energyLevel}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-bold block">Good with Kids</span>
                  <span className="font-extrabold text-emerald-700">{selectedPetDetails.goodWithKids ? 'Yes, Family Friendly' : 'Best for Adults'}</span>
                </div>
              </div>

              {/* How to Get Step Guide */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300 space-y-2">
                <span className="font-extrabold text-amber-900 uppercase block">How You Can Get This Pet:</span>
                <ol className="space-y-1 text-amber-900 font-semibold list-decimal list-inside">
                  <li>Click "Book Visit to Get Pet" to choose your appointment date.</li>
                  <li>Visit the shelter/breeder at {getShelterForPet(selectedPetDetails.shelterId).address}.</li>
                  <li>Complete identity check & receive digital QR pet passport handover!</li>
                </ol>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  const pet = selectedPetDetails;
                  setSelectedPetDetails(null);
                  setBookingPet(pet);
                }}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-lg shadow-amber-500/30"
              >
                Book Visit Slot Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Visit Modal */}
      {bookingPet && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-white">
            {!bookingSuccess ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h3 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-amber-600" />
                    <span>Schedule Visit to Get {bookingPet.name}</span>
                  </h3>
                  <button onClick={() => setBookingPet(null)} className="p-1 text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-slate-900">{getShelterForPet(bookingPet.shelterId).name}</div>
                  <div className="text-slate-500">{getShelterForPet(bookingPet.shelterId).address}</div>
                  <div className="text-amber-700 font-semibold">{getShelterForPet(bookingPet.shelterId).phone}</div>
                </div>

                <div className="space-y-2 text-xs">
                  <label className="font-bold text-slate-700 block">Choose Appointment Date:</label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={e => setVisitDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button onClick={() => setBookingPet(null)} className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700">
                    Cancel
                  </button>
                  <button onClick={handleConfirmBooking} className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white font-extrabold text-xs shadow-md">
                    Confirm Appointment
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4 py-2">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">Visit Scheduled!</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your visit to meet <strong>{bookingPet.name}</strong> on {visitDate} is confirmed. Upon approval, you will receive digital passport handover!
                </p>
                <button
                  onClick={() => {
                    const pet = bookingPet;
                    setBookingSuccess(false);
                    setBookingPet(null);
                    onSelectPetForHandover(pet);
                  }}
                  className="w-full py-3 rounded-xl bg-amber-500 text-white font-extrabold text-xs shadow-lg shadow-amber-500/30"
                >
                  Proceed to Passport Handover Screen →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
