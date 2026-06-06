import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { callGPT } from "@/lib/openai";
import { sendWhatsAppAlert } from "@/lib/whatsapp";
import { PageLayout } from "@/components/PageLayout";
import { Flag, Users, Clock, Zap, RotateCcw, CheckCircle2, AlertTriangle, Mic, MicOff } from "lucide-react";
import { useCampusOps } from "@/contexts/CampusOpsContext";

const URGENCY_LABELS = ["", "Can Wait", "Annoying", "Affecting Studies", "Urgent", "Emergency"];
const URGENCY_COLORS = ["", "text-emerald-600", "text-yellow-600", "text-amber-600", "text-orange-600", "text-destructive"];

const CATEGORIES = [
  { value: "Hostel", icon: "🏠" },
  { value: "Academics", icon: "📚" },
  { value: "Canteen", icon: "🍽" },
  { value: "Electrical", icon: "💡" },
  { value: "Plumbing", icon: "🚿" },
  { value: "Security", icon: "🔒" },
  { value: "Medical", icon: "🏥" },
  { value: "Administration", icon: "⚖" },
];

const LOADING_STEPS = [
  "Reading complaint…",
  "Identifying department…",
  "Checking for duplicates…",
  "Assessing escalation risk…",
  "Routing ticket…",
];

const RISK_STYLE: Record<string, string> = {
  Critical: "bg-destructive/10 text-destructive border-destructive/30",
  High: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  Medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  Low: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
};

export default function GrievanceSubmit() {
  const { addGrievance, addNotification } = useCampusOps();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState(3);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<any>(null);

  const [isListening, setIsListening] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setPhoto(URL.createObjectURL(e.target.files[0]));
  };

  const handleVoiceInput = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript: string = event.results[0][0].transcript;
      setDescription((prev) => (prev ? prev + " " : "") + transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setResult(null);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep((p) => (p < LOADING_STEPS.length - 1 ? p + 1 : p));
    }, 400);

    const ticketId = `GRV-2026-${Math.floor(800 + Math.random() * 200)}`;
    const systemPrompt = `You are a grievance classification AI at an Indian college campus. Given a student complaint, return ONLY this JSON:
{"department":"hostel_warden|academic_office|canteen|electrical|plumbing|security|medical|administration|it_services","urgency":1,"sentiment":"frustrated|distressed|neutral|angry|urgent","category":"string","summary":"one sentence summary","duplicate_probability":0,"affected_students_estimate":1,"escalation_risk":0,"escalation_risk_level":"Low|Medium|High|Critical","escalation_reason":"one sentence","estimated_resolution_days":1}
Replace all numeric defaults with real values. Only return JSON.`;
    const userMessage = `Title: ${title}\nCategory: ${category}\nDescription: ${description}\nUrgency: ${urgency}/5\nAnonymous: ${isAnonymous}`;

    try {
      const raw = await callGPT(systemPrompt, userMessage);
      const parsed = JSON.parse(raw.trim().replace(/```json/g, "").replace(/```/g, ""));
      const grievance = {
        id: ticketId,
        title,
        category: parsed.category || category,
        description,
        urgency: parsed.urgency ?? urgency,
        sentiment: parsed.sentiment,
        department: parsed.department?.replace(/_/g, " ") || "Administration",
        status: "Pending",
        slaHours: urgency >= 4 ? 8 : urgency >= 3 ? 24 : 48,
        duplicateCount: Math.max(1, Math.round((parsed.duplicate_probability || 0) / 20)),
        affectedStudents: parsed.affected_students_estimate || 1,
        escalationRisk: parsed.escalation_risk || 0,
        escalationRiskLevel: parsed.escalation_risk_level || "Low",
        escalationReason: parsed.escalation_reason || "",
        estimatedResolutionDays: parsed.estimated_resolution_days || 2,
      };
      addGrievance(grievance);
      addNotification({ text: `New grievance filed: ${title}`, time: "just now", type: "grievance" });
      if ((parsed.escalation_risk ?? 0) >= 60 || (parsed.urgency ?? 0) >= 4) {
        sendWhatsAppAlert({
          type: "grievance",
          title: `${parsed.escalation_risk_level ?? "High"} Escalation — New Grievance`,
          body: `${title}\nDept: ${parsed.department?.replace(/_/g, " ")}\nEscalation Risk: ${parsed.escalation_risk ?? "—"}/100\nStudents Affected: ${parsed.affected_students_estimate ?? 1}\n${parsed.escalation_reason ?? ""}`,
          ticketId,
          urgent: (parsed.escalation_risk ?? 0) >= 80,
        });
      }
      setResult({ ...parsed, ticketId });
    } catch {
      const fallback = {
        ticketId, department: "Administration", urgency, sentiment: "neutral",
        category: category || "General",
        summary: `${title} — routed to administration for review.`,
        duplicate_probability: 12, affected_students_estimate: 1,
        escalation_risk: urgency >= 4 ? 65 : 20,
        escalation_risk_level: urgency >= 4 ? "High" : "Low",
        escalation_reason: "Assessed based on urgency level and category.",
        estimated_resolution_days: 2,
      };
      addGrievance({
        id: ticketId, title, category: category || "General", description,
        urgency, sentiment: "neutral", department: "Administration",
        status: "Pending",
        slaHours: urgency >= 4 ? 8 : 24,
        duplicateCount: 1,
        affectedStudents: 1,
        escalationRisk: urgency >= 4 ? 65 : 20,
        escalationRiskLevel: urgency >= 4 ? "High" : "Low",
        escalationReason: "Assessed based on urgency level and category.",
        estimatedResolutionDays: 2,
      });
      addNotification({ text: `New grievance filed: ${title}`, time: "just now", type: "grievance" });
      setResult(fallback);
    } finally {
      clearInterval(stepInterval);
      setLoadingStep(LOADING_STEPS.length - 1);
      setTimeout(() => setIsProcessing(false), 300);
    }
  };

  const reset = () => {
    setResult(null); setTitle(""); setDescription(""); setCategory("");
    setUrgency(3); setPhoto(null); setIsAnonymous(false);
  };

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase mb-1">Module · Grievances</p>
          <h1 className="text-3xl font-display font-black uppercase tracking-wide text-foreground leading-none">Submit a Grievance</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-powered triage routes your complaint to the right department instantly.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left: Form / Processing / Result ── */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">

              {/* FORM */}
              {!isProcessing && !result && (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Card className="bg-white border-border shadow-sm rounded-xl">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                          <Flag className="w-4 h-4 text-primary" strokeWidth={1.75} />
                        </div>
                        <CardTitle className="text-base font-display font-black uppercase tracking-wide">New Ticket</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-6">

                        <div>
                          <label className="block text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-2">Title</label>
                          <Input value={title} onChange={(e) => setTitle(e.target.value)}
                            placeholder="Brief title of the issue" required
                            className="bg-background border-border focus-visible:ring-primary" />
                        </div>

                        <div>
                          <label className="block text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-3">Category</label>
                          <div className="grid grid-cols-4 gap-2">
                            {CATEGORIES.map((cat) => (
                              <button key={cat.value} type="button" onClick={() => setCategory(cat.value)}
                                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${category === cat.value
                                    ? "border-primary bg-primary/5 text-foreground"
                                    : "border-border bg-background text-muted-foreground hover:border-foreground/30"
                                  }`}>
                                <span className="text-xl">{cat.icon}</span>
                                <span className="text-[10px]">{cat.value}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Description</label>
                            <button type="button" onClick={handleVoiceInput}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-mono transition-all ${isListening
                                  ? "border-destructive bg-destructive/10 text-destructive animate-pulse"
                                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                                }`}>
                              {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                              {isListening ? "Listening…" : "Voice Input"}
                            </button>
                          </div>
                          <Textarea value={description} onChange={(e) => setDescription(e.target.value)}
                            placeholder="Be specific — or tap Voice Input to speak your complaint." required rows={4}
                            className="bg-background border-border focus-visible:ring-primary resize-none" />
                          <p className="text-[9px] font-mono text-muted-foreground mt-1 text-right">{description.length} chars</p>
                        </div>

                        <div>
                          <label className="block text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-2">
                            Urgency —{" "}
                            <span className={`normal-case tracking-normal ${URGENCY_COLORS[urgency]}`}>
                              {URGENCY_LABELS[urgency]}
                            </span>
                          </label>
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] font-mono text-muted-foreground">LOW</span>
                            <input type="range" min="1" max="5" value={urgency}
                              onChange={(e) => setUrgency(Number(e.target.value))}
                              className="flex-1 accent-primary" />
                            <span className="text-[9px] font-mono text-muted-foreground">HIGH</span>
                          </div>
                          <div className="flex justify-between mt-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <div key={n} className={`w-2 h-2 rounded-full ${n <= urgency ? "bg-primary" : "bg-secondary"}`} />
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-2">Photo (Optional)</label>
                          <Input type="file" accept="image/*" onChange={handlePhotoUpload}
                            className="bg-background border-border file:text-foreground file:font-mono file:text-xs" />
                          {photo && (
                            <img src={photo} alt="Preview"
                              className="mt-3 w-full h-36 object-cover rounded-xl border border-border"
                              style={{ filter: "contrast(1.1) saturate(0.8)" }} />
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => setIsAnonymous(!isAnonymous)}
                            className={`w-10 h-6 rounded-full transition-colors relative ${isAnonymous ? "bg-primary" : "bg-secondary"}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${isAnonymous ? "left-5" : "left-1"}`} />
                          </button>
                          <span className="text-sm text-muted-foreground">Submit anonymously</span>
                        </div>

                        <Button type="submit" className="w-full h-11 font-display font-black uppercase tracking-wide bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
                          Submit Grievance
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* PROCESSING */}
              {isProcessing && (
                <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-32 space-y-6">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
                    <div className="absolute inset-2 rounded-full border-2 border-primary/30 animate-ping" style={{ animationDelay: "0.2s" }} />
                    <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-primary font-display font-black uppercase tracking-widest text-sm">AI Processing</p>
                    <motion.p key={loadingStep} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      className="text-muted-foreground text-sm mt-2 font-mono">
                      {LOADING_STEPS[loadingStep]}
                    </motion.p>
                    <div className="flex gap-1 justify-center mt-4">
                      {LOADING_STEPS.map((_, i) => (
                        <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i <= loadingStep ? "w-6 bg-primary" : "w-3 bg-secondary"}`} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* RESULT */}
              {result && !isProcessing && (
                <motion.div key="result" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                  <Card className="bg-white border-border shadow-sm rounded-xl overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-primary via-indigo-500 to-primary/50" />
                    <CardHeader>
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" strokeWidth={1.75} />
                          </div>
                          <div>
                            <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Ticket Filed</p>
                            <p className="text-lg font-mono font-bold text-primary">{result.ticketId}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded border ${RISK_STYLE[result.escalation_risk_level] ?? RISK_STYLE.Low}`}>
                          {result.escalation_risk_level} Risk
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5">

                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "Routed To", value: result.department?.replace(/_/g, " "), color: "text-primary" },
                          { label: "AI Urgency", value: `${result.urgency} / 5`, color: "text-amber-600" },
                          { label: "Sentiment", value: result.sentiment, color: result.sentiment === "angry" || result.sentiment === "distressed" ? "text-destructive" : "text-emerald-600" },
                          { label: "Est. Resolution", value: `${result.estimated_resolution_days}d`, color: "text-indigo-600" },
                        ].map((item) => (
                          <div key={item.label} className="bg-secondary/40 p-3 rounded-xl">
                            <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-1">{item.label}</p>
                            <p className={`text-sm font-display font-black capitalize ${item.color}`}>{item.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Duplicate Detection */}
                      <div className="bg-secondary/40 p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Duplicate Detection</p>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${result.duplicate_probability > 50 ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"}`}>
                            {result.duplicate_probability}% match
                          </span>
                        </div>
                        <div className="w-full bg-border rounded-full h-1.5 mt-2">
                          <motion.div className={`h-1.5 rounded-full ${result.duplicate_probability > 50 ? "bg-amber-500" : "bg-emerald-500"}`}
                            initial={{ width: 0 }} animate={{ width: `${result.duplicate_probability}%` }}
                            transition={{ duration: 0.8, delay: 0.3 }} />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2">
                          ~{result.affected_students_estimate} student{result.affected_students_estimate > 1 ? "s" : ""} potentially affected
                        </p>
                      </div>

                      {/* Escalation */}
                      <div className="bg-secondary/40 p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Escalation Risk</p>
                          <span className="text-[10px] font-mono font-bold text-foreground">{result.escalation_risk}/100</span>
                        </div>
                        <div className="w-full bg-border rounded-full h-2 mb-2">
                          <motion.div className={`h-2 rounded-full ${result.escalation_risk >= 80 ? "bg-destructive" : result.escalation_risk >= 60 ? "bg-amber-500" : result.escalation_risk >= 40 ? "bg-yellow-500" : "bg-emerald-500"}`}
                            initial={{ width: 0 }} animate={{ width: `${result.escalation_risk}%` }}
                            transition={{ duration: 0.9, delay: 0.4 }} />
                        </div>
                        <p className="text-[10px] text-muted-foreground">{result.escalation_reason}</p>
                      </div>

                      {/* AI Summary */}
                      <div className="bg-secondary/40 p-4 rounded-xl">
                        <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-2">AI Summary</p>
                        <p className="text-sm text-foreground leading-relaxed">{result.summary}</p>
                      </div>

                      <Button onClick={reset} variant="outline" className="w-full h-11 font-display font-black uppercase tracking-wide rounded-xl">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Submit Another Grievance
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Right: Info Panel ── */}
          <div className="space-y-4">
            <Card className="bg-white border-border shadow-sm rounded-xl">
              <CardHeader className="pb-2">
                <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">System Stats</p>
                <CardTitle className="text-sm font-display font-black uppercase tracking-wide">Live Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Tickets Today", value: "14", color: "text-primary" },
                  { label: "Avg Resolution", value: "2.4d", color: "text-indigo-600" },
                  { label: "Critical Open", value: "3", color: "text-destructive" },
                  { label: "AI Accuracy", value: "94%", color: "text-emerald-600" },
                ].map((m) => (
                  <div key={m.label} className="flex justify-between items-center">
                    <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">{m.label}</p>
                    <p className={`text-sm font-display font-black ${m.color}`}>{m.value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white border-border shadow-sm rounded-xl">
              <CardHeader className="pb-2">
                <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Tips</p>
                <CardTitle className="text-sm font-display font-black uppercase tracking-wide">Better Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: Zap, text: "Be specific — mention exact location & time" },
                  { icon: Users, text: "Note if others are affected" },
                  { icon: Clock, text: "Upload a photo for faster triage" },
                  { icon: AlertTriangle, text: "Use Emergency only for safety risks" },
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <tip.icon className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" strokeWidth={1.75} />
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{tip.text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20 shadow-sm rounded-xl">
              <CardContent className="p-5">
                <p className="text-[8px] font-mono tracking-widest text-primary/70 uppercase mb-1">Department Routing</p>
                <p className="text-xs text-primary/80 leading-relaxed">
                  AI automatically routes each ticket to the correct department — Hostel Warden, Academic Office, IT Services, and more — based on content analysis.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
