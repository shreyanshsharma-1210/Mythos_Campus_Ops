import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { mockGrievances, mockMaintenanceIssues, mockLostItems, mockFoundItems } from '../lib/mockData';

const API = '/api/store';
const POLL_MS = 5000;

type Notification = {
  id: string;
  text: string;
  time: string;
  type: 'grievance' | 'maintenance' | 'match' | 'policy';
};

export interface PolicyDoc {
  id: string;
  name: string;
  pages: number;
  active: boolean;
  uploadedAt: string;
  queryCount: number;
  text: string;
}

interface CampusOpsContextType {
  grievances: any[];
  addGrievance: (grievance: any) => void;
  updateGrievanceStatus: (id: string, status: string) => void;
  maintenanceReports: any[];
  addMaintenanceReport: (report: any) => void;
  updateMaintenanceReport: (id: string, updates: any) => void;
  updateMaintenanceStatus: (id: string, status: string) => void;
  lostItems: any[];
  addLostItem: (item: any) => void;
  foundItems: any[];
  addFoundItem: (item: any) => void;
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  policyDocuments: PolicyDoc[];
  addPolicyDocument: (doc: PolicyDoc) => void;
  removePolicyDocument: (id: string) => void;
  togglePolicyDocumentActive: (id: string) => void;
}

// ── localStorage helpers (used as fast local cache only) ──────────────────────
const lsGet = (key: string, fallback: any) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};
const lsSet = (key: string, value: any) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore quota */ }
};

// ── Simple fetch helpers ──────────────────────────────────────────────────────
async function apiFetch<T>(path: string): Promise<T | null> {
  try {
    const r = await fetch(API + path);
    if (!r.ok) return null;
    return r.json();
  } catch {
    return null;
  }
}
async function apiPost(path: string, body: any) {
  try {
    await fetch(API + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch { /* offline — localStorage still has it */ }
}
async function apiPatch(path: string, body: any) {
  try {
    await fetch(API + path, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch { /* offline */ }
}

const DEFAULT_NOTIFICATIONS: Notification[] = [
  { id: '1', text: 'AI flagged critical water leak in Block B', time: '2m ago', type: 'maintenance' },
  { id: '2', text: 'Lost Blue Bottle matched with 87% confidence', time: '15m ago', type: 'match' },
  { id: '3', text: 'New grievance auto-assigned to IT Dept', time: '1h ago', type: 'grievance' },
  { id: '4', text: 'Policy Navigator answered 10 queries on Hostel Rules', time: '2h ago', type: 'policy' },
];

const DEFAULT_POLICY_DOCS: PolicyDoc[] = [
  {
    id: "d1", name: "Hostel Rules 2025.pdf", pages: 47, active: true,
    uploadedAt: "2026-06-01", queryCount: 203,
    text: "Hostel Accommodation rules. Over-night guests are allowed only with prior written permission from the warden. Air conditioners (AC) are not permitted in standard hostel rooms. Late fee fine is ₹500 for payments after the 10th of every month. Attendance shortage appeals must be submitted within 3 days to the Dean's office.",
  },
  {
    id: "d2", name: "Exam Policy.pdf", pages: 23, active: true,
    uploadedAt: "2026-06-01", queryCount: 89,
    text: "Exam eligibility requirement: Minimum attendance of 75% is strictly mandatory to appear in examinations. Students with CGPA below 5.0 will be put on academic probation. If you fail one subject, you can write the supplementary exam in the next semester.",
  },
  {
    id: "d3", name: "Fee Structure 2026.pdf", pages: 8, active: true,
    uploadedAt: "2026-06-01", queryCount: 61,
    text: "Fees structure: Academic tuition fee is ₹1,20,000 per annum. Late fee of ₹100 per day is charged for delays up to 15 days, after which a flat late fee of ₹2000 is applied.",
  },
  {
    id: "d4", name: "Disciplinary Guide.pdf", pages: 15, active: false,
    uploadedAt: "2026-05-15", queryCount: 12,
    text: "Disciplinary guide: Ragging is strictly prohibited on campus. Smoking, alcohol, or any substance abuse will result in immediate suspension from hostel and college.",
  },
];

const CampusOpsContext = createContext<CampusOpsContextType | undefined>(undefined);

export function CampusOpsProvider({ children }: { children: ReactNode }) {
  // Initialise from localStorage so the UI isn't blank while waiting for the server
  const [grievances, setGrievances] = useState<any[]>(() => lsGet('campusops_grievances', mockGrievances));
  const [maintenanceReports, setMaintenanceReports] = useState<any[]>(() => lsGet('campusops_maintenance', mockMaintenanceIssues));
  const [lostItems, setLostItems] = useState<any[]>(() => lsGet('campusops_lost_items', mockLostItems));
  const [foundItems, setFoundItems] = useState<any[]>(() => lsGet('campusops_found_items', mockFoundItems));
  const [notifications, setNotifications] = useState<Notification[]>(() => lsGet('campusops_notifications', DEFAULT_NOTIFICATIONS));
  const [policyDocuments, setPolicyDocuments] = useState<PolicyDoc[]>(() => lsGet('campusops_policy_docs', DEFAULT_POLICY_DOCS));

  const seededRef = useRef(false);

  // ── Pull latest state from server ─────────────────────────────────────────
  const syncFromServer = async () => {
    const [g, m, l, f, n] = await Promise.all([
      apiFetch<any[]>('/grievances'),
      apiFetch<any[]>('/maintenance'),
      apiFetch<any[]>('/lost-items'),
      apiFetch<any[]>('/found-items'),
      apiFetch<any[]>('/notifications'),
    ]);

    if (g  && g.length  > 0) { setGrievances(g);         lsSet('campusops_grievances', g); }
    if (m  && m.length  > 0) { setMaintenanceReports(m); lsSet('campusops_maintenance', m); }
    if (l  && l.length  > 0) { setLostItems(l);          lsSet('campusops_lost_items', l); }
    if (f  && f.length  > 0) { setFoundItems(f);         lsSet('campusops_found_items', f); }
    if (n  && n.length  > 0) { setNotifications(n);      lsSet('campusops_notifications', n); }
  };

  // ── Seed server on first load, then start polling ────────────────────────
  useEffect(() => {
    const init = async () => {
      // Check if server already has data
      const status = await apiFetch<{ seeded: boolean }>('/status');

      if (!status?.seeded) {
        // Push local mock data to server so it's pre-populated
        await apiPost('/seed', {
          grievances: lsGet('campusops_grievances', mockGrievances),
          maintenanceReports: lsGet('campusops_maintenance', mockMaintenanceIssues),
          lostItems: lsGet('campusops_lost_items', mockLostItems),
          foundItems: lsGet('campusops_found_items', mockFoundItems),
          notifications: lsGet('campusops_notifications', DEFAULT_NOTIFICATIONS),
        });
        seededRef.current = true;
      } else {
        // Server already has data — pull it
        await syncFromServer();
        seededRef.current = true;
      }
    };

    init();

    // Poll every POLL_MS to stay in sync across tabs/users
    const interval = setInterval(syncFromServer, POLL_MS);
    return () => clearInterval(interval);
  }, []);

  // ── Keep localStorage in sync whenever state changes ────────────────────
  useEffect(() => { lsSet('campusops_grievances',   grievances); },       [grievances]);
  useEffect(() => { lsSet('campusops_maintenance',  maintenanceReports); }, [maintenanceReports]);
  useEffect(() => { lsSet('campusops_lost_items',   lostItems); },         [lostItems]);
  useEffect(() => { lsSet('campusops_found_items',  foundItems); },        [foundItems]);
  useEffect(() => { lsSet('campusops_notifications', notifications); },    [notifications]);
  useEffect(() => { lsSet('campusops_policy_docs',  policyDocuments); },   [policyDocuments]);

  // ── Mutations — update local state immediately, persist to server async ──
  const addGrievance = (grievance: any) => {
    setGrievances((prev) => [grievance, ...prev.filter((g) => g.id !== grievance.id)]);
    apiPost('/grievances', grievance);
  };

  const updateGrievanceStatus = (id: string, status: string) => {
    setGrievances((prev) => prev.map((g) => g.id === id ? { ...g, status } : g));
    apiPatch(`/grievances/${id}`, { status });
  };

  const addMaintenanceReport = (report: any) => {
    setMaintenanceReports((prev) => [report, ...prev.filter((r) => r.id !== report.id)]);
    apiPost('/maintenance', report);
  };

  const updateMaintenanceReport = (id: string, updates: any) => {
    setMaintenanceReports((prev) => prev.map((r) => r.id === id ? { ...r, ...updates } : r));
    apiPatch(`/maintenance/${id}`, updates);
  };

  const updateMaintenanceStatus = (id: string, status: string) => {
    setMaintenanceReports((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    apiPatch(`/maintenance/${id}`, { status });
  };

  const addLostItem = (item: any) => {
    setLostItems((prev) => [item, ...prev.filter((i) => i.id !== item.id)]);
    apiPost('/lost-items', item);
  };

  const addFoundItem = (item: any) => {
    setFoundItems((prev) => [item, ...prev.filter((i) => i.id !== item.id)]);
    apiPost('/found-items', item);
  };

  const addNotification = (notif: Omit<Notification, 'id'>) => {
    const full: Notification = { ...notif, id: Date.now().toString() };
    setNotifications((prev) => [full, ...prev]);
    apiPost('/notifications', full);
  };

  const addPolicyDocument = (doc: PolicyDoc) => {
    setPolicyDocuments((prev) => [...prev, doc]);
  };

  const removePolicyDocument = (id: string) => {
    setPolicyDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const togglePolicyDocumentActive = (id: string) => {
    setPolicyDocuments((prev) => prev.map((d) => d.id === id ? { ...d, active: !d.active } : d));
  };

  return (
    <CampusOpsContext.Provider value={{
      grievances, addGrievance, updateGrievanceStatus,
      maintenanceReports, addMaintenanceReport, updateMaintenanceReport, updateMaintenanceStatus,
      lostItems, addLostItem,
      foundItems, addFoundItem,
      notifications, addNotification,
      policyDocuments, addPolicyDocument, removePolicyDocument, togglePolicyDocumentActive,
    }}>
      {children}
    </CampusOpsContext.Provider>
  );
}

export function useCampusOps() {
  const context = useContext(CampusOpsContext);
  if (!context) throw new Error('useCampusOps must be used within a CampusOpsProvider');
  return context;
}
