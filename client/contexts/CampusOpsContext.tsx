import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

const getLocalStorageItem = (key: string, defaultValue: any) => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

const CampusOpsContext = createContext < CampusOpsContextType | undefined > (undefined);

export function CampusOpsProvider({ children }: { children: ReactNode }) {
  const [grievances, setGrievances] = useState<any[]>(() =>
    getLocalStorageItem('campusops_grievances', mockGrievances)
  );
  const [maintenanceReports, setMaintenanceReports] = useState<any[]>(() =>
    getLocalStorageItem('campusops_maintenance', mockMaintenanceIssues)
  );
  const [lostItems, setLostItems] = useState<any[]>(() =>
    getLocalStorageItem('campusops_lost_items', mockLostItems)
  );
  const [foundItems, setFoundItems] = useState<any[]>(() =>
    getLocalStorageItem('campusops_found_items', mockFoundItems)
  );
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    getLocalStorageItem('campusops_notifications', [
      { id: '1', text: 'AI flagged critical water leak in Block B', time: '2m ago', type: 'maintenance' },
      { id: '2', text: 'Lost Blue Bottle matched with 87% confidence', time: '15m ago', type: 'match' },
      { id: '3', text: 'New grievance auto-assigned to IT Dept', time: '1h ago', type: 'grievance' },
      { id: '4', text: 'Policy Navigator answered 10 queries on Hostel Rules', time: '2h ago', type: 'policy' },
    ])
  );

  const [policyDocuments, setPolicyDocuments] = useState<PolicyDoc[]>(() =>
    getLocalStorageItem('campusops_policy_documents', [
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
    ])
  );

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('campusops_grievances', JSON.stringify(grievances));
  }, [grievances]);

  useEffect(() => {
    localStorage.setItem('campusops_maintenance', JSON.stringify(maintenanceReports));
  }, [maintenanceReports]);

  useEffect(() => {
    localStorage.setItem('campusops_lost_items', JSON.stringify(lostItems));
  }, [lostItems]);

  useEffect(() => {
    localStorage.setItem('campusops_found_items', JSON.stringify(foundItems));
  }, [foundItems]);

  useEffect(() => {
    localStorage.setItem('campusops_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('campusops_policy_documents', JSON.stringify(policyDocuments));
  }, [policyDocuments]);

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
    <CampusOpsContext.Provider
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
    </CampusOpsContext.Provider>
  );
}

export function useCampusOps() {
  const context = useContext(CampusOpsContext);
  if (!context) {
    throw new Error('useCampusOps must be used within a CampusOpsProvider');
  }
  return context;
}
