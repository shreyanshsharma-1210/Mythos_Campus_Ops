import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLayout } from "@/components/PageLayout";
import { callGPT, callGPTWithImage, fileToBase64 } from "@/lib/openai";
import { analyzeImageWithCV, cvResultToContext } from "@/lib/azureCV";
import { GraduationCap, AlertTriangle, CheckCircle2, RotateCcw, Camera, TrendingDown } from "lucide-react";

interface Subject {
  name: string;
  attended: string;
  total: string;
  percentage?: number;
}

interface AttendanceResult {
  subject: string;
  current: number;
  canMiss: number;
  mustAttend: number;
  status: "safe" | "warning" | "danger" | "debarred";
  message: string;
}

const THRESHOLD = 75;

function calcAttendance(attended: number, total: number): Omit<AttendanceResult, "subject"> {
  const pct = total > 0 ? Math.round((attended / total) * 100) : 0;
  const minRequired = Math.ceil(THRESHOLD * total / 100);
  const canMiss = Math.max(0, attended - minRequired);
  const mustAttend = pct < THRESHOLD ? Math.max(0, minRequired - attended) : 0;

  let status: AttendanceResult["status"] = "safe";
  if (pct < 50) status = "debarred";
  else if (pct < THRESHOLD) status = "danger";
  else if (pct < 80) status = "warning";

  const message =
    status === "debarred"   ? "Below 50% — likely debarred from exam. Contact academic office immediately." :
    status === "danger"     ? `Need to attend ${mustAttend} more classes to reach 75%.` :
    status === "warning"    ? `You can miss ${canMiss} more class${canMiss !== 1 ? "es" : ""} safely.` :
                              `Healthy attendance. You can miss ${canMiss} class${canMiss !== 1 ? "es" : ""}.`;

  return { current: pct, canMiss, mustAttend, status, message };
}

export default function AttendanceIntelligence() {
  const [subjects, setSubjects] = useState<Subject[]>([
    { name: "", attended: "", total: "" },
  ]);
  const [results, setResults] = useState<AttendanceResult[] | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sheetFile, setSheetFile] = useState<File | null>(null);
  const [sheetProcessing, setSheetProcessing] = useState(false);

  const addSubject = () => setSubjects((p) => [...p, { name: "", attended: "", total: "" }]);
  const removeSubject = (i: number) => setSubjects((p) => p.filter((_, idx) => idx !== i));
  const updateSubject = (i: number, field: keyof Subject, value: string) =>
    setSubjects((p) => p.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));

  const handleSheetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSheetFile(file);
    setSheetProcessing(true);
    try {
      // Azure CV reads the attendance sheet → GPT extracts subject/count data
      const cv = await analyzeImageWithCV(file);
      const cvCtx = cvResultToContext(cv);
      
      let parsed: Subject[] = [];
      try {
        const b64 = await fileToBase64(file);
        const raw = await callGPTWithImage(
          `You are an OCR assistant reading an attendance sheet. Extract subject names and attendance counts.
${cvCtx}
Return ONLY a JSON array: [{"name":"Subject","attended":0,"total":0}]`,
          "Extract attendance data from this sheet image.",
          b64, file.type || "image/jpeg", 600
        );
        parsed = JSON.parse(raw.trim().replace(/```json/g, "").replace(/```/g, ""));
      } catch (visionErr) {
        console.warn("Vision analysis failed, falling back to text OCR analysis:", visionErr);
        const raw = await callGPT(
          `You are an OCR assistant parsing text extracted from an attendance sheet. Extract subject names and attendance counts. Return ONLY a JSON array: [{"name":"Subject","attended":0,"total":0}]`,
          `Here is the text extracted from the sheet by Computer Vision:\n${cvCtx || "No text found"}`,
          600
        );
        parsed = JSON.parse(raw.trim().replace(/```json/g, "").replace(/```/g, ""));
      }

      if (Array.isArray(parsed) && parsed.length) {
        setSubjects(parsed.map((s) => ({ name: s.name, attended: String(s.attended), total: String(s.total) })));
      }
    } catch (err) {
      console.error("Attendance extraction failed completely:", err);
      // fallback — user fills manually
    } finally {
      setSheetProcessing(false);
    }
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAiAdvice(null);

    const computed = subjects
      .filter((s) => s.name && s.attended && s.total)
      .map((s) => ({
        subject: s.name,
        ...calcAttendance(Number(s.attended), Number(s.total)),
      }));
    setResults(computed);

    const dangerSubjects = computed.filter((r) => r.status === "danger" || r.status === "debarred");
    if (computed.length > 0) {
      const prompt = `Student attendance data:\n${computed.map(r => `${r.subject}: ${r.current}% (can miss ${r.canMiss}, must attend ${r.mustAttend})`).join("\n")}\n\nGive 2-3 sentence personalized advice on which subjects to prioritize and overall strategy. Be direct.`;
      try {
        const advice = await callGPT("You are an academic advisor giving brief, actionable attendance advice.", prompt, 200);
        setAiAdvice(advice);
      } catch {
        if (dangerSubjects.length) {
          setAiAdvice(`Prioritize ${dangerSubjects.map(s => s.subject).join(" and ")} — you're at risk of debarment. Attend every available class in these subjects before skipping anything else.`);
        } else {
          setAiAdvice("Your attendance is in a safe zone. Maintain consistency and avoid unnecessary absences in subjects close to 75%.");
        }
      }
    }
    setLoading(false);
  };

  const statusColor = (s: AttendanceResult["status"]) =>
    s === "debarred" ? "text-destructive" : s === "danger" ? "text-orange-600" : s === "warning" ? "text-amber-600" : "text-emerald-600";
  const statusBorder = (s: AttendanceResult["status"]) =>
    s === "debarred" ? "border-l-destructive" : s === "danger" ? "border-l-orange-500" : s === "warning" ? "border-l-amber-500" : "border-l-emerald-500";
  const barColor = (s: AttendanceResult["status"]) =>
    s === "debarred" ? "bg-destructive" : s === "danger" ? "bg-orange-500" : s === "warning" ? "bg-amber-500" : "bg-emerald-500";

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-8">

        <div>
          <p className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase mb-1">Module · Attendance</p>
          <h1 className="text-3xl font-display font-black uppercase tracking-wide text-foreground leading-none">Attendance Intelligence</h1>
          <p className="text-sm text-muted-foreground mt-1">Know exactly how many classes you can miss before hitting 75%.</p>
        </div>

        <AnimatePresence mode="wait">
          {!results ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card className="bg-white border-border shadow-sm rounded-xl">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                        <GraduationCap className="w-4 h-4 text-primary" strokeWidth={1.75} />
                      </div>
                      <CardTitle className="text-base font-display font-black uppercase tracking-wide">Enter Attendance</CardTitle>
                    </div>
                    {/* Upload attendance sheet */}
                    <label className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-primary/40 rounded-xl cursor-pointer hover:bg-primary/5 transition-colors text-[10px] font-mono text-primary">
                      <Camera className="w-3.5 h-3.5" strokeWidth={1.75} />
                      {sheetProcessing ? "Reading sheet…" : "Scan Attendance Sheet"}
                      <input type="file" accept="image/*" onChange={handleSheetUpload} className="hidden" />
                    </label>
                  </div>
                  {sheetFile && !sheetProcessing && (
                    <p className="text-[9px] font-mono text-emerald-600 mt-1">✦ Azure CV extracted data from {sheetFile.name}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCalculate} className="space-y-4">

                    {/* Header row */}
                    <div className="grid grid-cols-12 gap-2 text-[8px] font-mono tracking-widest text-muted-foreground uppercase px-1">
                      <div className="col-span-5">Subject</div>
                      <div className="col-span-3">Attended</div>
                      <div className="col-span-3">Total</div>
                      <div className="col-span-1" />
                    </div>

                    {subjects.map((s, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-12 gap-2 items-center">
                        <Input value={s.name} onChange={(e) => updateSubject(i, "name", e.target.value)}
                          placeholder="e.g. Mathematics" required
                          className="col-span-5 bg-background border-border text-sm h-9" />
                        <Input type="number" min="0" value={s.attended} onChange={(e) => updateSubject(i, "attended", e.target.value)}
                          placeholder="42" required
                          className="col-span-3 bg-background border-border text-sm h-9" />
                        <Input type="number" min="1" value={s.total} onChange={(e) => updateSubject(i, "total", e.target.value)}
                          placeholder="56" required
                          className="col-span-3 bg-background border-border text-sm h-9" />
                        <button type="button" onClick={() => removeSubject(i)} disabled={subjects.length === 1}
                          className="col-span-1 text-muted-foreground hover:text-destructive transition-colors text-lg leading-none disabled:opacity-30">
                          ×
                        </button>
                      </motion.div>
                    ))}

                    <div className="flex items-center gap-3">
                      <button type="button" onClick={addSubject}
                        className="text-[10px] font-mono text-primary hover:underline">
                        + Add Subject
                      </button>
                      <span className="text-[9px] font-mono text-muted-foreground">Threshold: 75%</span>
                    </div>

                    <Button type="submit" disabled={loading}
                      className="w-full h-11 font-display font-black uppercase tracking-wide bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
                      {loading ? "Calculating…" : "Calculate & Get AI Advice"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

              {/* AI Advice */}
              {aiAdvice && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                  <p className="text-[8px] font-mono tracking-widest text-primary/70 uppercase mb-2">✦ AI Academic Advisor</p>
                  <p className="text-sm text-foreground leading-relaxed">{aiAdvice}</p>
                </div>
              )}

              {/* Subject cards */}
              {results.map((r, idx) => (
                <motion.div key={r.subject} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}>
                  <Card className={`bg-white shadow-sm rounded-xl border-l-4 ${statusBorder(r.status)}`}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div>
                          <h3 className="text-sm font-display font-black text-foreground uppercase tracking-wide">{r.subject}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{r.message}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-3xl font-display font-black ${statusColor(r.status)}`}>{r.current}%</p>
                          <p className="text-[9px] font-mono text-muted-foreground">current</p>
                        </div>
                      </div>

                      {/* Attendance bar */}
                      <div>
                        <div className="flex justify-between text-[9px] font-mono text-muted-foreground mb-1">
                          <span>{r.current}% attended</span>
                          <span>75% minimum</span>
                        </div>
                        <div className="relative w-full bg-secondary rounded-full h-2.5">
                          <motion.div className={`h-2.5 rounded-full ${barColor(r.status)}`}
                            initial={{ width: 0 }} animate={{ width: `${Math.min(r.current, 100)}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.1 }} />
                          {/* 75% marker */}
                          <div className="absolute top-0 bottom-0 w-0.5 bg-foreground/30" style={{ left: "75%" }} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className={`p-3 rounded-xl ${r.status === "safe" || r.status === "warning" ? "bg-emerald-500/5 border border-emerald-500/20" : "bg-secondary/40"}`}>
                          <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-0.5">Can Miss</p>
                          <p className={`text-xl font-display font-black ${r.canMiss > 0 ? "text-emerald-600" : "text-muted-foreground"}`}>
                            {r.canMiss} class{r.canMiss !== 1 ? "es" : ""}
                          </p>
                        </div>
                        <div className={`p-3 rounded-xl ${r.mustAttend > 0 ? "bg-destructive/5 border border-destructive/20" : "bg-secondary/40"}`}>
                          <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-0.5">Must Attend</p>
                          <p className={`text-xl font-display font-black ${r.mustAttend > 0 ? "text-destructive" : "text-emerald-600"}`}>
                            {r.mustAttend > 0 ? `${r.mustAttend} more` : "On track"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              <Button onClick={() => { setResults(null); setAiAdvice(null); }} variant="outline"
                className="w-full h-11 font-display font-black uppercase tracking-wide rounded-xl">
                <RotateCcw className="w-4 h-4 mr-2" />
                Recalculate
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
}
