
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fingerprint, Zap, Activity, Brain, ShieldAlert, Network } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

import { Card, CardContent } from "@/components/ui/card";
import { HunterProfile } from '../../types/campus-os';

interface StatusPanelProps {
  profile: HunterProfile;
  mobile?: boolean;
}

const StatusPanel: React.FC<StatusPanelProps> = ({ profile, mobile = false }) => {
  const navigate = useNavigate();
  const [xpWidth, setXpWidth] = useState(0);
  const [manaWidth, setManaWidth] = useState(0);

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

  const statsList = [
    { label: 'INT', value: profile.stats.intelligence, color: 'text-blue-600' },
    { label: 'STR', value: profile.stats.strength, color: 'text-rose-600' },
    { label: 'SOC', value: profile.stats.social, color: 'text-emerald-600' },
    { label: 'KAR', value: profile.stats.karma, color: 'text-amber-600' },
    { label: 'WIL', value: profile.stats.willpower, color: 'text-indigo-600' },
  ];

  return (
    <div
      className={`flex flex-col gap-4 h-full w-full ${mobile ? 'max-w-none' : 'max-w-[210px]'} animate-[fadeInLeft_0.6s_ease-out]`}
    >
      <Card className={`flex-1 p-0 flex flex-col ${mobile ? 'min-h-0' : 'min-h-[660px]'} shadow-sm relative overflow-hidden group/panel border-border`}>
        <CardContent className="p-4 flex flex-col h-full">


        <div className={`${mobile ? 'grid grid-cols-2 gap-4' : 'flex flex-col'}`}>

          {/* LEFT COLUMN (On Mobile) */}
          <div className={`${mobile ? 'col-span-1' : ''}`}>
            {/* 1. TOP ID HEADER */}
            <div className="flex items-center justify-between text-blue-400 mb-6 px-1 relative z-10">
              <div className="flex items-center gap-1.5">
                <Fingerprint className="w-4 h-4" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono tracking-widest font-bold uppercase text-muted-foreground mb-1">
                    USER_ID
                  </span>
                  <span className="text-xl font-display font-black text-primary tracking-wide drop-shadow-sm">
                    {profile.name}
                  </span>
                </div>
              </div>
              <div className="flex gap-0.5">
                <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                <div className="w-1 h-1 bg-primary/40 rounded-full" />
              </div>
            </div>

            {/* 2. RANK & STATUS AREA */}
            <div
              onClick={() => navigate('/dashboard2/achievements')}
              className="relative flex justify-between items-start mb-6 px-1 z-10 cursor-pointer group/status hover:opacity-80 transition-opacity"
            >
              <div className="flex flex-col">
                <h1 className="text-[36px] font-display font-black text-foreground tracking-tighter leading-none group-hover/status:text-primary transition-colors">
                  STATUS
                </h1>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="px-1 py-0.5 bg-primary text-primary-foreground text-[7px] font-mono font-bold rounded-sm">
                    ACTIVE
                  </div>
                  <span className="text-[7px] text-slate-400 font-mono tracking-tight font-bold uppercase">
                    STABLE_LINK
                  </span>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <div className="text-[42px] font-display font-black text-amber-500 italic leading-none tracking-tighter">
                  E-
                </div>
                <div className="text-[28px] font-display font-black text-amber-500 italic leading-none -mt-1 tracking-tighter uppercase">
                  TIER
                </div>
                <p className="text-[6px] font-mono text-muted-foreground uppercase tracking-widest font-bold">
                  RANKING_ID_004
                </p>
              </div>
            </div>

            {/* 3. BUFF BADGE */}
            <div className="mb-6 px-1 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg shadow-sm">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
                <span className="text-[9px] font-bold text-amber-600 uppercase font-mono tracking-widest">
                  ACTIVE SYNERGY
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

              <div className="absolute top-0 left-0 text-[7px] font-mono text-muted-foreground tracking-tighter uppercase font-bold">
                Performance_Index
              </div>
              <div className="absolute top-0 right-0 text-[7px] font-mono text-primary font-bold">
                98.4%_NOMINAL
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorVal)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>

              <div className="mt-1 flex justify-between items-center opacity-40">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <div key={i} className="w-2 h-[2px] bg-primary" />)}
                </div>
                <Network className="w-2 h-2 text-primary" />
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
            <div className="w-14 h-14 rounded-2xl bg-slate-900 flex flex-col items-center justify-center text-white shadow-xl relative overflow-hidden shrink-0">
              <span className="text-[7px] font-mono font-bold text-slate-400 absolute top-2">LVL</span>
              <span className="text-2xl font-display font-black mt-1">{profile.level}</span>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
            </div>

            {/* Info and XP Progress */}
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex justify-between items-end mb-1">
                <div>
                  <p className="text-[7px] font-mono font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">CURRENT_LVL</p>
                  <p className="text-[10px] font-display font-black text-foreground uppercase leading-none">ELITE OPERATIVE</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold text-foreground">{profile.exp}</span>
                  <span className="text-[8px] font-mono text-muted-foreground font-bold ml-1">/ {profile.maxExp}</span>
                </div>
              </div>

              {/* XP Bar */}
              <div className="h-[7px] w-full bg-secondary rounded-full mt-1 overflow-hidden shadow-inner p-[1px]">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-[1.2s] cubic-bezier(0.34, 1.56, 0.64, 1)"
                  style={{ width: `${xpWidth}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default StatusPanel;
