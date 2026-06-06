import React, { useState } from 'react';
import { Timer, AlertTriangle, CheckCircle2, ChevronRight, BarChart3, Archive, CircleDot } from 'lucide-react';
import GlassCard from './GlassCard';
import QuestModal from './QuestModal';
import { Quest } from '../types';

interface QuestPanelProps {
  quests: Quest[];
  onVerify: (questId: string, file: File) => Promise<void>;
  onAccept: (questId: string) => void;
}

const QuestPanel: React.FC<QuestPanelProps> = ({ quests, onVerify, onAccept }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);

  // In 'active' tab, show both 'active' (available) and 'accepted' (in-progress) quests
  const filteredQuests = quests.filter(q => {
    if (activeTab === 'active') return q.status === 'active' || q.status === 'accepted';
    return q.status === 'completed';
  });
  
  const activeCount = quests.filter(q => q.status === 'active' || q.status === 'accepted').length;

  return (
    <>
      <div className="flex flex-col h-full gap-4">
        {/* Header and Tabs */}
        <div className="flex items-center justify-between mb-2 px-2">
            <h3 className="font-display font-bold text-slate-500 tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              MISSION LOG
            </h3>
            <div className="flex bg-white/40 backdrop-blur-md rounded-lg p-1 border border-white/40">
              <button 
                onClick={() => setActiveTab('active')}
                className={`px-3 py-1 rounded-md text-[10px] font-bold font-mono transition-all ${activeTab === 'active' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-500 hover:bg-white/50'}`}
              >
                ACTIVE [{activeCount}]
              </button>
              <button 
                onClick={() => setActiveTab('completed')}
                className={`px-3 py-1 rounded-md text-[10px] font-bold font-mono transition-all ${activeTab === 'completed' ? 'bg-slate-500 text-white shadow-lg' : 'text-slate-500 hover:bg-white/50'}`}
              >
                LOGS
              </button>
            </div>
        </div>

        {/* Quest List */}
        <div className="flex flex-col gap-4 overflow-y-auto pr-1 pb-4 custom-scrollbar flex-1">
          {filteredQuests.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 opacity-60">
              <Archive className="w-8 h-8 mb-2" />
              <p className="text-xs font-mono">NO DATA FOUND</p>
            </div>
          ) : (
            filteredQuests.map((quest) => (
                <QuestCard 
                  key={quest.id} 
                  quest={quest} 
                  onClick={() => setSelectedQuest(quest)}
                  isCompletedView={activeTab === 'completed'}
                />
            ))
          )}
        </div>
        
        {/* Decorative 'More' Indicator */}
        <div className="mt-auto flex justify-center opacity-50">
            <div className="w-16 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>

      {/* Modal */}
      {selectedQuest && (
        <QuestModal 
          quest={selectedQuest} 
          onClose={() => setSelectedQuest(null)} 
          onVerify={(file) => onVerify(selectedQuest.id, file)}
          onAccept={() => onAccept(selectedQuest.id)}
        />
      )}
    </>
  );
};

interface QuestCardProps {
  quest: Quest;
  onClick: () => void;
  isCompletedView: boolean;
}

const QuestCard: React.FC<QuestCardProps> = ({ quest, onClick, isCompletedView }) => {
  const isUrgent = quest.type === 'URGENT' && !isCompletedView;
  const isAccepted = quest.status === 'accepted';
  const glowColor = isCompletedView ? 'blue' : (isUrgent ? 'red' : 'blue');
  const variant = isUrgent ? 'alert' : 'tech';

  return (
    <GlassCard 
      glowColor={glowColor} 
      variant={variant}
      className={`
        p-5 group cursor-pointer transition-all duration-300
        ${isCompletedView ? 'opacity-70 grayscale-[0.5] hover:opacity-100 hover:grayscale-0' : 'hover:-translate-y-1'}
        ${isUrgent ? 'bg-red-50/10' : ''}
        ${isAccepted ? 'border-l-4 border-l-blue-500' : ''}
      `}
    >
      <div className="absolute inset-0 z-10" onClick={onClick} /> {/* Full card click area */}

      <div className="flex justify-between items-start mb-2 pointer-events-none">
        <div className={`
          text-[10px] font-mono font-bold px-2 py-0.5 border flex items-center gap-2
          ${isCompletedView ? 'text-slate-500 border-slate-300 bg-slate-100' : 
            (isUrgent 
            ? 'text-red-600 border-red-500/50 bg-red-100/50 animate-pulse' 
            : 'text-blue-600 border-blue-400/50 bg-blue-100/50')}
        `}>
          {isCompletedView ? 'COMPLETED' : (isUrgent ? 'CRITICAL // URGENT' : `// ${quest.type}`)}
          {isAccepted && !isCompletedView && <span className="bg-blue-500 text-white px-1 rounded text-[8px] ml-1">IN PROGRESS</span>}
        </div>
        {isUrgent && (
          <AlertTriangle className="w-5 h-5 text-red-500 animate-flash" />
        )}
        {isCompletedView && (
           <CheckCircle2 className="w-5 h-5 text-green-500" />
        )}
        {!isCompletedView && !isAccepted && (
            <CircleDot className="w-4 h-4 text-slate-300" />
        )}
      </div>
      
      <h3 className={`
        text-lg font-display font-bold leading-tight mb-1 transition-colors pointer-events-none
        ${isCompletedView ? 'text-slate-500 line-through decoration-slate-400' : 'text-slate-800 group-hover:text-blue-600'}
      `}>
        {quest.title}
      </h3>
      
      {quest.subtitle && (
        <p className="text-slate-500 text-xs font-mono mb-4 border-l-2 border-slate-200 pl-2 pointer-events-none">
            {quest.subtitle}
        </p>
      )}
      
      <div className="flex items-center justify-between mt-4 pointer-events-none">
        <div className={`
            flex items-center space-x-2 px-3 py-1.5 rounded bg-white/60 backdrop-blur-sm border border-white/50
            ${isUrgent ? 'text-red-600' : 'text-slate-600'}
        `}>
          <Timer className="w-3.5 h-3.5" />
          <span className="text-sm font-mono font-bold tracking-tight">{quest.duration || "--:--"}</span>
        </div>
        
        {!isCompletedView && (
          <div 
            className={`
              w-8 h-8 flex items-center justify-center transition-all relative overflow-hidden rounded-full
              ${isUrgent 
                ? 'text-red-500 group-hover:text-white group-hover:bg-red-500' 
                : 'text-blue-500 group-hover:text-white group-hover:bg-blue-500'}
            `}
          >
            <ChevronRight className="w-6 h-6" />
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default QuestPanel;