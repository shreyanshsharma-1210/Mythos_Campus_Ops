import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/PageLayout";
import { useCampusOps } from "@/contexts/CampusOpsContext";
import { sendWhatsAppAlert } from "@/lib/whatsapp";
import { Flag, AlertTriangle, Users, Clock, CheckCircle2, Filter, MessageSquare } from "lucide-react";

const RISK_STYLE: Record<string, string> = {
  Critical: "bg-destructive/10 text-destructive border-destructive/30",
  High: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  Medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  Low: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
};

const STATUS_STYLE: Record<string, string> = {
  Pending: "bg-secondary text-muted-foreground",
  "In Review": "bg-amber-500/10 text-amber-600",
  Resolved: "bg-emerald-500/10 text-emerald-600",
};

const STAFF = ["Dr. Sharma (Warden)", "IT Team", "Maintenance Dept", "Academic Office", "Security"];

export default function AdminGrievances() {
  const { grievances: allGrievances, updateGrievanceStatus } = useCampusOps();
  const [filter, setFilter] = useState<"all" | "critical" | "pending">("all");
  const [assignMap, setAssignMap] = useState<Record<string, string>>({});
  const [notified, setNotified] = useState<Set<string>>(new Set());

  const filtered = allGrievances.filter((g) => {
    if (filter === "critical") return g.escalationRiskLevel === "Critical" || g.escalationRiskLevel === "High";
    if (filter === "pending") return g.status === "Pending";
    return true;
  });

  const handleAssign = (id: string, staff: string) => {
    setAssignMap((p) => ({ ...p, [id]: staff }));
  };

  const handleResolve = (id: string) => {
    updateGrievanceStatus?.(id, "Resolved");
  };

  const handleNotify = async (g: typeof allGrievances[0]) => {
    await sendWhatsAppAlert({
      type: "grievance",
      title: `${g.escalationRiskLevel} Grievance Update`,
      body: `${g.id}: ${g.title}\nAssigned to: ${assignMap[g.id] ?? "Unassigned"}\nStatus: ${g.status}`,
      ticketId: g.id,
      urgent: g.escalationRiskLevel === "Critical",
    });
    setNotified((p) => new Set([...p, g.id]));
  };

  const totalAffected = allGrievances.reduce((sum, g) => sum + (g.affectedStudents ?? 0), 0);
  const totalDuplicates = allGrievances.reduce((sum, g) => sum + (g.duplicateCount ?? 0) - 1, 0);

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto space-y-8">

        <div>
          <p className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase mb-1">Admin · Grievances</p>
          <h1 className="text-3xl font-display font-black uppercase tracking-wide text-foreground leading-none">Grievance Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Assign, escalate, and resolve student complaints.</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Tickets", value: allGrievances.length, color: "text-primary", icon: Flag },
            { label: "Critical/High", value: allGrievances.filter(g => ["Critical", "High"].includes(g.escalationRiskLevel ?? "")).length, color: "text-destructive", icon: AlertTriangle },
            { label: "Duplicates Merged", value: Math.max(0, totalDuplicates), color: "text-amber-600", icon: Filter },
            { label: "Students Affected", value: totalAffected, color: "text-indigo-600", icon: Users },
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

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {(["all", "critical", "pending"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest border transition-all ${filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-white text-muted-foreground border-border hover:border-foreground/30"
                }`}>
              {f === "all" ? "All Tickets" : f === "critical" ? "⚠ High Escalation" : "⏳ Pending Only"}
            </button>
          ))}
          <span className="ml-auto text-[9px] font-mono text-muted-foreground self-center">{filtered.length} tickets</span>
        </div>

        {/* Ticket table */}
        <div className="space-y-3">
          {filtered.map((g, idx) => (
            <motion.div key={g.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
              <Card className={`bg-white shadow-sm rounded-xl overflow-hidden border-l-4 ${g.escalationRiskLevel === "Critical" ? "border-l-destructive" :
                  g.escalationRiskLevel === "High" ? "border-l-amber-500" :
                    g.escalationRiskLevel === "Medium" ? "border-l-yellow-500" : "border-l-emerald-500"
                }`}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-3 items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[9px] font-mono text-muted-foreground">{g.id}</span>
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${RISK_STYLE[g.escalationRiskLevel ?? "Low"]}`}>
                          {g.escalationRiskLevel} Risk
                        </span>
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded ${STATUS_STYLE[g.status ?? "Pending"]}`}>
                          {g.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-display font-black text-foreground uppercase tracking-wide truncate">{g.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{g.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-mono text-muted-foreground">{g.department?.replace(/_/g, " ")}</p>
                      <p className="text-[9px] font-mono text-muted-foreground/60">SLA: {g.slaHours}h</p>
                    </div>
                  </div>

                  {/* Escalation bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-[9px] font-mono text-muted-foreground mb-1">
                      <span>Escalation Risk</span>
                      <span>{g.escalationRisk ?? 0}/100</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${(g.escalationRisk ?? 0) >= 80 ? "bg-destructive" :
                          (g.escalationRisk ?? 0) >= 60 ? "bg-amber-500" : "bg-emerald-500"
                        }`} style={{ width: `${g.escalationRisk ?? 0}%` }} />
                    </div>
                    {g.escalationReason && (
                      <p className="text-[9px] text-muted-foreground mt-1 italic">{g.escalationReason}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground">
                      <Users className="w-3 h-3" />{g.affectedStudents ?? 1} affected
                    </div>
                    {(g.duplicateCount ?? 1) > 1 && (
                      <span className="text-[9px] font-mono px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                        {g.duplicateCount} reports merged
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground ml-auto flex-wrap gap-y-1">
                      <select value={assignMap[g.id] ?? ""}
                        onChange={(e) => handleAssign(g.id, e.target.value)}
                        className="text-[9px] font-mono border border-border rounded-lg px-2 py-1 bg-background text-foreground">
                        <option value="">Assign to…</option>
                        {STAFF.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button onClick={() => handleNotify(g)}
                        className={`px-2 py-1 rounded-lg border text-[9px] font-mono transition-all ${notified.has(g.id)
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                            : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                          }`}>
                        <MessageSquare className="w-3 h-3 inline mr-1" />
                        {notified.has(g.id) ? "Sent" : "WhatsApp"}
                      </button>
                      {g.status !== "Resolved" && (
                        <button onClick={() => handleResolve(g.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 text-[9px] font-mono hover:bg-emerald-500/20 transition-colors">
                          <CheckCircle2 className="w-3 h-3" />Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

      </div>
    </PageLayout>
  );
}
