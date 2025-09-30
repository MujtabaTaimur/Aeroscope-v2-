import { X, Plane, Navigation, Gauge, TrendingUp, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

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

interface FlightInfoProps {
  flight: Flight;
  onClose: () => void;
}

const FlightInfo = ({ flight, onClose }: FlightInfoProps) => {
  const formatAltitude = (altitude: number | null) => {
    if (altitude === null) return 'N/A';
    return `${Math.round(altitude)} m`;
  };

  const formatSpeed = (speed: number | null) => {
    if (speed === null) return 'N/A';
    return `${Math.round(speed * 3.6)} km/h`;
  };

  const formatVerticalRate = (rate: number | null) => {
    if (rate === null) return 'N/A';
    const direction = rate > 0 ? '↑' : rate < 0 ? '↓' : '→';
    return `${direction} ${Math.abs(Math.round(rate))} m/s`;
  };

  const formatCoordinates = (lat: number, lon: number) => {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;
  };

  return (
    <Card className="absolute top-4 right-4 w-80 md:w-96 bg-card/95 backdrop-blur-md border-2 border-primary/30 shadow-2xl z-[1000] animate-slide-in">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
              <Plane className="w-6 h-6" />
              {flight.callsign?.trim() || 'Unknown'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {flight.origin_country}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary/50 rounded-lg p-3 border border-border">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Gauge className="w-4 h-4" />
                <span className="text-xs">Altitude</span>
              </div>
              <p className="text-lg font-semibold text-primary">
                {formatAltitude(flight.baro_altitude)}
              </p>
            </div>

            <div className="bg-secondary/50 rounded-lg p-3 border border-border">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Navigation className="w-4 h-4" />
                <span className="text-xs">Speed</span>
              </div>
              <p className="text-lg font-semibold text-primary">
                {formatSpeed(flight.velocity)}
              </p>
            </div>
          </div>

          <div className="bg-secondary/50 rounded-lg p-3 border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Vertical Rate</span>
            </div>
            <p className="text-lg font-semibold text-primary">
              {formatVerticalRate(flight.vertical_rate)}
            </p>
          </div>

          <div className="bg-secondary/50 rounded-lg p-3 border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-xs">Position</span>
            </div>
            <p className="text-sm font-mono text-primary">
              {formatCoordinates(flight.latitude, flight.longitude)}
            </p>
          </div>

          <div className="bg-secondary/50 rounded-lg p-3 border border-border">
            <div className="text-muted-foreground mb-1">
              <span className="text-xs">ICAO24 Code</span>
            </div>
            <p className="text-sm font-mono text-primary uppercase">
              {flight.icao24}
            </p>
          </div>

          <div className="bg-secondary/50 rounded-lg p-3 border border-border">
            <div className="text-muted-foreground mb-1">
              <span className="text-xs">Heading</span>
            </div>
            <p className="text-lg font-semibold text-primary">
              {flight.true_track ? `${Math.round(flight.true_track)}°` : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FlightInfo;
