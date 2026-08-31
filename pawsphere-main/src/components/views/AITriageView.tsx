import React, { useState } from 'react';
import { Animal } from '../../types/animal';
import {
  Stethoscope,
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  HelpCircle,
  Activity,
  Sparkles,
  Info,
  Building2,
  RefreshCw
} from 'lucide-react';
import { analyzePetSymptoms, TriageResult, SeverityLevel } from '../../lib/api/triage';

interface AISymptomCheckerProps {
  animal: Animal | null;
}

const PRESET_SYMPTOMS = [
  { label: '🐶 Itching / Skin Irritation', query: 'My dog is itching and scratching constantly' },
  { label: '🤮 Vomiting', query: 'My dog is vomiting after eating' },
  { label: '💩 Diarrhea', query: 'My pet has watery diarrhea' },
  { label: '🦵 Limping', query: 'My dog is limping on front leg' },
  { label: '🫁 Coughing', query: 'My pet has a dry cough' },
  { label: '🚨 Breathing Distress', query: 'My dog has difficulty breathing and gasping' },
  { label: '⚡ Seizure / Tremor', query: 'My dog had a seizure and uncontrolled shaking' },
  { label: '🩸 Bleeding / Cut', query: 'My pet is bleeding from a paw wound' },
];

export const AITriageView: React.FC<AISymptomCheckerProps> = ({ animal }) => {
  const [symptomText, setSymptomText] = useState('');
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);

  const handleAskAI = async (textToAnalyze?: string) => {
    const queryText = (textToAnalyze ?? symptomText).trim();
    if (!queryText) return;

    // Reset previous result & trigger loading state (fixes stale state bug)
    setResult(null);
    setIsAnalysing(true);

    try {
      const triageResult = await analyzePetSymptoms(queryText, animal);
      setResult(triageResult);
    } catch (err) {
      console.error('[AITriageView] Error analyzing symptoms:', err);
    } finally {
      setIsAnalysing(false);
    }
  };

  const handleChipClick = (query: string) => {
    setSymptomText(query);
    handleAskAI(query);
  };

  const getSeverityBadge = (severity: SeverityLevel) => {
    switch (severity) {
      case 'EMERGENCY':
        return {
          label: '🔴 EMERGENCY VETERINARY CARE',
          className: 'bg-red-100 text-red-800 border-red-300 animate-pulse',
        };
      case 'URGENT VETERINARY CARE':
        return {
          label: '🟠 URGENT VETERINARY CARE',
          className: 'bg-orange-100 text-orange-800 border-orange-300',
        };
      case 'VETERINARY CHECK RECOMMENDED':
        return {
          label: '🟡 VETERINARY CHECK RECOMMENDED',
          className: 'bg-amber-100 text-amber-800 border-amber-300',
        };
      case 'MONITOR AT HOME':
      default:
        return {
          label: '🟢 MONITOR AT HOME',
          className: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        };
    }
  };

  return (
    <div className="py-6 max-w-4xl mx-auto px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            AI Health Helper <span className="text-brand-solidOrange">& Symptom Analyzer</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Instantly evaluate acute pet symptoms, detect red flags, and receive symptom-specific first-aid guidance.
          </p>
        </div>
        {animal && (
          <div className="px-3.5 py-1.5 bg-blue-50 border border-blue-200 rounded-full flex items-center space-x-2 text-xs font-bold text-blue-900 shrink-0">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            <span>Active Pet: <strong>{animal.name}</strong> ({animal.breed})</span>
          </div>
        )}
      </div>

      <div className="glass-card rounded-3xl p-6 border-2 border-slate-200 shadow-lg space-y-6">
        {/* Warning Disclaimer Box */}
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start space-x-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1 font-semibold text-red-800">
            <span className="font-extrabold uppercase block text-[11px] tracking-wider">⚠️ Veterinary Disclaimer Notice</span>
            <p>
              AI answers are strictly for emergency first-aid instruction and reference. They do not replace a licensed veterinarian. If your animal is in distress, please contact an emergency clinic immediately.
            </p>
          </div>
        </div>

        {/* Input Header & Form */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center space-x-2">
              <Stethoscope className="w-5 h-5 text-brand-solidBlue" />
              <span>Describe Pet Symptoms</span>
            </h3>
            {symptomText && (
              <button
                onClick={() => { setSymptomText(''); setResult(null); }}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-600 flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>
          <p className="text-xs text-slate-600">
            Describe what you observe in natural language (e.g., "my dog is limping", "cat is itching skin", "coughing & struggling to breathe").
          </p>

          <textarea
            rows={3}
            value={symptomText}
            onChange={e => setSymptomText(e.target.value)}
            placeholder="Type symptoms here (e.g. My dog has been itching excessively and scratching its ears)..."
            className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl p-4 text-xs font-bold text-slate-800 focus:outline-none focus:border-brand-solidBlue transition-all shadow-inner"
          />

          {/* Quick-select symptom chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Or click a common symptom to test:</span>
            <div className="flex flex-wrap gap-2">
              {PRESET_SYMPTOMS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChipClick(preset.query)}
                  disabled={isAnalysing}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-brand-solidBlue hover:text-white text-slate-700 text-[11px] font-bold rounded-lg transition-all border border-slate-200 shadow-sm disabled:opacity-50"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Analyze Button */}
        <button
          onClick={() => handleAskAI()}
          disabled={isAnalysing || !symptomText.trim()}
          className={`w-full py-3.5 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2 ${
            isAnalysing || !symptomText.trim()
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-brand-solidBlue hover:bg-brand-darkBlue text-white hover:shadow-lg'
          }`}
        >
          {isAnalysing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Analyzing Symptoms & Assessing Severity...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Analyze Symptoms & Get First Aid</span>
            </>
          )}
        </button>

        {/* Loading State */}
        {isAnalysing && (
          <div className="p-8 rounded-2xl bg-blue-50/50 border-2 border-blue-200 text-center space-y-3 animate-pulse">
            <div className="inline-flex p-3 rounded-full bg-blue-100 text-brand-solidBlue">
              <Stethoscope className="w-6 h-6 animate-bounce" />
            </div>
            <p className="text-xs font-extrabold text-slate-800">
              Evaluating symptom keywords, category, and red-flag indicators...
            </p>
            <p className="text-[11px] text-slate-500 font-semibold">
              Generating tailored first-aid steps for {animal?.name || 'your pet'}
            </p>
          </div>
        )}

        {/* Dynamic Symptom-Specific Result Card */}
        {result && !isAnalysing && (
          <div className="p-6 rounded-2xl bg-white border-2 border-slate-200 shadow-md space-y-5 animate-fadeIn text-xs">
            {/* Header: Severity Badge + Category */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1.5 rounded-lg font-black text-[11px] uppercase tracking-wider border shadow-sm ${getSeverityBadge(result.severity).className}`}>
                  {getSeverityBadge(result.severity).label}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold text-slate-400">Category:</span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md font-extrabold text-[11px] border border-slate-200">
                  {result.category}
                </span>
              </div>
            </div>

            {/* Primary Symptom Identified */}
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Identified Symptom</span>
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-brand-solidOrange" />
                <span>{result.symptom}</span>
              </h4>
            </div>

            {/* Summary / Assessment */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-semibold leading-relaxed space-y-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Assessment Summary</span>
              <p>{result.summary}</p>
            </div>

            {/* Grid: Possible Causes & Immediate First Aid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Possible Causes */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>Possible Causes:</span>
                </h5>
                <ul className="space-y-1.5 text-slate-700 font-semibold pl-2">
                  {result.possibleCauses.map((cause, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-[11px]">
                      <span className="text-brand-solidBlue font-extrabold">•</span>
                      <span>{cause}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Immediate First Aid Actions */}
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
                <h5 className="font-extrabold text-emerald-900 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Immediate First Aid Actions:</span>
                </h5>
                <ul className="space-y-1.5 text-slate-800 font-semibold pl-2">
                  {result.immediateFirstAid.map((step, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-[11px]">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Things to Monitor */}
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2 text-amber-900">
              <h5 className="font-extrabold text-xs uppercase tracking-wider flex items-center space-x-1.5 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Things to Monitor at Home:</span>
              </h5>
              <ul className="space-y-1 text-[11px] font-semibold pl-2">
                {result.thingsToMonitor.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-amber-600 font-extrabold">👁️</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Red Flags Alert */}
            <div className="p-4 bg-red-50 rounded-xl border border-red-200 space-y-2 text-red-900">
              <h5 className="font-extrabold text-xs uppercase tracking-wider flex items-center space-x-1.5 text-red-900">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>🚨 Red Flags / Emergency Indicators:</span>
              </h5>
              <ul className="space-y-1 text-[11px] font-semibold pl-2">
                {result.redFlags.map((flag, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-red-600 font-extrabold">⚠️</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Veterinary Recommendation */}
            <div className="p-4 bg-blue-900 text-white rounded-xl space-y-1 shadow-sm">
              <span className="text-[10px] font-extrabold text-blue-200 uppercase tracking-widest block flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5 text-blue-300" />
                <span>Veterinary Recommendation</span>
              </span>
              <p className="text-xs font-bold leading-relaxed">{result.vetRecommendation}</p>
            </div>

            {/* Follow-Up Questions (Interactive Guidance) */}
            {result.followUpQuestions && result.followUpQuestions.length > 0 && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h5 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                  <HelpCircle className="w-4 h-4 text-brand-solidOrange" />
                  <span>Helpful Follow-Up Details for Your Vet:</span>
                </h5>
                <p className="text-[11px] text-slate-500 font-semibold">
                  Be ready to answer these questions if you call or visit your veterinarian:
                </p>
                <ul className="space-y-1 text-[11px] font-semibold text-slate-700 pl-2">
                  {result.followUpQuestions.map((q, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-brand-solidOrange font-bold">?</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
