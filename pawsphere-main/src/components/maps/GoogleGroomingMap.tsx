import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  MapPin,
  Navigation,
  Phone,
  Globe,
  Star,
  LocateFixed,
  Maximize2,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  Info,
} from 'lucide-react';
import { GroomingCentre, Location, getDirectionsUrl, formatDistance } from '../../lib/geolocation';
import { loadGoogleMaps, isGoogleMapsConfigured } from '../../lib/api/googleMaps';

interface GoogleGroomingMapProps {
  userLocation: Location | null;
  centres: GroomingCentre[];
  selectedCentre: GroomingCentre | null;
  focusedCentreId?: string | null;
  onSelectCentre: (centre: GroomingCentre) => void;
  className?: string;
  isDemoMode?: boolean;
}

// Custom dark map styling for PawSphere
const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#0d172e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d172e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#748fb5' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#06b6d4' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#062938' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#22c55e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1a2947' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#213359' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#94a3b8' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#0284c7' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0369a1' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#e0f2fe' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#051026' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#051026' }],
  },
];

export const GoogleGroomingMap: React.FC<GoogleGroomingMapProps> = ({
  userLocation,
  centres,
  selectedCentre,
  focusedCentreId,
  onSelectCentre,
  className = '',
  isDemoMode = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const googleMapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const leafletMapRef = useRef<unknown>(null);

  const [mapProvider, setMapProvider] = useState<'google' | 'leaflet' | 'loading'>('loading');
  const [googleLoadError, setGoogleLoadError] = useState<string | null>(null);
  const [showConfigHelp, setShowConfigHelp] = useState(false);

  // Initialize Map Provider (Google Maps or Leaflet Fallback)
  useEffect(() => {
    let isMounted = true;

    if (isGoogleMapsConfigured()) {
      loadGoogleMaps()
        .then(() => {
          if (isMounted) {
            setMapProvider('google');
            setGoogleLoadError(null);
          }
        })
        .catch((err) => {
          console.warn('Google Maps API failed to load, falling back to interactive Leaflet map:', err);
          if (isMounted) {
            setGoogleLoadError(err.message || 'Google Maps failed to load');
            setMapProvider('leaflet');
          }
        });
    } else {
      // Key not provided, use Leaflet OpenStreetMap fallback
      setMapProvider('leaflet');
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Center coordinate helper
  const getCenterCoords = useCallback((): { lat: number; lng: number } => {
    if (userLocation) {
      return { lat: userLocation.latitude, lng: userLocation.longitude };
    }
    if (centres.length > 0) {
      return { lat: centres[0].lat, lng: centres[0].lng };
    }
    // Default to Bengaluru center
    return { lat: 12.9716, lng: 77.5946 };
  }, [userLocation, centres]);

  // Open InfoWindow for Google Maps
  const openGoogleInfoWindow = useCallback(
    (centre: GroomingCentre, marker: google.maps.Marker) => {
      if (!googleMapInstanceRef.current || typeof window === 'undefined' || !window.google?.maps) return;

      if (!infoWindowRef.current) {
        infoWindowRef.current = new window.google.maps.InfoWindow();
      }

      const distanceText = centre.distance ? formatDistance(centre.distance) : '';
      const directionsUrl = userLocation
        ? getDirectionsUrl(userLocation.latitude, userLocation.longitude, centre.lat, centre.lng, centre.name)
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(centre.name + ' ' + centre.address)}`;

      const demoBadgeHtml = centre.isDemo
        ? `<div style="display:inline-block;background:#f59e0b;color:#000;font-size:9px;font-weight:800;padding:2px 6px;border-radius:4px;margin-bottom:4px;">DEMO DATA (Simulated)</div>`
        : `<div style="display:inline-block;background:#06b6d4;color:#000;font-size:9px;font-weight:800;padding:2px 6px;border-radius:4px;margin-bottom:4px;">✓ GOOGLE PLACES VERIFIED</div>`;

      const contentString = `
        <div style="color:#0f172a;font-family:system-ui,-apple-system,sans-serif;min-width:240px;max-width:300px;padding:4px;">
          ${demoBadgeHtml}
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <h3 style="font-size:14px;font-weight:800;margin:0 0 2px 0;color:#091122;">${centre.name}</h3>
          </div>
          <div style="font-size:11px;color:#475569;margin-bottom:6px;line-height:1.3;">${centre.address}</div>
          
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;font-size:11px;font-weight:700;">
            <span style="color:#d97706;display:flex;align-items:center;gap:2px;">⭐ ${centre.rating} (${centre.reviews})</span>
            ${distanceText ? `<span style="color:#0284c7;">📍 ${distanceText}</span>` : ''}
          </div>

          <div style="font-size:10px;color:#64748b;margin-bottom:8px;background:#f1f5f9;padding:4px 6px;border-radius:6px;">
            🕒 ${centre.openingHours || 'Standard Hours'}
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:6px;">
            <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" 
               style="text-align:center;background:#0284c7;color:#ffffff;text-decoration:none;font-size:11px;font-weight:700;padding:6px 8px;border-radius:6px;display:block;">
              🗺️ Directions
            </a>
            ${
              centre.phone
                ? `<a href="tel:${centre.phone}" 
                     style="text-align:center;background:#16a34a;color:#ffffff;text-decoration:none;font-size:11px;font-weight:700;padding:6px 8px;border-radius:6px;display:block;">
                    📞 Call
                   </a>`
                : centre.website
                ? `<a href="${centre.website.startsWith('http') ? centre.website : 'https://' + centre.website}" target="_blank" rel="noopener noreferrer"
                     style="text-align:center;background:#9333ea;color:#ffffff;text-decoration:none;font-size:11px;font-weight:700;padding:6px 8px;border-radius:6px;display:block;">
                    🌐 Website
                   </a>`
                : `<div style="text-align:center;background:#e2e8f0;color:#64748b;font-size:11px;font-weight:700;padding:6px 8px;border-radius:6px;">
                    🐾 Groomer
                   </div>`
            }
          </div>
        </div>
      `;

      infoWindowRef.current.setContent(contentString);
      infoWindowRef.current.open({
        anchor: marker,
        map: googleMapInstanceRef.current,
        shouldFocus: false,
      });
    },
    [userLocation]
  );

  // ----------------------------------------------------
  // GOOGLE MAPS LIFECYCLE
  // ----------------------------------------------------
  useEffect(() => {
    if (mapProvider !== 'google' || !mapContainerRef.current || !window.google?.maps) return;

    const maps = window.google.maps;
    const center = getCenterCoords();

    if (!googleMapInstanceRef.current) {
      const map = new maps.Map(mapContainerRef.current, {
        center,
        zoom: 13,
        styles: DARK_MAP_STYLE,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        mapTypeControl: false,
      });

      googleMapInstanceRef.current = map;
    }

    const map = googleMapInstanceRef.current;

    // Clear old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current.clear();

    // User Location Marker
    if (userLocation) {
      if (userMarkerRef.current) userMarkerRef.current.setMap(null);

      const userMarker = new maps.Marker({
        position: { lat: userLocation.latitude, lng: userLocation.longitude },
        map,
        title: 'You are here',
        icon: {
          path: maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#38bdf8',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2.5,
        },
        zIndex: 999,
      });

      userMarker.addListener('click', () => {
        if (!infoWindowRef.current) infoWindowRef.current = new maps.InfoWindow();
        infoWindowRef.current.setContent(`
          <div style="padding:4px;font-size:12px;font-weight:800;color:#0369a1;font-family:sans-serif;">
            📍 Your Current Location
          </div>
        `);
        infoWindowRef.current.open(map, userMarker);
      });

      userMarkerRef.current = userMarker;
    }

    // Salon Markers
    const bounds = new maps.LatLngBounds();
    if (userLocation) {
      bounds.extend({ lat: userLocation.latitude, lng: userLocation.longitude });
    }

    centres.forEach((centre) => {
      const isSelected = selectedCentre?.id === centre.id || focusedCentreId === centre.id;
      const marker = new maps.Marker({
        position: { lat: centre.lat, lng: centre.lng },
        map,
        title: centre.name,
        icon: {
          path: maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: isSelected ? 6.5 : 5,
          fillColor: isSelected ? '#f59e0b' : '#06b6d4',
          fillOpacity: 0.95,
          strokeColor: '#091122',
          strokeWeight: 2,
        },
        zIndex: isSelected ? 100 : 10,
      });

      marker.addListener('click', () => {
        onSelectCentre(centre);
        openGoogleInfoWindow(centre, marker);
      });

      markersRef.current.set(centre.id, marker);
      bounds.extend({ lat: centre.lat, lng: centre.lng });
    });

    // Auto-fit if centres exist and no specific focus is active
    if (centres.length > 1 && !focusedCentreId && !selectedCentre) {
      map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
    }
  }, [mapProvider, centres, userLocation, getCenterCoords, onSelectCentre, openGoogleInfoWindow]);

  // Synchronize from List to Google Map
  useEffect(() => {
    const activeTarget = selectedCentre || centres.find((c) => c.id === focusedCentreId);
    if (!activeTarget || !googleMapInstanceRef.current || mapProvider !== 'google') return;

    const map = googleMapInstanceRef.current;
    const targetMarker = markersRef.current.get(activeTarget.id);

    map.panTo({ lat: activeTarget.lat, lng: activeTarget.lng });
    if (map.getZoom() < 14) {
      map.setZoom(14);
    }

    if (targetMarker) {
      openGoogleInfoWindow(activeTarget, targetMarker);
    }
  }, [selectedCentre, focusedCentreId, centres, mapProvider, openGoogleInfoWindow]);

  // ----------------------------------------------------
  // LEAFLET FALLBACK MAP LIFECYCLE
  // ----------------------------------------------------
  useEffect(() => {
    if (mapProvider !== 'leaflet' || !mapContainerRef.current) return;

    let isMounted = true;
    const center = getCenterCoords();

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Fix icon paths
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (leafletMapRef.current) {
        (leafletMapRef.current as { remove: () => void }).remove();
        leafletMapRef.current = null;
      }

      const map = L.map(mapContainerRef.current).setView([center.lat, center.lng], 13);

      // Clean OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors | PawSphere Maps',
        maxZoom: 19,
      }).addTo(map);

      // User location marker
      if (userLocation) {
        L.circleMarker([userLocation.latitude, userLocation.longitude], {
          radius: 9,
          fillColor: '#0284c7',
          color: '#ffffff',
          weight: 3,
          fillOpacity: 0.9,
        })
          .addTo(map)
          .bindPopup('<strong style="font-size:12px;color:#0284c7;">📍 You are here</strong>');
      }

      // Salon markers
      const leafletMarkers = new Map<string, any>();
      centres.forEach((centre) => {
        const marker = L.marker([centre.lat, centre.lng]).addTo(map);

        const distanceText = centre.distance ? formatDistance(centre.distance) : '';
        const directionsUrl = userLocation
          ? getDirectionsUrl(userLocation.latitude, userLocation.longitude, centre.lat, centre.lng, centre.name)
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(centre.name + ' ' + centre.address)}`;

        const popupContent = `
          <div style="font-family:sans-serif;min-width:210px;padding:2px;">
            <div style="display:inline-block;background:#f59e0b;color:#000;font-size:9px;font-weight:800;padding:2px 5px;border-radius:3px;margin-bottom:3px;">
              DEMO DATA (Simulated)
            </div>
            <div style="font-size:13px;font-weight:800;color:#0f172a;margin-bottom:2px;">${centre.name}</div>
            <div style="font-size:11px;color:#475569;margin-bottom:4px;">${centre.address}</div>
            <div style="font-size:11px;font-weight:700;color:#d97706;margin-bottom:6px;">
              ⭐ ${centre.rating} (${centre.reviews} reviews) ${distanceText ? ` • 📍 ${distanceText}` : ''}
            </div>
            <div style="display:flex;gap:4px;margin-top:6px;">
              <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" 
                 style="flex:1;text-align:center;background:#0284c7;color:#fff;text-decoration:none;font-size:11px;font-weight:700;padding:5px 6px;border-radius:4px;">
                🗺️ Directions
              </a>
              ${
                centre.phone
                  ? `<a href="tel:${centre.phone}" style="flex:1;text-align:center;background:#16a34a;color:#fff;text-decoration:none;font-size:11px;font-weight:700;padding:5px 6px;border-radius:4px;">
                      📞 Call
                     </a>`
                  : ''
              }
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          onSelectCentre(centre);
        });

        leafletMarkers.set(centre.id, marker);
      });

      leafletMapRef.current = { map, leafletMarkers };
    });

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        const obj = leafletMapRef.current as any;
        if (obj.map) obj.map.remove();
        leafletMapRef.current = null;
      }
    };
  }, [mapProvider, centres, userLocation, getCenterCoords, onSelectCentre]);

  // Synchronize list-to-map for Leaflet
  useEffect(() => {
    const activeTarget = selectedCentre || centres.find((c) => c.id === focusedCentreId);
    if (!activeTarget || !leafletMapRef.current || mapProvider !== 'leaflet') return;

    const { map, leafletMarkers } = leafletMapRef.current as any;
    if (map) {
      map.setView([activeTarget.lat, activeTarget.lng], 14, { animate: true });
      const marker = leafletMarkers.get(activeTarget.id);
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedCentre, focusedCentreId, centres, mapProvider]);

  // Map Controls
  const handleRecenter = () => {
    const coords = getCenterCoords();
    if (mapProvider === 'google' && googleMapInstanceRef.current) {
      googleMapInstanceRef.current.panTo(coords);
      googleMapInstanceRef.current.setZoom(13);
    } else if (mapProvider === 'leaflet' && leafletMapRef.current) {
      const { map } = leafletMapRef.current as any;
      if (map) map.setView([coords.lat, coords.lng], 13, { animate: true });
    }
  };

  const handleFitBounds = () => {
    if (centres.length === 0) return;

    if (mapProvider === 'google' && googleMapInstanceRef.current && window.google?.maps) {
      const bounds = new window.google.maps.LatLngBounds();
      if (userLocation) bounds.extend({ lat: userLocation.latitude, lng: userLocation.longitude });
      centres.forEach((c) => bounds.extend({ lat: c.lat, lng: c.lng }));
      googleMapInstanceRef.current.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
    } else if (mapProvider === 'leaflet' && leafletMapRef.current) {
      import('leaflet').then((L) => {
        const { map } = leafletMapRef.current as any;
        if (map) {
          const latLngs = centres.map((c) => [c.lat, c.lng] as [number, number]);
          if (userLocation) latLngs.push([userLocation.latitude, userLocation.longitude]);
          map.fitBounds(L.latLngBounds(latLngs), { padding: [40, 40] });
        }
      });
    }
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl bg-[#091122] flex flex-col ${className}`}>
      {/* Top Map Header / Status Bar */}
      <div className="bg-[#0a1426] px-4 py-2.5 border-b border-cyan-500/20 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              {mapProvider === 'google' ? 'Google Maps JavaScript API' : 'Interactive Map (OSM Fallback)'}
            </span>
          </div>

          {isDemoMode && (
            <span className="px-2.5 py-1 rounded-full bg-amber-950/90 text-amber-300 border border-amber-500/40 font-extrabold flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>DEMO DATA (Bengaluru)</span>
            </span>
          )}

          {!isDemoMode && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 font-extrabold flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>LIVE PLACES API</span>
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRecenter}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-950 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 font-bold flex items-center space-x-1 transition-all"
            title="Center on my location"
          >
            <LocateFixed className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">My Location</span>
          </button>

          <button
            onClick={handleFitBounds}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-950 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 font-bold flex items-center space-x-1 transition-all"
            title="Fit all salons on map"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fit All ({centres.length})</span>
          </button>

          {mapProvider === 'leaflet' && (
            <button
              onClick={() => setShowConfigHelp(!showConfigHelp)}
              className="px-2.5 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/40 font-bold flex items-center space-x-1 transition-all"
              title="Google Maps API configuration info"
            >
              <Info className="w-3.5 h-3.5" />
              <span>API Setup</span>
            </button>
          )}
        </div>
      </div>

      {/* Optional Setup Guide Banner */}
      {showConfigHelp && (
        <div className="bg-[#121c33] border-b border-amber-500/30 p-4 text-xs space-y-2 text-slate-200 animate-fadeIn">
          <div className="flex items-start justify-between">
            <h4 className="font-extrabold text-amber-300 text-sm flex items-center space-x-1.5">
              <span>🔑 Configure Google Maps & Places API</span>
            </h4>
            <button
              onClick={() => setShowConfigHelp(false)}
              className="text-slate-400 hover:text-white font-bold"
            >
              ✕
            </button>
          </div>
          <p className="text-slate-300">
            PawSphere supports live Google Maps & Places API worldwide search. To activate live data:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-slate-300 font-mono text-[11px] bg-[#091122] p-2.5 rounded-lg border border-slate-800">
            <li>Open Google Cloud Console: <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-cyan-400 underline inline-flex items-center gap-0.5">Google Cloud Console <ExternalLink className="w-3 h-3" /></a></li>
            <li>Enable <span className="text-amber-300 font-bold">Maps JavaScript API</span> and <span className="text-amber-300 font-bold">Places API</span></li>
            <li>Add <span className="text-cyan-300 font-bold">VITE_GOOGLE_MAPS_API_KEY=your_key</span> to your local <code className="text-amber-400">.env</code> file</li>
          </ol>
          {googleLoadError && (
            <p className="text-rose-400 font-mono text-[11px]">Notice: {googleLoadError}</p>
          )}
        </div>
      )}

      {/* Main Map Container */}
      <div className="relative flex-1 min-h-[380px] w-full">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

        {/* Synchronized Salon Hint */}
        <div className="absolute bottom-3 left-3 z-10 bg-[#091122]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/30 text-[11px] font-bold text-cyan-200 shadow-lg flex items-center space-x-2 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>Click any marker to open salon details & directions</span>
        </div>
      </div>
    </div>
  );
};
