import React from 'react';
import { Stethoscope, Utensils, Activity, Heart, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

interface QuickAccessPanelProps {
  onNavigate: (route: string) => void;
}

interface QuickAccessItem {
  id: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  glowColor: string;
  iconBg: string;
  badge?: string;
  route: string;
}

const items: QuickAccessItem[] = [
  {
    id: 'vet-care',
    title: 'Vet Care',
    desc: 'Book appointments &\nconsult top vets.',
    icon: Stethoscope,
    accentColor: 'text-cyan-400',
    glowColor: 'group-hover:border-cyan-400/50 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.25)]',
    iconBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    route: 'ai-triage'
  },
  {
    id: 'diet-nutrition',
    title: 'Diet & Nutrition',
    desc: 'Personalized diet plans\nfor your pet.',
    icon: Utensils,
    accentColor: 'text-emerald-400',
    glowColor: 'group-hover:border-emerald-400/50 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]',
    iconBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    route: 'nutrition'
  },
  {
    id: 'play-activity',
    title: 'Play & Activity',
    desc: 'Fun games, mood tracker\n& activity ideas.',
    icon: Activity,
    accentColor: 'text-purple-400',
    glowColor: 'group-hover:border-purple-400/50 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.25)]',
    iconBg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    route: 'grooming'
  },
  {
    id: 'adoption',
    title: 'Adoption',
    desc: 'Find your perfect\nfurry friend.',
    icon: Heart,
    accentColor: 'text-pink-400',
    glowColor: 'group-hover:border-pink-400/50 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.25)]',
    iconBg: 'bg-pink-500/10 border-pink-500/30 text-pink-400',
    route: 'buy-pets'
  },
  {
    id: 'health-passport',
    title: 'Health Passport',
    desc: 'Vaccines, records &\nhealth tracking.',
    icon: ShieldCheck,
    accentColor: 'text-indigo-400',
    glowColor: 'group-hover:border-indigo-400/50 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.25)]',
    iconBg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
    route: 'passport'
  }
];

export const QuickAccessPanel: React.FC<QuickAccessPanelProps> = ({ onNavigate }) => {
  return (
    <div className="w-full max-w-sm mx-auto lg:max-w-none">
      <div className="relative rounded-3xl p-5 sm:p-6 bg-[#080d1e]/80 backdrop-blur-2xl border border-purple-500/20 shadow-[0_10px_40px_rgba(0,0,0,0.6),0_0_30px_rgba(139,92,246,0.1)]">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <h3 className="text-xs font-mono uppercase font-extrabold tracking-widest text-slate-300">
              Quick Access
            </h3>
          </div>
          <div className="flex items-center space-x-1 text-[11px] text-purple-400 font-mono font-bold bg-purple-950/40 px-2 py-0.5 rounded-full border border-purple-500/30">
            <Sparkles className="w-3 h-3" />
            <span>5 Core Services</span>
          </div>
        </div>

        {/* Stack of 5 Cards */}
        <div className="space-y-2.5">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.route)}
                className={`group relative w-full text-left p-3 sm:p-3.5 rounded-2xl bg-[#0d142c]/75 hover:bg-[#121c3d]/90 border border-slate-800/90 ${item.glowColor} transition-all duration-300 flex items-center justify-between hover:-translate-y-0.5 cursor-pointer`}
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${item.iconBg} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Text */}
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white group-hover:text-cyan-200 tracking-tight">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">0{idx + 1}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight whitespace-pre-line group-hover:text-slate-300 transition-colors mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="w-7 h-7 rounded-lg bg-slate-900/80 border border-slate-700/60 flex items-center justify-center shrink-0 ml-2 text-slate-400 group-hover:text-white group-hover:border-purple-400/60 group-hover:bg-purple-950/50 transition-all">
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Ambient Bottom Note */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>● 24/7 AI-POWERED ECOSYSTEM</span>
          <span className="text-purple-400">SYNCED</span>
        </div>
      </div>
    </div>
  );
};
