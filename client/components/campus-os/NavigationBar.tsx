
import React from 'react';
import { Home, Map, Backpack, Rss, User } from 'lucide-react';
import { Card } from "@/components/ui/card";

interface NavigationBarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ activePage, onNavigate }) => {
  const navItems = [
    { icon: Home, label: 'HUB', id: 'home' },
    { icon: User, label: 'PROFILE', id: 'profile' },
    { icon: Map, label: 'MAP', id: 'map' },
    { icon: Rss, label: 'FEED', id: 'chronicle' },
    { icon: Backpack, label: 'VAULT', id: 'vault' },
  ];

  return (
    <div className="w-full flex justify-center">
      <Card className="px-8 py-4 flex items-center bg-card shadow-2xl border-border relative rounded-full">
        {/* Central Horizontal Connection Line */}
        <div className="absolute left-[60px] right-[60px] top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-primary/50 via-border to-primary/50 z-0" />

        <div className="flex flex-row gap-8 sm:gap-12 items-center relative z-10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  relative group flex flex-col items-center justify-center transition-all duration-300 ease-out
                  active:scale-95
                  ${isActive ? 'w-16 h-16' : 'w-10 h-10'}
                `}
              >
                {/* Active Box Background */}
                {isActive && (
                  <div className="absolute inset-0 bg-primary/10 rounded-2xl border border-primary/20 flex flex-col items-center justify-center animate-[scaleIn_0.3s_ease-out]">
                    <Icon className="w-6 h-6 text-primary mb-1" strokeWidth={2.5} />
                    <span className="text-[8px] font-bold tracking-[0.2em] text-primary font-mono">
                      {item.label}
                    </span>
                  </div>
                )}

                {/* Inactive Icon */}
                {!isActive && (
                  <div className="relative flex items-center justify-center">
                    <Icon
                      className="w-6 h-6 text-muted-foreground transition-all duration-300 group-hover:text-foreground group-hover:scale-110"
                      strokeWidth={2}
                    />
                    {/* Hover Label (Top positioned for horizontal bar) */}
                    <span className="absolute -top-10 opacity-0 group-hover:opacity-100 translate-y-[10px] group-hover:translate-y-0 transition-all duration-300 text-[9px] font-bold font-mono text-popover-foreground bg-popover px-2 py-1 rounded shadow-sm whitespace-nowrap">
                      {item.label}
                    </span>
                  </div>
                )}

                {/* Active Connection Point */}
                {isActive && (
                  <div className="absolute -bottom-2 w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-sm z-20" />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default NavigationBar;
