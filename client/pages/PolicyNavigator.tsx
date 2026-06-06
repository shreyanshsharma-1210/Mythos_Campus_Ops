import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { extractTextFromPDF } from "@/lib/pdfExtract";
import { callGPT } from "@/lib/openai";
import { PageLayout } from "@/components/PageLayout";
import { useCampusOS } from "@/contexts/CampusOSContext";
import {
  MessageSquare, Scissors, CheckCircle2, ClipboardList,
  Upload, Mic, Send, BookOpen, ChevronRight,
} from "lucide-react";

type Mode = "chat" | "simplify" | "eligibility" | "procedures";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  simplified?: string;
  source?: string;
  confidence?: number;
  followUps?: string[];
}

const TABS: { id: Mode; label: string; Icon: typeof MessageSquare }[] = [
  { id: "chat",        label: "Chat",       Icon: MessageSquare },
  { id: "simplify",    label: "Simplify",   Icon: Scissors },
  { id: "eligibility", label: "Eligibility",Icon: CheckCircle2 },
  { id: "procedures",  label: "Procedures", Icon: ClipboardList },
];

const ELIGIBILITY_OPTIONS = [
  "Scholarship", "Hostel Accommodation", "Exam Eligibility", "Placement Registration",
];

export default function PolicyNavigator() {
  const { policyDocuments } = useCampusOS();
  const [mode, setMode] = useState<Mode>("chat");
  const [isLoading, setIsLoading] = useState(false);

  // Derive context text from all active policy documents uploaded by admin
  const activeDocs = policyDocuments.filter(d => d.active);
  const contextText = activeDocs.map(d => `--- Document: ${d.name} ---\n${d.text}`).join("\n\n");

  const [messages, setMessages] = useState<Message[]>([{
    id: "1", sender: "ai",
    text: "Hello! I am the Campus Policy Navigator. Ask me anything about official campus policies.",
  }]);
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [simplifyInput, setSimplifyInput] = useState("");
  const [simplifyResult, setSimplifyResult] = useState<{ original: string; simplified: string } | null>(null);

  const [cgpa, setCgpa] = useState("");
  const [attendance, setAttendance] = useState("");
  const [income, setIncome] = useState("");
  const [year, setYear] = useState("");
  const [checkFor, setCheckFor] = useState(ELIGIBILITY_OPTIONS[0]);
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);

  const [procInput, setProcInput] = useState("");
  const [procResult, setProcResult] = useState<{ steps: string[]; notes: string } | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), sender: "user", text: chatInput };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsLoading(true);

    const systemPrompt = `You are a campus policy assistant. Answer using ONLY the document text provided.
If the answer cannot be found in the document text, you MUST set "answer" to "I could not find this information in the uploaded policy documents." and "is_in_document" to false, and leave "simplified_version" and "source_section" empty.
Do NOT hallucinate or invent policies.
Return ONLY this JSON:
{"answer":"clear plain English answer","simplified_version":"same answer rewritten simply (Grade 8 level)","source_section":"approximate section or page reference","confidence":0,"is_in_document":true,"follow_up_questions":["q1","q2"],"important_caveat":null}
Document:\n${contextText || "No document loaded."}`;

    try {
      const raw = await callGPT(systemPrompt, userMsg.text);
      const parsed = JSON.parse(raw.trim().replace(/```json/g, "").replace(/```/g, ""));
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(), sender: "ai",
        text: parsed.answer, simplified: parsed.simplified_version,
        source: parsed.source_section, confidence: parsed.confidence,
        followUps: parsed.follow_up_questions,
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(), sender: "ai",
        text: "I could not find this information in the uploaded policy documents.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      const r = new SR();
      r.onresult = (e: any) => setChatInput(e.results[0][0].transcript);
      r.start();
    }
  };

  const handleSimplify = async () => {
    if (!simplifyInput.trim()) return;
    setIsLoading(true); setSimplifyResult(null);
    try {
      const raw = await callGPT(
        `Simplify this policy text. Return ONLY JSON: { "simplified": "plain English, max 3 sentences, Grade 8 level" }`,
        simplifyInput
      );
      const parsed = JSON.parse(raw.trim().replace(/```json/g, "").replace(/```/g, ""));
      setSimplifyResult({ original: simplifyInput, simplified: parsed.simplified });
    } catch {
      setSimplifyResult({ original: simplifyInput, simplified: "Could not simplify. Please try again." });
    } finally { setIsLoading(false); }
  };

  const handleEligibility = async () => {
    if (!cgpa && !attendance) return;
    setIsLoading(true); setEligibilityResult(null);
    const doc = contextText ? `\n\nPolicy Document:\n${contextText}` : "";
    const prompt = `You are a campus eligibility checker. Answer using ONLY the document text provided.
If the eligibility requirements or details cannot be verified from the document text, you MUST return:
{"eligible":false,"reason":"I could not find this information in the uploaded policy documents.","policy_reference":"N/A","missing_requirements":[],"recommendation":"Please contact an administrator."}
Otherwise, return ONLY JSON:
{"eligible":true,"reason":"one sentence explanation","policy_reference":"section or General Policy","missing_requirements":[],"recommendation":"one sentence"}${doc}`;
    const userMsg = `Check eligibility for: ${checkFor}\nCGPA: ${cgpa||"N/A"}\nAttendance: ${attendance||"N/A"}%\nFamily Income: ₹${income||"N/A"}\nYear: ${year||"N/A"}`;
    try {
      const raw = await callGPT(prompt, userMsg);
      const parsed = JSON.parse(raw.trim().replace(/```json/g, "").replace(/```/g, ""));
      setEligibilityResult(parsed);
    } catch {
      setEligibilityResult({
        eligible: false,
        reason: "I could not find this information in the uploaded policy documents.",
        policy_reference: "N/A",
        missing_requirements: [],
        recommendation: "Please contact an administrator.",
      });
    } finally { setIsLoading(false); }
  };

  const handleProcedure = async () => {
    if (!procInput.trim()) return;
    setIsLoading(true); setProcResult(null);
    const doc = contextText ? `\n\nPolicy Document:\n${contextText}` : "";
    const prompt = `You are a campus procedure guide. Answer using ONLY the document text provided.
If the procedure cannot be found in the document text, you MUST return:
{"steps":["I could not find this information in the uploaded policy documents."],"notes":"Please contact an administrator."}
Otherwise, return ONLY JSON:
{"steps":["Step 1: ...","Step 2: ..."],"notes":"any important note or deadline"}${doc}`;
    try {
      const raw = await callGPT(prompt, `How do I: ${procInput}`);
      const parsed = JSON.parse(raw.trim().replace(/```json/g, "").replace(/```/g, ""));
      setProcResult(parsed);
    } catch {
      setProcResult({
        steps: ["I could not find this information in the uploaded policy documents."],
        notes: "Please contact an administrator.",
      });
    } finally { setIsLoading(false); }
  };

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <p className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase mb-1">Module · Policy</p>
          <h1 className="text-3xl font-display font-black uppercase tracking-wide text-foreground leading-none">Policy Navigator</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-powered campus policy assistant — chat, simplify, check eligibility, find procedures.</p>
        </div>

        {policyDocuments.length === 0 ? (
          <div className="text-center py-16 bg-white border border-border rounded-xl p-8 shadow-sm">
            <BookOpen className="w-10 h-10 mx-auto mb-4 text-muted-foreground opacity-30" strokeWidth={1.5} />
            <p className="font-display font-black uppercase tracking-wide text-foreground">No policy documents have been uploaded by the administration.</p>
            <p className="text-sm text-muted-foreground mt-2">Please contact an administrator.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* ── Left: mode tabs ── */}
            <div className="space-y-4">
              <Card className="bg-white border-border shadow-sm rounded-xl overflow-hidden">
                <div className="p-4">
                  <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-3">Modes</p>
                  <div className="space-y-1">
                    {TABS.map(({ id, label, Icon }) => (
                      <button key={id} onClick={() => setMode(id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                          mode === id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
                        }`}>
                        <Icon className={`w-4 h-4 shrink-0 ${mode === id ? "text-primary-foreground" : "text-muted-foreground"}`} strokeWidth={1.75} />
                        <span className="font-display font-black uppercase tracking-wide text-xs">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Usage tips */}
              <Card className="bg-white border-border shadow-sm rounded-xl">
                <div className="p-4">
                  <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-3">Quick Ask</p>
                  <div className="space-y-1.5">
                    {["Can I install an AC?", "Visitor timing rules?", "Fine for late fee?", "Attendance shortage appeal"].map((q) => (
                      <button key={q} onClick={() => { setMode("chat"); setChatInput(q); }}
                        className="w-full text-left text-[10px] text-muted-foreground hover:text-primary px-2 py-1.5 rounded-lg hover:bg-secondary transition-colors flex items-center gap-2">
                        <ChevronRight className="w-3 h-3 shrink-0" />
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

          {/* ── Right: mode content ── */}
          <div className="lg:col-span-3">
            <Card className="bg-white border-border shadow-sm rounded-xl overflow-hidden h-full flex flex-col" style={{ minHeight: "600px" }}>

              <AnimatePresence mode="wait">
                <motion.div key={mode} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
                  className="flex flex-col flex-1 overflow-hidden h-full">

                  {/* ── CHAT ── */}
                  {mode === "chat" && (
                    <>
                      <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        {messages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[80%] rounded-2xl p-4 ${
                              msg.sender === "user"
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-secondary/50 border border-border text-foreground rounded-bl-sm"
                            }`}>
                              {msg.sender === "ai" && msg.confidence !== undefined && (
                                <div className="flex justify-between items-center mb-2">
                                  <div className="flex items-center gap-1.5">
                                    <BookOpen className="w-3 h-3 text-primary" strokeWidth={1.75} />
                                    <span className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Policy AI</span>
                                  </div>
                                  <span className="text-[9px] font-mono font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 px-2 py-0.5 rounded">
                                    {msg.confidence}% confidence
                                  </span>
                                </div>
                              )}
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                              {msg.simplified && (
                                <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded-xl">
                                  <p className="text-[8px] font-mono tracking-widest text-primary uppercase mb-1">Simplified</p>
                                  <p className="text-xs text-muted-foreground">{msg.simplified}</p>
                                </div>
                              )}
                              {msg.source && (
                                <span className="mt-2 inline-block text-[9px] font-mono bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2 py-0.5 rounded">
                                  {msg.source}
                                </span>
                              )}
                              {msg.followUps && msg.followUps.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                  {msg.followUps.map((q, i) => (
                                    <button key={i} onClick={() => setChatInput(q)}
                                      className="text-[10px] bg-white border border-border px-2.5 py-1 rounded-full hover:border-primary transition-colors text-foreground">
                                      {q}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {isLoading && (
                          <div className="flex justify-start">
                            <div className="bg-secondary/50 border border-border rounded-2xl rounded-bl-sm p-4 flex gap-1.5">
                              {[0, 0.2, 0.4].map((d, i) => (
                                <div key={i} className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
                              ))}
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      <div className="border-t border-border p-4 flex gap-2">
                        <button onClick={startVoice}
                          className="p-2.5 rounded-xl border border-border text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                          <Mic className="w-4 h-4" strokeWidth={1.75} />
                        </button>
                        <Input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                          placeholder="Ask anything about the policies…"
                          className="flex-1 bg-background border-border focus-visible:ring-primary" />
                        <Button onClick={handleSendChat} disabled={!chatInput.trim()}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-4">
                          <Send className="w-4 h-4" strokeWidth={1.75} />
                        </Button>
                      </div>
                    </>
                  )}

                  {/* ── SIMPLIFY ── */}
                  {mode === "simplify" && (
                    <div className="flex-1 overflow-y-auto p-5 space-y-5">
                      <div>
                        <h3 className="text-base font-display font-black uppercase tracking-wide text-foreground mb-1">Policy Simplifier</h3>
                        <p className="text-sm text-muted-foreground mb-4">Paste any policy excerpt and get a plain-English version instantly.</p>
                        <Textarea value={simplifyInput} onChange={(e) => setSimplifyInput(e.target.value)}
                          placeholder={`Paste policy text here…\n\nExample: "Students failing to satisfy the prescribed attendance requirements shall be deemed ineligible to appear in the University Examinations…"`}
                          rows={5} className="bg-background border-border focus-visible:ring-primary resize-none" />
                        <Button onClick={handleSimplify} disabled={isLoading || !simplifyInput.trim()}
                          className="mt-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-display font-black uppercase tracking-wide">
                          {isLoading ? "Simplifying…" : "Simplify This"}
                        </Button>
                      </div>

                      {simplifyResult && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-secondary/40 border border-border rounded-xl p-4">
                            <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-3">Original</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">{simplifyResult.original}</p>
                          </div>
                          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                            <p className="text-[8px] font-mono tracking-widest text-primary uppercase mb-3">Simplified</p>
                            <p className="text-sm text-foreground font-medium leading-relaxed">{simplifyResult.simplified}</p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* ── ELIGIBILITY ── */}
                  {mode === "eligibility" && (
                    <div className="flex-1 overflow-y-auto p-5 space-y-5">
                      <div>
                        <h3 className="text-base font-display font-black uppercase tracking-wide text-foreground mb-1">Eligibility Checker</h3>
                        <p className="text-sm text-muted-foreground">Enter your details to check if you qualify — verified against the loaded policy.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "CGPA",             value: cgpa,       setter: setCgpa,       placeholder: "e.g. 8.5" },
                          { label: "Attendance %",     value: attendance, setter: setAttendance, placeholder: "e.g. 82" },
                          { label: "Family Income (₹)",value: income,     setter: setIncome,     placeholder: "e.g. 300000" },
                          { label: "Year of Study",    value: year,       setter: setYear,       placeholder: "e.g. 2" },
                        ].map((f) => (
                          <div key={f.label}>
                            <label className="block text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-1.5">{f.label}</label>
                            <Input type="number" value={f.value} onChange={(e) => f.setter(e.target.value)}
                              placeholder={f.placeholder} className="bg-background border-border focus-visible:ring-primary" />
                          </div>
                        ))}
                      </div>

                      <div>
                        <label className="block text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-2">Check eligibility for</label>
                        <div className="flex flex-wrap gap-2">
                          {ELIGIBILITY_OPTIONS.map((opt) => (
                            <button key={opt} onClick={() => setCheckFor(opt)}
                              className={`px-3 py-1.5 rounded-xl text-sm border font-medium transition-colors ${
                                checkFor === opt
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-background border-border text-muted-foreground hover:border-foreground/30"
                              }`}>
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <Button onClick={handleEligibility} disabled={isLoading || (!cgpa && !attendance)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-display font-black uppercase tracking-wide">
                        {isLoading ? "Checking…" : "Check Eligibility"}
                      </Button>

                      {eligibilityResult && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                          <div className={`rounded-xl p-5 border ${
                            eligibilityResult.eligible
                              ? "bg-emerald-500/5 border-emerald-500/30"
                              : "bg-destructive/5 border-destructive/30"
                          }`}>
                            <div className="flex items-center gap-3 mb-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                eligibilityResult.eligible ? "bg-emerald-500/10" : "bg-destructive/10"
                              }`}>
                                <CheckCircle2 className={`w-5 h-5 ${eligibilityResult.eligible ? "text-emerald-600" : "text-destructive"}`} strokeWidth={1.75} />
                              </div>
                              <div>
                                <p className={`text-lg font-display font-black uppercase ${eligibilityResult.eligible ? "text-emerald-600" : "text-destructive"}`}>
                                  {eligibilityResult.eligible ? "Eligible" : "Not Eligible"}
                                </p>
                                <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">{checkFor}</p>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{eligibilityResult.reason}</p>
                            <p className="text-[9px] font-mono text-amber-600 mb-3">Ref: {eligibilityResult.policy_reference}</p>
                            {eligibilityResult.missing_requirements?.length > 0 && (
                              <div className="mb-3">
                                <p className="text-[8px] font-mono tracking-widest text-destructive uppercase mb-1.5">Missing Requirements</p>
                                {eligibilityResult.missing_requirements.map((r: string, i: number) => (
                                  <p key={i} className="text-xs text-muted-foreground">• {r}</p>
                                ))}
                              </div>
                            )}
                            <div className="bg-white border border-border rounded-xl p-3">
                              <p className="text-[8px] font-mono tracking-widest text-primary uppercase mb-1">Recommendation</p>
                              <p className="text-xs text-muted-foreground">{eligibilityResult.recommendation}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* ── PROCEDURES ── */}
                  {mode === "procedures" && (
                    <div className="flex-1 overflow-y-auto p-5 space-y-5">
                      <div>
                        <h3 className="text-base font-display font-black uppercase tracking-wide text-foreground mb-1">Procedure Navigator</h3>
                        <p className="text-sm text-muted-foreground mb-4">Know the rule but not the process? Get step-by-step guidance.</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {["Apply for hostel leave", "Appeal attendance shortage", "Apply for fee waiver", "Register for internship NOC"].map((q) => (
                          <button key={q} onClick={() => setProcInput(q)}
                            className="text-[10px] bg-white border border-border px-3 py-1.5 rounded-full hover:border-primary hover:text-primary transition-colors text-muted-foreground">
                            {q}
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Input value={procInput} onChange={(e) => setProcInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleProcedure()}
                          placeholder="e.g. How do I apply for hostel leave?"
                          className="flex-1 bg-background border-border focus-visible:ring-primary" />
                        <Button onClick={handleProcedure} disabled={isLoading || !procInput.trim()}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-4">
                          {isLoading ? "…" : "Go"}
                        </Button>
                      </div>

                      {procResult && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                          <div className="bg-white border border-border rounded-xl p-5 space-y-3">
                            <p className="text-[8px] font-mono tracking-widest text-primary uppercase mb-3">Step-by-Step Procedure</p>
                            {procResult.steps.map((step, i) => (
                              <div key={i} className="flex gap-3 items-start">
                                <div className="w-6 h-6 rounded-lg bg-primary text-primary-foreground text-[10px] font-display font-black flex items-center justify-center shrink-0">
                                  {i + 1}
                                </div>
                                <p className="text-sm text-muted-foreground pt-0.5 leading-relaxed">{step.replace(/^Step \d+:\s*/i, "")}</p>
                              </div>
                            ))}
                            {procResult.notes && (
                              <div className="mt-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                                <p className="text-[8px] font-mono tracking-widest text-amber-600 uppercase mb-1">Note</p>
                                <p className="text-xs text-muted-foreground">{procResult.notes}</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>

            </Card>
          </div>
        </div>
      )}
      </div>
    </PageLayout>
  );
}
