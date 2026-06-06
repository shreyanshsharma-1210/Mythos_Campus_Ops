import React, { createContext, useContext, useState, ReactNode } from 'react';
import { mockGrievances, mockMaintenanceIssues, mockLostItems, mockFoundItems } from '../lib/mockData';

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

interface CampusOSContextType {
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

const CampusOSContext = createContext<CampusOSContextType | undefined>(undefined);

export function CampusOSProvider({ children }: { children: ReactNode }) {
  const [grievances, setGrievances] = useState<any[]>(mockGrievances);
  const [maintenanceReports, setMaintenanceReports] = useState<any[]>(mockMaintenanceIssues);
  const [lostItems, setLostItems] = useState<any[]>(mockLostItems);
  const [foundItems, setFoundItems] = useState<any[]>(mockFoundItems);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', text: 'AI flagged critical water leak in Block B', time: '2m ago', type: 'maintenance' },
    { id: '2', text: 'Lost Blue Bottle matched with 87% confidence', time: '15m ago', type: 'match' },
    { id: '3', text: 'New grievance auto-assigned to IT Dept', time: '1h ago', type: 'grievance' },
    { id: '4', text: 'Policy Navigator answered 10 queries on Hostel Rules', time: '2h ago', type: 'policy' },
  ]);

  const [policyDocuments, setPolicyDocuments] = useState<PolicyDoc[]>([
    {
      id: "d1",
      name: "Hostel Rules 2025.pdf",
      pages: 47,
      active: true,
      uploadedAt: "2026-06-01",
      queryCount: 203,
      text: "Hostel Accommodation rules. Over-night guests are allowed only with prior written permission from the warden. Air conditioners (AC) are not permitted in standard hostel rooms. Late fee fine is ₹500 for payments after the 10th of every month. Attendance shortage appeals must be submitted within 3 days to the Dean's office."
    },
    {
      id: "d2",
      name: "Exam Policy.pdf",
      pages: 23,
      active: true,
      uploadedAt: "2026-06-01",
      queryCount: 89,
      text: "Exam eligibility requirement: Minimum attendance of 75% is strictly mandatory to appear in examinations. Students with CGPA below 5.0 will be put on academic probation. If you fail one subject, you can write the supplementary exam in the next semester."
    },
    {
      id: "d3",
      name: "Fee Structure 2026.pdf",
      pages: 8,
      active: true,
      uploadedAt: "2026-06-01",
      queryCount: 61,
      text: "Fees structure: Academic tuition fee is ₹1,20,000 per annum. Late fee of ₹100 per day is charged for delays up to 15 days, after which a flat late fee of ₹2000 is applied."
    },
    {
      id: "d4",
      name: "Disciplinary Guide.pdf",
      pages: 15,
      active: false,
      uploadedAt: "2026-05-15",
      queryCount: 12,
      text: "Disciplinary guide: Ragging is strictly prohibited on campus. Smoking, alcohol, or any substance abuse will result in immediate suspension from hostel and college."
    }
  ]);

  const addGrievance = (grievance: any) => {
    setGrievances((prev) => [grievance, ...prev]);
  };

  const updateGrievanceStatus = (id: string, status: string) => {
    setGrievances((prev) =>
      prev.map(g => g.id === id ? { ...g, status } : g)
    );
  };

  const addMaintenanceReport = (report: any) => {
    setMaintenanceReports((prev) => [report, ...prev]);
  };

  const updateMaintenanceReport = (id: string, updates: any) => {
    setMaintenanceReports((prev) => 
      prev.map(r => r.id === id ? { ...r, ...updates } : r)
    );
  };

  const updateMaintenanceStatus = (id: string, status: string) => {
    setMaintenanceReports((prev) =>
      prev.map(r => r.id === id ? { ...r, status } : r)
    );
  };

  const addLostItem = (item: any) => {
    setLostItems((prev) => [item, ...prev]);
  };

  const addFoundItem = (item: any) => {
    setFoundItems((prev) => [item, ...prev]);
  };

  const addNotification = (notif: Omit<Notification, 'id'>) => {
    setNotifications((prev) => [
      { ...notif, id: Date.now().toString() },
      ...prev,
    ]);
  };

  const addPolicyDocument = (doc: PolicyDoc) => {
    setPolicyDocuments((prev) => [...prev, doc]);
  };

  const removePolicyDocument = (id: string) => {
    setPolicyDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const togglePolicyDocumentActive = (id: string) => {
    setPolicyDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, active: !d.active } : d))
    );
  };

  return (
    <CampusOSContext.Provider
      value={{
        grievances,
        addGrievance,
        updateGrievanceStatus,
        maintenanceReports,
        addMaintenanceReport,
        updateMaintenanceReport,
        updateMaintenanceStatus,
        lostItems,
        addLostItem,
        foundItems,
        addFoundItem,
        notifications,
        addNotification,
        policyDocuments,
        addPolicyDocument,
        removePolicyDocument,
        togglePolicyDocumentActive,
      }}
    >
      {children}
    </CampusOSContext.Provider>
  );
}

export function useCampusOS() {
  const context = useContext(CampusOSContext);
  if (!context) {
    throw new Error('useCampusOS must be used within a CampusOSProvider');
  }
  return context;
}
