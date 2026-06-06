import React, { createContext, useContext, useState, ReactNode } from 'react';

// Mock Auth Context without Firebase
interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'student' | 'teacher' | 'admin';
  photoURL?: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email?: string, password?: string) => void;
  signup: (email?: string, password?: string, displayName?: string, role?: 'student' | 'teacher' | 'admin') => void;
  logout: () => void;
}

// ── Mock credentials ──────────────────────────────────────────────────────────
const MOCK_USERS: Array<{ email: string; password: string; uid: string; displayName: string; role: 'student' | 'teacher' | 'admin' }> = [
  { email: 'student@campus.edu',  password: 'password123', uid: 'mock-student-001', displayName: 'Alex Student',  role: 'student' },
  { email: 'admin@campus.edu',    password: 'admin123',    uid: 'mock-admin-001',   displayName: 'Admin User',    role: 'admin'   },
  { email: 'teacher@campus.edu',  password: 'teacher123',  uid: 'mock-teacher-001', displayName: 'Dr. Teacher',   role: 'teacher' },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Start with no logged-in user — user must go through login
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = (email?: string, password?: string) => {
    // Try to match mock credentials
    const matched = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (matched) {
      setCurrentUser({
        uid: matched.uid,
        email: matched.email,
        displayName: matched.displayName,
        role: matched.role,
      });
    } else {
      // Fallback: if no match, still allow login as student (legacy behaviour)
      setCurrentUser({
        uid: 'mock-user-123',
        email: email || 'student@campus.edu',
        displayName: 'Mock Student',
        role: 'student',
      });
    }
  };

  const signup = (
    email?: string,
    password?: string,
    displayName?: string,
    role?: 'student' | 'teacher' | 'admin'
  ) => {
    setCurrentUser({
      uid: 'mock-user-123',
      email: email || 'student@campus.edu',
      displayName: displayName || 'Mock User',
      role: role || 'student',
    });
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, signup, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
