import React from 'react';
import { Outlet } from 'react-router-dom';
import { HeartPulse, ShieldCheck, Activity, Users } from 'lucide-react';
import Toast from '../common/Toast';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Healthcare Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-lg">
            <HeartPulse className="w-8 h-8" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
          Medi<span className="text-teal-400">Core</span>
        </h2>
        <p className="mt-1.5 text-center text-xs text-slate-400 max-w-xs mx-auto">
          One Hospital. One Connected Healthcare Ecosystem.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">
          <Outlet />
        </div>

        {/* Feature Badges Footer */}
        <div className="mt-6 flex items-center justify-center gap-6 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>HIPAA Compliant</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-teal-400" />
            <span>FastAPI v1 Integration</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-teal-400" />
            <span>6 Role Workflows</span>
          </div>
        </div>
      </div>

      <Toast />
    </div>
  );
};

export default AuthLayout;

