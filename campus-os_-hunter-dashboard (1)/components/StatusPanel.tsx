
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Fingerprint, Zap, Activity, Brain, ShieldAlert, Network } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import GlassCard from './GlassCard';
import { HunterProfile } from '../types';

interface StatusPanelProps {
  profile: HunterProfile;
  mobile?: boolean;
}

const StatusPanel: React.FC<StatusPanelProps> = ({ profile, mobile = false }) => {
  const [xpWidth, setXpWidth] = useState(0);
  const [manaWidth, setManaWidth] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  // Simulated Performance Graph Data
  const performanceData = useMemo(() => [
    { value: 40 }, { value: 45 }, { value: 42 }, { value: 50 },
    { value: 65 }, { value: 60 }, { value: 75 }, { value: 85 },
    { value: 80 }, { value: 95 }, { value: 92 }, { value: 98 }
  ], []);

  useEffect(() => {
    // Staggered bar animations
    const xpTarget = (profile.exp / profile.maxExp) * 100;
    const manaTarget = (profile.stats.willpower / 100) * 100;

    setTimeout(() => setXpWidth(xpTarget), 200);
    setTimeout(() => setManaWidth(manaTarget), 600);
  }, [profile.exp, profile.maxExp, profile.stats.willpower]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    });
  };

  const statsList = [
    { label: 'INT', value: profile.stats.intelligence, color: 'text-blue-500' },
    { label: 'STR', value: profile.stats.strength, color: 'text-rose-500' },
    { label: 'SOC', value: profile.stats.social, color: 'text-emerald-500' },
    { label: 'KAR', value: profile.stats.karma, color: 'text-amber-500' },
    { label: 'WIL', value: profile.stats.willpower, color: 'text-indigo-500' },
  ];

  return (
    <div
      className={`flex flex-col gap-4 h-full w-full ${mobile ? 'max-w-none' : 'max-w-[210px]'} animate-[fadeInLeft_0.6s_ease-out]`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
      ref={panelRef}
    >
      <GlassCard variant="tech" className={`flex-1 p-4 flex flex-col ${mobile ? 'min-h-0' : 'min-h-[660px]'} shadow-2xl relative overflow-hidden bg-white/75 group/panel`}>

        {/* --- INTERACTIVE HUD OVERLAYS --- */}
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-500 rounded-full blur-[1px] animate-[float-particle_5s_infinite]"
              style={{
                left: `${(i * 15) % 100}%`,
                top: `${(i * 25) % 100}%`,
                animationDelay: `${i * 0.4}s`,
                transform: `translate(${mousePos.x * (15 + i)}px, ${mousePos.y * (15 + i)}px)`
              }}
            />
          ))}
        </div>

        {/* SCANLINE EFFECT */}
        <div className="absolute inset-0 w-full h-1 bg-blue-400/10 blur-[2px] animate-[scan_8s_linear_infinite] pointer-events-none" />

        <div className={`${mobile ? 'grid grid-cols-2 gap-4' : 'flex flex-col'}`}>

          {/* LEFT COLUMN (On Mobile) */}
          <div className={`${mobile ? 'col-span-1' : ''}`}>
            {/* 1. TOP ID HEADER */}
            <div className="flex items-center justify-between text-blue-400 mb-6 px-1 relative z-10">
              <div className="flex items-center gap-1.5">
                <Fingerprint className="w-4 h-4" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono tracking-widest font-bold uppercase text-slate-400 mb-1">
                    OPERATIVE_ID
                  </span>
                  <span className="text-xl font-display font-black text-blue-600 tracking-wide drop-shadow-sm">
                    {profile.name}
                  </span>
                </div>
              </div>
              <div className="flex gap-0.5">
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
                <div className="w-1 h-1 bg-blue-200 rounded-full" />
              </div>
            </div>

            {/* 2. RANK & STATUS AREA */}
            <div className="relative flex justify-between items-start mb-6 px-1 z-10">
              <div className="flex flex-col">
                <h1 className="text-[36px] font-display font-black text-[#1e293b] tracking-tighter leading-none">
                  STATUS
                </h1>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="px-1 py-0.5 bg-[#2563eb] text-white text-[7px] font-mono font-bold rounded-sm">
                    ACTIVE
                  </div>
                  <span className="text-[7px] text-slate-400 font-mono tracking-tight font-bold uppercase">
                    STABLE_LINK
                  </span>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <div className="text-[42px] font-display font-black text-[#f59e0b] italic leading-none tracking-tighter">
                  E-
                </div>
                <div className="text-[28px] font-display font-black text-[#f59e0b] italic leading-none -mt-1 tracking-tighter uppercase">
                  TIER
                </div>
                <p className="text-[6px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                  RANKING_ID_004
                </p>
              </div>
            </div>

            {/* 3. BUFF BADGE */}
            <div className="mb-6 px-1 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#fff7ed] border border-[#fed7aa] rounded-lg shadow-sm">
                <Zap className="w-3.5 h-3.5 text-[#f97316] fill-[#f97316] animate-pulse" />
                <span className="text-[9px] font-bold text-[#ea580c] uppercase font-mono tracking-widest">
                  COFFEE SURGE
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (On Mobile) */}
          <div className={`${mobile ? 'col-span-1' : ''}`}>

            {/* 4. SYNC STABILITY GRAPH (NEW SECTION) */}
            <div className={`relative h-24 mb-6 mx-1 z-10 group/graph ${mobile ? 'hidden sm:block' : ''}`}>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05]">
                <div className="w-full h-full border border-slate-900 rounded-full animate-spin-slow" />
                <div className="absolute inset-4 border border-dashed border-slate-900 rounded-full animate-spin-reverse" />
              </div>

              <div className="absolute top-0 left-0 text-[7px] font-mono text-slate-400 tracking-tighter uppercase font-bold">
                Sync_Stability.Log
              </div>
              <div className="absolute top-0 right-0 text-[7px] font-mono text-blue-500 font-bold">
                98.4%_NOMINAL
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVal)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>

              <div className="mt-1 flex justify-between items-center opacity-40">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <div key={i} className="w-2 h-[2px] bg-blue-500" />)}
                </div>
                <Network className="w-2 h-2 text-blue-500" />
              </div>
            </div>

            {/* 5. STATS GRID */}
            <div className="space-y-4 mb-6 px-1 z-10">
              <div className={`grid ${mobile ? 'grid-cols-5' : 'grid-cols-5'} gap-1.5`}>
                {statsList.map(stat => (
                  <div key={stat.label} className="flex flex-col items-center">
                    <span className="text-[8px] font-mono font-bold text-slate-400 mb-1.5">{stat.label}</span>
                    <span className={`text-[14px] font-display font-black leading-none mb-1.5 ${stat.color}`}>{stat.value}</span>
                    <div className="w-full h-[4px] bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-current rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${stat.value}%`, color: stat.color.includes('blue') ? '#3b82f6' : stat.color.includes('rose') ? '#f43f5e' : stat.color.includes('emerald') ? '#10b981' : stat.color.includes('amber') ? '#f59e0b' : '#6366f1' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. MANA / ENERGY BAR (NEW SECTION) */}
            <div className="mb-6 px-1 z-10">
              <div className="flex justify-between items-end mb-1.5">
                <div className="flex items-center gap-1">
                  <Brain className="w-3 h-3 text-indigo-500" />
                  <span className="text-[7px] font-mono font-bold text-slate-400 tracking-wider uppercase">MANA_CAPACITY</span>
                </div>
                <span className="text-[9px] font-mono font-bold text-indigo-600">{profile.stats.willpower}%</span>
              </div>
              <div className="h-2 w-full bg-indigo-50 rounded-sm overflow-hidden p-[1.5px] border border-indigo-100/50">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-sm transition-all duration-[1.5s] cubic-bezier(0.2, 0, 0, 1)"
                  style={{ width: `${manaWidth}%` }}
                >
                  <div className="w-full h-full animate-[pulse_2s_infinite] opacity-50 bg-white" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 7. FOOTER LEVEL & XP - Always at bottom */}
        <div className={`w-full mt-auto pt-6 border-t border-slate-100 relative z-10 ${mobile ? 'col-span-2' : ''}`}>
          <div className="flex items-center gap-3">
            {/* Level Tile */}
            <div className="w-14 h-14 rounded-2xl bg-[#0f172a] flex flex-col items-center justify-center text-white shadow-xl relative overflow-hidden shrink-0">
              <span className="text-[7px] font-mono font-bold text-blue-400 absolute top-2">LVL</span>
              <span className="text-2xl font-display font-black mt-1">{profile.level}</span>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
            </div>

            {/* Info and XP Progress */}
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex justify-between items-end mb-1">
                <div>
                  <p className="text-[7px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">CURRENT_LVL</p>
                  <p className="text-[10px] font-display font-black text-[#1e293b] uppercase leading-none">ELITE OPERATIVE</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold text-slate-700">{profile.exp}</span>
                  <span className="text-[8px] font-mono text-slate-400 font-bold ml-1">/ {profile.maxExp}</span>
                </div>
              </div>

              {/* XP Bar */}
              <div className="h-[7px] w-full bg-slate-100 rounded-full mt-1 overflow-hidden shadow-inner p-[1px]">
                <div
                  className="h-full bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] rounded-full transition-all duration-[1.2s] cubic-bezier(0.34, 1.56, 0.64, 1)"
                  style={{ width: `${xpWidth}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* HUD TICKS */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-0.5 h-8 bg-slate-200 rounded-r-full" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-0.5 h-8 bg-slate-200 rounded-l-full" />

      </GlassCard>

      <style>{`
        @keyframes float-particle {
          0%, 100% { transform: translate(0, 0); opacity: 0; }
          20% { opacity: 0.6; }
          80% { opacity: 0.6; }
          100% { transform: translate(15px, -30px); opacity: 0; }
        }
        @keyframes scan {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(1000%); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default StatusPanel;
