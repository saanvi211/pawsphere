import React, { useState } from 'react';
import { SpatialBackground3D } from './components/three/SpatialBackground3D';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingView } from './components/views/LandingView';
import { PetBuyerMarketplace } from './components/views/PetBuyerMarketplace';
import { ShelterDirectoryMap } from './components/views/ShelterDirectoryMap';
import { OwnerDashboard } from './components/views/OwnerDashboard';
import { DigitalTwinViewport } from './components/three/DigitalTwinViewport';
import { PassportView } from './components/views/PassportView';
import { AITriageView } from './components/views/AITriageView';
import { EmergencyView } from './components/views/EmergencyView';
import { MatchmakingWizard } from './components/views/MatchmakingWizard';
import { PassportHandover } from './components/views/PassportHandover';
import { NutritionCenter } from './components/views/NutritionCenter';
import { PetShoppingHub } from './components/views/PetShoppingHub';
import { CommunityView } from './components/views/CommunityView';
import { GroomingSalonView } from './components/views/GroomingSalonView';
import { AuthModal } from './components/modals/AuthModal';
import { FloatingAIChatbot } from './components/layout/FloatingAIChatbot';
import { useAuth } from './hooks/useAuth';
import { useAnimals } from './hooks/useAnimals';
import { MatchmakingQuestionnaire } from './types/animal';
import { saveStorageQuiz, getStorageQuiz } from './db/storage';
import { isSupabaseConfigured } from './lib/supabase';
import { saveMatchmakingQuiz, getMatchmakingQuiz } from './lib/api/matchmaking';

import { MOCK_ANIMALS } from './data/mockAnimals';

export const App: React.FC = () => {
  const { user, isLoggedIn, isLoading, setUser, logout } = useAuth();

  const {
    animals,
    activePet,
    activePetId,
    setActivePetId,
    addAnimal,
    updateLocalAnimal,
    removeAnimal,
    refreshAnimals,
  } = useAnimals(user?.id ?? null);

  const handleAdoptPet = async (petToAdopt: typeof MOCK_ANIMALS[0]) => {
    if (!user) {
      handleOpenAuthModal('login');
      return;
    }

    const created = await addAnimal({
      name: petToAdopt.name,
      species: petToAdopt.species,
      breed: petToAdopt.breed,
      ageYears: petToAdopt.ageYears,
      gender: petToAdopt.gender,
      weightKg: petToAdopt.weightKg,
      microchipId: petToAdopt.microchipId,
      photoUrl: petToAdopt.photoUrl,
      priceOrAdoptionFee: 'Adopted Family Companion',
      aboutPet: petToAdopt.aboutPet,
      energyLevel: petToAdopt.energyLevel,
      temperament: petToAdopt.temperament,
      goodWithKids: petToAdopt.goodWithKids,
      goodWithOtherPets: petToAdopt.goodWithOtherPets,
      careLevel: petToAdopt.careLevel,
      monthlyEstCost: petToAdopt.monthlyEstCost,
      shelterId: petToAdopt.shelterId || 'adopted',
      isAvailableForAdoptionOrSale: false,
      healthScore: petToAdopt.healthScore || 96,
    }, user.id);

    if (created) {
      setActivePetId(created.id);
      setCurrentTab('dashboard');
    }
  };


  const [currentTab, setCurrentTab] = useState<string>(() => window.location.pathname.startsWith('/pet-shopping') ? 'pet-shopping' : 'landing');
  const [quiz, setQuiz] = useState<MatchmakingQuestionnaire | null>(getStorageQuiz());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  const handleOpenAuthModal = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = async (updatedUser: typeof user) => {
    if (!updatedUser) return;
    setUser(updatedUser);
    try {
      await refreshAnimals(updatedUser.id);
      if (isSupabaseConfigured) {
        const dbQuiz = await getMatchmakingQuiz(updatedUser.id);
        if (dbQuiz) setQuiz(dbQuiz);
      }
    } catch (e) {
      console.warn('[App] Non-fatal error loading user data:', e);
    }
    setCurrentTab('dashboard');
    setIsAuthModalOpen(false);
  };


  const handleLogout = async () => {
    await logout();
    setCurrentTab('landing');
  };

  const handleQuizComplete = async (newQuiz: MatchmakingQuestionnaire) => {
    setQuiz(newQuiz);
    saveStorageQuiz(newQuiz);
    if (isSupabaseConfigured && user) {
      await saveMatchmakingQuiz(user.id, newQuiz);
    }
    setCurrentTab('buy-pets');
  };

  const handleSelectPetForHandover = () => {
    setCurrentTab('handover');
  };

  // Show a minimal loading state on first mount (session restore)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-solidBlue border-t-transparent animate-spin" />
          <p className="text-slate-500 font-semibold text-sm">Loading PawSphere...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative bg-[#060b17] text-slate-100 font-sans selection:bg-brand-solidOrange selection:text-white">

      {/* Universal 3D Spatial Canvas Background (hidden on grooming page) */}
      {currentTab !== 'grooming' && <SpatialBackground3D />}

      {/* Main Navigation Header (hidden on grooming page) */}
      {currentTab !== 'grooming' && (
        <Navbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          user={user ?? undefined}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
          animals={animals}
          activePetId={activePetId}
          setActivePetId={setActivePetId}
          openAuthModal={handleOpenAuthModal}
        />
      )}

      {/* Main Content Router */}
      <main className="flex-1 z-10">

        {/* PUBLIC — Landing Page only for guests */}
        {!isLoggedIn && (
          <LandingView
            onOpenAuthModal={handleOpenAuthModal}
            onExplorePublicPets={() => handleOpenAuthModal('login')}
            onNavigate={setCurrentTab}
            isLoggedIn={false}
          />
        )}

        {/* PROTECTED — All app pages */}
        {isLoggedIn && (
          <>
            {currentTab === 'landing' && (
              <LandingView
                onOpenAuthModal={handleOpenAuthModal}
                onExplorePublicPets={() => setCurrentTab('buy-pets')}
                onNavigate={setCurrentTab}
                isLoggedIn={true}
              />
            )}

            {currentTab === 'buy-pets' && (
              <PetBuyerMarketplace
                availablePets={MOCK_ANIMALS}
                userPets={animals}
                quiz={quiz}
                onOpenMatchmakingQuiz={() => setCurrentTab('matchmaking')}
                onSelectPetForHandover={handleSelectPetForHandover}
                onAdoptPet={handleAdoptPet}
              />
            )}


            {currentTab === 'shelters' && <ShelterDirectoryMap />}

            {currentTab === 'dashboard' && (
              <OwnerDashboard
                user={user!}
                animal={activePet ?? null}
                allAnimals={animals}
                onSelectAnimal={setActivePetId}
                onOpen3DViewer={() => setCurrentTab('digital-twin')}
                onOpenPassport={() => setCurrentTab('passport')}
                onOpenAITriage={() => setCurrentTab('ai-triage')}
                onOpenEmergency={() => setCurrentTab('emergency')}
                onAddAnimal={(a) => user ? addAnimal(a, user.id) : Promise.resolve(null)}
                onUpdateAnimal={updateLocalAnimal}
                onRemoveAnimal={removeAnimal}
                onUpdateUser={setUser}
                onSelectTab={setCurrentTab}
              />
            )}

            {currentTab === 'digital-twin' && (
              <DigitalTwinViewport
                animal={activePet!}
                allAnimals={animals}
                onSelectAnimal={setActivePetId}
                onOpenPassport={() => setCurrentTab('passport')}
                onOpenAITriage={() => setCurrentTab('ai-triage')}
              />
            )}

            {currentTab === 'grooming' && (
              <GroomingSalonView
                user={user!}
                animal={activePet ?? null}
                onSelectTab={setCurrentTab}
                onBackToDashboard={() => setCurrentTab('dashboard')}
              />
            )}

            {currentTab === 'passport' && (
              <PassportView
                animal={activePet!}
                onUpdateAnimal={updateLocalAnimal}
              />
            )}

            {currentTab === 'ai-triage' && (
              <AITriageView animal={activePet ?? null} />
            )}

            {currentTab === 'nutrition' && (
              <div className="py-6">
                <NutritionCenter userId={user!.id} animal={activePet ?? null} />
              </div>
            )}

            {currentTab === 'pet-shopping' && (
              <PetShoppingHub
                userId={user!.id}
                animal={activePet ?? null}
                allAnimals={animals}
                onSelectAnimal={setActivePetId}
              />
            )}

            {currentTab === 'community' && (
              <CommunityView user={user!} animal={activePet ?? null} />
            )}

            {currentTab === 'emergency' && (
              <EmergencyView animal={activePet!} userPhone={user?.phone} />
            )}

            {currentTab === 'matchmaking' && (
              <MatchmakingWizard onComplete={handleQuizComplete} />
            )}

            {currentTab === 'handover' && (
              <PassportHandover
                selectedAnimal={activePet ?? undefined}

                onHandoverComplete={(u, a) => {
                  setUser(u);
                  setActivePetId(a.id);
                  setCurrentTab('dashboard');
                }}
              />
            )}
          </>
        )}

      </main>

      {/* Footer (hidden on grooming page) */}
      {currentTab !== 'grooming' && <Footer setCurrentTab={setCurrentTab} isLoggedIn={isLoggedIn} />}

      {/* Floating AI Chatbot — only for authenticated users (not on grooming page) */}
      {isLoggedIn && currentTab !== 'grooming' && <FloatingAIChatbot animal={activePet ?? null} />}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        user={user ?? undefined}
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
};
