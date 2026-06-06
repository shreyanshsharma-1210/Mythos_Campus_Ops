import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useCampusOS } from '../contexts/CampusOSContext';

const trendData = [
  { name: 'Mon', BlockA: 4, BlockB: 2, BlockC: 1 },
  { name: 'Tue', BlockA: 3, BlockB: 4, BlockC: 2 },
  { name: 'Wed', BlockA: 5, BlockB: 1, BlockC: 4 },
  { name: 'Thu', BlockA: 2, BlockB: 6, BlockC: 3 },
  { name: 'Fri', BlockA: 1, BlockB: 3, BlockC: 5 },
  { name: 'Sat', BlockA: 4, BlockB: 2, BlockC: 2 },
  { name: 'Sun', BlockA: 2, BlockB: 1, BlockC: 1 },
];

export default function MaintenanceDashboard() {
  const { maintenanceReports, updateMaintenanceReport } = useCampusOS();

  // Create a sorted copy of the issues for display
  const issues = [...maintenanceReports].sort((a, b) => b.severity - a.severity);

  const toggleStatus = (id: string, currentStatus: string) => {
    updateMaintenanceReport(id, {
      status: currentStatus === 'Open' ? 'Assigned' : 'Resolved'
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 pt-24 pb-24 font-roboto">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold font-satoshi uppercase tracking-wider text-foreground">Maintenance Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend Chart */}
          <Card className="bg-card border-border text-card-foreground">
            <CardHeader>
              <CardTitle className="font-satoshi uppercase tracking-wider text-base">Issues Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                  <Legend />
                  <Line type="monotone" dataKey="BlockA" stroke="#6C63FF" strokeWidth={2} />
                  <Line type="monotone" dataKey="BlockB" stroke="#4ade80" strokeWidth={2} />
                  <Line type="monotone" dataKey="BlockC" stroke="#f87171" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Block Heatmap (CSS grid simulation) */}
          <Card className="bg-card border-border text-card-foreground">
            <CardHeader>
              <CardTitle className="font-satoshi uppercase tracking-wider text-base">Hostel Block Heatmap</CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex flex-col justify-center">
              <div className="grid grid-cols-3 gap-4 h-full">
                <div className="bg-red-500/40 border border-red-500 rounded-lg flex items-center justify-center font-bold">Block A<br/>High Density</div>
                <div className="bg-yellow-500/40 border border-yellow-500 rounded-lg flex items-center justify-center font-bold">Block B<br/>Medium</div>
                <div className="bg-green-500/40 border border-green-500 rounded-lg flex items-center justify-center font-bold">Block C<br/>Low</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Priority Queue */}
        <div>
          <h2 className="text-2xl font-bold font-satoshi uppercase tracking-wider text-foreground mb-4">Priority Queue</h2>
          <div className="space-y-4">
            {issues.map(issue => (
              <div key={issue.id} className="bg-card p-4 rounded-lg border border-border flex justify-between items-center transition-colors hover:border-primary/50 text-card-foreground">
                <div className="flex items-center space-x-6">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                    ${issue.severity >= 4 ? 'bg-red-500/20 text-red-500' : 
                      issue.severity === 3 ? 'bg-yellow-500/20 text-yellow-500' : 
                      'bg-green-500/20 text-green-500'}`}>
                    {issue.severity}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{issue.location}</h4>
                    <p className="text-muted-foreground text-sm">{issue.issueType} • {issue.description}</p>
                    <p className="text-xs text-primary mt-1">SLA: {issue.estimatedTime}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-3 py-1 rounded text-xs font-bold
                    ${issue.status === 'Open' ? 'bg-red-500/20 text-red-400 border-red-500/50 border' : 
                      issue.status === 'Assigned' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50 border' : 
                      'bg-green-500/20 text-green-400 border-green-500/50 border'}`}>
                    {issue.status}
                  </span>
                  <button 
                    onClick={() => toggleStatus(issue.id, issue.status)}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    {issue.status === 'Open' ? 'Assign Staff' : issue.status === 'Assigned' ? 'Mark Resolved' : 'Reopen'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
