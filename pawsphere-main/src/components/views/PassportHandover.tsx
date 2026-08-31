import React, { useState } from 'react';
import { QrCode, ShieldCheck, CheckCircle2, Sparkles, ArrowRight, Award } from 'lucide-react';
import { getStorageUser, saveStorageUser } from '../../db/storage';
import { UserProfile, Animal } from '../../types/animal';
import confetti from 'canvas-confetti';

interface PassportHandoverProps {
  selectedAnimal?: Animal;
  onHandoverComplete: (user: UserProfile, animal: Animal) => void;
}

export const PassportHandover: React.FC<PassportHandoverProps> = ({ selectedAnimal, onHandoverComplete }) => {
  const [isHandedOver, setIsHandedOver] = useState(false);

  const user = getStorageUser();
  const targetAnimal = selectedAnimal ?? (user as unknown as Animal);

  const executeHandover = () => {
    if (!user) return;

    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch {}

    const updatedUser: UserProfile = { ...user, role: 'pet_owner' };
    saveStorageUser(updatedUser);
    setIsHandedOver(true);
  };

  const handleComplete = () => {
    if (!user || !targetAnimal) return;
    onHandoverComplete(user, targetAnimal);
  };

  return (
    <div className="py-8 max-w-3xl mx-auto px-4 text-center">
      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white shadow-2xl space-y-6">
        {!isHandedOver ? (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
              <QrCode className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase">
                Adoption Approved
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900">Seamless Digital Passport Handover</h2>
              <p className="text-xs text-slate-600 max-w-xl mx-auto">
                Transferring vaccine stamps, health history, and digital QR pet passport for <strong>{targetAnimal.name}</strong> into your account.
              </p>
            </div>

            <button
              onClick={executeHandover}
              className="px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-xl shadow-amber-500/30 transition-transform hover:scale-105 flex items-center justify-center space-x-2 mx-auto"
            >
              <Sparkles className="w-5 h-5 text-amber-200" />
              <span>Execute Official Passport Handover</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900">Welcome Home, {targetAnimal.name}!</h2>
            <p className="text-xs text-slate-600 max-w-xl mx-auto">
              The Digital QR Passport and 3D Body Viewer are now active under your Pet Owner account.
            </p>

            <button
              onClick={handleComplete}
              className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-lg shadow-amber-500/30"
            >
              Open Pet Owner Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
