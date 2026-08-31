import React, { useEffect, useMemo, useState } from 'react';
import { Check, Droplets, Plus, Scale, Trash2, Utensils } from 'lucide-react';
import { Animal } from '../../types/animal';
import { MealRecord, NutritionData } from '../../types/nutrition';
import { getNutritionData, saveNutritionData } from '../../db/storage';
import { NutritionSafetyTools } from './NutritionSafetyTools';
import { SevenDayMealPlanner } from './SevenDayMealPlanner';
import { NutritionCoach } from './NutritionCoach';

interface NutritionCenterProps {
  userId: string;
  animal: Animal | null;
}

const todayKey = () => new Date().toISOString().slice(0, 10);
const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const NutritionCenter: React.FC<NutritionCenterProps> = ({ userId, animal }) => {
  const [data, setData] = useState<NutritionData>(() => getNutritionData(userId, animal?.id ?? null));
  const [mealName, setMealName] = useState('');
  const [mealPortion, setMealPortion] = useState('');
  const [mealCalories, setMealCalories] = useState('');
  const [waterAmount, setWaterAmount] = useState('');
  const [weight, setWeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [treatName, setTreatName] = useState('');
  const [treatCalories, setTreatCalories] = useState('');

  useEffect(() => {
    setData(getNutritionData(userId, animal?.id ?? null));
  }, [userId, animal?.id]);

  useEffect(() => {
    if (animal) saveNutritionData(userId, animal.id, data);
  }, [animal, data, userId]);

  const guidance = useMemo(() => {
    if (!animal) return null;
    const restingEnergy = 70 * Math.pow(Math.max(animal.weightKg, 0.1), 0.75);
    const ageFactor = animal.ageYears < 1 ? 2.5 : animal.ageYears >= 7 ? 1.2 : 1.6;
    const activityFactor = animal.energyLevel === 'High Energy' ? 1.2 : animal.energyLevel === 'Calm' ? 0.9 : 1;
    const dailyCalories = Math.round(restingEnergy * ageFactor * activityFactor);
    return {
      dailyCalories,
      waterTarget: Math.round(Math.max(animal.weightKg, 0.1) * 50),
      treatAllowance: Math.round(dailyCalories * 0.1),
      mealsPerDay: animal.species === 'bird' || animal.species === 'rabbit' ? 2 : 3
    };
  }, [animal]);

  const today = todayKey();
  const todaysMeals = data.meals.filter(meal => meal.createdAt.slice(0, 10) === today);
  const todaysWater = data.water.filter(entry => entry.recordedAt.slice(0, 10) === today);
  const todaysTreats = data.treats.filter(treat => treat.recordedAt.slice(0, 10) === today);
  const caloriesLogged = todaysMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const waterLogged = todaysWater.reduce((sum, entry) => sum + entry.amountMl, 0);
  const treatsLogged = todaysTreats.reduce((sum, treat) => sum + treat.calories, 0);

  const updateData = (update: (current: NutritionData) => NutritionData) => {
    setData(current => update(current));
  };

  const addMeal = () => {
    if (!mealName.trim()) return;
    const meal: MealRecord = {
      id: newId(),
      name: mealName.trim(),
      mealTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      portion: mealPortion.trim() || 'Not specified',
      calories: Number(mealCalories) || 0,
      eaten: false,
      createdAt: new Date().toISOString()
    };
    updateData(current => ({ ...current, meals: [meal, ...current.meals] }));
    setMealName('');
    setMealPortion('');
    setMealCalories('');
  };

  const addWater = (amount: number) => {
    if (amount <= 0) return;
    updateData(current => ({
      ...current,
      water: [{ id: newId(), amountMl: amount, recordedAt: new Date().toISOString() }, ...current.water]
    }));
    setWaterAmount('');
  };

  const addWeight = () => {
    const value = Number(weight);
    if (value <= 0) return;
    updateData(current => ({
      ...current,
      weights: [{ id: newId(), weightKg: value, recordedAt: new Date().toISOString() }, ...current.weights]
    }));
    setWeight('');
  };

  const addTreat = () => {
    if (!treatName.trim()) return;
    updateData(current => ({
      ...current,
      treats: [{ id: newId(), name: treatName.trim(), calories: Number(treatCalories) || 0, recordedAt: new Date().toISOString() }, ...current.treats]
    }));
    setTreatName('');
    setTreatCalories('');
  };

  if (!animal || !guidance) {
    return (
      <section className="glass-panel-dark rounded-3xl p-6 border border-cyan-500/30 shadow-xl text-center">
        <Utensils className="w-8 h-8 mx-auto text-cyan-400 mb-2" />
        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Smart Nutrition Center</h3>
        <p className="text-xs text-slate-400 mt-2">Add and select a pet to create a personalized nutrition workspace.</p>
      </section>
    );
  }

  const latestWeight = data.weights[0]?.weightKg ?? animal.weightKg;
  const waterPercent = Math.min(100, Math.round((waterLogged / guidance.waterTarget) * 100));
  const mealPercent = Math.min(100, Math.round((caloriesLogged / guidance.dailyCalories) * 100));
  const treatPercent = Math.min(100, Math.round((treatsLogged / guidance.treatAllowance) * 100));

  return (
    <section className="glass-panel-dark rounded-3xl p-5 sm:p-6 border border-lime-500/30 shadow-xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-lime-500/20 pb-4">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-lime-300">Smart Nutrition Center</p>
          <h3 className="text-xl font-extrabold text-white mt-1">Fuel plan for {animal.name}</h3>
          <p className="text-[11px] text-slate-400 mt-1">{animal.species} · {animal.breed} · {animal.ageYears} years · {latestWeight} kg · {animal.energyLevel}</p>
        </div>
        <div className="rounded-2xl bg-lime-950/40 border border-lime-400/30 px-3 py-2 text-right">
          <p className="text-[9px] uppercase tracking-wider text-lime-300">Daily guidance</p>
          <p className="text-lg font-extrabold text-white">{guidance.dailyCalories} kcal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ProgressStat label="Calories logged" value={`${caloriesLogged} / ${guidance.dailyCalories} kcal`} percent={mealPercent} color="bg-orange-400" />
        <ProgressStat label="Water" value={`${waterLogged} / ${guidance.waterTarget} ml`} percent={waterPercent} color="bg-cyan-400" />
        <ProgressStat label="Treats" value={`${treatsLogged} / ${guidance.treatAllowance} kcal`} percent={treatPercent} color="bg-pink-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TrackerPanel title="Today's meal plan" icon={<Utensils className="w-4 h-4 text-orange-300" />}>
          <div className="grid grid-cols-2 gap-2">
            <input value={mealName} onChange={event => setMealName(event.target.value)} placeholder="Meal name" className="nutrition-input col-span-2" />
            <input value={mealPortion} onChange={event => setMealPortion(event.target.value)} placeholder="Portion" className="nutrition-input" />
            <input value={mealCalories} onChange={event => setMealCalories(event.target.value)} type="number" min="0" placeholder="Calories" className="nutrition-input" />
          </div>
          <button onClick={addMeal} className="nutrition-action bg-orange-500/20 border-orange-400/40 text-orange-200"><Plus className="w-3.5 h-3.5" /> Add meal</button>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {todaysMeals.length === 0 && <p className="text-[10px] text-slate-500">No meals recorded today.</p>}
            {todaysMeals.map(meal => <div key={meal.id} className="flex items-center gap-2 text-[11px] bg-[#091122]/70 border border-slate-800 rounded-xl p-2"><button onClick={() => updateData(current => ({ ...current, meals: current.meals.map(item => item.id === meal.id ? { ...item, eaten: !item.eaten } : item) }))} className={`p-1 rounded-lg border ${meal.eaten ? 'text-emerald-300 border-emerald-400/50' : 'text-slate-500 border-slate-700'}`} title="Mark eaten"><Check className="w-3.5 h-3.5" /></button><span className={`flex-1 truncate ${meal.eaten ? 'line-through text-slate-500' : 'text-white'}`}>{meal.name} · {meal.portion}</span><span className="text-slate-400">{meal.calories} kcal</span><button onClick={() => updateData(current => ({ ...current, meals: current.meals.filter(item => item.id !== meal.id) }))} className="text-slate-500 hover:text-red-300" title="Delete meal"><Trash2 className="w-3.5 h-3.5" /></button></div>)}
          </div>
        </TrackerPanel>

        <TrackerPanel title="Water tracker" icon={<Droplets className="w-4 h-4 text-cyan-300" />}>
          <div className="flex flex-wrap gap-2"><button onClick={() => addWater(100)} className="nutrition-action bg-cyan-500/20 border-cyan-400/40 text-cyan-200">+100 ml</button><button onClick={() => addWater(250)} className="nutrition-action bg-cyan-500/20 border-cyan-400/40 text-cyan-200">+250 ml</button><input value={waterAmount} onChange={event => setWaterAmount(event.target.value)} type="number" min="1" placeholder="Custom ml" className="nutrition-input flex-1 min-w-24" /><button onClick={() => addWater(Number(waterAmount))} className="nutrition-action bg-cyan-500/20 border-cyan-400/40 text-cyan-200"><Plus className="w-3.5 h-3.5" /> Add</button></div>
          <p className="text-[10px] text-slate-400">Target: {guidance.waterTarget} ml/day. Hydration needs vary; ask a veterinarian about medical conditions.</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">{todaysWater.map(entry => <div key={entry.id} className="flex justify-between text-[11px] text-slate-300"><span>{new Date(entry.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span><span>{entry.amountMl} ml</span></div>)}</div>
        </TrackerPanel>

        <TrackerPanel title="Weight management" icon={<Scale className="w-4 h-4 text-violet-300" />}>
          <div className="grid grid-cols-2 gap-2"><input value={weight} onChange={event => setWeight(event.target.value)} type="number" min="0" step="0.1" placeholder="Weight kg" className="nutrition-input" /><button onClick={addWeight} className="nutrition-action bg-violet-500/20 border-violet-400/40 text-violet-200"><Plus className="w-3.5 h-3.5" /> Record</button><input value={goalWeight} onChange={event => setGoalWeight(event.target.value)} type="number" min="0" step="0.1" placeholder="Goal weight kg" className="nutrition-input" /><button onClick={() => updateData(current => ({ ...current, goalWeightKg: Number(goalWeight) > 0 ? Number(goalWeight) : null }))} className="nutrition-action bg-violet-500/20 border-violet-400/40 text-violet-200">Save goal</button></div>
          <p className="text-[10px] text-slate-400">Current: {latestWeight} kg · Goal: {data.goalWeightKg ? `${data.goalWeightKg} kg` : 'Not set'}</p>
          <div className="space-y-1 max-h-28 overflow-y-auto">{data.weights.slice(0, 5).map(entry => <div key={entry.id} className="flex justify-between text-[11px] text-slate-300"><span>{new Date(entry.recordedAt).toLocaleDateString()}</span><span>{entry.weightKg} kg</span></div>)}</div>
        </TrackerPanel>

        <TrackerPanel title="Treat tracker" icon={<span className="text-pink-300 text-sm">♥</span>}>
          <div className="grid grid-cols-2 gap-2"><input value={treatName} onChange={event => setTreatName(event.target.value)} placeholder="Treat name" className="nutrition-input" /><input value={treatCalories} onChange={event => setTreatCalories(event.target.value)} type="number" min="0" placeholder="Calories" className="nutrition-input" /></div>
          <button onClick={addTreat} className="nutrition-action bg-pink-500/20 border-pink-400/40 text-pink-200"><Plus className="w-3.5 h-3.5" /> Add treat</button>
          <div className="space-y-1 max-h-28 overflow-y-auto">{todaysTreats.map(treat => <div key={treat.id} className="flex justify-between text-[11px] text-slate-300"><span>{treat.name}</span><span>{treat.calories} kcal</span></div>)}</div>
        </TrackerPanel>
      </div>

      <p className="text-[10px] leading-relaxed text-slate-500">Calorie and water figures are configurable rule-based estimates using {animal.species}, weight, age, and activity. They are not medical advice. Consult a veterinarian for allergies, illness, weight changes, or therapeutic diets.</p>
      <NutritionSafetyTools animal={animal} />
      <NutritionCoach animal={animal} data={data} dailyCalories={guidance.dailyCalories} waterTarget={guidance.waterTarget} />
      <SevenDayMealPlanner userId={userId} animal={animal} />
    </section>
  );
};

const ProgressStat: React.FC<{ label: string; value: string; percent: number; color: string }> = ({ label, value, percent, color }) => (
  <div className="rounded-2xl bg-[#091122]/70 border border-slate-800 p-3 space-y-2"><div className="flex justify-between gap-2"><span className="text-[10px] text-slate-400">{label}</span><span className="text-[10px] text-white font-extrabold">{value}</span></div><div className="h-1.5 rounded-full bg-slate-800 overflow-hidden"><div className={`h-full ${color} transition-all`} style={{ width: `${percent}%` }} /></div></div>
);

const TrackerPanel: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="rounded-2xl bg-[#0a1327]/80 border border-slate-800 p-4 space-y-3"><h4 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-white">{icon}{title}</h4>{children}</div>
);
