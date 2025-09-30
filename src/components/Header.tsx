import { Plane } from 'lucide-react';

const Header = () => {
  return (
    <header className="absolute top-0 left-0 right-0 z-[1000] bg-gradient-to-b from-background/80 to-transparent backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/50">
            <Plane className="w-7 h-7 text-background rotate-45" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AeroScope
            </h1>
            <p className="text-xs text-muted-foreground">Real-time Flight Tracking</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
