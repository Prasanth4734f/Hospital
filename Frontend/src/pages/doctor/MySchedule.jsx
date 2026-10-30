import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { doctorService } from '../../services/doctorService';
import { useNotificationContext } from '../../context/NotificationContext';
import Button from '../../components/common/Button';
import { Clock, Calendar, CheckCircle2 } from 'lucide-react';

export const MySchedule = () => {
  const { user } = useAuth();
  const { addToast } = useNotificationContext();

  const [availableDays, setAvailableDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday']);
  const [shiftHours, setShiftHours] = useState('09:00 AM - 02:00 PM');
  const [saving, setSaving] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleDay = (day) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter((d) => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      addToast('Duty schedule and consultation hours updated successfully', 'success');
    }, 400);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My Consultation Schedule</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure clinical shift hours and recurring working days
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Rostered Working Days
          </label>
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.map((day) => {
              const selected = availableDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all ${
                    selected
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Shift Consultation Hours
          </label>
          <input
            type="text"
            value={shiftHours}
            onChange={(e) => setShiftHours(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <Button variant="teal" size="sm" loading={saving} onClick={handleSave}>
            Save Availability Schedule
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MySchedule;

