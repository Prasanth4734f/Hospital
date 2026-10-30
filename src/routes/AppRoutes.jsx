import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/constants';

// Layouts
import MainLayout from '../components/layout/MainLayout';
import AuthLayout from '../components/layout/AuthLayout';

// Common Route Guards
import ProtectedRoute from '../components/common/ProtectedRoute';
import RoleBasedRoute from '../components/common/RoleBasedRoute';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard';
import PatientManagement from '../pages/admin/PatientManagement';
import AddPatient from '../pages/admin/AddPatient';
import PatientDetails from '../pages/admin/PatientDetails';
import DoctorManagement from '../pages/admin/DoctorManagement';
import AddDoctor from '../pages/admin/AddDoctor';
import DoctorDetails from '../pages/admin/DoctorDetails';
import Appointments from '../pages/admin/Appointments';
import BookAppointment from '../pages/admin/BookAppointment';
import MedicalRecords from '../pages/admin/MedicalRecords';
import Prescriptions from '../pages/admin/Prescriptions';
import Pharmacy from '../pages/admin/Pharmacy';
import Billing from '../pages/admin/Billing';
import StaffManagement from '../pages/admin/StaffManagement';
import Reports from '../pages/admin/Reports';
import Notifications from '../pages/admin/Notifications';
import Settings from '../pages/admin/Settings';

// Doctor Pages
import DoctorDashboard from '../pages/doctor/Dashboard';
import MyAppointments from '../pages/doctor/MyAppointments';
import MyPatients from '../pages/doctor/MyPatients';
import Consultations from '../pages/doctor/Consultations';
import ConsultationRoom from '../pages/doctor/ConsultationRoom';
import DoctorMedicalRecords from '../pages/doctor/MedicalRecords';
import DoctorPrescriptions from '../pages/doctor/Prescriptions';
import MySchedule from '../pages/doctor/MySchedule';
import DoctorProfile from '../pages/doctor/Profile';

// Receptionist Pages
import ReceptionistDashboard from '../pages/receptionist/Dashboard';
import ReceptionistPatientRegistration from '../pages/receptionist/PatientRegistration';
import ReceptionistPatientDirectory from '../pages/receptionist/PatientDirectory';
import ReceptionistAppointments from '../pages/receptionist/Appointments';
import ReceptionistBookAppointment from '../pages/receptionist/BookAppointment';
import CheckInDesk from '../pages/receptionist/CheckInDesk';
import ReceptionistBilling from '../pages/receptionist/Billing';
import ReceptionistProfile from '../pages/receptionist/Profile';

// Pharmacist Pages
import PharmacistDashboard from '../pages/pharmacist/Dashboard';
import PharmacistInventory from '../pages/pharmacist/Inventory';
import AddMedicine from '../pages/pharmacist/AddMedicine';
import UpdateStock from '../pages/pharmacist/UpdateStock';
import DispenseMedicine from '../pages/pharmacist/DispenseMedicine';
import DispensingHistory from '../pages/pharmacist/DispensingHistory';
import PharmacistProfile from '../pages/pharmacist/Profile';

// Patient Pages
import PatientDashboard from '../pages/patient/Dashboard';
import PatientBookAppointment from '../pages/patient/BookAppointment';
import PatientAppointments from '../pages/patient/MyAppointments';
import PatientMedicalHistory from '../pages/patient/MedicalHistory';
import PatientPrescriptions from '../pages/patient/Prescriptions';
import PatientBilling from '../pages/patient/Billing';
import PatientProfile from '../pages/patient/Profile';

export const AppRoutes = () => {
  const { isAuthenticated, getDashboardRedirect } = useAuth();

  return (
    <Routes>
      {/* Root redirect */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={getDashboardRedirect()} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Public Authentication Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Protected App Routes inside Main Layout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* ========================================================= */}
        {/* HOSPITAL & SUPER ADMIN ROUTES                             */}
        {/* ========================================================= */}
        <Route
          path="/admin/dashboard"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN]}>
              <AdminDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/patients"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST]}>
              <PatientManagement />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/patients/new"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST]}>
              <AddPatient />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/patients/:patientId"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST]}>
              <PatientDetails />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/doctors"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN]}>
              <DoctorManagement />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/doctors/new"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN]}>
              <AddDoctor />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/doctors/:doctorId"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR]}>
              <DoctorDetails />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/appointments"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN]}>
              <Appointments />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/appointments/new"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST]}>
              <BookAppointment />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/medical-records"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR]}>
              <MedicalRecords />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/prescriptions"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN]}>
              <Prescriptions />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/pharmacy"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.PHARMACIST]}>
              <Pharmacy />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/billing"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN]}>
              <Billing />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/staff"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN]}>
              <StaffManagement />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN]}>
              <Reports />
            </RoleBasedRoute>
          }
        />

        {/* ========================================================= */}
        {/* DOCTOR ROUTES                                             */}
        {/* ========================================================= */}
        <Route
          path="/doctor/dashboard"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.DOCTOR, ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN]}>
              <DoctorDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/doctor/appointments"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.DOCTOR, ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN]}>
              <MyAppointments />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/doctor/patients"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.DOCTOR, ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN]}>
              <MyPatients />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/doctor/consultations"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.DOCTOR, ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN]}>
              <Consultations />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/doctor/consultations/:appointmentId"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.DOCTOR, ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN]}>
              <ConsultationRoom />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/doctor/medical-records"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.DOCTOR, ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN]}>
              <DoctorMedicalRecords />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/doctor/prescriptions"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.DOCTOR, ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN]}>
              <DoctorPrescriptions />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/doctor/schedule"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.DOCTOR, ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN]}>
              <MySchedule />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/doctor/profile"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.DOCTOR, ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN]}>
              <DoctorProfile />
            </RoleBasedRoute>
          }
        />

        {/* ========================================================= */}
        {/* RECEPTIONIST ROUTES                                       */}
        {/* ========================================================= */}
        <Route
          path="/reception/dashboard"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.RECEPTIONIST, ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN]}>
              <ReceptionistDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/reception/patient-registration"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.RECEPTIONIST, ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN]}>
              <ReceptionistPatientRegistration />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/reception/patients"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.RECEPTIONIST, ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN]}>
              <ReceptionistPatientDirectory />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/reception/book-appointment"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.RECEPTIONIST, ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN]}>
              <ReceptionistBookAppointment />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/reception/appointments"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.RECEPTIONIST, ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN]}>
              <ReceptionistAppointments />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/reception/check-in"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.RECEPTIONIST, ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN]}>
              <CheckInDesk />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/reception/billing"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.RECEPTIONIST, ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN]}>
              <ReceptionistBilling />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/reception/profile"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.RECEPTIONIST, ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN]}>
              <ReceptionistProfile />
            </RoleBasedRoute>
          }
        />

        {/* ========================================================= */}
        {/* PHARMACIST ROUTES                                         */}
        {/* ========================================================= */}
        <Route
          path="/pharmacy/dashboard"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.PHARMACIST, ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN]}>
              <PharmacistDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/pharmacy/inventory"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.PHARMACIST, ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN]}>
              <PharmacistInventory />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/pharmacy/add-medicine"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.PHARMACIST, ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN]}>
              <AddMedicine />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/pharmacy/update-stock"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.PHARMACIST, ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN]}>
              <UpdateStock />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/pharmacy/dispense"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.PHARMACIST, ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN]}>
              <DispenseMedicine />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/pharmacy/dispensing-history"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.PHARMACIST, ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN]}>
              <DispensingHistory />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/pharmacy/profile"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.PHARMACIST, ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN]}>
              <PharmacistProfile />
            </RoleBasedRoute>
          }
        />

        {/* ========================================================= */}
        {/* PATIENT PORTAL ROUTES                                     */}
        {/* ========================================================= */}
        <Route
          path="/patient/dashboard"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.PATIENT, ROLES.SUPER_ADMIN]}>
              <PatientDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/patient/book-appointment"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.PATIENT, ROLES.SUPER_ADMIN]}>
              <PatientBookAppointment />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/patient/appointments"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.PATIENT, ROLES.SUPER_ADMIN]}>
              <PatientAppointments />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/patient/history"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.PATIENT, ROLES.SUPER_ADMIN]}>
              <PatientMedicalHistory />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/patient/prescriptions"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.PATIENT, ROLES.SUPER_ADMIN]}>
              <PatientPrescriptions />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/patient/billing"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.PATIENT, ROLES.SUPER_ADMIN]}>
              <PatientBilling />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/patient/profile"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.PATIENT, ROLES.SUPER_ADMIN]}>
              <PatientProfile />
            </RoleBasedRoute>
          }
        />

        {/* ========================================================= */}
        {/* COMMON LOGGED-IN ROUTES                                   */}
        {/* ========================================================= */}
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Catch-all Fallback */}
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-surface-muted flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-4xl font-extrabold text-slate-800">404</h1>
            <p className="text-sm text-slate-500 mt-2 mb-6">The requested clinical screen does not exist.</p>
            <a href="/" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold">
              Return to MediCore
            </a>
          </div>
        }
      />
    </Routes>
  );
};

export default AppRoutes;

