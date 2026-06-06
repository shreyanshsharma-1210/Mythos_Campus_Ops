
import React, { useState, useEffect, useRef } from 'react';
import { Dumbbell, BookOpen, MapPin, Zap, UserPlus, Brain, ArrowUpRight, Crosshair, Wifi, Timer, Camera, Play, Pause, Code, Check, X, Star } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import CampusMap from './CampusMap';
import { HunterStats, Buff } from '../../types/campus-os';

interface ActivityDashboardProps {
  onStatUpdate: (stat: keyof HunterStats, amount: number) => void;
  onAddBuff: (buff: Buff) => void;
}

const ActivityDashboard: React.FC<ActivityDashboardProps> = ({ onStatUpdate, onAddBuff }) => {
  // --- Daily Quests State ---
  const [selectedDailyQuest, setSelectedDailyQuest] = useState<any>(null);

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
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
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
        <div className="h-[1px] flex-1 bg-border" />
        <h2 className="text-sm font-mono font-bold text-muted-foreground tracking-[0.3em] uppercase">Sovereign System // Live Node</h2>
        <div className="h-[1px] flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* [STR] PHYSICAL DUNGEON */}
          <Card className="flex flex-col justify-between group h-64 overflow-hidden border-border shadow-sm bg-card hover:border-primary/20 transition-colors">
            <CardContent className="p-5 flex flex-col h-full">
              <div className="flex justify-between items-start z-10">
                <div className="flex items-center gap-2 text-destructive">
                  <Dumbbell className="w-5 h-5" />
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase">[STR] PHYSICAL DUNGEON</span>
                </div>
                <div className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-sm">{reps}/40 REPS</div>
              </div>

              <div className="relative flex-1 my-2 flex items-center justify-center">
                {isCapturing ? (
                  <div className="absolute inset-0 rounded-lg overflow-hidden bg-black border border-destructive/30">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-60" />
                    <div className="absolute top-2 left-2 flex items-center gap-1 text-[8px] text-destructive-foreground font-mono bg-destructive/80 px-2 py-1 rounded">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                      LIVE_POS_TRACKING
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <h3 className="text-lg font-display font-bold text-foreground">Hypertrophy Session</h3>
                    <p className="text-xs text-muted-foreground font-medium mt-1">Complete reps to increase Strength stat permanently.</p>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-border flex justify-between items-center z-10">
                <button
                  onClick={() => setIsCapturing(!isCapturing)}
                  className={`flex items-center gap-2 text-[10px] font-bold px-3 py-1.5 rounded-md transition-all ${isCapturing ? 'bg-destructive text-destructive-foreground shadow-sm' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  {isCapturing ? 'STOP TRACKING' : 'START DETECTION'}
                </button>
                <div className="h-1.5 w-24 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-destructive transition-all duration-500" style={{ width: `${(reps / 40) * 100}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* [WIL] MANA RECOVERY */}
          <Card className="flex flex-col justify-between group h-64 border-border shadow-sm bg-card hover:border-primary/20 transition-colors">
            <CardContent className="p-5 flex flex-col h-full">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Brain className="w-5 h-5" />
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase">[WIL] MANA RECOVERY</span>
                </div>
                <div className={`text-[10px] font-mono px-2 py-0.5 rounded-sm ${isMeditating ? 'text-indigo-700 bg-indigo-100 animate-pulse' : 'text-muted-foreground bg-muted'}`}>
                  {isMeditating ? 'RECOVERING' : 'STDBY'}
                </div>
              </div>

              <div className="my-2 text-center flex-1 flex flex-col justify-center">
                <div className="text-4xl font-mono font-bold text-foreground mb-1">{formatTime(manaTime)}</div>
                <p className="text-xs text-muted-foreground font-medium">Mana spent on focus grants permanent WIL increase.</p>
              </div>

              <div className="pt-2 border-t border-border flex justify-between items-center">
                <span className="text-[9px] font-mono text-muted-foreground uppercase flex items-center gap-1 font-bold">
                  <Timer className="w-3 h-3" /> {isMeditating ? 'ACTIVE_PROTOCOL' : 'PROTOCOL_HALTED'}
                </span>
                <button
                  onClick={() => setIsMeditating(!isMeditating)}
                  className={`text-[10px] px-4 py-1.5 rounded-md font-bold shadow-sm flex items-center gap-2 active:scale-95 transition-all ${isMeditating ? 'bg-indigo-600 text-white' : 'bg-primary text-primary-foreground'}`}
                >
                  {isMeditating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  {isMeditating ? 'PAUSE ZEN' : 'ENTER ZONE'}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* [DAILY] CRITICAL QUESTS */}
          <Card className="flex flex-col h-64 relative overflow-hidden group border-border shadow-sm bg-card hover:border-primary/20 transition-colors">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
              <div className="flex items-center gap-2 text-amber-600">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase">DAILY CRITICAL QUESTS</span>
              </div>
              <div className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-sm border border-amber-200">
                5 PENDING
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
              {[
                { id: 'fitness', label: '1. Fitness', icon: Dumbbell, color: 'text-red-500', bg: 'bg-red-500', desc: 'Maintain peak physical condition.' },
                { id: 'mental', label: '2. Mental Wellness', icon: Brain, color: 'text-violet-500', bg: 'bg-violet-500', desc: 'Meditation & Brain Games.' },
                { id: 'reading', label: '3. Reading', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500', desc: 'Read 20 pages/day.' },
                { id: 'hobbies', label: '4. Hobbies', icon: Code, color: 'text-pink-500', bg: 'bg-pink-500', desc: 'Practice your craft.' },
                { id: 'social', label: '5. Social Interaction', icon: UserPlus, color: 'text-emerald-500', bg: 'bg-emerald-500', desc: 'Connect with others.' },
              ].map((quest, i) => (
                <div
                  key={quest.id}
                  onClick={() => setSelectedDailyQuest(quest)}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-all cursor-pointer border border-transparent hover:border-border group/item"
                >
                  <div className={`w-8 h-8 rounded-md ${quest.bg} bg-opacity-10 flex items-center justify-center group-hover/item:scale-110 transition-transform`}>
                    <quest.icon className={`w-4 h-4 ${quest.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-foreground leading-tight">{quest.label}</h4>
                    <p className="text-[10px] text-muted-foreground truncate">{quest.desc}</p>
                  </div>
                  <ArrowUpRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </Card>

          {/* [SOC] HUNTER'S GUILD */}
          <Card className="flex flex-col justify-between group h-64 border-border shadow-sm bg-card hover:border-primary/20 transition-colors">
            <CardContent className="p-5 flex flex-col h-full">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 text-emerald-600">
                  <UserPlus className="w-5 h-5" />
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase">[SOC] HUNTER'S GUILD</span>
                </div>
                <div className={`text-[10px] font-mono px-2 py-0.5 rounded-sm ${nfcStatus === 'scanning' ? 'bg-emerald-100 text-emerald-700 animate-pulse' : 'bg-muted text-muted-foreground'}`}>
                  {nfcStatus === 'scanning' ? 'SEARCHING' : (nfcStatus === 'success' ? 'CONNECTED' : '0/1 SCANS')}
                </div>
              </div>

              <div className="my-2 flex flex-col items-center justify-center flex-1">
                <div className={`w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center transition-all ${nfcStatus === 'scanning' ? 'border-emerald-500 animate-[spin_4s_linear_infinite]' : 'border-border'}`}>
                  <Wifi className={`w-8 h-8 ${nfcStatus === 'scanning' ? 'text-emerald-500 animate-pulse' : 'text-muted-foreground/50'}`} />
                </div>
                <p className="text-[10px] font-mono text-muted-foreground mt-4 text-center">NFC handshake boosts Social and Party Synergy.</p>
              </div>

              <div className="pt-2 border-t border-border flex justify-between items-center">
                <span className="text-[9px] font-mono text-amber-600 uppercase flex items-center gap-1 font-bold">
                  <Zap className="w-3 h-3" /> SYNERGY PROTOCOL
                </span>
                <button
                  onClick={handleNFC}
                  className={`text-[10px] font-bold px-4 py-1.5 rounded-md transition-all ${nfcStatus === 'success' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'}`}
                >
                  {nfcStatus === 'success' ? 'LINK FORMED' : 'OPEN NFC'}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4">
          <CampusMap className="h-full min-h-[500px]" />
        </div>

      </div>

      {/* Quest Detail Modal */}
      {selectedDailyQuest && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className={`p-6 ${selectedDailyQuest.bg} bg-opacity-10 relative border-b border-border`}>
              <button
                onClick={() => setSelectedDailyQuest(null)}
                className="absolute top-4 right-4 p-1 rounded-full bg-background/50 hover:bg-background text-muted-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-2">
                <div className={`w-12 h-12 rounded-lg ${selectedDailyQuest.bg} flex items-center justify-center shadow-sm`}>
                  <selectedDailyQuest.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{selectedDailyQuest.label}</h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm bg-background/60 text-muted-foreground uppercase tracking-wider">
                    CRITICAL PRIORITY
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium opacity-90 leading-relaxed">
                {selectedDailyQuest.desc || "Complete this critical daily task to maintain your streak and boost your stats."}
              </p>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 overflow-y-auto bg-card">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Daily Actions</h4>
              <div className="space-y-3">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/20 hover:bg-muted/50 transition-all cursor-pointer group/check">
                    <div className={`w-5 h-5 rounded-md border border-muted-foreground/30 group-hover/check:border-primary flex items-center justify-center transition-colors mt-0.5`}>
                      <div className="w-2.5 h-2.5 rounded-sm bg-primary opacity-0 group-hover/check:opacity-100 transition-opacity" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground group-hover/check:text-primary">
                        {i === 0 ? "Initial Setup / Prep" : i === 1 ? "Core Activity (Focus Block)" : "Reflection & Logging"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Status: Pending</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rewards Section */}
              <div className="mt-8 p-4 rounded-lg bg-muted/30 border border-border">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Zap className="w-3 h-3 text-amber-500" /> Completion Rewards
                </h4>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background rounded-md border border-border shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-xs font-bold text-foreground">100 XP</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background rounded-md border border-border shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-xs font-bold text-foreground">+1 Streak</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-muted/10 flex gap-3">
              <button className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                onClick={() => {
                  onStatUpdate('willpower', 5);
                  setSelectedDailyQuest(null);
                }}
              >
                Mark Complete
              </button>
              <button
                className="py-3 px-4 rounded-lg bg-secondary text-secondary-foreground font-bold text-sm hover:bg-secondary/80 transition-all font-mono"
                onClick={() => setSelectedDailyQuest(null)}
              >
                CLOSE
              </button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
};



export default ActivityDashboard;
