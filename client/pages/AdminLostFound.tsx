import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLayout } from "@/components/PageLayout";
import { useCampusOS } from "@/contexts/CampusOSContext";
import { mockLostItems, mockFoundItems } from "@/lib/mockData";
import { sendWhatsAppAlert } from "@/lib/whatsapp";
import { ScanSearch, CheckCircle2, MapPin, Calendar, MessageSquare, Eye, QrCode, Share2 } from "lucide-react";

export default function AdminLostFound() {
  const { lostItems, foundItems } = useCampusOS();
  const allLost = [...mockLostItems, ...lostItems.filter(i => !mockLostItems.find(m => m.id === i.id))];
  const allFound = [...mockFoundItems, ...foundItems.filter(i => !mockFoundItems.find(m => m.id === i.id))];

  const [tab, setTab] = useState<"lost" | "found" | "reunited">("lost");
  const [approved, setApproved] = useState<Set<string>>(new Set(allLost.map(i => i.id)));
  const [rejected, setRejected] = useState<Set<string>>(new Set());
  const [reunited, setReunited] = useState<Set<string>>(new Set());
  const [notified, setNotified] = useState<Set<string>>(new Set());

  const handleApprove = (id: string) => setApproved(p => new Set([...p, id]));
  const handleReject  = (id: string) => { setRejected(p => new Set([...p, id])); setApproved(p => { const n = new Set(p); n.delete(id); return n; }); };
  const handleReunite = (id: string) => setReunited(p => new Set([...p, id]));

  const handleNotify = async (item: typeof allLost[0]) => {
    await sendWhatsAppAlert({
      type: "lost_found",
      title: "Lost Item Status Update",
      body: `${item.item}\nCase ID: ${item.caseId}\nRecovery Probability: ${item.recoveryProbability ?? 65}%\nPoster Views: ${item.posterViews ?? 0} · QR Scans: ${item.qrScans ?? 0}`,
      ticketId: item.caseId,
    });
    setNotified(p => new Set([...p, item.id]));
  };

  const totalViews = allLost.reduce((s, i) => s + (i.posterViews ?? 0), 0);
  const totalMatches = allLost.reduce((s, i) => s + (i.potentialMatches ?? 0), 0);

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto space-y-8">

        <div>
          <p className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase mb-1">Admin · Lost & Found</p>
          <h1 className="text-3xl font-display font-black uppercase tracking-wide text-foreground leading-none">Lost & Found Moderation</h1>
          <p className="text-sm text-muted-foreground mt-1">Approve reports, verify claims, mark reunions.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Cases",     value: allLost.filter(i => !reunited.has(i.id)).length, color: "text-primary",    icon: ScanSearch },
            { label: "Poster Views",     value: totalViews,                                       color: "text-indigo-600", icon: Eye },
            { label: "AI Matches",       value: totalMatches,                                     color: "text-amber-600",  icon: Share2 },
            { label: "Reunited",         value: reunited.size,                                    color: "text-emerald-600",icon: CheckCircle2 },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className="bg-white border-border shadow-sm rounded-xl">
                <CardContent className="p-4 flex items-center gap-3">
                  <s.icon className={`w-5 h-5 ${s.color}`} strokeWidth={1.75} />
                  <div>
                    <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">{s.label}</p>
                    <p className={`text-2xl font-display font-black ${s.color}`}>{s.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(["lost", "found", "reunited"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest border transition-all ${
                tab === t ? "bg-primary text-primary-foreground border-primary" : "bg-white text-muted-foreground border-border hover:border-foreground/30"
              }`}>
              {t === "lost" ? `Lost Items (${allLost.length})` : t === "found" ? `Found Items (${allFound.length})` : `Reunited (${reunited.size})`}
            </button>
          ))}
        </div>

        {/* Lost Items */}
        {tab === "lost" && (
          <div className="space-y-3">
            {allLost.filter(i => !reunited.has(i.id)).map((item, idx) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Card className={`bg-white shadow-sm rounded-xl overflow-hidden ${rejected.has(item.id) ? "opacity-40" : ""}`}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-mono text-muted-foreground">{item.caseId}</span>
                          {approved.has(item.id) && !rejected.has(item.id) && (
                            <span className="text-[9px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full">Approved</span>
                          )}
                          {rejected.has(item.id) && (
                            <span className="text-[9px] font-mono px-2 py-0.5 bg-destructive/10 text-destructive rounded-full">Rejected</span>
                          )}
                        </div>
                        <h3 className="text-sm font-display font-black text-foreground uppercase">{item.item}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-[9px] font-mono text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{item.date}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-xl font-display font-black ${(item.recoveryProbability ?? 65) >= 70 ? "text-emerald-600" : "text-amber-600"}`}>
                          {item.recoveryProbability ?? 65}%
                        </p>
                        <p className="text-[9px] font-mono text-muted-foreground">recovery</p>
                      </div>
                    </div>

                    {/* Campaign stats */}
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { icon: Eye,        label: "Views",   value: item.posterViews ?? 0 },
                        { icon: QrCode,     label: "Scans",   value: item.qrScans ?? 0 },
                        { icon: Share2,     label: "Shares",  value: item.shares ?? 0 },
                        { icon: ScanSearch, label: "Matches", value: item.potentialMatches ?? 0 },
                      ].map((stat) => (
                        <div key={stat.label} className="bg-secondary/30 rounded-lg p-2 text-center">
                          <p className="text-[8px] font-mono text-muted-foreground uppercase">{stat.label}</p>
                          <p className="text-sm font-display font-black text-foreground">{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {!approved.has(item.id) && !rejected.has(item.id) && (
                        <>
                          <button onClick={() => handleApprove(item.id)}
                            className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 rounded-xl text-[10px] font-mono font-bold">
                            Approve
                          </button>
                          <button onClick={() => handleReject(item.id)}
                            className="px-3 py-1.5 bg-destructive/10 border border-destructive/30 text-destructive rounded-xl text-[10px] font-mono font-bold">
                            Reject
                          </button>
                        </>
                      )}
                      <button onClick={() => handleNotify(item)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[9px] font-mono transition-all ${
                          notified.has(item.id)
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                            : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                        }`}>
                        <MessageSquare className="w-3 h-3" />
                        {notified.has(item.id) ? "Notified" : "WhatsApp Update"}
                      </button>
                      <button onClick={() => handleReunite(item.id)}
                        className="flex items-center gap-1 px-2 py-1 ml-auto bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 rounded-xl text-[9px] font-mono">
                        <CheckCircle2 className="w-3 h-3" />Mark Reunited
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Found Items */}
        {tab === "found" && (
          <div className="space-y-3">
            {allFound.map((item, idx) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Card className="bg-white border-border shadow-sm rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 flex-wrap">
                      <div className="flex-1">
                        <span className="text-[9px] font-mono text-muted-foreground block mb-1">{item.id}</span>
                        <h3 className="text-sm font-display font-black text-foreground uppercase">{item.item}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-[9px] font-mono text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{item.date}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full self-start">
                        At Security Desk
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Reunited */}
        {tab === "reunited" && (
          <div className="space-y-3">
            {reunited.size === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-4 opacity-30" strokeWidth={1.5} />
                <p className="font-display font-black uppercase tracking-wide">No reunions yet today</p>
              </div>
            ) : (
              [...reunited].map((id, idx) => {
                const item = allLost.find(i => i.id === id);
                return item ? (
                  <motion.div key={id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
                    <Card className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                      <CardContent className="p-4 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" strokeWidth={1.75} />
                        <div>
                          <p className="text-sm font-display font-black text-foreground uppercase">{item.item}</p>
                          <p className="text-xs text-muted-foreground">Case {item.caseId} · Reunited successfully</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : null;
              })
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
