import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'teacher' | 'admin' | Array<'student' | 'teacher' | 'admin'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  // Not logged in → send to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    if (!allowedRoles.includes(currentUser.role)) {
      // Admin trying to access a student route → admin home
      if (currentUser.role === 'admin') {
        return <Navigate to="/admin" replace />;
      }
      // Student / teacher trying to access admin → their home
      return <Navigate to="/dashboard2" replace />;
    }
  }

  return <>{children}</>;
};
