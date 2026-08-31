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
import { AuthModal } from './components/modals/AuthModal';
import { FloatingAIChatbot } from './components/layout/FloatingAIChatbot';
import { useAuth } from './hooks/useAuth';
import { useAnimals } from './hooks/useAnimals';
import { MatchmakingQuestionnaire } from './types/animal';
import { saveStorageQuiz, getStorageQuiz } from './db/storage';
import { isSupabaseConfigured } from './lib/supabase';
import { saveMatchmakingQuiz, getMatchmakingQuiz } from './lib/api/matchmaking';

export const App: React.FC = () => {
  const { user, isLoggedIn, isLoading, setUser, logout } = useAuth();

  const {
    animals,
    activePet,
    activePetId,
    setActivePetId,
    addAnimal,
    updateLocalAnimal,
    refreshAnimals,
  } = useAnimals(user?.id ?? null);

  const [currentTab, setCurrentTab] = useState<string>('landing');
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
    // Fetch fresh animals from Supabase on login
    if (isSupabaseConfigured) {
      await refreshAnimals(updatedUser.id);
      // Also restore matchmaking quiz from DB
      const dbQuiz = await getMatchmakingQuiz(updatedUser.id);
      if (dbQuiz) setQuiz(dbQuiz);
    }
    if (updatedUser.role === 'looking_to_buy_or_adopt') {
      setCurrentTab('buy-pets');
    } else {
      setCurrentTab('dashboard');
    }
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
    <div className="min-h-screen flex flex-col relative bg-slate-50 text-slate-800 font-sans selection:bg-brand-solidOrange selection:text-white">

      {/* Universal 3D Spatial Canvas Background */}
      <SpatialBackground3D />

      {/* Main Navigation Header */}
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

      {/* Main Content Router */}
      <main className="flex-1 z-10">

        {/* PUBLIC — Landing Page only for guests */}
        {!isLoggedIn && (
          <LandingView
            onOpenAuthModal={handleOpenAuthModal}
            onExplorePublicPets={() => handleOpenAuthModal('login')}
          />
        )}

        {/* PROTECTED — All app pages */}
        {isLoggedIn && (
          <>
            {currentTab === 'landing' && (
              <LandingView
                onOpenAuthModal={handleOpenAuthModal}
                onExplorePublicPets={() => setCurrentTab('buy-pets')}
              />
            )}

            {currentTab === 'buy-pets' && (
              <PetBuyerMarketplace
                animals={animals}
                quiz={quiz}
                onOpenMatchmakingQuiz={() => setCurrentTab('matchmaking')}
                onSelectPetForHandover={handleSelectPetForHandover}
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
                onAddAnimal={(a) => user && addAnimal(a, user.id)}
                onUpdateAnimal={updateLocalAnimal}
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

            {currentTab === 'passport' && (
              <PassportView
                animal={activePet!}
                onUpdateAnimal={updateLocalAnimal}
              />
            )}

            {currentTab === 'ai-triage' && (
              <AITriageView animal={activePet ?? null} />
            )}

            {currentTab === 'emergency' && (
              <EmergencyView animal={activePet!} userPhone={user?.phone} />
            )}

            {currentTab === 'matchmaking' && (
              <MatchmakingWizard onComplete={handleQuizComplete} />
            )}

            {currentTab === 'handover' && (
              <PassportHandover
                selectedAnimal={activePet}
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

      {/* Footer */}
      <Footer setCurrentTab={setCurrentTab} isLoggedIn={isLoggedIn} />

      {/* Floating AI Chatbot — only for authenticated users */}
      {isLoggedIn && <FloatingAIChatbot animal={activePet ?? null} />}

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
