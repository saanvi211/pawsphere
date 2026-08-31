import React, { useState } from 'react';
import { Bot, Send, ShieldAlert } from 'lucide-react';
import { Animal } from '../../types/animal';
import { NutritionData } from '../../types/nutrition';

interface NutritionCoachProps {
  animal: Animal;
  data: NutritionData;
  dailyCalories: number;
  waterTarget: number;
}

const getAnswer = (question: string, animal: Animal, data: NutritionData, dailyCalories: number, waterTarget: number): { text: string; medical: boolean } => {
  const query = question.toLowerCase();
  const caloriesLogged = data.meals.filter(meal => meal.createdAt.slice(0, 10) === new Date().toISOString().slice(0, 10)).reduce((sum, meal) => sum + meal.calories, 0);
  const waterLogged = data.water.filter(entry => entry.recordedAt.slice(0, 10) === new Date().toISOString().slice(0, 10)).reduce((sum, entry) => sum + entry.amountMl, 0);
  const medical = /allerg|vomit|diarrhea|sick|disease|medication|diabet|kidney|pregnan|pain|poison|toxic/.test(query);

  if (medical) return { medical: true, text: `Because your question may involve a health or dietary condition, I cannot safely diagnose ${animal.name}. Avoid changing food or medication based on this chat and contact a veterinarian, especially if symptoms are severe, repeated, or sudden.` };
  if (query.includes('calorie') || query.includes('eat today')) return { medical: false, text: `${animal.name}'s rule-based daily estimate is about ${dailyCalories} kcal. Today, ${caloriesLogged} kcal is recorded, leaving about ${Math.max(0, dailyCalories - caloriesLogged)} kcal in the estimate. Split food into ${animal.species === 'rabbit' || animal.species === 'bird' ? 2 : 3} measured meals and follow the product label and veterinary advice.` };
  if (query.includes('water') || query.includes('drink')) return { medical: false, text: `The current hydration guide for ${animal.name} is about ${waterTarget} ml per day, with ${waterLogged} ml recorded today. Keep fresh water available and remember that heat, exercise, diet, and health can change needs.` };
  if (query.includes('plan') || query.includes('meal')) return { medical: false, text: `For ${animal.name}, use complete ${animal.species}-appropriate food, measured portions, and a consistent schedule. The 7-day planner below can create and save a weekly starting point using this ${animal.energyLevel.toLowerCase()} activity profile.` };
  if (query.includes('this') || query.includes('food')) return { medical: false, text: `Use the Toxic Food Checker and Ingredient Analyzer below for the label or food name. They flag known ingredients, but they cannot confirm allergy safety or replace a veterinarian's review.` };
  return { medical: false, text: `I am using ${animal.name}'s ${animal.species} profile, ${animal.weightKg} kg weight, ${animal.ageYears} years, and ${animal.energyLevel.toLowerCase()} activity level. Ask about today's calories, water, a meal plan, or a specific food.` };
};

export const NutritionCoach: React.FC<NutritionCoachProps> = ({ animal, data, dailyCalories, waterTarget }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isMedical, setIsMedical] = useState(false);

  const ask = (value = question) => {
    if (!value.trim()) return;
    const result = getAnswer(value, animal, data, dailyCalories, waterTarget);
    setAnswer(result.text);
    setIsMedical(result.medical);
    setQuestion('');
  };

  return (
    <section className="rounded-2xl bg-[#0a1327]/80 border border-cyan-500/30 p-4 space-y-3">
      <div className="flex items-center gap-2"><Bot className="w-4 h-4 text-cyan-300" /><div><h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Ask Nutrition AI</h4><p className="text-[10px] text-slate-400">Context: {animal.name} · {animal.species} · {animal.weightKg} kg · {animal.energyLevel}</p></div></div>
      <div className="flex flex-wrap gap-2">{['What should my pet eat today?', 'How many calories should my pet have?', 'Create a meal plan.', 'Can my pet eat this?'].map(prompt => <button key={prompt} onClick={() => ask(prompt)} className="nutrition-action bg-cyan-500/10 border-cyan-400/30 text-cyan-200">{prompt}</button>)}</div>
      <div className="flex gap-2"><input value={question} onChange={event => setQuestion(event.target.value)} onKeyDown={event => event.key === 'Enter' && ask()} placeholder="Ask about this pet's nutrition" className="nutrition-input flex-1" /><button onClick={() => ask()} className="nutrition-action bg-cyan-500/20 border-cyan-400/40 text-cyan-200" title="Ask Nutrition AI"><Send className="w-3.5 h-3.5" /> Ask</button></div>
      {answer && <div className="rounded-xl bg-[#091122]/70 border border-slate-800 p-3 text-[10px] leading-relaxed text-slate-300">{answer}{isMedical && <div className="mt-2 flex items-start gap-1.5 text-amber-300"><ShieldAlert className="w-3.5 h-3.5 shrink-0" />Veterinary advice is required for medical or therapeutic nutrition concerns.</div>}</div>}
    </section>
  );
};
