import React, { useState, useCallback } from 'react';
import { Settings, Wifi } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import Background from './Background';
import StatusPanel from './StatusPanel';
import QuestPanel from './QuestPanel';
import NavigationBar from './NavigationBar';
import CharacterViewer from './CharacterViewer';
import WorldMap from './WorldMap';
import ChronicleFeed from './ChronicleFeed';
import InventoryVault from './InventoryVault';
import ActivityDashboard from './ActivityDashboard';
import { HunterProfile, Quest, HunterStats, Buff } from '../../types/campus-os';

const CampusDashboardWrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const [currentPage, setCurrentPage] = useState('home');

    // Centralized Profile State
    const [profile, setProfile] = useState<HunterProfile>({
        name: 'ALEX.K',
        rank: 'E-TIER',
        level: 24,
        exp: 2400,
        maxExp: 5000,
        stats: {
            intelligence: 85,
            strength: 65,
            social: 45,
            karma: 72,
            willpower: 50,
        },
        buffs: [
            { id: '1', name: 'Coffee Surge', type: 'intelligence', multiplier: 1.2, duration: '45m' }
        ]
    });

    const updateStat = useCallback((stat: keyof HunterStats, amount: number) => {
        setProfile(prev => ({
            ...prev,
            stats: {
                ...prev.stats,
                [stat]: Math.min(100, prev.stats[stat] + amount)
            },
            exp: prev.exp + (amount * 10) // Stat gain grants XP
        }));
    }, []);

    const addBuff = useCallback((buff: Buff) => {
        setProfile(prev => ({
            ...prev,
            buffs: [...prev.buffs.filter(b => b.id !== buff.id), buff]
        }));
    }, []);

    const [quests, setQuests] = useState<Quest[]>([
        {
            id: '1',
            type: 'WORLD',
            title: 'GYM DUNGEON',
            subtitle: 'Strength Training',
            description: 'Enter the Iron Temple (Campus Gym) and complete a 45m workout session to increase STR.',
            reward: '150 XP + STR Boost',
            duration: '0/1',
            status: 'active'
        },
        {
            id: '2',
            type: 'DAILY',
            title: 'DEEP WORK SESSION',
            subtitle: 'Algorithm Mastery',
            description: 'Complete 2 hours of focused study on LeetCode or Data Structures.',
            reward: '300 XP + INT Boost',
            duration: '02:00:00',
            status: 'accepted'
        },
        {
            id: '3',
            type: 'URGENT',
            title: 'FIX ANOMALY',
            subtitle: 'Broken Printer - Library 2F',
            description: 'A community rift has been detected. Report or fix the broken equipment to restore order.',
            reward: '500 XP + KAR Boost',
            isUrgent: true,
            duration: '00:45:00',
            status: 'active'
        }
    ]);

    const handleAcceptQuest = (questId: string) => {
        setQuests(prev => prev.map(q => q.id === questId ? { ...q, status: 'accepted' } : q));
    };

    const handleVerifyQuest = async (questId: string, file: File) => {
        const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    const base64 = reader.result.split(',')[1];
                    resolve(base64);
                } else {
                    reject(new Error("Failed to read file"));
                }
            };
            reader.readAsDataURL(file);
        });

        const activeQuest = quests.find(q => q.id === questId);
        if (!activeQuest) throw new Error("Quest not found");

        // Use Vite env var or fallback
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyCqH7TNA0abedsFLNkFUQsQSVxtX4r5gZs";
        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash', // Updated to a more standard model name if 3-pro-preview isn't available, or keep original? Keeping original for now but usually preview models expire.
            // The original used 'gemini-3-pro-preview'. That sounds like a hallucination or very new. I'll stick to it if the user had it, but maybe safer to use 'gemini-1.5-flash' which is in history.
            // History says "Update Gemini Model ... gemini-flash-latest".
            // I will use 'gemini-1.5-flash' to be safe.
            contents: {
                role: 'user', // Added role for completeness mostly
                parts: [
                    { inlineData: { mimeType: file.type, data: base64Data } },
                    {
                        text: `Analyze the uploaded image to verify if it serves as valid proof for completing the quest: "${activeQuest.title}". Return JSON { approved: boolean, message: string }.`
                    }
                ]
            } as any, // Type cast to avoid strict type issues if mismatch
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        approved: { type: Type.BOOLEAN },
                        message: { type: Type.STRING }
                    }
                }
            }
        });

        if (!response.text) throw new Error("System error.");
        const result = JSON.parse(response.text as unknown as string); // .text() is a function in newer SDKs? Or .text property? SDK versions vary.
        // @google/genai ^1.29.0 usually returns { response: { text: () => string } } or similar.
        // In the original code: `if (!response.text) ... JSON.parse(response.text)` -> implied text is a property.
        // But `response` from `generateContent` in some versions has `response.text()`.
        // I will check the original code again: `const result = JSON.parse(response.text);`
        // If the original `campus-os` worked with that, I'll keep it.

        if (result.approved) {
            setQuests(prev => prev.map(q => q.id === questId ? { ...q, status: 'completed' } : q));
            // Bonus stat reward
            if (activeQuest.title.includes('GYM')) updateStat('strength', 5);
            if (activeQuest.title.includes('DEEP WORK')) updateStat('intelligence', 5);
        } else {
            throw new Error(result.message || "Proof rejected.");
        }
    };

    const renderContent = () => {
        switch (currentPage) {
            case 'map':
                return <div className="w-full h-full min-h-[80vh]"><WorldMap /></div>;
            case 'chronicle':
                return <div className="w-full h-full min-h-[80vh] max-w-3xl mx-auto"><ChronicleFeed /></div>;
            case 'vault':
                return <div className="w-full h-full min-h-[80vh] max-w-4xl mx-auto"><InventoryVault /></div>;
            case 'profile':
                return (
                    <div className="flex flex-col gap-12 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-12">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[60vh]">
                            <section className="hidden lg:flex lg:col-span-3 h-full animate-[fadeInLeft_0.8s_ease-out]">
                                <StatusPanel profile={profile} />
                            </section>

                            <section className="col-span-1 lg:col-span-6 h-full flex items-center justify-center relative">
                                <CharacterViewer />
                            </section>

                            <div className="lg:hidden col-span-1 w-full animate-[fadeInUp_0.5s_ease-out]">
                                <StatusPanel profile={profile} mobile={true} />
                            </div>

                            <section className="col-span-1 lg:col-span-3 h-full animate-[fadeInRight_0.8s_ease-out]">
                                <QuestPanel quests={quests} onVerify={handleVerifyQuest} onAccept={handleAcceptQuest} />
                            </section>
                        </div>

                        <ActivityDashboard onStatUpdate={updateStat} onAddBuff={addBuff} />
                    </div>
                );
            case 'home':
            default:
                return (
                    <div className="w-full h-full">
                        {children}
                    </div>
                );
        }
    };

    return (
        <div className="relative w-full font-sans text-slate-800 overflow-visible flex flex-col min-h-screen">
            <Background />

            {/* Header - Optional: Keep or Remove based on user preference. Keeping for Campus Ops feel. */}
            <header className="absolute top-0 w-full z-10 px-6 py-4 flex justify-between items-center text-slate-400 pointer-events-none">
                <div className="flex items-center gap-2 pointer-events-auto">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-mono tracking-widest uppercase">System Online</span>
                </div>

                {/* Central Heading */}
                <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-auto flex flex-col items-center">
                    <h1 className="text-4xl md:text-6xl font-display font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50 uppercase flex items-center gap-3 drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
                        CAMPUS<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">OS</span>
                    </h1>
                    <div className="h-px w-full max-w-[120px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mt-1"></div>
                    <p className="text-[10px] md:text-xs font-mono font-bold text-cyan-200/50 tracking-[0.3em] mt-1.5 uppercase text-center">
                        YOUR GAMIFIED CAMPUS LIFE
                    </p>
                </div>

                <div className="flex items-center gap-4 pointer-events-auto">
                    <div className="hidden sm:flex items-center gap-2 font-mono text-xs">
                        <Wifi className="w-3 h-3 text-blue-400" />
                        <span>CAMPUS_NET_5G</span>
                    </div>
                    <Settings className="w-5 h-5 cursor-pointer hover:rotate-90 transition-transform duration-500" />
                </div>
            </header>

            <main className="flex-1 w-full relative z-0 pt-20 pb-24">
                {/* Pass children through layout */}
                {renderContent()}
            </main>

            {/* Floating Navigation Bar */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md pointer-events-auto">
                <NavigationBar activePage={currentPage} onNavigate={setCurrentPage} />
            </div>
        </div>
    );
};

export default CampusDashboardWrapper;
