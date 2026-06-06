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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>({
    uid: 'mock-user-123',
    email: 'student@campus.edu',
    displayName: 'Mock Student',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);

  const login = (email?: string, password?: string) => {
    setCurrentUser({
      uid: 'mock-user-123',
      email: email || 'student@campus.edu',
      displayName: 'Mock Student',
      role: 'student'
    });
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
