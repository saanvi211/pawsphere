import React from 'react';
import { ArrowRight, Sparkles, Heart } from 'lucide-react';
import { CareNetworkCenter } from './CareNetworkCenter';
import { QuickAccessPanel } from './QuickAccessPanel';

interface LandingHeroProps {
  onOpenAuthModal: (mode: 'login' | 'signup') => void;
  onExplorePublicPets: () => void;
  onNavigate: (route: string) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onOpenAuthModal,
  onExplorePublicPets,
  onNavigate
}) => {
  return (
    <section className="relative pt-6 pb-12 lg:pt-10 lg:pb-16 overflow-hidden">
      {/* 3-Column Desktop Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
        
        {/* LEFT COLUMN: HERO COPY & CALLS TO ACTION (4 cols) */}
        <div className="lg:col-span-4 space-y-6 text-left z-10">
          
          {/* Welcome Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#121630]/80 border border-purple-500/30 text-purple-300 text-xs font-semibold shadow-[0_0_15px_rgba(168,85,247,0.2)] backdrop-blur-md">
            <span className="text-pink-400">♡</span>
            <span>Welcome to PawSphere</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.05]">
            Everything<br />
            Your Pet Needs,<br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(168,85,247,0.4)]">
              All in One
            </span><br />
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Place
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-md font-normal">
            3D care. Real connections. Endless love.<br />
            A complete digital world for every kind of companion.
          </p>

          {/* Action Button - Explore 3D Hub */}
          <div className="flex items-center pt-2">
            <button
              onClick={() => onOpenAuthModal('signup')}
              className="px-6 py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:via-indigo-500 hover:to-cyan-400 shadow-[0_0_25px_rgba(168,85,247,0.45)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] border border-purple-300/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-2 group cursor-pointer"
            >
              <span>Explore 3D Hub</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Micro trust badges */}
          <div className="flex items-center space-x-4 pt-2 text-[11px] text-slate-400 font-mono">
            <span className="flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Universal Care</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Heart className="w-3 h-3 text-pink-400" />
              <span>All Species</span>
            </span>
            <span>•</span>
            <span className="text-purple-400 font-semibold">Zero Clutter</span>
          </div>

        </div>

        {/* CENTER COLUMN: 3D PET CARE NETWORK PLATFORM (5 cols) */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <CareNetworkCenter onNavigate={onNavigate} />
        </div>

        {/* RIGHT COLUMN: QUICK ACCESS GLASS PANEL (3 cols) */}
        <div className="lg:col-span-3">
          <QuickAccessPanel onNavigate={onNavigate} />
        </div>

        </div>
    </section>
  );
};
