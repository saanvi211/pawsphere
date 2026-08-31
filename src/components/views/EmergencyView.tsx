import React from 'react';
import { Animal } from '../../types/animal';
import { MOCK_SHELTERS } from '../../data/mockShelters';
import { ShieldAlert, Phone, MapPin, Navigation, AlertTriangle } from 'lucide-react';

interface EmergencyVetFinderProps {
  animal: Animal;
  userPhone?: string;
}

export const EmergencyView: React.FC<EmergencyVetFinderProps> = ({ animal, userPhone }) => {
  return (
    <div className="py-6 max-w-4xl mx-auto px-4 space-y-6">
      
      <div className="bg-red-700 text-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-3 border-2 border-red-800">
        <div className="flex items-center space-x-3">
          <ShieldAlert className="w-8 h-8 text-white animate-pulse" />
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-red-200 block font-extrabold">24/7 EMERGENCY HELPLINE</span>
            <h2 className="text-2xl font-extrabold">Emergency Vet Support for {animal.name}</h2>
          </div>
        </div>
        <p className="text-xs text-rose-100 leading-relaxed">
          Need urgent vet care? Below are nearby 24/7 emergency veterinary clinics with direct call buttons and map directions.
        </p>
      </div>

      {/* QUICK PATIENT SUMMARY CARD */}
      <div className="glass-card rounded-3xl p-6 border border-white shadow-xl space-y-4 text-xs">
        <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>Patient Quick Details for Vet Staff</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
            <span className="text-[10px] text-rose-700 font-bold block">Pet Name</span>
            <span className="font-extrabold text-slate-900">{animal.name} ({animal.breed})</span>
          </div>
          <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
            <span className="text-[10px] text-rose-700 font-bold block">Weight</span>
            <span className="font-extrabold text-slate-900">{animal.weightKg} kg</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold block">Microchip ID</span>
            <span className="font-extrabold text-slate-900 font-mono">{animal.microchipId || 'Optional (Not Tagged)'}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold block">Guardian Phone</span>
            <span className="font-extrabold text-slate-900">{userPhone || 'Not provided'}</span>
          </div>
        </div>
      </div>

      {/* ER CLINICS LIST */}
      <div className="glass-card rounded-3xl p-6 border border-white shadow-xl space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-rose-600" />
          <span>24/7 Emergency Veterinary Hospitals</span>
        </h3>

        <div className="space-y-3">
          {MOCK_SHELTERS.map(clinic => (
            <div key={clinic.id} className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">{clinic.name}</h4>
                <p className="text-xs text-slate-500">{clinic.address}, {clinic.city}</p>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded inline-block mt-1">
                  OPEN 24 HOURS
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href={`tel:${clinic.phone}`}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/30 flex items-center space-x-1"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Emergency</span>
                </a>
                <a
                  href={`https://maps.google.com/?q=${clinic.lat},${clinic.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs border border-slate-300"
                >
                  Directions
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
