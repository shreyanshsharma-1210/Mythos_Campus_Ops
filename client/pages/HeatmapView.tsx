import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { PageLayout } from "@/components/PageLayout";
import { MapPin, TrendingDown, Package, Clock } from "lucide-react";

const HOTSPOTS = [
  { cx: 150, cy: 100, r: 22, count: 5,  label: "Library",        color: "rgba(249,115,22,0.35)",  stroke: "#f97316", risk: "Medium" },
  { cx: 300, cy: 200, r: 38, count: 12, label: "Canteen",         color: "rgba(239,68,68,0.4)",    stroke: "#ef4444", risk: "High" },
  { cx: 100, cy: 250, r: 16, count: 3,  label: "Hostel A",        color: "rgba(99,102,241,0.3)",   stroke: "#6366f1", risk: "Low" },
  { cx: 400, cy: 120, r: 28, count: 8,  label: "Sports Complex",  color: "rgba(245,158,11,0.35)",  stroke: "#f59e0b", risk: "Medium" },
  { cx: 220, cy: 300, r: 20, count: 6,  label: "Admin Block",     color: "rgba(239,68,68,0.3)",    stroke: "#ef4444", risk: "Medium" },
  { cx: 370, cy: 270, r: 14, count: 2,  label: "Parking Lot",     color: "rgba(99,102,241,0.25)",  stroke: "#6366f1", risk: "Low" },
];

const RISK_STYLE: Record<string, string> = {
  High:   "bg-destructive/10 text-destructive border-destructive/30",
  Medium: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  Low:    "bg-indigo-500/10 text-indigo-600 border-indigo-500/30",
};

const WEEKLY_TREND = [
  { day: "Mon", items: 3 },
  { day: "Tue", items: 5 },
  { day: "Wed", items: 2 },
  { day: "Thu", items: 8 },
  { day: "Fri", items: 12 },
  { day: "Sat", items: 6 },
  { day: "Sun", items: 4 },
];

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "hsl(var(--background))",
    borderColor: "hsl(var(--border))",
    borderRadius: "0.75rem",
    fontSize: "11px",
    fontFamily: "Share Tech Mono",
  },
};

export default function HeatmapView() {
  const total = HOTSPOTS.reduce((s, h) => s + h.count, 0);
  const highRisk = HOTSPOTS.filter((h) => h.risk === "High").length;
  const topSpot = [...HOTSPOTS].sort((a, b) => b.count - a.count)[0];

  const barData = [...HOTSPOTS].sort((a, b) => b.count - a.count).map((h) => ({
    name: h.label.split(" ")[0],
    count: h.count,
    risk: h.risk,
  }));

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <p className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase mb-1">Module · Lost & Found</p>
          <h1 className="text-3xl font-display font-black uppercase tracking-wide text-foreground leading-none">Campus Heatmap</h1>
          <p className="text-sm text-muted-foreground mt-1">Lost item hotspots across campus — updated in real time.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Items Lost", value: total,       icon: Package,      color: "text-primary",    bg: "bg-primary/5" },
            { label: "High Risk Zones",  value: highRisk,    icon: MapPin,       color: "text-destructive", bg: "bg-destructive/5" },
            { label: "Top Hotspot",      value: topSpot.label.split(" ")[0], icon: TrendingDown, color: "text-amber-600", bg: "bg-amber-500/5" },
            { label: "Active Zones",     value: HOTSPOTS.length, icon: Clock,   color: "text-indigo-600", bg: "bg-indigo-500/5" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Card className="bg-white border-border shadow-sm rounded-xl">
                <CardContent className="p-5">
                  <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                    <s.icon className={`w-4 h-4 ${s.color}`} strokeWidth={1.75} />
                  </div>
                  <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-1">{s.label}</p>
                  <p className={`text-2xl font-display font-black ${s.color}`}>{s.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* SVG Heatmap */}
          <Card className="lg:col-span-2 bg-white border-border shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Spatial View</p>
              <CardTitle className="text-base font-display font-black uppercase tracking-wide">Campus Layout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl overflow-hidden border border-border bg-secondary/30">
                <svg viewBox="0 0 500 360" className="w-full h-auto">
                  {/* Campus grid */}
                  <rect width="500" height="360" fill="hsl(var(--secondary) / 0.3)" />
                  <path d="M50 40 L450 40 L450 320 L50 320 Z" fill="none" stroke="hsl(var(--border))" strokeWidth="1.5" strokeDasharray="6,4" />
                  <path d="M250 40 L250 320" fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
                  <path d="M50 180 L450 180" fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
                  <path d="M150 40 L150 320" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="3,6" opacity="0.5" />
                  <path d="M350 40 L350 320" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="3,6" opacity="0.5" />
                  <path d="M50 120 L450 120" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="3,6" opacity="0.5" />
                  <path d="M50 240 L450 240" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="3,6" opacity="0.5" />

                  {/* Hotspots */}
                  {HOTSPOTS.map((spot, idx) => (
                    <g key={idx}>
                      <circle cx={spot.cx} cy={spot.cy} r={spot.r + 10} fill={spot.color.replace("0.4", "0.1").replace("0.35", "0.08").replace("0.3", "0.06").replace("0.25", "0.05")} />
                      <circle cx={spot.cx} cy={spot.cy} r={spot.r} fill={spot.color} stroke={spot.stroke} strokeWidth="1.5">
                        <animate attributeName="r" values={`${spot.r};${spot.r + 4};${spot.r}`} dur="2.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="1;0.7;1" dur="2.5s" repeatCount="indefinite" />
                      </circle>
                      <text x={spot.cx} y={spot.cy - spot.r - 8} fill="hsl(var(--foreground))" fontSize="10" textAnchor="middle" fontFamily="Share Tech Mono" fontWeight="bold">
                        {spot.label}
                      </text>
                      <text x={spot.cx} y={spot.cy + 4} fill="white" fontSize="11" textAnchor="middle" fontFamily="Share Tech Mono" fontWeight="bold">
                        {spot.count}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                {[
                  { color: "#ef4444", label: "High Risk" },
                  { color: "#f59e0b", label: "Medium Risk" },
                  { color: "#6366f1", label: "Low Risk" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }} />
                    <span className="text-[9px] font-mono text-muted-foreground uppercase">{l.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hotspot List */}
          <div className="space-y-3">
            <Card className="bg-white border-border shadow-sm rounded-xl">
              <CardHeader className="pb-2">
                <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Ranked</p>
                <CardTitle className="text-sm font-display font-black uppercase tracking-wide">Hotspot List</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[...HOTSPOTS].sort((a, b) => b.count - a.count).map((spot, i) => (
                  <div key={spot.label} className="flex items-center gap-3">
                    <span className="text-[9px] font-mono font-bold text-muted-foreground w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-[10px] font-mono font-bold text-foreground truncate">{spot.label}</p>
                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border ${RISK_STYLE[spot.risk]}`}>
                          {spot.risk}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-1.5">
                        <div className="h-1.5 rounded-full transition-all duration-700"
                          style={{ width: `${(spot.count / 12) * 100}%`, backgroundColor: spot.stroke }} />
                      </div>
                    </div>
                    <span className="text-[10px] font-display font-black text-foreground w-4 text-right">{spot.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Items by zone bar chart */}
          <Card className="bg-white border-border shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Zone Analysis</p>
              <CardTitle className="text-base font-display font-black uppercase tracking-wide">Items by Location</CardTitle>
            </CardHeader>
            <CardContent className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} barSize={28}>
                  <XAxis dataKey="name" stroke="hsl(var(--border))" tick={{ fontSize: 10, fontFamily: "Share Tech Mono" }} />
                  <YAxis stroke="hsl(var(--border))" tick={{ fontSize: 10, fontFamily: "Share Tech Mono" }} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.risk === "High" ? "#ef4444" : entry.risk === "Medium" ? "#f59e0b" : "#6366f1"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Weekly trend */}
          <Card className="bg-white border-border shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">7-Day Trend</p>
              <CardTitle className="text-base font-display font-black uppercase tracking-wide">Daily Lost Items</CardTitle>
            </CardHeader>
            <CardContent className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={WEEKLY_TREND} barSize={28}>
                  <XAxis dataKey="day" stroke="hsl(var(--border))" tick={{ fontSize: 10, fontFamily: "Share Tech Mono" }} />
                  <YAxis stroke="hsl(var(--border))" tick={{ fontSize: 10, fontFamily: "Share Tech Mono" }} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="items" radius={[4, 4, 0, 0]}>
                    {WEEKLY_TREND.map((_, i) => (
                      <Cell key={i} fill={i % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.55)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

      </div>
    </PageLayout>
  );
}
