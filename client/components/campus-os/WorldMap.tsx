import React from 'react';
import { MapPin, Zap, AlertOctagon, User } from 'lucide-react';

const WorldMap: React.FC = () => {
  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/40 shadow-2xl bg-slate-900 group">
      
      {/* Simulated Camera Feed Background */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1920&auto=format&fit=crop" 
          alt="Campus AR Feed" 
          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-[10s]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
      </div>

      {/* AR Overlay UI */}
      <div className="absolute inset-0 pointer-events-none">
          {/* Compass/Heading */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-4 opacity-70">
              {['NW', 'N', 'NE'].map(dir => (
                  <span key={dir} className="text-white font-mono text-xs font-bold">{dir}</span>
              ))}
          </div>

          {/* Dungeon Gate: Library */}
          <div className="absolute top-[30%] left-[20%] animate-float">
             <div className="relative flex flex-col items-center">
                <div className="w-16 h-24 bg-blue-500/20 backdrop-blur-md border border-blue-400 rounded-t-full shadow-[0_0_30px_rgba(59,130,246,0.4)] animate-pulse-glow flex items-center justify-center">
                    <div className="w-full h-full absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.5),transparent)] animate-spin-slow opacity-50" />
                </div>
                <div className="mt-2 bg-slate-900/80 backdrop-blur text-white px-3 py-1 rounded text-xs font-mono border border-blue-500/50">
                    GATE: LIBRARY
                </div>
             </div>
          </div>

          {/* Resource Zone: Gym (Golden Aura) */}
          <div className="absolute top-[40%] right-[25%] animate-float" style={{ animationDelay: '1s' }}>
             <div className="relative flex flex-col items-center">
                <div className="w-2 h-32 bg-gradient-to-t from-amber-400 to-transparent opacity-60 blur-md" />
                <div className="absolute bottom-0 w-12 h-4 bg-amber-400 rounded-[100%] blur-md opacity-50" />
                <div className="mt-2 bg-slate-900/80 backdrop-blur text-amber-400 px-3 py-1 rounded text-xs font-mono border border-amber-500/50 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> STR BUFF ZONE
                </div>
             </div>
          </div>

          {/* Community Rift: Anomaly */}
          <div className="absolute bottom-[30%] left-[40%] animate-float" style={{ animationDelay: '2s' }}>
             <div className="relative flex flex-col items-center group-hover:scale-110 transition-transform cursor-pointer pointer-events-auto">
                 {/* Glitchy visual */}
                <div className="w-12 h-12 bg-red-500/20 backdrop-blur-sm border-2 border-red-500/60 rotate-45 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse">
                    <AlertOctagon className="w-6 h-6 text-red-500 animate-spin-reverse" />
                </div>
                <button className="mt-4 bg-red-600/90 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold font-display shadow-lg border border-red-400 pointer-events-auto transition-colors">
                    FIX ANOMALY
                </button>
             </div>
          </div>

          {/* Player Tag */}
          <div className="absolute bottom-[20%] right-[10%] opacity-90 animate-[fadeIn_2s_ease-out]">
             <div className="flex flex-col items-center">
                <div className="bg-slate-900/80 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-mono border border-emerald-500/30 mb-1">
                    Lv. 42
                </div>
                <User className="w-8 h-8 text-white drop-shadow-lg" />
                <span className="text-white text-xs font-bold shadow-black drop-shadow-md">Senior Hunter</span>
             </div>
          </div>
      </div>
      
      {/* Overlay Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,99,0.1)_1px,transparent_1px)] bg-[size:100%_3px] pointer-events-none" />
    </div>
  );
};

export default WorldMap;