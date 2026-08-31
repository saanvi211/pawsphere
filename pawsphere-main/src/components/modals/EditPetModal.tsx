import React, { useState, useEffect, useRef } from 'react';
import { Animal, SpeciesType } from '../../types/animal';
import { X, Upload, Trash2, CheckCircle, AlertCircle, Loader2, Edit3, ShieldCheck } from 'lucide-react';
import { uploadPetPhoto } from '../../lib/api/storage';

interface EditPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  animal: Animal | null;
  onUpdateAnimal: (animal: Animal) => Promise<void>;
  onRemoveAnimal: (id: string) => Promise<void>;
}

export const EditPetModal: React.FC<EditPetModalProps> = ({
  isOpen,
  onClose,
  animal,
  onUpdateAnimal,
  onRemoveAnimal,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState('');
  const [species, setSpecies] = useState<SpeciesType>('dog');
  const [breed, setBreed] = useState('');
  const [ageYears, setAgeYears] = useState<number>(0);
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [weightKg, setWeightKg] = useState<number>(0);
  const [microchipId, setMicrochipId] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // Photo upload states
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [newPhotoPreview, setNewPhotoPreview] = useState<string | null>(null);

  // Modal UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state when active animal changes
  useEffect(() => {
    if (animal) {
      setName(animal.name);
      setSpecies(animal.species || 'dog');
      setBreed(animal.breed);
      setAgeYears(animal.ageYears);
      setGender(animal.gender || 'Male');
      setWeightKg(animal.weightKg);
      setMicrochipId(animal.microchipId || '');
      setPhotoUrl(animal.photoUrl || '');
      setNewPhotoFile(null);
      setNewPhotoPreview(null);
      setShowDeleteConfirm(false);
      setError(null);
    }
  }, [animal]);

  if (!isOpen || !animal) return null;

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError('File size too large. Please select an image under 15MB.');
      return;
    }

    setError(null);
    setNewPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setNewPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a pet name.');
      return;
    }
    if (!breed.trim()) {
      setError('Please enter a breed.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let finalPhotoUrl = photoUrl;

      if (newPhotoFile) {
        const { url, error: uploadErr } = await uploadPetPhoto(animal.id, newPhotoFile);
        if (uploadErr || !url) {
          console.warn('[EditPetModal] Upload warning, using preview:', uploadErr);
        }
        finalPhotoUrl = url || newPhotoPreview || photoUrl;
      } else if (newPhotoPreview) {
        finalPhotoUrl = newPhotoPreview;
      }

      const updated: Animal = {
        ...animal,
        name: name.trim(),
        species,
        breed: breed.trim(),
        ageYears: Number(ageYears) || 0,
        gender,
        weightKg: Number(weightKg) || 0,
        microchipId: microchipId.trim() || undefined,
        photoUrl: finalPhotoUrl,
      };

      await onUpdateAnimal(updated);
      onClose();
    } catch (err: any) {
      console.error('[EditPetModal] Update error:', err);
      setError(err?.message || 'Failed to update pet profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onRemoveAnimal(animal.id);
      onClose();
    } catch (err: any) {
      console.error('[EditPetModal] Delete error:', err);
      setError(err?.message || 'Failed to remove pet.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#060b17]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel-dark rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-cyan-400/60 text-xs font-semibold my-8 animate-fadeIn relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white tracking-wider uppercase glow-text-cyan">
                Edit {animal.name}'s Profile
              </h3>
              <p className="text-[10px] text-cyan-300 font-mono">Update medical vitals, photo, and identity</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-2xl bg-red-950/80 border border-red-500/60 text-red-200 text-[11px] font-bold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* DELETE CONFIRMATION PROMPT */}
        {showDeleteConfirm ? (
          <div className="p-5 rounded-2xl bg-red-950/70 border-2 border-red-500/80 space-y-4 animate-fadeIn text-center">
            <div className="w-12 h-12 rounded-full bg-red-600/30 border border-red-400 text-red-400 mx-auto flex items-center justify-center animate-bounce">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">Confirm Pet Removal</h4>
              <p className="text-xs text-red-200">
                Are you sure you want to remove <strong className="text-white">{animal.name}</strong> from your PawSphere companions?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 font-bold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold shadow-lg uppercase tracking-wider flex items-center justify-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <span>Yes, Delete Pet</span>
                )}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            
            {/* PHOTO CHANGE SECTION */}
            <div className="flex items-center space-x-4 bg-[#091122]/60 p-3 rounded-2xl border border-cyan-500/20">
              <img
                src={newPhotoPreview || photoUrl}
                alt={animal.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0"
              />
              <div className="flex-1 space-y-1">
                <span className="text-xs font-extrabold text-white block">Pet Companion Photo</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-400/50 text-cyan-300 text-[10px] font-extrabold flex items-center space-x-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{newPhotoPreview ? 'Change Selected Photo' : 'Upload New Photo'}</span>
                </button>
              </div>
            </div>

            {/* FORM INPUTS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 block text-[10px] uppercase">Pet Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#091122] border border-cyan-500/40 text-white rounded-xl p-2.5 font-bold outline-none focus:border-cyan-400"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-300 block text-[10px] uppercase">Animal Type *</label>
                <select
                  value={species}
                  onChange={e => setSpecies(e.target.value as SpeciesType)}
                  className="w-full bg-[#091122] border border-cyan-500/40 text-cyan-200 rounded-xl p-2.5 font-bold outline-none focus:border-cyan-400"
                >
                  <option value="dog">🐶 Dog</option>
                  <option value="cat">🐱 Cat</option>
                  <option value="bird">🦜 Bird</option>
                  <option value="rabbit">🐇 Rabbit</option>
                  <option value="hamster">🐹 Hamster</option>
                  <option value="other">🐾 Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 block text-[10px] uppercase">Breed / Variant *</label>
                <input
                  type="text"
                  required
                  value={breed}
                  onChange={e => setBreed(e.target.value)}
                  className="w-full bg-[#091122] border border-cyan-500/40 text-white rounded-xl p-2.5 font-bold outline-none focus:border-cyan-400"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-300 block text-[10px] uppercase">Gender *</label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value as 'Male' | 'Female')}
                  className="w-full bg-[#091122] border border-cyan-500/40 text-cyan-200 rounded-xl p-2.5 font-bold outline-none focus:border-cyan-400"
                >
                  <option value="Male">Male ♂</option>
                  <option value="Female">Female ♀</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 block text-[10px] uppercase">Age (Years) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  step={0.5}
                  value={ageYears}
                  onChange={e => setAgeYears(Number(e.target.value))}
                  className="w-full bg-[#091122] border border-cyan-500/40 text-white rounded-xl p-2.5 font-bold outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-300 block text-[10px] uppercase">Weight (kg) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  step={0.1}
                  value={weightKg}
                  onChange={e => setWeightKg(Number(e.target.value))}
                  className="w-full bg-[#091122] border border-cyan-500/40 text-white rounded-xl p-2.5 font-bold outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 block text-[10px] uppercase">Microchip Serial Tag</label>
              <input
                type="text"
                placeholder="e.g. 985141002349012"
                value={microchipId}
                onChange={e => setMicrochipId(e.target.value)}
                className="w-full bg-[#091122] border border-cyan-500/40 text-white rounded-xl p-2.5 font-bold outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-500/50 text-red-300 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                <span>Delete Pet</span>
              </button>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-700 font-bold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-extrabold text-xs shadow-lg uppercase tracking-wider hover:brightness-110 transition-all flex items-center justify-center space-x-2 border border-cyan-400 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
