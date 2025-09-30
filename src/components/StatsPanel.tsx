import { Plane, Globe, Activity } from 'lucide-react';
import { Card } from './ui/card';

interface StatsPanelProps {
  totalFlights: number;
  isLoading: boolean;
}

const StatsPanel = ({ totalFlights, isLoading }: StatsPanelProps) => {
  return (
    <Card className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-md border-2 border-primary/30 shadow-2xl z-[1000]">
      <div className="p-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <Plane className="w-6 h-6 text-primary animate-pulse-glow" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tracked Flights</p>
              <p className="text-2xl font-bold text-primary">
                {isLoading ? '...' : totalFlights.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="h-12 w-px bg-border" />

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Coverage</p>
              <p className="text-xl font-bold text-primary">Global</p>
            </div>
          </div>

          <div className="h-12 w-px bg-border" />

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-xl font-bold text-green-500">Live</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatsPanel;
