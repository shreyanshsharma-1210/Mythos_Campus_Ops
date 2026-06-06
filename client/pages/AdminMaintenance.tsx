import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLayout } from "@/components/PageLayout";
import { useCampusOps } from "@/contexts/CampusOpsContext";
import { sendWhatsAppAlert } from "@/lib/whatsapp";
import { callGPT } from "@/lib/openai";
import { Wrench, AlertTriangle, CheckCircle2, Calendar, Users, MessageSquare, Zap } from "lucide-react";

const PRIORITY_STYLE: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/30",
  high: "bg-orange-500/10 text-orange-600 border-orange-500/30",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  low: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
};

const STAFF_MEMBERS = [
  { name: "Ramesh (Electrician)", specialty: "electrical", load: 2 },
  { name: "Suresh (Plumber)", specialty: "plumbing", load: 1 },
  { name: "Arjun (Maintenance)", specialty: "general", load: 3 },
];

export default function AdminMaintenance() {
  const { maintenanceReports: allIssues, updateMaintenanceStatus } = useCampusOps();
  const [assignMap, setAssignMap] = useState<Record<string, string>>({});
  const [workOrder, setWorkOrder] = useState<string | null>(null);
  const [workOrderLoading, setWorkOrderLoading] = useState(false);
  const [notified, setNotified] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "safety" | "pattern">("all");

  const filtered = allIssues.filter((r) => {
    if (filter === "safety") return r.safetyRisk;
    if (filter === "pattern") return r.patternDetected;
    return true;
  });

  const patternBlocks = allIssues.filter((r) => r.patternDetected).map((r) => r.location?.split(",")[0] ?? "Unknown").filter((v, i, a) => a.indexOf(v) === i);

  const handleNotify = async (r: typeof allIssues[0]) => {
    await sendWhatsAppAlert({
      type: "maintenance",
      title: `${r.priority?.toUpperCase()} Maintenance Issue`,
      body: `${r.id}: ${r.issueType} at ${r.location}\nAssigned to: ${assignMap[r.id] ?? "Unassigned"}${r.safetyRisk ? "\n⚠️ SAFETY HAZARD" : ""}`,
      ticketId: r.id,
      urgent: r.priority === "critical" || r.safetyRisk,
    });
    setNotified((p) => new Set([...p, r.id]));
  };

  const generateWorkOrder = async () => {
    setWorkOrderLoading(true);
    const patternIssues = allIssues.filter((r) => r.patternDetected);
    if (!patternIssues.length) {
      setWorkOrder("No pattern-detected issues found. All current maintenance items appear to be isolated incidents.");
      setWorkOrderLoading(false);
      return;
    }
    const prompt = `Generate a formal preventive maintenance work order for these recurring campus issues:\n${patternIssues.map(r => `- ${r.issueType} at ${r.location}: ${r.description}`).join("\n")}\nBe concise and professional. Max 3 sentences.`;
    try {
      const order = await callGPT("You are a campus maintenance supervisor. Generate a professional work order.", prompt, 200);
      setWorkOrder(order);
    } catch {
      setWorkOrder("Preventive Maintenance Work Order: Schedule full inspection of Block C electrical systems and plumbing in Block A corridor. Assign senior electrician and plumber for Friday 9 AM. Document findings in maintenance log.");
    }
    setWorkOrderLoading(false);
  };

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto space-y-8">

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase mb-1">Admin · Maintenance</p>
            <h1 className="text-3xl font-display font-black uppercase tracking-wide text-foreground leading-none">Maintenance Queue</h1>
            <p className="text-sm text-muted-foreground mt-1">AI-sorted by severity. Pattern-detected issues flagged.</p>
          </div>
          <button onClick={generateWorkOrder} disabled={workOrderLoading}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-600 rounded-xl font-display font-black uppercase text-xs tracking-wide hover:bg-amber-500/20 transition-colors">
            <Zap className="w-3.5 h-3.5" />
            {workOrderLoading ? "Generating…" : "Generate Work Order"}
          </button>
        </div>

        {workOrder && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
            <p className="text-[8px] font-mono tracking-widest text-amber-600/70 uppercase mb-2">✦ AI Work Order</p>
            <p className="text-sm text-foreground leading-relaxed">{workOrder}</p>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Open", value: allIssues.filter(r => r.status !== "Fixed").length, color: "text-primary" },
            { label: "Safety Risks", value: allIssues.filter(r => r.safetyRisk).length, color: "text-destructive" },
            { label: "Pattern Detected", value: allIssues.filter(r => r.patternDetected).length, color: "text-amber-600" },
            { label: "Assigned", value: Object.keys(assignMap).length, color: "text-emerald-600" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className="bg-white border-border shadow-sm rounded-xl">
                <CardContent className="p-4">
                  <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-1">{s.label}</p>
                  <p className={`text-3xl font-display font-black ${s.color}`}>{s.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Pattern warning */}
        {patternBlocks.length > 0 && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" strokeWidth={1.75} />
            <div>
              <p className="text-[8px] font-mono tracking-widest text-amber-600/70 uppercase mb-1">Pattern Alert</p>
              <p className="text-xs text-amber-700">
                Recurring issues detected in: <strong>{patternBlocks.join(", ")}</strong>. Proactive inspection recommended before next failure.
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2">
          {(["all", "safety", "pattern"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest border transition-all ${filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-white text-muted-foreground border-border hover:border-foreground/30"
                }`}>
              {f === "all" ? "All Issues" : f === "safety" ? "⚠ Safety Risk" : "🔁 Pattern Detected"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Issue queue */}
          <div className="lg:col-span-2 space-y-3">
            {filtered.sort((a, b) => (b.severity ?? 0) - (a.severity ?? 0)).map((r, idx) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Card className={`bg-white shadow-sm rounded-xl overflow-hidden border-l-4 ${r.priority === "critical" ? "border-l-destructive" :
                    r.priority === "high" ? "border-l-orange-500" :
                      r.priority === "medium" ? "border-l-amber-500" : "border-l-emerald-500"
                  }`}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-[9px] font-mono text-muted-foreground">{r.id}</span>
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${PRIORITY_STYLE[r.priority ?? "medium"]}`}>
                            {r.priority?.toUpperCase()}
                          </span>
                          {r.safetyRisk && (
                            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded border bg-destructive/10 text-destructive border-destructive/30">
                              ⚠ SAFETY
                            </span>
                          )}
                          {r.patternDetected && (
                            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded border bg-amber-500/10 text-amber-600 border-amber-500/30">
                              🔁 PATTERN
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-display font-black text-foreground uppercase">{r.issueType}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{r.location}</p>
                        {r.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{r.description}</p>}
                      </div>
                      <div className="text-right text-[9px] font-mono text-muted-foreground">
                        <p>Severity {r.severity ?? "?"}/5</p>
                        <p>{r.estimatedTime ?? "TBD"}</p>
                      </div>
                    </div>
                    {r.patternNote && (
                      <p className="text-[9px] font-mono text-amber-600 italic">{r.patternNote}</p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <select value={assignMap[r.id] ?? ""} onChange={(e) => setAssignMap(p => ({ ...p, [r.id]: e.target.value }))}
                        className="text-[9px] font-mono border border-border rounded-lg px-2 py-1 bg-background text-foreground">
                        <option value="">Assign to…</option>
                        {STAFF_MEMBERS.map((s) => <option key={s.name} value={s.name}>{s.name} ({s.load} tasks)</option>)}
                      </select>
                      <button onClick={() => handleNotify(r)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[9px] font-mono transition-all ${notified.has(r.id)
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                            : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                          }`}>
                        <MessageSquare className="w-3 h-3" />
                        {notified.has(r.id) ? "Notified" : "WhatsApp"}
                      </button>
                      <button onClick={() => updateMaintenanceStatus?.(r.id, "Fixed")}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 text-[9px] font-mono ml-auto">
                        <CheckCircle2 className="w-3 h-3" />Mark Fixed
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Staff panel */}
          <div className="space-y-3">
            <Card className="bg-white border-border shadow-sm rounded-xl">
              <CardHeader className="pb-2">
                <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Staff</p>
                <CardTitle className="text-sm font-display font-black uppercase tracking-wide">Maintenance Team</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {STAFF_MEMBERS.map((s) => (
                  <div key={s.name} className="p-3 rounded-xl border border-border bg-secondary/20">
                    <p className="text-xs font-display font-black text-foreground uppercase">{s.name}</p>
                    <p className="text-[9px] font-mono text-muted-foreground mt-0.5 capitalize">Specialty: {s.specialty}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 bg-border rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(s.load / 5) * 100}%` }} />
                      </div>
                      <span className="text-[9px] font-mono text-muted-foreground">{s.load}/5</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white border-border shadow-sm rounded-xl">
              <CardHeader className="pb-2">
                <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Schedule</p>
                <CardTitle className="text-sm font-display font-black uppercase tracking-wide">Upcoming</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { task: "Block C Electrical Inspection", day: "Friday", time: "9 AM" },
                  { task: "Block A Plumbing Check", day: "Saturday", time: "11 AM" },
                ].map((item) => (
                  <div key={item.task} className="flex items-start gap-2 p-2 rounded-lg bg-secondary/30">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" strokeWidth={1.75} />
                    <div>
                      <p className="text-[10px] font-mono text-foreground">{item.task}</p>
                      <p className="text-[9px] font-mono text-muted-foreground">{item.day} · {item.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
