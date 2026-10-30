import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loader from './Loader';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Button from './Button';

export const RoleBasedRoute = ({ allowedRoles = [], children }) => {
  const { user, role, loading, getDashboardRedirect } = useAuth();

  if (loading) {
    return <Loader fullPage message="Verifying role permissions..." />;
  }

  if (!role || !allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen bg-surface-muted flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h1>
        <p className="text-sm text-slate-500 max-w-md mb-6">
          Your current account role <span className="font-semibold text-slate-700">[{role || 'Unknown'}]</span> is not authorized to access this section of the MediCore clinical ecosystem.
        </p>
        <Link to={getDashboardRedirect()}>
          <Button variant="primary" icon={ArrowLeft}>
            Return to Authorized Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return children;
};

export default RoleBasedRoute;

