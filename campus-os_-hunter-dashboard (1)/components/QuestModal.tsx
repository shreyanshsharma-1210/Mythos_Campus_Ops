import React, { useState, useRef } from 'react';
import { X, Upload, CheckCircle2, AlertTriangle, Loader2, Zap, Trophy, ScanLine, PlayCircle } from 'lucide-react';
import GlassCard from './GlassCard';
import { Quest } from '../types';

interface QuestModalProps {
  quest: Quest;
  onClose: () => void;
  onVerify: (file: File) => Promise<void>;
  onAccept: () => void;
}

const QuestModal: React.FC<QuestModalProps> = ({ quest, onClose, onVerify, onAccept }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setAnalyzing(true);
    setError(null);
    try {
      await onVerify(file);
      onClose(); // Close on success
    } catch (err: any) {
      setError(err.message || "Verification failed. System could not validate proof.");
    } finally {
      setAnalyzing(false);
    }
  };

  const isCompleted = quest.status === 'completed';
  const isAccepted = quest.status === 'accepted';
  const isActive = quest.status === 'active';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]" onClick={onClose} />
      
      {/* Modal Content */}
      <GlassCard variant="alert" className="w-full max-w-lg relative z-10 overflow-visible animate-[scaleIn_0.3s_ease-out_forwards]">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors z-20 hover:bg-slate-700/50 rounded-full"
        >
            <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-mono border px-2 py-0.5 rounded ${quest.type === 'URGENT' ? 'border-red-500 text-red-500' : 'border-blue-400 text-blue-400'}`}>
                        {quest.type} MISSION
                    </span>
                    {isCompleted && <span className="text-[10px] font-mono border border-green-500 text-green-500 px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> VERIFIED</span>}
                    {isAccepted && <span className="text-[10px] font-mono border border-blue-500 bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded flex items-center gap-1">IN PROGRESS</span>}
                </div>
                <h2 className="text-3xl font-display font-bold text-slate-800 mb-2 leading-tight">{quest.title}</h2>
                <p className="text-slate-500 font-mono text-sm border-l-2 border-blue-400/30 pl-3">
                    {quest.subtitle}
                </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/40 rounded-lg p-3 border border-white/50">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span className="text-[10px] font-mono uppercase tracking-wider">Reward</span>
                    </div>
                    <p className="font-bold text-slate-800 font-display text-lg">{quest.reward || "500 XP"}</p>
                </div>
                <div className="bg-white/40 rounded-lg p-3 border border-white/50">
                     <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <Zap className="w-4 h-4 text-violet-500" />
                        <span className="text-[10px] font-mono uppercase tracking-wider">Energy Cost</span>
                    </div>
                    <p className="font-bold text-slate-800 font-display text-lg">25 EP</p>
                </div>
            </div>

            {/* Description Body */}
            <div className="mb-6 text-sm text-slate-600 leading-relaxed font-sans">
                {quest.description || "Complete this objective to increase your rank. Upload visual proof for verification by the Guild AI."}
            </div>

            {/* Upload Section (Only if accepted) */}
            {isAccepted && (
                <div className="bg-slate-50/50 border-2 border-dashed border-slate-300 rounded-xl p-4 text-center transition-all hover:bg-white/50 hover:border-blue-400 group relative overflow-hidden animate-[fadeIn_0.5s]">
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    
                    {preview ? (
                        <div className="relative h-48 w-full rounded-lg overflow-hidden bg-slate-900 border border-slate-200">
                             <img src={preview} alt="Proof" className="w-full h-full object-contain opacity-90" />
                             
                             {analyzing && (
                                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-blue-400">
                                   <ScanLine className="w-10 h-10 animate-ping mb-2" />
                                   <span className="font-mono text-xs animate-pulse">ANALYZING TARGET...</span>
                                </div>
                             )}

                             {!analyzing && (
                                <button 
                                    onClick={() => { setFile(null); setPreview(null); }}
                                    className="absolute top-2 right-2 bg-slate-900/80 text-white p-1.5 rounded-full hover:bg-red-500 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                             )}
                        </div>
                    ) : (
                        <div 
                            className="flex flex-col items-center justify-center py-6 cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mb-3 group-hover:scale-110 transition-transform">
                                <Upload className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-bold text-slate-600">Upload Visual Proof</p>
                            <p className="text-xs text-slate-400 mt-1">AI Analysis Required • JPG, PNG</p>
                        </div>
                    )}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-xs font-bold animate-pulse">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-200/50">
                <button 
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                    disabled={analyzing}
                >
                    CLOSE
                </button>
                
                {/* Accept Button Logic */}
                {isActive && (
                    <button 
                        onClick={() => { onAccept(); onClose(); }}
                        className="px-6 py-2 rounded-lg text-sm font-bold text-white shadow-lg bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                    >
                        <PlayCircle className="w-4 h-4" />
                        ACCEPT MISSION
                    </button>
                )}

                {/* Verify Button Logic */}
                {isAccepted && (
                    <button 
                        onClick={handleUpload}
                        disabled={!file || analyzing}
                        className={`
                            px-6 py-2 rounded-lg text-sm font-bold text-white shadow-lg flex items-center gap-2
                            ${!file || analyzing ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/30 hover:-translate-y-0.5'}
                            transition-all
                        `}
                    >
                        {analyzing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                PROCESSING
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                VERIFY & COMPLETE
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
      </GlassCard>
      
      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default QuestModal;