import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { callGPT, callGPTWithImage, fileToBase64 } from "@/lib/openai";
import { analyzeImageWithCV, cvResultToContext } from "@/lib/azureCV";
import { sendWhatsAppAlert } from "@/lib/whatsapp";
import { PageLayout } from "@/components/PageLayout";
import {
  ScanSearch, MapPin, Calendar, RotateCcw, Share2,
  Eye, QrCode, TrendingUp, CheckCircle2,
} from "lucide-react";
import { useCampusOps } from "@/contexts/CampusOpsContext";

const ITEM_TYPES = [
  { icon: "💳", label: "ID Card" },
  { icon: "💻", label: "Laptop" },
  { icon: "📱", label: "Phone" },
  { icon: "🔑", label: "Keys" },
  { icon: "👜", label: "Bag" },
  { icon: "👓", label: "Glasses" },
  { icon: "💰", label: "Wallet" },
  { icon: "📚", label: "Books" },
  { icon: "⌚", label: "Watch" },
  { icon: "🎧", label: "Earphones" },
  { icon: "➕", label: "Other" },
];

const LOADING_STEPS = [
  "Extracting visual features…",
  "Analyzing description…",
  "Calculating recovery probability…",
  "Generating poster…",
  "Creating QR code…",
];

export default function LostReport() {
  const { addLostItem, addNotification } = useCampusOps();
  const [itemType, setItemType] = useState("");
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [cvContext, setCvContext] = useState<string | null>(null);
  const [photoScanning, setPhotoScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoScanning(true);
    setCvContext(null);
    setPhoto(URL.createObjectURL(file));
    try {
      const cv = await analyzeImageWithCV(file);
      setCvContext(cvResultToContext(cv));
    } catch {
      // CV unavailable — GPT vision handles alone
    } finally {
      setPhotoScanning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setResult(null);
    setLoadingStep(0);
    const stepInterval = setInterval(() => {
      setLoadingStep((p) => (p < LOADING_STEPS.length - 1 ? p + 1 : p));
    }, 450);
    const caseId = `LF-2026-${Math.floor(100 + Math.random() * 900)}`;
    const cvNote = cvContext ? `\n\nAzure Computer Vision pre-analysis of the uploaded photo:\n${cvContext}\n\nUse this visual data to improve feature extraction accuracy.` : "";
    const systemPrompt = `You are a lost item recovery AI.${photoFile ? " A photo of the item has been provided — analyze its visual details carefully." : ""}${cvNote} Return ONLY this JSON:
{"unique_features":["f1","f2","f3"],"recovery_probability":0,"recommended_action":"one sentence","best_zones_to_check":["z1","z2"],"urgency_level":"High|Medium|Low","whatsapp_message":"short shareable message"${photoFile ? ',"visual_description":"what you see in the photo"' : ""}}`;
    const userMsg = `Item: ${itemName} (${itemType})\nDescription: ${description}\nLast Seen: ${location}\nDate: ${date}`;
    try {
      let raw: string;
      if (photoFile) {
        try {
          const b64 = await fileToBase64(photoFile);
          raw = await callGPTWithImage(systemPrompt, userMsg, b64, photoFile.type || "image/jpeg");
        } catch (visionErr) {
          console.warn("Vision analysis failed, falling back to text-only recovery assessment:", visionErr);
          const fallbackSystemPrompt = `You are a lost item recovery AI. Return ONLY this JSON:
{"unique_features":["f1","f2","f3"],"recovery_probability":0,"recommended_action":"one sentence","best_zones_to_check":["z1","z2"],"urgency_level":"High|Medium|Low","whatsapp_message":"short shareable message","visual_description":"AI analysis unavailable (using CV details: ${cvContext || 'None'})"}`;
          raw = await callGPT(fallbackSystemPrompt, userMsg);
        }
      } else {
        raw = await callGPT(systemPrompt, userMsg);
      }
      const parsed = JSON.parse(raw.trim().replace(/```json/g, "").replace(/```/g, ""));
      addLostItem({
        id: caseId, item: itemName, description, location, date,
        category: itemType, caseId,
        recoveryProbability: parsed.recovery_probability || 65,
        posterViews: 0, qrScans: 0, shares: 0, potentialMatches: 0,
      });
      addNotification({ text: `Lost item reported: ${itemName}`, time: "just now", type: "match" });
      sendWhatsAppAlert({
        type: "lost_found",
        title: `🔍 New Lost Item Report`,
        body: `${itemName} (${itemType})\nLast seen: ${location}\nRecovery probability: ${parsed.recovery_probability ?? 65}%`,
        ticketId: caseId,
      });
      setResult({ ...parsed, caseId });
    } catch {
      addLostItem({
        id: caseId, item: itemName, description, location, date,
        category: itemType, caseId,
        recoveryProbability: itemType === "ID Card" ? 72 : itemType === "Laptop" ? 58 : 65,
        posterViews: 0, qrScans: 0, shares: 0, potentialMatches: 0,
      });
      addNotification({ text: `Lost item reported: ${itemName}`, time: "just now", type: "match" });
      setResult({
        caseId,
        unique_features: [itemName, location ? `Last seen at ${location}` : "Unknown location", "Check nearby areas"],
        recovery_probability: itemType === "ID Card" ? 72 : itemType === "Laptop" ? 58 : 65,
        recommended_action: "Report to the security desk and post in campus groups immediately.",
        best_zones_to_check: [location || "Security Desk", "Lost & Found Box", "Library Help Desk"],
        urgency_level: "Medium",
        whatsapp_message: `🚨 LOST: ${itemName}\nLast seen at ${location} on ${date}\nCase ID: ${caseId}\nIf found: Campus Ops.app/found`,
      });
    } finally {
      clearInterval(stepInterval);
      setLoadingStep(LOADING_STEPS.length - 1);
      setTimeout(() => setIsProcessing(false), 300);
    }
  };

  const qrUrl = result
    ? `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(`Campus Ops.app/lost/${result.caseId}`)}&format=svg`
    : "";

  const shareWhatsApp = () => {
    if (!result) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(result.whatsapp_message)}`, "_blank");
  };
  const shareTelegram = () => {
    if (!result) return;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(`Campus Ops.app/lost/${result.caseId}`)}&text=${encodeURIComponent(result.whatsapp_message)}`, "_blank");
  };
  const copyLink = () => {
    navigator.clipboard.writeText(`Campus Ops.app/lost/${result.caseId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setResult(null); setItemType(""); setItemName(""); setDescription("");
    setLocation(""); setPhoto(null);
  };

  const recovColor = (p: number) =>
    p >= 70 ? "text-emerald-600" : p >= 50 ? "text-amber-600" : "text-orange-600";
  const recovBar = (p: number) =>
    p >= 70 ? "bg-emerald-500" : p >= 50 ? "bg-amber-500" : "bg-orange-500";

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase mb-1">Module · Lost & Found</p>
          <h1 className="text-3xl font-display font-black uppercase tracking-wide text-foreground leading-none">Report Lost Item</h1>
          <p className="text-sm text-muted-foreground mt-1">AI generates a full recovery campaign — poster, QR code & share links — instantly.</p>
        </div>

        <AnimatePresence mode="wait">

          {/* ── FORM ── */}
          {!isProcessing && !result && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card className="bg-white border-border shadow-sm rounded-xl">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-destructive/10 rounded-xl flex items-center justify-center">
                          <ScanSearch className="w-4 h-4 text-destructive" strokeWidth={1.75} />
                        </div>
                        <CardTitle className="text-base font-display font-black uppercase tracking-wide">New Report</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-6">

                        <div>
                          <label className="block text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-3">Item Type</label>
                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {ITEM_TYPES.map((t) => (
                              <button key={t.label} type="button" onClick={() => setItemType(t.label)}
                                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs transition-all ${itemType === t.label
                                    ? "border-primary bg-primary/5 text-foreground"
                                    : "border-border bg-background text-muted-foreground hover:border-foreground/30"
                                  }`}>
                                <span className="text-lg">{t.icon}</span>
                                <span className="text-[9px]">{t.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-2">Item Name & Brand</label>
                          <Input value={itemName} onChange={(e) => setItemName(e.target.value)} required
                            placeholder="e.g. Black Lenovo ThinkPad"
                            className="bg-background border-border focus-visible:ring-primary" />
                        </div>

                        <div>
                          <label className="block text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-2">Description</label>
                          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                            placeholder="Anything unique: scratches, stickers, name written on it…"
                            className="bg-background border-border focus-visible:ring-primary resize-none" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-2">Last Seen Location</label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
                              <Input value={location} onChange={(e) => setLocation(e.target.value)}
                                placeholder="e.g. Central Library" className="pl-9 bg-background border-border focus-visible:ring-primary" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-2">Date</label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
                              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                                className="pl-9 bg-background border-border focus-visible:ring-primary" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-2">
                            Photo <span className="text-muted-foreground normal-case tracking-normal font-sans font-normal">(3× higher match rate)</span>
                          </label>
                          <Input type="file" accept="image/*" onChange={handlePhotoUpload}
                            className="bg-background border-border file:text-foreground file:font-mono file:text-xs" />
                          {photo && (
                            <div className="mt-3 relative rounded-xl overflow-hidden border border-border">
                              <img src={photo} alt="Preview" className="w-full h-36 object-cover transition-all duration-700"
                                style={{ filter: photoScanning ? "contrast(1.3) saturate(0.2)" : "none" }} />
                              {photoScanning ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                  <motion.div className="absolute w-full h-0.5 bg-primary" initial={{ top: 0 }} animate={{ top: "100%" }} transition={{ duration: 1.5, repeat: Infinity }} style={{ position: "absolute" }} />
                                  <p className="text-primary font-display font-black uppercase tracking-widest text-xs z-10">Scanning…</p>
                                </div>
                              ) : (
                                <div className="absolute top-2 right-2 bg-primary/90 px-2 py-1 rounded text-[9px] text-primary-foreground font-mono font-bold">AI INDEXED</div>
                              )}
                            </div>
                          )}
                        </div>

                        <Button type="submit" disabled={!itemName}
                          className="w-full h-11 font-display font-black uppercase tracking-wide bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
                          Generate Recovery Campaign
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card className="bg-white border-border shadow-sm rounded-xl">
                    <CardContent className="p-5">
                      <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-3">AI Does This</p>
                      <div className="space-y-3">
                        {[
                          { icon: QrCode, text: "Auto-generates QR code poster" },
                          { icon: Share2, text: "Creates WhatsApp & Telegram share links" },
                          { icon: Eye, text: "Tracks poster views & QR scans" },
                          { icon: TrendingUp, text: "Predicts recovery probability" },
                          { icon: MapPin, text: "Recommends zones to check" },
                        ].map((f, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <f.icon className="w-3.5 h-3.5 text-primary shrink-0" strokeWidth={1.75} />
                            <p className="text-[11px] text-muted-foreground">{f.text}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/5 border-primary/20 shadow-sm rounded-xl">
                    <CardContent className="p-5">
                      <p className="text-[8px] font-mono tracking-widest text-primary/70 uppercase mb-1">Pro Tip</p>
                      <p className="text-xs text-primary/80 leading-relaxed">Items with a photo are matched 3× faster. Even a blurry photo helps the AI identify unique features.</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── PROCESSING ── */}
          {isProcessing && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 space-y-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
                <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-primary font-display font-black uppercase tracking-widest text-sm">Creating Recovery Campaign</p>
                <motion.p key={loadingStep} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  className="text-muted-foreground text-sm mt-2 font-mono">{LOADING_STEPS[loadingStep]}</motion.p>
                <div className="flex gap-1 justify-center mt-4">
                  {LOADING_STEPS.map((_, i) => (
                    <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i <= loadingStep ? "w-6 bg-primary" : "w-3 bg-secondary"}`} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── RESULT ── */}
          {result && !isProcessing && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Poster */}
                <div className="lg:col-span-2 space-y-5">
                  <Card className="bg-white border-2 border-primary/30 shadow-sm rounded-xl overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-destructive via-amber-500 to-primary" />
                    <div className="bg-primary px-6 py-3 text-center">
                      <p className="text-primary-foreground font-display font-black uppercase tracking-widest text-sm">🚨 Lost Item Alert</p>
                    </div>
                    <div className="p-6 flex flex-col sm:flex-row gap-6">
                      <div className="flex-1">
                        <p className="text-2xl font-display font-black text-foreground uppercase tracking-wide">{itemName}</p>
                        {itemType && (
                          <p className="text-sm text-primary mt-1 mb-3">
                            {ITEM_TYPES.find((t) => t.label === itemType)?.icon} {itemType}
                          </p>
                        )}
                        <div className="space-y-1 text-sm text-muted-foreground mb-4">
                          <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />{location || "Unknown"}</p>
                          <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />{date}</p>
                        </div>
                        <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-2">Unique Features</p>
                        {result.unique_features?.map((f: string, i: number) => (
                          <p key={i} className="text-sm text-muted-foreground">• {f}</p>
                        ))}
                        <div className="mt-4 inline-block bg-secondary/50 rounded-xl px-4 py-2 border border-border">
                          <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Case ID</p>
                          <p className="text-primary font-mono font-bold text-lg">{result.caseId}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-3 shrink-0">
                        <div className="bg-white p-2 rounded-xl border border-border">
                          <img src={qrUrl} alt="QR Code" className="w-32 h-32" />
                        </div>
                        <p className="text-[10px] font-mono text-muted-foreground text-center">Scan to report finding</p>
                      </div>
                    </div>

                    {/* Recovery bar */}
                    <div className="px-6 pb-5">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Recovery Probability</p>
                        <span className={`text-lg font-display font-black ${recovColor(result.recovery_probability)}`}>
                          {result.recovery_probability}%
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2.5">
                        <motion.div className={`h-2.5 rounded-full ${recovBar(result.recovery_probability)}`}
                          initial={{ width: 0 }} animate={{ width: `${result.recovery_probability}%` }}
                          transition={{ duration: 1, delay: 0.3 }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-2">{result.recommended_action}</p>
                    </div>
                  </Card>

                  {/* Zones */}
                  {result.best_zones_to_check?.length > 0 && (
                    <Card className="bg-white border-border shadow-sm rounded-xl">
                      <CardContent className="p-5">
                        <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-3">Best Zones to Check</p>
                        <div className="flex flex-wrap gap-2">
                          {result.best_zones_to_check.map((zone: string, i: number) => (
                            <span key={i} className="flex items-center gap-1 text-xs bg-primary/5 text-primary border border-primary/20 px-3 py-1.5 rounded-full">
                              <MapPin className="w-3 h-3" strokeWidth={1.75} />{zone}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Share */}
                  <Card className="bg-white border-border shadow-sm rounded-xl">
                    <CardContent className="p-5">
                      <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-3">Share Campaign</p>
                      <div className="grid grid-cols-3 gap-3">
                        <button onClick={shareWhatsApp}
                          className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-600 hover:bg-emerald-500/10 transition-colors text-sm font-medium">
                          💬 WhatsApp
                        </button>
                        <button onClick={shareTelegram}
                          className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-blue-500/30 bg-blue-500/5 text-blue-600 hover:bg-blue-500/10 transition-colors text-sm font-medium">
                          ✈️ Telegram
                        </button>
                        <button onClick={copyLink}
                          className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-colors text-sm font-medium">
                          {copied ? <CheckCircle2 className="w-4 h-4" strokeWidth={1.75} /> : "🔗"} {copied ? "Copied!" : "Copy Link"}
                        </button>
                      </div>
                    </CardContent>
                  </Card>

                  <Button onClick={reset} variant="outline" className="w-full h-11 font-display font-black uppercase tracking-wide rounded-xl">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Report Another Item
                  </Button>
                </div>

                {/* Campaign Stats */}
                <div className="space-y-4">
                  <Card className="bg-white border-border shadow-sm rounded-xl">
                    <CardHeader className="pb-2">
                      <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Live Campaign</p>
                      <CardTitle className="text-sm font-display font-black uppercase tracking-wide">Recovery Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { label: "Poster Views", value: 0, icon: Eye, color: "text-primary" },
                        { label: "QR Scans", value: 0, icon: QrCode, color: "text-indigo-600" },
                        { label: "Shares", value: 0, icon: Share2, color: "text-emerald-600" },
                        { label: "Potential Matches", value: 0, icon: ScanSearch, color: "text-amber-600" },
                      ].map((s) => (
                        <div key={s.label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <s.icon className={`w-3.5 h-3.5 ${s.color}`} strokeWidth={1.75} />
                            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">{s.label}</p>
                          </div>
                          <p className={`text-sm font-display font-black ${s.color}`}>{s.value}</p>
                        </div>
                      ))}
                      <p className="text-[9px] font-mono text-muted-foreground pt-2 border-t border-border">Stats update as people view your poster</p>
                    </CardContent>
                  </Card>

                  <Card className={`border shadow-sm rounded-xl ${result.urgency_level === "High" ? "bg-destructive/5 border-destructive/20" : result.urgency_level === "Medium" ? "bg-amber-500/5 border-amber-500/20" : "bg-emerald-500/5 border-emerald-500/20"}`}>
                    <CardContent className="p-5">
                      <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-1">Urgency</p>
                      <p className={`text-xl font-display font-black uppercase ${result.urgency_level === "High" ? "text-destructive" : result.urgency_level === "Medium" ? "text-amber-600" : "text-emerald-600"}`}>
                        {result.urgency_level}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
}
