import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/PageLayout";
import { callGPT } from "@/lib/openai";
import { extractTextFromPDF } from "@/lib/pdfExtract";
import { BookOpen, Upload, Trash2, TrendingUp, MessageSquare, FileText, Lightbulb } from "lucide-react";

interface PolicyDoc {
  id: string;
  name: string;
  pages: number;
  active: boolean;
  uploadedAt: string;
  queryCount: number;
  text: string;
}

const INITIAL_DOCS: PolicyDoc[] = [
  { id: "d1", name: "Hostel Rules 2025.pdf",    pages: 47, active: true,  uploadedAt: "2026-06-01", queryCount: 203, text: "" },
  { id: "d2", name: "Exam Policy.pdf",           pages: 23, active: true,  uploadedAt: "2026-06-01", queryCount: 89,  text: "" },
  { id: "d3", name: "Fee Structure 2026.pdf",    pages: 8,  active: true,  uploadedAt: "2026-06-01", queryCount: 61,  text: "" },
  { id: "d4", name: "Disciplinary Guide.pdf",    pages: 15, active: false, uploadedAt: "2026-05-15", queryCount: 12,  text: "" },
];

const TOP_QUERIES = [
  { question: "Can I install an AC in my room?",        count: 34, doc: "Hostel Rules" },
  { question: "What is the minimum attendance?",         count: 28, doc: "Exam Policy" },
  { question: "What are late fee charges?",              count: 22, doc: "Fee Structure" },
  { question: "Can I bring guests overnight?",           count: 19, doc: "Hostel Rules" },
  { question: "What happens if I fail one subject?",     count: 15, doc: "Exam Policy" },
];

export default function AdminPolicy() {
  const [docs, setDocs] = useState<PolicyDoc[]>(INITIAL_DOCS);
  const [uploading, setUploading] = useState(false);
  const [faqLoading, setFaqLoading] = useState(false);
  const [faqDoc, setFaqDoc] = useState<string | null>(null);
  const [faqs, setFaqs] = useState<string[] | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    let text = "";
    let pages = 1;
    try {
      text = await extractTextFromPDF(file);
      pages = Math.ceil(text.length / 2000);
    } catch {
      text = `Content of ${file.name}`;
    }
    const newDoc: PolicyDoc = {
      id: `d${Date.now()}`,
      name: file.name,
      pages,
      active: true,
      uploadedAt: new Date().toISOString().split("T")[0],
      queryCount: 0,
      text,
    };
    setDocs((p) => [...p, newDoc]);
    setUploading(false);
    e.target.value = "";
  };

  const toggleActive = (id: string) =>
    setDocs((p) => p.map((d) => (d.id === id ? { ...d, active: !d.active } : d)));

  const removeDoc = (id: string) =>
    setDocs((p) => p.filter((d) => d.id !== id));

  const generateFAQs = async (doc: PolicyDoc) => {
    setFaqLoading(true);
    setFaqDoc(doc.name);
    const context = doc.text || `Document: ${doc.name} (${doc.pages} pages)`;
    const prompt = `Based on the most common student questions and this policy document, generate 5 FAQ suggestions that should be added to the document or student portal.\nDocument: ${context.slice(0, 1000)}\nReturn as a numbered list.`;
    try {
      const result = await callGPT("You are a campus policy advisor generating FAQ recommendations.", prompt, 400);
      const lines = result.split("\n").filter((l) => l.trim() && /^\d+\./.test(l.trim()));
      setFaqs(lines.length ? lines : result.split("\n").filter(Boolean).slice(0, 5));
    } catch {
      setFaqs([
        "1. What are the hostel checkout procedures?",
        "2. How do I apply for a room change?",
        "3. What are the penalties for rule violations?",
        "4. Can I use electrical appliances in my room?",
        "5. What is the guest policy for weekends?",
      ]);
    }
    setFaqLoading(false);
  };

  const totalQueries = docs.reduce((s, d) => s + d.queryCount, 0);
  const activeDocs = docs.filter((d) => d.active).length;

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto space-y-8">

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase mb-1">Admin · Policy</p>
            <h1 className="text-3xl font-display font-black uppercase tracking-wide text-foreground leading-none">Policy Documents</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage documents loaded into the Policy Navigator AI.</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-display font-black uppercase text-xs tracking-wide transition-colors">
            <Upload className="w-3.5 h-3.5" />
            {uploading ? "Uploading…" : "Upload PDF"}
            <input type="file" accept=".pdf" onChange={handleUpload} className="hidden" />
          </label>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Documents Loaded",  value: docs.length,    color: "text-primary" },
            { label: "Active",            value: activeDocs,     color: "text-emerald-600" },
            { label: "Total Queries",     value: totalQueries,   color: "text-indigo-600" },
            { label: "Top Topic",         value: "Hostel Rules", color: "text-amber-600" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className="bg-white border-border shadow-sm rounded-xl">
                <CardContent className="p-4">
                  <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-1">{s.label}</p>
                  <p className={`text-xl font-display font-black ${s.color}`}>{s.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Document list */}
          <div className="space-y-3">
            <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Loaded Documents</p>
            {docs.map((doc, idx) => (
              <motion.div key={doc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Card className={`bg-white shadow-sm rounded-xl ${!doc.active ? "opacity-50" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-primary" strokeWidth={1.75} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-display font-black text-foreground uppercase truncate">{doc.name}</p>
                        <div className="flex items-center gap-3 mt-1 text-[9px] font-mono text-muted-foreground">
                          <span>{doc.pages} pages</span>
                          <span>{doc.queryCount} queries</span>
                          <span>{doc.uploadedAt}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => toggleActive(doc.id)}
                          className={`w-8 h-5 rounded-full transition-colors relative ${doc.active ? "bg-primary" : "bg-secondary"}`}>
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${doc.active ? "left-3.5" : "left-0.5"}`} />
                        </button>
                        <button onClick={() => generateFAQs(doc)} title="Generate FAQs"
                          className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                          <Lightbulb className="w-3.5 h-3.5" strokeWidth={1.75} />
                        </button>
                        <button onClick={() => removeDoc(doc.id)}
                          className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="space-y-4">
            {/* Top queries */}
            <Card className="bg-white border-border shadow-sm rounded-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" strokeWidth={1.75} />
                  <CardTitle className="text-sm font-display font-black uppercase tracking-wide">Top Student Queries</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {TOP_QUERIES.map((q, i) => (
                  <div key={i} className="flex items-center gap-3 py-1.5 border-b border-border last:border-0">
                    <span className="text-[9px] font-mono text-muted-foreground w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground truncate">{q.question}</p>
                      <p className="text-[9px] font-mono text-muted-foreground">{q.doc}</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-primary shrink-0">{q.count}×</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* FAQ suggestions */}
            {(faqLoading || faqs) && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="bg-primary/5 border border-primary/20 rounded-xl">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-primary" strokeWidth={1.75} />
                      <CardTitle className="text-sm font-display font-black uppercase tracking-wide">
                        AI FAQ Suggestions {faqDoc ? `· ${faqDoc}` : ""}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {faqLoading ? (
                      <div className="flex items-center gap-2 py-4">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs text-muted-foreground font-mono">Generating suggestions…</p>
                      </div>
                    ) : (
                      <ul className="space-y-1.5">
                        {faqs?.map((f, i) => (
                          <li key={i} className="text-xs text-foreground leading-relaxed">{f}</li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <Card className="bg-white border-border shadow-sm rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" strokeWidth={1.75} />
                  <div>
                    <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-1">Unanswered Queries</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      8 student questions this week returned "not in document." Consider adding AC policy, ragging procedure, and sports facility rules to the document library.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
