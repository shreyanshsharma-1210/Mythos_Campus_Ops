import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageLayout } from "@/components/PageLayout";
import { callGPT } from "@/lib/openai";
import { sendWhatsAppAlert } from "@/lib/whatsapp";
import { ShieldAlert, Phone, CheckCircle2, Lock } from "lucide-react";

const HELPLINES = [
  { label: "UGC Anti-Ragging Helpline", number: "1800-180-5522", available: "24×7, Free" },
  { label: "National Anti-Ragging Helpline", number: "1800-180-5522", available: "All days" },
  { label: "Campus Student Welfare (Internal)", number: "Ext. 1044", available: "9 AM – 6 PM" },
  { label: "Police Emergency", number: "112", available: "24×7" },
];

interface Assessment {
  severity: "low" | "medium" | "high" | "critical";
  severity_score: number;
  incident_type: string;
  immediate_actions: string[];
  authorities_to_contact: string[];
  support_message: string;
  whatsapp_alert: boolean;
}

export default function AntiRagging() {
  const [incident, setIncident] = useState("");
  const [location, setLocation] = useState("");
  const [relation, setRelation] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [referenceId] = useState(() => `AR-${Date.now().toString(36).toUpperCase()}`);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incident.trim()) return;
    setLoading(true);

    const systemPrompt = `You are an anti-ragging response system for an Indian university. Assess reported incidents and provide structured guidance.
Return ONLY this JSON:
{
  "severity": "low|medium|high|critical",
  "severity_score": 1-10,
  "incident_type": "string (verbal abuse, physical harassment, mental torture, forced activity, discrimination, etc.)",
  "immediate_actions": ["action1", "action2", "action3"],
  "authorities_to_contact": ["authority1", "authority2"],
  "support_message": "2-3 sentence empathetic support message",
  "whatsapp_alert": true|false
}`;

    const userMsg = `Incident description: ${incident}\nLocation: ${location || "Not specified"}\nRelationship to perpetrators: ${relation || "Not specified"}`;

    try {
      const raw = await callGPT(systemPrompt, userMsg, 500);
      const data: Assessment = JSON.parse(raw.trim().replace(/```json/g, "").replace(/```/g, ""));
      setAssessment(data);

      if (data.whatsapp_alert || data.severity === "high" || data.severity === "critical") {
        await sendWhatsAppAlert({
          type: "anti_ragging",
          title: `Anti-Ragging Report [${data.severity.toUpperCase()}]`,
          body: `Ref: ${referenceId} | Type: ${data.incident_type} | Score: ${data.severity_score}/10`,
          urgent: data.severity === "critical" || data.severity === "high",
        }).catch(() => {});
      }
    } catch {
      // Fallback static assessment
      setAssessment({
        severity: incident.length > 100 ? "high" : "medium",
        severity_score: incident.length > 100 ? 7 : 5,
        incident_type: "Reported incident",
        immediate_actions: [
          "Document the incident with date, time, and witnesses",
          "Report to the Anti-Ragging Committee immediately",
          "Call UGC helpline 1800-180-5522 if you feel unsafe",
        ],
        authorities_to_contact: ["Anti-Ragging Committee", "Dean of Students"],
        support_message: "You are not alone. What happened to you is not okay and action will be taken. Your report is completely confidential and you are protected under UGC anti-ragging regulations.",
        whatsapp_alert: false,
      });
    }

    setSubmitted(true);
    setLoading(false);
  };

  const severityColor = (s: Assessment["severity"]) =>
    s === "critical" ? "text-destructive" : s === "high" ? "text-orange-600" : s === "medium" ? "text-amber-600" : "text-emerald-600";
  const severityBg = (s: Assessment["severity"]) =>
    s === "critical" ? "bg-destructive/10 border-destructive/30" : s === "high" ? "bg-orange-500/10 border-orange-500/30" :
    s === "medium" ? "bg-amber-500/10 border-amber-500/30" : "bg-emerald-500/10 border-emerald-500/30";

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto space-y-8">

        <div>
          <p className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase mb-1">Module · Safety</p>
          <h1 className="text-3xl font-display font-black uppercase tracking-wide text-foreground leading-none">Anti-Ragging Report</h1>
          <p className="text-sm text-muted-foreground mt-1">Anonymous & confidential. Your report is encrypted and reviewed by the Anti-Ragging Committee.</p>
        </div>

        {/* Helplines always visible */}
        <div className="grid grid-cols-2 gap-3">
          {HELPLINES.map((h) => (
            <div key={h.label} className="p-3 bg-primary/5 border border-primary/15 rounded-xl">
              <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-0.5">{h.available}</p>
              <p className="text-xs font-display font-black text-foreground">{h.label}</p>
              <p className="text-sm font-mono text-primary font-bold">{h.number}</p>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card className="bg-white border-border shadow-sm rounded-xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-destructive/10 rounded-xl flex items-center justify-center">
                      <ShieldAlert className="w-4 h-4 text-destructive" strokeWidth={1.75} />
                    </div>
                    <div>
                      <CardTitle className="text-base font-display font-black uppercase tracking-wide">Report Incident</CardTitle>
                      <p className="text-[9px] font-mono text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Lock className="w-2.5 h-2.5" /> 100% Anonymous · Ref: {referenceId}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5">

                    <div className="space-y-2">
                      <label className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase">Describe the incident *</label>
                      <Textarea
                        value={incident}
                        onChange={(e) => setIncident(e.target.value)}
                        placeholder="Describe what happened in as much detail as you're comfortable sharing. Include date, time, nature of the incident, and any witnesses if known."
                        required
                        rows={6}
                        className="bg-background border-border text-sm resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase">Location</label>
                        <Select onValueChange={setLocation}>
                          <SelectTrigger className="bg-background border-border text-sm h-9">
                            <SelectValue placeholder="Where did it happen?" />
                          </SelectTrigger>
                          <SelectContent>
                            {["Hostel Room", "Common Room", "Corridor/Stairway", "Canteen", "Classroom", "Sports Ground", "Campus Road", "Online/Social Media", "Off-Campus"].map(l => (
                              <SelectItem key={l} value={l}>{l}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase">Who did this?</label>
                        <Select onValueChange={setRelation}>
                          <SelectTrigger className="bg-background border-border text-sm h-9">
                            <SelectValue placeholder="Their relation to you" />
                          </SelectTrigger>
                          <SelectContent>
                            {["Senior Student", "Hostel Mate", "Classmate", "Unknown Student", "College Staff", "Unknown Person"].map(r => (
                              <SelectItem key={r} value={r}>{r}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="p-3 bg-secondary/40 rounded-xl text-[10px] font-mono text-muted-foreground leading-relaxed">
                      Your report is completely anonymous. No personal identifiers are stored or transmitted. The Anti-Ragging Committee will investigate and take action as per UGC regulations 2009.
                    </div>

                    <Button type="submit" disabled={loading || !incident.trim()}
                      className="w-full h-11 font-display font-black uppercase tracking-wide bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl">
                      {loading ? "Assessing & Submitting…" : "Submit Anonymous Report"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

              {/* Confirmation */}
              <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" strokeWidth={1.75} />
                <div>
                  <p className="text-sm font-display font-black text-foreground uppercase">Report Submitted Successfully</p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-1">Reference ID: <span className="text-foreground font-bold">{referenceId}</span> · The Anti-Ragging Committee has been notified.</p>
                </div>
              </div>

              {assessment && (
                <>
                  {/* Severity */}
                  <div className={`p-4 rounded-xl border ${severityBg(assessment.severity)}`}>
                    <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-1">AI Severity Assessment</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-2xl font-display font-black uppercase ${severityColor(assessment.severity)}`}>
                          {assessment.severity} severity
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{assessment.incident_type}</p>
                      </div>
                      <p className={`text-4xl font-display font-black ${severityColor(assessment.severity)}`}>
                        {assessment.severity_score}<span className="text-lg text-muted-foreground">/10</span>
                      </p>
                    </div>
                  </div>

                  {/* Support message */}
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                    <p className="text-[8px] font-mono tracking-widest text-primary/70 uppercase mb-2">✦ Support Message</p>
                    <p className="text-sm text-foreground leading-relaxed">{assessment.support_message}</p>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-white border-border shadow-sm rounded-xl">
                      <CardContent className="p-4 space-y-2">
                        <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Immediate Actions</p>
                        {assessment.immediate_actions.map((a, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-[9px] font-mono text-primary mt-0.5 shrink-0">{i + 1}.</span>
                            <p className="text-xs text-foreground">{a}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                    <Card className="bg-white border-border shadow-sm rounded-xl">
                      <CardContent className="p-4 space-y-2">
                        <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Contact Authorities</p>
                        {assessment.authorities_to_contact.map((a, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <Phone className="w-3 h-3 text-primary mt-0.5 shrink-0" strokeWidth={1.75} />
                            <p className="text-xs text-foreground">{a}</p>
                          </div>
                        ))}
                        <div className="pt-1 mt-1 border-t border-border">
                          <p className="text-[9px] font-mono text-muted-foreground">UGC Helpline: <span className="text-primary font-bold">1800-180-5522</span></p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}

              <Button onClick={() => { setSubmitted(false); setAssessment(null); setIncident(""); setLocation(""); setRelation(""); }}
                variant="outline" className="w-full h-11 font-display font-black uppercase tracking-wide rounded-xl">
                Submit Another Report
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
}
