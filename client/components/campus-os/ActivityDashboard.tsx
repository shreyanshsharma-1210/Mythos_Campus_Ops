
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flag, Wrench, Search, GraduationCap,
  AlertTriangle, CheckCircle2, Clock, ArrowUpRight, ShieldAlert
} from 'lucide-react';
import CampusMap from './CampusMap';
import { HunterStats, Buff } from '../../types/campus-os';

interface ActivityDashboardProps {
  onStatUpdate: (stat: keyof HunterStats, amount: number) => void;
  onAddBuff: (buff: Buff) => void;
}

const attendanceData = [
  { subject: 'Data Structures', pct: 82, credits: 4 },
  { subject: 'Operating Systems', pct: 68, credits: 3 },
  { subject: 'DBMS', pct: 91, credits: 4 },
  { subject: 'Computer Networks', pct: 73, credits: 3 },
];

const grievanceData = [
  { id: 'GRV-041', title: 'Hostel water supply issue', status: 'In Review', days: 2 },
  { id: 'GRV-038', title: 'Incorrect grade recorded', status: 'Resolved', days: 5 },
  { id: 'GRV-035', title: 'Library printer not working', status: 'Pending', days: 1 },
];

const lostFoundData = [
  { id: 'LF-019', item: 'Black Laptop Bag', match: 94, location: 'Main Library', time: '2h ago' },
  { id: 'LF-017', item: 'Student ID Card', match: 78, location: 'Canteen Block B', time: '5h ago' },
  { id: 'LF-015', item: 'Casio Calculator', match: 61, location: 'Lab Complex 3', time: '1d ago' },
];

const statusBadge = (status: string) => {
  if (status === 'Resolved') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (status === 'In Review') return 'text-blue-700 bg-blue-50 border-blue-200';
  return 'text-amber-700 bg-amber-50 border-amber-200';
};

const matchColor = (pct: number) => {
  if (pct >= 85) return { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' };
  if (pct >= 70) return { bg: '#fffbeb', text: '#92400e', border: '#fde68a' };
  return { bg: '#fff1f2', text: '#9f1239', border: '#fecdd3' };
};

const ActivityDashboard: React.FC<ActivityDashboardProps> = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-8 w-full animate-[fadeInUp_0.8s_ease-out_0.2s_both]">

      {/* Section Header */}
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <h2 className="text-xs font-semibold text-muted-foreground tracking-widest uppercase px-2">
          Campus Intel — Live
        </h2>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* 4 Campus Intel Cards */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* [ATT] ATTENDANCE RADAR */}
          <div
            onClick={() => navigate('/attendance')}
            className="flex flex-col h-64 bg-white border border-border hover:border-blue-300 hover:shadow-md rounded-2xl cursor-pointer transition-all group overflow-hidden"
          >
            <div className="px-5 pt-4 pb-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <span className="text-xs font-semibold text-slate-700">Attendance Radar</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3 custom-scrollbar">
              {attendanceData.map((s) => {
                const low = s.pct < 75;
                return (
                  <div key={s.subject} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-600 truncate max-w-[68%]">{s.subject}</span>
                      <span className={`text-xs font-bold ${low ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {s.pct}%{low ? ' ⚠' : ''}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${s.pct}%`, backgroundColor: low ? '#f43f5e' : '#10b981' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* [GRV] GRIEVANCE TRACKER */}
          <div
            onClick={() => navigate('/grievances/dashboard')}
            className="flex flex-col h-64 bg-white border border-border hover:border-rose-300 hover:shadow-md rounded-2xl cursor-pointer transition-all group overflow-hidden"
          >
            <div className="px-5 pt-4 pb-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center">
                  <Flag className="w-3.5 h-3.5 text-rose-600" />
                </div>
                <span className="text-xs font-semibold text-slate-700">Grievance Tracker</span>
              </div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                {grievanceData.filter(g => g.status !== 'Resolved').length} Open
              </span>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3 custom-scrollbar">
              {grievanceData.map((g) => (
                <div key={g.id} className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">
                    {g.status === 'Resolved'
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      : <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 font-medium truncate">{g.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${statusBadge(g.status)}`}>{g.status}</span>
                      <span className="text-[10px] text-slate-400">{g.id} · {g.days}d ago</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* [LFR] LOST & FOUND RADAR */}
          <div
            onClick={() => navigate('/lost-found')}
            className="flex flex-col h-64 bg-white border border-border hover:border-amber-300 hover:shadow-md rounded-2xl cursor-pointer transition-all group overflow-hidden"
          >
            <div className="px-5 pt-4 pb-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Search className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <span className="text-xs font-semibold text-slate-700">Lost &amp; Found Radar</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                {lostFoundData.length} Matches
              </span>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3 custom-scrollbar">
              {lostFoundData.map((item) => {
                const mc = matchColor(item.match);
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 border"
                      style={{ backgroundColor: mc.bg, color: mc.text, borderColor: mc.border }}
                    >
                      {item.match}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700 font-medium truncate">{item.item}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.location} · {item.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* [SAF] Anti-Ragging + [MNT] Maintenance split card */}
          <div className="flex flex-col h-64 bg-white border border-border rounded-2xl overflow-hidden">
            {/* Anti-Ragging */}
            <div
              onClick={() => navigate('/anti-ragging')}
              className="flex-1 flex flex-col justify-between px-5 py-4 border-b border-border cursor-pointer group hover:bg-rose-50/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-rose-50 flex items-center justify-center">
                    <ShieldAlert className="w-3 h-3 text-rose-600" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">Anti-Ragging Vault</span>
                </div>
                <span className="text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">Anonymous</span>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-2">Report harassment directly to the disciplinary committee.</p>
                <span className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1.5 group-hover:gap-2 transition-all">
                  Submit Report <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            {/* Maintenance Quick Report */}
            <div
              onClick={() => navigate('/maintenance/report')}
              className="flex-1 flex flex-col justify-between px-5 py-4 cursor-pointer group hover:bg-blue-50/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center">
                    <Wrench className="w-3 h-3 text-blue-600" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">Report Facility Issue</span>
                </div>
                <Clock className="w-3.5 h-3.5 text-slate-300" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-2">AI-triage scores severity and routes to the right staff.</p>
                <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1 mt-1.5 group-hover:gap-2 transition-all">
                  File Report <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Campus Map */}
        <div className="lg:col-span-4">
          <CampusMap className="h-full min-h-[500px]" />
        </div>

      </div>
    </div>
  );
};

export default ActivityDashboard;
