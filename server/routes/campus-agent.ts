import { AzureChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { HumanMessage } from "@langchain/core/messages";
import { z } from "zod";

// ── Agent action accumulator (per-request) ──────────────────────────────────
interface AgentAction {
  type: "escalate" | "pattern_alert" | "match" | "notification" | "resolve";
  payload: Record<string, any>;
  reason: string;
}

function buildAgent(
  state: { grievances: any[]; maintenanceReports: any[]; lostItems: any[]; foundItems: any[] },
  actions: AgentAction[]
) {
  // Resolve key — use server-side vars first, fall back to VITE_ vars (both available via dotenv)
  const apiKey =
    process.env.AZURE_OPENAI_API_KEY ||
    process.env.VITE_AZURE_OPENAI_API_KEY;

  const endpoint =
    process.env.AZURE_OPENAI_ENDPOINT ||
    process.env.VITE_AZURE_OPENAI_ENDPOINT ||
    "";

  // Extract instance name from endpoint URL if INSTANCE_NAME var is missing
  // e.g. "https://uaenorth.api.cognitive.microsoft.com" → "uaenorth"
  const instanceName =
    process.env.AZURE_OPENAI_INSTANCE_NAME ||
    endpoint.replace("https://", "").split(".")[0] ||
    undefined;

  const deployment =
    process.env.AZURE_OPENAI_DEPLOYMENT ||
    process.env.VITE_AZURE_OPENAI_DEPLOYMENT ||
    "gpt-4-1-mini";

  const apiVersion =
    process.env.AZURE_OPENAI_API_VERSION ||
    process.env.VITE_AZURE_OPENAI_API_VERSION ||
    "2024-12-01-preview";

  if (!apiKey) throw new Error("AZURE_OPENAI_API_KEY is not set in .env");

  const model = new AzureChatOpenAI({
    azureOpenAIApiKey: apiKey,
    azureOpenAIEndpoint: endpoint,
    azureOpenAIApiDeploymentName: deployment,
    azureOpenAIApiVersion: apiVersion,
    temperature: 0.2,
    maxTokens: 1000,
  });

  // ── Tool 1: analyze grievances ──────────────────────────────────────────
  const analyzeGrievances = tool(
    async ({ focus }) => {
      const { grievances } = state;
      const critical = grievances.filter(
        (g) => g.escalationRisk >= 70 || g.escalationRiskLevel === "Critical"
      );
      const highDuplicate = grievances.filter((g) => (g.duplicateCount ?? 1) >= 3);
      const pending = grievances.filter((g) => g.status === "Pending");

      const summary = {
        total: grievances.length,
        pending: pending.length,
        critical_risk: critical.map((g) => ({ id: g.id, title: g.title, risk: g.escalationRisk })),
        high_duplicate: highDuplicate.map((g) => ({
          id: g.id,
          title: g.title,
          duplicateCount: g.duplicateCount,
        })),
        focus,
      };
      return JSON.stringify(summary);
    },
    {
      name: "analyze_grievances",
      description:
        "Analyze all current grievances. Returns critical items, duplicates, and pending counts.",
      schema: z.object({
        focus: z.string().describe("What aspect to focus on: 'critical' | 'duplicates' | 'all'"),
      }),
    }
  );

  // ── Tool 2: escalate a ticket ───────────────────────────────────────────
  const escalateTicket = tool(
    async ({ ticket_id, reason, priority }) => {
      const grievance = state.grievances.find((g) => g.id === ticket_id);
      if (!grievance) return JSON.stringify({ error: "Ticket not found" });
      const action: AgentAction = {
        type: "escalate",
        payload: { id: ticket_id, title: grievance.title, priority },
        reason,
      };
      actions.push(action);
      return JSON.stringify({ success: true, escalated: ticket_id, reason });
    },
    {
      name: "escalate_ticket",
      description: "Escalate a grievance ticket to the next priority level.",
      schema: z.object({
        ticket_id: z.string().describe("The ticket ID to escalate"),
        reason: z.string().describe("Why this ticket needs escalation"),
        priority: z.enum(["High", "Critical"]).describe("New priority level"),
      }),
    }
  );

  // ── Tool 3: detect maintenance patterns ────────────────────────────────
  const detectMaintenancePatterns = tool(
    async () => {
      const { maintenanceReports } = state;
      const open = maintenanceReports.filter((r) => r.status !== "Resolved");
      const typeCount: Record<string, string[]> = {};
      for (const r of open) {
        const key = (r.issueType ?? "other").toLowerCase();
        if (!typeCount[key]) typeCount[key] = [];
        typeCount[key].push(r.location ?? "Unknown");
      }
      const patterns = Object.entries(typeCount)
        .filter(([, locs]) => locs.length >= 2)
        .map(([type, locations]) => ({ type, count: locations.length, locations }));

      for (const p of patterns) {
        if (p.count >= 2) {
          const action: AgentAction = {
            type: "pattern_alert",
            payload: { issueType: p.type, count: p.count, locations: p.locations },
            reason: `${p.count} open ${p.type} issues detected — possible systemic fault`,
          };
          actions.push(action);
        }
      }
      return JSON.stringify({ open_issues: open.length, patterns });
    },
    {
      name: "detect_maintenance_patterns",
      description:
        "Scan all maintenance reports for recurring issue types or locations. Returns patterns found.",
      schema: z.object({}),
    }
  );

  // ── Tool 4: match lost & found items ───────────────────────────────────
  const matchLostFound = tool(
    async () => {
      const { lostItems, foundItems } = state;
      const matches: Array<{ lostId: string; foundId: string; score: number; reason: string }> = [];

      for (const lost of lostItems) {
        for (const found of foundItems) {
          if (lost.category && found.category && lost.category === found.category) {
            const lostDesc = (lost.item + " " + (lost.description ?? "")).toLowerCase();
            const foundDesc = (found.item + " " + (found.description ?? "")).toLowerCase();
            const lostWords = lostDesc.split(/\s+/);
            const commonWords = lostWords.filter(
              (w) => w.length > 3 && foundDesc.includes(w)
            );
            const score = Math.min(95, 40 + commonWords.length * 15);
            if (score >= 55) {
              matches.push({
                lostId: lost.id,
                foundId: found.id,
                score,
                reason: `Same category (${lost.category}), shared keywords: ${commonWords.slice(0, 3).join(", ")}`,
              });
              const action: AgentAction = {
                type: "match",
                payload: { lostId: lost.id, foundId: found.id, score, lostItem: lost.item, foundItem: found.item },
                reason: `${score}% match — ${lost.item} ↔ ${found.item}`,
              };
              actions.push(action);
            }
          }
        }
      }
      return JSON.stringify({ matches_found: matches.length, matches });
    },
    {
      name: "match_lost_found_items",
      description:
        "Run semantic matching between all active lost and found item reports. Returns matches with confidence scores.",
      schema: z.object({}),
    }
  );

  // ── Tool 5: push a notification ────────────────────────────────────────
  const pushNotification = tool(
    async ({ text, notif_type }) => {
      const action: AgentAction = {
        type: "notification",
        payload: { text, notifType: notif_type },
        reason: "Agent-generated alert",
      };
      actions.push(action);
      return JSON.stringify({ pushed: true, text });
    },
    {
      name: "push_notification",
      description: "Push an alert or finding to the live campus activity feed.",
      schema: z.object({
        text: z.string().describe("The notification message"),
        notif_type: z
          .enum(["grievance", "maintenance", "match", "policy"])
          .describe("Category of the notification"),
      }),
    }
  );

  const agentTools = [
    analyzeGrievances,
    escalateTicket,
    detectMaintenancePatterns,
    matchLostFound,
    pushNotification,
  ];

  return createReactAgent({ llm: model, tools: agentTools });
}

// ── Express handler ─────────────────────────────────────────────────────────
export async function handleCampusAgent(req: any, res: any) {
  const { grievances = [], maintenanceReports = [], lostItems = [], foundItems = [] } = req.body;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const send = (data: object) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  const actions: AgentAction[] = [];

  // Build agent inside try so constructor errors are caught gracefully
  let agent: Awaited<ReturnType<typeof buildAgent>>;
  try {
    agent = buildAgent({ grievances, maintenanceReports, lostItems, foundItems }, actions);
  } catch (buildErr: any) {
    send({ type: "error", message: `Agent init failed: ${buildErr?.message ?? buildErr}` });
    res.end();
    return;
  }

  const systemContext = `You are the Campus Ops AI Agent — an autonomous campus management AI.

Current campus state:
- Grievances: ${grievances.length} total (${grievances.filter((g: any) => g.status === "Pending").length} pending)
- Maintenance issues: ${maintenanceReports.length} total (${maintenanceReports.filter((r: any) => r.status === "Open").length} open)
- Lost items: ${lostItems.length} active cases
- Found items: ${foundItems.length} items awaiting matching

Your mission:
1. Analyze all grievances and escalate any with escalation_risk >= 70 or status Pending with high urgency
2. Detect maintenance patterns (2+ open issues of same type = systemic fault)
3. Match lost items with found items using semantic similarity
4. Push relevant notifications for critical findings
5. Provide a final summary of all actions taken

Be thorough. Use each tool at least once. After all tool calls, provide a concise final summary.`;

  try {
    send({ type: "status", message: "Agent initializing…" });

    const stream = agent.streamEvents(
      { messages: [new HumanMessage(systemContext)] },
      { version: "v2" }
    );

    for await (const event of stream) {
      if (event.event === "on_chat_model_stream") {
        const chunk = event.data?.chunk?.content;
        if (chunk && typeof chunk === "string") {
          send({ type: "thinking", content: chunk });
        }
      }

      if (event.event === "on_tool_start") {
        send({
          type: "tool_start",
          tool: event.name,
          input: event.data?.input,
        });
      }

      if (event.event === "on_tool_end") {
        let result: any = event.data?.output;
        try {
          result = JSON.parse(typeof result === "string" ? result : JSON.stringify(result));
        } catch { /* keep as string */ }
        send({
          type: "tool_end",
          tool: event.name,
          result,
        });
      }
    }

    send({ type: "done", actions });
  } catch (err: any) {
    send({ type: "error", message: err?.message ?? "Agent failed" });
  } finally {
    res.end();
  }
}
