import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageLayout } from "@/components/PageLayout";
import { PackageSearch, MapPin, Calendar, CheckCircle2, Info, Shield, Clock } from "lucide-react";
import { useCampusOS } from "@/contexts/CampusOSContext";

const ITEM_CATEGORIES = [
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

export default function FoundReport() {
  const { addFoundItem, addNotification } = useCampusOS();
  const [category, setCategory] = useState("");
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [caseId] = useState(`FND-2026-${Math.floor(100 + Math.random() * 900)}`);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setPhoto(URL.createObjectURL(e.target.files[0]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addFoundItem({
      id: caseId, item: itemName, description, location, date, category,
    });
    addNotification({ text: `Found item reported: ${itemName}`, time: "just now", type: "match" });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <PageLayout>
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <p className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase mb-1">Module · Lost & Found</p>
            <h1 className="text-3xl font-display font-black uppercase tracking-wide text-foreground leading-none">Report Submitted</h1>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-white border-border shadow-sm rounded-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-emerald-500 via-primary to-emerald-500/50" />
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" strokeWidth={1.75} />
                </div>
                <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-1">Report Filed</p>
                <p className="text-2xl font-display font-black text-foreground uppercase tracking-wide mb-1">Thank You!</p>
                <p className="text-sm text-muted-foreground mb-6">Your found item report helps reconnect owners with their belongings.</p>

                <div className="inline-block bg-secondary/50 rounded-xl px-6 py-3 border border-border mb-8">
                  <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-0.5">Case ID</p>
                  <p className="text-xl font-mono font-bold text-primary">{caseId}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mb-8">
                  {[
                    { icon: Shield,      title: "Item Secured",   desc: "Your report is now in our system. Matching runs every 30 minutes." },
                    { icon: Clock,       title: "24h Response",   desc: "If we find a match, both parties are notified within 24 hours." },
                    { icon: MapPin,      title: "Drop Off",       desc: "Please hand the item to the Security Desk or Lost & Found Box." },
                  ].map((s) => (
                    <div key={s.title} className="bg-secondary/40 rounded-xl p-4">
                      <s.icon className="w-4 h-4 text-primary mb-2" strokeWidth={1.75} />
                      <p className="text-xs font-display font-black uppercase tracking-wide text-foreground mb-1">{s.title}</p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">{s.desc}</p>
                    </div>
                  ))}
                </div>

                <Button onClick={() => setSubmitted(false)} variant="outline" className="font-display font-black uppercase tracking-wide rounded-xl">
                  Report Another Item
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase mb-1">Module · Lost & Found</p>
          <h1 className="text-3xl font-display font-black uppercase tracking-wide text-foreground leading-none">Report Found Item</h1>
          <p className="text-sm text-muted-foreground mt-1">Help reconnect owners with their belongings — AI will match it automatically.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Form ── */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-border shadow-sm rounded-xl">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                    <PackageSearch className="w-4 h-4 text-emerald-600" strokeWidth={1.75} />
                  </div>
                  <CardTitle className="text-base font-display font-black uppercase tracking-wide">New Report</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">

                  <div>
                    <label className="block text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-3">Item Category</label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {ITEM_CATEGORIES.map((t) => (
                        <button key={t.label} type="button" onClick={() => setCategory(t.label)}
                          className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs transition-all ${
                            category === t.label
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
                    <label className="block text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-2">Item Name</label>
                    <Input value={itemName} onChange={(e) => setItemName(e.target.value)} required
                      placeholder="e.g. Metal water flask, black backpack…"
                      className="bg-background border-border focus-visible:ring-primary" />
                  </div>

                  <div>
                    <label className="block text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-2">Description & Condition</label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                      placeholder="Condition, color, brand, any identifying features (stickers, scratches, engravings)…"
                      className="bg-background border-border focus-visible:ring-primary resize-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-2">Location Found</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
                        <Input value={location} onChange={(e) => setLocation(e.target.value)} required
                          placeholder="e.g. Library 2nd Floor" className="pl-9 bg-background border-border focus-visible:ring-primary" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-2">Date Found</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
                        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                          className="pl-9 bg-background border-border focus-visible:ring-primary" />
                      </div>
                    </div>
                  </div>

                  {/* Campus map mock */}
                  <div>
                    <label className="block text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-2">Pin on Map</label>
                    <div className="w-full h-36 bg-secondary/30 border border-border rounded-xl flex items-center justify-center relative cursor-pointer hover:border-primary transition-colors overflow-hidden group">
                      <svg viewBox="0 0 400 150" className="absolute inset-0 w-full h-full opacity-20">
                        <rect width="400" height="150" fill="none" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4,4" />
                        <line x1="200" y1="0" x2="200" y2="150" stroke="hsl(var(--border))" strokeWidth="0.5" />
                        <line x1="0" y1="75" x2="400" y2="75" stroke="hsl(var(--border))" strokeWidth="0.5" />
                      </svg>
                      <div className="absolute top-8 left-1/2 w-4 h-4 bg-destructive rounded-full border-2 border-white shadow-md" />
                      <p className="text-muted-foreground text-sm group-hover:text-primary transition-colors">Tap to pin exact location</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-2">Photo</label>
                    <Input type="file" accept="image/*" onChange={handlePhotoUpload}
                      className="bg-background border-border file:text-foreground file:font-mono file:text-xs" />
                    {photo && (
                      <img src={photo} alt="Preview" className="mt-3 w-full h-36 object-cover rounded-xl border border-border" />
                    )}
                  </div>

                  <Button type="submit" disabled={!itemName || !location}
                    className="w-full h-11 font-display font-black uppercase tracking-wide bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                    Submit Found Report
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* ── Right Info ── */}
          <div className="space-y-4">
            <Card className="bg-white border-border shadow-sm rounded-xl">
              <CardHeader className="pb-2">
                <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">What Happens Next</p>
                <CardTitle className="text-sm font-display font-black uppercase tracking-wide">Process</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { step: "01", text: "Your report enters the AI matching queue immediately." },
                  { step: "02", text: "AI compares against active lost item reports every 30 minutes." },
                  { step: "03", text: "If a match is found, both parties are notified." },
                  { step: "04", text: "A claim code is generated for secure handover." },
                ].map((s) => (
                  <div key={s.step} className="flex gap-3">
                    <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 rounded px-1.5 py-0.5 h-fit shrink-0">{s.step}</span>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{s.text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white border-border shadow-sm rounded-xl">
              <CardHeader className="pb-2">
                <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">This Month</p>
                <CardTitle className="text-sm font-display font-black uppercase tracking-wide">Impact Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Items Reunited",  value: "28",  color: "text-emerald-600" },
                  { label: "Avg Match Time",  value: "4.2h", color: "text-primary" },
                  { label: "Active Cases",    value: "14",  color: "text-amber-600" },
                  { label: "Match Rate",      value: "72%", color: "text-indigo-600" },
                ].map((m) => (
                  <div key={m.label} className="flex justify-between items-center">
                    <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">{m.label}</p>
                    <p className={`text-sm font-display font-black ${m.color}`}>{m.value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-emerald-500/5 border-emerald-500/20 shadow-sm rounded-xl">
              <CardContent className="p-5">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" strokeWidth={1.75} />
                  <div>
                    <p className="text-[8px] font-mono tracking-widest text-emerald-600/70 uppercase mb-1">Secure Handover</p>
                    <p className="text-xs text-emerald-700/80 leading-relaxed">
                      Never hand over items to someone without verifying their claim code. Use the Security Desk if unsure.
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
