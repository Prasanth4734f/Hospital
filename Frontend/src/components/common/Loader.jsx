import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ fullPage = false, message = 'Loading MediCore...' }) => {
  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
        <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-3 border border-slate-100 max-w-xs text-center">
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <p className="text-sm font-semibold text-slate-800">{message}</p>
          <p className="text-xs text-slate-400">Synchronizing clinical data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      <p className="text-xs font-medium text-slate-500">{message}</p>
    </div>
  );
};

export default Loader;

