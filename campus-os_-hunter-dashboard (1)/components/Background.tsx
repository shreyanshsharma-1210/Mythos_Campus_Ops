
import React, { useMemo, useEffect, useState } from 'react';

const Background: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized coordinates (-0.5 to 0.5)
      setMousePos({
        x: (e.clientX / window.innerWidth) - 0.5,
        y: (e.clientY / window.innerHeight) - 0.5,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Generate random particles
  const particles = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 15}s`,
      duration: `${15 + Math.random() * 20}s`,
      size: Math.random() > 0.8 ? 'w-1.5 h-1.5' : 'w-0.5 h-0.5',
      color: Math.random() > 0.7 ? 'bg-blue-600' : (Math.random() > 0.4 ? 'bg-violet-600' : 'bg-emerald-600'),
      opacity: 0.1 + Math.random() * 0.3
    }));
  }, []);

  // Generate background data streams
  const dataStreams = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: `${(i * 10) + Math.random() * 5}%`,
      duration: `${10 + Math.random() * 20}s`,
      delay: `${Math.random() * 5}s`,
      opacity: 0.05 + Math.random() * 0.1
    }));
  }, []);

  return (
    <div className="fixed inset-0 -z-10 w-full h-full bg-white overflow-hidden perspective-[1500px]">
      
      {/* --- MOUSE PARALLAX LAYERS --- */}
      
      {/* Layer 1: Deep Nebula (Adapted for Light Mode) */}
      <div 
        className="absolute inset-[-10%] transition-transform duration-700 ease-out pointer-events-none"
        style={{ transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)` }}
      >
        <div className="absolute top-[10%] left-[10%] w-[50%] h-[50%] bg-blue-400/20 blur-[140px] rounded-full animate-aurora-1 mix-blend-multiply" />
        <div className="absolute bottom-[10%] right-[10%] w-[60%] h-[60%] bg-violet-400/20 blur-[160px] rounded-full animate-aurora-2 mix-blend-multiply" />
        <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-emerald-400/20 blur-[120px] rounded-full animate-aurora-3 mix-blend-multiply" />
      </div>

      {/* Layer 2: Mana Energy Disks (Rotating Background Elements) */}
      <div 
        className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none transition-transform duration-1000 ease-out"
        style={{ transform: `translate(${mousePos.x * -40}px, ${mousePos.y * -40}px) scale(1.1)` }}
      >
          {/* Large Mana Ring */}
          <div className="absolute w-[800px] h-[800px] border-[1px] border-blue-600/20 rounded-full animate-[spin_60s_linear_infinite]" />
          <div className="absolute w-[840px] h-[840px] border-[1px] border-dashed border-blue-500/10 rounded-full animate-[spin_100s_linear_infinite_reverse]" />
          
          {/* Secondary Concentric Rings */}
          <div className="absolute w-[400px] h-[400px] border border-violet-600/10 rounded-full animate-[spin_40s_linear_infinite]" />
          
          {/* Diagonal Mana Flows */}
          <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-blue-600/20 to-transparent rotate-[35deg]" />
          <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-violet-600/20 to-transparent rotate-[-35deg]" />
      </div>

      {/* Layer 3: Grid Floor (High Interactivity) */}
      <div 
        className="absolute bottom-[-60%] left-[-50%] w-[200%] h-[120%] bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:60px_60px] opacity-30 origin-bottom animate-[grid-move_25s_linear_infinite] pointer-events-none"
        style={{ 
          transform: `rotateX(75deg) translate(${mousePos.x * -60}px, ${mousePos.y * -60}px)` 
        }}
      />

      {/* --- DATA STREAMS --- */}
      {dataStreams.map((s) => (
        <div 
          key={s.id}
          className="absolute top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-blue-600/20 to-transparent animate-[data-stream_15s_linear_infinite] pointer-events-none font-mono text-[8px] text-blue-600/30 flex flex-col items-center justify-around whitespace-nowrap"
          style={{
            left: s.left,
            animationDuration: s.duration,
            animationDelay: s.delay,
            opacity: s.opacity
          }}
        >
          {['0xFA', 'SYSTEM', 'NODE_B', 'INT_LINK', '0101', 'AUTH', 'STB', 'SYNC'].map((text, i) => (
            <span key={i} className="rotate-90">{text}</span>
          ))}
        </div>
      ))}
      
      {/* Moving Scanning Beams */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]">
         <div className="absolute top-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-600 to-transparent blur-md animate-[scan-v_12s_linear_infinite]" />
         <div className="absolute top-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-600 to-transparent blur-sm animate-[scan-v_18s_linear_infinite_reverse]" />
      </div>

      {/* Dynamic Floating Particles */}
      {particles.map((p) => (
        <div
            key={p.id}
            className={`absolute bottom-[-20px] rounded-full ${p.size} ${p.color} animate-float-particle blur-[0.5px] pointer-events-none`}
            style={{
                left: p.left,
                animationDelay: p.delay,
                animationDuration: p.duration,
                opacity: p.opacity,
                transform: `translateX(${mousePos.x * 30}px)`
            }}
        />
      ))}

      {/* HUD Corner Accents */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="absolute top-8 left-8 w-24 h-24 text-blue-600" viewBox="0 0 100 100">
           <path d="M0 20 V 0 H 20" fill="none" stroke="currentColor" strokeWidth="1" />
           <circle cx="5" cy="5" r="1.5" fill="currentColor" />
        </svg>
        <svg className="absolute bottom-24 right-8 w-32 h-16 text-violet-600" viewBox="0 0 200 100">
           <path d="M200 80 V 100 H 170" fill="none" stroke="currentColor" strokeWidth="1" />
           <rect x="180" y="85" width="15" height="1.5" fill="currentColor" opacity="0.5" />
        </svg>
      </div>

      <style>{`
        @keyframes aurora-1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.1; }
          33% { transform: translate(8%, 4%) scale(1.05); opacity: 0.14; }
          66% { transform: translate(-4%, 8%) scale(0.95); opacity: 0.08; }
        }
        @keyframes aurora-2 {
          0%, 100% { transform: translate(0, 0) scale(1.05); opacity: 0.11; }
          33% { transform: translate(-8%, -4%) scale(1); opacity: 0.07; }
          66% { transform: translate(4%, -8%) scale(1.15); opacity: 0.14; }
        }
        @keyframes aurora-3 {
          0%, 100% { transform: scale(1); opacity: 0.05; }
          50% { transform: scale(1.2); opacity: 0.09; }
        }
        @keyframes grid-move {
          from { background-position: 0 0; }
          to { background-position: 0 60px; }
        }
        @keyframes scan-v {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
        @keyframes data-stream {
          0% { transform: translateY(-10%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(110%); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Background;
