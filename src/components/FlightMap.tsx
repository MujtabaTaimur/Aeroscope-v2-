import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

interface Flight {
  icao24: string;
  callsign: string;
  origin_country: string;
  longitude: number;
  latitude: number;
  baro_altitude: number;
  velocity: number;
  true_track: number;
  vertical_rate: number;
}

interface FlightMapProps {
  flights: Flight[];
  onFlightClick: (flight: Flight) => void;
  selectedFlight: Flight | null;
}

const FlightMap = ({ flights, onFlightClick, selectedFlight }: FlightMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const markerClusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      center: [20, 0],
      zoom: 3,
      zoomControl: false,
      attributionControl: false,
    });

    // Add dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Add custom zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initialize marker cluster group with optimized settings
    const markerCluster = (L as any).markerClusterGroup({
      chunkedLoading: true,
      chunkInterval: 200,
      chunkDelay: 50,
      maxClusterRadius: 80,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: function(cluster: any) {
        const count = cluster.getChildCount();
        let size = 'small';
        if (count > 100) size = 'large';
        else if (count > 10) size = 'medium';
        
        return L.divIcon({
          html: `<div class="cluster-icon cluster-${size}">${count}</div>`,
          className: 'marker-cluster-custom',
          iconSize: L.point(40, 40)
        });
      }
    });
    
    map.addLayer(markerCluster);
    markerClusterRef.current = markerCluster;

    mapRef.current = map;

    return () => {
      if (markerClusterRef.current) {
        markerClusterRef.current.clearLayers();
      }
      map.remove();
      mapRef.current = null;
      markerClusterRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markerClusterRef.current) return;

    const map = mapRef.current;
    const cluster = markerClusterRef.current;
    const existingMarkers = markersRef.current;
    const newMarkerIds = new Set<string>();

    // Create airplane icon
    const createAirplaneIcon = (isSelected: boolean) => {
      return L.divIcon({
        className: 'custom-airplane-marker',
        html: `
          <div class="relative">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
              class="transition-all duration-300 ${isSelected ? 'scale-125' : 'scale-100'}">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" 
                fill="${isSelected ? '#00d4ff' : '#00d4ff'}" 
                stroke="${isSelected ? '#ffffff' : 'none'}" 
                stroke-width="${isSelected ? '1' : '0'}"
                filter="${isSelected ? 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.8))' : 'drop-shadow(0 0 4px rgba(0, 212, 255, 0.6))'}"/>
            </svg>
            ${isSelected ? '<div class="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>' : ''}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
    };

    // Batch update markers
    const markersToAdd: L.Marker[] = [];
    const markersToRemove: string[] = [];

    flights.forEach((flight) => {
      if (!flight.longitude || !flight.latitude) return;

      const markerId = flight.icao24;
      newMarkerIds.add(markerId);

      const isSelected = selectedFlight?.icao24 === flight.icao24;
      const icon = createAirplaneIcon(isSelected);

      if (existingMarkers.has(markerId)) {
        // Update existing marker
        const marker = existingMarkers.get(markerId)!;
        marker.setLatLng([flight.latitude, flight.longitude]);
        marker.setIcon(icon);
      } else {
        // Create new marker
        const marker = L.marker([flight.latitude, flight.longitude], {
          icon,
        });

        marker.on('click', () => {
          onFlightClick(flight);
        });

        markersToAdd.push(marker);
        existingMarkers.set(markerId, marker);
      }
    });

    // Batch add new markers to cluster
    if (markersToAdd.length > 0) {
      cluster.addLayers(markersToAdd);
    }

    // Remove markers that are no longer in the flights array
    existingMarkers.forEach((marker, markerId) => {
      if (!newMarkerIds.has(markerId)) {
        markersToRemove.push(markerId);
      }
    });

    // Batch remove markers
    if (markersToRemove.length > 0) {
      const layersToRemove = markersToRemove.map(id => existingMarkers.get(id)!).filter(Boolean);
      cluster.removeLayers(layersToRemove);
      markersToRemove.forEach(id => existingMarkers.delete(id));
    }

    // Center on selected flight
    if (selectedFlight && selectedFlight.longitude && selectedFlight.latitude) {
      map.setView([selectedFlight.latitude, selectedFlight.longitude], 8, {
        animate: true,
        duration: 1,
      });
    }
  }, [flights, onFlightClick, selectedFlight]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
};

export default FlightMap;
