import React from 'react';
import { PawPrint, ShieldCheck, Heart, Sparkles, PhoneCall, ArrowRight } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
  isLoggedIn: boolean;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab, isLoggedIn }) => {
  return (
    <footer className="bg-[#040712] text-slate-300 border-t border-purple-500/15 pt-14 pb-10 z-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full p-[1.5px] bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                <div className="w-full h-full rounded-full bg-[#060a17] flex items-center justify-center">
                  <PawPrint className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-wider text-white">PAWSPHERE</span>
                <span className="text-[9px] text-slate-400 font-mono tracking-widest uppercase">Care. Connect. Cherish.</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Next-generation 3D pet-care ecosystem, digital twin modeling, AI clinical triage, and intelligent companion matchmaking.
            </p>
            <div className="flex items-center space-x-2 text-xs text-cyan-300 font-mono bg-[#091124] border border-cyan-500/30 px-3 py-1.5 rounded-xl w-fit shadow-[0_0_10px_rgba(6,182,212,0.15)]">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Verified Welfare Protocol</span>
            </div>
          </div>

          {/* Quick Ecosystem Links */}
          <div>
            <h4 className="text-xs font-mono font-extrabold uppercase tracking-wider text-purple-300 mb-4 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ecosystem Views</span>
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-slate-400">
              <li>
                <button 
                  onClick={() => setCurrentTab(isLoggedIn ? 'dashboard' : 'landing')} 
                  className="hover:text-cyan-300 transition-colors flex items-center space-x-1"
                >
                  <span>My Pets Dashboard</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentTab(isLoggedIn ? 'buy-pets' : 'landing')} 
                  className="hover:text-cyan-300 transition-colors"
                >
                  AI Matchmaking & Adoption
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentTab(isLoggedIn ? 'shelters' : 'landing')} 
                  className="hover:text-cyan-300 transition-colors"
                >
                  Shelter Location Directory
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentTab(isLoggedIn ? 'digital-twin' : 'landing')} 
                  className="hover:text-cyan-300 transition-colors"
                >
                  3D Digital Twin Viewport
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentTab(isLoggedIn ? 'passport' : 'landing')} 
                  className="hover:text-cyan-300 transition-colors"
                >
                  Digital Animal Passport
                </button>
              </li>
            </ul>
          </div>

          {/* Clinical & AI Suite */}
          <div>
            <h4 className="text-xs font-mono font-extrabold uppercase tracking-wider text-purple-300 mb-4">
              Clinical & AI Suite
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-slate-400">
              <li>
                <button 
                  onClick={() => setCurrentTab(isLoggedIn ? 'ai-triage' : 'landing')} 
                  className="hover:text-pink-300 transition-colors"
                >
                  AI Symptom Triage Helper
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentTab(isLoggedIn ? 'ai-triage' : 'landing')} 
                  className="hover:text-pink-300 transition-colors"
                >
                  Skin Wound Vision Scan
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentTab(isLoggedIn ? 'ai-triage' : 'landing')} 
                  className="hover:text-pink-300 transition-colors"
                >
                  Test Report OCR Reader
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentTab(isLoggedIn ? 'emergency' : 'landing')} 
                  className="hover:text-red-400 transition-colors flex items-center space-x-1.5 text-rose-400"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                  <span>24/7 ER Vet Hotline</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Supported Species Schema */}
          <div>
            <h4 className="text-xs font-mono font-extrabold uppercase tracking-wider text-purple-300 mb-4">
              Supported Species
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {['Canine (Dog)', 'Feline (Cat)', 'Aves (Parrot)', 'Lagomorpha (Rabbit)', 'Testudines (Turtle)', 'Hamster', 'Fish'].map((spec) => (
                <span key={spec} className="px-2.5 py-1 rounded-lg bg-[#0c142e] text-[10px] font-mono font-semibold text-cyan-300 border border-purple-500/20">
                  {spec}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-4 leading-normal font-mono">
              Digital QR Pet Passports are generated instantly with secure cryptographic verification.
            </p>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono">
          <p>© 2026 PawSphere Technologies. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-3 sm:mt-0">
            <span className="flex items-center space-x-1.5 text-slate-400">
              <Heart className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
              <span>Futuristic 3D Pet Care Platform</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
