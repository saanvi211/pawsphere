import React from 'react';
import {
  MapPin,
  Star,
  Clock,
  Phone,
  Navigation,
  Calendar,
  Sparkles,
  Truck,
  ShieldCheck,
  ChevronRight,
  Eye,
  Heart,
  AlertCircle
} from 'lucide-react';
import { GroomingCenter, SupportedPetType } from '../../types/grooming';
import { Animal } from '../../types/animal';
import { SafeGroomingImage } from './SafeGroomingImage';
import { getDirectionsUrl } from '../../lib/geolocation';

interface GroomingCenterCardProps {
  center: GroomingCenter;
  userCoords: { latitude: number; longitude: number } | null;
  activePet: Animal | null;
  isSelected?: boolean;
  onSelect: (center: GroomingCenter) => void;
  onViewDetails: (center: GroomingCenter) => void;
  onBookNow: (center: GroomingCenter) => void;
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

export const GroomingCenterCard: React.FC<GroomingCenterCardProps> = ({
  center,
  userCoords,
  activePet,
  isSelected = false,
  onSelect,
  onViewDetails,
  onBookNow,
  onCall,
}) => {
  // Check if this center specializes in active pet's breed or species
  const hasBreedMatch = activePet?.breed
    ? center.breedSpecialties.some((b) =>
        b.toLowerCase().includes(activePet.breed.toLowerCase()) ||
        activePet.breed.toLowerCase().includes(b.toLowerCase())
      )
    : false;

  const speciesName = activePet?.species === 'dog' ? 'Dogs' : activePet?.species === 'cat' ? 'Cats' : activePet?.species === 'rabbit' ? 'Rabbits' : activePet?.species === 'bird' ? 'Birds' : null;
  const supportsActivePet = speciesName ? center.supportedPetTypes.includes(speciesName as SupportedPetType) : true;

  const handleDirectionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const originLat = userCoords?.latitude ?? 12.9716;
    const originLng = userCoords?.longitude ?? 77.5946;
    const url = getDirectionsUrl(originLat, originLng, center.latitude, center.longitude, center.name);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCall(center);
  };

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookNow(center);
  };

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails(center);
  };

  return (
    <div
      onClick={() => onSelect(center)}
      className={`group relative rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden border ${
        isSelected
          ? 'bg-slate-900/90 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.35)] ring-1 ring-cyan-400'
          : 'bg-slate-900/60 hover:bg-slate-900/80 border-cyan-500/20 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]'
      }`}
    >
      {/* Top Banner if special breed match */}
      {hasBreedMatch && (
        <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 px-4 py-1.5 flex items-center justify-between text-xs font-bold text-white shadow-sm">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            <span>Recommended for your {activePet?.breed}!</span>
          </div>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wide">
            Top Specialist
          </span>
        </div>
      )}

      <div className="p-4 sm:p-5">
        {/* Header with Image, Name, Badges */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {/* Center Image */}
          <div className="relative w-full sm:w-36 sm:h-32 h-44 flex-shrink-0 rounded-xl overflow-hidden shadow-md">
            <SafeGroomingImage
              src={center.coverImage}
              alt={center.name}
              aspectRatio="aspect-auto h-full w-full"
            />
            {/* Open / Closed Status Pill */}
            <div className="absolute top-2 left-2 flex items-center space-x-1 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-white border border-white/10">
              <span className={`w-2 h-2 rounded-full ${center.isOpenNow ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
              <span>{center.isOpenNow ? 'Open Now' : 'Closed'}</span>
            </div>

            {/* Price Level */}
            <div className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-xs font-black text-cyan-300 border border-cyan-500/30">
              {center.priceLevel}
            </div>
          </div>

          {/* Title & Core Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors leading-tight">
                  {center.name}
                </h3>
                <div className="flex items-center space-x-1 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-lg text-amber-300 flex-shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-black">{center.rating}</span>
                  <span className="text-[10px] text-slate-400">({center.reviewsCount})</span>
                </div>
              </div>

              {/* Distance & Address */}
              <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-300">
                <div className="flex items-center space-x-1 text-cyan-400 font-bold">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{typeof center.distance === 'number' ? `${center.distance} km away` : center.locality}</span>
                </div>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400 truncate">{center.locality}, {center.city}</span>
              </div>

              {/* Tagline / Subtitle */}
              <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                {center.tagline}
              </p>
            </div>

            {/* Badges / Features */}
            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              {center.mobileGroomingAvailable && (
                <span className="inline-flex items-center space-x-1 bg-purple-950/60 border border-purple-500/40 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  <Truck className="w-3 h-3" />
                  <span>Mobile Van</span>
                </span>
              )}
              {center.emergencyGroomingAvailable && (
                <span className="inline-flex items-center space-x-1 bg-rose-950/60 border border-rose-500/40 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  <AlertCircle className="w-3 h-3" />
                  <span>Emergency Slot</span>
                </span>
              )}
              {center.gentleHandlingCert && (
                <span className="inline-flex items-center space-x-1 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Fear-Free</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Services & Supported Pets Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 mb-4 text-xs">
          {/* Services Offered */}
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-cyan-400 block mb-1.5">
              Available Services
            </span>
            <div className="flex flex-wrap gap-1.5">
              {center.services.slice(0, 3).map((srv) => (
                <span
                  key={srv.id}
                  className="bg-slate-800/70 border border-slate-700/60 text-slate-200 px-2 py-0.5 rounded text-[11px]"
                >
                  • {srv.name}
                </span>
              ))}
              {center.services.length > 3 && (
                <span className="text-[10px] text-cyan-400 font-semibold self-center">
                  +{center.services.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Supported Pet Types */}
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-cyan-400 block mb-1.5">
              Supported Pets
            </span>
            <div className="flex flex-wrap gap-1.5">
              {center.supportedPetTypes.map((pet) => {
                const isCurrent = speciesName === pet;
                return (
                  <span
                    key={pet}
                    className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
                      isCurrent
                        ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 font-bold'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-300'
                    }`}
                  >
                    <span>{PET_EMOJIS[pet]}</span>
                    <span>{pet}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/60">
          <div className="text-xs">
            <span className="text-slate-400 text-[10px] block">Starting from</span>
            <span className="text-sm font-black text-cyan-300">₹{center.startingPrice}</span>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Details Button */}
            <button
              onClick={handleDetailsClick}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-600 transition-all flex items-center space-x-1"
              title="View full services, groomers & pricing"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Details</span>
            </button>

            {/* Directions Button */}
            <button
              onClick={handleDirectionsClick}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 hover:border-cyan-500/50 transition-all flex items-center space-x-1"
              title="Open Google Maps Directions"
            >
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Directions</span>
            </button>

            {/* Call Button */}
            <button
              onClick={handleCallClick}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 hover:border-cyan-500/50 transition-all flex items-center space-x-1"
              title={`Call ${center.phone}`}
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Call</span>
            </button>

            {/* Book Now Button */}
            <button
              onClick={handleBookClick}
              className="px-4 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20 transition-all flex items-center space-x-1.5 group/btn"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Now</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
