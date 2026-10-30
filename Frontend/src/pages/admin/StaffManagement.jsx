import React, { useState } from 'react';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useNotificationContext } from '../../context/NotificationContext';
import { Users, Plus, ShieldCheck, Mail, Phone } from 'lucide-react';

export const StaffManagement = () => {
  const { addToast } = useNotificationContext();

  const [staff, setStaff] = useState([
    {
      id: 'STF-101',
      full_name: 'Emma Watson',
      role: 'RECEPTIONIST',
      department: 'Front Desk & Patient Intake',
      email: 'reception@medicore.com',
      phone: '+1 555-019-3382',
      status: 'Active',
      joined_date: '2025-04-10',
    },
    {
      id: 'STF-102',
      full_name: 'Alex Morgan',
      role: 'PHARMACIST',
      department: 'Central Hospital Dispensary',
      email: 'pharmacy@medicore.com',
      phone: '+1 555-019-4491',
      status: 'Active',
      joined_date: '2025-06-18',
    },
    {
      id: 'STF-103',
      full_name: 'Dr. Gregory House',
      role: 'HOSPITAL_ADMIN',
      department: 'Executive Administration',
      email: 'admin@medicore.com',
      phone: '+1 555-019-1100',
      status: 'Active',
      joined_date: '2024-01-15',
    },
    {
      id: 'STF-104',
      full_name: 'Nurse Clara Dupont',
      role: 'HEAD_NURSE',
      department: 'Inpatient Care Unit',
      email: 'clara.dupont@medicore.com',
      phone: '+1 555-019-5523',
      status: 'Active',
      joined_date: '2025-08-01',
    },
  ]);

  const [search, setSearch] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    full_name: '',
    role: 'RECEPTIONIST',
    department: 'Front Desk',
    email: '',
    phone: '',
  });

  const handleAddStaff = (e) => {
    e.preventDefault();
    const newEntry = {
      id: `STF-${Math.floor(100 + Math.random() * 900)}`,
      status: 'Active',
      joined_date: new Date().toISOString().split('T')[0],
      ...newStaff,
    };
    setStaff([newEntry, ...staff]);
    addToast('Staff member onboarded successfully', 'success');
    setAddModalOpen(false);
  };

  const filteredStaff = staff.filter(
    (s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'id',
      header: 'Staff ID',
      render: (s) => <span className="font-semibold text-primary">{s.id}</span>,
    },
    {
      key: 'full_name',
      header: 'Staff Member',
      render: (s) => (
        <div>
          <div className="font-semibold text-slate-800">{s.full_name}</div>
          <div className="text-[11px] text-slate-400">{s.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Assigned Role',
      render: (s) => (
        <span className="font-mono text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
          {s.role}
        </span>
      ),
    },
    {
      key: 'department',
      header: 'Department / Unit',
    },
    {
      key: 'phone',
      header: 'Phone',
    },
    {
      key: 'joined_date',
      header: 'Join Date',
    },
    {
      key: 'status',
      header: 'Status',
      render: (s) => <StatusBadge status={s.status} />,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Staff & Access Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Hospital operational staff, department assignments, and system permission roles
          </p>
        </div>

        <Button variant="primary" size="sm" icon={Plus} onClick={() => setAddModalOpen(true)}>
          Add Staff Member
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by staff name, email, department, or role..."
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredStaff}
        emptyTitle="No Staff Members Found"
      />

      {/* Add Staff Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Staff Member"
      >
        <form onSubmit={handleAddStaff} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. John Doe"
            value={newStaff.full_name}
            onChange={(e) => setNewStaff({ ...newStaff, full_name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Role"
              value={newStaff.role}
              onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
              options={['RECEPTIONIST', 'PHARMACIST', 'HEAD_NURSE', 'LAB_TECHNICIAN', 'HOSPITAL_ADMIN']}
            />
            <Input
              label="Department"
              placeholder="e.g. Reception Desk"
              value={newStaff.department}
              onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Staff Email"
              type="email"
              value={newStaff.email}
              onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
              required
            />
            <Input
              label="Phone"
              value={newStaff.phone}
              onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
              required
            />
          </div>
          <div className="pt-3 flex justify-end gap-2 border-t">
            <Button variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Staff Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StaffManagement;

