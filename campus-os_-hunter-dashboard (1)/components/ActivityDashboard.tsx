
import React, { useState, useEffect, useRef } from 'react';
import { Dumbbell, BookOpen, MapPin, Zap, UserPlus, Brain, ArrowUpRight, Crosshair, Wifi, Timer, Camera, Play, Pause } from 'lucide-react';
import GlassCard from './GlassCard';
import { HunterStats, Buff } from '../types';

interface ActivityDashboardProps {
  onStatUpdate: (stat: keyof HunterStats, amount: number) => void;
  onAddBuff: (buff: Buff) => void;
}

const ActivityDashboard: React.FC<ActivityDashboardProps> = ({ onStatUpdate, onAddBuff }) => {
  // --- [STR] Motion Detection State ---
  const [isCapturing, setIsCapturing] = useState(false);
  const [reps, setReps] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isCapturing && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(err => console.error("Camera access denied", err));
        
      const interval = setInterval(() => {
        setReps(prev => {
           if (prev < 40) return prev + 1;
           // If we hit 40, trigger stat update once
           if (prev === 40) {
              onStatUpdate('strength', 1);
              onAddBuff({ id: 'str_buff', name: 'Muscle Pump', type: 'strength', multiplier: 1.1, duration: '1h' });
           }
           return 40;
        });
      }, 3000);
      return () => {
        clearInterval(interval);
        if (videoRef.current?.srcObject) {
          (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        }
      };
    }
  }, [isCapturing, onStatUpdate, onAddBuff]);

  // --- [WIL] Mana Recovery (Meditation) ---
  const [manaTime, setManaTime] = useState(600); // 10 minutes
  const [isMeditating, setIsMeditating] = useState(false);
  
  useEffect(() => {
    let timer: number;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isMeditating) {
        setIsMeditating(false);
        alert("Mana Recovery Paused: Stay focused on the Void.");
      }
    };

    if (isMeditating && manaTime > 0) {
      timer = window.setInterval(() => {
        setManaTime(prev => {
          if (prev <= 1) {
            onStatUpdate('willpower', 2);
            onStatUpdate('karma', 1);
            setIsMeditating(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isMeditating, manaTime, onStatUpdate]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- [SOC] NFC Hunter's Guild ---
  const [nfcStatus, setNfcStatus] = useState<'idle' | 'scanning' | 'success'>('idle');
  const handleNFC = async () => {
    if (!('NDEFReader' in window)) {
      setNfcStatus('scanning');
      setTimeout(() => {
        setNfcStatus('success');
        onStatUpdate('social', 2);
        onAddBuff({ id: 'party_buff', name: 'Party Synergy', type: 'social', multiplier: 1.5, duration: '2h' });
      }, 2000);
      return;
    }
    try {
      setNfcStatus('scanning');
      // @ts-ignore - Web NFC API
      const reader = new NDEFReader();
      await reader.scan();
      reader.onreading = (event: any) => {
        setNfcStatus('success');
        onStatUpdate('social', 3);
      };
    } catch (error) {
      console.error("NFC Error", error);
      setNfcStatus('idle');
    }
  };

  // --- Geofencing State ---
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [nearestZone, setNearestZone] = useState("DORM_BLOCK_A");

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        const distToLib = Math.random(); 
        if (distToLib < 0.2) setNearestZone("Main Library 2F");
        else setNearestZone("DORM_BLOCK_A");
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <div className="flex flex-col gap-8 w-full animate-[fadeInUp_0.8s_ease-out_0.2s_both]">
      <div className="flex items-center gap-4">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
          <h2 className="text-sm font-mono font-bold text-blue-400 tracking-[0.3em] uppercase">Sovereign System // Live Node</h2>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-blue-400/30 to-transparent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* [STR] PHYSICAL DUNGEON */}
          <GlassCard className="p-5 flex flex-col justify-between group h-64 overflow-hidden" glowColor="red" variant="tech">
            <div className="flex justify-between items-start z-10">
              <div className="flex items-center gap-2 text-red-500">
                <Dumbbell className="w-5 h-5" />
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase">[STR] PHYSICAL DUNGEON</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{reps}/40 REPS</div>
            </div>
            
            <div className="relative flex-1 my-2 flex items-center justify-center">
              {isCapturing ? (
                <div className="absolute inset-0 rounded-lg overflow-hidden bg-black border border-red-500/30">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-60" />
                  <div className="absolute top-2 left-2 flex items-center gap-1 text-[8px] text-red-400 font-mono">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                    LIVE_POS_TRACKING
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <h3 className="text-lg font-display font-bold text-slate-800">Hypertrophy Session</h3>
                  <p className="text-xs text-slate-500 font-medium">Complete reps to increase Strength stat permanent.</p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center z-10">
               <button 
                onClick={() => setIsCapturing(!isCapturing)}
                className={`flex items-center gap-2 text-[10px] font-bold px-3 py-1 rounded transition-all ${isCapturing ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-red-600 hover:bg-red-50'}`}
               >
                  <Camera className="w-3.5 h-3.5" />
                  {isCapturing ? 'STOP TRACKING' : 'START DETECTION'}
               </button>
               <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${(reps / 40) * 100}%` }} />
               </div>
            </div>
          </GlassCard>

          {/* [WIL] MANA RECOVERY */}
          <GlassCard className="p-5 flex flex-col justify-between group h-64" glowColor="violet" variant="tech">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-violet-500">
                <Brain className="w-5 h-5" />
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase">[WIL] MANA RECOVERY</span>
              </div>
              <div className={`text-[10px] font-mono px-2 py-0.5 rounded ${isMeditating ? 'text-violet-500 bg-violet-50 animate-pulse' : 'text-slate-400 bg-slate-100'}`}>
                {isMeditating ? 'RECOVERING' : 'STDBY'}
              </div>
            </div>
            
            <div className="my-2 text-center">
              <div className="text-4xl font-mono font-bold text-slate-800 mb-1">{formatTime(manaTime)}</div>
              <p className="text-xs text-slate-500 font-medium">Mana spent on focus grants permanent WIL increase.</p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
               <span className="text-[9px] font-mono text-slate-400 uppercase flex items-center gap-1">
                  <Timer className="w-3 h-3" /> {isMeditating ? 'ACTIVE_PROTOCOL' : 'PROTOCOL_HALTED'}
               </span>
               <button 
                onClick={() => setIsMeditating(!isMeditating)}
                className="bg-violet-600 text-white text-[10px] px-4 py-1.5 rounded font-bold shadow-lg shadow-violet-500/20 flex items-center gap-2 active:scale-95 transition-all"
               >
                  {isMeditating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  {isMeditating ? 'PAUSE ZEN' : 'ENTER ZONE'}
               </button>
            </div>
          </GlassCard>

          {/* [INT] ARCANE KNOWLEDGE */}
          <GlassCard className="p-5 flex flex-col justify-between group h-64" glowColor="blue" variant="tech">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-blue-500">
                <BookOpen className="w-5 h-5" />
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase">[INT] ARCANE KNOWLEDGE</span>
              </div>
              <div className="text-[10px] font-mono text-blue-500 bg-blue-50 px-2 py-0.5 rounded">45% COMPLETE</div>
            </div>
            
            <div className="my-2 bg-slate-900 rounded-lg aspect-video flex items-center justify-center relative overflow-hidden group/vid">
               <img src="https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover opacity-40 group-hover/vid:scale-110 transition-transform duration-700" alt="Video Thumbnail" />
               <Play className="w-8 h-8 text-white absolute cursor-pointer hover:scale-125 transition-transform" />
               <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div className="h-full bg-blue-500 w-[45%]" />
               </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
               <h3 className="text-xs font-display font-bold text-slate-800">Algorithms 101</h3>
               <button 
                 onClick={() => onStatUpdate('intelligence', 1)}
                 className="bg-blue-600 text-white text-[9px] px-3 py-1 rounded-sm font-bold shadow-lg shadow-blue-500/20"
               >
                RESUME MODULE
               </button>
            </div>
          </GlassCard>

          {/* [SOC] HUNTER'S GUILD */}
          <GlassCard className="p-5 flex flex-col justify-between group h-64" glowColor="blue" variant="tech">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-emerald-500">
                <UserPlus className="w-5 h-5" />
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase">[SOC] HUNTER'S GUILD</span>
              </div>
              <div className={`text-[10px] font-mono px-2 py-0.5 rounded ${nfcStatus === 'scanning' ? 'bg-emerald-100 text-emerald-600 animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                {nfcStatus === 'scanning' ? 'SEARCHING' : (nfcStatus === 'success' ? 'CONNECTED' : '0/1 SCANS')}
              </div>
            </div>
            
            <div className="my-2 flex flex-col items-center justify-center flex-1">
              <div className={`w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center transition-all ${nfcStatus === 'scanning' ? 'border-emerald-500 animate-[spin_4s_linear_infinite]' : 'border-slate-300'}`}>
                <Wifi className={`w-8 h-8 ${nfcStatus === 'scanning' ? 'text-emerald-500 animate-pulse' : 'text-slate-300'}`} />
              </div>
              <p className="text-[10px] font-mono text-slate-500 mt-4 text-center">NFC handshake boosts Social and Party Synergy.</p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
               <span className="text-[9px] font-mono text-amber-500 uppercase flex items-center gap-1 font-bold">
                  <Zap className="w-3 h-3" /> SYNERGY PROTOCOL
               </span>
               <button 
                onClick={handleNFC}
                className={`text-[10px] font-bold px-4 py-1.5 rounded transition-all ${nfcStatus === 'success' ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
               >
                {nfcStatus === 'success' ? 'LINK FORMED' : 'OPEN NFC'}
               </button>
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-4">
          <GlassCard className="h-full min-h-[500px] overflow-hidden group" glowColor="blue" variant="tech">
            <div className="absolute inset-0 z-0">
               <img 
                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop" 
                className="w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                alt="Mini Map"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
            </div>

            <div className="relative z-10 p-5 h-full flex flex-col">
               <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2 text-white">
                      <MapPin className="w-5 h-5 text-blue-400" />
                      <h3 className="font-display font-bold tracking-wider text-xl uppercase">Campus Overlay</h3>
                  </div>
                  <div className="bg-blue-500 text-white p-1 rounded cursor-pointer hover:bg-blue-400">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
               </div>

               <div className="flex-1 space-y-3">
                  <MapZoneItem label="Main Library 2F" status="BOSS RAID" color="bg-red-500" isActive={nearestZone === "Main Library 2F"} />
                  <MapZoneItem label="Student Union" status="EVENT" color="bg-amber-500" isActive={nearestZone === "Student Union"} />
                  <MapZoneItem label="The Canteen" status="SAFE ZONE" color="bg-emerald-500" isActive={nearestZone === "The Canteen"} />
                  <MapZoneItem label="DORM_BLOCK_A" status="HOME BASE" color="bg-blue-500" isActive={nearestZone === "DORM_BLOCK_A"} />
               </div>

               <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-white/80">
                      <div className="flex items-center gap-2">
                        <Crosshair className="w-4 h-4 animate-pulse text-blue-400" />
                        <span className="text-[10px] font-mono font-bold tracking-widest uppercase">GPS Telemetry</span>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-mono opacity-60">{coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'SIGNAL_LOST'}</p>
                        <span className="text-[10px] font-mono text-blue-400 font-bold">{nearestZone}</span>
                      </div>
                  </div>
               </div>
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};

const MapZoneItem: React.FC<{ label: string; status: string; color: string; isActive?: boolean }> = ({ label, status, color, isActive }) => (
  <div className={`flex items-center justify-between p-3 backdrop-blur-md border rounded-lg transition-all cursor-pointer ${isActive ? 'bg-white/20 border-white/40 scale-[1.02] shadow-xl' : 'bg-white/10 border-white/10 opacity-70 hover:opacity-100 hover:bg-white/15'}`}>
    <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${color} ${status === 'BOSS RAID' || isActive ? 'animate-pulse scale-125' : ''}`} />
        <span className={`text-xs font-bold tracking-wide ${isActive ? 'text-white' : 'text-white/80'}`}>{label}</span>
    </div>
    <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded ${color} text-white`}>{status}</span>
  </div>
);

export default ActivityDashboard;
