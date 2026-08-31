import React, { useState } from 'react';
import {
  X,
  MapPin,
  Star,
  Clock,
  Phone,
  Globe,
  Navigation,
  Calendar,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Users,
  ChevronRight,
  Truck,
  AlertCircle,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { GroomingCenter, GroomingPricingTier, SupportedPetType } from '../../types/grooming';
import { SafeGroomingImage } from './SafeGroomingImage';
import { getDirectionsUrl } from '../../lib/geolocation';

interface GroomingDetailsModalProps {
  center: GroomingCenter | null;
  userCoords: { latitude: number; longitude: number } | null;
  onClose: () => void;
  onBookNow: (center: GroomingCenter, preselectedTier?: GroomingPricingTier) => void;
  onCall: (center: GroomingCenter) => void;
}

const PET_EMOJIS: Record<SupportedPetType, string> = {
  Dogs: '🐶',
  Cats: '🐱',
  Rabbits: '🐰',
  Birds: '🐦',
  'Small Pets': '🐹',
  'Exotic Pets': '🐢',
};

export const GroomingDetailsModal: React.FC<GroomingDetailsModalProps> = ({
  center,
  userCoords,
  onClose,
  onBookNow,
  onCall,
}) => {
  if (!center) return null;

  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const images = center.galleryImages.length > 0 ? center.galleryImages : [center.coverImage];

  const handleDirections = () => {
    const originLat = userCoords?.latitude ?? 12.9716;
    const originLng = userCoords?.longitude ?? 77.5946;
    const url = getDirectionsUrl(originLat, originLng, center.latitude, center.longitude, center.name);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#0d172e] border border-cyan-500/30 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/20 flex items-center justify-center transition-all backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {/* Hero Gallery */}
          <div className="relative h-64 sm:h-80 w-full bg-slate-950">
            <SafeGroomingImage
              src={images[selectedImageIndex] || center.coverImage}
              alt={center.name}
              aspectRatio="aspect-auto h-full w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d172e] via-transparent to-black/40" />

            {/* Gallery Thumbnail Selector */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-6 right-6 flex items-center space-x-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                      selectedImageIndex === idx
                        ? 'border-cyan-400 scale-105 shadow-md shadow-cyan-500/50'
                        : 'border-white/30 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <SafeGroomingImage
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      aspectRatio="aspect-auto h-full w-full"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Badges on Top Left */}
            <div className="absolute top-4 left-6 flex flex-wrap gap-2">
              <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border ${
                center.isOpenNow
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  : 'bg-red-950/80 text-red-300 border-red-500/40'
              }`}>
                <span className={`w-2 h-2 rounded-full ${center.isOpenNow ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                <span>{center.isOpenNow ? 'Open Now' : 'Closed'}</span>
              </span>

              {center.mobileGroomingAvailable && (
                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-950/80 text-purple-300 border border-purple-500/40 backdrop-blur-md">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Mobile Van Service</span>
                </span>
              )}
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* Header info */}
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {center.name}
                  </h1>
                  <p className="text-sm text-cyan-300 mt-1 font-medium">{center.tagline}</p>
                </div>

                <div className="flex items-center space-x-3 bg-slate-900/80 border border-cyan-500/30 px-4 py-2 rounded-2xl">
                  <div className="flex items-center space-x-1.5 text-amber-400">
                    <Star className="w-5 h-5 fill-amber-400" />
                    <span className="text-xl font-black text-white">{center.rating}</span>
                  </div>
                  <div className="border-l border-slate-700 pl-3 text-xs text-slate-400">
                    <div>{center.reviewsCount} reviews</div>
                    <div className="text-emerald-400 font-semibold">100% Verified</div>
                  </div>
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-400 block">Distance</span>
                    <span className="font-bold text-white">
                      {typeof center.distance === 'number' ? `${center.distance} km away` : center.locality}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-400 block">Hours</span>
                    <span className="font-bold text-white truncate max-w-[130px] block">{center.openingHours}</span>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-400 block">Phone</span>
                    <span className="font-bold text-white">{center.phone}</span>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-xs truncate">
                    <span className="text-slate-400 block">Website</span>
                    <a
                      href={center.website}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-cyan-300 hover:underline truncate block"
                    >
                      {center.website.replace('https://', '')}
                    </a>
                  </div>
                </div>
              </div>

              {/* Full Address Banner */}
              <div className="mt-3 p-3 bg-slate-900/40 border border-slate-800/80 rounded-2xl flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>{center.address}, {center.locality}, {center.city} - {center.pincode}</span>
                </div>
                <button
                  onClick={handleDirections}
                  className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center space-x-1 flex-shrink-0 ml-2"
                >
                  <span>Open Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* About Section */}
            <div>
              <h2 className="text-lg font-bold text-white mb-2 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>About this Center</span>
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/40 border border-slate-800 p-4 rounded-2xl">
                {center.description}
              </p>
            </div>

            {/* Pricing Packages Tiers */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Popular Grooming Packages</span>
                  </h2>
                  <p className="text-xs text-slate-400">Choose a package for all-inclusive savings</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {center.pricingTiers.map((tier) => (
                  <div
                    key={tier.id}
                    className={`relative rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                      tier.popular
                        ? 'bg-gradient-to-b from-cyan-950/40 to-slate-900/90 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.2)]'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                        Most Popular
                      </div>
                    )}

                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="text-base font-bold text-white">{tier.name}</h3>
                          <span className="text-xs text-slate-400">{tier.duration}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-black text-cyan-300">₹{tier.price}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 mb-4">{tier.subtitle}</p>

                      <ul className="space-y-2 mb-6 text-xs text-slate-300">
                        {tier.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => onBookNow(center, tier)}
                      className={`w-full py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center space-x-1.5 ${
                        tier.popular
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/25'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700'
                      }`}
                    >
                      <span>Book {tier.name}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Supported Pets & Breed Specialties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pet Types */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3 text-cyan-400">
                  Supported Animals
                </h3>
                <div className="flex flex-wrap gap-2">
                  {center.supportedPetTypes.map((pet) => (
                    <span
                      key={pet}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 text-xs font-semibold"
                    >
                      <span className="text-base">{PET_EMOJIS[pet]}</span>
                      <span>{pet}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Breed Specialties */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3 text-cyan-400">
                  Breed Specialties
                </h3>
                <div className="flex flex-wrap gap-2">
                  {center.breedSpecialties.map((breed) => (
                    <span
                      key={breed}
                      className="px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-xs font-semibold"
                    >
                      ✨ {breed}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Individual Services Menu */}
            <div>
              <h2 className="text-lg font-bold text-white mb-3">
                All Available Services
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {center.services.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-start justify-between gap-3 hover:border-slate-700 transition-all"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-white">{srv.name}</h4>
                        {srv.popular && (
                          <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-bold">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{srv.description}</p>
                      <div className="flex items-center space-x-3 mt-2 text-[11px] text-slate-400">
                        <span>⏱ {srv.duration}</span>
                        <span>•</span>
                        <span>For: {srv.supportedPets.join(', ')}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-black text-cyan-300 block">₹{srv.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grooming Team */}
            {center.groomers.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  <span>Meet the Groomers</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {center.groomers.map((groomer) => (
                    <div
                      key={groomer.id}
                      className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-start space-x-4"
                    >
                      <img
                        src={groomer.avatar}
                        alt={groomer.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-cyan-500/30 flex-shrink-0"
                      />
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white">{groomer.name}</h4>
                          <div className="flex items-center space-x-1 text-amber-400 text-xs">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span className="font-bold">{groomer.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs text-cyan-400 font-semibold">{groomer.role}</p>
                        <p className="text-xs text-slate-300 mt-1">{groomer.bio}</p>
                        <span className="inline-block text-[11px] text-slate-400 mt-1.5">
                          🏆 {groomer.experienceYears}+ years experience • {groomer.specialty}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Reviews */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-cyan-400" />
                  <span>Verified Customer Reviews</span>
                </h2>
                <span className="text-xs text-slate-400">{center.reviews.length} featured</span>
              </div>

              <div className="space-y-3">
                {center.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-xs font-bold text-cyan-300">
                          {rev.author[0]}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                            <span>{rev.author}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({rev.petName} the {rev.petSpecies})
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">{rev.date} • {rev.serviceUsed}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < Math.floor(rev.rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 sm:p-5 bg-slate-950/95 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
          <div className="text-xs">
            <span className="text-slate-400 block">Starting from</span>
            <span className="text-base font-black text-cyan-300">₹{center.startingPrice}</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onCall(center)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-all flex items-center space-x-1.5"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Call Center</span>
            </button>

            <button
              onClick={handleDirections}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-all flex items-center space-x-1.5"
            >
              <Navigation className="w-4 h-4 text-cyan-400" />
              <span>Get Directions</span>
            </button>

            <button
              onClick={() => onBookNow(center)}
              className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition-all flex items-center space-x-2 group"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
