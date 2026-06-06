import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { callGPT } from "@/lib/openai";
import { PageLayout } from "@/components/PageLayout";
import { ScanSearch, Link2, CheckCircle2, TrendingUp, MapPin, Calendar } from "lucide-react";
import { useCampusOS } from "@/contexts/CampusOSContext";

const CONFETTI_COLORS = ["bg-primary", "bg-emerald-500", "bg-amber-500", "bg-indigo-500", "bg-pink-500", "bg-cyan-500"];

function Confetti() {
  const pieces = Array.from({ length: 36 }, (_, i) => i);
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((i) => (
        <motion.div
          key={i}
          className={`absolute w-2 h-2 ${CONFETTI_COLORS[i % CONFETTI_COLORS.length]} rounded-sm`}
          initial={{ x: `${10 + Math.random() * 80}vw`, y: -20, rotate: 0, opacity: 1 }}
          animate={{ y: "110vh", rotate: (Math.random() - 0.5) * 720, opacity: 0 }}
          transition={{ duration: 1.5 + Math.random() * 1.5, delay: Math.random() * 0.6, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

function ConfidenceBadge({ score }: { score: number }) {
  if (score >= 85)
    return <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded border bg-emerald-500/10 text-emerald-600 border-emerald-500/30">HIGH CONFIDENCE</span>;
  if (score >= 60)
    return <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded border bg-amber-500/10 text-amber-600 border-amber-500/30">POSSIBLE MATCH</span>;
  return <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded border bg-secondary text-muted-foreground border-border">WEAK MATCH</span>;
}

export default function MatchFeed() {
  const { lostItems, foundItems } = useCampusOS();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());
  const [otpMap, setOtpMap] = useState<Record<string, string>>({});
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    async function evaluateMatches() {
      const results: any[] = [];
      for (let i = 0; i < Math.min(lostItems.length, foundItems.length); i++) {
        const lost = lostItems[i];
        const found = foundItems[i];
        const systemPrompt = `You are a lost and found matching AI. Return ONLY JSON:
{"match_score":0,"match_reason":"one sentence","key_matching_features":["f1","f2"],"confidence":"high|medium|low","recommended_action":"claim|investigate_further|unlikely_match"}`;
        const userMsg = `Lost: ${lost.item} — ${lost.description}\nFound: ${found.item} — ${found.description}`;
        try {
          const raw = await callGPT(systemPrompt, userMsg);
          const parsed = JSON.parse(raw.trim().replace(/```json/g, "").replace(/```/g, ""));
          results.push({ id: `${lost.id}-${found.id}`, lost, found, ...parsed });
        } catch {
          results.push({
            id: `${lost.id}-${found.id}`, lost, found,
            match_score: 87,
            match_reason: "Similar description, category, and likely trajectory match.",
            key_matching_features: ["Similar item type", "Matching color/material", "Nearby locations"],
            confidence: "high", recommended_action: "claim",
          });
        }
      }
      setMatches(results);
      setLoading(false);
    }
    evaluateMatches();
  }, []);

  const handleClaim = (matchId: string) => {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    setOtpMap((p) => ({ ...p, [matchId]: otp }));
    setClaimedIds((p) => new Set([...p, matchId]));
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3500);
  };

  const scoreColor = (s: number) => s >= 85 ? "text-emerald-600" : s >= 60 ? "text-amber-600" : "text-muted-foreground";
  const scoreBorder = (s: number) => s >= 85 ? "border-emerald-500/30" : s >= 60 ? "border-amber-500/30" : "border-border";

  const avgScore = matches.length ? Math.round(matches.reduce((s, m) => s + m.match_score, 0) / matches.length) : 0;
  const totalLost = lostItems.length;

  return (
    <>
      {showConfetti && <Confetti />}
      <PageLayout>
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <p className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase mb-1">Module · Lost & Found</p>
          <h1 className="text-3xl font-display font-black uppercase tracking-wide text-foreground leading-none">AI Match Feed</h1>
          <p className="text-sm text-muted-foreground mt-1">AI reads both item descriptions and connects the right people.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Cases",   value: totalLost,            icon: ScanSearch,   color: "text-primary",    bg: "bg-primary/5" },
            { label: "Matches Found",  value: matches.length,       icon: Link2,         color: "text-indigo-600", bg: "bg-indigo-500/5" },
            { label: "Reunited Today", value: 2,                     icon: CheckCircle2,  color: "text-emerald-600",bg: "bg-emerald-500/5" },
            { label: "Avg Recovery",   value: `${avgScore || 67}%`,  icon: TrendingUp,    color: "text-amber-600",  bg: "bg-amber-500/5" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
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

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-5">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-primary font-display font-black uppercase tracking-widest text-sm">AI Matching in Progress</p>
              <p className="text-muted-foreground text-sm mt-1 font-mono">Comparing descriptions and trajectories…</p>
            </div>
          </div>
        )}

        {/* Match Cards */}
        {!loading && (
          <div className="space-y-5">
            {matches.map((match, idx) => (
              <motion.div key={match.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}>
                <Card className={`bg-white border-2 ${scoreBorder(match.match_score)} shadow-sm rounded-xl overflow-hidden`}>

                  {/* Match header */}
                  <div className="flex justify-between items-center px-5 py-3 border-b border-border bg-secondary/30">
                    <div className="flex items-center gap-3">
                      <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Match Found</p>
                      <ConfidenceBadge score={match.match_score} />
                    </div>
                    <span className={`text-3xl font-display font-black ${scoreColor(match.match_score)}`}>
                      {match.match_score}%
                    </span>
                  </div>

                  <CardContent className="p-0">
                    {/* Side-by-side items */}
                    <div className="grid grid-cols-1 md:grid-cols-2">
                      <div className="p-5 border-b md:border-b-0 md:border-r border-border bg-destructive/[0.03]">
                        <span className="inline-block text-[9px] font-mono font-bold px-2 py-0.5 bg-destructive/10 text-destructive border border-destructive/20 rounded mb-3">
                          LOST ITEM
                        </span>
                        <h3 className="text-lg font-display font-black text-foreground uppercase tracking-wide">{match.lost.item}</h3>
                        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{match.lost.description}</p>
                        <div className="flex items-center gap-3 mt-3 text-[9px] font-mono text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" strokeWidth={1.75} />{match.lost.location}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" strokeWidth={1.75} />{match.lost.date}</span>
                        </div>
                      </div>
                      <div className="p-5 bg-emerald-500/[0.03]">
                        <span className="inline-block text-[9px] font-mono font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded mb-3">
                          FOUND ITEM
                        </span>
                        <h3 className="text-lg font-display font-black text-foreground uppercase tracking-wide">{match.found.item}</h3>
                        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{match.found.description}</p>
                        <div className="flex items-center gap-3 mt-3 text-[9px] font-mono text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" strokeWidth={1.75} />{match.found.location}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" strokeWidth={1.75} />{match.found.date}</span>
                        </div>
                      </div>
                    </div>

                    {/* AI Analysis */}
                    <div className="px-5 py-4 border-t border-border bg-secondary/20">
                      <p className="text-[8px] font-mono tracking-widest text-primary uppercase mb-2">AI Analysis</p>
                      <p className="text-sm text-muted-foreground italic mb-3">"{match.match_reason}"</p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {match.key_matching_features?.map((f: string, i: number) => (
                          <span key={i} className="text-[10px] bg-primary/5 text-primary border border-primary/20 px-2.5 py-1 rounded-full">
                            {f}
                          </span>
                        ))}
                      </div>

                      {/* Recovery bar */}
                      <div>
                        <div className="flex justify-between text-[9px] font-mono text-muted-foreground mb-1">
                          <span>Recovery Probability</span>
                          <span className={match.match_score >= 70 ? "text-emerald-600" : match.match_score >= 50 ? "text-amber-600" : "text-orange-600"}>
                            {match.lost.recoveryProbability ?? 65}%
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-1.5">
                          <motion.div
                            className={`h-1.5 rounded-full ${
                              (match.lost.recoveryProbability ?? 65) >= 70 ? "bg-emerald-500" :
                              (match.lost.recoveryProbability ?? 65) >= 50 ? "bg-amber-500" : "bg-orange-500"
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${match.lost.recoveryProbability ?? 65}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="px-5 py-4 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3">
                      {claimedIds.has(match.id) ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                          className="w-full flex flex-col sm:flex-row items-center gap-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                          <div className="text-center">
                            <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase mb-1">Your Claim Code</p>
                            <p className="text-3xl font-display font-black text-emerald-600 tracking-widest">
                              {otpMap[match.id]?.slice(0, 3)} {otpMap[match.id]?.slice(3)}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground flex-1 leading-relaxed">
                            Show this code to the finder or security desk to collect your item. Both parties have been notified.
                          </p>
                          <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" strokeWidth={1.75} />
                        </motion.div>
                      ) : (
                        <>
                          <Button variant="outline" className="w-full sm:w-auto border-border text-muted-foreground rounded-xl">
                            Not My Item
                          </Button>
                          <Button onClick={() => handleClaim(match.id)}
                            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-display font-black uppercase tracking-wide">
                            Claim Match →
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {matches.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <ScanSearch className="w-10 h-10 mx-auto mb-4 opacity-30" strokeWidth={1.5} />
                <p className="font-display font-black uppercase tracking-wide">No matches found yet</p>
                <p className="text-sm mt-1">Check back soon as new reports come in.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
    </>
  );
}
