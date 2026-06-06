import React, { useState } from 'react';
import { Code, Mic, Scroll, Sword, UserPlus, Zap, Network, Lock, X, Award, Cpu, Brain, Wifi } from 'lucide-react';
import GlassCard from './GlassCard';

// Types
interface Item {
  id: number | string;
  name: string;
  type: 'WEAPON' | 'ARMOR' | 'SCROLL' | 'SKILL';
  icon: any;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  description?: string;
  stats?: Record<string, string>;
  date?: string;
  color: string;
  bg: string;
  border: string;
  status?: 'locked' | 'unlocked' | 'mastered';
  prerequisites?: string[];
}

interface Friend {
  id: number;
  imgId: number;
  name: string;
  lvl: number;
}

const InventoryVault: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'skills'>('inventory');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  
  // Social NFC Logic
  const [friends, setFriends] = useState<Friend[]>([
    { id: 1, imgId: 11, name: "Sarah", lvl: 24 },
    { id: 2, imgId: 12, name: "Mike", lvl: 32 },
    { id: 3, imgId: 13, name: "Jin", lvl: 19 },
    { id: 4, imgId: 14, name: "Ana", lvl: 28 },
  ]);
  const [isScanning, setIsScanning] = useState(false);

  // Skill Tree Data with State
  const [skills, setSkills] = useState<Item[]>([
    { id: 'sk1', name: "Core Logic", type: "SKILL", icon: Cpu, status: "mastered", color: "text-blue-400", bg: "bg-blue-500", border: "border-blue-400", description: "Fundamental understanding of binary and logic gates." },
    { id: 'sk2', name: "Algorithms", type: "SKILL", icon: Network, status: "unlocked", color: "text-emerald-400", bg: "bg-emerald-500", border: "border-emerald-400", description: "Pathfinding and sorting mastery.", prerequisites: ["Core Logic"] },
    { id: 'sk3', name: "AI/ML", type: "SKILL", icon: Brain, status: "locked", color: "text-indigo-400", bg: "bg-indigo-500", border: "border-indigo-400", description: "Neural network integration.", prerequisites: ["Algorithms"] },
    { id: 'sk4', name: "Web Dev", type: "SKILL", icon: Code, status: "mastered", color: "text-pink-400", bg: "bg-pink-500", border: "border-pink-400", description: "Frontend interface construction.", prerequisites: ["Core Logic"] },
    { id: 'sk5', name: "UX Design", type: "SKILL", icon: Zap, status: "locked", color: "text-violet-400", bg: "bg-violet-500", border: "border-violet-400", description: "User experience optimization protocols.", prerequisites: ["Web Dev"] },
  ]);

  const [justUnlocked, setJustUnlocked] = useState<string | null>(null);

  const handleUnlockSkill = (skill: Item) => {
    if (skill.status !== 'locked') return;
    
    // Check prerequisites (Simple Logic: Assume if clicking, pre-reqs met for demo purpose unless strictly enforced)
    // Real logic would check `skills.find(s => s.name === pre).status === 'mastered' | 'unlocked'`
    
    setJustUnlocked(skill.id as string);
    setTimeout(() => {
        setSkills(prev => prev.map(s => s.id === skill.id ? { ...s, status: 'unlocked' } : s));
        setJustUnlocked(null);
    }, 1000); // Animation duration
  };

  const handleAddFriend = () => {
    setIsScanning(true);
    setTimeout(() => {
      const newFriend = { 
        id: Date.now(), 
        imgId: Math.floor(Math.random() * 50) + 20, 
        name: `Hunter_${Math.floor(Math.random() * 9000)}`, 
        lvl: Math.floor(Math.random() * 50) + 1 
      };
      setFriends(prev => [...prev, newFriend]);
      setIsScanning(false);
    }, 2000);
  };

  // Mock Inventory Data
  const artifacts: Item[] = [
    { 
      id: 1, name: "Python Scripting", type: "WEAPON", icon: Code, rarity: "rare", 
      color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-400/30",
      description: "A versatile blade forged from snake venom. Effective against data serpents.",
      stats: { "Damage": "45 INT", "Speed": "High" }
    },
    { 
      id: 2, name: "Public Speaking", type: "ARMOR", icon: Mic, rarity: "epic", 
      color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-400/30",
      description: "A glistening chestplate that deflects social anxiety attacks.",
      stats: { "Defense": "60 SOC", "Charisma": "+15" }
    },
    { 
      id: 3, name: "React Mastery", type: "WEAPON", icon: Zap, rarity: "legendary", 
      color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-400/30",
      description: "Legendary lightning imbued gauntlet. Renders UI at hyperspeed.",
      stats: { "Damage": "90 INT", "Efficiency": "Max" }
    },
  ];

  const scrolls: Item[] = [
    { 
      id: 's1', name: "Google Internship", type: "SCROLL", icon: Scroll, date: "Summer 2023",
      color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-400/30",
      description: "An ancient contract verifying the bearer's contribution to the Titans of Search.",
      stats: { "Verified": "True", "Signatory": "Sundar P." }
    },
    { 
      id: 's2', name: "Hackathon Winner", type: "SCROLL", icon: Award, date: "Fall 2024",
      color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-400/30",
      description: "Awarded for exceptional innovation during the 24-hour code siege.",
      stats: { "Rank": "1st Place", "Prize": "1000 XP" }
    },
  ];

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between shrink-0">
         <h2 className="text-2xl font-display font-bold text-slate-700">THE VAULT</h2>
         <div className="flex bg-white/40 backdrop-blur-md rounded-lg p-1 border border-white/40">
            <button 
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1 rounded-md text-[10px] font-bold font-mono transition-all ${activeTab === 'inventory' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-500 hover:bg-white/50'}`}
            >
              INVENTORY
            </button>
            <button 
              onClick={() => setActiveTab('skills')}
              className={`px-3 py-1 rounded-md text-[10px] font-bold font-mono transition-all ${activeTab === 'skills' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:bg-white/50'}`}
            >
              SKILL MATRIX
            </button>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-6 relative">
        
        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div className="flex flex-col gap-6 animate-[fadeIn_0.3s_ease-out]">
            {/* Artifact Grid */}
            <section>
                <div className="flex justify-between items-end mb-3">
                  <h3 className="text-xs font-mono font-bold text-slate-400 flex items-center gap-2">
                      <Sword className="w-3 h-3" /> EQUIPPED ARTIFACTS
                  </h3>
                  <span className="text-[10px] font-mono text-amber-500">POWER: 2,450</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {artifacts.map(item => (
                        <div 
                          key={item.id} 
                          onClick={() => setSelectedItem(item)}
                          className={`
                            group relative aspect-square rounded-xl border ${item.border} ${item.bg} 
                            flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all hover:scale-[1.02] hover:bg-opacity-20 hover:shadow-lg
                          `}
                        >
                            <div className="absolute top-2 right-2 text-[8px] font-mono uppercase opacity-50">{item.type}</div>
                            <item.icon className={`w-8 h-8 ${item.color} mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-transform group-hover:scale-110`} />
                            <p className="text-xs font-bold text-slate-700 text-center px-2 leading-tight">{item.name}</p>
                            <div className={`
                                absolute bottom-0 left-0 right-0 h-1 
                                ${item.rarity === 'legendary' ? 'bg-amber-400' : item.rarity === 'epic' ? 'bg-purple-400' : 'bg-blue-400'}
                                opacity-0 group-hover:opacity-100 transition-opacity
                            `} />
                        </div>
                    ))}
                </div>
            </section>

            {/* Scrolls Section */}
            <section>
                <h3 className="text-xs font-mono font-bold text-slate-400 mb-3 flex items-center gap-2">
                    <Scroll className="w-3 h-3" /> ACHIEVEMENTS & SCROLLS
                </h3>
                <div className="space-y-3">
                    {scrolls.map(scroll => (
                        <GlassCard 
                          key={scroll.id} 
                          className="flex items-center justify-between p-3 hover:bg-amber-50/50 cursor-pointer border-amber-200/30 active:scale-[0.98] transition-all"
                          // @ts-ignore - onClick prop on div inside
                        >
                          <div className="flex items-center gap-3 w-full" onClick={() => setSelectedItem(scroll)}>
                              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center border border-amber-200">
                                  <Scroll className="w-5 h-5 text-amber-600" />
                              </div>
                              <div className="flex-1">
                                  <p className="font-bold text-sm text-slate-800">{scroll.name}</p>
                                  <p className="text-[10px] font-mono text-slate-400">Issued: {scroll.date}</p>
                              </div>
                              <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center">
                                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                              </div>
                          </div>
                        </GlassCard>
                    ))}
                </div>
            </section>

            {/* Social Links */}
            <section>
                <h3 className="text-xs font-mono font-bold text-slate-400 mb-3 flex items-center gap-2">
                    <UserPlus className="w-3 h-3" /> SOCIAL LINKS (NFC)
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-4 px-1 scrollbar-hide">
                    {/* Add Button */}
                    <button 
                      onClick={handleAddFriend}
                      disabled={isScanning}
                      className={`
                        flex-shrink-0 w-14 h-14 rounded-full border-2 border-dashed 
                        ${isScanning ? 'border-emerald-400 animate-pulse bg-emerald-50' : 'border-slate-300 hover:border-blue-400 hover:text-blue-500'}
                        flex items-center justify-center text-slate-400 transition-all active:scale-95
                      `}
                    >
                        {isScanning ? <Wifi className="w-5 h-5 animate-ping text-emerald-500" /> : <UserPlus className="w-5 h-5" />}
                    </button>

                    {friends.map(friend => (
                        <div key={friend.id} className="flex-shrink-0 flex flex-col items-center gap-1 group cursor-pointer animate-[fadeIn_0.5s]">
                            <div className="w-14 h-14 rounded-full border-2 border-emerald-400/30 p-0.5 group-hover:border-emerald-400 transition-colors relative">
                                <img src={`https://i.pravatar.cc/100?img=${friend.imgId}`} alt={friend.name} className="w-full h-full rounded-full object-cover" />
                                <div className="absolute -bottom-1 -right-1 bg-slate-800 text-white text-[8px] px-1.5 rounded-full border border-slate-600 font-mono">
                                  {friend.lvl}
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-600">{friend.name}</span>
                        </div>
                    ))}
                </div>
                {isScanning && <p className="text-center text-[10px] font-mono text-emerald-500 animate-pulse">SEARCHING FOR NEARBY SIGNAL...</p>}
            </section>
          </div>
        )}

        {/* SKILLS TAB - Circular Layout */}
        {activeTab === 'skills' && (
          <div className="relative min-h-[500px] flex items-center justify-center animate-[fadeIn_0.3s_ease-out]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
            
            {/* SVG Connectors */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
               {/* Center to Ring 1 */}
               <line x1="50%" y1="50%" x2="50%" y2="25%" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" /> {/* Top Node */}
               <line x1="50%" y1="50%" x2="50%" y2="75%" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" /> {/* Bottom Node */}
               
               {/* Ring 1 to Ring 2 Top Branch */}
               <path d="M 50% 25% Q 80% 25% 80% 40%" stroke="#cbd5e1" strokeWidth="2" fill="none" />
               
               {/* Ring 1 to Ring 2 Bottom Branch */}
               <path d="M 50% 75% Q 20% 75% 20% 60%" stroke="#cbd5e1" strokeWidth="2" fill="none" />
            </svg>

            {/* Center Node: Core Logic */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
               <SkillNode item={skills[0]} onClick={() => setSelectedItem(skills[0])} />
            </div>

            {/* Ring 1: Web Dev (Top), Algorithms (Bottom) */}
            <div className="absolute top-[25%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
               <SkillNode item={skills[3]} onClick={() => setSelectedItem(skills[3])} onUnlock={handleUnlockSkill} isUnlocking={justUnlocked === skills[3].id} />
            </div>
            <div className="absolute top-[75%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
               <SkillNode item={skills[1]} onClick={() => setSelectedItem(skills[1])} onUnlock={handleUnlockSkill} isUnlocking={justUnlocked === skills[1].id} />
            </div>

            {/* Ring 2: UX Design (Right), AI/ML (Left) */}
            <div className="absolute top-[40%] right-[10%] -translate-y-1/2 z-20">
               <SkillNode item={skills[4]} onClick={() => setSelectedItem(skills[4])} onUnlock={handleUnlockSkill} isUnlocking={justUnlocked === skills[4].id} />
            </div>
             <div className="absolute top-[60%] left-[10%] -translate-y-1/2 z-20">
               <SkillNode item={skills[2]} onClick={() => setSelectedItem(skills[2])} onUnlock={handleUnlockSkill} isUnlocking={justUnlocked === skills[2].id} />
            </div>

          </div>
        )}

      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={() => setSelectedItem(null)} />
          
          <GlassCard variant="tech" className="w-full max-w-md relative z-10 animate-[scaleIn_0.2s_ease-out]">
             <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
               <X className="w-6 h-6" />
             </button>

             <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-start gap-4 mb-6">
                   <div className={`
                      w-16 h-16 rounded-xl flex items-center justify-center border-2 shadow-lg
                      ${selectedItem.bg} ${selectedItem.border} ${selectedItem.color}
                   `}>
                      <selectedItem.icon className="w-8 h-8" />
                   </div>
                   <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 bg-slate-100 rounded text-slate-500">
                          {selectedItem.type}
                        </span>
                        {selectedItem.status && (
                           <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                             selectedItem.status === 'mastered' ? 'bg-amber-100 text-amber-600' :
                             selectedItem.status === 'unlocked' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'
                           }`}>
                             {selectedItem.status}
                           </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-display font-bold text-slate-800 leading-none">{selectedItem.name}</h3>
                      {selectedItem.rarity && <p className={`text-xs font-bold uppercase mt-1 ${
                        selectedItem.rarity === 'legendary' ? 'text-amber-500' : selectedItem.rarity === 'epic' ? 'text-purple-500' : 'text-blue-500'
                      }`}>{selectedItem.rarity}</p>}
                      {selectedItem.date && <p className="text-xs text-slate-400 font-mono mt-1">Verified: {selectedItem.date}</p>}
                   </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                   <p className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-slate-200 pl-3">
                     "{selectedItem.description}"
                   </p>
                </div>

                {/* Stats / Attributes */}
                {selectedItem.stats && (
                   <div className="grid grid-cols-2 gap-3 mb-4">
                      {Object.entries(selectedItem.stats).map(([key, value]) => (
                         <div key={key} className="bg-white/50 border border-white rounded p-2">
                            <p className="text-[10px] font-mono uppercase text-slate-400">{key}</p>
                            <p className="text-sm font-bold text-slate-700">{value}</p>
                         </div>
                      ))}
                   </div>
                )}
                
                {/* Skill Prerequisites */}
                {selectedItem.prerequisites && (
                  <div className="mt-4">
                     <p className="text-[10px] font-mono uppercase text-slate-400 mb-2">Required Chain:</p>
                     <div className="flex gap-2">
                        {selectedItem.prerequisites.map(pre => (
                           <span key={pre} className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-600 border border-slate-200">
                             {pre}
                           </span>
                        ))}
                     </div>
                  </div>
                )}

                {/* Scroll Preview */}
                {selectedItem.type === 'SCROLL' && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg relative overflow-hidden group cursor-not-allowed">
                     <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Lock className="w-4 h-4 text-slate-500" />
                     </div>
                     <div className="text-center font-serif text-amber-800 opacity-70">
                        <h4 className="text-lg font-bold mb-1">Certificate of Completion</h4>
                        <div className="h-1 w-20 bg-amber-200 mx-auto mb-2" />
                        <p className="text-[10px] font-mono">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                     </div>
                  </div>
                )}
             </div>
          </GlassCard>
        </div>
      )}
      <style>{`
          @keyframes unlockPulse {
              0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
              70% { transform: scale(1.1); box-shadow: 0 0 0 20px rgba(16, 185, 129, 0); }
              100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
          }
          .animate-unlock {
              animation: unlockPulse 0.8s ease-out;
          }
      `}</style>
    </div>
  );
};

// Sub-component for Skill Nodes
const SkillNode: React.FC<{ item: Item; onClick: () => void; onUnlock?: (item: Item) => void; isUnlocking?: boolean }> = ({ item, onClick, onUnlock, isUnlocking }) => {
  const isLocked = item.status === 'locked';
  
  const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isLocked && onUnlock) {
          onUnlock(item);
      } else {
          onClick();
      }
  };

  return (
    <div className="relative group flex flex-col items-center gap-2 cursor-pointer transition-all" onClick={handleClick}>
       <div className={`
          w-16 h-16 rounded-full border-4 flex items-center justify-center shadow-lg transition-all duration-300 z-10 bg-white
          ${isLocked ? 'border-slate-300 grayscale opacity-80 hover:scale-105' : `${item.border} ${item.color} shadow-${item.color.split('-')[1]}-500/20 active:scale-95`}
          ${isUnlocking ? 'animate-unlock border-emerald-400 bg-emerald-50' : ''}
       `}>
          {isLocked ? <Lock className={`w-6 h-6 text-slate-400 ${isUnlocking ? 'hidden' : ''}`} /> : <item.icon className="w-8 h-8" />}
          {isUnlocking && <Zap className="w-8 h-8 text-emerald-500 animate-bounce" />}
       </div>
       <div className={`
          px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border bg-white shadow-sm transition-colors
          ${isLocked ? 'border-slate-300 text-slate-400' : `${item.border} ${item.color}`}
          ${isUnlocking ? 'text-emerald-500 border-emerald-400' : ''}
       `}>
          {item.name}
       </div>
    </div>
  );
};

export default InventoryVault;