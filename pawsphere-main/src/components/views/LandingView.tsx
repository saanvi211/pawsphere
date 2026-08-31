import React from 'react';
import { LandingHero } from '../landing/LandingHero';
import { FeatureCardsSection } from '../landing/FeatureCardsSection';
import { StatsSection } from '../landing/StatsSection';
import { CTASection } from '../landing/CTASection';

interface LandingViewProps {
  onOpenAuthModal: (mode: 'login' | 'signup') => void;
  onExplorePublicPets: () => void;
  onNavigate?: (route: string) => void;
  isLoggedIn?: boolean;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onOpenAuthModal,
  onExplorePublicPets,
  onNavigate,
  isLoggedIn = false
}) => {
  const handleRouteNavigate = (route: string) => {
    if (isLoggedIn && onNavigate) {
      onNavigate(route);
    } else {
      // Prompt sign up / login
      onOpenAuthModal('signup');
    }
  };

  return (
    <div className="relative min-h-screen text-slate-100 selection:bg-purple-600 selection:text-white overflow-hidden">
      {/* Background Starfield & Subtle Neon Glow Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Deep ambient dark gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-purple-900/15 via-indigo-900/10 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-[35%] right-0 w-[500px] h-[500px] bg-cyan-900/10 blur-3xl rounded-full opacity-60" />
        <div className="absolute top-[65%] left-0 w-[600px] h-[600px] bg-purple-950/15 blur-3xl rounded-full opacity-60" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(168,85,247,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-80" />
      </div>

      {/* Main Content Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16 space-y-4 sm:space-y-8">
        
        {/* 1. HERO SECTION: 3-Column Desktop Layout */}
        <LandingHero
          onOpenAuthModal={onOpenAuthModal}
          onExplorePublicPets={onExplorePublicPets}
          onNavigate={handleRouteNavigate}
        />

        {/* 2. SECOND SECTION: 4 Premium Feature Cards */}
        <FeatureCardsSection onNavigate={handleRouteNavigate} />

        {/* 3. STATS SECTION: Horizontal 5-Metric Bar */}
        <StatsSection />

        {/* 4. CTA SECTION: Large Futuristic Card with 3D Scene */}
        <CTASection onOpenAuthModal={onOpenAuthModal} />

      </main>
    </div>
  );
};
