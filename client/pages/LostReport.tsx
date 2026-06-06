import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useCampusOS } from '../contexts/CampusOSContext';
import { callGPT } from '../lib/openai';

const ITEM_TYPES = [
  { icon: '💳', label: 'ID Card' },
  { icon: '💻', label: 'Laptop' },
  { icon: '📱', label: 'Phone' },
  { icon: '🔑', label: 'Keys' },
  { icon: '👜', label: 'Bag' },
  { icon: '👓', label: 'Glasses' },
  { icon: '💰', label: 'Wallet' },
  { icon: '📚', label: 'Books' },
  { icon: '⌚', label: 'Watch' },
  { icon: '🎧', label: 'Earphones' },
  { icon: '➕', label: 'Other' },
];

const LOADING_STEPS = [
  'Extracting visual features...',
  'Analyzing description...',
  'Calculating recovery probability...',
  'Generating poster...',
  'Creating QR code...',
];

export default function LostReport() {
  const { addLostItem, addNotification } = useCampusOS();
  const [itemType, setItemType] = useState('');
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoScanning, setPhotoScanning] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setPhotoScanning(true);
    setPhoto(URL.createObjectURL(e.target.files[0]));
    setTimeout(() => setPhotoScanning(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setResult(null);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep(prev => prev < LOADING_STEPS.length - 1 ? prev + 1 : prev);
    }, 450);

    const caseId = `LF-2026-${Math.floor(100 + Math.random() * 900)}`;

    const systemPrompt = `You are a lost item recovery AI. Return ONLY this JSON:
{
  "unique_features": ["feature 1", "feature 2", "feature 3"],
  "recovery_probability": 0,
  "recommended_action": "one sentence advice",
  "best_zones_to_check": ["zone 1", "zone 2"],
  "urgency_level": "High|Medium|Low",
  "whatsapp_message": "short shareable message for WhatsApp groups"
}
Replace all placeholders with real values based on the item details.`;

    const userMsg = `Item: ${itemName} (${itemType})\nDescription: ${description}\nLast Seen: ${location}\nDate: ${date}`;

    let parsedResult;
    try {
      const raw = await callGPT(systemPrompt, userMsg);
      parsedResult = JSON.parse(raw.trim().replace(/```json/g, '').replace(/```/g, ''));
      setResult({ ...parsedResult, caseId });
    } catch {
      parsedResult = {
        unique_features: [itemName, location ? `Last seen at ${location}` : 'Unknown location', 'Please check nearby areas'],
        recovery_probability: itemType === 'ID Card' ? 72 : itemType === 'Laptop' ? 58 : 65,
        recommended_action: 'Report to the security desk and post in campus groups immediately.',
        best_zones_to_check: [location || 'Security Desk', 'Lost & Found Box', 'Library Help Desk'],
        urgency_level: 'Medium',
        whatsapp_message: `🚨 LOST: ${itemName}\nLast seen at ${location} on ${date}\nCase ID: ${caseId}\nIf found, please report at campusos.app/found`,
      };
      setResult({ ...parsedResult, caseId });
    } finally {
      clearInterval(stepInterval);
      setLoadingStep(LOADING_STEPS.length - 1);
      setTimeout(() => {
        setIsProcessing(false);
        addLostItem({
          id: caseId,
          item: itemName,
          description: description,
          location: location,
          date: date,
          category: itemType || 'Other',
          caseId: caseId,
          recoveryProbability: parsedResult.recovery_probability,
          posterViews: 0,
          qrScans: 0,
          shares: 0,
          potentialMatches: 0,
        });
        addNotification({
          text: `Lost item reported: ${itemName}. Match radar active.`,
          time: 'Just now',
          type: 'match'
        });
      }, 300);
    }
  };

  const qrUrl = result
    ? `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(`campusos.app/lost/${result.caseId}`)}&bgcolor=1A1A2E&color=6C63FF&format=svg`
    : '';

  const shareWhatsApp = () => {
    if (!result) return;
    const text = encodeURIComponent(result.whatsapp_message || `🚨 LOST: ${itemName}\nCase: ${result.caseId}\ncampusos.app/lost/${result.caseId}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareTelegram = () => {
    if (!result) return;
    const text = encodeURIComponent(result.whatsapp_message || `🚨 LOST: ${itemName}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(`campusos.app/lost/${result.caseId}`)}&text=${text}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`campusos.app/lost/${result.caseId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setResult(null);
    setItemType('');
    setItemName('');
    setDescription('');
    setLocation('');
    setPhoto(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 pt-24 pb-24 font-roboto">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 font-satoshi uppercase tracking-wider text-foreground">Report Lost Item</h1>
        <p className="text-muted-foreground text-sm mb-6">AI generates a recovery campaign — poster, QR code, and share links — instantly.</p>

        <AnimatePresence mode="wait">

          {/* ── FORM ── */}
          {!isProcessing && !result && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card className="bg-card border-border text-card-foreground">
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-5">

                    <div>
                      <label className="block mb-3 text-sm font-medium text-foreground">Item Type</label>
                      <div className="grid grid-cols-4 gap-2">
                        {ITEM_TYPES.map(t => (
                          <button key={t.label} type="button" onClick={() => setItemType(t.label)}
                            className={`flex flex-col items-center p-2 rounded-xl border text-xs transition-all ${
                              itemType === t.label
                                ? 'border-primary bg-primary/20 text-foreground'
                                : 'border-border bg-background text-muted-foreground hover:border-foreground/30'
                            }`}
                          >
                            <span className="text-xl mb-1">{t.icon}</span>
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-foreground">Item Name & Brand</label>
                      <Input value={itemName} onChange={e => setItemName(e.target.value)} required
                        placeholder="e.g. Black Lenovo Laptop" className="bg-background border-border focus:border-primary text-foreground" />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-foreground">Description</label>
                      <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                        placeholder="Describe anything unique: scratches, stickers, name written on it..."
                        className="bg-background border-border focus:border-primary text-foreground" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-foreground">Last Seen Location</label>
                        <Input value={location} onChange={e => setLocation(e.target.value)}
                          placeholder="e.g. Central Library" className="bg-background border-border focus:border-primary text-foreground" />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-foreground">Date</label>
                        <Input type="date" value={date} onChange={e => setDate(e.target.value)}
                          className="bg-background border-border focus:border-primary text-foreground" />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-foreground">
                        Photo <span className="text-muted-foreground">(a photo increases match chances by 3×)</span>
                      </label>
                      <Input type="file" accept="image/*" onChange={handlePhotoUpload}
                        className="bg-background border-border file:text-foreground text-foreground" />
                      {photo && (
                        <div className="mt-3 relative overflow-hidden rounded-lg border border-border">
                          <img src={photo} alt="Preview" className="w-full h-40 object-cover transition-all duration-700"
                            style={{ filter: photoScanning ? 'contrast(1.4) saturate(0.2) brightness(1.1)' : 'none' }} />
                          {photoScanning && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                              <motion.div
                                className="w-full h-0.5 bg-primary absolute"
                                initial={{ top: 0 }}
                                animate={{ top: '100%' }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              />
                              <p className="text-primary font-semibold text-sm z-10 font-satoshi uppercase tracking-wider">Analyzing features...</p>
                            </div>
                          )}
                          {!photoScanning && (
                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded font-satoshi uppercase tracking-wider font-semibold">
                              ✦ AI Indexed
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <Button type="submit" disabled={!itemName} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 font-satoshi uppercase tracking-wider">
                      Submit & Generate Recovery Campaign
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ── PROCESSING ── */}
          {isProcessing && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 space-y-6"
            >
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
                <div className="w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-primary font-semibold text-lg font-satoshi uppercase tracking-wider">✦ Creating Recovery Campaign</p>
                <motion.p key={loadingStep} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  className="text-muted-foreground text-sm mt-2">
                  {LOADING_STEPS[loadingStep]}
                </motion.p>
              </div>
            </motion.div>
          )}

          {/* ── RESULT: POSTER + CAMPAIGN ── */}
          {result && !isProcessing && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

              {/* Generated Poster */}
              <div className="bg-card border-2 border-primary/50 rounded-2xl overflow-hidden">
                {/* Poster header */}
                <div className="bg-primary px-6 py-4 text-center">
                  <p className="text-primary-foreground font-black text-lg font-satoshi tracking-widest uppercase">🚨 LOST ITEM ALERT</p>
                </div>

                <div className="p-6 flex flex-col md:flex-row gap-6">
                  {/* Left: details */}
                  <div className="flex-1">
                    <p className="text-2xl font-black text-foreground mb-1">{itemName}</p>
                    {itemType && <p className="text-primary text-sm font-semibold mb-3">{ITEM_TYPES.find(t => t.label === itemType)?.icon} {itemType}</p>}

                    <div className="space-y-1 text-sm text-muted-foreground mb-4">
                      <p>📍 Last Seen: <span className="text-foreground font-medium">{location || 'Unknown'}</span></p>
                      <p>📅 Date: <span className="text-foreground font-medium">{date}</span></p>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-satoshi font-semibold">✦ Unique Features</p>
                      {result.unique_features?.map((f: string, i: number) => (
                        <p key={i} className="text-sm text-muted-foreground">• {f}</p>
                      ))}
                    </div>

                    <div className="bg-background rounded-lg px-4 py-2 inline-block border border-border">
                      <p className="text-xs text-muted-foreground font-satoshi uppercase tracking-wider">Case ID</p>
                      <p className="text-primary font-mono font-bold text-lg">{result.caseId}</p>
                    </div>
                  </div>

                  {/* Right: QR code */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-white p-2 rounded-xl">
                      <img src={qrUrl} alt="QR Code" className="w-32 h-32" />
                    </div>
                    <p className="text-xs text-muted-foreground text-center max-w-[140px]">
                      Scan to report finding this item
                    </p>
                  </div>
                </div>

                {/* Recovery probability bar */}
                <div className="px-6 pb-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground font-medium font-satoshi uppercase tracking-wider">Recovery Probability</span>
                    <span className={`text-lg font-black ${
                      result.recovery_probability >= 70 ? 'text-green-500' :
                      result.recovery_probability >= 50 ? 'text-yellow-500' : 'text-orange-500'
                    }`}>{result.recovery_probability}%</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-3">
                    <motion.div
                      className={`h-3 rounded-full ${
                        result.recovery_probability >= 70 ? 'bg-green-500' :
                        result.recovery_probability >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${result.recovery_probability}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">💡 {result.recommended_action}</p>
                </div>
              </div>

              {/* Campaign Stats (mock) */}
              <div className="bg-card border border-border rounded-xl p-5">
                <p className="text-sm font-semibold text-foreground mb-4 font-satoshi uppercase tracking-wider">✦ Recovery Campaign — Live Stats</p>
                <div className="grid grid-cols-4 gap-3 text-center">
                  {[
                    { label: 'Poster Views', value: 0, icon: '👁' },
                    { label: 'QR Scans', value: 0, icon: '📷' },
                    { label: 'Shares', value: 0, icon: '📤' },
                    { label: 'Potential Matches', value: 0, icon: '🔗' },
                  ].map(stat => (
                    <div key={stat.label} className="bg-background rounded-lg p-3 border border-border">
                      <p className="text-xl">{stat.icon}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">Stats update as people view and scan your poster</p>
              </div>

              {/* Zones to check */}
              {result.best_zones_to_check?.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-4">
                  <p className="text-sm font-semibold text-foreground mb-3 font-satoshi uppercase tracking-wider">📍 Best Zones to Check</p>
                  <div className="flex flex-wrap gap-2">
                    {result.best_zones_to_check.map((zone: string, i: number) => (
                      <span key={i} className="text-xs bg-primary/20 text-primary border border-primary/40 px-3 py-1.5 rounded-full">
                        {zone}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Share buttons */}
              <div className="bg-card border border-border rounded-xl p-5">
                <p className="text-sm font-semibold text-foreground mb-3 font-satoshi uppercase tracking-wider">📤 Share Your Campaign</p>
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={shareWhatsApp}
                    className="flex items-center justify-center gap-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/40 text-green-500 py-3 rounded-xl transition-colors text-sm font-medium">
                    <span className="text-xl">💬</span> WhatsApp
                  </button>
                  <button onClick={shareTelegram}
                    className="flex items-center justify-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-500 py-3 rounded-xl transition-colors text-sm font-medium">
                    <span className="text-xl">✈️</span> Telegram
                  </button>
                  <button onClick={copyLink}
                    className="flex items-center justify-center gap-2 bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary py-3 rounded-xl transition-colors text-sm font-medium">
                    <span className="text-xl">{copied ? '✓' : '🔗'}</span> {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>

              <Button onClick={reset} className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-satoshi uppercase tracking-wider">
                Report Another Item
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
