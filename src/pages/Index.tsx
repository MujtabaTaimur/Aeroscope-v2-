import { useState, useEffect, useRef } from 'react';
import FlightMap from '@/components/FlightMap';
import FlightInfo from '@/components/FlightInfo';
import SearchBar from '@/components/SearchBar';
import StatsPanel from '@/components/StatsPanel';
import Header from '@/components/Header';
import { useToast } from '@/hooks/use-toast';

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

const Index = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const retryCount = useRef(0);
  const maxRetries = 3;
  const cacheKey = 'aeroscope_flight_cache';
  const cacheExpiry = 30000; // 30 seconds

  const generateMockFlights = (count: number): Flight[] => {
    return Array.from({ length: count }, (_, i) => ({
      icao24: `A${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      callsign: `FL${(i + 1000).toString()}`,
      origin_country: ['USA', 'UK', 'Germany', 'France', 'Japan', 'China', 'Canada', 'Australia'][i % 8],
      longitude: (Math.random() * 360) - 180,
      latitude: (Math.random() * 170) - 85,
      baro_altitude: Math.random() * 12000,
      velocity: 200 + Math.random() * 700,
      true_track: Math.random() * 360,
      vertical_rate: (Math.random() - 0.5) * 10,
    }));
  };

  const loadFromCache = () => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < cacheExpiry) {
          return data;
        }
      }
    } catch (e) {
      console.error('Cache error:', e);
    }
    return null;
  };

  const saveToCache = (data: Flight[]) => {
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.error('Cache save error:', e);
    }
  };

  const fetchFlights = async () => {
    try {
      // Try cache first
      const cached = loadFromCache();
      if (cached && flights.length === 0) {
        setFlights(cached);
        setFilteredFlights(cached);
        setIsLoading(false);
        return;
      }

      const response = await fetch('https://opensky-network.org/api/states/all');
      
      if (response.status === 429) {
        // Rate limited - use exponential backoff
        const delay = Math.min(1000 * Math.pow(2, retryCount.current), 60000);
        console.log(`Rate limited. Retrying in ${delay}ms`);
        
        if (retryCount.current < maxRetries) {
          retryCount.current++;
          setTimeout(fetchFlights, delay);
          return;
        }
        
        // Max retries reached, use mock data
        if (flights.length === 0) {
          const mockData = generateMockFlights(10000);
          setFlights(mockData);
          setFilteredFlights(mockData);
          toast({
            title: 'Demo Mode',
            description: 'Using simulated flight data. API rate limit reached.',
          });
        }
        setIsLoading(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch flight data');
      }

      const data = await response.json();
      retryCount.current = 0; // Reset retry count on success
      
      const flightData: Flight[] = data.states
        .filter((state: any[]) => {
          return state[5] !== null && state[6] !== null;
        })
        .map((state: any[]) => ({
          icao24: state[0],
          callsign: state[1],
          origin_country: state[2],
          longitude: state[5],
          latitude: state[6],
          baro_altitude: state[7],
          velocity: state[9],
          true_track: state[10],
          vertical_rate: state[11],
        }));

      // Don't limit - handle all flights with clustering
      setFlights(flightData);
      setFilteredFlights(flightData);
      saveToCache(flightData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching flights:', error);
      
      // Fallback to mock data on error
      if (flights.length === 0) {
        const mockData = generateMockFlights(10000);
        setFlights(mockData);
        setFilteredFlights(mockData);
        toast({
          title: 'Demo Mode',
          description: 'Using simulated flight data for demonstration.',
        });
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
    
    // Increased refresh interval to 60 seconds to respect rate limits
    const interval = setInterval(fetchFlights, 60000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFlights(flights);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = flights.filter(
      (flight) =>
        flight.callsign?.toLowerCase().includes(query) ||
        flight.origin_country?.toLowerCase().includes(query) ||
        flight.icao24?.toLowerCase().includes(query)
    );

    setFilteredFlights(filtered);
  }, [searchQuery, flights]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <Header />
      
      <FlightMap
        flights={filteredFlights}
        onFlightClick={setSelectedFlight}
        selectedFlight={selectedFlight}
      />

      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      <StatsPanel totalFlights={filteredFlights.length} isLoading={isLoading} />

      {selectedFlight && (
        <FlightInfo
          flight={selectedFlight}
          onClose={() => setSelectedFlight(null)}
        />
      )}
    </div>
  );
};

export default Index;
