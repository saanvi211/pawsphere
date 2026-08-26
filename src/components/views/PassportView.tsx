import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Animal, VaccineRecord } from '../../types/animal';
import { QrCode, ShieldCheck, Printer, Plus, Award, CheckCircle, Clock, Trash2, Calendar } from 'lucide-react';
import { addVaccineRecord as addVaccineToStorage } from '../../db/storage';
import { addVaccineRecord as addVaccineToDB } from '../../lib/api/vaccines';
import { isSupabaseConfigured } from '../../lib/supabase';

interface PetDigitalPassportProps {
  animal: Animal;
  onUpdateAnimal: (animal: Animal) => void;
}

interface VaccineReminder {
  id: string;
  vaccineName: string;
  dueDate: string;
  notes: string;
}

export const PassportView: React.FC<PetDigitalPassportProps> = ({ animal, onUpdateAnimal }) => {
  const [showAddVaccineModal, setShowAddVaccineModal] = useState(false);
  const [vaccineName, setVaccineName] = useState('Rabies Booster');
  const [doctorName, setDoctorName] = useState('Dr. Sarah Jenkins');
  const [nextDueDate, setNextDueDate] = useState('2027-08-24');

  // Reminders State
  const [reminders, setReminders] = useState<VaccineReminder[]>([
    { id: 'rem-1', vaccineName: 'Bordetella Vaccine', dueDate: '2026-09-15', notes: 'Required for boarding facilities' },
    { id: 'rem-2', vaccineName: 'Canine Influenza H3N8', dueDate: '2026-11-20', notes: 'Annual booster' }
  ]);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [newRemName, setNewRemName] = useState('');
  const [newRemDate, setNewRemDate] = useState('2026-10-01');
  const [newRemNotes, setNewRemNotes] = useState('');

  const qrData = JSON.stringify({
    petId: animal.id,
    name: animal.name,
    species: animal.species,
    breed: animal.breed,
    microchip: animal.microchipId || 'Optional (Not Tagged)',
    healthScore: animal.healthScore,
    vaccinesCount: animal.vaccinations.length
  });

  const handleAddVaccine = async () => {
    const recordData = {
      vaccineName,
      dateGiven: new Date().toISOString().split('T')[0],
      nextDueDate,
      doctorName,
      verifiedStamp: true,
    };

    // Always update localStorage for instant UI
    const updatedAnimal = addVaccineToStorage(animal.id, recordData);
    onUpdateAnimal(updatedAnimal);

    // Also persist to Supabase if configured
    if (isSupabaseConfigured) {
      await addVaccineToDB(animal.id, recordData);
    }

    setShowAddVaccineModal(false);
  };

  const handleAddReminder = () => {
    if (!newRemName.trim()) return;
    const newRem: VaccineReminder = {
      id: 'rem-' + Date.now(),
      vaccineName: newRemName,
      dueDate: newRemDate,
      notes: newRemNotes
    };
    setReminders(prev => [...prev, newRem]);
    setShowReminderModal(false);
    setNewRemName('');
    setNewRemNotes('');
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  // Convert reminder to verified stamp
  const handleMarkAsCompleted = async (rem: VaccineReminder) => {
    const recordData = {
      vaccineName: rem.vaccineName,
      dateGiven: new Date().toISOString().split('T')[0],
      nextDueDate: rem.dueDate,
      doctorName: 'Dr. Sarah Jenkins',
      verifiedStamp: true,
    };

    const updated = addVaccineToStorage(animal.id, recordData);
    onUpdateAnimal(updated);

    if (isSupabaseConfigured) {
      await addVaccineToDB(animal.id, recordData);
    }

    setReminders(prev => prev.filter(r => r.id !== rem.id));
  };

  const getDaysRemaining = (dateStr: string) => {
    const today = new Date();
    const target = new Date(dateStr);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="py-6 max-w-4xl mx-auto px-4 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {animal.name}'s <span className="text-brand-solidOrange">Digital QR Passport</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold font-mono">Verify vaccination records, scan pet tags, and schedule reminders</p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-5 py-2.5 rounded-xl bg-white border-2 border-slate-300 hover:bg-slate-50 text-slate-800 font-extrabold text-xs shadow-sm flex items-center space-x-2"
        >
          <Printer className="w-4 h-4 text-brand-solidOrange" />
          <span>Save PDF ID Card</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border-4 border-brand-solidBlue p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
        
        {/* Hologram Header */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6 border-2 border-brand-solidBlue">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] font-mono uppercase tracking-widest text-brand-solidOrange block font-extrabold">
              OFFICIAL ANIMAL PASSPORT CARD
            </span>
            <h3 className="text-2xl font-extrabold tracking-tight text-white">{animal.name.toUpperCase()}</h3>
            <p className="text-xs text-slate-400 font-extrabold">{animal.breed} ({animal.species.toUpperCase()})</p>
          </div>

          <div className="bg-white p-3 rounded-xl shadow-md text-center shrink-0 border-2 border-brand-solidOrange">
            <QRCodeSVG value={qrData} size={110} />
            <span className="text-[9px] font-mono font-extrabold text-slate-700 block mt-1 uppercase">Instant ID Verification</span>
          </div>
        </div>

        {/* Explain QR Code Purpose */}
        <div className="p-4 bg-brand-lightBlue border-2 border-brand-solidBlue rounded-2xl flex items-start space-x-2.5 text-xs text-brand-darkBlue font-semibold">
          <QrCode className="w-5 h-5 text-brand-solidBlue shrink-0 mt-0.5" />
          <p>
            <strong>Scan Purpose:</strong> This secure QR code is scanned by vet clinics, pet park rangers, and boarding services to verify your pet's identity, active vaccine stamps, and owner emergency contact info instantly.
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <img src={animal.photoUrl} alt={animal.name} className="w-full h-48 rounded-2xl object-cover border-4 border-brand-solidOrange shadow-sm" />

          <div className="sm:col-span-2 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border-2 border-slate-200">
                <span className="text-slate-500 block font-bold">Breed</span>
                <span className="font-extrabold text-slate-900">{animal.breed}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border-2 border-slate-200">
                <span className="text-slate-500 block font-bold">Microchip ID (Optional)</span>
                <span className="font-extrabold text-brand-solidOrange font-mono">
                  {animal.microchipId ? animal.microchipId : 'Not Registered'}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border-2 border-slate-200">
                <span className="text-slate-500 block font-bold">Age & Gender</span>
                <span className="font-extrabold text-slate-900">{animal.ageYears} Yrs • {animal.gender}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border-2 border-slate-200">
                <span className="text-slate-500 block font-bold">Weight Status</span>
                <span className="font-extrabold text-slate-900">{animal.weightKg} kg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vaccine Stamps */}
        <div className="border-t border-slate-200 pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-slate-900">Verified Vaccine Stamps ({animal.vaccinations.length})</h4>
            <button
              onClick={() => setShowAddVaccineModal(true)}
              className="px-3.5 py-2 rounded-xl bg-brand-solidGreen text-white font-extrabold text-xs shadow-sm flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Record Vaccine Stamp</span>
            </button>
          </div>

          <div className="space-y-2">
            {animal.vaccinations.map(v => (
              <div key={v.id} className="p-3.5 rounded-xl bg-white border-2 border-slate-200 flex items-center justify-between shadow-sm text-xs">
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-brand-solidGreen shrink-0" />
                  <div>
                    <h5 className="font-extrabold text-slate-900">{v.vaccineName}</h5>
                    <span className="text-slate-500 text-[11px] font-semibold">Doctor: {v.doctorName} • Due: {v.nextDueDate}</span>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold text-brand-solidGreen bg-brand-lightGreen px-2.5 py-1 rounded border border-brand-solidGreen">
                  Verified Stamp
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Vaccination Reminders */}
        <div className="border-t border-slate-200 pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-brand-solidOrange" />
              <span>Active Vaccination Reminders</span>
            </h4>
            <button
              onClick={() => setShowReminderModal(true)}
              className="px-3.5 py-2 rounded-xl bg-brand-solidOrange text-white font-extrabold text-xs shadow-sm flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>New Reminder</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reminders.map(rem => {
              const daysLeft = getDaysRemaining(rem.dueDate);
              const isOverdue = daysLeft <= 0;
              const isDueSoon = daysLeft > 0 && daysLeft <= 30;

              return (
                <div key={rem.id} className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="font-extrabold text-slate-900 text-xs">{rem.vaccineName}</span>
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                        isOverdue ? 'bg-red-100 text-red-700 border-red-300' :
                        isDueSoon ? 'bg-brand-lightOrange text-brand-solidOrange border-brand-solidOrange' :
                        'bg-brand-lightGreen text-brand-solidGreen border-brand-solidGreen'
                      }`}>
                        {isOverdue ? 'Overdue' : isDueSoon ? 'Due Soon' : 'Up to Date'}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[10px] leading-relaxed">{rem.notes}</p>
                    <div className="text-[10px] text-slate-600 font-bold flex items-center space-x-1 pt-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Due: {rem.dueDate} ({isOverdue ? 'Overdue' : `${daysLeft} days remaining`})</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => handleMarkAsCompleted(rem)}
                      className="flex-1 py-1.5 rounded-lg bg-brand-solidGreen text-white text-[10px] font-extrabold flex items-center justify-center space-x-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>Mark Done</span>
                    </button>
                    <button
                      onClick={() => handleDeleteReminder(rem.id)}
                      className="p-1.5 rounded-lg border border-slate-300 text-slate-500 hover:text-red-600 hover:bg-slate-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Record Stamp Modal */}
      {showAddVaccineModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border-4 border-brand-solidGreen text-xs font-semibold">
            <h3 className="text-lg font-extrabold text-slate-900">Add Verified Vaccine Stamp</h3>
            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Vaccine Name:</label>
                <input type="text" value={vaccineName} onChange={e => setVaccineName(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 font-bold outline-none" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Veterinarian Name:</label>
                <input type="text" value={doctorName} onChange={e => setDoctorName(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 font-bold outline-none" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Next Booster Due Date:</label>
                <input type="date" value={nextDueDate} onChange={e => setNextDueDate(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 font-bold outline-none" />
              </div>
            </div>
            <div className="pt-2 flex gap-2">
              <button onClick={() => setShowAddVaccineModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700">Cancel</button>
              <button onClick={handleAddVaccine} className="flex-1 py-2.5 rounded-xl bg-brand-solidGreen text-white font-extrabold shadow-md">Add Verified Stamp</button>
            </div>
          </div>
        </div>
      )}

      {/* Set Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border-4 border-brand-solidOrange text-xs font-semibold">
            <h3 className="text-lg font-extrabold text-slate-900">Set Vaccine Reminder</h3>
            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Vaccine Target:</label>
                <input type="text" placeholder="e.g. Rabies Booster" value={newRemName} onChange={e => setNewRemName(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 font-bold outline-none" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Due Date:</label>
                <input type="date" value={newRemDate} onChange={e => setNewRemDate(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 font-bold outline-none" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Notes / Instructions:</label>
                <textarea rows={2} placeholder="e.g. Schedule clinic appointment" value={newRemNotes} onChange={e => setNewRemNotes(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 font-bold outline-none" />
              </div>
            </div>
            <div className="pt-2 flex gap-2">
              <button onClick={() => setShowReminderModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700">Cancel</button>
              <button onClick={handleAddReminder} className="flex-1 py-2.5 rounded-xl bg-brand-solidOrange text-white font-extrabold shadow-md">Save Reminder</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
