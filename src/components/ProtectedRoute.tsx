import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { currentUser, isLoading } = useStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-base">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest opacity-40 animate-pulse">Verifying Access...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    // Redirect to login but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-base px-6">
        <div className="max-w-md w-full glass-card p-12 text-center space-y-6">
          <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-bold">Access Denied</h1>
            <p className="opacity-50 text-sm">
              You do not have the required permissions to access the admin dashboard. 
              Please contact the system administrator if you believe this is an error.
            </p>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="btn-primary w-full"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
