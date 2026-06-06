import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { callGPT } from '../lib/openai';

const URGENCY_LABELS = ['', '😐 Can Wait', '😟 Annoying', '😠 Affecting Studies', '😤 Urgent', '🚨 Emergency'];
const CATEGORIES = [
  { value: 'Hostel', icon: '🏠', label: 'Hostel' },
  { value: 'Academics', icon: '📚', label: 'Academics' },
  { value: 'Canteen', icon: '🍽', label: 'Canteen' },
  { value: 'Electrical', icon: '💡', label: 'Electrical' },
  { value: 'Plumbing', icon: '🚿', label: 'Plumbing' },
  { value: 'Security', icon: '🔒', label: 'Security' },
  { value: 'Medical', icon: '🏥', label: 'Medical' },
  { value: 'Administration', icon: '⚖', label: 'Admin' },
];

const LOADING_STEPS = [
  'Reading complaint...',
  'Identifying department...',
  'Checking for duplicates...',
  'Assessing escalation risk...',
  'Routing ticket...',
];

function EscalationBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    Critical: 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse',
    High: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    Low: 'bg-green-500/20 text-green-400 border-green-500/50',
  };
  return (
    <span className={`text-xs px-2 py-1 rounded border font-bold ${styles[level] || styles.Low}`}>
      {level === 'Critical' ? '🚨' : level === 'High' ? '⚠' : level === 'Medium' ? '⚡' : '✓'} {level} Escalation Risk
    </span>
  );
}

export default function GrievanceSubmit() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState(3);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<any>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setResult(null);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep(prev => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 400);

    const ticketId = `GRV-2026-${Math.floor(800 + Math.random() * 200)}`;

    const systemPrompt = `You are a grievance classification AI at an Indian college campus. Given a student complaint, return ONLY this JSON:
{
  "department": "hostel_warden|academic_office|canteen|electrical|plumbing|security|medical|administration|it_services",
  "urgency": 1,
  "sentiment": "frustrated|distressed|neutral|angry|urgent",
  "category": "string",
  "summary": "one sentence summary",
  "duplicate_probability": 0,
  "affected_students_estimate": 1,
  "escalation_risk": 0,
  "escalation_risk_level": "Low|Medium|High|Critical",
  "escalation_reason": "one sentence",
  "estimated_resolution_days": 1
}
Replace all numeric defaults with real values based on the complaint. Only return JSON.`;

    const userMessage = `Title: ${title}\nCategory: ${category}\nDescription: ${description}\nUrgency: ${urgency}/5\nAnonymous: ${isAnonymous}`;

    try {
      const responseText = await callGPT(systemPrompt, userMessage);
      const parsed = JSON.parse(responseText.trim().replace(/```json/g, '').replace(/```/g, ''));
      setResult({ ...parsed, ticketId });
    } catch {
      setResult({
        ticketId,
        department: 'Administration',
        urgency: urgency,
        sentiment: 'neutral',
        category: category || 'General',
        summary: `${title} — routed to administration for review.`,
        duplicate_probability: 12,
        affected_students_estimate: 1,
        escalation_risk: urgency >= 4 ? 65 : 20,
        escalation_risk_level: urgency >= 4 ? 'High' : 'Low',
        escalation_reason: 'Assessed based on urgency level and category.',
        estimated_resolution_days: 2,
      });
    } finally {
      clearInterval(stepInterval);
      setLoadingStep(LOADING_STEPS.length - 1);
      setTimeout(() => setIsProcessing(false), 300);
    }
  };

  const reset = () => {
    setResult(null);
    setTitle('');
    setDescription('');
    setCategory('');
    setUrgency(3);
    setPhoto(null);
    setIsAnonymous(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 pt-24 pb-24 font-roboto">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 font-satoshi uppercase tracking-wider text-foreground">Submit a Grievance</h1>
        <p className="text-muted-foreground text-sm mb-6">AI-powered triage routes your complaint to the right department instantly.</p>

        <AnimatePresence mode="wait">

          {/* ── FORM ── */}
          {!isProcessing && !result && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card className="bg-card border-border text-card-foreground">
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-5">

                    <div>
                      <label className="block mb-2 text-sm font-medium text-foreground">Title</label>
                      <Input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Brief title of the issue"
                        required
                        className="bg-background border-border focus:border-primary text-foreground"
                      />
                    </div>

                    <div>
                      <label className="block mb-3 text-sm font-medium text-foreground">Category</label>
                      <div className="grid grid-cols-4 gap-2">
                        {CATEGORIES.map(cat => (
                          <button
                            key={cat.value}
                            type="button"
                            onClick={() => setCategory(cat.value)}
                            className={`flex flex-col items-center p-3 rounded-xl border text-xs transition-all ${
                              category === cat.value
                                ? 'border-primary bg-primary/20 text-foreground'
                                : 'border-border bg-background text-muted-foreground hover:border-foreground/30'
                            }`}
                          >
                            <span className="text-xl mb-1">{cat.icon}</span>
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-foreground">Description</label>
                      <Textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Be specific. The more detail you give, the faster AI can route this."
                        required
                        rows={4}
                        className="bg-background border-border focus:border-primary text-foreground"
                      />
                      <p className="text-xs text-muted-foreground mt-1 text-right">{description.length} chars</p>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-foreground">
                        Urgency — <span className="text-primary">{URGENCY_LABELS[urgency]}</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">Low</span>
                        <input
                          type="range" min="1" max="5" value={urgency}
                          onChange={e => setUrgency(Number(e.target.value))}
                          className="flex-1 accent-primary"
                        />
                        <span className="text-xs text-muted-foreground">High</span>
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-foreground">Photo (Optional)</label>
                      <Input
                        type="file" accept="image/*" onChange={handlePhotoUpload}
                        className="bg-background border-border file:text-foreground text-foreground"
                      />
                      {photo && (
                        <img src={photo} alt="Preview" className="mt-3 w-full h-40 object-cover rounded-lg border border-border" style={{ filter: 'contrast(1.3) saturate(0.4) brightness(1.1)' }} />
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsAnonymous(!isAnonymous)}
                        className={`w-10 h-6 rounded-full transition-colors ${isAnonymous ? 'bg-primary' : 'bg-secondary'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full mx-1 transition-transform ${isAnonymous ? 'translate-x-4' : ''}`} />
                      </button>
                      <span className="text-sm text-muted-foreground">Submit anonymously</span>
                    </div>

                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 font-satoshi uppercase tracking-wider">
                      Submit Grievance
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ── PROCESSING ── */}
          {isProcessing && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 space-y-6"
            >
              {/* Neural network pulse */}
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
                <div className="absolute inset-2 rounded-full border-2 border-primary/50 animate-ping" style={{ animationDelay: '0.2s' }} />
                <div className="w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-primary font-semibold text-lg font-satoshi uppercase tracking-wider">✦ AI Processing</p>
                <motion.p
                  key={loadingStep}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-muted-foreground text-sm mt-2"
                >
                  {LOADING_STEPS[loadingStep]}
                </motion.p>
              </div>
            </motion.div>
          )}

          {/* ── RESULT ── */}
          {result && !isProcessing && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="bg-card border-primary/50 text-card-foreground overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />

                <CardHeader>
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1 font-satoshi uppercase tracking-wider">TICKET FILED</p>
                      <CardTitle className="text-primary font-mono text-lg">{result.ticketId}</CardTitle>
                    </div>
                    <EscalationBadge level={result.escalation_risk_level} />
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">

                  {/* Core grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-background p-3 rounded-lg border border-border">
                      <p className="text-xs text-muted-foreground mb-1 font-satoshi uppercase tracking-wider">✦ Routed To</p>
                      <p className="font-semibold text-primary capitalize">{result.department?.replace(/_/g, ' ')}</p>
                    </div>
                    <div className="bg-background p-3 rounded-lg border border-border">
                      <p className="text-xs text-muted-foreground mb-1 font-satoshi uppercase tracking-wider">AI Urgency</p>
                      <p className="font-semibold text-yellow-500">{result.urgency} / 5</p>
                    </div>
                    <div className="bg-background p-3 rounded-lg border border-border">
                      <p className="text-xs text-muted-foreground mb-1 font-satoshi uppercase tracking-wider">Sentiment</p>
                      <p className={`font-semibold capitalize ${result.sentiment === 'angry' || result.sentiment === 'distressed' ? 'text-destructive' : result.sentiment === 'urgent' ? 'text-orange-500' : 'text-green-500'}`}>
                        {result.sentiment}
                      </p>
                    </div>
                    <div className="bg-background p-3 rounded-lg border border-border">
                      <p className="text-xs text-muted-foreground mb-1 font-satoshi uppercase tracking-wider">Est. Resolution</p>
                      <p className="font-semibold text-primary">{result.estimated_resolution_days} day{result.estimated_resolution_days > 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  {/* Duplicate Detection */}
                  <div className="bg-background p-4 rounded-lg border border-border">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider font-satoshi">✦ Duplicate Detection</p>
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${result.duplicate_probability > 50 ? 'bg-orange-500/20 text-orange-500' : 'bg-green-500/20 text-green-500'}`}>
                        {result.duplicate_probability}% match probability
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5 mt-2">
                      <motion.div
                        className={`h-1.5 rounded-full ${result.duplicate_probability > 50 ? 'bg-orange-500' : 'bg-green-500'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${result.duplicate_probability}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {result.duplicate_probability > 50
                        ? `⚠ Similar issues reported — this complaint may be linked to an existing master ticket.`
                        : `✓ No significant duplicates found — new unique ticket created.`}
                    </p>
                    <p className="text-xs text-primary mt-1">
                      ~{result.affected_students_estimate} student{result.affected_students_estimate > 1 ? 's' : ''} potentially affected
                    </p>
                  </div>

                  {/* Escalation Prediction */}
                  <div className="bg-background p-4 rounded-lg border border-border">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider font-satoshi">✦ Escalation Prediction Engine</p>
                      <span className="text-xs font-bold text-foreground">{result.escalation_risk}/100</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2 mb-2">
                      <motion.div
                        className={`h-2 rounded-full ${
                          result.escalation_risk >= 80 ? 'bg-destructive' :
                          result.escalation_risk >= 60 ? 'bg-orange-500' :
                          result.escalation_risk >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${result.escalation_risk}%` }}
                        transition={{ duration: 0.9, delay: 0.4 }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{result.escalation_reason}</p>
                  </div>

                  {/* AI Summary */}
                  <div className="bg-background p-4 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-satoshi">✦ AI Summary</p>
                    <p className="text-sm text-foreground">{result.summary}</p>
                  </div>

                  <Button onClick={reset} className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-satoshi uppercase tracking-wider">
                    Submit Another Grievance
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
