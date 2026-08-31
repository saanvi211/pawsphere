import React, { useState } from 'react';
import { Animal } from '../../types/animal';
import { Stethoscope, Send, AlertTriangle, Building2, Info, Clock, CheckCircle } from 'lucide-react';
import { analyzePetSymptoms, TriageResult } from '../../lib/api/triage';

interface AISymptomCheckerProps {
  animal: Animal | null;
}

export const AITriageView: React.FC<AISymptomCheckerProps> = ({ animal }) => {
  const [symptomText, setSymptomText] = useState('');
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);

  const handleAskAI = async () => {
    if (!symptomText.trim()) return;
    setIsAnalysing(true);
    try {
      const triageResult = await analyzePetSymptoms(symptomText, animal);
      setResult(triageResult);
    } finally {
      setIsAnalysing(false);
    }
  };

  return (
    <div className="py-6 max-w-4xl mx-auto px-4 space-y-6">
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            AI Triage & <span className="text-brand-solidOrange">Medical Advisor</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold">Verify acute symptoms, check treatment advice, and view first-aid guidance</p>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6 border-2 border-slate-200 shadow-lg space-y-6">
        
        {/* Warning Cautionary Box */}
        <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl flex items-start space-x-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1 font-semibold text-red-800">
            <span className="font-extrabold uppercase block text-[11px]">⚠️ Medical Disclaimer Notice</span>
            <p>
              AI answers are strictly for emergency first-aid instruction and reference. They are not always 100% correct. If your animal is in distress, please contact a licensed clinic immediately.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
            <Stethoscope className="w-5 h-5 text-brand-solidBlue" />
            <span>Describe Pet Symptoms</span>
          </h3>
          <p className="text-xs text-slate-600">Type what you observe (e.g. "dog ate chocolate", "cat is vomiting", "limping on front leg").</p>
        </div>

        <textarea
          rows={3}
          value={symptomText}
          onChange={e => setSymptomText(e.target.value)}
          placeholder="Type symptoms here..."
          className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl p-4 text-xs font-bold text-slate-800 focus:outline-none focus:border-brand-solidBlue"
        />

        <button
          onClick={handleAskAI}
          disabled={isAnalysing || !symptomText.trim()}
          className={`w-full py-3.5 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2 ${
            isAnalysing || !symptomText.trim() ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-brand-solidBlue hover:bg-brand-darkBlue text-white'
          }`}
        >
          <span>{isAnalysing ? 'Analyzing Symptoms...' : 'Analyze Symptoms & Get First Aid'}</span>
        </button>

        {result && (
          <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-4 animate-fadeIn text-xs">
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded font-extrabold text-[10px] uppercase border ${
                result.careLevel === 'CRITICAL FIRST AID'
                  ? 'bg-red-100 text-red-700 border-red-200'
                  : result.careLevel === 'SEE VET SOON'
                  ? 'bg-amber-100 text-amber-700 border-amber-200'
                  : 'bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}>
                {result.careLevel}
              </span>
            </div>

            <p className="text-slate-700 font-semibold leading-relaxed">{result.summary}</p>

            {/* First Aid Steps */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Immediate First Aid Actions:</h4>
              <ul className="space-y-2 text-slate-700 font-semibold pl-4 list-disc">
                {result.firstAidSteps.map((step, idx) => (
                  <li key={idx} className="leading-relaxed">{step}</li>
                ))}
              </ul>
            </div>

            {/* Warning sign */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 font-semibold">
              ⚠️ <strong>Watch for:</strong> {result.warningSign}
            </div>

            {/* Treatment plan */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-800 font-semibold">
              🏥 <strong>Treatment Plan:</strong> {result.treatmentPlan}
            </div>

            {/* Nearest clinic advice */}
            <div className="p-3.5 bg-red-100/50 border-2 border-red-200 rounded-xl text-[11px] text-red-800 font-semibold leading-relaxed">
              ⚠️ <strong>When to go:</strong> {result.nearestClinicAdvice}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
