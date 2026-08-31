import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Search, Upload } from 'lucide-react';
import { Animal } from '../../types/animal';

interface NutritionSafetyToolsProps {
  animal: Animal;
}

type FoodRisk = 'SAFE' | 'CAUTION' | 'TOXIC / AVOID';

const foodRules: Record<string, { risk: FoodRisk; explanation: string; species?: string[] }> = {
  chocolate: { risk: 'TOXIC / AVOID', explanation: 'Chocolate contains methylxanthines that can be dangerous for pets. Keep all forms away and contact a veterinarian if eaten.' },
  grapes: { risk: 'TOXIC / AVOID', explanation: 'Grapes and raisins may cause serious kidney problems, especially in dogs. Treat any ingestion as urgent veterinary advice.' },
  raisins: { risk: 'TOXIC / AVOID', explanation: 'Raisins may cause serious kidney problems, especially in dogs. Contact a veterinarian promptly after ingestion.' },
  onion: { risk: 'TOXIC / AVOID', explanation: 'Onions and related alliums can damage red blood cells. Cooked, raw, and powdered forms can all be concerning.' },
  garlic: { risk: 'TOXIC / AVOID', explanation: 'Garlic and related alliums can damage red blood cells. Avoid concentrated powders and supplements.' },
  xylitol: { risk: 'TOXIC / AVOID', explanation: 'Xylitol can cause a rapid blood sugar drop and other serious effects. Check sugar-free products carefully.' },
  avocado: { risk: 'CAUTION', explanation: 'Avocado is not a suitable general treat for every species. The pit, skin, and high fat content add hazards; ask a veterinarian for species-specific advice.' },
  milk: { risk: 'CAUTION', explanation: 'Many pets do not digest lactose well. Small amounts may still cause digestive upset; avoid using dairy as a routine treat.' },
  carrot: { risk: 'SAFE', explanation: 'Plain, bite-sized carrot is commonly used as a treat for dogs and some other pets, but portions should remain small.' },
  pumpkin: { risk: 'SAFE', explanation: 'Plain cooked pumpkin without spices or sweeteners may be suitable for some pets in small portions.' }
};

export const NutritionSafetyTools: React.FC<NutritionSafetyToolsProps> = ({ animal }) => {
  const [food, setFood] = useState('');
  const [foodResult, setFoodResult] = useState<{ name: string; risk: FoodRisk; explanation: string } | null>(null);
  const [ingredients, setIngredients] = useState('');
  const [analysis, setAnalysis] = useState<string[] | null>(null);

  const checkFood = () => {
    const query = food.trim().toLowerCase();
    if (!query) return;
    const match = Object.entries(foodRules).find(([name]) => query.includes(name));
    setFoodResult(match ? { name: match[0], ...match[1] } : {
      name: query,
      risk: 'CAUTION',
      explanation: `No rule was found for this food. Safety depends on ${animal.species}, preparation, portion, and your pet's health. Check with a veterinarian before offering it.`
    });
  };

  const analyzeIngredients = () => {
    const normalized = ingredients.toLowerCase();
    const findings: string[] = [];
    const match = Object.entries(foodRules).filter(([name]) => normalized.includes(name));
    if (match.length > 0) {
      match.forEach(([name, rule]) => findings.push(`${name}: ${rule.risk}. ${rule.explanation}`));
    }
    const protein = normalized.match(/protein\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*%?/i);
    const fat = normalized.match(/(?:crude\s+)?fat\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*%?/i);
    const fiber = normalized.match(/(?:crude\s+)?fiber\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*%?/i);
    const calories = normalized.match(/(?:calories|kcal)\s*[:\-]?\s*(\d+(?:\.\d+)?)/i);
    if (protein) findings.push(`Extracted protein: ${protein[1]}%`);
    if (fat) findings.push(`Extracted fat: ${fat[1]}%`);
    if (fiber) findings.push(`Extracted fiber: ${fiber[1]}%`);
    if (calories) findings.push(`Extracted calories: ${calories[1]} kcal`);
    if (findings.length === 0) findings.push('No recognized nutrients or flagged ingredients were found in the entered text.');
    findings.push(`Recommendation: compare the label with ${animal.name}'s ${animal.species} profile and ask a veterinarian about allergies, therapeutic diets, or health conditions.`);
    setAnalysis(findings);
  };

  const readIngredientFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setIngredients(String(reader.result || ''));
    reader.readAsText(file);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-2xl bg-[#0a1327]/80 border border-rose-500/30 p-4 space-y-3">
        <div className="flex items-center gap-2"><Search className="w-4 h-4 text-rose-300" /><h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Toxic Food Checker</h4></div>
        <p className="text-[10px] text-slate-400">Checking for {animal.name} · {animal.species}. Results are educational, not a diagnosis.</p>
        <div className="flex gap-2"><input value={food} onChange={event => setFood(event.target.value)} onKeyDown={event => event.key === 'Enter' && checkFood()} placeholder="Enter a food" className="nutrition-input flex-1" /><button onClick={checkFood} className="nutrition-action bg-rose-500/20 border-rose-400/40 text-rose-200">Check</button></div>
        {foodResult && <div className="rounded-xl bg-[#091122]/70 border border-slate-800 p-3 space-y-1"><div className="flex items-center gap-2 text-xs font-extrabold text-white">{foodResult.risk === 'SAFE' ? <CheckCircle className="w-4 h-4 text-emerald-300" /> : <AlertTriangle className="w-4 h-4 text-amber-300" />}<span>{foodResult.name} · {foodResult.risk}</span></div><p className="text-[10px] leading-relaxed text-slate-300">{foodResult.explanation}</p></div>}
      </div>

      <div className="rounded-2xl bg-[#0a1327]/80 border border-amber-500/30 p-4 space-y-3">
        <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-300" /><h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Ingredient Analyzer</h4></div>
        <p className="text-[10px] text-slate-400">Extracted label values and safety flags are shown separately from the recommendation.</p>
        <textarea value={ingredients} onChange={event => setIngredients(event.target.value)} placeholder="Paste ingredients or label text including protein, fat, fiber, and calories" className="nutrition-input w-full min-h-20 resize-y" />
        <div className="flex flex-wrap gap-2"><label className="nutrition-action bg-slate-700/60 border-slate-600 text-slate-200 cursor-pointer"><Upload className="w-3.5 h-3.5" /> Load text file<input type="file" accept=".txt,.csv" onChange={readIngredientFile} className="hidden" /></label><button onClick={analyzeIngredients} className="nutrition-action bg-amber-500/20 border-amber-400/40 text-amber-200">Analyze label</button></div>
        {analysis && <div className="rounded-xl bg-[#091122]/70 border border-slate-800 p-3 space-y-2">{analysis.map((finding, index) => <p key={`${finding}-${index}`} className={`text-[10px] leading-relaxed ${finding.startsWith('Recommendation:') ? 'text-cyan-300 border-t border-slate-800 pt-2' : 'text-slate-300'}`}>{finding}</p>)}</div>}
      </div>
    </div>
  );
};
