import React, { createContext, useContext, useState, ReactNode } from 'react';
import { mockGrievances, mockMaintenanceIssues, mockLostItems, mockFoundItems } from '../lib/mockData';

type Notification = {
  id: string;
  text: string;
  time: string;
  type: 'grievance' | 'maintenance' | 'match' | 'policy';
};

interface CampusOSContextType {
  grievances: any[];
  addGrievance: (grievance: any) => void;
  maintenanceReports: any[];
  addMaintenanceReport: (report: any) => void;
  updateMaintenanceReport: (id: string, updates: any) => void;
  lostItems: any[];
  addLostItem: (item: any) => void;
  foundItems: any[];
  addFoundItem: (item: any) => void;
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
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

  const addGrievance = (grievance: any) => {
    setGrievances((prev) => [grievance, ...prev]);
  };

  const addMaintenanceReport = (report: any) => {
    setMaintenanceReports((prev) => [report, ...prev]);
  };

  const updateMaintenanceReport = (id: string, updates: any) => {
    setMaintenanceReports((prev) => 
      prev.map(r => r.id === id ? { ...r, ...updates } : r)
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

  return (
    <CampusOSContext.Provider
      value={{
        grievances,
        addGrievance,
        maintenanceReports,
        addMaintenanceReport,
        updateMaintenanceReport,
        lostItems,
        addLostItem,
        foundItems,
        addFoundItem,
        notifications,
        addNotification,
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
