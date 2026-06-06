import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { callGPT } from '../lib/openai';

export default function MaintenanceReport() {
  const [location, setLocation] = useState('');
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
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

    const systemPrompt = `You are a maintenance severity AI. Given an issue description, return JSON: { "severity": 1-5, "category": "electrical"|"plumbing"|"furniture"|"civil", "priority": "critical"|"high"|"medium"|"low", "estimatedTime": "string" }. Only return JSON.`;
    const userMessage = `Location: ${location}\nIssue Type: ${issueType}\nDescription: ${description}`;

    try {
      const responseText = await callGPT(systemPrompt, userMessage);
      const parsed = JSON.parse(responseText.trim().replace(/```json/g, '').replace(/```/g, ''));
      setResult(parsed);
    } catch (error) {
      console.error(error);
      setResult({
        severity: 3,
        category: "civil",
        priority: "medium",
        estimatedTime: "24 hours"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 pt-24 pb-24 font-roboto">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 font-satoshi uppercase tracking-wider text-foreground">Report Maintenance Issue</h1>
        
        {!isProcessing && !result && (
          <Card className="bg-card border-border text-card-foreground">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-foreground">Location (Block + Room)</label>
                  <Input 
                    value={location} 
                    onChange={e => setLocation(e.target.value)} 
                    placeholder="e.g., Block A, Room 101" 
                    required 
                    className="bg-background border-border focus:border-primary text-foreground"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-foreground">Issue Type</label>
                  <Select onValueChange={setIssueType} required>
                    <SelectTrigger className="bg-background border-border focus:border-primary text-foreground">
                      <SelectValue placeholder="Select an issue type" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-card-foreground">
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                      <SelectItem value="furniture">Furniture</SelectItem>
                      <SelectItem value="civil">Civil / Structural</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-foreground">Description</label>
                  <Textarea 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    placeholder="Describe the issue..." 
                    required 
                    rows={4}
                    className="bg-background border-border focus:border-primary text-foreground"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-foreground">Photo</label>
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoUpload} 
                    className="bg-background border-border file:text-foreground text-foreground"
                  />
                  {photo && (
                    <div className="mt-4 relative">
                      <img 
                        src={photo} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-md border border-border"
                        style={{ filter: 'contrast(1.5) saturate(1.2) sepia(0.3) hue-rotate(-15deg)' }} 
                      />
                      <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 text-xs text-primary font-mono border border-primary">
                        SCAN_ACTIVE
                      </div>
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-satoshi uppercase tracking-wider">
                  Submit Report
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-semibold text-foreground font-satoshi uppercase tracking-wider">Analyzing Damage Severity...</h2>
          </motion.div>
        )}

        {result && !isProcessing && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
          >
            <Card className="bg-card border-border text-card-foreground overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-destructive"></div>
              <CardHeader>
                <CardTitle className="flex justify-between items-center font-satoshi uppercase tracking-wider">
                  <span>Maintenance AI Report</span>
                  <span className="text-xs bg-destructive px-2 py-1 rounded-full text-destructive-foreground font-mono">
                    PRIORITY: {result.priority.toUpperCase()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Animated Severity Meter */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">Severity Score</span>
                    <span className="text-sm font-bold text-destructive">{result.severity} / 5</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-3 overflow-hidden">
                    <motion.div 
                      className="bg-gradient-to-r from-yellow-500 to-destructive h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(result.severity / 5) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background p-3 rounded border border-border">
                    <p className="text-xs text-muted-foreground font-satoshi uppercase tracking-wider">Category</p>
                    <p className="font-semibold text-primary capitalize">{result.category}</p>
                  </div>
                  <div className="bg-background p-3 rounded border border-border">
                    <p className="text-xs text-muted-foreground font-satoshi uppercase tracking-wider">Estimated Resolution Time</p>
                    <p className="font-semibold text-primary">{result.estimatedTime}</p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={() => { setResult(null); setLocation(''); setDescription(''); }} className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-satoshi uppercase tracking-wider">
                    Report Another Issue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
