import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageLayout } from "@/components/PageLayout";
import { callGPT } from "@/lib/openai";
import { Award, ExternalLink, CheckCircle2, XCircle, Clock } from "lucide-react";

// Real Indian government scholarships (NSP + AICTE + central)
const SCHOLARSHIPS = [
  {
    id: "nsp_pm_scholarship",
    name: "PM Scholarship Scheme (PMSS)",
    provider: "Ministry of Home Affairs",
    portal: "https://scholarships.gov.in",
    amount: "₹2,500–₹3,000/month",
    deadline: "October 31 every year",
    category: "central",
    criteria: {
      caste: ["General", "OBC", "SC", "ST", "EWS"],
      income_max: 600000,
      course: ["B.Tech", "B.E.", "MBBS", "BDS", "MBA", "MCA", "B.Pharma", "B.Sc", "BA", "B.Com"],
      marks_min: 60,
      description: "For wards/widows of ex-servicemen and ex-coast guard personnel. 5500 fresh scholarships annually.",
    },
  },
  {
    id: "nsp_central_sector",
    name: "Central Sector Scheme of Scholarships",
    provider: "Ministry of Education (NSP)",
    portal: "https://scholarships.gov.in",
    amount: "₹10,000–₹20,000/year",
    deadline: "October 31 every year",
    category: "central",
    criteria: {
      caste: ["General", "OBC", "SC", "ST", "EWS"],
      income_max: 450000,
      course: ["B.Tech", "B.E.", "MBBS", "BDS", "B.Sc", "BA", "B.Com", "B.Pharma", "MBA", "MCA"],
      marks_min: 80,
      description: "82,000 scholarships for students scoring above 80th percentile in Class 12. ₹10,000/year for first 3 years, ₹20,000 for P.G.",
    },
  },
  {
    id: "nsp_sc_postmatric",
    name: "Post-Matric Scholarship for SC Students",
    provider: "Ministry of Social Justice & Empowerment",
    portal: "https://scholarships.gov.in",
    amount: "₹1,200–₹5,300/month + maintenance",
    deadline: "October 31 every year",
    category: "central",
    criteria: {
      caste: ["SC"],
      income_max: 250000,
      course: ["B.Tech", "B.E.", "MBBS", "BDS", "B.Sc", "BA", "B.Com", "Diploma", "ITI", "MBA", "MCA"],
      marks_min: 0,
      description: "Comprehensive support for SC students. Covers tuition, maintenance, and study materials.",
    },
  },
  {
    id: "nsp_st_postmatric",
    name: "Post-Matric Scholarship for ST Students",
    provider: "Ministry of Tribal Affairs",
    portal: "https://scholarships.gov.in",
    amount: "₹1,200–₹5,300/month",
    deadline: "October 31 every year",
    category: "central",
    criteria: {
      caste: ["ST"],
      income_max: 250000,
      course: ["B.Tech", "B.E.", "MBBS", "BDS", "B.Sc", "BA", "B.Com", "Diploma", "MBA", "MCA"],
      marks_min: 0,
      description: "Tribal Affairs Ministry scholarship for ST students in post-secondary education.",
    },
  },
  {
    id: "nsp_obc_postmatric",
    name: "Post-Matric Scholarship for OBC Students",
    provider: "Ministry of Social Justice & Empowerment",
    portal: "https://scholarships.gov.in",
    amount: "₹1,000–₹3,000/month",
    deadline: "October 31 every year",
    category: "central",
    criteria: {
      caste: ["OBC"],
      income_max: 100000,
      course: ["B.Tech", "B.E.", "MBBS", "B.Sc", "BA", "B.Com", "Diploma", "MBA", "MCA"],
      marks_min: 0,
      description: "Central government scholarship for OBC students pursuing post-secondary education.",
    },
  },
  {
    id: "aicte_pragati",
    name: "AICTE Pragati Scholarship (Girls)",
    provider: "AICTE",
    portal: "https://www.aicte-india.org/bureaus/esb/pragati",
    amount: "₹50,000/year + contingency ₹2,000",
    deadline: "November 30 every year",
    category: "aicte",
    criteria: {
      caste: ["General", "OBC", "SC", "ST", "EWS"],
      income_max: 800000,
      course: ["B.Tech", "B.E.", "B.Pharma", "Diploma (Technical)"],
      marks_min: 0,
      gender: "Female",
      description: "4,000 scholarships for girl students in AICTE-approved technical institutions. Only 2 daughters per family.",
    },
  },
  {
    id: "aicte_saksham",
    name: "AICTE Saksham Scholarship (Differently Abled)",
    provider: "AICTE",
    portal: "https://www.aicte-india.org/bureaus/esb/saksham",
    amount: "₹50,000/year + contingency ₹2,000",
    deadline: "November 30 every year",
    category: "aicte",
    criteria: {
      caste: ["General", "OBC", "SC", "ST", "EWS"],
      income_max: 800000,
      course: ["B.Tech", "B.E.", "B.Pharma", "Diploma (Technical)"],
      marks_min: 0,
      disability: true,
      description: "For differently-abled students (≥40% disability) in AICTE-approved technical courses.",
    },
  },
  {
    id: "nsp_minority",
    name: "Post-Matric Scholarship for Minorities",
    provider: "Ministry of Minority Affairs",
    portal: "https://scholarships.gov.in",
    amount: "Full tuition + ₹1,000 maintenance/month",
    deadline: "October 31 every year",
    category: "central",
    criteria: {
      caste: ["Minority"],
      income_max: 200000,
      course: ["B.Tech", "B.E.", "MBBS", "BDS", "B.Sc", "BA", "B.Com", "MBA", "MCA", "Diploma"],
      marks_min: 50,
      description: "For Muslim, Christian, Sikh, Buddhist, Zoroastrian and Jain students. Covers 30 lakh scholarships annually.",
    },
  },
  {
    id: "nsp_ews",
    name: "EWS Scholarship (State Scheme)",
    provider: "State Social Welfare Departments",
    portal: "https://scholarships.gov.in",
    amount: "₹5,000–₹25,000/year (varies by state)",
    deadline: "Varies by state",
    category: "state",
    criteria: {
      caste: ["EWS", "General"],
      income_max: 800000,
      course: ["B.Tech", "B.E.", "MBBS", "B.Sc", "BA", "B.Com", "MBA", "MCA"],
      marks_min: 0,
      description: "For Economically Weaker Section students with EWS certificate. Apply through state NSP portal.",
    },
  },
  {
    id: "inspire",
    name: "INSPIRE Scholarship (Science)",
    provider: "Dept. of Science & Technology (DST)",
    portal: "https://online-inspire.gov.in",
    amount: "₹80,000/year",
    deadline: "Ongoing — apply within 1 year of Class 12",
    category: "central",
    criteria: {
      caste: ["General", "OBC", "SC", "ST", "EWS"],
      income_max: 9999999,
      course: ["B.Sc", "B.Tech (Science stream)", "Integrated M.Sc"],
      marks_min: 75,
      description: "For students in top 1% of Class 12 boards pursuing Natural/Basic Sciences. ₹80,000/year for 5 years.",
    },
  },
];

interface StudentProfile {
  course: string;
  caste: string;
  income: string;
  marks12: string;
  gender: string;
  state: string;
  disability: boolean;
}

interface MatchedScholarship {
  id: string;
  name: string;
  provider: string;
  portal: string;
  amount: string;
  deadline: string;
  eligibility: "eligible" | "likely" | "check";
  reason: string;
  aiTips: string;
}

export default function ScholarshipFinder() {
  const [profile, setProfile] = useState<StudentProfile>({
    course: "", caste: "", income: "", marks12: "", gender: "", state: "", disability: false,
  });
  const [matches, setMatches] = useState<MatchedScholarship[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleFind = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMatches(null);

    const income = Number(profile.income);
    const marks = Number(profile.marks12);

    // Local filter: hard eligibility rules
    const candidates = SCHOLARSHIPS.filter((s) => {
      const c = s.criteria;
      if (income > 0 && c.income_max < income) return false;
      if (marks > 0 && c.marks_min > marks) return false;
      if ((c as any).gender === "Female" && profile.gender !== "Female") return false;
      if ((c as any).disability && !profile.disability) return false;
      if (profile.course && !c.course.some(co => profile.course.includes(co.split(" ")[0]))) {
        // loose match
        if (!c.course.some(co => co.toLowerCase().includes(profile.course.toLowerCase().split(" ")[0]))) return false;
      }
      if (profile.caste && !c.caste.includes(profile.caste)) return false;
      return true;
    });

    // GPT enriches with tips and eligibility confidence
    const profileStr = `Course: ${profile.course || "Not specified"}, Caste: ${profile.caste || "Not specified"}, Annual Family Income: ₹${income.toLocaleString("en-IN") || "Not specified"}, Class 12 %: ${marks || "Not specified"}, Gender: ${profile.gender || "Not specified"}, State: ${profile.state || "Not specified"}, Differently Abled: ${profile.disability ? "Yes" : "No"}`;

    const scholarshipList = candidates.map(s => `${s.id}: ${s.name} (${s.criteria.description})`).join("\n");

    let aiData: Record<string, { eligibility: string; reason: string; tips: string }> = {};

    try {
      const raw = await callGPT(
        `You are an Indian scholarship eligibility expert. Analyze student profile and matched scholarships.`,
        `Student profile: ${profileStr}\n\nMatched scholarships:\n${scholarshipList}\n\nFor each scholarship ID, return eligibility confidence and application tips.\nReturn ONLY JSON: {"scholarship_id": {"eligibility": "eligible|likely|check", "reason": "1 sentence", "tips": "1-2 sentence application tip"}}`,
        800
      );
      aiData = JSON.parse(raw.trim().replace(/```json/g, "").replace(/```/g, ""));
    } catch {
      // use static fallback
    }

    const result: MatchedScholarship[] = candidates.map((s) => ({
      id: s.id,
      name: s.name,
      provider: s.provider,
      portal: s.portal,
      amount: s.amount,
      deadline: s.deadline,
      eligibility: (aiData[s.id]?.eligibility as MatchedScholarship["eligibility"]) ?? "check",
      reason: aiData[s.id]?.reason ?? s.criteria.description,
      aiTips: aiData[s.id]?.tips ?? "Apply before the deadline via the National Scholarship Portal (scholarships.gov.in). Keep income certificate, caste certificate, and Class 12 marksheet ready.",
    }));

    setMatches(result);
    setLoading(false);
  };

  const eligibilityIcon = (e: MatchedScholarship["eligibility"]) =>
    e === "eligible" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={1.75} /> :
    e === "likely"   ? <Clock className="w-4 h-4 text-amber-600" strokeWidth={1.75} /> :
                       <XCircle className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />;
  const eligibilityLabel = (e: MatchedScholarship["eligibility"]) =>
    e === "eligible" ? "Eligible" : e === "likely" ? "Likely Eligible" : "Verify Eligibility";
  const eligibilityColor = (e: MatchedScholarship["eligibility"]) =>
    e === "eligible" ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/25" :
    e === "likely"   ? "text-amber-600 bg-amber-500/10 border-amber-500/25" :
                       "text-muted-foreground bg-secondary border-border";

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-8">

        <div>
          <p className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase mb-1">Module · Finance</p>
          <h1 className="text-3xl font-display font-black uppercase tracking-wide text-foreground leading-none">Scholarship Finder</h1>
          <p className="text-sm text-muted-foreground mt-1">Real Indian government scholarships — NSP, AICTE, DST. AI-matched to your profile.</p>
        </div>

        <AnimatePresence mode="wait">
          {!matches ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card className="bg-white border-border shadow-sm rounded-xl">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Award className="w-4 h-4 text-primary" strokeWidth={1.75} />
                    </div>
                    <CardTitle className="text-base font-display font-black uppercase tracking-wide">Your Profile</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFind} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">

                      <div className="space-y-2">
                        <label className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase">Course / Degree *</label>
                        <Select onValueChange={(v) => setProfile(p => ({ ...p, course: v }))}>
                          <SelectTrigger className="bg-background border-border text-sm h-9">
                            <SelectValue placeholder="Select your course" />
                          </SelectTrigger>
                          <SelectContent>
                            {["B.Tech / B.E.", "MBBS / BDS", "B.Sc", "B.Com", "BA", "B.Pharma", "MBA", "MCA", "Diploma (Technical)", "Integrated M.Sc"].map(c => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase">Caste Category *</label>
                        <Select onValueChange={(v) => setProfile(p => ({ ...p, caste: v }))}>
                          <SelectTrigger className="bg-background border-border text-sm h-9">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {["General", "OBC", "SC", "ST", "EWS", "Minority"].map(c => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase">Annual Family Income (₹)</label>
                        <Input type="number" min="0" value={profile.income}
                          onChange={(e) => setProfile(p => ({ ...p, income: e.target.value }))}
                          placeholder="e.g. 250000"
                          className="bg-background border-border text-sm h-9" />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase">Class 12 Percentage</label>
                        <Input type="number" min="0" max="100" value={profile.marks12}
                          onChange={(e) => setProfile(p => ({ ...p, marks12: e.target.value }))}
                          placeholder="e.g. 82"
                          className="bg-background border-border text-sm h-9" />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase">Gender</label>
                        <Select onValueChange={(v) => setProfile(p => ({ ...p, gender: v }))}>
                          <SelectTrigger className="bg-background border-border text-sm h-9">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            {["Male", "Female", "Other"].map(g => (
                              <SelectItem key={g} value={g}>{g}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase">State</label>
                        <Input value={profile.state}
                          onChange={(e) => setProfile(p => ({ ...p, state: e.target.value }))}
                          placeholder="e.g. Maharashtra"
                          className="bg-background border-border text-sm h-9" />
                      </div>
                    </div>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input type="checkbox" checked={profile.disability}
                        onChange={(e) => setProfile(p => ({ ...p, disability: e.target.checked }))}
                        className="w-4 h-4 rounded border-border" />
                      <span className="text-sm text-foreground">I have a disability (≥40% — for AICTE Saksham)</span>
                    </label>

                    <Button type="submit" disabled={loading || !profile.course || !profile.caste}
                      className="w-full h-11 font-display font-black uppercase tracking-wide bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
                      {loading ? "Finding Scholarships…" : "Find My Scholarships"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground font-display font-black uppercase">
                  {matches.length} Scholarship{matches.length !== 1 ? "s" : ""} Found
                </p>
                <button onClick={() => setMatches(null)}
                  className="text-[10px] font-mono text-primary hover:underline">
                  ← Edit Profile
                </button>
              </div>

              {matches.length === 0 && (
                <div className="p-8 text-center bg-white border border-border rounded-xl">
                  <XCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" strokeWidth={1} />
                  <p className="text-sm font-display font-black text-foreground uppercase">No Direct Matches</p>
                  <p className="text-xs text-muted-foreground mt-1">Try relaxing income/marks criteria, or check state-specific scholarships via <a href="https://scholarships.gov.in" target="_blank" rel="noopener" className="text-primary underline">scholarships.gov.in</a>.</p>
                </div>
              )}

              {matches.map((m, idx) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}>
                  <Card className="bg-white border-border shadow-sm rounded-xl overflow-hidden">
                    <CardContent className="p-0">
                      <button className="w-full text-left p-4 space-y-3"
                        onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-display font-black text-foreground uppercase leading-tight">{m.name}</p>
                            <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{m.provider}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[9px] font-mono font-bold ${eligibilityColor(m.eligibility)}`}>
                              {eligibilityIcon(m.eligibility)}
                              {eligibilityLabel(m.eligibility)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-primary">{m.amount}</span>
                          <span className="text-muted-foreground font-mono text-[10px]">Deadline: {m.deadline}</span>
                        </div>
                      </button>

                      <AnimatePresence>
                        {expandedId === m.id && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                            <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                              <p className="text-xs text-muted-foreground leading-relaxed">{m.reason}</p>
                              <div className="p-3 bg-primary/5 border border-primary/15 rounded-xl">
                                <p className="text-[8px] font-mono tracking-widest text-primary/70 uppercase mb-1">✦ AI Application Tip</p>
                                <p className="text-xs text-foreground">{m.aiTips}</p>
                              </div>
                              <a href={m.portal} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs font-mono text-primary hover:underline"
                                onClick={(e) => e.stopPropagation()}>
                                Apply at {m.portal.replace("https://", "")}
                                <ExternalLink className="w-3 h-3" strokeWidth={1.75} />
                              </a>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              <div className="p-4 bg-secondary/40 rounded-xl">
                <p className="text-[9px] font-mono text-muted-foreground leading-relaxed">
                  All scholarships listed are actual Indian government schemes. Apply via <a href="https://scholarships.gov.in" target="_blank" rel="noopener" className="text-primary underline">scholarships.gov.in</a> (NSP), <a href="https://www.aicte-india.org" target="_blank" rel="noopener" className="text-primary underline">aicte-india.org</a> (AICTE), or <a href="https://online-inspire.gov.in" target="_blank" rel="noopener" className="text-primary underline">online-inspire.gov.in</a> (INSPIRE). Eligibility is indicative — verify on the official portal.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
}
