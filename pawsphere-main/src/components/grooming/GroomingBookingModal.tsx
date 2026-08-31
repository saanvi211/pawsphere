import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Scissors,
  User,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  FileText,
  BookmarkCheck,
  MapPin,
  Phone
} from 'lucide-react';
import { GroomingCenter, GroomingPricingTier, GroomingAppointmentBooking } from '../../types/grooming';
import { Animal } from '../../types/animal';

interface GroomingBookingModalProps {
  center: GroomingCenter | null;
  activePet: Animal | null;
  preselectedTier?: GroomingPricingTier | null;
  onClose: () => void;
  onBookingSuccess?: (booking: GroomingAppointmentBooking) => void;
}

export const GroomingBookingModal: React.FC<GroomingBookingModalProps> = ({
  center,
  activePet,
  preselectedTier,
  onClose,
  onBookingSuccess,
}) => {
  if (!center) return null;

  // Form State
  const [petName, setPetName] = useState<string>(activePet?.name || 'Coco');
  const [petType, setPetType] = useState<string>(
    activePet?.species
      ? activePet.species === 'dog'
        ? 'Dog'
        : activePet.species === 'cat'
        ? 'Cat'
        : activePet.species === 'rabbit'
        ? 'Rabbit'
        : activePet.species === 'bird'
        ? 'Bird'
        : 'Other'
      : 'Dog'
  );
  const [petBreed, setPetBreed] = useState<string>(activePet?.breed || 'Poodle');
  
  // Default service based on preselectedTier or first tier / first service
  const initialServiceName = preselectedTier ? preselectedTier.name : center.pricingTiers[1]?.name || center.services[0]?.name || 'Full Grooming & Styling';
  const initialPrice = preselectedTier ? preselectedTier.price : center.pricingTiers[1]?.price || center.startingPrice || 699;

  const [selectedService, setSelectedService] = useState<string>(initialServiceName);
  const [selectedGroomer, setSelectedGroomer] = useState<string>(
    center.groomers[0]?.name || 'Any Senior Groomer'
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedTime, setSelectedTime] = useState<string>('04:00 PM');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  
  // Step State: 'form' | 'confirmed'
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<GroomingAppointmentBooking | null>(null);
  const [isSavedToStorage, setIsSavedToStorage] = useState<boolean>(false);

  // Calculate dynamic estimated price
  const activeServiceObj = center.services.find(s => s.name === selectedService);
  const activeTierObj = center.pricingTiers.find(t => t.name === selectedService);
  const calculatedPrice = activeTierObj?.price || activeServiceObj?.price || initialPrice;
  const hygieneFee = 49;
  const totalPrice = calculatedPrice + hygieneFee;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();

    const newBooking: GroomingAppointmentBooking = {
      id: `groom-apt-${Date.now()}`,
      centerId: center.id,
      centerName: center.name,
      centerAddress: center.address,
      centerPhone: center.phone,
      petId: activePet?.id,
      petName,
      petType,
      petBreed,
      serviceId: activeServiceObj?.id || activeTierObj?.id || 'service-custom',
      serviceName: selectedService,
      groomerName: selectedGroomer,
      date: selectedDate,
      timeSlot: selectedTime,
      specialInstructions,
      estimatedPrice: totalPrice,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('pawsphere_grooming_appointments_v1') || '[]');
      existing.unshift(newBooking);
      localStorage.setItem('pawsphere_grooming_appointments_v1', JSON.stringify(existing));
    } catch {
      // Storage fallback
    }

    setConfirmedBooking(newBooking);
    setIsConfirmed(true);
    if (onBookingSuccess) {
      onBookingSuccess(newBooking);
    }
  };

  const handleAddToAppointments = () => {
    setIsSavedToStorage(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0d172e] border border-cyan-500/30 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isConfirmed ? 'Appointment Confirmed' : 'Book Grooming Appointment'}
              </h2>
              <p className="text-xs text-slate-400">{center.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 custom-scrollbar">
          {!isConfirmed ? (
            <form onSubmit={handleConfirm} className="space-y-5">
              {/* Pet Selection & Info Row */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  <User className="w-4 h-4" />
                  <span>Pet Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1 font-medium">Pet Name *</label>
                    <input
                      type="text"
                      required
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      placeholder="e.g. Coco"
                      className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-sm text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1 font-medium">Pet Type *</label>
                    <select
                      value={petType}
                      onChange={(e) => setPetType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-sm text-white outline-none"
                    >
                      <option value="Dog">🐶 Dog</option>
                      <option value="Cat">🐱 Cat</option>
                      <option value="Rabbit">🐰 Rabbit</option>
                      <option value="Bird">🐦 Bird</option>
                      <option value="Small Pet">🐹 Small Pet</option>
                      <option value="Exotic Pet">🐢 Exotic Pet</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1 font-medium">Breed *</label>
                    <input
                      type="text"
                      required
                      value={petBreed}
                      onChange={(e) => setPetBreed(e.target.value)}
                      placeholder="e.g. Poodle"
                      className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-sm text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Service Selection */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  <Scissors className="w-4 h-4" />
                  <span>Choose Service or Package</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Pricing tiers */}
                  {center.pricingTiers.map((tier) => (
                    <label
                      key={tier.id}
                      className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedService === tier.name
                          ? 'bg-cyan-950/60 border-cyan-400 shadow-sm shadow-cyan-500/20'
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start space-x-2.5">
                        <input
                          type="radio"
                          name="serviceOption"
                          checked={selectedService === tier.name}
                          onChange={() => setSelectedService(tier.name)}
                          className="mt-1 text-cyan-500 focus:ring-cyan-400"
                        />
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-bold text-white">{tier.name}</span>
                            {tier.popular && (
                              <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-bold">
                                Popular
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 block">{tier.duration}</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-cyan-300">₹{tier.price}</span>
                    </label>
                  ))}

                  {/* Individual services */}
                  {center.services.map((srv) => (
                    <label
                      key={srv.id}
                      className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedService === srv.name
                          ? 'bg-cyan-950/60 border-cyan-400 shadow-sm shadow-cyan-500/20'
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start space-x-2.5">
                        <input
                          type="radio"
                          name="serviceOption"
                          checked={selectedService === srv.name}
                          onChange={() => setSelectedService(srv.name)}
                          className="mt-1 text-cyan-500 focus:ring-cyan-400"
                        />
                        <div>
                          <span className="text-xs font-bold text-white block">{srv.name}</span>
                          <span className="text-[11px] text-slate-400 block">{srv.duration}</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-cyan-300">₹{srv.price}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date, Time & Groomer */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-medium">Preferred Date *</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-sm text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-medium">Preferred Time Slot *</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-sm text-white outline-none"
                  >
                    <option value="09:00 AM">09:00 AM - Morning</option>
                    <option value="11:30 AM">11:30 AM - Morning</option>
                    <option value="02:00 PM">02:00 PM - Afternoon</option>
                    <option value="04:00 PM">04:00 PM - Evening</option>
                    <option value="05:00 PM">05:00 PM - Evening</option>
                    <option value="06:30 PM">06:30 PM - Late Slot</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-medium">Preferred Groomer</label>
                  <select
                    value={selectedGroomer}
                    onChange={(e) => setSelectedGroomer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-sm text-white outline-none"
                  >
                    <option value="Any Senior Groomer">⭐ Any Senior Groomer</option>
                    {center.groomers.map((g) => (
                      <option key={g.id} value={g.name}>
                        {g.name} ({g.specialty.split('&')[0]})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-xs text-slate-300 mb-1 font-medium">
                  Special Instructions / Pet Temperament (Optional)
                </label>
                <textarea
                  rows={2}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Sensitive to loud dryers, allergic to tea-tree oil, prefers gentle paws handling..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl p-3 text-xs text-white outline-none resize-none placeholder-slate-500"
                />
              </div>

              {/* Price Breakdown Summary */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>{selectedService}</span>
                  <span className="font-semibold text-white">₹{calculatedPrice}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Sterilization & Safety Kit</span>
                  <span>₹{hygieneFee}</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-sm">
                  <span className="font-bold text-white">Estimated Total</span>
                  <span className="text-base font-black text-cyan-300">₹{totalPrice}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-2xl font-black text-sm bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Confirm Grooming Appointment</span>
              </button>
            </form>
          ) : (
            /* Confirmation Receipt */
            <div className="space-y-6 text-center py-4">
              {/* Success Badge */}
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">
                  ✓ Appointment Confirmed!
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Your grooming session has been reserved with {center.name}.
                </p>
              </div>

              {/* Booking Summary Card */}
              <div className="bg-slate-900/80 border border-cyan-500/30 rounded-2xl p-5 text-left space-y-3 shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs text-slate-400">Grooming Center</span>
                  <span className="text-xs font-bold text-white">{confirmedBooking?.centerName}</span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs text-slate-400">Date</span>
                  <span className="text-xs font-bold text-cyan-300">
                    {confirmedBooking?.date}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs text-slate-400">Time Slot</span>
                  <span className="text-xs font-bold text-cyan-300">
                    {confirmedBooking?.timeSlot}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs text-slate-400">Service</span>
                  <span className="text-xs font-bold text-white">
                    {confirmedBooking?.serviceName}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs text-slate-400">Pet</span>
                  <span className="text-xs font-bold text-white">
                    {confirmedBooking?.petName} ({confirmedBooking?.petBreed})
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-400">Total Due at Salon</span>
                  <span className="text-sm font-black text-cyan-300">
                    ₹{confirmedBooking?.estimatedPrice}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleAddToAppointments}
                  disabled={isSavedToStorage}
                  className={`flex-1 py-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center space-x-2 ${
                    isSavedToStorage
                      ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  <BookmarkCheck className="w-4 h-4 text-cyan-400" />
                  <span>{isSavedToStorage ? '✓ Added to My Appointments' : 'Add to My Appointments'}</span>
                </button>

                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-2xl font-black text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
