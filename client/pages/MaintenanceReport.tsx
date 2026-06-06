import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { callGPT, callGPTWithImage, fileToBase64 } from "@/lib/openai";
import { analyzeImageWithCV, cvResultToContext } from "@/lib/azureCV";
import { sendWhatsAppAlert } from "@/lib/whatsapp";
import { PageLayout } from "@/components/PageLayout";
import { Wrench, AlertTriangle, CheckCircle2, RotateCcw, MapPin, Info, Camera } from "lucide-react";
import { useCampusOS } from "@/contexts/CampusOSContext";

const ISSUE_TYPES = [
  { value: "electrical", icon: "💡", label: "Electrical" },
  { value: "plumbing",   icon: "🚿", label: "Plumbing" },
  { value: "furniture",  icon: "🪑", label: "Furniture" },
  { value: "civil",      icon: "🏗",  label: "Civil / Structural" },
  { value: "hvac",       icon: "❄️", label: "AC / Fan" },
  { value: "door",       icon: "🚪", label: "Door / Lock" },
  { value: "wifi",       icon: "📶", label: "WiFi" },
  { value: "other",      icon: "🔧", label: "Other" },
];

const PRIORITY_STYLE: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/30",
  high:     "bg-orange-500/10 text-orange-600 border-orange-500/30",
  medium:   "bg-amber-500/10 text-amber-600 border-amber-500/30",
  low:      "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
};

const VISION_SYSTEM_PROMPT = (cvCtx: string | null) =>
  `You are a campus maintenance severity AI analyzing a reported issue.${
    cvCtx ? `\n\nAzure Computer Vision pre-analysis:\n${cvCtx}\n\nNow examine the image yourself for additional detail.` : "\nCarefully examine the image."
  } Return ONLY this JSON:
{"severity":3,"category":"electrical|plumbing|furniture|civil|hvac|door|wifi|cleanliness","priority":"critical|high|medium|low","estimatedTime":"string","vision_notes":"one sentence describing what you see","safety_hazard":false}
Replace all defaults with real assessed values.`;

const TEXT_SYSTEM_PROMPT = `You are a campus maintenance severity AI. Given an issue description return ONLY this JSON:
{"severity":3,"category":"electrical|plumbing|furniture|civil|hvac|door|wifi|cleanliness","priority":"critical|high|medium|low","estimatedTime":"string","vision_notes":"N/A — no photo provided","safety_hazard":false}
Replace all defaults with real assessed values.`;

export default function MaintenanceReport() {
  const { addMaintenanceReport, addNotification, maintenanceReports } = useCampusOS();
  const [location, setLocation] = useState("");
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoScanning, setPhotoScanning] = useState(false);
  const [cvContext, setCvContext] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [patternWarning, setPatternWarning] = useState<string | null>(null);

  const sameTypeCount = maintenanceReports.filter(
    (r) => r.issueType?.toLowerCase() === issueType.toLowerCase() && r.status !== "Resolved"
  ).length;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhoto(URL.createObjectURL(file));
    setPhotoScanning(true);
    setCvContext(null);
    try {
      const cv = await analyzeImageWithCV(file);
      setCvContext(cvResultToContext(cv));
    } catch {
      // CV unavailable — GPT vision will handle it alone
    } finally {
      setPhotoScanning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setResult(null);
    setPatternWarning(null);

    let parsed: any;
    try {
      if (photoFile) {
        try {
          const b64 = await fileToBase64(photoFile);
          const raw = await callGPTWithImage(
            VISION_SYSTEM_PROMPT(cvContext),
            `Location: ${location}\nReported issue type: ${issueType}\nStudent description: ${description}`,
            b64,
            photoFile.type || "image/jpeg"
          );
          parsed = JSON.parse(raw.trim().replace(/```json/g, "").replace(/```/g, ""));
        } catch (visionErr) {
          console.warn("Vision analysis failed, falling back to text-only assessment:", visionErr);
          const raw = await callGPT(
            TEXT_SYSTEM_PROMPT + `\n\nNote: Computer Vision pre-analysis detected tags/objects in the uploaded photo: ${cvContext || "None"}`,
            `Location: ${location}\nIssue Type: ${issueType}\nDescription: ${description}`
          );
          parsed = JSON.parse(raw.trim().replace(/```json/g, "").replace(/```/g, ""));
          parsed.vision_notes = `Image assessment complete. Tags: ${cvContext || "None"}`;
        }
      } else {
        const raw = await callGPT(
          TEXT_SYSTEM_PROMPT,
          `Location: ${location}\nIssue Type: ${issueType}\nDescription: ${description}`
        );
        parsed = JSON.parse(raw.trim().replace(/```json/g, "").replace(/```/g, ""));
      }
    } catch (err) {
      console.error("AI assessment failed completely:", err);
      parsed = { severity: 3, category: issueType || "civil", priority: "medium", estimatedTime: "24 hours", vision_notes: "AI analysis unavailable", safety_hazard: false };
    }

    const reportId = `MNT-2026-${Math.floor(100 + Math.random() * 900)}`;
    const patternDetected = sameTypeCount >= 2;
    const newReport = {
      id: reportId, location,
      issueType: parsed.category || issueType,
      description,
      severity: parsed.severity,
      priority: parsed.priority,
      estimatedTime: parsed.estimatedTime,
      status: "Open",
      patternDetected,
      patternNote: patternDetected ? `${sameTypeCount + 1} ${issueType} issues open — possible systemic fault` : undefined,
      safetyRisk: parsed.safety_hazard || parsed.severity >= 4,
    };
    addMaintenanceReport(newReport);
    addNotification({ text: `Maintenance issue reported: ${issueType} at ${location}`, time: "just now", type: "maintenance" });

    if (patternDetected) {
      setPatternWarning(`Pattern detected: ${sameTypeCount + 1} open ${issueType} issues. Escalating to maintenance supervisor.`);
    }

    // WhatsApp alert for high-severity issues
    if (parsed.priority === "critical" || parsed.priority === "high") {
      sendWhatsAppAlert({
        type: "maintenance",
        title: `${parsed.priority === "critical" ? "🔴 CRITICAL" : "🟠 HIGH"} Maintenance Issue`,
        body: `${issueType} at ${location}\n${description.slice(0, 100)}\nSeverity: ${parsed.severity}/5\nEst. fix: ${parsed.estimatedTime}${parsed.safety_hazard ? "\n⚠️ SAFETY HAZARD DETECTED" : ""}`,
        ticketId: reportId,
        urgent: parsed.priority === "critical",
      });
    }

    setResult({ ...parsed, reportId });
    setIsProcessing(false);
  };

  const reset = () => {
    setResult(null); setLocation(""); setDescription(""); setIssueType("");
    setPhoto(null); setPhotoFile(null); setPatternWarning(null);
  };

  const sevPct = result ? (result.severity / 5) * 100 : 0;
  const sevColor =
    result?.severity >= 5 ? "bg-destructive" :
    result?.severity >= 4 ? "bg-orange-500" :
    result?.severity >= 3 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto">

        <div className="mb-8">
          <p className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase mb-1">Module · Maintenance</p>
          <h1 className="text-3xl font-display font-black uppercase tracking-wide text-foreground leading-none">Report an Issue</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {photoFile ? "✦ Azure Vision will analyze your photo directly." : "Upload a photo for AI visual damage assessment."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">

            {/* FORM */}
            {!isProcessing && !result && (
              <Card className="bg-white border-border shadow-sm rounded-xl">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-500/10 rounded-xl flex items-center justify-center">
                      <Wrench className="w-4 h-4 text-amber-600" strokeWidth={1.75} />
                    </div>
                    <CardTitle className="text-base font-display font-black uppercase tracking-wide">New Report</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">

                    <div>
                      <label className="block text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-2">Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
                        <Input value={location} onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g. Block A, Room 101" required
                          className="pl-9 bg-background border-border focus-visible:ring-primary" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-3">Issue Type</label>
                      <div className="grid grid-cols-4 gap-2">
                        {ISSUE_TYPES.map((t) => (
                          <button key={t.value} type="button" onClick={() => setIssueType(t.value)}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs transition-all ${
                              issueType === t.value
                                ? "border-primary bg-primary/5 text-foreground"
                                : "border-border bg-background text-muted-foreground hover:border-foreground/30"
                            }`}>
                            <span className="text-xl">{t.icon}</span>
                            <span className="text-[9px] leading-tight text-center">{t.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-2">Description</label>
                      <Textarea value={description} onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the issue — what broke, when it started, how severe it looks…"
                        required rows={4}
                        className="bg-background border-border focus-visible:ring-primary resize-none" />
                    </div>

                    {/* Photo Upload with Vision Badge */}
                    <div>
                      <label className="block text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-2">
                        Photo <span className="text-primary normal-case tracking-normal">— AI reads damage directly from image</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors bg-background">
                        <Camera className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                        <span className="text-sm text-muted-foreground">
                          {photoFile ? photoFile.name : "Tap to upload photo"}
                        </span>
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      </label>

                      {photo && (
                        <div className="mt-3 relative rounded-xl overflow-hidden border border-border">
                          <img src={photo} alt="Preview" className="w-full h-44 object-cover"
                            style={{ filter: photoScanning ? "contrast(1.5) saturate(0.2) brightness(1.1)" : "contrast(1.05)" }}
                          />
                          {photoScanning && (
                            <motion.div
                              className="absolute left-0 right-0 h-0.5 bg-primary/70"
                              initial={{ top: 0 }} animate={{ top: "100%" }}
                              transition={{ duration: 2, ease: "linear" }}
                            />
                          )}
                          <div className={`absolute top-2 right-2 px-2 py-1 rounded text-[9px] font-mono font-bold transition-all ${
                            photoScanning ? "bg-amber-500/90 text-white" : "bg-primary/90 text-primary-foreground"
                          }`}>
                            {photoScanning ? "⚡ ANALYZING..." : "✦ AI INDEXED"}
                          </div>
                          {!photoScanning && (
                            <div className={`absolute bottom-2 left-2 text-[9px] font-mono px-2 py-0.5 rounded ${cvContext ? "bg-emerald-600/90 text-white" : "bg-black/60 text-white"}`}>
                              {cvContext ? "✦ Azure CV + GPT Vision · Ready" : "Azure GPT Vision · Ready"}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <Button type="submit" disabled={photoScanning}
                      className="w-full h-11 font-display font-black uppercase tracking-wide bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
                      {photoFile ? "Analyze Photo & Submit" : "Analyze & Submit Report"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* PROCESSING */}
            {isProcessing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-32 space-y-6">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-2 border-amber-500/20 animate-ping" />
                  <div className="w-20 h-20 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-amber-600 font-display font-black uppercase tracking-widest text-sm">
                    {photoFile ? "Azure Vision Analyzing…" : "Analyzing Severity…"}
                  </p>
                  <p className="text-muted-foreground text-sm mt-2 font-mono">
                    {photoFile ? "GPT-4.1-mini is reading the damage from your photo" : "AI is scoring the damage level"}
                  </p>
                </div>
              </motion.div>
            )}

            {/* RESULT */}
            {result && !isProcessing && (
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4">
                {patternWarning && (
                  <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" strokeWidth={1.75} />
                    <div>
                      <p className="text-[8px] font-mono tracking-widest text-amber-600/70 uppercase mb-0.5">Pattern Detected</p>
                      <p className="text-xs text-amber-700 leading-relaxed">{patternWarning}</p>
                    </div>
                  </div>
                )}

                <Card className="bg-white border-border shadow-sm rounded-xl overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-destructive" />
                  <CardHeader>
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-amber-500/10 rounded-xl flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-amber-600" strokeWidth={1.75} />
                        </div>
                        <div>
                          <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">
                            {photoFile ? "✦ Vision Analysis" : "Text Analysis"} · {result.reportId}
                          </p>
                          <CardTitle className="text-base font-display font-black uppercase tracking-wide">AI Assessment Complete</CardTitle>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded border ${PRIORITY_STYLE[result.priority] ?? PRIORITY_STYLE.medium}`}>
                        {result.priority?.toUpperCase()} PRIORITY
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">

                    {/* Vision notes */}
                    {result.vision_notes && result.vision_notes !== "N/A — no photo provided" && (
                      <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl">
                        <p className="text-[8px] font-mono tracking-widest text-primary/70 uppercase mb-1">✦ Azure Vision Observation</p>
                        <p className="text-sm text-foreground leading-relaxed italic">"{result.vision_notes}"</p>
                      </div>
                    )}

                    {result.safety_hazard && (
                      <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-xl">
                        <AlertTriangle className="w-4 h-4 text-destructive" strokeWidth={1.75} />
                        <p className="text-xs text-destructive font-bold">Safety hazard detected — admin notified via WhatsApp</p>
                      </div>
                    )}

                    <div className="bg-secondary/40 p-4 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Severity Score</p>
                        <span className="text-lg font-display font-black text-foreground">{result.severity} <span className="text-sm text-muted-foreground font-sans font-normal">/ 5</span></span>
                      </div>
                      <div className="w-full bg-border rounded-full h-3 overflow-hidden">
                        <motion.div className={`h-full rounded-full ${sevColor}`}
                          initial={{ width: 0 }} animate={{ width: `${sevPct}%` }}
                          transition={{ duration: 1, ease: "easeOut" }} />
                      </div>
                      <div className="flex justify-between mt-1.5 text-[9px] font-mono text-muted-foreground">
                        <span>Minimal</span><span>Critical</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Category",        value: result.category,       color: "text-primary" },
                        { label: "Est. Resolution", value: result.estimatedTime,  color: "text-indigo-600" },
                      ].map((item) => (
                        <div key={item.label} className="bg-secondary/40 p-4 rounded-xl">
                          <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-1">{item.label}</p>
                          <p className={`text-sm font-display font-black capitalize ${item.color}`}>{item.value}</p>
                        </div>
                      ))}
                    </div>

                    <Button onClick={reset} variant="outline" className="w-full h-11 font-display font-black uppercase tracking-wide rounded-xl">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Report Another Issue
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            <Card className="bg-white border-border shadow-sm rounded-xl">
              <CardHeader className="pb-2">
                <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Response Times</p>
                <CardTitle className="text-sm font-display font-black uppercase tracking-wide">SLA by Priority</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { level: "Critical", time: "2 hours",  color: "text-destructive",  dot: "bg-destructive" },
                  { level: "High",     time: "6 hours",  color: "text-orange-600",   dot: "bg-orange-500" },
                  { level: "Medium",   time: "24 hours", color: "text-amber-600",    dot: "bg-amber-500" },
                  { level: "Low",      time: "3 days",   color: "text-emerald-600",  dot: "bg-emerald-500" },
                ].map((s) => (
                  <div key={s.level} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                      <p className="text-[10px] font-mono text-muted-foreground uppercase">{s.level}</p>
                    </div>
                    <p className={`text-xs font-display font-black ${s.color}`}>{s.time}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20 rounded-xl">
              <CardContent className="p-5">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" strokeWidth={1.75} />
                  <div>
                    <p className="text-[8px] font-mono tracking-widest text-primary/70 uppercase mb-1">✦ Azure Vision Active</p>
                    <p className="text-xs text-primary/80 leading-relaxed">
                      Uploading a photo lets GPT-4.1-mini see and analyze the actual damage — not just your description. Severity scores are more accurate with photos.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-amber-500/5 border-amber-500/20 rounded-xl">
              <CardContent className="p-5">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" strokeWidth={1.75} />
                  <div>
                    <p className="text-[8px] font-mono tracking-widest text-amber-600/70 uppercase mb-1">Emergency</p>
                    <p className="text-xs text-amber-700/80 leading-relaxed">
                      For electrical or gas emergencies, call security at ext. 1001 immediately while filing this report.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
