import React from 'react';
import { ArrowRight, Sparkles, Heart } from 'lucide-react';

interface CTASectionProps {
  onOpenAuthModal: (mode: 'login' | 'signup') => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onOpenAuthModal }) => {
  return (
    <section className="relative py-14 sm:py-20" id="about">
      <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 lg:p-16 bg-gradient-to-b from-[#0b1228] to-[#060a17] border border-purple-500/30 shadow-[0_15px_50px_rgba(0,0,0,0.7),0_0_40px_rgba(168,85,247,0.15)]">
        
        {/* Background Ambient Radial Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-cyan-600/15 blur-3xl pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          
          {/* Left Copy & CTA (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#161f3e]/80 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Join The PawSphere Community</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
              Your Pet's{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                Happiness
              </span>{' '}
              Starts Here
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-lg">
              Join thousands of pet parents who trust PawSphere for a better life for their pets. Seamless 3D health tracking, personalized diets, and connected care.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onOpenAuthModal('signup')}
                className="px-8 py-4 rounded-2xl font-extrabold text-sm sm:text-base text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:via-indigo-500 hover:to-cyan-400 shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:shadow-[0_0_40px_rgba(6,182,212,0.65)] border border-purple-300/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-2.5 group cursor-pointer"
              >
                <span>Create Your Account</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </button>

              <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
                <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
                <span>Instant Setup • No Credit Card Required</span>
              </div>
            </div>
          </div>

          {/* Right Visual: 3D Scene of Happy Dog and Cat on Glowing Circular Platform (5 cols) */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
              
              {/* Glowing Platform Rings */}
              <div className="absolute inset-0 rounded-full border border-purple-500/40 animate-spin" style={{ animationDuration: '20s' }} />
              <div className="absolute inset-4 rounded-full border border-cyan-500/30 border-dashed animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
              <div className="absolute inset-10 rounded-full bg-gradient-to-b from-[#131b3b] to-[#080d1e] border-2 border-purple-400/50 shadow-[0_0_35px_rgba(168,85,247,0.3)]" />

              {/* 3D Happy Dog & Cat SVG Composition */}
              <svg 
                className="relative z-10 w-64 h-64 filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
                viewBox="0 0 300 300" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="ctaDogFur" x1="120" y1="90" x2="220" y2="240" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FBBF24" />
                    <stop offset="0.6" stopColor="#F59E0B" />
                    <stop offset="1" stopColor="#D97706" />
                  </linearGradient>
                  <linearGradient id="ctaCatFur" x1="60" y1="120" x2="140" y2="240" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F1F5F9" />
                    <stop offset="0.5" stopColor="#CBD5E1" />
                    <stop offset="1" stopColor="#64748B" />
                  </linearGradient>
                </defs>

                {/* Circular Hologram Base on Stage */}
                <ellipse cx="150" cy="240" rx="100" ry="24" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
                <ellipse cx="150" cy="240" rx="75" ry="16" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4 4" />

                {/* HAPPY DOG (Right) */}
                <g transform="translate(130, 90)">
                  {/* Body */}
                  <path d="M25 65C25 45 42 35 65 35C88 35 105 45 105 65V125H25V65Z" fill="url(#ctaDogFur)" />
                  {/* Head */}
                  <ellipse cx="65" cy="30" rx="34" ry="28" fill="url(#ctaDogFur)" />
                  {/* Snout & Smile */}
                  <ellipse cx="65" cy="38" rx="18" ry="14" fill="#FEF3C7" />
                  <circle cx="65" cy="32" r="4" fill="#1E293B" />
                  <path d="M58 40C62 44 68 44 72 40" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
                  <path d="M62 42C62 47 68 47 68 42Z" fill="#F43F5E" />
                  {/* Happy closed eyes */}
                  <path d="M50 24C53 20 57 20 60 24" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M70 24C73 20 77 20 80 24" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Ears */}
                  <path d="M35 18C25 25 20 50 30 60L38 25Z" fill="#D97706" />
                  <path d="M95 18C105 25 110 50 100 60L92 25Z" fill="#D97706" />
                  {/* High Tech Collar */}
                  <path d="M40 60C55 68 75 68 90 60" stroke="#06B6D4" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="65" cy="67" r="4" fill="#A855F7" />
                  {/* Paws */}
                  <ellipse cx="45" cy="125" rx="10" ry="7" fill="#FEF3C7" />
                  <ellipse cx="85" cy="125" rx="10" ry="7" fill="#FEF3C7" />
                </g>

                {/* HAPPY CAT (Left, leaning affectionately on dog) */}
                <g transform="translate(60, 115)">
                  {/* Body */}
                  <path d="M20 55C20 35 35 28 55 28C75 28 85 35 85 55V105H20V55Z" fill="url(#ctaCatFur)" />
                  {/* Head */}
                  <ellipse cx="52" cy="24" rx="24" ry="20" fill="url(#ctaCatFur)" />
                  {/* Pointy Ears */}
                  <polygon points="34,14 26,-5 44,8" fill="#64748B" />
                  <polygon points="36,12 30,-1 42,8" fill="#F472B6" />
                  <polygon points="70,14 78,-5 60,8" fill="#64748B" />
                  <polygon points="68,12 74,-1 62,8" fill="#F472B6" />
                  {/* Happy closed eyes */}
                  <path d="M42 20C45 17 48 17 51 20" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
                  <path d="M57 20C60 17 63 17 66 20" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
                  {/* Nose & Whiskers */}
                  <polygon points="52,26 55,26 53.5,28" fill="#F472B6" />
                  <path d="M36 26L22 25M36 30L22 32M68 26L82 25M68 30L82 32" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
                  {/* Paws */}
                  <ellipse cx="35" cy="105" rx="8" ry="6" fill="#FFFFFF" />
                  <ellipse cx="70" cy="105" rx="8" ry="6" fill="#FFFFFF" />
                  {/* Tail Curling with Hearts */}
                  <path d="M20 95C5 90 0 65 10 55C15 50 20 60 15 70C10 80 18 90 25 95" stroke="#94A3B8" strokeWidth="4.5" strokeLinecap="round" />
                </g>

                {/* Floating Heart between them */}
                <g transform="translate(142, 95)">
                  <path d="M8 8C8 4 12 2 15 5C18 2 22 4 22 8C22 13 15 17 15 17C15 17 8 13 8 8Z" fill="#F43F5E" />
                </g>
              </svg>

              {/* Holographic Badge */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#080d1e]/90 border border-cyan-400/50 text-[10px] font-mono text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)] whitespace-nowrap">
                3D PLATFORM SYNCED
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
