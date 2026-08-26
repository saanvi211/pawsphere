import React, { useState } from 'react';
import { MatchmakingQuestionnaire, SpeciesType } from '../../types/animal';
import { saveStorageQuiz } from '../../db/storage';
import { Compass, Home, Clock, DollarSign, Award, ArrowRight, ArrowLeft, Heart, Dog, Cat, Bird, Fish, Sparkles } from 'lucide-react';

interface MatchmakingWizardProps {
  onComplete: (quiz: MatchmakingQuestionnaire) => void;
}

export const MatchmakingWizard: React.FC<MatchmakingWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [quiz, setQuiz] = useState<MatchmakingQuestionnaire>({
    targetPetType: 'dog',
    homeType: 'Apartment',
    dailyTimeAvailable: '1 to 2 Hours',
    monthlyBudget: 100,
    experienceLevel: 'First-time Pet Owner',
    activityLevel: 'Moderate',
    hasChildren: false,
    hasOtherPets: false,
    patienceLevel: 'Medium',
    noiseTolerance: 'Medium',
    desiredTrait: 'playful'
  });

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      saveStorageQuiz(quiz);
      onComplete(quiz);
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="py-8 max-w-3xl mx-auto px-4">
      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white shadow-2xl space-y-8 relative overflow-hidden">
        
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Pet Matchmaking Quiz</h2>
                <p className="text-xs text-slate-500">Find the perfect pet for your home and lifestyle</p>
              </div>
            </div>
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
              Step {step} of 4
            </span>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-amber-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* STEP 1: Animal Choice */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
                <Heart className="w-5 h-5 text-amber-600 fill-amber-500" />
                <span>1. What pet are you looking to adopt or buy?</span>
              </h3>
              <p className="text-xs text-slate-600">Choose the animal type you are most interested in bringing home.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { type: 'dog', label: 'Dog / Puppy', icon: Dog },
                { type: 'cat', label: 'Cat / Kitten', icon: Cat },
                { type: 'bird', label: 'Bird / Parrot', icon: Bird },
                { type: 'fish', label: 'Betta / Fish', icon: Fish },
                { type: 'reptile', label: 'Lizard / Dragon', icon: Sparkles },
                { type: 'any', label: 'Show All Pets', icon: Compass }
              ].map(item => {
                const Icon = item.icon;
                const isSelected = quiz.targetPetType === item.type;
                return (
                  <button
                    key={item.type}
                    onClick={() => setQuiz({ ...quiz, targetPetType: item.type as any })}
                    className={`p-4 rounded-2xl border transition-all text-center flex flex-col items-center space-y-2 ${
                      isSelected
                        ? 'bg-amber-100/80 border-amber-500 shadow-md ring-2 ring-amber-500/20'
                        : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
                    }`}
                  >
                    <Icon className={`w-7 h-7 ${isSelected ? 'text-amber-700' : 'text-slate-600'}`} />
                    <span className="text-xs font-extrabold text-slate-900">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Home Type */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
                <Home className="w-5 h-5 text-amber-600" />
                <span>2. What type of home do you live in?</span>
              </h3>
              <p className="text-xs text-slate-600">Your living space helps match pets with suitable space needs.</p>
            </div>

            <div className="space-y-3">
              {[
                { id: 'Apartment', title: 'Apartment / Flat', desc: 'Indoor living space with daily outdoor walks or balcony.' },
                { id: 'House with Yard', title: 'House with Fenced Yard', desc: 'Secure yard space for free running and play.' },
                { id: 'Farm / Large Property', title: 'Large Property / Farm', desc: 'Abundant open space for energetic pets.' }
              ].map(h => (
                <button
                  key={h.id}
                  onClick={() => setQuiz({ ...quiz, homeType: h.id as any })}
                  className={`w-full p-4 rounded-2xl text-left border transition-all ${
                    quiz.homeType === h.id
                      ? 'bg-amber-100/80 border-amber-500 shadow-md ring-2 ring-amber-500/20'
                      : 'bg-white border-slate-200 hover:border-amber-300'
                  }`}
                >
                  <div className="font-extrabold text-sm text-slate-900 mb-0.5">{h.title}</div>
                  <div className="text-xs text-slate-600">{h.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Time Available */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <span>3. Daily Time & Attention Available</span>
              </h3>
              <p className="text-xs text-slate-600">How much time can you spend daily walking, feeding, and playing?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'Under 1 Hour', title: 'Under 1 Hour', desc: 'Quiet, low-maintenance pets (Cats, Fish, Reptiles)' },
                { id: '1 to 2 Hours', title: '1 to 2 Hours', desc: 'Moderate activity (Adult Dogs, Birds)' },
                { id: '3+ Hours', title: '3+ Hours Daily', desc: 'High energy puppies and active breeds' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setQuiz({ ...quiz, dailyTimeAvailable: t.id as any })}
                  className={`p-4 rounded-2xl text-center border transition-all ${
                    quiz.dailyTimeAvailable === t.id
                      ? 'bg-amber-100/80 border-amber-500 shadow-md font-extrabold text-amber-900'
                      : 'bg-white border-slate-200 hover:border-amber-300 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-extrabold text-slate-900">{t.title}</div>
                  <div className="text-[11px] text-slate-500 mt-1">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Monthly Budget */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-amber-600" />
                <span>4. Monthly Care Budget</span>
              </h3>
              <p className="text-xs text-slate-600">Comfortable monthly allocation for food, treats, grooming, and routine care.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Monthly Target Budget:</span>
                <span className="text-xl font-extrabold text-amber-700">${quiz.monthlyBudget} / month</span>
              </div>

              <input
                type="range"
                min={20}
                max={250}
                step={10}
                value={quiz.monthlyBudget}
                onChange={e => setQuiz({ ...quiz, monthlyBudget: Number(e.target.value) })}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <button
            onClick={handlePrev}
            disabled={step === 1}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
              step === 1 ? 'opacity-40 cursor-not-allowed text-slate-400' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-lg shadow-amber-500/30 transition-all flex items-center space-x-2"
          >
            <span>{step === 4 ? 'Find Matching Pets' : 'Next Question'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
