import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from "recharts";
import { PageLayout } from "@/components/PageLayout";
import { useCampusOS } from "@/contexts/CampusOSContext";
import { Wrench, AlertTriangle, CheckCircle2, Clock, TrendingUp, ChevronRight } from "lucide-react";

const TREND_DATA = [
  { day: "Mon", BlockA: 4, BlockB: 2, BlockC: 1 },
  { day: "Tue", BlockA: 3, BlockB: 4, BlockC: 2 },
  { day: "Wed", BlockA: 5, BlockB: 1, BlockC: 4 },
  { day: "Thu", BlockA: 2, BlockB: 6, BlockC: 3 },
  { day: "Fri", BlockA: 1, BlockB: 3, BlockC: 5 },
  { day: "Sat", BlockA: 4, BlockB: 2, BlockC: 2 },
  { day: "Sun", BlockA: 2, BlockB: 1, BlockC: 1 },
];

const SEVERITY_COLORS = ["#10b981", "#10b981", "#f59e0b", "#ef4444", "#dc2626", "#7c3aed"];

const SEV_LABEL: Record<number, { label: string; color: string; bg: string }> = {
  5: { label: "Critical",  color: "text-destructive",    bg: "bg-destructive/10" },
  4: { label: "High",      color: "text-orange-600",     bg: "bg-orange-500/10" },
  3: { label: "Medium",    color: "text-amber-600",      bg: "bg-amber-500/10" },
  2: { label: "Low",       color: "text-emerald-600",    bg: "bg-emerald-500/10" },
  1: { label: "Minimal",   color: "text-emerald-600",    bg: "bg-emerald-500/10" },
};

const STATUS_COLOR: Record<string, string> = {
  Open:     "bg-destructive/10 text-destructive border-destructive/30",
  Assigned: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  Resolved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
};

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "hsl(var(--background))",
    borderColor: "hsl(var(--border))",
    borderRadius: "0.75rem",
    fontSize: "11px",
    fontFamily: "Share Tech Mono",
  },
};

export default function MaintenanceDashboard() {
  const { maintenanceReports, updateMaintenanceReport } = useCampusOS();
  const issues = [...maintenanceReports].sort((a, b) => b.severity - a.severity);

  const toggleStatus = (id: string) => {
    const current = maintenanceReports.find((r) => r.id === id);
    if (!current) return;
    const next =
      current.status === "Open" ? "Assigned" : current.status === "Assigned" ? "Resolved" : "Open";
    updateMaintenanceReport(id, { status: next });
  };

  // Pattern detection: 3+ open issues of same type = warning
  const typePatterns = issues
    .filter((i) => i.status !== "Resolved")
    .reduce<Record<string, number>>((acc, i) => {
      acc[i.issueType] = (acc[i.issueType] || 0) + 1;
      return acc;
    }, {});
  const patternWarnings = Object.entries(typePatterns)
    .filter(([, count]) => count >= 3)
    .map(([type, count]) => `${count} open ${type} issues — possible systemic fault`);

  const openCount     = issues.filter((i) => i.status === "Open").length;
  const assignedCount = issues.filter((i) => i.status === "Assigned").length;
  const resolvedCount = issues.filter((i) => i.status === "Resolved").length;
  const criticalCount = issues.filter((i) => i.severity >= 4).length;

  // Severity distribution bar data
  const sevDist = [5, 4, 3, 2, 1].map((s) => ({
    sev: `SEV-${s}`,
    count: issues.filter((i) => i.severity === s).length,
    fill: SEVERITY_COLORS[s],
  }));

  // Type distribution
  const typeMap = issues.reduce<Record<string, number>>((acc, i) => {
    acc[i.issueType] = (acc[i.issueType] || 0) + 1;
    return acc;
  }, {});
  const typeData = Object.entries(typeMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div>
          <p className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase mb-1">Module · Maintenance</p>
          <h1 className="text-3xl font-display font-black uppercase tracking-wide text-foreground leading-none">
            Maintenance Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Priority queue, severity analysis & block heatmap</p>
        </div>

        {/* ── Pattern Warnings ── */}
        {patternWarnings.length > 0 && (
          <div className="space-y-2">
            {patternWarnings.map((w, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" strokeWidth={1.75} />
                <p className="text-xs text-amber-700"><span className="font-mono font-bold uppercase tracking-widest text-amber-600/70 mr-2">Pattern Alert</span>{w}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Open Issues",   value: openCount,     icon: Wrench,       color: "text-destructive",  bg: "bg-destructive/5" },
            { label: "In Progress",   value: assignedCount, icon: Clock,        color: "text-amber-600",    bg: "bg-amber-500/5" },
            { label: "Resolved",      value: resolvedCount, icon: CheckCircle2, color: "text-emerald-600",  bg: "bg-emerald-500/5" },
            { label: "Critical",      value: criticalCount, icon: AlertTriangle,color: "text-orange-600",   bg: "bg-orange-500/5" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Card className="bg-white border-border shadow-sm rounded-xl">
                <CardContent className="p-5">
                  <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                    <s.icon className={`w-4 h-4 ${s.color}`} strokeWidth={1.75} />
                  </div>
                  <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-1">{s.label}</p>
                  <p className={`text-3xl font-display font-black ${s.color}`}>{s.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ── Charts Row 1 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Weekly Trend */}
          <Card className="bg-white border-border shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">7-Day Trend</p>
              <CardTitle className="text-base font-display font-black uppercase tracking-wide">Issues Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={TREND_DATA}>
                  <XAxis dataKey="day" stroke="hsl(var(--border))" tick={{ fontSize: 10, fontFamily: "Share Tech Mono" }} />
                  <YAxis stroke="hsl(var(--border))" tick={{ fontSize: 10, fontFamily: "Share Tech Mono" }} />
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: "10px", fontFamily: "Share Tech Mono" }} />
                  <Line type="monotone" dataKey="BlockA" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="BlockB" stroke="#6366f1" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="BlockC" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Issue Type Bar */}
          <Card className="bg-white border-border shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Category</p>
              <CardTitle className="text-base font-display font-black uppercase tracking-wide">Issue Types</CardTitle>
            </CardHeader>
            <CardContent className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData} barSize={28}>
                  <XAxis dataKey="name" stroke="hsl(var(--border))" tick={{ fontSize: 10, fontFamily: "Share Tech Mono" }} />
                  <YAxis stroke="hsl(var(--border))" tick={{ fontSize: 10, fontFamily: "Share Tech Mono" }} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {typeData.map((_, i) => (
                      <Cell key={i} fill={i % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.55)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* ── Charts Row 2 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Severity Distribution */}
          <Card className="bg-white border-border shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Risk</p>
              <CardTitle className="text-base font-display font-black uppercase tracking-wide">Severity Dist.</CardTitle>
            </CardHeader>
            <CardContent className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sevDist} barSize={28}>
                  <XAxis dataKey="sev" stroke="hsl(var(--border))" tick={{ fontSize: 10, fontFamily: "Share Tech Mono" }} />
                  <YAxis stroke="hsl(var(--border))" tick={{ fontSize: 10, fontFamily: "Share Tech Mono" }} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {sevDist.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Block Heatmap */}
          <Card className="lg:col-span-2 bg-white border-border shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Spatial</p>
              <CardTitle className="text-base font-display font-black uppercase tracking-wide">Block Density</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { block: "Block A", density: "High",   issues: 11, color: "border-destructive bg-destructive/5",  bar: "bg-destructive", pct: 85 },
                  { block: "Block B", density: "Medium", issues: 7,  color: "border-amber-500 bg-amber-500/5",      bar: "bg-amber-500",   pct: 54 },
                  { block: "Block C", density: "Low",    issues: 4,  color: "border-emerald-500 bg-emerald-500/5",  bar: "bg-emerald-500", pct: 31 },
                ].map((b) => (
                  <div key={b.block} className={`rounded-xl border p-4 ${b.color}`}>
                    <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-1">{b.density} Density</p>
                    <p className="text-lg font-display font-black text-foreground">{b.block}</p>
                    <p className="text-2xl font-display font-black text-foreground mt-1 mb-3">{b.issues}</p>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${b.bar}`} style={{ width: `${b.pct}%` }} />
                    </div>
                    <p className="text-[9px] font-mono text-muted-foreground mt-1">issues reported</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Priority Queue ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-0.5">Sorted by Severity</p>
              <h2 className="text-xl font-display font-black uppercase tracking-wide text-foreground">Priority Queue</h2>
            </div>
            <div className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground">
              <TrendingUp className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>{issues.length} total</span>
            </div>
          </div>

          <div className="space-y-3">
            {issues.map((issue, idx) => {
              const sev = SEV_LABEL[issue.severity] ?? SEV_LABEL[1];
              return (
                <motion.div key={issue.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                  <Card className="bg-white border-border shadow-sm rounded-xl hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Severity badge */}
                        <div className={`w-12 h-12 rounded-xl ${sev.bg} flex flex-col items-center justify-center shrink-0`}>
                          <span className="text-[8px] font-mono text-muted-foreground">SEV</span>
                          <span className={`text-lg font-display font-black ${sev.color}`}>{issue.severity}</span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="font-display font-black text-foreground uppercase tracking-wide text-sm truncate">{issue.location}</h4>
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${sev.color} ${sev.bg} border-current/30`}>
                              {sev.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground capitalize">{issue.issueType} — {issue.description}</p>
                          <p className="text-[9px] font-mono text-primary mt-1">SLA: {issue.estimatedTime}</p>
                        </div>

                        {/* Status + action */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className={`text-[9px] font-mono font-bold px-2 py-1 rounded border ${STATUS_COLOR[issue.status]}`}>
                            {issue.status}
                          </span>
                          <button onClick={() => toggleStatus(issue.id)}
                            className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors">
                            {issue.status === "Open" ? "Assign Staff" : issue.status === "Assigned" ? "Mark Resolved" : "Reopen"}
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </PageLayout>
  );
}
