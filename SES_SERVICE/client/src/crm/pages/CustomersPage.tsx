import React, { useState, useEffect } from 'react';
import { customersApi } from '../api/crmApi';

interface Customer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  status: string;
  totalOrders: number;
  totalRevenue: number;
  assignedTo?: { name: string; _id: string };
  createdAt: string;
}

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create Modal
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', address: '' });
  const [saving, setSaving] = useState(false);

  // WhatsApp Modal
  const [waModal, setWaModal] = useState<Customer | null>(null);
  const [waMessage, setWaMessage] = useState('');
  const [waSending, setWaSending] = useState(false);
  const [waSuccess, setWaSuccess] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    const res = await customersApi.getAll({ search });
    if (res.success && res.data) {
      setCustomers(res.data.customers || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchCustomers(), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await customersApi.create(form);
    if (res.success) {
      setShowCreate(false);
      setForm({ name: '', email: '', phone: '', company: '', address: '' });
      fetchCustomers();
    }
    setSaving(false);
  };

  const openWhatsApp = (cust: Customer) => {
    setWaModal(cust);
    setWaMessage(`Hi ${cust.name}, thank you for being a valued customer of Nexus! We'd love to hear your feedback.`);
    setWaSuccess(false);
  };

  const sendWhatsApp = async () => {
    if (!waModal?.phone) return;
    setWaSending(true);
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/crm/whatsapp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('crm_token')}`,
      },
      body: JSON.stringify({ phone: waModal.phone, message: waMessage }),
    });
    const data = await res.json();
    if (data.success) {
      setWaSuccess(true);
      setTimeout(() => { setWaModal(null); setWaSuccess(false); }, 1500);
    }
    setWaSending(false);
  };

  const totalRevenue = customers.reduce((s, c) => s + (c.totalRevenue || 0), 0);
  const totalOrders = customers.reduce((s, c) => s + (c.totalOrders || 0), 0);

  return (
    <div className="cust-page">
      {/* Header */}
      <div className="cust-header">
        <div>
          <h1 className="cust-title">Customers</h1>
          <p className="cust-subtitle">Monitor your active customer base and revenue</p>
        </div>
        <button className="cust-add-btn" onClick={() => setShowCreate(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add Customer
        </button>
      </div>

      {/* Stats */}
      <div className="cust-stats">
        <div className="cust-stat-card">
          <span className="cust-stat-label">Total Customers</span>
          <span className="cust-stat-value">{customers.length}</span>
        </div>
        <div className="cust-stat-card">
          <span className="cust-stat-label">Total Revenue</span>
          <span className="cust-stat-value cust-stat--green">₹{totalRevenue.toLocaleString()}</span>
        </div>
        <div className="cust-stat-card">
          <span className="cust-stat-label">Total Orders</span>
          <span className="cust-stat-value">{totalOrders}</span>
        </div>
        <div className="cust-stat-card">
          <span className="cust-stat-label">Active</span>
          <span className="cust-stat-value">{customers.filter(c => c.status === 'active').length}</span>
        </div>
      </div>

      {/* Search */}
      <div className="cust-controls">
        <div className="cust-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input type="text" placeholder="Search by name, email, phone or company..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="cust-table-container">
        {loading ? (
          <div className="cust-loading"><div className="cust-spinner" /></div>
        ) : customers.length === 0 ? (
          <div className="cust-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
            <p>No customers yet. Add your first customer or convert a lead.</p>
          </div>
        ) : (
          <table className="cust-table">
            <thead>
              <tr>
                <th>Customer / Company</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Orders</th>
                <th>Revenue</th>
                <th>Assigned To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((cust) => (
                <tr key={cust._id}>
                  <td>
                    <div className="cust-info-cell">
                      <span className="cust-name">{cust.name}</span>
                      <span className="cust-company">{cust.company || 'Private'}</span>
                    </div>
                  </td>
                  <td className="cust-phone">{cust.phone || '—'}</td>
                  <td>
                    <span className={`cust-status status--${cust.status}`}>{cust.status}</span>
                  </td>
                  <td>{cust.totalOrders}</td>
                  <td className="cust-revenue">₹{(cust.totalRevenue || 0).toLocaleString()}</td>
                  <td>{cust.assignedTo?.name || <span style={{ color: '#475569' }}>Unassigned</span>}</td>
                  <td>
                    <div className="cust-actions">
                      {cust.phone && (
                        <button className="cust-action-btn cust-action-btn--wa" title="Send WhatsApp" onClick={() => openWhatsApp(cust)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /></svg>
                        </button>
                      )}
                      {cust.phone && (
                        <a href={`tel:${cust.phone}`} className="cust-action-btn" title="Call">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.81 12.81 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" /></svg>
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Customer Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Add New Customer</h2>
            <form onSubmit={handleCreate} className="modal-form">
              <div className="modal-row">
                <div className="modal-field">
                  <label>Full Name *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Jane Doe" autoFocus />
                </div>
                <div className="modal-field">
                  <label>Company</label>
                  <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Acme Corp" />
                </div>
              </div>
              <div className="modal-row">
                <div className="modal-field">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jane@acme.com" />
                </div>
                <div className="modal-field">
                  <label>Phone</label>
                  <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 9876543210" />
                </div>
              </div>
              <div className="modal-field">
                <label>Address</label>
                <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Full address..." rows={2} />
              </div>
              <div className="modal-actions">
                <button type="button" className="modal-cancel" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="modal-submit" disabled={saving}>{saving ? 'Creating...' : 'Add Customer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      {waModal && (
        <div className="modal-overlay" onClick={() => setWaModal(null)}>
          <div className="modal-card modal-card--wa" onClick={e => e.stopPropagation()}>
            {waSuccess ? (
              <div className="wa-success">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                <h3>Message Sent!</h3>
                <p>WhatsApp message delivered to {waModal.name}</p>
              </div>
            ) : (
              <>
                <div className="wa-modal-header">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /></svg>
                  <div>
                    <h2 className="modal-title" style={{ marginBottom: 0 }}>Send WhatsApp</h2>
                    <p className="wa-to">To: <strong>{waModal.name}</strong> — {waModal.phone}</p>
                  </div>
                </div>
                <div className="modal-form" style={{ marginTop: '20px' }}>
                  <div className="modal-field">
                    <label>Message</label>
                    <textarea value={waMessage} onChange={e => setWaMessage(e.target.value)} rows={4} />
                  </div>
                  <div className="wa-preview">
                    <div className="wa-preview-bubble">{waMessage}</div>
                  </div>
                  <div className="modal-actions">
                    <button className="modal-cancel" onClick={() => setWaModal(null)}>Cancel</button>
                    <button className="modal-submit modal-submit--wa" onClick={sendWhatsApp} disabled={waSending || !waMessage}>
                      {waSending ? 'Sending...' : '📨 Send via WhatsApp'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        .cust-page { animation: fadeUp .4s ease-out; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

        .cust-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .cust-title { font-size: 24px; font-weight: 700; color: #f1f5f9; margin: 0; }
        .cust-subtitle { font-size: 14px; color: #94a3b8; margin: 4px 0 0; }
        .cust-add-btn { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; border-radius: 12px; color: white; font-weight: 600; font-size: 14px; cursor: pointer; transition: all .2s; }
        .cust-add-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(99,102,241,.35); }

        .cust-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
        .cust-stat-card { background: rgba(15,23,42,.5); border: 1px solid rgba(255,255,255,.05); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 8px; }
        .cust-stat-label { font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .5px; }
        .cust-stat-value { font-size: 28px; font-weight: 800; color: #f1f5f9; }
        .cust-stat--green { color: #34d399; }

        .cust-controls { margin-bottom: 24px; }
        .cust-search { display: flex; align-items: center; background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.1); border-radius: 12px; padding: 0 12px; }
        .cust-search svg { color: #64748b; flex-shrink: 0; }
        .cust-search input { width: 100%; padding: 12px; background: transparent; border: none; color: #f1f5f9; outline: none; font-size: 14px; }

        .cust-table-container { background: rgba(15,23,42,.5); border: 1px solid rgba(255,255,255,.05); border-radius: 16px; overflow: hidden; }
        .cust-table { width: 100%; border-collapse: collapse; text-align: left; }
        .cust-table th { padding: 14px 16px; background: rgba(255,255,255,.02); color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; border-bottom: 1px solid rgba(255,255,255,.05); }
        .cust-table td { padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,.03); color: #e2e8f0; font-size: 14px; }
        .cust-info-cell { display: flex; flex-direction: column; }
        .cust-name { font-weight: 600; color: #f8fafc; }
        .cust-company { font-size: 12px; color: #64748b; }
        .cust-phone { font-size: 13px; color: #94a3b8; font-family: monospace; }
        .cust-revenue { font-weight: 700; color: #34d399; }
        .cust-status { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: capitalize; }
        .status--active { background: rgba(16,185,129,.1); color: #34d399; }
        .status--inactive { background: rgba(245,158,11,.1); color: #fbbf24; }
        .status--churned { background: rgba(239,68,68,.1); color: #f87171; }

        .cust-actions { display: flex; gap: 6px; }
        .cust-action-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 8px; color: #94a3b8; cursor: pointer; transition: .2s; text-decoration: none; }
        .cust-action-btn:hover { background: rgba(255,255,255,.1); color: #f1f5f9; }
        .cust-action-btn--wa { border-color: rgba(37,211,102,.2); }
        .cust-action-btn--wa:hover { background: rgba(37,211,102,.15); }

        /* Modal */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; animation: fadeIn .2s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal-card { background: #0f172a; border: 1px solid rgba(255,255,255,.08); border-radius: 20px; padding: 32px; width: 520px; max-width: 95vw; max-height: 90vh; overflow-y: auto; animation: modalIn .3s ease-out; }
        .modal-card--wa { border-color: rgba(37,211,102,.15); }
        @keyframes modalIn { from { opacity: 0; transform: scale(.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .modal-title { font-size: 20px; font-weight: 700; color: #f1f5f9; margin: 0 0 24px; }
        .modal-form { display: flex; flex-direction: column; gap: 16px; }
        .modal-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .modal-field { display: flex; flex-direction: column; gap: 6px; }
        .modal-field label { font-size: 13px; font-weight: 500; color: #94a3b8; }
        .modal-field input, .modal-field textarea, .modal-field select { padding: 10px 14px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 10px; color: #f1f5f9; font-size: 14px; font-family: inherit; outline: none; transition: .2s; resize: vertical; }
        .modal-field input:focus, .modal-field textarea:focus { border-color: rgba(99,102,241,.5); box-shadow: 0 0 0 3px rgba(99,102,241,.1); }
        .modal-field input::placeholder, .modal-field textarea::placeholder { color: rgba(148,163,184,.4); }
        .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
        .modal-cancel { padding: 10px 20px; background: transparent; border: 1px solid rgba(255,255,255,.1); border-radius: 10px; color: #94a3b8; font-weight: 500; cursor: pointer; transition: .2s; }
        .modal-cancel:hover { background: rgba(255,255,255,.05); }
        .modal-submit { padding: 10px 24px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; border-radius: 10px; color: white; font-weight: 600; cursor: pointer; transition: .2s; }
        .modal-submit:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(99,102,241,.3); }
        .modal-submit:disabled { opacity: .6; cursor: not-allowed; }
        .modal-submit--wa { background: linear-gradient(135deg, #25D366, #128C7E); }
        .modal-submit--wa:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(37,211,102,.3); }

        .wa-modal-header { display: flex; align-items: center; gap: 14px; }
        .wa-to { font-size: 13px; color: #64748b; margin: 4px 0 0; }
        .wa-to strong { color: #e2e8f0; }
        .wa-preview { background: #0b141a; border-radius: 12px; padding: 16px; border: 1px solid rgba(37,211,102,.1); }
        .wa-preview-bubble { background: #1f2c34; padding: 12px 16px; border-radius: 0 12px 12px 12px; color: #e2e8f0; font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
        .wa-success { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px 0; text-align: center; }
        .wa-success h3 { font-size: 20px; font-weight: 700; color: #25D366; margin: 0; }
        .wa-success p { color: #94a3b8; margin: 0; }

        .cust-loading { padding: 60px; display: flex; justify-content: center; }
        .cust-spinner { width: 30px; height: 30px; border: 3px solid rgba(99,102,241,.2); border-top-color: #6366f1; border-radius: 50%; animation: spin .8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .cust-empty { padding: 60px; display: flex; flex-direction: column; align-items: center; gap: 16px; color: #64748b; font-size: 14px; }
      `}</style>
    </div>
  );
};

export default CustomersPage;
