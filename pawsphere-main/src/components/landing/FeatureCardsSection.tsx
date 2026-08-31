import React from 'react';
import { ArrowRight, Sparkles, Box, Bell, Users, Bot } from 'lucide-react';

interface FeatureCardsSectionProps {
  onNavigate: (route: string) => void;
}

export const FeatureCardsSection: React.FC<FeatureCardsSectionProps> = ({ onNavigate }) => {
  return (
    <section className="relative py-14 sm:py-20" id="pet-hub">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Core Capabilities</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Next-Gen 3D Pet Ecosystem
        </h2>
        <p className="text-slate-400 text-sm sm:text-base">
          Engineered for complete visibility into your companion’s health, routines, and happiness.
        </p>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* CARD 1: 3D Pet Care Hub */}
        <div className="group relative rounded-3xl p-6 bg-[#080e22]/75 backdrop-blur-xl border border-cyan-500/25 hover:border-cyan-400/60 shadow-[0_10px_35px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all duration-300 flex flex-col justify-between hover:-translate-y-2">
          {/* Top Visual: 3D Veterinary Clinic / Floating Island */}
          <div className="relative w-full h-40 rounded-2xl bg-gradient-to-b from-[#0e1938] to-[#080e22] border border-cyan-500/20 overflow-hidden flex items-center justify-center mb-5 group-hover:border-cyan-400/40 transition-colors">
            {/* Ambient Island Glow */}
            <div className="absolute inset-0 bg-radial from-cyan-500/20 via-transparent to-transparent opacity-60" />
            
            <svg className="w-32 h-32 filter drop-shadow-[0_8px_16px_rgba(6,182,212,0.4)] group-hover:scale-110 transition-transform duration-500" viewBox="0 0 120 120" fill="none">
              {/* Floating Island Base */}
              <ellipse cx="60" cy="85" rx="45" ry="16" fill="#0c1d3b" stroke="#06b6d4" strokeWidth="1.5" />
              <path d="M15 85C15 95 60 110 60 110C60 110 105 95 105 85" fill="#071328" stroke="#06b6d4" strokeWidth="1" opacity="0.6" />
              
              {/* 3D Modern Clinic Building */}
              <path d="M40 78L40 45L60 32L80 45L80 78L60 90L40 78Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
              <path d="M60 32L80 45L80 78L60 90V32Z" fill="#0f172a" />
              <path d="M60 32L40 45L60 58L80 45L60 32Z" fill="#0284c7" opacity="0.8" />
              
              {/* Glowing Medical Cross */}
              <circle cx="60" cy="62" r="10" fill="#080e22" stroke="#06b6d4" strokeWidth="1" />
              <path d="M60 56V68M54 62H66" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" />

              {/* Floating Holographic Ring */}
              <ellipse cx="60" cy="40" rx="30" ry="8" stroke="#a855f7" strokeWidth="1.2" strokeDasharray="3 4" opacity="0.8" />
            </svg>
            
            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[9px] font-mono text-cyan-300">
              3D WORLD
            </div>
          </div>

          {/* Copy */}
          <div className="space-y-2 mb-6">
            <h3 className="text-lg font-extrabold text-white group-hover:text-cyan-300 transition-colors">
              3D Pet Care Hub
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore an interactive 3D world for your pet's well-being.
            </p>
          </div>

          {/* Button */}
          <button
            onClick={() => onNavigate('digital-twin')}
            className="w-full py-2.5 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 font-extrabold text-xs flex items-center justify-center space-x-1.5 group/btn transition-all shadow-sm cursor-pointer"
          >
            <span>Enter Hub</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* CARD 2: Smart Reminders */}
        <div className="group relative rounded-3xl p-6 bg-[#080e22]/75 backdrop-blur-xl border border-pink-500/25 hover:border-pink-400/60 shadow-[0_10px_35px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] transition-all duration-300 flex flex-col justify-between hover:-translate-y-2">
          {/* Top Visual: Glowing Futuristic Pet-Care House / Alarm */}
          <div className="relative w-full h-40 rounded-2xl bg-gradient-to-b from-[#1e0e28] to-[#080e22] border border-pink-500/20 overflow-hidden flex items-center justify-center mb-5 group-hover:border-pink-400/40 transition-colors">
            <div className="absolute inset-0 bg-radial from-pink-500/20 via-transparent to-transparent opacity-60" />
            
            <svg className="w-32 h-32 filter drop-shadow-[0_8px_16px_rgba(236,72,153,0.4)] group-hover:scale-110 transition-transform duration-500" viewBox="0 0 120 120" fill="none">
              {/* Glowing Base */}
              <ellipse cx="60" cy="85" rx="42" ry="14" fill="#2d1028" stroke="#ec4899" strokeWidth="1.5" />
              
              {/* Modern Smart Pet House */}
              <path d="M35 80V52L60 32L85 52V80H35Z" fill="#1e102b" stroke="#f472b6" strokeWidth="1.5" />
              <path d="M60 32L85 52V80H60V32Z" fill="#130a1c" />
              
              {/* Pet Archway */}
              <path d="M50 80V65C50 59.5 54.5 55 60 55C65.5 55 70 59.5 70 65V80H50Z" fill="#ec4899" opacity="0.3" stroke="#f43f5e" strokeWidth="1" />
              
              {/* Holographic Glowing Bell / Vaccine Icon */}
              <circle cx="60" cy="42" r="7" fill="#fb7185" />
              <path d="M56 46H64" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
              
              {/* Signal Pulse Waves */}
              <circle cx="60" cy="32" r="16" stroke="#f43f5e" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" className="animate-ping" style={{ transformOrigin: '60px 32px' }} />
            </svg>

            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-pink-950/80 border border-pink-500/40 text-[9px] font-mono text-pink-300">
              SMART SCHEDULE
            </div>
          </div>

          {/* Copy */}
          <div className="space-y-2 mb-6">
            <h3 className="text-lg font-extrabold text-white group-hover:text-pink-300 transition-colors">
              Smart Reminders
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Never miss a vaccine, medication or appointment.
            </p>
          </div>

          {/* Button */}
          <button
            onClick={() => onNavigate('passport')}
            className="w-full py-2.5 px-4 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 hover:border-pink-400 font-extrabold text-xs flex items-center justify-center space-x-1.5 group/btn transition-all shadow-sm cursor-pointer"
          >
            <span>Set Reminder</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* CARD 3: Pet Community */}
        <div className="group relative rounded-3xl p-6 bg-[#080e22]/75 backdrop-blur-xl border border-purple-500/25 hover:border-purple-400/60 shadow-[0_10px_35px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all duration-300 flex flex-col justify-between hover:-translate-y-2">
          {/* Top Visual: Pet-Community Connected 3D Node Avatars */}
          <div className="relative w-full h-40 rounded-2xl bg-gradient-to-b from-[#180e30] to-[#080e22] border border-purple-500/20 overflow-hidden flex items-center justify-center mb-5 group-hover:border-purple-400/40 transition-colors">
            <div className="absolute inset-0 bg-radial from-purple-500/20 via-transparent to-transparent opacity-60" />
            
            <svg className="w-32 h-32 filter drop-shadow-[0_8px_16px_rgba(168,85,247,0.4)] group-hover:scale-110 transition-transform duration-500" viewBox="0 0 120 120" fill="none">
              {/* Central Glowing Orb */}
              <circle cx="60" cy="60" r="16" fill="#7e22ce" stroke="#a855f7" strokeWidth="2" />
              <path d="M54 58C54 54.7 56.7 52 60 52C63.3 52 66 54.7 66 58C66 62 60 66 60 66C60 66 54 62 54 58Z" fill="#f3e8ff" />

              {/* Orbiting Satellite Avatars */}
              <ellipse cx="60" cy="60" rx="38" ry="24" stroke="#c084fc" strokeWidth="1" strokeDasharray="3 4" transform="rotate(-15 60 60)" />
              
              <circle cx="28" cy="48" r="8" fill="#3b82f6" stroke="#93c5fd" strokeWidth="1.5" />
              <circle cx="92" cy="72" r="9" fill="#ec4899" stroke="#fbcfe8" strokeWidth="1.5" />
              <circle cx="75" cy="32" r="7" fill="#10b981" stroke="#a7f3d0" strokeWidth="1.5" />

              {/* Connecting Laser Beams */}
              <line x1="60" y1="60" x2="28" y2="48" stroke="#a855f7" strokeWidth="1.2" />
              <line x1="60" y1="60" x2="92" y2="72" stroke="#a855f7" strokeWidth="1.2" />
              <line x1="60" y1="60" x2="75" y2="32" stroke="#a855f7" strokeWidth="1.2" />
            </svg>

            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-[9px] font-mono text-purple-300">
              SOCIAL NETWORK
            </div>
          </div>

          {/* Copy */}
          <div className="space-y-2 mb-6">
            <h3 className="text-lg font-extrabold text-white group-hover:text-purple-300 transition-colors">
              Pet Community
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connect with pet parents, share stories & get advice.
            </p>
          </div>

          {/* Button */}
          <button
            onClick={() => onNavigate('community')}
            className="w-full py-2.5 px-4 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:border-purple-400 font-extrabold text-xs flex items-center justify-center space-x-1.5 group/btn transition-all shadow-sm cursor-pointer"
          >
            <span>Join Now</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* CARD 4: AI Pet Assistant */}
        <div className="group relative rounded-3xl p-6 bg-[#080e22]/75 backdrop-blur-xl border border-emerald-500/25 hover:border-emerald-400/60 shadow-[0_10px_35px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-300 flex flex-col justify-between hover:-translate-y-2">
          {/* Top Visual: Cute Futuristic Robotic Pet Assistant */}
          <div className="relative w-full h-40 rounded-2xl bg-gradient-to-b from-[#0c2420] to-[#080e22] border border-emerald-500/20 overflow-hidden flex items-center justify-center mb-5 group-hover:border-emerald-400/40 transition-colors">
            <div className="absolute inset-0 bg-radial from-emerald-500/20 via-transparent to-transparent opacity-60" />
            
            <svg className="w-32 h-32 filter drop-shadow-[0_8px_16px_rgba(16,185,129,0.4)] group-hover:scale-110 transition-transform duration-500" viewBox="0 0 120 120" fill="none">
              {/* Holographic Ring Base */}
              <ellipse cx="60" cy="90" rx="36" ry="12" fill="#042f2e" stroke="#10b981" strokeWidth="1.5" />
              
              {/* Cute Robot Body */}
              <path d="M42 55C42 45 50 38 60 38C70 38 78 45 78 55V75C78 82 70 88 60 88C50 88 42 82 42 75V55Z" fill="#134e4a" stroke="#34d399" strokeWidth="1.5" />
              
              {/* Visor Display */}
              <rect x="46" y="48" width="28" height="15" rx="7" fill="#022c22" stroke="#2dd4bf" strokeWidth="1" />
              
              {/* Cute Glowing Visor Eyes (Happy Arcs) */}
              <path d="M51 56C53 53 56 53 58 56" stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round" />
              <path d="M62 56C64 53 67 53 69 56" stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round" />
              
              {/* Cute Robot Ears / Antennas with Paws */}
              <path d="M46 40L38 28" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="37" cy="26" r="3.5" fill="#34d399" />
              <path d="M74 40L82 28" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="83" cy="26" r="3.5" fill="#34d399" />

              {/* Heart Badge on Chest */}
              <circle cx="60" cy="74" r="5" fill="#065f46" />
              <path d="M58 74C58 72.5 59 72 60 72C61 72 62 72.5 62 74C62 75.5 60 77 60 77C60 77 58 75.5 58 74Z" fill="#34d399" />
            </svg>

            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[9px] font-mono text-emerald-300">
              24/7 AI TRIAGE
            </div>
          </div>

          {/* Copy */}
          <div className="space-y-2 mb-6">
            <h3 className="text-lg font-extrabold text-white group-hover:text-emerald-300 transition-colors">
              AI Pet Assistant
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              24/7 AI support for your pet care questions.
            </p>
          </div>

          {/* Button */}
          <button
            onClick={() => onNavigate('ai-triage')}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400 font-extrabold text-xs flex items-center justify-center space-x-1.5 group/btn transition-all shadow-sm cursor-pointer"
          >
            <span>Ask Now</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
};
