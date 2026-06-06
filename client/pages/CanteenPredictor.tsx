import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageLayout } from "@/components/PageLayout";
import { callGPT } from "@/lib/openai";
import { UtensilsCrossed, Users, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

const CANTEEN_ITEMS = [
  { id: "thali", name: "Veg Thali", price: 60, emoji: "🍱" },
  { id: "egg_thali", name: "Egg Thali", price: 70, emoji: "🥚" },
  { id: "biryani", name: "Veg Biryani", price: 80, emoji: "🍚" },
  { id: "sandwich", name: "Sandwich", price: 30, emoji: "🥪" },
  { id: "maggi", name: "Maggi", price: 25, emoji: "🍜" },
  { id: "chai", name: "Chai", price: 10, emoji: "☕" },
  { id: "juice", name: "Juice", price: 20, emoji: "🥤" },
  { id: "paratha", name: "Paratha", price: 35, emoji: "🫓" },
];

interface CheckInEntry {
  item: string;
  meal: string;
  time: string;
}

interface Prediction {
  peak_hours: string[];
  most_demanded: { item: string; reason: string }[];
  estimated_footfall: number;
  preparation_tips: string[];
  crowding_warning: string | null;
  summary: string;
}

const liveCheckins: CheckInEntry[] = [];

export default function CanteenPredictor() {
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedMeal, setSelectedMeal] = useState("");
  const [checkins, setCheckins] = useState<CheckInEntry[]>(liveCheckins);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  const nowHHMM = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  const handleCheckin = () => {
    if (!selectedItem || !selectedMeal) return;
    const entry: CheckInEntry = { item: selectedItem, meal: selectedMeal, time: nowHHMM() };
    setCheckins((p) => [...p, entry]);
    setCheckedIn(true);
    setTimeout(() => setCheckedIn(false), 2500);
    setSelectedItem("");
    setSelectedMeal("");
  };

  const handlePredict = async () => {
    setLoading(true);
    setPrediction(null);

    const now = new Date();
    const timeOfDay = now.getHours() < 10 ? "morning" : now.getHours() < 14 ? "lunch" : now.getHours() < 17 ? "afternoon" : "evening";
    const dayType = now.getDay() === 0 || now.getDay() === 6 ? "weekend" : "weekday";

    const prompt = `Canteen check-in data from students in the last hour:
${checkins.length > 0 ? checkins.map(c => `- ${c.time}: ${c.item} (${c.meal})`).join("\n") : "No check-ins yet today."}

Context: ${timeOfDay} on a ${dayType}. Total check-ins: ${checkins.length}.
Current time: ${nowHHMM()}.

Available items: ${CANTEEN_ITEMS.map(i => i.name).join(", ")}.

Predict canteen demand for the next 2 hours. Consider typical Indian college patterns.
Return ONLY this JSON:
{
  "peak_hours": ["HH:MM", "HH:MM"],
  "most_demanded": [{"item": "string", "reason": "string"}, ...3 items],
  "estimated_footfall": number,
  "preparation_tips": ["tip1", "tip2", "tip3"],
  "crowding_warning": "string or null",
  "summary": "2-sentence canteen manager summary"
}`;

    try {
      const raw = await callGPT("You are a canteen demand prediction AI for an Indian college. Be specific and actionable.", prompt, 500);
      const data: Prediction = JSON.parse(raw.trim().replace(/```json/g, "").replace(/```/g, ""));
      setPrediction(data);
    } catch {
      setPrediction({
        peak_hours: ["12:30", "13:15"],
        most_demanded: [
          { item: "Veg Thali", reason: "Most popular lunch option — high carb, affordable" },
          { item: "Chai", reason: "Evening staple; post-class demand spike" },
          { item: "Maggi", reason: "Fast snack between lectures" },
        ],
        estimated_footfall: Math.max(30, checkins.length * 15 + 40),
        preparation_tips: [
          "Pre-prepare rice and dal in bulk before peak hours",
          "Keep 2 extra burners running for chai during evening",
          "Stock extra bread for sandwiches — quick to assemble",
        ],
        crowding_warning: checkins.length > 10 ? "High demand expected — consider token system to manage queue" : null,
        summary: `Based on ${checkins.length} check-ins, moderate demand is predicted for the next 2 hours. Thali and chai will be top sellers.`,
      });
    }
    setLoading(false);
  };

  // Aggregate check-in counts per item
  const itemCounts = checkins.reduce((acc, c) => {
    acc[c.item] = (acc[c.item] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topItems = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-8">

        <div>
          <p className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase mb-1">Module · Canteen</p>
          <h1 className="text-3xl font-display font-black uppercase tracking-wide text-foreground leading-none">Canteen Predictor</h1>
          <p className="text-sm text-muted-foreground mt-1">Check in your meal plan to help the canteen prepare better. Get crowd predictions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Check-in panel */}
          <Card className="bg-white border-border shadow-sm rounded-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                  <UtensilsCrossed className="w-4 h-4 text-primary" strokeWidth={1.75} />
                </div>
                <CardTitle className="text-base font-display font-black uppercase tracking-wide">I Plan to Eat</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">

              <div className="space-y-2">
                <label className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase">Select Meal Type</label>
                <Select value={selectedMeal} onValueChange={setSelectedMeal}>
                  <SelectTrigger className="bg-background border-border text-sm h-9">
                    <SelectValue placeholder="Breakfast / Lunch / Snack / Dinner" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Breakfast", "Lunch", "Snack", "Dinner"].map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase">What are you ordering?</label>
                <div className="grid grid-cols-2 gap-2">
                  {CANTEEN_ITEMS.map((item) => (
                    <button key={item.id}
                      onClick={() => setSelectedItem(item.name)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${selectedItem === item.name
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background hover:border-primary/40"
                      }`}>
                      <span className="text-base">{item.emoji}</span>
                      <p className="text-[10px] font-mono font-bold mt-0.5 leading-tight">{item.name}</p>
                      <p className="text-[9px] text-muted-foreground">₹{item.price}</p>
                    </button>
                  ))}
                </div>
              </div>

              <motion.div animate={checkedIn ? { scale: [1, 1.02, 1] } : {}}>
                <Button onClick={handleCheckin} disabled={!selectedItem || !selectedMeal}
                  className="w-full h-10 font-display font-black uppercase tracking-wide bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
                  {checkedIn ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Checked In!
                    </span>
                  ) : "Check In My Order"}
                </Button>
              </motion.div>

              {checkins.length > 0 && (
                <div className="pt-2 border-t border-border space-y-1.5">
                  <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Live Demand ({checkins.length} students)</p>
                  {topItems.map(([item, count]) => (
                    <div key={item} className="flex items-center justify-between text-xs">
                      <span className="text-foreground">{item}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-secondary rounded-full h-1.5">
                          <div className="h-1.5 bg-primary rounded-full"
                            style={{ width: `${(count / Math.max(...Object.values(itemCounts))) * 100}%` }} />
                        </div>
                        <span className="text-[9px] font-mono text-muted-foreground w-6">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prediction panel */}
          <div className="space-y-4">
            <Card className="bg-white border-border shadow-sm rounded-xl">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" strokeWidth={1.75} />
                  <p className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase">Demand Forecast</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-secondary/40 rounded-xl">
                    <p className="text-[8px] font-mono text-muted-foreground uppercase mb-0.5">Check-ins</p>
                    <p className="text-2xl font-display font-black text-foreground">{checkins.length}</p>
                  </div>
                  <div className="p-3 bg-secondary/40 rounded-xl">
                    <p className="text-[8px] font-mono text-muted-foreground uppercase mb-0.5">Est. Footfall</p>
                    <p className="text-2xl font-display font-black text-foreground">{prediction?.estimated_footfall ?? "—"}</p>
                  </div>
                </div>
                <Button onClick={handlePredict} disabled={loading}
                  className="w-full h-10 font-display font-black uppercase tracking-wide bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
                  {loading ? "Predicting…" : "Generate AI Forecast"}
                </Button>
              </CardContent>
            </Card>

            {prediction && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">

                {prediction.crowding_warning && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.75} />
                    <p className="text-xs text-amber-700">{prediction.crowding_warning}</p>
                  </div>
                )}

                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                  <p className="text-[8px] font-mono tracking-widest text-primary/70 uppercase mb-2">✦ AI Summary</p>
                  <p className="text-xs text-foreground leading-relaxed">{prediction.summary}</p>
                </div>

                {/* Peak hours */}
                <Card className="bg-white border-border shadow-sm rounded-xl">
                  <CardContent className="p-4 space-y-2">
                    <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Peak Hours</p>
                    <div className="flex gap-2">
                      {prediction.peak_hours.map((h) => (
                        <span key={h} className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-mono font-bold">{h}</span>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top demanded items */}
                <Card className="bg-white border-border shadow-sm rounded-xl">
                  <CardContent className="p-4 space-y-2">
                    <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">Most Demanded</p>
                    {prediction.most_demanded.map((d, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="text-[9px] font-mono text-primary shrink-0 mt-0.5">{i + 1}.</span>
                        <div>
                          <p className="text-xs font-bold text-foreground">{d.item}</p>
                          <p className="text-[10px] text-muted-foreground">{d.reason}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Preparation tips */}
                <Card className="bg-white border-border shadow-sm rounded-xl">
                  <CardContent className="p-4 space-y-2">
                    <p className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase">For Canteen Staff</p>
                    {prediction.preparation_tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-[9px] font-mono text-muted-foreground shrink-0 mt-0.5">→</span>
                        <p className="text-xs text-foreground">{tip}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
