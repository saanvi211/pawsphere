import React, { useEffect, useState } from 'react';
import { Check, ClipboardList, RefreshCw, Trash2 } from 'lucide-react';
import { Animal } from '../../types/animal';
import { MealPlanDay } from '../../types/nutrition';
import { clearMealPlan, getMealPlan, saveMealPlan } from '../../db/storage';

interface SevenDayMealPlannerProps {
  userId: string;
  animal: Animal;
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const buildPlan = (animal: Animal): MealPlanDay[] => {
  const protein = animal.species === 'cat' ? 'complete wet food' : animal.species === 'rabbit' ? 'timothy hay and leafy greens' : animal.species === 'bird' ? 'species-appropriate pellets and greens' : 'complete balanced food';
  const activityNote = animal.energyLevel === 'High Energy' ? 'with an active-day portion' : animal.energyLevel === 'Calm' ? 'with a measured portion' : 'with a balanced portion';
  return days.map((day, index) => ({
    day,
    breakfast: `${protein} ${activityNote}`,
    lunch: index % 2 === 0 ? 'Fresh water and a small approved snack' : 'Measured ${protein} portion'.replace('${protein}', protein),
    dinner: `${protein} with veterinarian-approved extras`,
    completed: false
  }));
};

export const SevenDayMealPlanner: React.FC<SevenDayMealPlannerProps> = ({ userId, animal }) => {
  const [plan, setPlan] = useState<MealPlanDay[] | null>(() => getMealPlan(userId, animal.id));

  useEffect(() => {
    setPlan(getMealPlan(userId, animal.id));
  }, [animal.id, userId]);

  useEffect(() => {
    if (plan) saveMealPlan(userId, animal.id, plan);
  }, [animal.id, plan, userId]);

  const updateDay = (index: number, field: keyof MealPlanDay, value: string | boolean) => {
    setPlan(current => current ? current.map((day, dayIndex) => dayIndex === index ? { ...day, [field]: value } : day) : current);
  };

  const generate = () => setPlan(buildPlan(animal));
  const remove = () => {
    clearMealPlan(userId, animal.id);
    setPlan(null);
  };

  return (
    <section className="glass-panel-dark rounded-3xl p-5 sm:p-6 border border-orange-500/30 shadow-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-orange-500/20 pb-3">
        <div className="flex items-center gap-2"><ClipboardList className="w-5 h-5 text-orange-300" /><div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-orange-300">AI 7-Day Meal Planner</p><h3 className="text-lg font-extrabold text-white mt-1">A weekly plan for {animal.name}</h3></div></div>
        <div className="flex gap-2"><button onClick={generate} className="nutrition-action bg-orange-500/20 border-orange-400/40 text-orange-200"><RefreshCw className="w-3.5 h-3.5" /> {plan ? 'Regenerate' : 'Generate plan'}</button>{plan && <button onClick={remove} className="nutrition-action bg-rose-500/20 border-rose-400/40 text-rose-200" title="Delete plan"><Trash2 className="w-3.5 h-3.5" /> Delete</button>}</div>
      </div>
      {!plan ? <div className="rounded-2xl bg-[#091122]/60 border border-slate-800 p-5 text-center"><p className="text-xs text-slate-400">Generate a plan from {animal.species}, {animal.weightKg} kg, {animal.ageYears} years, and {animal.energyLevel} activity data.</p></div> : <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">{plan.map((day, index) => <div key={day.day} className={`rounded-2xl bg-[#091122]/70 border p-3 space-y-2 ${day.completed ? 'border-emerald-400/50' : 'border-slate-800'}`}><div className="flex items-center justify-between"><h4 className="text-xs font-extrabold text-white uppercase">{day.day}</h4><button onClick={() => updateDay(index, 'completed', !day.completed)} className={`p-1 rounded-lg border ${day.completed ? 'text-emerald-300 border-emerald-400/50' : 'text-slate-500 border-slate-700'}`} title="Mark day complete"><Check className="w-3.5 h-3.5" /></button></div>{(['breakfast', 'lunch', 'dinner'] as const).map(meal => <label key={meal} className="block"><span className="text-[9px] uppercase tracking-wider text-orange-300">{meal}</span><textarea value={day[meal]} onChange={event => updateDay(index, meal, event.target.value)} className="nutrition-input w-full mt-1 min-h-12 resize-y text-[10px]" /></label>)}</div>)}</div>}
      <p className="text-[10px] text-slate-500">Plans are general educational guidance based on the selected pet profile. Confirm ingredients, portions, allergies, and therapeutic diets with a veterinarian.</p>
    </section>
  );
};
