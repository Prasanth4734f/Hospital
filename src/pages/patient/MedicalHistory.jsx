import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { patientService } from '../../services/patientService';
import { formatDate } from '../../utils/formatters';
import { FileText, AlertTriangle, Activity } from 'lucide-react';

export const PatientMedicalHistory = () => {
  const { user } = useAuth();
  const patientId = user?.patient_id || 'PAT-1001';

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientService.getPatientById(patientId).then((res) => {
      if (res.success && res.data) setPatient(res.data);
      setLoading(false);
    });
  }, [patientId]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My Medical History</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Electronic medical dossier, chronic clinical conditions, and recorded allergies
        </p>
      </div>

      {patient?.allergies && patient.allergies.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider">
              Documented Drug Allergies
            </h4>
            <p className="text-xs text-rose-700 mt-0.5">{patient.allergies.join(', ')}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-2">
          Clinical Conditions Record
        </h2>
        {patient?.medical_history && patient.medical_history.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {patient.medical_history.map((item, idx) => (
              <div key={idx} className="py-3.5 space-y-1 text-xs">
                <div className="flex justify-between font-bold text-slate-800 text-sm">
                  <span>{item.condition}</span>
                  <span className="text-slate-400 font-normal text-xs">{formatDate(item.date)}</span>
                </div>
                <p className="text-slate-600">{item.notes}</p>
                <p className="text-teal-600 font-medium text-[11px]">Diagnosed by: {item.diagnosed_by}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-6">No past conditions recorded.</p>
        )}
      </div>
    </div>
  );
};

export default PatientMedicalHistory;

