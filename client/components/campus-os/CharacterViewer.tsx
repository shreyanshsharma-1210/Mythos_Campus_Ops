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
        <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-[100vh] bg-primary shadow-lg animate-pulse" />
      </div>

      {/* --- CHARACTER MODEL --- */}
      <div className={`
        relative h-[65vh] lg:h-[75vh] w-full flex items-center justify-center z-10 group transition-all duration-500 ease-in-out
        ${isTransitioning ? 'opacity-0 scale-95 blur-md translate-y-10' : 'opacity-100 scale-100 blur-0 translate-y-0'}
      `}>

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
      </div>

      {/* --- AR INTERFACE FLOATING WIDGETS --- */}

      {/* Widget: Weapon */}
      <div className="absolute top-[22%] right-[8%] lg:right-[15%] hidden sm:flex items-center gap-3 animate-[fadeInRight_1.2s_ease-out_0.5s_both]">
        <div className="h-[1px] w-14 bg-gradient-to-l from-primary/50 to-transparent opacity-40" />
        <div className="bg-card border border-border p-3 rounded-xl text-right shadow-sm">
          <div className="flex items-center justify-end gap-1.5 text-primary mb-0.5">
            <span className="text-[8px] font-mono tracking-[0.2em] font-bold opacity-60">WEAPON_X</span>
            <Target className="w-3.5 h-3.5" />
          </div>
          <div className="text-base font-bold font-display text-foreground tracking-wide">
            SHADOW BLADE <span className="text-[9px] text-green-600">+12</span>
          </div>
        </div>
      </div>

      {/* Widget: Armor */}
      <div className="absolute top-[48%] left-[8%] lg:left-[15%] hidden sm:flex items-center gap-3 animate-[fadeInLeft_1.2s_ease-out_0.7s_both]">
        <div className="bg-card border border-border p-3 rounded-xl shadow-sm">
          <div className="flex items-center gap-1.5 text-primary mb-0.5">
            <Shield className="w-3.5 h-3.5" />
            <span className="text-[8px] font-mono tracking-[0.2em] font-bold opacity-60">ARMOR_ST</span>
          </div>
          <div className="text-base font-bold font-display text-foreground tracking-wide">LIGHT TRENCH</div>
        </div>
        <div className="h-[1px] w-14 bg-gradient-to-r from-primary/50 to-transparent opacity-40" />
      </div>

      {/* Model Toggle Button */}
      <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 z-30">
        <button
          onClick={toggleModel}
          className="flex items-center gap-2 px-6 py-3 bg-primary rounded-full text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-md group border border-border"
        >
          <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
          <span className="text-xs font-bold tracking-wider font-display uppercase">SWITCH AVATAR</span>
        </button>
      </div>

      {/* Stylized Crosshair HUD - Reduced Size */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03]">
        <div className="w-[55vh] h-[55vh] border border-foreground rounded-full flex items-center justify-center relative">
          <div className="absolute top-0 w-[1px] h-4 bg-foreground" />
          <div className="absolute bottom-0 w-[1px] h-4 bg-foreground" />
          <div className="absolute left-0 w-4 h-[1px] bg-foreground" />
          <div className="absolute right-0 w-4 h-[1px] bg-foreground" />

          <div className="absolute inset-[12%] border-t border-r border-foreground rounded-full animate-spin-slow" />
          <div className="absolute inset-[18%] border-b border-l border-foreground rounded-full animate-spin-reverse" />
        </div>
      </div>

    </div>
  );
};

export default CharacterViewer;