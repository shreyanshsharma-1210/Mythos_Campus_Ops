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
  login: (email?: string, password?: string) => Promise<void> | void;
  signup: (email?: string, password?: string, name?: string, role?: "teacher" | "student" | "admin") => Promise<void> | void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>({
    uid: 'mock-user-123',
    email: 'student@campus.edu',
    displayName: 'Mock Student',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);

  const login = async (email?: string, password?: string) => {
    setCurrentUser({
      uid: 'mock-user-123',
      email: email || 'student@campus.edu',
      displayName: 'Mock Student',
      role: 'student'
    });
  };

  const signup = async (email?: string, password?: string, name?: string, role?: "teacher" | "student" | "admin") => {
    setCurrentUser({
      uid: 'mock-user-123',
      email: email || 'student@campus.edu',
      displayName: name || 'Mock Student',
      role: role || 'student'
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
