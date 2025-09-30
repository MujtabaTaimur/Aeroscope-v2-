import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { Card } from './ui/card';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar = ({ value, onChange }: SearchBarProps) => {
  return (
    <Card className="absolute top-4 left-4 w-80 bg-card/95 backdrop-blur-md border-2 border-primary/30 shadow-2xl z-[1000]">
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by callsign or country..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pl-10 bg-secondary/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>
    </Card>
  );
};

export default SearchBar;
