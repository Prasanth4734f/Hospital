import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import { doctorService } from '../../services/doctorService';
import { patientService } from '../../services/patientService';
import { validateAppointmentForm } from '../../utils/validators';
import { useNotificationContext } from '../../context/NotificationContext';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { ArrowLeft, Calendar, Clock, CheckCircle2, RotateCcw, X, AlertCircle } from 'lucide-react';

export const BookAppointment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useNotificationContext();

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Form State
  const [patientId, setPatientId] = useState(searchParams.get('patient_id') || '');
  const [doctorId, setDoctorId] = useState(searchParams.get('doctor_id') || '');
  const [appointmentDate, setAppointmentDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [checkingSlots, setCheckingSlots] = useState(false);
  const [slotsChecked, setSlotsChecked] = useState(false);

  const [appointmentType, setAppointmentType] = useState('General Consultation');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState({});
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const loadPrerequisites = async () => {
      try {
        const [patRes, docRes] = await Promise.all([
          patientService.getPatients(),
          doctorService.getDoctors({ status: 'Active' }),
        ]);
        if (patRes.success) setPatients(patRes.data || []);
        if (docRes.success) setDoctors(docRes.data || []);

        // Pre-select doctor if in query or first in list
        if (!doctorId && docRes.data?.length > 0) {
          setDoctorId(docRes.data[0].id);
        }
      } catch (err) {
        addToast('Failed to load doctors and patients list', 'error');
      } finally {
        setLoadingInitial(false);
      }
    };
    loadPrerequisites();
  }, [addToast, doctorId]);

  // Check Availability explicitly calling GET /api/v1/appointments/availability
  const checkAvailability = async (docIdToUse, dateToUse) => {
    const doc = docIdToUse || doctorId;
    const date = dateToUse || appointmentDate;

    if (!doc || !date) {
      addToast('Please select both a doctor and appointment date to fetch availability', 'warning');
      return;
    }

    try {
      setCheckingSlots(true);
      const res = await appointmentService.getAvailability(doc, date);
      if (res.success && res.data) {
        setAvailableSlots(res.data.slots || []);
        setSlotsChecked(true);
        if (res.data.slots?.length > 0) {
          setSelectedSlot(res.data.slots[0]);
          addToast(`${res.data.slots.length} available slots retrieved from clinical scheduler`, 'success');
        } else {
          setSelectedSlot('');
          addToast('No open slots for this doctor on the selected date', 'warning');
        }
      }
    } catch (err) {
      addToast(err.message || 'Error fetching doctor availability', 'error');
    } finally {
      setCheckingSlots(false);
    }
  };

  const handleClear = () => {
    setPatientId('');
    setSelectedSlot('');
    setAvailableSlots([]);
    setSlotsChecked(false);
    setReason('');
    setNotes('');
    setErrors({});
    addToast('Appointment form reset', 'info');
  };

  const handleBook = async (e) => {
    e.preventDefault();

    const selectedPatient = patients.find((p) => p.id === patientId);
    const selectedDoctor = doctors.find((d) => d.id === doctorId);

    const formData = {
      patient_id: patientId,
      patient_name: selectedPatient?.full_name || '',
      doctor_id: doctorId,
      doctor_name: selectedDoctor?.full_name || '',
      department: selectedDoctor?.specialization || 'General',
      appointment_date: appointmentDate,
      time_slot: selectedSlot,
      appointment_time: selectedSlot,
      appointment_type: appointmentType,
      reason,
      notes,
    };

    const formErrors = validateAppointmentForm(formData);
    if (!slotsChecked || !selectedSlot) {
      formErrors.time_slot = 'You must fetch and select an available time slot.';
    }

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      addToast('Please complete all required fields.', 'warning');
      return;
    }

    try {
      setBooking(true);
      const res = await appointmentService.bookAppointment(formData);
      if (res.success) {
        addToast('Appointment booked successfully.', 'success');
        navigate('/admin/appointments');
      }
    } catch (err) {
      addToast(err.message || 'Failed to book appointment', 'error');
    } finally {
      setBooking(false);
    }
  };

  if (loadingInitial) {
    return <Loader message="Initializing clinical scheduler..." />;
  }

  const selectedDocObj = doctors.find((d) => d.id === doctorId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/appointments')}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Schedule New Appointment</h1>
            <p className="text-xs text-slate-500">Coordinate specialist time and register clinical booking</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            id="btn_clear_appointment_form"
            variant="outline"
            size="sm"
            icon={RotateCcw}
            onClick={handleClear}
          >
            Clear Form
          </Button>
          <Button
            id="btn_cancel_appointment"
            variant="ghost"
            size="sm"
            icon={X}
            onClick={() => navigate('/admin/appointments')}
          >
            Cancel
          </Button>
        </div>
      </div>

      <form onSubmit={handleBook} className="space-y-6">
        {/* Patient Selection Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            1. Select Patient
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Registered Patient <span className="text-rose-500">*</span>
            </label>
            <select
              value={patientId}
              onChange={(e) => {
                setPatientId(e.target.value);
                if (errors.patient_id) setErrors({ ...errors, patient_id: '' });
              }}
              className="w-full bg-white border border-slate-300 rounded-lg py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:border-teal-500"
              required
            >
              <option value="" disabled>-- Choose registered patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.id}) - {p.gender}, {p.age} yrs - {p.phone}
                </option>
              ))}
            </select>
            {errors.patient_id && <p className="text-xs text-rose-600 mt-1">{errors.patient_id}</p>}
          </div>
        </div>

        {/* Doctor and Date Selection Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            2. Doctor & Schedule Verification
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Specialist / Doctor <span className="text-rose-500">*</span>
              </label>
              <select
                value={doctorId}
                onChange={(e) => {
                  setDoctorId(e.target.value);
                  setSlotsChecked(false);
                  setAvailableSlots([]);
                }}
                className="w-full bg-white border border-slate-300 rounded-lg py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:border-teal-500"
                required
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.full_name} - {d.specialization} (${d.consultation_fee})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Appointment Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={appointmentDate}
                onChange={(e) => {
                  setAppointmentDate(e.target.value);
                  setSlotsChecked(false);
                  setAvailableSlots([]);
                }}
                className="w-full bg-white border border-slate-300 rounded-lg py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:border-teal-500"
                required
              />
            </div>
          </div>

          {/* Availability Checker Trigger */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-600">
              {selectedDocObj && (
                <span>
                  <strong>Duty days:</strong> {selectedDocObj.available_days?.join(', ')} |{' '}
                  <strong>Hours:</strong> {selectedDocObj.available_time}
                </span>
              )}
            </div>
            <Button
              id="btn_check_availability"
              type="button"
              variant="teal"
              size="sm"
              icon={Clock}
              loading={checkingSlots}
              onClick={() => checkAvailability(doctorId, appointmentDate)}
            >
              Check Availability
            </Button>
          </div>

          {/* Slots display */}
          {slotsChecked && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Available Time Slots (from Server) <span className="text-rose-500">*</span>
              </label>
              {availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all text-center ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:bg-teal-50/50'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>No available slots for this doctor on the selected date. Please pick another date.</span>
                </div>
              )}
              {errors.time_slot && <p className="text-xs text-rose-600 mt-1">{errors.time_slot}</p>}
            </div>
          )}
        </div>

        {/* Clinical Details Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            3. Visit Specifics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Appointment Type
              </label>
              <select
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:border-teal-500"
              >
                <option value="General Consultation">General Consultation</option>
                <option value="Specialist Follow-up">Specialist Follow-up</option>
                <option value="Routine Checkup">Routine Checkup</option>
                <option value="Emergency Consultation">Emergency Consultation</option>
                <option value="Pre-operative Assessment">Pre-operative Assessment</option>
              </select>
            </div>

            <Input
              id="reason"
              name="reason"
              label="Reason for Visit"
              placeholder="e.g. Chronic joint discomfort, headache"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <Input
            id="notes"
            name="notes"
            label="Additional Notes"
            placeholder="e.g. Wheelchair assistance, bring previous lab scans"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            id="btn_book_appointment"
            type="submit"
            variant="teal"
            icon={Calendar}
            loading={booking}
          >
            Confirm & Book Appointment
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BookAppointment;

