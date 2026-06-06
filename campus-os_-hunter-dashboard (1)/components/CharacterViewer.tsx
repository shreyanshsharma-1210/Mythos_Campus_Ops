import React, { useState } from 'react';
import '@google/model-viewer';
import { Target, Shield, Zap, Circle, RefreshCw } from 'lucide-react';

const CharacterViewer: React.FC = () => {
  const [currentModel, setCurrentModel] = useState<string>('/models/character.glb');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const toggleModel = () => {
    if (isTransitioning) return;

    // Start Exit Animation
    setIsTransitioning(true);

    setTimeout(() => {
      // Swap Model halfway through
      setCurrentModel(prev => prev === '/models/character.glb' ? '/models/character2.glb' : '/models/character.glb');

      // End Animation (Enter)
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 600); // Wait for exit animation
  };

  return (
    <div className="relative h-full w-full flex items-center justify-center z-0 overflow-visible perspective-[1200px]">

      {/* 1. TELEPORT FLASH OVERLAY (Triggered on switch) */}
      <div
        className={`absolute inset-0 z-50 pointer-events-none transition-opacity duration-300 ease-out ${isTransitioning ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="absolute inset-0 bg-blue-500/20 mix-blend-overlay" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-[100vh] bg-white shadow-[0_0_100px_40px_rgba(59,130,246,0.6)] animate-pulse" />
      </div>

      {/* --- MANA ENERGY CORE (BEHIND CHARACTER) --- */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] sm:w-[450px] sm:h-[450px] pointer-events-none -z-10 preserve-3d transition-all duration-1000 ${isTransitioning ? 'scale-150 brightness-150 rotate-[180deg]' : 'scale-100 rotate-0'}`}>

        {/* Main Summoning Circle Rings - Reduced Scale */}
        <div className="absolute inset-0 border-[2px] border-blue-400/20 rounded-full scale-90 shadow-[0_0_20px_rgba(59,130,246,0.1)]" />

        {/* Outer Glyphs Ring - Tighter */}
        <div className="absolute inset-[-5%] border border-blue-200/10 rounded-full border-dashed animate-spin-slow opacity-40" />

        {/* Inner Fast Ring - Tighter */}
        <div className="absolute inset-[15%] border border-transparent border-l-violet-400/20 border-r-violet-400/20 rounded-full animate-spin-reverse opacity-50" />

        {/* Pulsing Mana Core - Focused */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/5 blur-[40px] rounded-full animate-pulse" />

        {/* Floating Data Nodes - Scaled Down and Inward */}
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <div
            key={deg}
            className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)] opacity-30"
            style={{
              transform: `rotate(${deg}deg) translate(210px) rotate(-${deg}deg)`,
              animation: `pulse-glow 3s infinite ${deg / 100}s`
            }}
          >
            <div className="absolute inset-0 bg-blue-400 animate-ping rounded-full opacity-10" />
          </div>
        ))}

        {/* Concentric Circle HUD (Tilted) - Reduced footprint */}
        <div className="absolute inset-0 border border-white/5 rounded-full rotate-x-[65deg] scale-[1.2] animate-[spin_45s_linear_infinite]" />
      </div>

      {/* --- CHARACTER MODEL --- */}
      <div className={`
        relative h-[65vh] lg:h-[75vh] w-full flex items-center justify-center z-10 group transition-all duration-500 ease-in-out
        ${isTransitioning ? 'opacity-0 scale-95 blur-md translate-y-10 brightness-200' : 'opacity-100 scale-100 blur-0 translate-y-0 animate-float'}
      `}>

        {/* Mana Strings / Energy Streams */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[120%] z-0 overflow-hidden pointer-events-none opacity-30">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute bottom-0 w-[1px] bg-gradient-to-t from-transparent via-blue-400 to-transparent animate-[mana-stream_5s_ease-in-out_infinite]"
              style={{
                left: `${15 + i * 14}%`,
                height: `${50 + Math.random() * 40}%`,
                animationDelay: `${i * 0.4}s`,
                opacity: 0.2 + Math.random() * 0.3
              }}
            />
          ))}
        </div>

        {/* 3D Model Viewer */}
        {/* @ts-ignore */}
        <model-viewer
          src={currentModel}
          camera-controls
          auto-rotate
          shadow-intensity="1"
          exposure="1"
          style={{ width: '100%', height: '100%' }}
          interaction-prompt="none"
          camera-orbit="0deg 90deg 105%"
        >
        </model-viewer>

        {/* Holographic Scanline Overlay */}
        <div className="absolute inset-0 w-full h-[1px] bg-blue-400/30 blur-[1px] animate-scan z-20 pointer-events-none mix-blend-screen" />
      </div>

      {/* --- MANA PARTICLES --- */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-300 rounded-full blur-[0.5px] shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-[mana-orbit_12s_linear_infinite]"
            style={{
              top: `${25 + Math.random() * 50}%`,
              left: `${25 + Math.random() * 50}%`,
              animationDelay: `${-i * 1.5}s`,
              animationDuration: `${10 + Math.random() * 8}s`
            }}
          />
        ))}
      </div>

      {/* --- AR INTERFACE FLOATING WIDGETS --- */}

      {/* Widget: Weapon */}
      <div className="absolute top-[22%] right-[8%] lg:right-[15%] hidden sm:flex items-center gap-3 animate-[fadeInRight_1.2s_ease-out_0.5s_both]">
        <div className="h-[1px] w-14 bg-gradient-to-l from-blue-400 to-transparent opacity-40" />
        <div className="bg-white/5 backdrop-blur-md border border-blue-400/10 p-3 rounded-xl text-right">
          <div className="flex items-center justify-end gap-1.5 text-blue-400 mb-0.5">
            <span className="text-[8px] font-mono tracking-[0.2em] font-bold opacity-60">WEAPON_X</span>
            <Target className="w-3.5 h-3.5" />
          </div>
          <div className="text-base font-bold font-display text-white tracking-wide">
            SHADOW BLADE <span className="text-[9px] text-emerald-400">+12</span>
          </div>
        </div>
      </div>

      {/* Widget: Armor */}
      <div className="absolute top-[48%] left-[8%] lg:left-[15%] hidden sm:flex items-center gap-3 animate-[fadeInLeft_1.2s_ease-out_0.7s_both]">
        <div className="bg-white/5 backdrop-blur-md border border-violet-400/10 p-3 rounded-xl">
          <div className="flex items-center gap-1.5 text-violet-400 mb-0.5">
            <Shield className="w-3.5 h-3.5" />
            <span className="text-[8px] font-mono tracking-[0.2em] font-bold opacity-60">ARMOR_ST</span>
          </div>
          <div className="text-base font-bold font-display text-white tracking-wide">LIGHT TRENCH</div>
        </div>
        <div className="h-[1px] w-14 bg-gradient-to-r from-violet-400 to-transparent opacity-40" />
      </div>

      {/* Model Toggle Button */}
      <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 z-30 animate-bounce">
        <button
          onClick={toggleModel}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-all shadow-lg hover:shadow-blue-500/20 group"
        >
          <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
          <span className="text-xs font-mono font-bold tracking-wider">SWITCH AVATAR</span>
        </button>
      </div>

      {/* Stylized Crosshair HUD - Reduced Size */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
        <div className="w-[55vh] h-[55vh] border border-white/5 rounded-full flex items-center justify-center relative">
          <div className="absolute top-0 w-[1px] h-4 bg-white/30" />
          <div className="absolute bottom-0 w-[1px] h-4 bg-white/30" />
          <div className="absolute left-0 w-4 h-[1px] bg-white/30" />
          <div className="absolute right-0 w-4 h-[1px] bg-white/30" />

          <div className="absolute inset-[12%] border-t border-r border-blue-400/15 rounded-full animate-spin-slow" />
          <div className="absolute inset-[18%] border-b border-l border-violet-400/15 rounded-full animate-spin-reverse" />
        </div>
      </div>

      <style>{`
        @keyframes mana-stream {
          0% { transform: translateY(0); opacity: 0; }
          20% { opacity: 0.4; }
          80% { opacity: 0.4; }
          100% { transform: translateY(-250px); opacity: 0; }
        }
        @keyframes mana-orbit {
          0% { transform: rotate(0deg) translateX(120px) rotate(0deg); opacity: 0.1; }
          50% { opacity: 0.8; transform: rotate(180deg) translateX(140px) rotate(-180deg); }
          100% { transform: rotate(360deg) translateX(120px) rotate(-360deg); opacity: 0.1; }
        }
      `}</style>
    </div>
  );
};

export default CharacterViewer;