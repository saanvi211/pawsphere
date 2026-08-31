import React from 'react';
import { Heart, Users, Stethoscope, Sparkles, CheckCircle2 } from 'lucide-react';

interface StatItem {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

const stats: StatItem[] = [
  {
    value: '25K+',
    label: 'Happy Pets',
    icon: Sparkles,
    accentColor: 'text-cyan-400'
  },
  {
    value: '15K+',
    label: 'Active Parents',
    icon: Users,
    accentColor: 'text-purple-400'
  },
  {
    value: '2K+',
    label: 'Verified Vets',
    icon: Stethoscope,
    accentColor: 'text-pink-400'
  },
  {
    value: '1K+',
    label: 'Adoptions',
    icon: Heart,
    accentColor: 'text-emerald-400'
  },
  {
    value: '99%',
    label: 'Satisfaction Rate',
    icon: CheckCircle2,
    accentColor: 'text-amber-400'
  }
];

export const StatsSection: React.FC = () => {
  return (
    <section className="relative py-8 sm:py-12">
      <div className="rounded-3xl p-6 sm:p-8 bg-[#080d1e]/80 backdrop-blur-2xl border border-purple-500/20 shadow-[0_10px_40px_rgba(0,0,0,0.6),0_0_30px_rgba(139,92,246,0.1)]">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-800/80">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.label}
                className={`flex flex-col items-center justify-center text-center p-3 sm:p-4 space-y-2 ${
                  idx === 4 ? 'col-span-2 md:col-span-1' : ''
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 ${stat.accentColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight bg-gradient-to-br from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                    {stat.value}
                  </span>
                </div>
                <span className="text-[11px] sm:text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
