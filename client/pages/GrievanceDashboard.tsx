import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts";
import { PageLayout } from "@/components/PageLayout";
import { useCampusOS } from "@/contexts/CampusOSContext";
import {
  AlertTriangle, Users, GitMerge, FileText, TrendingUp, Clock,
} from "lucide-react";

const RISK_COLORS: Record<string, string> = {
  Critical: "bg-destructive/10 text-destructive border-destructive/30",
  High:     "bg-amber-500/10 text-amber-600 border-amber-500/30",
  Medium:   "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  Low:      "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
};

const COL_ACCENT: Record<string, string> = {
  Pending:    "border-l-destructive",
  "In Review":"border-l-amber-500",
  Resolved:   "border-l-emerald-500",
};

const COL_DOT: Record<string, string> = {
  Pending:    "bg-destructive",
  "In Review":"bg-amber-500",
  Resolved:   "bg-emerald-500",
};

const PIE_COLORS = ["#ef4444", "#f59e0b", "#eab308", "#10b981"];

function RiskBadge({ level, risk }: { level: string; risk: number }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${RISK_COLORS[level] ?? RISK_COLORS.Low}`}>
      {risk}% risk
    </span>
  );
}

export default function GrievanceDashboard() {
  const { grievances } = useCampusOS();
  const [filter, setFilter] = useState<"all" | "critical">("all");

  const displayed =
    filter === "critical"
      ? grievances.filter(
          (g) => g.escalationRiskLevel === "Critical" || g.escalationRiskLevel === "High"
        )
      : grievances;

  const totalAffected = grievances.reduce((s, g) => s + (g.affectedStudents || 0), 0);
  const criticalCount = grievances.filter((g) => g.escalationRiskLevel === "Critical").length;
  const totalDuplicates = grievances.reduce((s, g) => s + ((g.duplicateCount || 1) - 1), 0);
  const avgSLA = Math.round(
    grievances.reduce((s, g) => s + (g.slaHours || 0), 0) / grievances.length
  );

  // Department bar chart
  const deptMap = grievances.reduce<Record<string, number>>((acc, g) => {
    acc[g.department] = (acc[g.department] || 0) + 1;
    return acc;
  }, {});
  const deptData = Object.entries(deptMap)
    .map(([name, count]) => ({ name: name.length > 10 ? name.slice(0, 10) + "…" : name, count }))
    .sort((a, b) => b.count - a.count);

  // Risk distribution pie
  const riskMap = grievances.reduce<Record<string, number>>((acc, g) => {
    acc[g.escalationRiskLevel] = (acc[g.escalationRiskLevel] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(riskMap).map(([name, value]) => ({ name, value }));

  // Status bar chart
  const statusMap = grievances.reduce<Record<string, number>>((acc, g) => {
    acc[g.status] = (acc[g.status] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.entries(statusMap).map(([name, count]) => ({ name, count }));

  const COLUMNS: Array<"Pending" | "In Review" | "Resolved"> = ["Pending", "In Review", "Resolved"];

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: "hsl(var(--background))",
      borderColor: "hsl(var(--border))",
      borderRadius: "0.75rem",
      fontSize: "12px",
      fontFamily: "Share Tech Mono",
    },
  };

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase mb-1">
              Module · Grievances
            </p>
            <h1 className="text-3xl font-display font-black uppercase tracking-wide text-foreground leading-none">
              Triage Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              AI-powered duplicate detection & escalation prediction
            </p>
          </div>
          <div className="flex gap-2">
            {(["all", "critical"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium border transition-colors ${
                  filter === f
                    ? f === "critical"
                      ? "bg-destructive text-white border-destructive"
                      : "bg-primary text-primary-foreground border-primary"
                    : "bg-white border-border text-muted-foreground hover:border-foreground/30"
                }`}
              >
                {f === "all" ? "All Grievances" : "⚠ High Risk"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Tickets",    value: grievances.length, icon: FileText,     color: "text-primary",     bg: "bg-primary/5" },
            { label: "Critical Flags",   value: criticalCount,     icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/5" },
            { label: "Duplicates Merged",value: totalDuplicates,   icon: GitMerge,      color: "text-amber-600",   bg: "bg-amber-500/5" },
            { label: "Students Affected",value: totalAffected,     icon: Users,         color: "text-indigo-600",  bg: "bg-indigo-500/5" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Card className="bg-white border-border shadow-sm rounded-xl">
                <CardContent className="p-5">
                  <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} strokeWidth={1.75} />
                  </div>
                  <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-1">{stat.label}</p>
                  <p className={`text-3xl font-display font-black ${stat.color}`}>{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Department Volume (2/3 width) */}
          <Card className="lg:col-span-2 bg-white border-border shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Analytics</p>
              <CardTitle className="text-base font-display font-black uppercase tracking-wide">
                Department Issue Volume
              </CardTitle>
            </CardHeader>
            <CardContent className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} barSize={28}>
                  <XAxis dataKey="name" stroke="hsl(var(--border))" tick={{ fontSize: 10, fontFamily: "Share Tech Mono" }} />
                  <YAxis stroke="hsl(var(--border))" tick={{ fontSize: 10, fontFamily: "Share Tech Mono" }} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {deptData.map((_, i) => (
                      <Cell key={i} fill={i % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.5)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Risk Distribution */}
          <Card className="bg-white border-border shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Breakdown</p>
              <CardTitle className="text-base font-display font-black uppercase tracking-wide">
                Risk Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "10px", fontFamily: "Share Tech Mono" }} />
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* ── Status Chart + SLA ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-white border-border shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Pipeline</p>
              <CardTitle className="text-base font-display font-black uppercase tracking-wide">Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} layout="vertical" barSize={18}>
                  <XAxis type="number" stroke="hsl(var(--border))" tick={{ fontSize: 10, fontFamily: "Share Tech Mono" }} />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--border))" tick={{ fontSize: 10, fontFamily: "Share Tech Mono" }} width={70} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={
                        entry.name === "Pending"    ? "#ef4444" :
                        entry.name === "In Review"  ? "#f59e0b" : "#10b981"
                      } />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* SLA + Avg metrics */}
          <Card className="lg:col-span-2 bg-white border-border shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Performance</p>
              <CardTitle className="text-base font-display font-black uppercase tracking-wide">SLA Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Avg SLA Hours",     value: `${avgSLA}h`,        icon: Clock,      color: "text-indigo-600" },
                  { label: "Resolution Rate",   value: `${Math.round((grievances.filter(g=>g.status==="Resolved").length/grievances.length)*100)}%`, icon: TrendingUp, color: "text-emerald-600" },
                  { label: "High Risk Tickets", value: grievances.filter(g=>g.escalationRisk>=60).length, icon: AlertTriangle, color: "text-amber-600" },
                  { label: "Avg Affected",      value: Math.round(totalAffected/grievances.length), icon: Users, color: "text-primary" },
                ].map((m) => (
                  <div key={m.label} className="bg-secondary/40 rounded-xl p-4">
                    <m.icon className={`w-4 h-4 ${m.color} mb-2`} strokeWidth={1.75} />
                    <p className={`text-2xl font-display font-black ${m.color}`}>{m.value}</p>
                    <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase mt-1">{m.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Kanban ── */}
        <div>
          <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-4">Ticket Board</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {COLUMNS.map((status) => {
              const col = displayed.filter((g) => g.status === status);
              return (
                <div key={status} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${COL_DOT[status]}`} />
                      <h3 className="text-sm font-display font-black uppercase tracking-wide text-foreground">{status}</h3>
                    </div>
                    <span className="text-[9px] font-mono bg-secondary px-2 py-0.5 rounded text-muted-foreground">{col.length}</span>
                  </div>

                  {col.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-border rounded-xl flex items-center justify-center text-muted-foreground text-sm">
                      No items
                    </div>
                  )}

                  {col.map((g, idx) => (
                    <motion.div
                      key={g.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06 }}
                    >
                      <Card className={`bg-white border-l-4 ${COL_ACCENT[status]} border-border shadow-sm rounded-xl hover:shadow-md transition-shadow cursor-pointer`}>
                        <CardContent className="p-4 space-y-3">
                          <div className="flex justify-between items-start gap-2 flex-wrap">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-secondary text-foreground rounded">
                              {g.category}
                            </span>
                            <RiskBadge level={g.escalationRiskLevel} risk={g.escalationRisk} />
                          </div>

                          <div>
                            <p className="text-[9px] font-mono text-muted-foreground">{g.id}</p>
                            <h4 className="text-sm font-medium text-foreground leading-snug mt-0.5">{g.title}</h4>
                          </div>

                          {/* Escalation bar */}
                          <div>
                            <div className="flex justify-between text-[9px] font-mono text-muted-foreground mb-1">
                              <span>Escalation Risk</span>
                              <span>{g.escalationRisk}%</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  g.escalationRisk >= 80 ? "bg-destructive" :
                                  g.escalationRisk >= 60 ? "bg-amber-500" :
                                  g.escalationRisk >= 40 ? "bg-yellow-400" : "bg-emerald-500"
                                }`}
                                style={{ width: `${g.escalationRisk}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-1 border-t border-border text-[9px] font-mono text-muted-foreground">
                            <span>{g.duplicateCount > 1 ? `${g.duplicateCount} merged` : "1 report"}</span>
                            <span>{g.affectedStudents} affected</span>
                            <span>{g.slaHours}h SLA</span>
                          </div>

                          {g.escalationReason && (
                            <p className="text-[10px] text-muted-foreground italic border-t border-border pt-2 leading-relaxed">
                              {g.escalationReason}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </PageLayout>
  );
}
