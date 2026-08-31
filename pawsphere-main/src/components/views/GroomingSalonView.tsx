import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapPin,
  Search,
  SlidersHorizontal,
  Navigation,
  Sparkles,
  ArrowLeft,
  Scissors,
  LocateFixed,
  Filter,
  Check,
  ChevronDown,
  Clock,
  Star,
  RefreshCw,
  AlertTriangle,
  Heart,
  Grid,
  Map as MapIcon,
  ShieldCheck,
  Truck,
  RotateCcw
} from 'lucide-react';
import { Animal, UserProfile } from '../../types/animal';
import { GroomingCenter, GroomingPricingTier, SupportedPetType, GroomingSortOption } from '../../types/grooming';
import {
  MOCK_GROOMING_CENTERS,
  POPULAR_BENGALURU_LOCALITIES
} from '../../data/groomingData';
import { calculateDistance, getUserLocation } from '../../lib/geolocation';
import { GroomingCenterCard } from '../grooming/GroomingCenterCard';
import { GroomingDetailsModal } from '../grooming/GroomingDetailsModal';
import { GroomingBookingModal } from '../grooming/GroomingBookingModal';
import { GroomingCallModal } from '../grooming/GroomingCallModal';
import { InteractiveGroomingMap } from '../grooming/InteractiveGroomingMap';

interface GroomingSalonViewProps {
  user: UserProfile;
  animal: Animal | null;
  onSelectTab?: (tab: string) => void;
  onBackToDashboard?: () => void;
}

type QuickFilterTag =
  | 'All'
  | 'Open Now'
  | 'Nearest'
  | 'Top Rated'
  | 'Affordable'
  | 'Premium'
  | 'Mobile Grooming'
  | 'Pet Friendly'
  | 'Full Service'
  | 'Gentle Handling';

const QUICK_FILTER_TAGS: QuickFilterTag[] = [
  'All',
  'Open Now',
  'Nearest',
  'Top Rated',
  'Affordable',
  'Premium',
  'Mobile Grooming',
  'Pet Friendly',
  'Full Service',
  'Gentle Handling',
];

const RADIUS_OPTIONS = [2, 5, 10, 25];

export const GroomingSalonView: React.FC<GroomingSalonViewProps> = ({
  user,
  animal,
  onSelectTab,
  onBackToDashboard,
}) => {
  // Location States
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>({
    latitude: 12.9716,
    longitude: 77.6412, // Default: Indiranagar, Bengaluru
  });
  const [locationName, setLocationName] = useState<string>('Indiranagar, Bengaluru');
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedRadius, setSelectedRadius] = useState<number>(10);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilterTag>('All');
  const [selectedPetType, setSelectedPetType] = useState<string>('All');
  const [selectedPriceFilter, setSelectedPriceFilter] = useState<string>('All');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<GroomingSortOption>('nearest');

  // Active Center & Modal States
  const [selectedCenter, setSelectedCenter] = useState<GroomingCenter | null>(null);
  const [modalCenter, setModalCenter] = useState<GroomingCenter | null>(null);
  const [bookingCenter, setBookingCenter] = useState<GroomingCenter | null>(null);
  const [preselectedTier, setPreselectedTier] = useState<GroomingPricingTier | null>(null);
  const [callCenter, setCallCenter] = useState<GroomingCenter | null>(null);

  // Responsive View Toggle for Mobile (List vs Map)
  const [mobileViewTab, setMobileViewTab] = useState<'list' | 'map'>('list');

  // Automatic Geolocation on Mount
  useEffect(() => {
    handleDetectLocation(false);
  }, []);

  // Detect Geolocation function
  const handleDetectLocation = (showErrors = true) => {
    setIsDetectingLocation(true);
    setLocationError(null);

    getUserLocation()
      .then((loc) => {
        setUserCoords({ latitude: loc.latitude, longitude: loc.longitude });
        setLocationName(`Current Location (${loc.latitude.toFixed(3)}, ${loc.longitude.toFixed(3)})`);
        setIsDetectingLocation(false);
      })
      .catch((err) => {
        setIsDetectingLocation(false);
        if (showErrors) {
          setLocationError('Location access is disabled or unavailable. You can enter or select your area manually.');
        }
        // Fallback default coordinates
        if (!userCoords) {
          setUserCoords({ latitude: 12.9716, longitude: 77.6412 });
          setLocationName('Indiranagar, Bengaluru (Default)');
        }
      });
  };

  // Handle Locality Quick Select
  const handleSelectLocality = (locality: { name: string; lat: number; lng: number }) => {
    setUserCoords({ latitude: locality.lat, longitude: locality.lng });
    setLocationName(`${locality.name}, Bengaluru`);
    setLocationError(null);
  };

  // Calculate live distances for all centers from current user coordinates
  const centersWithDistance = useMemo(() => {
    const originLat = userCoords?.latitude ?? 12.9716;
    const originLng = userCoords?.longitude ?? 77.5946;

    return MOCK_GROOMING_CENTERS.map((center) => {
      const distance = calculateDistance(originLat, originLng, center.latitude, center.longitude);
      return {
        ...center,
        distance,
      };
    });
  }, [userCoords]);

  // Filter & Search Logic
  const filteredAndSortedCenters = useMemo(() => {
    let list = [...centersWithDistance];

    // 1. Radius Filter
    list = list.filter((c) => (c.distance ?? 0) <= selectedRadius);

    // 2. Search Query (Center name, locality, services, pet types, breed specialties)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((c) => {
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesLocality = c.locality.toLowerCase().includes(q) || c.address.toLowerCase().includes(q);
        const matchesServices = c.services.some((s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
        const matchesPetTypes = c.supportedPetTypes.some((p) => p.toLowerCase().includes(q));
        const matchesBreeds = c.breedSpecialties.some((b) => b.toLowerCase().includes(q));
        return matchesName || matchesLocality || matchesServices || matchesPetTypes || matchesBreeds;
      });
    }

    // 3. Quick Tag Filters
    if (activeQuickFilter === 'Open Now') {
      list = list.filter((c) => c.isOpenNow);
    } else if (activeQuickFilter === 'Top Rated') {
      list = list.filter((c) => c.rating >= 4.7);
    } else if (activeQuickFilter === 'Affordable') {
      list = list.filter((c) => c.priceLevel === '₹' || c.startingPrice <= 599);
    } else if (activeQuickFilter === 'Premium') {
      list = list.filter((c) => c.priceLevel === '₹₹₹' || c.startingPrice >= 899);
    } else if (activeQuickFilter === 'Mobile Grooming') {
      list = list.filter((c) => c.mobileGroomingAvailable);
    } else if (activeQuickFilter === 'Pet Friendly') {
      list = list.filter((c) => c.petFriendlyCert);
    } else if (activeQuickFilter === 'Full Service') {
      list = list.filter((c) => c.services.length >= 4);
    } else if (activeQuickFilter === 'Gentle Handling') {
      list = list.filter((c) => c.gentleHandlingCert);
    }

    // 4. Pet Type Filter
    if (selectedPetType !== 'All') {
      list = list.filter((c) => c.supportedPetTypes.includes(selectedPetType as SupportedPetType));
    }

    // 5. Price Filter
    if (selectedPriceFilter !== 'All') {
      list = list.filter((c) => c.priceLevel === selectedPriceFilter);
    }

    // 6. Service Filter
    if (selectedServiceFilter !== 'All') {
      list = list.filter((c) =>
        c.services.some((s) => s.name.toLowerCase().includes(selectedServiceFilter.toLowerCase()))
      );
    }

    // 7. Sorting
    list.sort((a, b) => {
      if (sortBy === 'nearest') {
        return (a.distance ?? 0) - (b.distance ?? 0);
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      if (sortBy === 'reviews') {
        return b.reviewsCount - a.reviewsCount;
      }
      if (sortBy === 'price_low') {
        return a.startingPrice - b.startingPrice;
      }
      if (sortBy === 'open_now') {
        return (b.isOpenNow ? 1 : 0) - (a.isOpenNow ? 1 : 0);
      }
      return 0;
    });

    return list;
  }, [
    centersWithDistance,
    selectedRadius,
    searchQuery,
    activeQuickFilter,
    selectedPetType,
    selectedPriceFilter,
    selectedServiceFilter,
    sortBy,
  ]);

  // Pet recommendation info
  const petSpeciesName = animal?.species === 'dog' ? 'Dog' : animal?.species === 'cat' ? 'Cat' : animal?.species === 'rabbit' ? 'Rabbit' : animal?.species === 'bird' ? 'Bird' : 'Pet';
  const petBreedDisplay = animal?.breed || (animal?.species === 'dog' ? 'Poodle' : animal?.species === 'cat' ? 'Persian Cat' : 'Companion Pet');

  const handleOpenBooking = (center: GroomingCenter, tier?: GroomingPricingTier) => {
    setBookingCenter(center);
    setPreselectedTier(tier || null);
    if (modalCenter) setModalCenter(null);
  };

  const handleOpenCall = (center: GroomingCenter) => {
    setCallCenter(center);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveQuickFilter('All');
    setSelectedPetType('All');
    setSelectedPriceFilter('All');
    setSelectedServiceFilter('All');
    setSelectedRadius(25);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070e1c] via-[#0b152b] to-[#060c18] text-white flex flex-col relative overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      {/* Background ambient lighting effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-20 left-1/3 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[140px]" />
      </div>

      {/* ================================================== */}
      {/* 1. PAGE HEADER */}
      {/* ================================================== */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#081124]/85 border-b border-cyan-500/20 px-4 sm:px-8 py-3.5 shadow-lg shadow-black/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Dashboard link & Page Title */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={onBackToDashboard}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 hover:text-white transition-all text-xs font-bold shadow-sm"
              title="Return to Owner Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <span className="text-cyan-500/40 hidden sm:inline">|</span>

            <div className="flex items-center space-x-2">
              <span className="text-lg">🐾</span>
              <span className="text-sm sm:text-base font-extrabold bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent">
                Nearby Grooming
              </span>
            </div>
          </div>

          {/* Right: Selected Pet & Detect Location Button */}
          <div className="flex items-center space-x-3">
            {/* Active Pet Chip */}
            <div className="flex items-center space-x-2 bg-slate-900/90 border border-cyan-500/30 px-3 py-1.5 rounded-2xl shadow-inner text-xs">
              <span className="text-base">
                {animal?.species === 'cat' ? '🐱' : animal?.species === 'rabbit' ? '🐰' : animal?.species === 'bird' ? '🐦' : '🐶'}
              </span>
              <div className="hidden sm:block">
                <span className="font-bold text-cyan-300">{animal?.name || 'Sphered'}</span>
                <span className="text-slate-400 mx-1">•</span>
                <span className="text-slate-400">{petBreedDisplay}</span>
              </div>
            </div>

            {/* Quick Detect My Location */}
            <button
              onClick={() => handleDetectLocation(true)}
              disabled={isDetectingLocation}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:text-white transition-all text-xs font-bold"
              title="Detect my current location"
            >
              <LocateFixed className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin text-cyan-400' : ''}`} />
              <span className="hidden md:inline">Detect Location</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Page Body */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Title Header Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-transparent">
              Grooming Centers Near You
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Find trusted grooming professionals for your pet nearby.
            </p>
          </div>

          {/* Active Pet Dynamic Recommendation Badge */}
          <div className="inline-flex items-center space-x-2.5 bg-gradient-to-r from-cyan-950/60 via-blue-950/50 to-slate-900/70 border border-cyan-500/40 px-4 py-2 rounded-2xl backdrop-blur-md self-start md:self-auto">
            <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
            <div className="text-xs">
              <span className="text-slate-400">Grooming for your </span>
              <span className="font-extrabold text-cyan-300">{animal?.name || 'Pet'} ({petBreedDisplay})</span>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* 2. LOCATION SEARCH SECTION — MOST IMPORTANT */}
        {/* ================================================== */}
        <section className="relative bg-[#0d172e]/90 border border-cyan-500/30 rounded-3xl p-5 sm:p-7 shadow-[0_0_35px_rgba(6,182,212,0.15)] backdrop-blur-xl space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Location Status Indicator */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
                <MapPin className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-cyan-400 block">
                  Your Location
                </span>
                <div className="text-sm sm:text-base font-bold text-white flex items-center space-x-2">
                  {isDetectingLocation ? (
                    <span className="text-cyan-300 animate-pulse flex items-center space-x-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Detecting your location...</span>
                    </span>
                  ) : (
                    <span>{locationName}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Radius Selector Pills */}
            <div className="flex items-center space-x-2 bg-slate-950/70 p-1.5 rounded-2xl border border-slate-800 self-start lg:self-auto">
              <span className="text-[11px] font-bold text-slate-400 px-2">Radius:</span>
              {RADIUS_OPTIONS.map((rad) => (
                <button
                  key={rad}
                  onClick={() => setSelectedRadius(rad)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    selectedRadius === rad
                      ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {rad} km
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar & Action Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-cyan-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search area, locality, salon name, service or breed (e.g. Indiranagar, Cat grooming, Poodle)..."
                className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-700/80 focus:border-cyan-400 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white text-xs bg-slate-800 px-2 py-0.5 rounded-full"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              onClick={() => handleDetectLocation(true)}
              disabled={isDetectingLocation}
              className="px-5 py-3 rounded-2xl font-extrabold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2 flex-shrink-0"
            >
              <LocateFixed className={`w-4 h-4 ${isDetectingLocation ? 'animate-spin' : ''}`} />
              <span>Use My Current Location</span>
            </button>
          </div>

          {/* Location Error / Denied Friendly Banner */}
          {locationError && (
            <div className="p-3.5 bg-amber-950/50 border border-amber-500/40 rounded-2xl flex items-start space-x-3 text-xs text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block">Location access is disabled or unavailable</span>
                <span className="text-slate-300">
                  Select a popular locality below or type your area name into search to discover nearby grooming centers.
                </span>
              </div>
            </div>
          )}

          {/* Quick Locality Selectors (Bengaluru Hubs) */}
          <div>
            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block mb-2">
              Popular Localities:
            </span>
            <div className="flex flex-wrap gap-2">
              {POPULAR_BENGALURU_LOCALITIES.map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => handleSelectLocality(loc)}
                  className="px-3 py-1 rounded-xl bg-slate-950/70 hover:bg-cyan-950/50 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 text-xs font-semibold transition-all"
                >
                  📍 {loc.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* 6. FILTERS & 7. SORTING BAR */}
        {/* ================================================== */}
        <section className="space-y-3">
          {/* Quick Filter Tags (Horizontal Scrollable) */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 custom-scrollbar">
            {QUICK_FILTER_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveQuickFilter(tag)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  activeQuickFilter === tag
                    ? 'bg-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-500/25'
                    : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Secondary Filter Dropdowns & Sorting Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/40 border border-slate-800/80 p-3 rounded-2xl text-xs">
            <div className="flex flex-wrap items-center gap-2">
              {/* Pet Type Filter */}
              <select
                value={selectedPetType}
                onChange={(e) => setSelectedPetType(e.target.value)}
                className="bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
              >
                <option value="All">🐾 All Pet Types</option>
                <option value="Dogs">🐶 Dogs</option>
                <option value="Cats">🐱 Cats</option>
                <option value="Rabbits">🐰 Rabbits</option>
                <option value="Birds">🐦 Birds</option>
                <option value="Small Pets">🐹 Small Pets</option>
                <option value="Exotic Pets">🐢 Exotic Pets</option>
              </select>

              {/* Price Filter */}
              <select
                value={selectedPriceFilter}
                onChange={(e) => setSelectedPriceFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
              >
                <option value="All">💰 All Prices</option>
                <option value="₹">₹ Budget (Starting ≤ ₹599)</option>
                <option value="₹₹">₹₹ Moderate (₹600 - ₹899)</option>
                <option value="₹₹₹">₹₹₹ Luxury (≥ ₹900)</option>
              </select>

              {/* Reset Filters */}
              {(activeQuickFilter !== 'All' || selectedPetType !== 'All' || selectedPriceFilter !== 'All' || searchQuery) && (
                <button
                  onClick={handleResetFilters}
                  className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center space-x-1 px-2 py-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Sort By Dropdown */}
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 text-xs font-semibold">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as GroomingSortOption)}
                className="bg-slate-950 border border-cyan-500/30 focus:border-cyan-400 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-bold outline-none"
              >
                <option value="nearest">📍 Nearest Distance</option>
                <option value="rating">⭐ Highest Rated</option>
                <option value="reviews">💬 Most Reviewed</option>
                <option value="price_low">💵 Lowest Price</option>
                <option value="open_now">🟢 Open Now First</option>
              </select>
            </div>
          </div>
        </section>

        {/* Mobile View Switcher (List vs Map) */}
        <div className="flex lg:hidden items-center p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setMobileViewTab('list')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
              mobileViewTab === 'list'
                ? 'bg-cyan-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>List View ({filteredAndSortedCenters.length})</span>
          </button>
          <button
            onClick={() => setMobileViewTab('map')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
              mobileViewTab === 'map'
                ? 'bg-cyan-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span>Interactive Map</span>
          </button>
        </div>

        {/* ================================================== */}
        {/* 3. MAIN MAP + LIST LAYOUT (40% List / 60% Map) */}
        {/* ================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: List of Nearby Grooming Centers (40% - 5 of 12 cols) */}
          <div
            className={`lg:col-span-5 space-y-4 ${
              mobileViewTab === 'map' ? 'hidden lg:block' : 'block'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>
                Found <strong className="text-white">{filteredAndSortedCenters.length}</strong> grooming centers within {selectedRadius} km
              </span>
              <span className="text-cyan-400 font-bold">
                Sorted by {sortBy === 'nearest' ? 'distance' : sortBy}
              </span>
            </div>

            {/* Centers List */}
            {filteredAndSortedCenters.length > 0 ? (
              <div className="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 custom-scrollbar">
                {filteredAndSortedCenters.map((center) => (
                  <GroomingCenterCard
                    key={center.id}
                    center={center}
                    userCoords={userCoords}
                    activePet={animal}
                    isSelected={selectedCenter?.id === center.id}
                    onSelect={(c) => setSelectedCenter(c)}
                    onViewDetails={(c) => setModalCenter(c)}
                    onBookNow={(c) => handleOpenBooking(c)}
                    onCall={(c) => handleOpenCall(c)}
                  />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
                  <Scissors className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">No grooming centers found</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    No centers match your filters within {selectedRadius} km. Try expanding the search radius or clearing active filters.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  <button
                    onClick={() => setSelectedRadius(25)}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs shadow-md"
                  >
                    Expand to 25 km
                  </button>
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Interactive Map (60% - 7 of 12 cols) */}
          <div
            className={`lg:col-span-7 sticky top-24 ${
              mobileViewTab === 'list' ? 'hidden lg:block' : 'block'
            }`}
          >
            <InteractiveGroomingMap
              userCoords={userCoords}
              centers={filteredAndSortedCenters}
              selectedCenter={selectedCenter}
              onSelectCenter={(c) => setSelectedCenter(c)}
              onViewDetails={(c) => setModalCenter(c)}
              onBookNow={(c) => handleOpenBooking(c)}
            />
          </div>
        </div>
      </main>

      {/* ================================================== */}
      {/* 8. GROOMING CENTER DETAILS MODAL */}
      {/* ================================================== */}
      {modalCenter && (
        <GroomingDetailsModal
          center={modalCenter}
          userCoords={userCoords}
          onClose={() => setModalCenter(null)}
          onBookNow={(c, tier) => handleOpenBooking(c, tier)}
          onCall={(c) => handleOpenCall(c)}
        />
      )}

      {/* ================================================== */}
      {/* 9. BOOK APPOINTMENT MODAL */}
      {/* ================================================== */}
      {bookingCenter && (
        <GroomingBookingModal
          center={bookingCenter}
          activePet={animal}
          preselectedTier={preselectedTier}
          onClose={() => {
            setBookingCenter(null);
            setPreselectedTier(null);
          }}
        />
      )}

      {/* ================================================== */}
      {/* 11. CALL CENTER MODAL */}
      {/* ================================================== */}
      {callCenter && (
        <GroomingCallModal
          center={callCenter}
          onClose={() => setCallCenter(null)}
        />
      )}
    </div>
  );
};
