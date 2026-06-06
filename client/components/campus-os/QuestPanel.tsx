import React, { useState } from 'react';
import { Timer, AlertTriangle, CheckCircle2, ChevronRight, BarChart3, Archive, CircleDot } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import QuestModal from './QuestModal';
import { Quest } from '../../types/campus-os';

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
      <div className="flex flex-col h-full gap-4 w-full">
        {/* Header and Tabs */}
        <div className="flex items-center justify-end mb-2 px-2">
          <div className="flex bg-muted rounded-full p-1 border border-border shadow-sm">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-1.5 rounded-full text-[11px] font-bold font-mono transition-all duration-300 ${activeTab === 'active' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              ACTIVE [{activeCount}]
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-1.5 rounded-full text-[11px] font-bold font-mono transition-all duration-300 ${activeTab === 'completed' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              LOGS
            </button>
          </div>
        </div>

        {/* Quest List */}
        <div className="flex flex-col gap-4 overflow-y-auto pr-1 pb-4 custom-scrollbar flex-1 w-full">
          {filteredQuests.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground opacity-60">
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

  return (
    <Card
      className={`
        overflow-hidden group cursor-pointer transition-all duration-300 shadow-sm border
        ${isCompletedView ? 'opacity-70 grayscale-[0.5] hover:opacity-100 hover:grayscale-0' : 'hover:border-primary/50 hover:shadow-md'}
        ${isUrgent ? 'bg-destructive/5 border-destructive/20' : 'bg-card'}
        ${isAccepted ? 'border-l-4 border-l-primary' : ''}
      `}
      onClick={onClick}
    >
      <CardContent className="p-5 relative">
        <div className="flex justify-between items-start mb-2">
          <div className={`
            text-[10px] font-mono font-bold px-2 py-0.5 border flex items-center gap-2 rounded-sm
            ${isCompletedView ? 'text-muted-foreground border-border bg-muted' :
              (isUrgent
                ? 'text-destructive border-destructive/50 bg-destructive/10 animate-pulse'
                : 'text-primary border-primary/30 bg-primary/10')}
          `}>
            {isCompletedView ? 'COMPLETED' : (isUrgent ? 'CRITICAL // URGENT' : `// ${quest.type}`)}
            {isAccepted && !isCompletedView && <span className="bg-primary text-primary-foreground px-1 rounded-sm text-[8px] ml-1">IN PROGRESS</span>}
          </div>
          {isUrgent && (
            <AlertTriangle className="w-5 h-5 text-destructive animate-pulse" />
          )}
          {isCompletedView && (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          )}
          {!isCompletedView && !isAccepted && (
            <CircleDot className="w-4 h-4 text-muted-foreground/50" />
          )}
        </div>

        <h3 className={`
          text-lg font-display font-bold leading-tight mb-1 transition-colors
          ${isCompletedView ? 'text-muted-foreground line-through decoration-muted-foreground/50' : 'text-foreground group-hover:text-primary'}
        `}>
          {quest.title}
        </h3>

        {quest.subtitle && (
          <p className="text-muted-foreground text-xs mb-4 border-l-2 border-border pl-2">
            {quest.subtitle}
          </p>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className={`
              flex items-center space-x-2 px-3 py-1.5 rounded-md bg-background border border-border
              ${isUrgent ? 'text-destructive' : 'text-muted-foreground'}
          `}>
            <Timer className="w-3.5 h-3.5" />
            <span className="text-sm font-mono font-bold tracking-tight">{quest.duration || "--:--"}</span>
          </div>

          {!isCompletedView && (
            <div
              className={`
                w-8 h-8 flex items-center justify-center transition-all rounded-full
                ${isUrgent
                  ? 'text-destructive group-hover:bg-destructive group-hover:text-destructive-foreground'
                  : 'text-primary group-hover:bg-primary group-hover:text-primary-foreground'}
              `}
            >
              <ChevronRight className="w-6 h-6" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestPanel;