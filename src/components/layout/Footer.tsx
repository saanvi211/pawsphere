import React from 'react';
import { PawPrint, ShieldCheck, Heart, PhoneCall } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
  isLoggedIn: boolean;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab, isLoggedIn }) => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 pt-12 pb-8 z-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-brand-solidBlue flex items-center justify-center text-white">
                <PawPrint className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white uppercase">PAWSPHERE</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              Universal 3D veterinary platform, multi-taxonomic biology schema, AI triage helper, and intelligent pet adoption ecosystem.
            </p>
            <div className="flex items-center space-x-2 text-xs text-brand-solidGreen font-semibold bg-slate-900 border-2 border-brand-solidGreen px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4 text-brand-solidGreen" />
              <span>Verified Welfare Protocol</span>
            </div>
          </div>

          {/* Quick Ecosystem Links - ONLY VISIBLE IF LOGGED IN */}
          {isLoggedIn ? (
            <>
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-200 mb-3">Ecosystem Views</h4>
                <ul className="space-y-2 text-xs font-semibold">
                  <li><button onClick={() => setCurrentTab('dashboard')} className="hover:text-brand-solidOrange transition-colors">My Pets Dashboard</button></li>
                  <li><button onClick={() => setCurrentTab('buy-pets')} className="hover:text-brand-solidOrange transition-colors">AI Matchmaking & Adoption</button></li>
                  <li><button onClick={() => setCurrentTab('shelters')} className="hover:text-brand-solidOrange transition-colors">Shelter Location Directory</button></li>
                  <li><button onClick={() => setCurrentTab('digital-twin')} className="hover:text-brand-solidOrange transition-colors">3D Digital Twin Viewport</button></li>
                  <li><button onClick={() => setCurrentTab('passport')} className="hover:text-brand-solidOrange transition-colors">Digital Animal Passport</button></li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-200 mb-3">Clinical & AI Suite</h4>
                <ul className="space-y-2 text-xs font-semibold">
                  <li><button onClick={() => setCurrentTab('ai-triage')} className="hover:text-brand-solidOrange transition-colors">PAW AI Symptom Triage</button></li>
                  <li><button onClick={() => setCurrentTab('ai-triage')} className="hover:text-brand-solidOrange transition-colors">Skin Wound Vision Scan</button></li>
                  <li><button onClick={() => setCurrentTab('ai-triage')} className="hover:text-brand-solidOrange transition-colors">Test Report OCR Reader</button></li>
                  <li><button onClick={() => setCurrentTab('emergency')} className="hover:text-red-500 transition-colors flex items-center space-x-1 text-rose-300"><PhoneCall className="w-3 h-3 text-red-500" /><span>24/7 ER Vet Hotline</span></button></li>
                </ul>
              </div>
            </>
          ) : (
            <div className="md:col-span-2 flex items-center justify-center bg-slate-900/50 p-6 rounded-2xl border border-slate-800 text-center text-xs text-slate-400">
              Please sign in to unlock custom 3D views, digital passports, AI health triage, and adoption services.
            </div>
          )}

          {/* Species Biology Schema */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-200 mb-3">Supported Taxons</h4>
            <div className="flex flex-wrap gap-1.5">
              {['Canine (Dog)', 'Feline (Cat)', 'Aves (Bird)', 'Betta (Fish)', 'Reptilia (Lizard)', 'Rabbit', 'Hamster'].map((spec) => (
                <span key={spec} className="px-2 py-1 rounded bg-slate-900 text-[10px] font-bold text-brand-solidOrange border border-slate-800">
                  {spec}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-4 leading-normal">
              Digital QR Pet Passports are generated instantly. Microchip registration is completely <strong className="text-brand-solidOrange font-extrabold">optional</strong>.
            </p>
          </div>

        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 Pawsphere Foundation. Built with solid blue, orange, green colors and zero gradients.</p>
          <div className="flex items-center space-x-4 mt-3 sm:mt-0">
            <span className="flex items-center space-x-1 text-slate-400"><Heart className="w-3.5 h-3.5 text-brand-solidOrange fill-brand-solidOrange" /><span>Unified Pet Care Hub</span></span>
          </div>
        </div>
      </div>
    </footer>
  );
};
