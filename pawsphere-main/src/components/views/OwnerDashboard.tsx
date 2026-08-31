import React, { useState } from 'react';
import { PetImage } from '../PetImage';
import { Animal, UserProfile } from '../../types/animal';
import { MOCK_SHELTERS } from '../../data/mockShelters';
import { PetWorld3DScene } from '../three/PetWorld3DScene';
import { AddPetModal } from '../modals/AddPetModal';
import { EditPetModal } from '../modals/EditPetModal';
import { 
  Heart, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  QrCode, 
  ShieldAlert, 
  Plus, 
  CheckCircle, 
  Edit2,
  Compass,
  ArrowRight,
  Bot,
  Activity,
  ChevronRight,
  Users,
  Sparkles
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
  onAddAnimal?: (animal: Omit<Animal, 'id' | 'vaccinations' | 'medicalHistory' | 'bodyPins'>, userId: string) => Promise<Animal | null>;
  onUpdateAnimal?: (animal: Animal) => Promise<void>;
  onRemoveAnimal?: (id: string) => Promise<void>;
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
  onRemoveAnimal,
  onSelectTab
}) => {
  const displayName = user?.name || 'PawSphere Guardian';
  const displayEmail = user?.email || 'Email not provided';
  const displayPhone = user?.phone || 'Phone not provided';
  const roleLabel = user?.role === 'pet_owner' ? 'PET GUARDIAN' : user?.role === 'vet' ? 'VETERINARIAN' : user?.role === 'shelter_staff' ? 'SHELTER STAFF' : 'PET ADOPTER';
  const initials = displayName.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();

  // Scanning Chamber Transition State
  const [isScanningTransition, setIsScanningTransition] = useState(false);

  // Modals state
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [showEditPetModal, setShowEditPetModal] = useState(false);

  // Hackathon Wow Moment 3D Digital Twin Scanning Chamber Trigger
  const triggerScanningChamberTransition = () => {
    if (!animal) {
      setShowAddPetModal(true);
      return;
    }
    setIsScanningTransition(true);
    setTimeout(() => {
      setIsScanningTransition(false);
      onOpen3DViewer();
    }, 1500);
  };

  // Derived pet display attributes
  const hasPets = allAnimals.length > 0 && animal !== null;
  const currentPetName = animal?.name || '';
  const currentPetBreed = animal?.breed || '';
  const currentPetAge = animal?.ageYears ? `${animal.ageYears} Years Old` : '';
  const currentHealthScore = animal?.healthScore ?? 95;
  const healthBadgeText = currentHealthScore >= 80 ? 'Healthy' : 'Checkup Due';

  // Derived Nearby Care Listings from MOCK_SHELTERS
  const nearbyCareListings = MOCK_SHELTERS.slice(0, 4);

  return (
    <div className="py-4 sm:py-6 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 text-xs font-semibold text-slate-100 selection:bg-brand-solidOrange">

      {/* DYNAMIC 3D PET WORLD MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: User Guardian Profile & Companions List */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Top Left: User Profile Card */}
          <div className="glass-panel-dark rounded-3xl p-5 border border-cyan-500/30 shadow-xl space-y-4 relative overflow-hidden">
            <div className="space-y-1">
              <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-400/30 inline-block">
                {roleLabel}
              </span>
              <h3 className="text-base font-extrabold text-white">Welcome, {displayName.split(' ')[0]}! 🐾</h3>
            </div>

            <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-[10px] text-cyan-300 font-mono flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>Verification Hub Active</span>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-300 pt-1">
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">{displayEmail}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{displayPhone}</span>
              </div>
            </div>
          </div>

          {/* Bottom Left: Your Companions Panel */}
          <div className="glass-panel-dark rounded-3xl p-5 border border-cyan-500/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <Heart className="w-4 h-4 text-pink-400" />
                <span>MY COMPANIONS</span>
              </h4>
              <button 
                onClick={() => setShowAddPetModal(true)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 text-white text-[11px] font-extrabold flex items-center space-x-1 border border-orange-400 shadow-[0_0_10px_rgba(234,88,12,0.3)] uppercase tracking-wider"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Pet</span>
              </button>
            </div>

            {hasPets ? (
              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                {allAnimals.map((pet) => {
                  const isActive = animal?.id === pet.id;
                  return (
                    <div
                      key={pet.id}
                      onClick={() => onSelectAnimal(pet.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-900/70 to-cyan-900/50 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                          : 'bg-[#091122]/60 border-slate-800 hover:border-cyan-500/40 hover:bg-[#091122]/90'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <PetImage
                          pet={pet}
                          className="w-12 h-12 rounded-xl object-cover border-2 border-cyan-400/50 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-extrabold text-white truncate flex items-center space-x-1">
                            <span>{pet.name}</span>
                            {isActive && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
                          </div>
                          <div className="text-[10px] text-cyan-300 truncate">{pet.breed}</div>
                          <div className="text-[9px] text-slate-400">{pet.ageYears} Years Old</div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-1.5 shrink-0 ml-2">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                          Healthy
                        </span>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectAnimal(pet.id);
                              setShowEditPetModal(true);
                            }}
                            className="p-1 rounded bg-slate-800 text-cyan-300 hover:bg-cyan-900 hover:text-white"
                            title="Edit Pet"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <ChevronRight className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-[#091122]/60 border border-slate-800 text-center space-y-3">
                <p className="text-slate-400 text-[11px]">No companions added yet.</p>
                <button
                  onClick={() => setShowAddPetModal(true)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-xs shadow-md uppercase tracking-wider border border-orange-400"
                >
                  + Add Pet
                </button>
              </div>
            )}
          </div>

        </div>

        {/* CENTER COLUMN: Central 3D Pet World & Spatial Portals */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Central Pet Header */}
          {hasPets ? (
            <div className="text-center space-y-1">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-wider text-white glow-text-cyan uppercase">
                {currentPetName}
              </h2>
              <div className="flex items-center justify-center space-x-3 text-xs font-semibold text-cyan-200">
                <span>{currentPetBreed}</span>
                <span>•</span>
                <span>{currentPetAge}</span>
                <span>•</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-400/50 text-[10px] font-extrabold">
                  💚 {healthBadgeText}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-2 py-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-white glow-text-cyan uppercase">
                Meet Your Companion
              </h2>
              <p className="text-xs text-cyan-200 font-semibold max-w-md mx-auto">
                Add your first pet to create their PawSphere profile.
              </p>
              <button
                onClick={() => setShowAddPetModal(true)}
                className="mt-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-xs shadow-[0_0_20px_rgba(234,88,12,0.5)] border border-orange-400 uppercase tracking-widest hover:scale-105 transition-all inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ ADD PET</span>
              </button>
            </div>
          )}

          {/* Interactive 3D Sanctuary Canvas & Spatial Feature Portals */}
          <div className="glass-panel-dark rounded-3xl border border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.15)] relative overflow-hidden">
            <PetWorld3DScene 
              animal={animal}
              onOpenAITriage={onOpenAITriage}
              onOpen3DViewer={triggerScanningChamberTransition}
              onOpenPassport={onOpenPassport}
              onSelectTab={onSelectTab || (() => {})}
              isScanningTransition={isScanningTransition}
              onOpenAddPet={() => setShowAddPetModal(true)}
            />
          </div>

        </div>

        {/* RIGHT COLUMN: Pet Status HUD & Nearby Care Hub */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Top Right: Status HUD Panel */}
          <div className="glass-panel-dark rounded-3xl p-5 border border-cyan-500/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>{hasPets ? `${currentPetName.toUpperCase()}'S STATUS` : 'PET HEALTH STATUS'}</span>
              </h4>
              {hasPets && (
                <button 
                  onClick={() => setShowEditPetModal(true)} 
                  className="p-1.5 rounded-lg bg-slate-800 text-cyan-300 hover:bg-cyan-900 hover:text-white transition-colors"
                  title="Edit Pet Profile"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {hasPets ? (
              <>
                {/* Decorative ECG Monitoring Pulse Wave */}
                <div className="h-9 bg-[#060b17] rounded-xl border border-cyan-500/30 p-1 flex items-center justify-center overflow-hidden">
                  <svg className="w-full h-full text-cyan-400" viewBox="0 0 300 40">
                    <path 
                      d="M0,20 L40,20 L50,5 L60,35 L70,10 L80,25 L90,20 L150,20 L160,5 L170,35 L180,10 L190,25 L200,20 L300,20" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      className="animate-ecg-path" 
                    />
                  </svg>
                </div>

                {/* Vitals Grid */}
                <div className="space-y-2.5 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-[#091122]/70 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Weight Vitals</span>
                    <span className="font-extrabold text-white">{animal?.weightKg ? `${animal.weightKg} kg` : 'Not available'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#091122]/70 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Microchip Tag</span>
                    <span className="font-extrabold text-cyan-300 font-mono text-[10px] truncate max-w-[120px]">
                      {animal?.microchipId || 'Not Tagged'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#091122]/70 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Vaccination Status</span>
                    <span className="font-extrabold text-emerald-400 flex items-center space-x-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Up to date</span>
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#091122]/70 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Next Checkup</span>
                    <span className="font-extrabold text-cyan-200">
                      {animal?.vaccinations?.[0]?.nextDueDate || new Date(Date.now() + 90 * 86400000).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                </div>

                <button 
                  onClick={onOpenPassport}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center space-x-1.5"
                >
                  <span>View Digital Passport</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="p-5 rounded-2xl bg-[#091122]/60 border border-slate-800 text-center space-y-3">
                <p className="text-slate-400 text-[11px]">No active pet selected. Add your first pet companion to monitor health & vitals.</p>
                <button
                  onClick={() => setShowAddPetModal(true)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-xs shadow-md uppercase tracking-wider border border-orange-400"
                >
                  + Add Pet
                </button>
              </div>
            )}
          </div>

          {/* Bottom Right: Nearby Care Hub Panel */}
          <div className="glass-panel-dark rounded-3xl p-5 border border-cyan-500/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>NEARBY CARE HUB</span>
              </h4>
              <button 
                onClick={() => onSelectTab?.('shelters')}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-extrabold"
              >
                View All
              </button>
            </div>

            {/* Dynamic Listings from MOCK_SHELTERS */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {nearbyCareListings.map((shelter) => (
                <div key={shelter.id} className="p-2.5 rounded-xl bg-[#091122]/70 border border-slate-800 space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-extrabold text-white truncate max-w-[130px]">{shelter.name}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                      {shelter.city || '1.2 km'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{shelter.address}</div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => onSelectTab?.('shelters')}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center space-x-1.5"
            >
              <span>Open Full Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* BOTTOM ROW: 5 FLOATING FEATURE QUICK CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-4">
        
        {/* Card 1: AI Health Helper */}
        <div 
          onClick={onOpenAITriage}
          className="glass-panel-dark glass-panel-dark-hover p-4 rounded-3xl border border-cyan-500/30 cursor-pointer space-y-3"
        >
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs font-extrabold text-white">AI Health Helper</h5>
            <p className="text-[10px] text-slate-300 mt-1 line-clamp-2">
              {hasPets ? `Ask anything about ${currentPetName}'s health` : 'Ask anything about pet care & symptoms'}
            </p>
          </div>
          <div className="flex items-center text-[10px] font-bold text-cyan-400">
            <span>Ask Helper</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Card 2: 3D Digital Twin */}
        <div 
          onClick={triggerScanningChamberTransition}
          className="glass-panel-dark glass-panel-dark-hover p-4 rounded-3xl border border-cyan-500/30 cursor-pointer space-y-3"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs font-extrabold text-white">3D Digital Twin</h5>
            <p className="text-[10px] text-slate-300 mt-1 line-clamp-2">
              {hasPets ? `Explore ${currentPetName}'s interactive twin` : 'Interactive 3D anatomical viewer'}
            </p>
          </div>
          <div className="flex items-center text-[10px] font-bold text-blue-400">
            <span>Explore Twin</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Card 3: Digital Passport */}
        <div 
          onClick={onOpenPassport}
          className="glass-panel-dark glass-panel-dark-hover p-4 rounded-3xl border border-cyan-500/30 cursor-pointer space-y-3"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs font-extrabold text-white">Digital Passport</h5>
            <p className="text-[10px] text-slate-300 mt-1 line-clamp-2">
              View identity & medical records
            </p>
          </div>
          <div className="flex items-center text-[10px] font-bold text-emerald-400">
            <span>View Passport</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Card 4: Adopt / Matchmaking */}
        <div 
          onClick={() => onSelectTab?.('buy-pets')}
          className="glass-panel-dark glass-panel-dark-hover p-4 rounded-3xl border border-cyan-500/30 cursor-pointer space-y-3"
        >
          <div className="w-10 h-10 rounded-2xl bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-pink-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs font-extrabold text-white">Adopt / Matchmaking</h5>
            <p className="text-[10px] text-slate-300 mt-1 line-clamp-2">
              Find your pet's perfect match
            </p>
          </div>
          <div className="flex items-center text-[10px] font-bold text-pink-400">
            <span>Find Match</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Card 5: 24/7 ER Vet */}
        <div 
          onClick={onOpenEmergency}
          className="glass-panel-dark glass-panel-dark-hover p-4 rounded-3xl border border-red-500/40 cursor-pointer space-y-3"
        >
          <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-400/40 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h5 className="text-xs font-extrabold text-white">24/7 ER Vet</h5>
            <p className="text-[10px] text-slate-300 mt-1 line-clamp-2">
              Emergency assistance anytime
            </p>
          </div>
          <div className="flex items-center text-[10px] font-bold text-red-400">
            <span>Call ER Vet</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

      </div>

      {/* ADD PET MODAL */}
      <AddPetModal
        isOpen={showAddPetModal}
        onClose={() => setShowAddPetModal(false)}
        userId={user.id}
        onAddAnimal={(a) => onAddAnimal ? onAddAnimal(a, user.id) : Promise.resolve(null)}
        onSelectAnimal={onSelectAnimal}
      />

      {/* EDIT PET MODAL */}
      <EditPetModal
        isOpen={showEditPetModal}
        onClose={() => setShowEditPetModal(false)}
        animal={animal}
        onUpdateAnimal={onUpdateAnimal || (async () => {})}
        onRemoveAnimal={onRemoveAnimal || (async () => {})}
      />

    </div>
  );
};
