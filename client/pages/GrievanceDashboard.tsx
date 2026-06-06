import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { mockGrievances } from '../lib/mockData';

function EscalationBadge({ level, risk }: { level: string; risk: number }) {
  const styles: Record<string, string> = {
    Critical: 'bg-red-500/20 text-red-400 border-red-500/50',
    High: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    Low: 'bg-green-500/20 text-green-400 border-green-500/50',
  };
  const icons: Record<string, string> = { Critical: '🚨', High: '⚠', Medium: '⚡', Low: '✓' };
  return (
    <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${styles[level] || styles.Low}`}>
      {icons[level]} {risk}% risk
    </span>
  );
}

export default function GrievanceDashboard() {
  const [grievances] = useState(mockGrievances);
  const [filter, setFilter] = useState<'all' | 'critical'>('all');

  const displayed = filter === 'critical'
    ? grievances.filter(g => g.escalationRiskLevel === 'Critical' || g.escalationRiskLevel === 'High')
    : grievances;

  const departmentStats = grievances.reduce((acc: any, curr) => {
    acc[curr.department] = (acc[curr.department] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(departmentStats).map(key => ({
    name: key.length > 10 ? key.slice(0, 10) + '…' : key,
    count: departmentStats[key],
  }));

  const columns: Array<'Pending' | 'In Review' | 'Resolved'> = ['Pending', 'In Review', 'Resolved'];

  const colColors: Record<string, string> = {
    Pending: 'border-red-500/30',
    'In Review': 'border-yellow-500/30',
    Resolved: 'border-green-500/30',
  };

  const totalAffected = grievances.reduce((sum, g) => sum + (g.affectedStudents || 0), 0);
  const criticalCount = grievances.filter(g => g.escalationRiskLevel === 'Critical').length;
  const totalDuplicates = grievances.reduce((sum, g) => sum + ((g.duplicateCount || 1) - 1), 0);

  return (
    <div className="min-h-screen bg-background text-foreground p-6 pt-24 pb-24 font-roboto">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold font-satoshi uppercase tracking-wider text-foreground">Grievance Triage Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">AI-powered duplicate detection &amp; escalation prediction</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${filter === 'all' ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-border text-muted-foreground hover:border-foreground/30'}`}
            >
              All Grievances
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${filter === 'critical' ? 'bg-destructive/30 border-destructive text-destructive-foreground' : 'bg-card border-border text-muted-foreground hover:border-foreground/30'}`}
            >
              ⚠ High Escalation Risk
            </button>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Tickets', value: grievances.length, color: 'text-primary' },
            { label: 'Critical Escalations', value: criticalCount, color: 'text-destructive' },
            { label: 'Duplicate Complaints Merged', value: totalDuplicates, color: 'text-orange-500' },
            { label: 'Students Affected', value: totalAffected, color: 'text-blue-500' },
          ].map(stat => (
            <Card key={stat.label} className="bg-card border-border text-card-foreground">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground font-satoshi uppercase tracking-wider mb-1">{stat.label}</p>
                <motion.p
                  className={`text-3xl font-bold ${stat.color}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {stat.value}
                </motion.p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart */}
        <Card className="bg-card border-border text-card-foreground">
          <CardHeader>
            <CardTitle className="text-base font-satoshi uppercase tracking-wider">Department Issue Volume</CardTitle>
          </CardHeader>
          <CardContent className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 8 }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.7)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Kanban */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {columns.map(status => {
            const col = displayed.filter(g => g.status === status);
            return (
              <div key={status} className={`bg-card/50 rounded-xl p-4 border ${colColors[status]} flex flex-col`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-satoshi font-semibold text-sm uppercase tracking-wider text-foreground">{status}</h3>
                  <span className="bg-background text-muted-foreground text-xs px-2 py-1 rounded-full border border-border">
                    {col.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {col.map((grievance, idx) => (
                    <motion.div
                      key={grievance.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.07 }}
                    >
                      <Card className={`bg-background border hover:border-primary transition-colors cursor-pointer text-card-foreground ${
                        grievance.escalationRiskLevel === 'Critical' ? 'border-destructive/50' :
                        grievance.escalationRiskLevel === 'High' ? 'border-orange-500/50' : 'border-border'
                      }`}>
                        <CardContent className="p-4 space-y-3">

                          {/* Top row */}
                          <div className="flex justify-between items-start gap-2 flex-wrap">
                            <span className="text-xs font-semibold px-2 py-0.5 bg-primary/20 text-primary rounded">
                              {grievance.category}
                            </span>
                            <EscalationBadge level={grievance.escalationRiskLevel} risk={grievance.escalationRisk} />
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground font-mono">{grievance.id}</p>
                            <h4 className="font-medium text-sm mt-0.5 leading-snug">{grievance.title}</h4>
                          </div>

                          {/* Escalation bar */}
                          <div>
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Escalation Risk</span>
                              <span>{grievance.escalationRisk}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1">
                              <div
                                className={`h-1 rounded-full transition-all ${
                                  grievance.escalationRisk >= 80 ? 'bg-red-500' :
                                  grievance.escalationRisk >= 60 ? 'bg-orange-400' :
                                  grievance.escalationRisk >= 40 ? 'bg-yellow-400' : 'bg-green-400'
                                }`}
                                style={{ width: `${grievance.escalationRisk}%` }}
                              />
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="flex justify-between items-center pt-1 border-t border-border text-xs text-muted-foreground">
                            <span>
                              {grievance.duplicateCount > 1
                                ? `📎 ${grievance.duplicateCount} reports merged`
                                : '1 report'}
                            </span>
                            <span>👥 {grievance.affectedStudents} affected</span>
                            <span>⏱ {grievance.slaHours}h SLA</span>
                          </div>

                          {grievance.escalationReason && (
                            <p className="text-xs text-muted-foreground italic border-t border-border pt-2">
                              {grievance.escalationReason}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}

                  {col.length === 0 && (
                    <div className="h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                      No items
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
