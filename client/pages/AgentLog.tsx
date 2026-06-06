import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FloatingSidebar } from "@/components/FloatingSidebar";
import { FloatingTopBar } from "@/components/FloatingTopBar";
import { useSidebar } from "@/contexts/SidebarContext";
import { useCampusOps } from "../contexts/CampusOpsContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Bot,
  Play,
  Square,
  Wrench,
  AlertTriangle,
  ArrowUpCircle,
  Link2,
  Bell,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Brain,
  Sparkles,
  Activity,
  Zap,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
interface LogEntry {
  id: string;
  timestamp: string;
  type:
  | "status"
  | "thinking"
  | "tool_start"
  | "tool_end"
  | "done"
  | "error"
  | "action";
  content?: string;
  tool?: string;
  input?: any;
  result?: any;
  message?: string;
  actions?: AgentAction[];
}

interface AgentAction {
  type: "escalate" | "pattern_alert" | "match" | "notification" | "resolve";
  payload: Record<string, any>;
  reason: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const TOOL_LABELS: Record<string, string> = {
  analyze_grievances: "Analyzing Grievances",
  escalate_ticket: "Escalating Ticket",
  detect_maintenance_patterns: "Scanning Maintenance",
  match_lost_found_items: "Matching Lost & Found",
  push_notification: "Pushing Notification",
};

const TOOL_ICONS: Record<string, React.ElementType> = {
  analyze_grievances: Brain,
  escalate_ticket: ArrowUpCircle,
  detect_maintenance_patterns: Wrench,
  match_lost_found_items: Link2,
  push_notification: Bell,
};

const ACTION_COLORS: Record<string, string> = {
  escalate: "bg-red-100 border-red-200 text-red-700",
  pattern_alert: "bg-orange-100 border-orange-200 text-orange-700",
  match: "bg-green-100 border-green-200 text-green-700",
  notification: "bg-blue-100 border-blue-200 text-blue-700",
  resolve: "bg-purple-100 border-purple-200 text-purple-700",
};

const ACTION_ICONS: Record<string, React.ElementType> = {
  escalate: ArrowUpCircle,
  pattern_alert: AlertTriangle,
  match: Link2,
  notification: Bell,
  resolve: CheckCircle2,
};

function now() {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function AgentLog() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { grievances, maintenanceReports, lostItems, foundItems } = useCampusOps();
  const isMobile = useIsMobile();

  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [thinkingBuffer, setThinkingBuffer] = useState("");
  const [runCount, setRunCount] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  const appendLog = (entry: Omit<LogEntry, "id" | "timestamp">) => {
    setLog((prev) => [
      ...prev,
      {
        ...entry,
        id: Math.random().toString(36).slice(2),
        timestamp: now(),
      },
    ]);
  };

  const runAgent = async () => {
    if (running) {
      abortRef.current?.abort();
      setRunning(false);
      return;
    }

    setLog([]);
    setActions([]);
    setThinkingBuffer("");
    setRunning(true);
    setRunCount((c) => c + 1);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/campus-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ grievances, maintenanceReports, lostItems, foundItems }),
      });

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream available");

      const decoder = new TextDecoder();
      let thinkAccum = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const payload = JSON.parse(line.slice(6));

            if (payload.type === "status") {
              appendLog({ type: "status", message: payload.message });
            }

            if (payload.type === "thinking") {
              thinkAccum += payload.content;
              setThinkingBuffer(thinkAccum);
            }

            if (payload.type === "tool_start") {
              // Flush thinking buffer
              if (thinkAccum.trim()) {
                appendLog({ type: "thinking", content: thinkAccum.trim() });
                thinkAccum = "";
                setThinkingBuffer("");
              }
              appendLog({
                type: "tool_start",
                tool: payload.tool,
                input: payload.input,
              });
            }

            if (payload.type === "tool_end") {
              appendLog({
                type: "tool_end",
                tool: payload.tool,
                result: payload.result,
              });
            }

            if (payload.type === "done") {
              if (thinkAccum.trim()) {
                appendLog({ type: "thinking", content: thinkAccum.trim() });
                thinkAccum = "";
                setThinkingBuffer("");
              }
              setActions(payload.actions ?? []);
              appendLog({ type: "done", actions: payload.actions });
            }

            if (payload.type === "error") {
              appendLog({ type: "error", message: payload.message });
            }
          } catch { /* malformed JSON, skip */ }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        appendLog({ type: "error", message: err.message ?? "Unknown error" });
      }
    } finally {
      setRunning(false);
      setThinkingBuffer("");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {!isMobile && (
        <FloatingSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          userType="student"
        />
      )}
      <FloatingTopBar isCollapsed={isCollapsed} />

      <motion.div
        className={`transition-all duration-300 ${isMobile ? "ml-0" : isCollapsed ? "ml-20" : "ml-72"
          } pt-24 ${isMobile ? "p-4" : "p-8"} min-h-screen max-w-[1600px] mx-auto`}
        animate={{ marginLeft: isMobile ? 0 : isCollapsed ? 80 : 272 }}
      >
        {/* ── Header ── */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-md">
                <Bot className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">
                  Campus<span className="text-primary">Ops</span> Agent
                </h1>
                <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase mt-0.5">
                  LangGraph · Azure OpenAI · ReAct Loop
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {running && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-mono text-xs uppercase tracking-widest">Live</span>
                </div>
              )}
              <Button
                onClick={runAgent}
                variant={running ? "destructive" : "default"}
                className="gap-2 font-mono uppercase tracking-widest text-xs"
              >
                {running ? (
                  <>
                    <Square className="w-4 h-4" /> Stop Agent
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Run Agent
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ── Stats Bar ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Grievances", value: grievances.length, icon: Activity, color: "text-blue-500" },
            {
              label: "Open Maintenance",
              value: maintenanceReports.filter((r) => r.status === "Open").length,
              icon: Wrench,
              color: "text-orange-500",
            },
            { label: "Lost Items", value: lostItems.length, icon: AlertTriangle, color: "text-red-500" },
            { label: "Found Items", value: foundItems.length, icon: CheckCircle2, color: "text-green-500" },
          ].map((stat) => (
            <Card key={stat.label} className="p-4 rounded-xl border-border shadow-sm">
              <div className="flex items-center gap-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} strokeWidth={1.5} />
                <div>
                  <p className="text-2xl font-black text-foreground">{stat.value}</p>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                    {stat.label}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Agent Log Stream (left 2/3) ── */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-mono font-bold text-muted-foreground uppercase tracking-widest">
                Agent Log
              </h2>
              {runCount > 0 && (
                <span className="text-[10px] font-mono text-muted-foreground">
                  Run #{runCount}
                </span>
              )}
            </div>

            <Card className="rounded-xl border-border shadow-sm bg-white overflow-hidden">
              <div className="h-[540px] overflow-y-auto p-4 space-y-2 font-mono text-xs scroll-smooth">
                {log.length === 0 && !running && (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                    <Bot className="w-10 h-10 mb-4 opacity-20" />
                    <p className="text-sm font-medium">Agent is idle</p>
                    <p className="text-xs mt-1 opacity-60">Press "Run Agent" to start the agentic loop</p>
                  </div>
                )}

                <AnimatePresence initial={false}>
                  {log.map((entry) => (
                    <LogLine key={entry.id} entry={entry} />
                  ))}
                </AnimatePresence>

                {/* Live thinking buffer */}
                {thinkingBuffer && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-start gap-2 text-muted-foreground"
                  >
                    <Loader2 className="w-3 h-3 mt-0.5 shrink-0 animate-spin" />
                    <span className="leading-relaxed opacity-70">{thinkingBuffer}</span>
                  </motion.div>
                )}

                <div ref={logEndRef} />
              </div>
            </Card>
          </div>

          {/* ── Actions Panel (right 1/3) ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-mono font-bold text-muted-foreground uppercase tracking-widest">
                Agent Actions
              </h2>
              {actions.length > 0 && (
                <Badge variant="secondary" className="font-mono text-xs">
                  {actions.length} taken
                </Badge>
              )}
            </div>

            <Card className="rounded-xl border-border shadow-sm bg-white overflow-hidden">
              <div className="h-[540px] overflow-y-auto p-4 space-y-3">
                {actions.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                    <Sparkles className="w-8 h-8 mb-3 opacity-20" />
                    <p className="text-xs text-center opacity-60">
                      Actions the agent takes will appear here
                    </p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {actions.map((action, idx) => {
                      const Icon = (ACTION_ICONS[action.type] ?? Zap) as any;
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`rounded-xl border p-3 text-xs ${ACTION_COLORS[action.type] ?? "bg-gray-100 border-gray-200 text-gray-700"}`}
                        >
                          <div className="flex items-center gap-2 mb-1.5 font-bold uppercase tracking-wider">
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            {action.type.replace("_", " ")}
                          </div>
                          <p className="leading-relaxed opacity-90">{action.reason}</p>
                          {action.payload?.title && (
                            <p className="mt-1 opacity-70 truncate">
                              → {action.payload.title}
                            </p>
                          )}
                          {action.payload?.lostItem && (
                            <p className="mt-1 opacity-70 truncate">
                              {action.payload.lostItem} ↔ {action.payload.foundItem} ({action.payload.score}%)
                            </p>
                          )}
                          {action.payload?.text && (
                            <p className="mt-1 opacity-70">{action.payload.text}</p>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* ── How it works ── */}
        <motion.div
          className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {[
            { icon: Brain, label: "Analyze Grievances", desc: "Detects critical & duplicate tickets" },
            { icon: ArrowUpCircle, label: "Escalate Tickets", desc: "Auto-escalates high-risk issues" },
            { icon: Wrench, label: "Maintenance Patterns", desc: "Finds systemic infrastructure faults" },
            { icon: Link2, label: "Match Lost & Found", desc: "Pairs items using keyword scoring" },
            { icon: Bell, label: "Push Notifications", desc: "Sends alerts to the live feed" },
          ].map((step, idx) => (
            <Card key={idx} className="p-4 rounded-xl border-border shadow-sm bg-white/50">
              <step.icon className="w-5 h-5 text-primary mb-2" strokeWidth={1.5} />
              <p className="text-xs font-bold text-foreground mb-1">{step.label}</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{step.desc}</p>
            </Card>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

// ── Log Line sub-component ────────────────────────────────────────────────────
function LogLine({ entry }: { entry: LogEntry }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-2"
    >
      {/* Timestamp */}
      <span className="text-muted-foreground/50 shrink-0 tabular-nums">{entry.timestamp}</span>

      {/* Icon + content */}
      {entry.type === "status" && (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Loader2 className="w-3 h-3 animate-spin shrink-0" />
          <span>{entry.message}</span>
        </div>
      )}

      {entry.type === "thinking" && (
        <div className="flex items-start gap-1.5 text-muted-foreground/70 italic">
          <Brain className="w-3 h-3 mt-0.5 shrink-0 text-primary/50" />
          <span className="leading-relaxed">{entry.content}</span>
        </div>
      )}

      {entry.type === "tool_start" && (
        <div className="flex-1">
          <div className="flex items-center gap-1.5 text-primary font-bold">
            <Zap className="w-3 h-3 shrink-0" />
            <span>→ {TOOL_LABELS[entry.tool ?? ""] ?? entry.tool}</span>
          </div>
          {entry.input && Object.keys(entry.input).length > 0 && (
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-1 mt-0.5 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              <ChevronRight
                className={`w-3 h-3 transition-transform ${open ? "rotate-90" : ""}`}
              />
              <span>input</span>
            </button>
          )}
          {open && (
            <pre className="mt-1 p-2 bg-secondary/50 rounded-lg text-[10px] overflow-x-auto">
              {JSON.stringify(entry.input, null, 2)}
            </pre>
          )}
        </div>
      )}

      {entry.type === "tool_end" && (
        <div className="flex-1">
          <div className="flex items-center gap-1.5 text-green-600 font-bold">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            <span>✓ {TOOL_LABELS[entry.tool ?? ""] ?? entry.tool}</span>
          </div>
          {entry.result && (
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-1 mt-0.5 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              <ChevronRight
                className={`w-3 h-3 transition-transform ${open ? "rotate-90" : ""}`}
              />
              <span>result</span>
            </button>
          )}
          {open && (
            <pre className="mt-1 p-2 bg-secondary/50 rounded-lg text-[10px] overflow-x-auto">
              {JSON.stringify(entry.result, null, 2)}
            </pre>
          )}
        </div>
      )}

      {entry.type === "done" && (
        <div className="flex items-center gap-1.5 text-primary font-bold">
          <Sparkles className="w-3 h-3 shrink-0" />
          <span>Agent completed — {entry.actions?.length ?? 0} actions taken</span>
        </div>
      )}

      {entry.type === "error" && (
        <div className="flex items-center gap-1.5 text-destructive font-bold">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          <span>{entry.message}</span>
        </div>
      )}
    </motion.div>
  );
}
