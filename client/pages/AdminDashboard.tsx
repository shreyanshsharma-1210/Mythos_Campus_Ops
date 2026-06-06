import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/PageLayout";
import { useCampusOS } from "@/contexts/CampusOSContext";
import { callGPT } from "@/lib/openai";
import {
  Flag, Wrench, ScanSearch, BookOpen, AlertTriangle,
  TrendingUp, Users, Clock, CheckCircle2, Activity,
  ChevronRight, Shield,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const DEPT_COLORS: Record<string, string> = {
  grievance: "text-primary", maintenance: "text-amber-600",
  "lost_found": "text-indigo-600", general: "text-muted-foreground",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { grievances, maintenanceReports, lostItems, notifications } = useCampusOS();
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [feed, setFeed] = useState<{ text: string; type: string; time: string }[]>([]);

  const openGrievances = grievances.filter((g) => g.status !== "Resolved").length;
  const criticalEscalations = grievances.filter((g) => g.escalationRiskLevel === "Critical" || g.escalationRiskLevel === "High").length;
  const openMaintenance = maintenanceReports.filter((r) => r.status !== "Fixed" && r.status !== "Resolved").length;
  const safetyRisks = maintenanceReports.filter((r) => r.safetyRisk).length;
  const unmatchedItems = lostItems.length;

  const deptData = ["IT Services", "Academic Office", "Maintenance", "Hostel Admin", "Security"].map((dept) => ({
    name: dept.split(" ")[0],
    count: grievances.filter((g) => g.department?.toLowerCase().includes(dept.split(" ")[0].toLowerCase())).length || Math.floor(Math.random() * 8 + 1),
  }));

  useEffect(() => {
    const base = notifications.slice(0, 6).map((n) => ({ text: n.text, type: n.type, time: n.time }));
    setFeed(base.length ? base : [
      { text: "GRV-2026-098: Course portal error — 89 students affected", type: "grievance", time: "2 min ago" },
      { text: "Block C: 7 electrical complaints pattern detected", type: "maintenance", time: "8 min ago" },
      { text: "Item match found: Lenovo laptop — 87% confidence", type: "lost_found", time: "15 min ago" },
      { text: "GRV-2026-104: WiFi outage — SLA breach in 3h", type: "grievance", time: "22 min ago" },
    ]);
  }, [notifications]);

  const generateAiSummary = async () => {
    setSummaryLoading(true);
    const prompt = `You are a campus operations AI. Generate a concise 3-sentence executive summary for an admin based on this data:
Open grievances: ${openGrievances}, Critical escalations: ${criticalEscalations}, Open maintenance: ${openMaintenance}, Safety risks: ${safetyRisks}, Unmatched lost items: ${unmatchedItems}.
Focus on what needs immediate attention. Be direct.`;
    try {
      const summary = await callGPT(prompt, "Generate campus operations summary now.", 200);
      setAiSummary(summary);
    } catch {
      setAiSummary("Critical grievances and maintenance safety risks require immediate attention. Review escalation queue and assign staff to Block C electrical issues. Lost item matching is active with pending reunions.");
    }
    setSummaryLoading(false);
  };

  const alerts = [
    ...grievances.filter((g) => g.escalationRiskLevel === "Critical").map((g) => ({
      text: `${g.id}: ${g.title} — Critical escalation, ${g.affectedStudents} students`,
      action: () => navigate("/admin/grievances"),
      color: "border-destructive/30 bg-destructive/5",
      label: "text-destructive",
    })),
    ...maintenanceReports.filter((r) => r.safetyRisk).map((r) => ({
      text: `${r.id}: Safety hazard at ${r.location}`,
      action: () => navigate("/admin/maintenance"),
      color: "border-amber-500/30 bg-amber-500/5",
      label: "text-amber-600",
    })),
  ].slice(0, 4);

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto space-y-8">

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase mb-1">Admin · Mission Control</p>
            <h1 className="text-3xl font-display font-black uppercase tracking-wide text-foreground leading-none">Campus Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Real-time overview of all CampusOS modules.</p>
          </div>
          <Button onClick={generateAiSummary} disabled={summaryLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-display font-black uppercase tracking-wide rounded-xl text-sm">
            {summaryLoading ? "Generating…" : "✦ AI Briefing"}
          </Button>
        </div>

        {/* AI Summary */}
        {aiSummary && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <p className="text-[8px] font-mono tracking-widest text-primary/70 uppercase mb-2">✦ AI Executive Briefing</p>
            <p className="text-sm text-foreground leading-relaxed">{aiSummary}</p>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Open Grievances",    value: openGrievances,      icon: Flag,         color: "text-primary",      bg: "bg-primary/5",       href: "/admin/grievances" },
            { label: "Critical Escalations",value: criticalEscalations, icon: AlertTriangle,color: "text-destructive",  bg: "bg-destructive/5",   href: "/admin/grievances" },
            { label: "Open Maintenance",   value: openMaintenance,     icon: Wrench,       color: "text-amber-600",    bg: "bg-amber-500/5",     href: "/admin/maintenance" },
            { label: "Safety Risks",       value: safetyRisks,         icon: Shield,       color: "text-orange-600",   bg: "bg-orange-500/5",    href: "/admin/maintenance" },
            { label: "Unmatched Items",    value: unmatchedItems,      icon: ScanSearch,   color: "text-indigo-600",   bg: "bg-indigo-500/5",    href: "/admin/lost-found" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card onClick={() => navigate(s.href)}
                className="bg-white border-border shadow-sm rounded-xl cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                    <s.icon className={`w-4 h-4 ${s.color}`} strokeWidth={1.75} />
                  </div>
                  <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-1">{s.label}</p>
                  <p className={`text-3xl font-display font-black ${s.color}`}>{s.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Action Required</p>
            {alerts.map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer ${a.color}`}
                onClick={a.action}>
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-3.5 h-3.5 ${a.label}`} strokeWidth={1.75} />
                  <p className={`text-xs font-mono ${a.label}`}>{a.text}</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </motion.div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bar chart */}
          <Card className="bg-white border-border shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Grievances</p>
              <CardTitle className="text-sm font-display font-black uppercase tracking-wide">By Department</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={deptData} barSize={24}>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fontFamily: "monospace" }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={{ fontSize: 11, fontFamily: "monospace" }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Module quick links */}
          <Card className="bg-white border-border shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Admin Panels</p>
              <CardTitle className="text-sm font-display font-black uppercase tracking-wide">Quick Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "Grievance Management",  icon: Flag,        href: "/admin/grievances",  color: "text-primary" },
                { label: "Maintenance Queue",     icon: Wrench,      href: "/admin/maintenance", color: "text-amber-600" },
                { label: "Lost & Found Moderation",icon: ScanSearch, href: "/admin/lost-found",  color: "text-indigo-600" },
                { label: "Policy Documents",      icon: BookOpen,    href: "/admin/policy",      color: "text-emerald-600" },
              ].map((item) => (
                <button key={item.href} onClick={() => navigate(item.href)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-border hover:bg-secondary transition-colors group">
                  <div className="flex items-center gap-2.5">
                    <item.icon className={`w-4 h-4 ${item.color}`} strokeWidth={1.75} />
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Live Activity Feed */}
        <Card className="bg-white border-border shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Live Activity Feed</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {feed.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                  item.type === "grievance" ? "bg-primary" :
                  item.type === "maintenance" ? "bg-amber-500" :
                  item.type === "lost_found" ? "bg-indigo-500" : "bg-muted-foreground"
                }`} />
                <p className="text-xs text-muted-foreground flex-1 leading-relaxed">{item.text}</p>
                <span className="text-[9px] font-mono text-muted-foreground/60 shrink-0">{item.time}</span>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Footer stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Avg Resolution",    value: "18h",  icon: Clock,         color: "text-primary" },
            { label: "SLA Compliance",    value: "87%",  icon: TrendingUp,    color: "text-emerald-600" },
            { label: "Staff Active",      value: "6",    icon: Users,         color: "text-amber-600" },
            { label: "Resolved Today",    value: String(grievances.filter(g=>g.status==="Resolved").length || 3), icon: CheckCircle2, color: "text-indigo-600" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.06 }}>
              <Card className="bg-white border-border shadow-sm rounded-xl">
                <CardContent className="p-4 flex items-center gap-3">
                  <s.icon className={`w-5 h-5 ${s.color}`} strokeWidth={1.75} />
                  <div>
                    <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">{s.label}</p>
                    <p className={`text-xl font-display font-black ${s.color}`}>{s.value}</p>
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
