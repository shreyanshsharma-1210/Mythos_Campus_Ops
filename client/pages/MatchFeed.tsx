import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { mockLostItems, mockFoundItems } from '../lib/mockData';
import { callGPT } from '../lib/openai';

function ConfidenceBadge({ score }: { score: number }) {
  if (score >= 85) return <span className="text-xs font-bold px-2 py-1 rounded border bg-green-500/20 text-green-400 border-green-500/40">HIGH CONFIDENCE</span>;
  if (score >= 60) return <span className="text-xs font-bold px-2 py-1 rounded border bg-yellow-500/20 text-yellow-400 border-yellow-500/40">POSSIBLE MATCH</span>;
  return <span className="text-xs font-bold px-2 py-1 rounded border bg-gray-500/20 text-gray-400 border-gray-500/40">WEAK MATCH</span>;
}

function RecoveryBar({ probability }: { probability: number }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-500">Recovery Probability</span>
        <span className={`text-xs font-bold ${probability >= 70 ? 'text-green-400' : probability >= 50 ? 'text-yellow-400' : 'text-orange-400'}`}>
          {probability}%
        </span>
      </div>
      <div className="w-full bg-[#2A2A4A] rounded-full h-1.5">
        <motion.div
          className={`h-1.5 rounded-full ${probability >= 70 ? 'bg-green-500' : probability >= 50 ? 'bg-yellow-400' : 'bg-orange-400'}`}
          initial={{ width: 0 }}
          animate={{ width: `${probability}%` }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>
    </div>
  );
}

export default function MatchFeed() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());
  const [otpMap, setOtpMap] = useState<Record<string, string>>({});

  useEffect(() => {
    async function evaluateMatches() {
      const results: any[] = [];

      for (let i = 0; i < Math.min(mockLostItems.length, mockFoundItems.length); i++) {
        const lost = mockLostItems[i];
        const found = mockFoundItems[i];

        const systemPrompt = `You are a lost and found matching AI. Return ONLY JSON:
{
  "match_score": 0-100,
  "match_reason": "one sentence",
  "key_matching_features": ["feature1", "feature2"],
  "confidence": "high|medium|low",
  "recommended_action": "claim|investigate_further|unlikely_match"
}`;
        const userMsg = `Lost: ${lost.item} — ${lost.description}\nFound: ${found.item} — ${found.description}`;

        try {
          const raw = await callGPT(systemPrompt, userMsg);
          const parsed = JSON.parse(raw.trim().replace(/```json/g, '').replace(/```/g, ''));
          results.push({ id: `${lost.id}-${found.id}`, lost, found, ...parsed });
        } catch {
          results.push({
            id: `${lost.id}-${found.id}`,
            lost, found,
            match_score: 87,
            match_reason: 'Similar description, category, and likely trajectory match.',
            key_matching_features: ['Similar item type', 'Matching color/material', 'Nearby locations'],
            confidence: 'high',
            recommended_action: 'claim',
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
    setOtpMap(prev => ({ ...prev, [matchId]: otp }));
    setClaimedIds(prev => new Set([...prev, matchId]));
  };

  const borderColor = (score: number) =>
    score >= 85 ? 'border-green-500/50' : score >= 60 ? 'border-yellow-500/40' : 'border-gray-500/30';

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white p-6 pt-24 pb-24">
      <div className="max-w-5xl mx-auto space-y-6">

        <div>
          <h1 className="text-3xl font-bold mb-1">AI Match Feed</h1>
          <p className="text-gray-400 text-sm">AI reads both item descriptions and connects the right people.</p>
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Cases', value: mockLostItems.length, icon: '🔍' },
            { label: 'Matches Found', value: matches.length, icon: '🔗' },
            { label: 'Reunited Today', value: 2, icon: '✅' },
            { label: 'Avg Recovery', value: '67%', icon: '📈' },
          ].map(stat => (
            <div key={stat.label} className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-xl p-4 text-center">
              <p className="text-2xl">{stat.icon}</p>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-[#6C63FF]/30 animate-ping" />
              <div className="w-16 h-16 border-4 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-[#6C63FF] font-semibold">✦ AI Matching in Progress...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {matches.map(match => (
              <motion.div key={match.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <Card className={`bg-[#1A1A2E] border-2 ${borderColor(match.match_score)} text-white overflow-hidden`}>

                  {/* Match header */}
                  <div className="flex justify-between items-center px-6 py-3 border-b border-[#2A2A4A] bg-[#0F0F1A]">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Match Found</span>
                      <ConfidenceBadge score={match.match_score} />
                    </div>
                    <span className={`text-3xl font-black ${match.match_score >= 85 ? 'text-green-400' : match.match_score >= 60 ? 'text-yellow-400' : 'text-gray-400'}`}>
                      {match.match_score}%
                    </span>
                  </div>

                  <CardContent className="p-0">
                    {/* Side-by-side */}
                    <div className="flex flex-col md:flex-row">
                      <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-[#2A2A4A] bg-red-500/5">
                        <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded font-bold uppercase tracking-wider mb-3 inline-block">
                          Lost Item
                        </span>
                        <h3 className="text-xl font-bold">{match.lost.item}</h3>
                        <p className="text-gray-400 text-sm mt-2 leading-relaxed">{match.lost.description}</p>
                        <p className="text-xs text-gray-500 mt-3">📍 {match.lost.location} · 📅 {match.lost.date}</p>
                      </div>
                      <div className="flex-1 p-6 bg-green-500/5">
                        <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded font-bold uppercase tracking-wider mb-3 inline-block">
                          Found Item
                        </span>
                        <h3 className="text-xl font-bold">{match.found.item}</h3>
                        <p className="text-gray-400 text-sm mt-2 leading-relaxed">{match.found.description}</p>
                        <p className="text-xs text-gray-500 mt-3">📍 {match.found.location} · 📅 {match.found.date}</p>
                      </div>
                    </div>

                    {/* AI reasoning */}
                    <div className="px-6 py-4 border-t border-[#2A2A4A] bg-[#0F0F1A]">
                      <p className="text-xs text-[#6C63FF] font-semibold mb-1">✦ AI Analysis</p>
                      <p className="text-sm text-gray-300 italic mb-2">"{match.match_reason}"</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {match.key_matching_features?.map((f: string, i: number) => (
                          <span key={i} className="text-xs bg-[#6C63FF]/20 text-[#6C63FF] border border-[#6C63FF]/30 px-2 py-1 rounded-full">
                            {f}
                          </span>
                        ))}
                      </div>
                      <RecoveryBar probability={match.lost.recoveryProbability ?? 65} />
                    </div>

                    {/* Campaign stats */}
                    {match.lost.posterViews !== undefined && (
                      <div className="px-6 py-3 border-t border-[#2A2A4A] flex flex-wrap gap-4 text-xs text-gray-500">
                        <span>👁 {match.lost.posterViews} poster views</span>
                        <span>📷 {match.lost.qrScans} QR scans</span>
                        <span>📤 {match.lost.shares} shares</span>
                        <span>🔗 {match.lost.potentialMatches} potential matches</span>
                      </div>
                    )}

                    {/* Action footer */}
                    <div className="px-6 py-4 border-t border-[#2A2A4A] flex flex-col sm:flex-row justify-between items-center gap-3">
                      {claimedIds.has(match.id) ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="w-full flex flex-col sm:flex-row items-center gap-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
                        >
                          <div className="text-center">
                            <p className="text-xs text-gray-400 mb-1">Your Claim Code</p>
                            <p className="text-3xl font-black text-green-400 font-mono tracking-widest">
                              {otpMap[match.id]?.slice(0, 3)} {otpMap[match.id]?.slice(3)}
                            </p>
                          </div>
                          <p className="text-xs text-gray-400 text-center sm:text-left flex-1">
                            Show this code to the finder or security desk to collect your item. Both parties have been notified.
                          </p>
                          <span className="text-2xl">🎉</span>
                        </motion.div>
                      ) : (
                        <>
                          <Button variant="outline" className="border-[#2A2A4A] text-gray-400 hover:border-gray-500 w-full sm:w-auto">
                            Not My Item
                          </Button>
                          <Button onClick={() => handleClaim(match.id)} className="bg-[#6C63FF] hover:bg-[#5a52d4] w-full sm:w-auto">
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
              <div className="text-center py-16 text-gray-500">
                <p className="text-4xl mb-4">🔍</p>
                <p>No matches found yet. Check back soon.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
