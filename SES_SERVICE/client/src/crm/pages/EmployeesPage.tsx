import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/crmApi';

interface Employee {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  department?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

const EmployeesPage: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'sales_agent',
    phone: '',
    department: '',
  });

  const fetchEmployees = async () => {
    setLoading(true);
    const res = await authApi.getUsers({ search: searchQuery, role: roleFilter });
    if (res.success && res.data) {
      setEmployees(res.data.users || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, [searchQuery, roleFilter]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () => {
    setForm({ name: '', email: '', password: '', role: 'sales_agent', phone: '', department: '' });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editId) {
      const { password, ...updateData } = form;
      const res = await authApi.updateUser(editId, updateData);
      if (res.success) {
        showToast('Employee updated successfully', 'success');
        fetchEmployees();
        resetForm();
      } else {
        showToast(res.message || 'Failed to update', 'error');
      }
    } else {
      const res = await authApi.register(form);
      if (res.success) {
        showToast('Employee registered successfully', 'success');
        fetchEmployees();
        resetForm();
      } else {
        showToast(res.message || 'Failed to register', 'error');
      }
    }
  };

  const handleEdit = (emp: Employee) => {
    setForm({
      name: emp.name,
      email: emp.email,
      password: '',
      role: emp.role,
      phone: emp.phone || '',
      department: emp.department || '',
    });
    setEditId(emp._id);
    setShowForm(true);
  };

  const handleToggleActive = async (emp: Employee) => {
    const res = await authApi.updateUser(emp._id, { isActive: !emp.isActive });
    if (res.success) {
      showToast(`Employee ${emp.isActive ? 'deactivated' : 'activated'}`, 'success');
      fetchEmployees();
    }
  };

  const handleDelete = async (emp: Employee) => {
    if (!confirm(`Are you sure you want to delete ${emp.name}?`)) return;
    const res = await authApi.deleteUser(emp._id);
    if (res.success) {
      showToast('Employee deleted', 'success');
      fetchEmployees();
    } else {
      showToast(res.message || 'Failed to delete', 'error');
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'super_admin': return 'emp-badge--superadmin';
      case 'admin': return 'emp-badge--admin';
      case 'sales_agent': return 'emp-badge--agent';
      default: return 'emp-badge--viewer';
    }
  };

  const canManage = user?.role === 'super_admin' || user?.role === 'admin';

  return (
    <div className="emp-page">
      {/* Toast */}
      {toast && (
        <div className={`emp-toast emp-toast--${toast.type}`}>
          {toast.type === 'success' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
          )}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="emp-header">
        <div>
          <h1 className="emp-title">Employees</h1>
          <p className="emp-subtitle">Manage your team members and their access levels</p>
        </div>
        {canManage && (
          <button className="emp-add-btn" onClick={() => { resetForm(); setShowForm(true); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add Employee
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="emp-filters">
        <div className="emp-search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="emp-search-input"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="emp-role-filter"
        >
          <option value="">All Roles</option>
          <option value="super_admin">Super Admin</option>
          <option value="admin">Admin</option>
          <option value="sales_agent">Sales Agent</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>

      {/* Registration / Edit Modal */}
      {showForm && (
        <div className="emp-modal-backdrop" onClick={() => resetForm()}>
          <div className="emp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="emp-modal-header">
              <h2>{editId ? 'Edit Employee' : 'Register New Employee'}</h2>
              <button className="emp-modal-close" onClick={resetForm}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="emp-form">
              <div className="emp-form-grid">
                <div className="emp-form-field">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="John Doe"
                  />
                </div>
                <div className="emp-form-field">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    placeholder="john@company.com"
                    disabled={!!editId}
                  />
                </div>
                {!editId && (
                  <div className="emp-form-field">
                    <label>Password *</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                      placeholder="Min 6 characters"
                      minLength={6}
                    />
                  </div>
                )}
                <div className="emp-form-field">
                  <label>Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="sales_agent">Sales Agent</option>
                    <option value="viewer">Viewer</option>
                    {user?.role === 'super_admin' && (
                      <>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="emp-form-field">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 9876543210"
                  />
                </div>
                <div className="emp-form-field">
                  <label>Department</label>
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    placeholder="Sales, Marketing, etc."
                  />
                </div>
              </div>
              <div className="emp-form-actions">
                <button type="button" className="emp-form-cancel" onClick={resetForm}>Cancel</button>
                <button type="submit" className="emp-form-submit">
                  {editId ? 'Update Employee' : 'Register Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee Table */}
      <div className="emp-table-wrap">
        {loading ? (
          <div className="emp-loading">
            <div className="emp-loading-spinner" />
          </div>
        ) : employees.length === 0 ? (
          <div className="emp-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
            <p>No employees found</p>
          </div>
        ) : (
          <table className="emp-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Last Login</th>
                {canManage && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp._id} className={!emp.isActive ? 'emp-row--inactive' : ''}>
                  <td>
                    <div className="emp-cell-user">
                      <div className="emp-cell-avatar">{emp.name.charAt(0).toUpperCase()}</div>
                      <div className="emp-cell-info">
                        <span className="emp-cell-name">{emp.name}</span>
                        <span className="emp-cell-email">{emp.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`emp-badge ${getRoleBadgeClass(emp.role)}`}>
                      {emp.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="emp-cell-dept">{emp.department || '—'}</td>
                  <td>
                    <span className={`emp-status ${emp.isActive ? 'emp-status--active' : 'emp-status--inactive'}`}>
                      <span className="emp-status-dot" />
                      {emp.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="emp-cell-date">
                    {emp.lastLogin ? new Date(emp.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  {canManage && (
                    <td>
                      <div className="emp-actions">
                        <button className="emp-action-btn" onClick={() => handleEdit(emp)} title="Edit">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        </button>
                        <button className="emp-action-btn" onClick={() => handleToggleActive(emp)} title={emp.isActive ? 'Deactivate' : 'Activate'}>
                          {emp.isActive ? (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18.36 6.64A9 9 0 015.64 18.36 9 9 0 0118.36 6.64z" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                          ) : (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                          )}
                        </button>
                        {user?.role === 'super_admin' && emp.role !== 'super_admin' && (
                          <button className="emp-action-btn emp-action-btn--danger" onClick={() => handleDelete(emp)} title="Delete">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        .emp-page { max-width: 1280px; margin: 0 auto; }

        /* Toast */
        .emp-toast {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 100;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
          animation: toastIn 0.3s ease-out;
          backdrop-filter: blur(12px);
        }
        .emp-toast--success {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: #6ee7b7;
        }
        .emp-toast--error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: #fca5a5;
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Header */
        .emp-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }
        .emp-title {
          font-size: 24px;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 4px;
        }
        .emp-subtitle {
          font-size: 14px;
          color: rgba(148,163,184,0.7);
          margin: 0;
        }
        .emp-add-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 10px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s;
        }
        .emp-add-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99,102,241,0.3);
        }

        /* Filters */
        .emp-filters {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }
        .emp-search-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          color: rgba(148,163,184,0.5);
        }
        .emp-search-wrap:focus-within {
          border-color: rgba(99,102,241,0.3);
        }
        .emp-search-input {
          flex: 1;
          padding: 10px 0;
          background: none;
          border: none;
          outline: none;
          color: #e2e8f0;
          font-size: 13px;
          font-family: inherit;
        }
        .emp-search-input::placeholder { color: rgba(148,163,184,0.4); }
        .emp-role-filter {
          padding: 10px 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          color: #e2e8f0;
          font-size: 13px;
          font-family: inherit;
          cursor: pointer;
          outline: none;
          min-width: 150px;
        }
        .emp-role-filter option { background: #0f1428; }

        /* Modal */
        .emp-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          animation: fadeIn 0.15s;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .emp-modal {
          background: rgba(15,20,40,0.98);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          width: 100%;
          max-width: 560px;
          max-height: 90vh;
          overflow-y: auto;
          animation: modalIn 0.2s ease-out;
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .emp-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .emp-modal-header h2 {
          font-size: 18px;
          font-weight: 600;
          color: #f1f5f9;
          margin: 0;
        }
        .emp-modal-close {
          background: none;
          border: none;
          color: rgba(148,163,184,0.5);
          cursor: pointer;
          padding: 4px;
          border-radius: 8px;
          display: flex;
          transition: all 0.15s;
        }
        .emp-modal-close:hover {
          background: rgba(255,255,255,0.05);
          color: #e2e8f0;
        }

        /* Form */
        .emp-form { padding: 24px; }
        .emp-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }
        .emp-form-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .emp-form-field label {
          font-size: 12px;
          font-weight: 500;
          color: rgba(203,213,225,0.8);
        }
        .emp-form-field input,
        .emp-form-field select {
          padding: 10px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: #f1f5f9;
          font-size: 13px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
        }
        .emp-form-field input:focus,
        .emp-form-field select:focus {
          border-color: rgba(99,102,241,0.4);
        }
        .emp-form-field input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .emp-form-field input::placeholder { color: rgba(148,163,184,0.4); }
        .emp-form-field select option { background: #0f1428; }
        .emp-form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }
        .emp-form-cancel {
          padding: 10px 20px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: rgba(203,213,225,0.8);
          font-size: 13px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.15s;
        }
        .emp-form-cancel:hover { background: rgba(255,255,255,0.06); }
        .emp-form-submit {
          padding: 10px 24px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 10px;
          color: white;
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s;
        }
        .emp-form-submit:hover {
          box-shadow: 0 4px 16px rgba(99,102,241,0.3);
        }

        /* Table */
        .emp-table-wrap {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          overflow: hidden;
        }
        .emp-table {
          width: 100%;
          border-collapse: collapse;
        }
        .emp-table thead th {
          padding: 14px 16px;
          text-align: left;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: rgba(148,163,184,0.6);
          border-bottom: 1px solid rgba(255,255,255,0.04);
          background: rgba(255,255,255,0.01);
        }
        .emp-table tbody tr {
          transition: background 0.15s;
        }
        .emp-table tbody tr:hover {
          background: rgba(255,255,255,0.02);
        }
        .emp-table tbody td {
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          font-size: 13px;
        }
        .emp-row--inactive { opacity: 0.5; }

        .emp-cell-user {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .emp-cell-avatar {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
        }
        .emp-cell-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .emp-cell-name {
          font-weight: 600;
          color: rgba(226,232,240,0.95);
        }
        .emp-cell-email {
          font-size: 12px;
          color: rgba(148,163,184,0.6);
        }
        .emp-cell-dept { color: rgba(203,213,225,0.7); }
        .emp-cell-date { color: rgba(148,163,184,0.5); font-size: 12px; }

        /* Badges */
        .emp-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          text-transform: capitalize;
        }
        .emp-badge--superadmin { background: rgba(239,68,68,0.12); color: #fca5a5; }
        .emp-badge--admin { background: rgba(245,158,11,0.12); color: #fcd34d; }
        .emp-badge--agent { background: rgba(99,102,241,0.12); color: #a5b4fc; }
        .emp-badge--viewer { background: rgba(148,163,184,0.1); color: rgba(148,163,184,0.7); }

        /* Status */
        .emp-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
        }
        .emp-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .emp-status--active { color: #6ee7b7; }
        .emp-status--active .emp-status-dot { background: #10b981; box-shadow: 0 0 6px rgba(16,185,129,0.4); }
        .emp-status--inactive { color: rgba(148,163,184,0.5); }
        .emp-status--inactive .emp-status-dot { background: rgba(148,163,184,0.3); }

        /* Actions */
        .emp-actions { display: flex; gap: 4px; }
        .emp-action-btn {
          padding: 6px;
          background: none;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 8px;
          color: rgba(148,163,184,0.6);
          cursor: pointer;
          display: flex;
          transition: all 0.15s;
        }
        .emp-action-btn:hover {
          background: rgba(255,255,255,0.05);
          color: #e2e8f0;
          border-color: rgba(255,255,255,0.1);
        }
        .emp-action-btn--danger:hover {
          background: rgba(239,68,68,0.1);
          color: #fca5a5;
          border-color: rgba(239,68,68,0.2);
        }

        /* Loading & Empty */
        .emp-loading {
          display: flex;
          justify-content: center;
          padding: 60px;
        }
        .emp-loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(99,102,241,0.15);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .emp-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 60px;
          color: rgba(148,163,184,0.4);
        }
        .emp-empty p { margin: 0; font-size: 14px; }

        @media (max-width: 768px) {
          .emp-header { flex-direction: column; gap: 12px; }
          .emp-filters { flex-direction: column; }
          .emp-form-grid { grid-template-columns: 1fr; }
          .emp-table-wrap { overflow-x: auto; }
          .emp-table { min-width: 700px; }
        }
      `}</style>
    </div>
  );
};

export default EmployeesPage;
