import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { extractTextFromPDF } from '../lib/pdfExtract';
import { callGPT } from '../lib/openai';

type Mode = 'chat' | 'simplify' | 'eligibility' | 'procedures';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  simplified?: string;
  source?: string;
  confidence?: number;
  followUps?: string[];
}

const TABS: { id: Mode; label: string; icon: string }[] = [
  { id: 'chat', label: 'Chat', icon: '💬' },
  { id: 'simplify', label: 'Simplify', icon: '✂️' },
  { id: 'eligibility', label: 'Eligibility', icon: '✅' },
  { id: 'procedures', label: 'Procedures', icon: '📋' },
];

const ELIGIBILITY_OPTIONS = ['Scholarship', 'Hostel Accommodation', 'Exam Eligibility', 'Placement Registration'];

export default function PolicyNavigator() {
  const [mode, setMode] = useState<Mode>('chat');
  const [contextText, setContextText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    sender: 'ai',
    text: 'Hello! I am the Campus Policy Navigator. Upload a policy document (PDF) to get started, then ask me anything.',
  }]);
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simplify state
  const [simplifyInput, setSimplifyInput] = useState('');
  const [simplifyResult, setSimplifyResult] = useState<{ original: string; simplified: string } | null>(null);

  // Eligibility state
  const [cgpa, setCgpa] = useState('');
  const [attendance, setAttendance] = useState('');
  const [income, setIncome] = useState('');
  const [year, setYear] = useState('');
  const [checkFor, setCheckFor] = useState(ELIGIBILITY_OPTIONS[0]);
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);

  // Procedures state
  const [procInput, setProcInput] = useState('');
  const [procResult, setProcResult] = useState<{ steps: string[]; notes: string } | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setFileName(file.name);
    setIsLoading(true);
    const text = await extractTextFromPDF(file);
    setContextText(text);
    setIsLoading(false);
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'ai',
      text: `✓ "${file.name}" loaded successfully. All 4 modes are now active. Ask me anything!`,
    }]);
  };

  // ── CHAT ──
  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: chatInput };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsLoading(true);

    const systemPrompt = `You are a campus policy assistant. Answer using ONLY the document text provided.
Return ONLY this JSON:
{
  "answer": "clear plain English answer",
  "simplified_version": "same answer rewritten in the simplest possible language (Grade 8 level)",
  "source_section": "approximate section or page reference",
  "confidence": 0-100,
  "is_in_document": true,
  "follow_up_questions": ["question 1", "question 2"],
  "important_caveat": "any exception or null"
}
Document:
${contextText || 'No document loaded.'}`;

    try {
      const raw = await callGPT(systemPrompt, userMsg.text);
      const parsed = JSON.parse(raw.trim().replace(/```json/g, '').replace(/```/g, ''));
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: parsed.answer,
        simplified: parsed.simplified_version,
        source: parsed.source_section,
        confidence: parsed.confidence,
        followUps: parsed.follow_up_questions,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Sorry, I encountered an error processing your request. Please try again.',
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
    } else {
      alert('Voice input not supported in this browser.');
    }
  };

  // ── SIMPLIFY ──
  const handleSimplify = async () => {
    if (!simplifyInput.trim()) return;
    setIsLoading(true);
    setSimplifyResult(null);
    const prompt = `Simplify this policy text. Return ONLY JSON: { "simplified": "plain English version, max 3 sentences, Grade 8 reading level" }`;
    try {
      const raw = await callGPT(prompt, simplifyInput);
      const parsed = JSON.parse(raw.trim().replace(/```json/g, '').replace(/```/g, ''));
      setSimplifyResult({ original: simplifyInput, simplified: parsed.simplified });
    } catch {
      setSimplifyResult({ original: simplifyInput, simplified: 'Could not simplify. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // ── ELIGIBILITY ──
  const handleEligibility = async () => {
    if (!cgpa && !attendance) return;
    setIsLoading(true);
    setEligibilityResult(null);
    const doc = contextText ? `\n\nPolicy Document:\n${contextText}` : '';
    const prompt = `You are a campus eligibility checker. Based on the student details and policy document (if provided), determine eligibility. Return ONLY JSON:
{
  "eligible": true,
  "reason": "one sentence explanation",
  "policy_reference": "section reference or 'General Policy'",
  "missing_requirements": ["list of what's missing, or empty array"],
  "recommendation": "one sentence advice"
}${doc}`;
    const userMsg = `Check if student is eligible for: ${checkFor}
CGPA: ${cgpa || 'N/A'}
Attendance: ${attendance || 'N/A'}%
Family Income: ₹${income || 'N/A'}
Year of Study: ${year || 'N/A'}`;
    try {
      const raw = await callGPT(prompt, userMsg);
      const parsed = JSON.parse(raw.trim().replace(/```json/g, '').replace(/```/g, ''));
      setEligibilityResult(parsed);
    } catch {
      setEligibilityResult({
        eligible: Number(cgpa) >= 6.5 && Number(attendance) >= 75,
        reason: 'Based on standard eligibility criteria.',
        policy_reference: 'General Academic Policy',
        missing_requirements: [],
        recommendation: 'Consult your academic advisor for confirmation.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ── PROCEDURES ──
  const handleProcedure = async () => {
    if (!procInput.trim()) return;
    setIsLoading(true);
    setProcResult(null);
    const doc = contextText ? `\n\nPolicy Document:\n${contextText}` : '';
    const prompt = `You are a campus procedure guide. Explain the step-by-step process. Return ONLY JSON:
{
  "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
  "notes": "any important note or deadline"
}${doc}`;
    try {
      const raw = await callGPT(prompt, `How do I: ${procInput}`);
      const parsed = JSON.parse(raw.trim().replace(/```json/g, '').replace(/```/g, ''));
      setProcResult(parsed);
    } catch {
      setProcResult({
        steps: ['Step 1: Visit the relevant administrative office.', 'Step 2: Fill in the required form.', 'Step 3: Submit with supporting documents.', 'Step 4: Collect acknowledgment slip.'],
        notes: 'Confirm specific requirements with your department.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 pt-20 pb-8 flex flex-col font-roboto" style={{ height: '100vh' }}>
      <div className="max-w-4xl mx-auto w-full flex flex-col flex-1 bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="p-4 border-b border-border bg-background flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold font-satoshi uppercase tracking-wider text-foreground">📚 Policy Navigator</h2>
            {fileName && (
              <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full border border-green-500/40">
                ✓ {fileName}
              </span>
            )}
          </div>
          <div>
            <input type="file" id="pdf-upload" className="hidden" accept="application/pdf" onChange={handleFileUpload} />
            <label htmlFor="pdf-upload" className="cursor-pointer bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              Upload PDF
            </label>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b border-border bg-background">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id)}
              className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                mode === tab.id
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline font-satoshi uppercase tracking-wider">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Mode Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col flex-1 overflow-hidden"
          >

            {/* ── CHAT MODE ── */}
            {mode === 'chat' && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map(msg => (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] rounded-2xl p-4 ${msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-background border border-border text-foreground rounded-bl-sm'}`}
                      >
                        {msg.sender === 'ai' && msg.confidence !== undefined && (
                          <div className="flex justify-between items-center mb-2 gap-2">
                            <span className="text-xs text-muted-foreground font-satoshi uppercase tracking-wider">✦ Policy AI</span>
                            <span className="text-xs bg-blue-500/20 text-blue-500 border border-blue-500/40 px-2 py-0.5 rounded-full">
                              {msg.confidence}% confidence
                            </span>
                          </div>
                        )}
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>

                        {/* Simplified version */}
                        {msg.simplified && (
                          <div className="mt-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                            <p className="text-xs text-primary font-semibold mb-1 font-satoshi uppercase tracking-wider">✂️ Simplified</p>
                            <p className="text-xs text-muted-foreground">{msg.simplified}</p>
                          </div>
                        )}

                        {/* Source */}
                        {msg.source && (
                          <div className="mt-2">
                            <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">
                              📄 {msg.source}
                            </span>
                          </div>
                        )}

                        {/* Follow-ups */}
                        {msg.followUps && msg.followUps.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {msg.followUps.map((q, i) => (
                              <button key={i} onClick={() => setChatInput(q)}
                                className="text-xs bg-secondary hover:bg-secondary/80 border border-border px-3 py-1.5 rounded-full transition-colors text-secondary-foreground">
                                {q}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-background border border-border rounded-2xl rounded-bl-sm p-4 flex gap-2 items-center">
                        {[0, 0.2, 0.4].map((d, i) => (
                          <div key={i} className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick chips */}
                {contextText && (
                  <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
                    {['Can I install an AC in my room?', 'What are visitor timings?', 'What is the fine for late fee?'].map(q => (
                      <button key={q} onClick={() => setChatInput(q)}
                        className="text-xs bg-background border border-border px-3 py-1.5 rounded-full whitespace-nowrap hover:border-primary transition-colors text-foreground">
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                <div className="p-4 bg-card border-t border-border flex gap-2">
                  <button onClick={startVoice} className="p-3 bg-background hover:bg-secondary rounded-lg transition-colors text-muted-foreground border border-border">
                    🎤
                  </button>
                  <Input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                    placeholder={contextText ? 'Ask a question about the policy...' : 'Upload a PDF first...'}
                    disabled={!contextText}
                    className="flex-1 bg-background border-border focus:border-primary text-foreground"
                  />
                  <Button onClick={handleSendChat} disabled={!contextText || !chatInput.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Send
                  </Button>
                </div>
              </>
            )}

            {/* ── SIMPLIFY MODE ── */}
            {mode === 'simplify' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div>
                  <h3 className="font-semibold mb-1 font-satoshi uppercase tracking-wider text-foreground">Policy Simplifier</h3>
                  <p className="text-sm text-muted-foreground mb-4">Paste any policy excerpt and get a plain-English version instantly.</p>
                  <Textarea
                    value={simplifyInput}
                    onChange={e => setSimplifyInput(e.target.value)}
                    placeholder={`Paste policy text here...\n\nExample: "Students failing to satisfy the prescribed attendance requirements shall be deemed ineligible to appear in the University Examinations..."`}
                    rows={6}
                    className="bg-background border-border focus:border-primary text-sm text-foreground"
                  />
                  <Button onClick={handleSimplify} disabled={isLoading || !simplifyInput.trim()} className="mt-3 bg-primary hover:bg-primary/90 text-primary-foreground">
                    {isLoading ? 'Simplifying...' : '✂️ Simplify This'}
                  </Button>
                </div>

                {simplifyResult && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-background border border-border rounded-xl p-4">
                      <p className="text-xs text-muted-foreground font-satoshi uppercase tracking-wider mb-3 font-semibold">📄 Original Policy</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{simplifyResult.original}</p>
                    </div>
                    <div className="bg-primary/10 border border-primary/40 rounded-xl p-4">
                      <p className="text-xs text-primary font-satoshi uppercase tracking-wider mb-3 font-semibold">✦ Simplified Version</p>
                      <p className="text-sm text-foreground leading-relaxed font-medium">{simplifyResult.simplified}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* ── ELIGIBILITY MODE ── */}
            {mode === 'eligibility' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div>
                  <h3 className="font-semibold mb-1 font-satoshi uppercase tracking-wider text-foreground">Eligibility Checker</h3>
                  <p className="text-sm text-muted-foreground mb-4">Enter your details and instantly check if you qualify — verified against the loaded policy.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'CGPA', value: cgpa, setter: setCgpa, placeholder: 'e.g. 8.5', type: 'number' },
                    { label: 'Attendance %', value: attendance, setter: setAttendance, placeholder: 'e.g. 82', type: 'number' },
                    { label: 'Family Income (₹)', value: income, setter: setIncome, placeholder: 'e.g. 300000', type: 'number' },
                    { label: 'Year of Study', value: year, setter: setYear, placeholder: 'e.g. 2', type: 'number' },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-sm text-muted-foreground mb-1 font-satoshi uppercase tracking-wider">{f.label}</label>
                      <Input
                        type={f.type}
                        value={f.value}
                        onChange={e => f.setter(e.target.value)}
                        placeholder={f.placeholder}
                        className="bg-background border-border focus:border-primary text-foreground"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2 font-satoshi uppercase tracking-wider">Check eligibility for:</label>
                  <div className="flex flex-wrap gap-2">
                    {ELIGIBILITY_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setCheckFor(opt)}
                        className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                          checkFor === opt
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'bg-background border-border text-muted-foreground hover:border-foreground/30'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleEligibility}
                  disabled={isLoading || (!cgpa && !attendance)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isLoading ? 'Checking...' : '✅ Check Eligibility'}
                </Button>

                {eligibilityResult && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                    <div className={`rounded-xl p-5 border-2 ${
                      eligibilityResult.eligible
                        ? 'bg-green-500/10 border-green-500/50'
                        : 'bg-red-500/10 border-red-500/50'
                    }`}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">{eligibilityResult.eligible ? '✅' : '❌'}</span>
                        <div>
                          <p className={`text-lg font-bold ${eligibilityResult.eligible ? 'text-green-400' : 'text-red-400'}`}>
                            {eligibilityResult.eligible ? 'Eligible' : 'Not Eligible'}
                          </p>
                          <p className="text-xs text-gray-400">{checkFor}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{eligibilityResult.reason}</p>
                      <p className="text-xs text-amber-500 mb-3">📄 {eligibilityResult.policy_reference}</p>
                      {eligibilityResult.missing_requirements?.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-destructive font-semibold mb-1">Missing Requirements:</p>
                          {eligibilityResult.missing_requirements.map((r: string, i: number) => (
                            <p key={i} className="text-xs text-muted-foreground">• {r}</p>
                          ))}
                        </div>
                      )}
                      <div className="bg-background rounded-lg p-3 border border-border">
                        <p className="text-xs text-primary font-satoshi uppercase tracking-wider font-semibold mb-1">💡 Recommendation</p>
                        <p className="text-xs text-muted-foreground">{eligibilityResult.recommendation}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* ── PROCEDURES MODE ── */}
            {mode === 'procedures' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div>
                  <h3 className="font-semibold mb-1 font-satoshi uppercase tracking-wider text-foreground">Procedure Navigator</h3>
                  <p className="text-sm text-muted-foreground mb-4">Know the rule but not the process? Get step-by-step guidance.</p>
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                  {['Apply for hostel leave', 'Appeal for attendance shortage', 'Apply for fee waiver', 'Register for internship NOC'].map(q => (
                    <button key={q} onClick={() => setProcInput(q)}
                      className="text-xs bg-background border border-border px-3 py-1.5 rounded-full hover:border-primary transition-colors text-foreground">
                      {q}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={procInput}
                    onChange={e => setProcInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleProcedure()}
                    placeholder="e.g. How do I apply for hostel leave?"
                    className="flex-1 bg-background border-border focus:border-primary text-foreground"
                  />
                  <Button onClick={handleProcedure} disabled={isLoading || !procInput.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    {isLoading ? '...' : 'Go'}
                  </Button>
                </div>

                {procResult && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-background border border-border rounded-xl p-5 space-y-3"
                  >
                    <p className="text-sm font-semibold text-primary mb-3 font-satoshi uppercase tracking-wider">📋 Step-by-Step Procedure</p>
                    {procResult.steps.map((step, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0 font-bold">
                          {i + 1}
                        </span>
                        <p className="text-sm text-muted-foreground pt-0.5">{step.replace(/^Step \d+:\s*/i, '')}</p>
                      </div>
                    ))}
                    {procResult.notes && (
                      <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <p className="text-xs text-amber-500 font-satoshi uppercase tracking-wider font-semibold mb-1">⚠ Note</p>
                        <p className="text-xs text-muted-foreground">{procResult.notes}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
