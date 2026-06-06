import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FloatingSidebar } from "@/components/FloatingSidebar";
import { FloatingTopBar } from "@/components/FloatingTopBar";
import { DashboardTour } from "@/components/DashboardTour";
import CampusDashboardWrapper from "@/components/campus-os/CampusDashboardWrapper";
import { useSidebar } from "@/contexts/SidebarContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCampusOps } from "../contexts/CampusOpsContext";
import {
  Plus,
  MoreVertical,
  BookOpen,
  Users,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  Pin,
  Eye,
  Upload,
  Brain,
  ArrowLeft,
  GraduationCap,
  Wrench,
  Image as ImageIcon,
  Video as VideoIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import StatusPanel from '@/components/campus-os/StatusPanel';
import CharacterViewer from '@/components/campus-os/CharacterViewer';
import QuestPanel from '@/components/campus-os/QuestPanel';
import ActivityDashboard from "../components/campus-os/ActivityDashboard";

import { HunterProfile, Quest, HunterStats, Buff } from '@/types/campus-os';
import { GoogleGenAI, Type } from "@google/genai";

export default function Dashboard2() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { currentUser } = useAuth();
  const { grievances, maintenanceReports, lostItems, foundItems, notifications } = useCampusOps();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);

  // --- CAMPUS OS STATE ---
  const [bgMode, setBgMode] = useState<"video" | "image">("image");
  const [profile, setProfile] = useState<HunterProfile>({
    name: 'HUNTER_X',
    rank: 'E-TIER',
    level: 8,
    exp: 2400,
    maxExp: 5000,
    stats: {
      intelligence: 85,
      strength: 65,
      social: 45,
      karma: 72,
      willpower: 50,
    },
    buffs: []
  });

  const [quests, setQuests] = useState<Quest[]>([
    {
      id: '1',
      type: 'DAILY',
      title: 'ATTENDANCE CHECK',
      subtitle: 'Academic Intelligence',
      description: 'Review your attendance across all enrolled subjects. Flag any course falling below 75% before the next sync.',
      reward: '200 XP + INT Boost',
      duration: '0/5',
      status: 'active'
    },
    {
      id: '2',
      type: 'DAILY',
      title: 'POLICY QUERY',
      subtitle: 'Rulebook Navigator',
      description: 'Consult the AI-powered Policy Navigator on your pending academic or hostel regulation query.',
      reward: '150 XP + KAR Boost',
      duration: '01:00:00',
      status: 'accepted'
    },
    {
      id: '3',
      type: 'URGENT',
      title: 'REPORT ANOMALY',
      subtitle: 'Campus Infrastructure',
      description: 'A facility anomaly has been flagged near your zone. File a maintenance report immediately to restore order.',
      reward: '500 XP + KAR Boost',
      isUrgent: true,
      duration: '00:30:00',
      status: 'active'
    }
  ]);

  const updateStat = (stat: keyof HunterStats, amount: number) => {
    setProfile(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [stat]: Math.min(100, prev.stats[stat] + amount)
      },
      exp: prev.exp + (amount * 10)
    }));
  };

  const addBuff = (buff: Buff) => {
    setProfile(prev => ({
      ...prev,
      buffs: [...prev.buffs.filter(b => b.id !== buff.id), buff]
    }));
  };

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

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyCqH7TNA0abedsFLNkFUQsQSVxtX4r5gZs";
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: {
        role: 'user',
        parts: [
          { inlineData: { mimeType: file.type, data: base64Data } },
          {
            text: `Analyze the uploaded image to verify if it serves as valid proof for completing the quest: "${activeQuest.title}". Return JSON { approved: boolean, message: string }.`
          }
        ]
      } as any,
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
    const result = JSON.parse(response.text as unknown as string);

    if (result.approved) {
      setQuests(prev => prev.map(q => q.id === questId ? { ...q, status: 'completed' } : q));
      if (activeQuest.title.includes('GYM')) updateStat('strength', 5);
      if (activeQuest.title.includes('DEEP WORK')) updateStat('intelligence', 5);
      toast({ title: "Quest Completed!", description: activeQuest.reward });
    } else {
      throw new Error(result.message || "Proof rejected.");
    }
  };


  // Removed unused ClassCard and related legacy state.

  return (
    <div className="min-h-screen bg-background relative">
      {/* Hero Background */}
      <div className="absolute top-0 left-0 w-full h-[850px] pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('/hero-bg.png')] bg-cover bg-center"></div>
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent"></div>
      </div>
      {!isMobile && (
        <FloatingSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          userType="student"
        />
      )}
      <FloatingTopBar isCollapsed={isCollapsed} />
      <DashboardTour userType="student" />
      {/* Main Content */}
      <motion.div
        className={`transition-all duration-300 ${isMobile ? "ml-0" : isCollapsed ? "ml-20" : "ml-72"} pt-24 ${isMobile ? "p-4" : "p-8"} min-h-screen relative max-w-[1600px] mx-auto`}
        animate={{ marginLeft: isMobile ? 0 : isCollapsed ? 80 : 272 }}
      >
        <div className="w-full">
          {/* Sovereign Profile Section */}
          <motion.div
            className="mb-8 w-full min-h-[600px] bg-transparent relative border-none shadow-none z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            <div className="relative z-10 p-6 h-full">
              {/* <ProfileOverlay /> - Replaced with Full Campus OS Profile */}

              <div className="flex flex-col gap-6 w-full h-full relative">
                {/* CampusOps Title */}
                <div className="w-full flex justify-center -mt-16 mb-4 z-30 pointer-events-none">
                  <h1 className="text-2xl md:text-4xl font-black tracking-[0.3em] text-slate-900 uppercase drop-shadow-md">
                    CAMPUS<span className="text-primary">OPS</span>
                  </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start min-h-[60vh]">
                  {/* Status Panel (Left) */}
                  <section className="hidden lg:flex lg:col-span-3 h-full animate-[fadeInLeft_0.8s_ease-out]">
                    <StatusPanel profile={profile} />
                  </section>

                  {/* Character Viewer (Center) */}
                  <section className="col-span-1 lg:col-span-6 h-full flex items-center justify-center relative min-h-[500px] bg-transparent">
                    {/* Stronger White Glow Behind Character - Conditional */}
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none z-0 transition-all duration-1000 ${bgMode === 'video' ? 'bg-white/5 blur-[60px]' : 'bg-white/20 blur-[100px]'}`}></div>
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full pointer-events-none z-0 mix-blend-overlay transition-all duration-1000 ${bgMode === 'video' ? 'bg-white/10 blur-[40px]' : 'bg-white/40 blur-[60px]'}`}></div>
                    <CharacterViewer />
                  </section>


                  {/* Mobile Status Panel */}
                  <div className="lg:hidden col-span-1 w-full animate-[fadeInUp_0.5s_ease-out]">
                    <StatusPanel profile={profile} mobile={true} />
                  </div>

                  {/* Quest Panel (Right) */}
                  <section className="col-span-1 lg:col-span-3 h-full animate-[fadeInRight_0.8s_ease-out]">
                    <QuestPanel quests={quests} onVerify={handleVerifyQuest} onAccept={handleAcceptQuest} />
                  </section>
                </div>

                {/* Activity Dashboard (Bottom) */}
                <ActivityDashboard onStatUpdate={updateStat} onAddBuff={addBuff} />
              </div>

            </div>
          </motion.div>



          {/* Quick Actions & Modules - Professional SaaS UI */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {/* Top Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-4">
              {[
                { title: 'TOTAL GRIEVANCES', value: grievances.length.toString(), route: '/grievances/dashboard' },
                { title: 'OPEN MAINTENANCE', value: maintenanceReports.filter(r => r.status === 'Open').length.toString(), route: '/maintenance/dashboard' },
                { title: 'POLICY QUERIES TODAY', value: '89', route: '/policy' },
                { title: 'MATCHES FOUND', value: Math.min(lostItems.length, foundItems.length).toString(), route: '/lost-found' }
              ].map((stat, idx) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => navigate(stat.route)}
                  className="cursor-pointer"
                >
                  <Card className="bg-white border-border hover:border-primary/50 transition-colors group overflow-hidden relative shadow-sm rounded-xl">
                    <div className="p-6">
                      <p className="text-xs text-muted-foreground font-semibold tracking-wider mb-2 dashboard-title">{stat.title}</p>
                      <div className="flex items-end justify-between">
                        <h2 className="text-3xl font-bold text-foreground">{stat.value}</h2>
                        <div className="w-16 h-8 text-primary/40">
                          <svg viewBox="0 0 100 30" className="w-full h-full">
                            <polyline fill="none" stroke="currentColor" strokeWidth="2" points="0,20 20,10 40,25 60,5 80,15 100,0" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Actions Area */}
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-xl font-bold text-foreground dashboard-title">QUICK ACTIONS</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card onClick={() => navigate('/maintenance/report')} className="bg-white hover:bg-gray-50/50 border-border p-6 rounded-xl cursor-pointer transition-colors shadow-sm group">
                    <Wrench className="w-8 h-8 text-primary mb-4" strokeWidth={1.5} />
                    <h3 className="font-bold text-lg text-foreground mb-1">Report Maintenance</h3>
                    <p className="text-muted-foreground text-sm dashboard-text">AI-scored severity triage</p>
                  </Card>

                  <Card onClick={() => navigate('/policy')} className="bg-white hover:bg-gray-50/50 border-border p-6 rounded-xl cursor-pointer transition-colors shadow-sm group">
                    <BookOpen className="w-8 h-8 text-primary mb-4" strokeWidth={1.5} />
                    <h3 className="font-bold text-lg text-foreground mb-1">Policy Navigator</h3>
                    <p className="text-muted-foreground text-sm dashboard-text">Ask questions via GPT RAG</p>
                  </Card>

                  <Card onClick={() => navigate('/lost')} className="bg-white hover:bg-gray-50/50 border-border p-6 rounded-xl cursor-pointer transition-colors shadow-sm group">
                    <Search className="w-8 h-8 text-primary mb-4" strokeWidth={1.5} />
                    <h3 className="font-bold text-lg text-foreground mb-1">Lost Item</h3>
                    <p className="text-muted-foreground text-sm dashboard-text">Report something you lost</p>
                  </Card>

                  <Card onClick={() => navigate('/found')} className="bg-white hover:bg-gray-50/50 border-border p-6 rounded-xl cursor-pointer transition-colors shadow-sm group">
                    <CheckCircle className="w-8 h-8 text-primary mb-4" strokeWidth={1.5} />
                    <h3 className="font-bold text-lg text-foreground mb-1">Found Item</h3>
                    <p className="text-muted-foreground text-sm dashboard-text">Report something you found</p>
                  </Card>

                  <Card onClick={() => navigate('/grievances/submit')} className="bg-primary/5 hover:bg-primary/10 border-primary/20 p-6 rounded-xl cursor-pointer transition-colors shadow-sm group md:col-span-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <AlertCircle className="w-8 h-8 text-primary mb-4" strokeWidth={1.5} />
                        <h3 className="font-bold text-lg text-primary mb-1">Report a Grievance</h3>
                        <p className="text-primary/80 text-sm dashboard-text">Submit campus issues directly to the concerned department</p>
                      </div>
                      <ArrowLeft className="w-6 h-6 text-primary rotate-180 transition-transform group-hover:translate-x-2" />
                    </div>
                  </Card>
                </div>
              </div>

              {/* Notifications Feed */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-6 dashboard-title">RECENT AI ACTIONS</h2>
                <Card className="bg-white border-border rounded-xl shadow-sm overflow-hidden">
                  <div className="divide-y divide-border">
                    {notifications.map((notif, idx) => (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        className="p-4 hover:bg-gray-50/50 transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${notif.type === 'maintenance' ? 'bg-destructive' :
                              notif.type === 'match' ? 'bg-green-500' :
                                notif.type === 'grievance' ? 'bg-blue-500' : 'bg-purple-500'
                            }`} />
                          <div>
                            <p className="text-sm font-medium text-foreground dashboard-text">{notif.text}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
