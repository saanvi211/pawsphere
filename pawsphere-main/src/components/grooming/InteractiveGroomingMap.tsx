import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  MapPin,
  Navigation,
  Phone,
  Star,
  LocateFixed,
  Maximize2,
  Minimize2,
  Sparkles,
  ExternalLink,
  Calendar,
  Eye,
  RefreshCw
} from 'lucide-react';
import { GroomingCenter } from '../../types/grooming';
import { getDirectionsUrl } from '../../lib/geolocation';

interface InteractiveGroomingMapProps {
  userCoords: { latitude: number; longitude: number } | null;
  centers: GroomingCenter[];
  selectedCenter: GroomingCenter | null;
  onSelectCenter: (center: GroomingCenter) => void;
  onViewDetails: (center: GroomingCenter) => void;
  onBookNow: (center: GroomingCenter) => void;
  className?: string;
}

export const InteractiveGroomingMap: React.FC<InteractiveGroomingMapProps> = ({
  userCoords,
  centers,
  selectedCenter,
  onSelectCenter,
  onViewDetails,
  onBookNow,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersMapRef = useRef<Map<string, any>>(new Map());
  const userMarkerRef = useRef<any>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  const defaultCenter = userCoords
    ? [userCoords.latitude, userCoords.longitude]
    : [12.9716, 77.5946]; // Bengaluru Center

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;

    // Dynamically import Leaflet to prevent SSR issues and ensure smooth load
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Clean up previous map if exists
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter as [number, number],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      // Dark Matter futuristic tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      leafletMapRef.current = map;
      setMapLoaded(true);

      // Add Zoom Control to bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(map);
    });

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Sync Markers on Map when centers or userCoords change
  useEffect(() => {
    if (!leafletMapRef.current || !mapLoaded) return;

    import('leaflet').then((L) => {
      const map = leafletMapRef.current;
      if (!map) return;

      // Remove existing markers
      markersMapRef.current.forEach((marker) => marker.remove());
      markersMapRef.current.clear();

      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }

      // Add User Location Marker (Pulsing Cyan Ring)
      if (userCoords) {
        const userIcon = L.divIcon({
          className: 'custom-user-location-marker',
          html: `
            <div class="relative flex items-center justify-center w-8 h-8">
              <div class="absolute w-8 h-8 bg-cyan-400/30 rounded-full animate-ping"></div>
              <div class="absolute w-6 h-6 bg-cyan-500/50 rounded-full"></div>
              <div class="relative w-4 h-4 bg-cyan-400 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                <div class="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const userMarker = L.marker([userCoords.latitude, userCoords.longitude], {
          icon: userIcon,
          zIndexOffset: 1000,
        }).addTo(map);

        userMarker.bindTooltip(
          '<div class="px-2 py-1 bg-slate-900 text-cyan-300 font-bold text-xs rounded-lg border border-cyan-500/50">📍 Your Current Location</div>',
          { permanent: false, direction: 'top', className: 'dark-leaflet-tooltip' }
        );

        userMarkerRef.current = userMarker;
      }

      // Add Grooming Centers Markers
      const bounds = L.latLngBounds([]);
      if (userCoords) {
        bounds.extend([userCoords.latitude, userCoords.longitude]);
      }

      centers.forEach((center) => {
        const isSelected = selectedCenter?.id === center.id;

        const centerIcon = L.divIcon({
          className: 'custom-center-marker',
          html: `
            <div class="relative group cursor-pointer transition-transform duration-300 ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
              <div class="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border font-bold text-xs shadow-xl backdrop-blur-md ${
                isSelected
                  ? 'bg-cyan-500 text-white border-white shadow-[0_0_20px_rgba(6,182,212,0.8)]'
                  : 'bg-slate-900/90 text-cyan-300 border-cyan-500/40 hover:border-cyan-400'
              }">
                <span class="text-xs">🐾</span>
                <span class="text-[11px] font-black">₹${center.startingPrice}</span>
              </div>
              <div class="w-2 h-2 mx-auto rotate-45 -mt-1 ${isSelected ? 'bg-cyan-500' : 'bg-slate-900 border-r border-b border-cyan-500/40'}"></div>
            </div>
          `,
          iconSize: [60, 36],
          iconAnchor: [30, 36],
        });

        const marker = L.marker([center.latitude, center.longitude], {
          icon: centerIcon,
        }).addTo(map);

        // Click handler to select center
        marker.on('click', () => {
          onSelectCenter(center);
        });

        // Popup Content
        const popupContent = `
          <div style="font-family: inherit;" class="p-1 min-w-[200px] text-slate-900">
            <div class="font-bold text-sm text-slate-900 leading-tight mb-1">${center.name}</div>
            <div class="text-xs text-slate-600 mb-2">⭐ ${center.rating} (${center.reviewsCount} reviews) • ${typeof center.distance === 'number' ? `${center.distance} km` : center.locality}</div>
            <div class="text-xs font-semibold text-cyan-700 mb-3">Starting ₹${center.startingPrice} • ${center.isOpenNow ? '🟢 Open Now' : '🔴 Closed'}</div>
            <div class="flex space-x-2">
              <a href="https://www.google.com/maps/dir/?api=1&origin=${userCoords?.latitude ?? 12.9716},${userCoords?.longitude ?? 77.5946}&destination=${center.latitude},${center.longitude}" target="_blank" class="px-2.5 py-1 bg-slate-800 text-white rounded text-[11px] font-bold text-center flex-1">Directions</a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          closeButton: false,
          className: 'dark-leaflet-popup',
        });

        markersMapRef.current.set(center.id, marker);
        bounds.extend([center.latitude, center.longitude]);
      });

      // Fit map bounds if multiple points exist
      if (centers.length > 0 && !selectedCenter) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    });
  }, [centers, userCoords, mapLoaded]);

  // Center & Highlight selected center
  useEffect(() => {
    if (!leafletMapRef.current || !selectedCenter) return;

    const map = leafletMapRef.current;
    map.flyTo([selectedCenter.latitude, selectedCenter.longitude], 15, {
      animate: true,
      duration: 0.8,
    });

    const marker = markersMapRef.current.get(selectedCenter.id);
    if (marker) {
      marker.openPopup();
    }
  }, [selectedCenter]);

  // Recenter on user
  const handleRecenter = () => {
    if (!leafletMapRef.current) return;
    const coords = userCoords ? [userCoords.latitude, userCoords.longitude] : defaultCenter;
    leafletMapRef.current.flyTo(coords, 14, { animate: true });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden border border-cyan-500/30 bg-[#0d172e] shadow-[0_0_40px_rgba(6,182,212,0.15)] flex flex-col ${
        isFullscreen ? 'fixed inset-4 z-50 h-[calc(100vh-32px)]' : className || 'h-[500px] lg:h-[calc(100vh-280px)] min-h-[450px]'
      }`}
    >
      {/* Map Header Floating Overlay */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-cyan-500/30 text-xs font-bold text-cyan-300 shadow-lg pointer-events-auto flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>{centers.length} Grooming Centers Found</span>
        </div>

        <div className="flex items-center space-x-2 pointer-events-auto">
          {/* Recenter Button */}
          <button
            onClick={handleRecenter}
            className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-cyan-300 hover:text-white border border-cyan-500/30 shadow-lg backdrop-blur-md transition-all"
            title="Recenter to my location"
          >
            <LocateFixed className="w-4 h-4" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-cyan-300 hover:text-white border border-cyan-500/30 shadow-lg backdrop-blur-md transition-all"
            title={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Selected Center Quick Floating Card */}
      {selectedCenter && (
        <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-auto bg-slate-950/90 backdrop-blur-lg border border-cyan-400/50 rounded-2xl p-4 shadow-[0_0_30px_rgba(6,182,212,0.3)] animate-slideUp">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-white truncate">{selectedCenter.name}</h4>
                <div className="flex items-center space-x-1 text-amber-400 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{selectedCenter.rating}</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 truncate mt-0.5">{selectedCenter.locality} • {typeof selectedCenter.distance === 'number' ? `${selectedCenter.distance} km away` : 'Nearby'}</p>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={() => onViewDetails(selectedCenter)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center space-x-1"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Details</span>
              </button>

              <button
                onClick={() => onBookNow(selectedCenter)}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black shadow-md shadow-cyan-500/25 transition-all flex items-center space-x-1"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
