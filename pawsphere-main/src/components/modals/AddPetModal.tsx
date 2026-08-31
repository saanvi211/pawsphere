import React, { useState, useRef } from 'react';
import { Animal, SpeciesType } from '../../types/animal';
import { X, Upload, CheckCircle, AlertCircle, Loader2, PawPrint, ShieldCheck } from 'lucide-react';
import { uploadPetPhoto } from '../../lib/api/storage';

interface AddPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onAddAnimal: (animalData: Omit<Animal, 'id' | 'vaccinations' | 'medicalHistory' | 'bodyPins'>) => Promise<Animal | null>;
  onSelectAnimal: (id: string) => void;
}

export const AddPetModal: React.FC<AddPetModalProps> = ({
  isOpen,
  onClose,
  userId,
  onAddAnimal,
  onSelectAnimal,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState('');
  const [species, setSpecies] = useState<SpeciesType>('dog');
  const [breed, setBreed] = useState('');
  const [ageYears, setAgeYears] = useState<number>(1);
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [weightKg, setWeightKg] = useState<number>(5);
  const [microchipId, setMicrochipId] = useState('');
  const [vaccinationStatus, setVaccinationStatus] = useState('Up to date');

  // Photo Upload State
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WEBP, GIF).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError('File size is too large. Please select an image under 15MB.');
      return;
    }

    setError(null);
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your pet\'s name.');
      return;
    }
    if (!breed.trim()) {
      setError('Please enter your pet\'s breed.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const tempId = 'temp-' + Date.now();
      let photoUrl = '';

      if (photoFile) {
        const { url, error: uploadErr } = await uploadPetPhoto(tempId, photoFile);
        if (uploadErr || !url) {
          console.warn('[AddPetModal] Storage upload warning:', uploadErr);
        }
        photoUrl = url || photoPreview || '';
      } else if (photoPreview) {
        photoUrl = photoPreview;
      } else {
        // Animal species placeholder
        photoUrl = species === 'cat'
          ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800'
          : species === 'bird'
          ? 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&q=80&w=800'
          : species === 'rabbit'
          ? 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=800'
          : species === 'hamster'
          ? 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&q=80&w=800'
          : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800';
      }

      const initialVaccines = vaccinationStatus === 'Up to date' ? [
        {
          id: 'v-init-' + Date.now(),
          vaccineName: species === 'dog' ? 'Core Rabies & DHPP' : species === 'cat' ? 'FVRCP & Rabies' : 'Core Health Vaccine',
          dateGiven: new Date().toISOString().split('T')[0],
          nextDueDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
          doctorName: 'Dr. Sarah Jenkins, DVM',
          verifiedStamp: true,
        }
      ] : [];

      const newAnimal = await onAddAnimal({
        name: name.trim(),
        species,
        breed: breed.trim(),
        ageYears: Number(ageYears) || 1,
        gender,
        weightKg: Number(weightKg) || 1,
        microchipId: microchipId.trim() || undefined,
        photoUrl,
        priceOrAdoptionFee: 'Owned Companion',
        aboutPet: `${name.trim()} is a registered family companion on PawSphere.`,
        energyLevel: 'Moderate',
        temperament: ['Friendly', 'Playful', 'Loyal'],
        goodWithKids: true,
        goodWithOtherPets: true,
        careLevel: 'Easy',
        monthlyEstCost: species === 'dog' ? 80 : species === 'cat' ? 60 : 40,
        shelterId: 'owned',
        isAvailableForAdoptionOrSale: false,
        healthScore: 98,
      });

      if (newAnimal) {
        onSelectAnimal(newAnimal.id);
        onClose();
        // Reset form
        setName('');
        setBreed('');
        setMicrochipId('');
        setPhotoFile(null);
        setPhotoPreview(null);
      } else {
        setError('Failed to save pet record. Please try again.');
      }
    } catch (err: any) {
      console.error('[AddPetModal] Save error:', err);
      setError(err?.message || 'Failed to save pet profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#060b17]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel-dark rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 border border-cyan-400/60 text-xs font-semibold my-8 animate-fadeIn relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
              <PawPrint className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white tracking-wider uppercase glow-text-cyan">
                Add New Pet Companion
              </h3>
              <p className="text-[10px] text-cyan-300 font-mono">Create an official 3D PawSphere profile for your pet</p>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* UPLOAD PET PHOTO DROPZONE */}
          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-200 block uppercase text-[10px] tracking-wider">
              Upload Pet Photo *
            </label>
            
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                  : photoPreview
                  ? 'border-cyan-500/60 bg-[#091122]/80'
                  : 'border-cyan-500/30 bg-[#091122]/50 hover:border-cyan-400 hover:bg-[#091122]/80'
              }`}
            >
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

              {photoPreview ? (
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Pet Preview"
                      className="w-24 h-24 rounded-2xl object-cover border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    />
                    <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full text-white">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-left space-y-1">
                    <span className="text-xs font-extrabold text-white block">Photo Selected</span>
                    <span className="text-[10px] text-cyan-300 block truncate max-w-[200px]">
                      {photoFile ? photoFile.name : 'Uploaded image'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotoFile(null);
                        setPhotoPreview(null);
                      }}
                      className="text-[10px] font-bold text-red-400 hover:underline block pt-1"
                    >
                      Remove / Change Photo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 py-2">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 mx-auto flex items-center justify-center">
                    <Upload className="w-6 h-6 animate-bounce" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-white block">
                      Click to choose or drag & drop pet photo
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Supports JPG, PNG, WEBP files (Max 15MB)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* BASIC PET INFORMATION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-300 block text-[10px] uppercase">Pet Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Astro"
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
                placeholder="e.g. German Shepherd"
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-300 block text-[10px] uppercase">Age (Years) *</label>
              <input
                type="number"
                required
                min={0}
                max={40}
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

            <div className="space-y-1">
              <label className="font-bold text-slate-300 block text-[10px] uppercase">Vaccination Status</label>
              <select
                value={vaccinationStatus}
                onChange={e => setVaccinationStatus(e.target.value)}
                className="w-full bg-[#091122] border border-cyan-500/40 text-cyan-200 rounded-xl p-2.5 font-bold outline-none"
              >
                <option value="Up to date">Up to date</option>
                <option value="Partially vaccinated">Partially vaccinated</option>
                <option value="Needs vaccinations">Needs vaccinations</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-300 block text-[10px] uppercase">Microchip ID (Optional)</label>
            <input
              type="text"
              placeholder="e.g. 985141002349012"
              value={microchipId}
              onChange={e => setMicrochipId(e.target.value)}
              className="w-full bg-[#091122] border border-cyan-500/40 text-white rounded-xl p-2.5 font-bold outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-700 font-bold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-extrabold text-xs shadow-lg uppercase tracking-wider hover:brightness-110 transition-all flex items-center justify-center space-x-2 border border-emerald-400 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Saving Pet Profile...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Save Pet Profile</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
