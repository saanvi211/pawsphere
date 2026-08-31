import React, { useState } from 'react';
import { BookOpen, DollarSign, CheckSquare, GraduationCap, CheckCircle2, Clock, Dog, Cat } from 'lucide-react';

export const OnboardingHub: React.FC = () => {
  const [petType, setPetType] = useState<'dog' | 'cat'>('dog');
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [checkedItems, setCheckedItems] = useState<string[]>(['c1', 'c2']);
  const [crateSize, setCrateSize] = useState<'medium' | 'large'>('medium');
  const [foodTier, setFoodTier] = useState<'standard' | 'premium'>('premium');

  const upfrontCost = petType === 'dog'
    ? (crateSize === 'large' ? 140 : 90) + (foodTier === 'premium' ? 65 : 40) + 120
    : 45 + (foodTier === 'premium' ? 55 : 35) + 95;
  const recurringCost = petType === 'dog' ? 110 : 65;

  const checklist = petType === 'dog' ? [
    { id: 'c1', title: 'Heavy-Duty Steel Crate with Divider', category: 'Setup' },
    { id: 'c2', title: 'Hydrolyzed Salmon Kibble & Stainless Bowls', category: 'Diet' },
    { id: 'c3', title: 'Enzymatic Odor Spray & Potty Pads', category: 'Hygiene' },
    { id: 'c4', title: '6-Foot Nylon Leash & Reflective Harness', category: 'Gear' },
    { id: 'c5', title: 'Home Proofing: Tuck Away Electric Cords', category: 'Safety' },
  ] : [
    { id: 'c1', title: 'Covered Litter Box & Clumping Clay Litter', category: 'Setup' },
    { id: 'c2', title: 'Multi-Level Sisal Scratching Tree', category: 'Enrichment' },
    { id: 'c3', title: 'Running Stainless Water Fountain', category: 'Hydration' },
    { id: 'c4', title: 'Wet Canned Food & Hairball Control Gel', category: 'Diet' },
    { id: 'c5', title: 'Screened Balconies & Cat-Proof Windows', category: 'Safety' },
  ];

  const courseModules = [
    { id: 'm1', title: 'Crate & Litter Box Training 101', duration: '2 Mins', desc: 'Positive reinforcement techniques for fast house training.' },
    { id: 'm2', title: 'Smooth 7-Day Diet Transition', duration: '2 Mins', desc: 'Gradually mixing old shelter food with new kibble to prevent gut upset.' },
    { id: 'm3', title: 'Panic-Free First Vet Visit', duration: '3 Mins', desc: 'Carrier desensitization, high-value treats, and low-stress handling.' },
    { id: 'm4', title: 'First 72 Hours Stress Signs', duration: '2 Mins', desc: 'Decoding panting, hiding, pacing, and when to give your new pet space.' },
  ];

  const toggleCheck = (id: string) =>
    setCheckedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const toggleModule = (id: string) =>
    setCompletedModules(prev => prev.includes(id) ? prev : [...prev, id]);

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <span className="px-3 py-1 rounded-full bg-brand-lightBlue text-brand-solidBlue text-xs font-bold uppercase tracking-wider inline-flex items-center space-x-1 border border-brand-solidBlue">
            <BookOpen className="w-3.5 h-3.5" />
            <span>First-Time Owner Onboarding Hub</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Prepare Your Home <span className="text-brand-solidBlue">Before Pet Arrival</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Cost calculators, home proofing checklists, and 2-minute crash courses for smooth transitions.
          </p>
        </div>
        <div className="flex space-x-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          {[
            { val: 'dog', label: 'Dog', Icon: Dog },
            { val: 'cat', label: 'Cat', Icon: Cat },
          ].map(({ val, label, Icon }) => (
            <button
              key={val}
              onClick={() => setPetType(val as 'dog' | 'cat')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                petType === val
                  ? 'bg-brand-solidBlue text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cost + Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-200">
            <DollarSign className="w-5 h-5 text-brand-solidGreen" />
            <h3 className="text-lg font-bold text-slate-900">Interactive Cost Estimator</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-brand-lightGreen p-4 rounded-2xl border border-brand-solidGreen text-center">
              <span className="text-xs font-bold text-brand-solidGreen block uppercase">Est. Upfront</span>
              <span className="text-3xl font-extrabold text-slate-900">${upfrontCost}</span>
              <span className="text-[10px] text-brand-solidGreen block mt-0.5">Crate, gear & vaccines</span>
            </div>
            <div className="bg-brand-lightBlue p-4 rounded-2xl border border-brand-solidBlue text-center">
              <span className="text-xs font-bold text-brand-solidBlue block uppercase">Monthly Care</span>
              <span className="text-3xl font-extrabold text-slate-900">${recurringCost}</span>
              <span className="text-[10px] text-brand-solidBlue block mt-0.5">Food, treats & care</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Crate / Bed Tier:</label>
              <div className="grid grid-cols-2 gap-2">
                {[{ v: 'medium', l: 'Medium ($90)' }, { v: 'large', l: 'Deluxe ($140)' }].map(o => (
                  <button key={o.v} onClick={() => setCrateSize(o.v as 'medium' | 'large')}
                    className={`p-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                      crateSize === o.v ? 'bg-brand-solidBlue text-white border-brand-solidBlue' : 'bg-white border-slate-200 text-slate-700 hover:border-brand-solidBlue'
                    }`}>{o.l}</button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Food Quality:</label>
              <div className="grid grid-cols-2 gap-2">
                {[{ v: 'standard', l: 'Standard' }, { v: 'premium', l: 'Premium / Organic' }].map(o => (
                  <button key={o.v} onClick={() => setFoodTier(o.v as 'standard' | 'premium')}
                    className={`p-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                      foodTier === o.v ? 'bg-brand-solidBlue text-white border-brand-solidBlue' : 'bg-white border-slate-200 text-slate-700 hover:border-brand-solidBlue'
                    }`}>{o.l}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-5 h-5 text-brand-solidOrange" />
              <h3 className="text-lg font-bold text-slate-900">Pre-Arrival Checklist</h3>
            </div>
            <span className="text-xs font-bold text-brand-solidGreen">{checkedItems.length}/{checklist.length} Done</span>
          </div>
          <div className="space-y-2.5">
            {checklist.map(item => {
              const done = checkedItems.includes(item.id);
              return (
                <div key={item.id} onClick={() => toggleCheck(item.id)}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    done ? 'bg-green-50 border-brand-solidGreen' : 'bg-white border-slate-200 hover:border-brand-solidBlue'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-colors ${
                      done ? 'bg-brand-solidGreen border-brand-solidGreen' : 'border-slate-300 bg-white'
                    }`}>
                      {done && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className={`text-xs font-bold ${done ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {item.category}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Crash Course */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-brand-solidBlue flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">2-Minute Care Crash Course</h3>
            <p className="text-xs text-slate-500">Essential micro-learning for first-time adopters</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {courseModules.map(mod => {
            const done = completedModules.includes(mod.id);
            return (
              <div key={mod.id} className="bg-slate-50 rounded-2xl p-4 border-2 border-slate-200 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-lightBlue text-brand-solidBlue border border-brand-solidBlue flex items-center space-x-1">
                      <Clock className="w-3 h-3" /><span>{mod.duration}</span>
                    </span>
                    {done && <CheckCircle2 className="w-4 h-4 text-brand-solidGreen" />}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{mod.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{mod.desc}</p>
                </div>
                <button onClick={() => toggleModule(mod.id)}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                    done
                      ? 'bg-brand-lightGreen text-brand-solidGreen border-2 border-brand-solidGreen'
                      : 'bg-brand-solidBlue text-white hover:bg-brand-darkBlue'
                  }`}
                >
                  {done ? '✓ Completed' : 'Start Module'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
