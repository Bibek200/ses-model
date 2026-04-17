import React, { useState, useEffect } from 'react';
import { leadsApi } from '../api/crmApi';

interface Lead {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  source: string;
  score?: number;
  assignedTo?: { name: string; _id: string };
  whatsappOptIn?: boolean;
  createdAt: string;
}

const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create Lead Modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', phone: '', source: 'manual', whatsappOptIn: false });
  const [saving, setSaving] = useState(false);

  // WhatsApp Modal
  const [waModal, setWaModal] = useState<Lead | null>(null);
  const [waMessage, setWaMessage] = useState('');
  const [waSending, setWaSending] = useState(false);
  const [waSuccess, setWaSuccess] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    const res = await leadsApi.getAll({ search, status: statusFilter });
    if (res.success && res.data) setLeads(res.data.leads || []);
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchLeads(), 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await leadsApi.create(createForm);
    if (res.success) {
      setShowCreate(false);
      setCreateForm({ name: '', email: '', phone: '', source: 'manual', whatsappOptIn: false });
      fetchLeads();
    }
    setSaving(false);
  };

  const openWhatsApp = (lead: Lead) => {
    setWaModal(lead);
    setWaMessage(`Hi ${lead.name}, this is a message from Nexus CRM. We'd love to discuss how we can help you!`);
    setWaSuccess(false);
  };

  const sendWhatsApp = async () => {
    if (!waModal?.phone) return;
    setWaSending(true);
    // Call the backend WhatsApp endpoint
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/crm/whatsapp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('crm_token')}`,
      },
      body: JSON.stringify({ phone: waModal.phone, message: waMessage, leadId: waModal._id }),
    });
    const data = await res.json();
    if (data.success) {
      setWaSuccess(true);
      setTimeout(() => { setWaModal(null); setWaSuccess(false); }, 1500);
    }
    setWaSending(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    await leadsApi.delete(id);
    fetchLeads();
  };

  return (
    <div className="leads-page">
      <div className="leads-header">
        <div>
          <h1 className="leads-title">Leads</h1>
          <p className="leads-subtitle">Manage and track your potential customers</p>
        </div>
        <button className="leads-add-btn" onClick={() => setShowCreate(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          New Lead
        </button>
      </div>

      {/* Controls */}
      <div className="leads-controls">
        <div className="leads-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input type="text" placeholder="Search by name, email, or phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="leads-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="converted">Converted</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      {/* Table */}
      <div className="leads-table-container">
        {loading ? (
          <div className="leads-loading"><div className="leads-spinner" /></div>
        ) : leads.length === 0 ? (
          <div className="leads-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
            <p>No leads found. Click "New Lead" to add one.</p>
          </div>
        ) : (
          <table className="leads-table">
            <thead>
              <tr>
                <th>Lead Name</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Source</th>
                <th>Assigned To</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead._id}>
                  <td>
                    <div className="lead-name-cell">
                      <span className="lead-name">{lead.name}</span>
                      <span className="lead-email">{lead.email || 'No email'}</span>
                    </div>
                  </td>
                  <td className="lead-phone">{lead.phone || '—'}</td>
                  <td>
                    <span className={`lead-status lead-status--${lead.status}`}>{lead.status}</span>
                  </td>
                  <td><span className="lead-source">{lead.source}</span></td>
                  <td>{lead.assignedTo?.name || <span style={{ color: '#64748b' }}>Unassigned</span>}</td>
                  <td className="lead-date">{new Date(lead.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="lead-actions">
                      {/* WhatsApp */}
                      {lead.phone && (
                        <button className="lead-action-btn lead-action-btn--wa" title="Send WhatsApp" onClick={() => openWhatsApp(lead)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /></svg>
                        </button>
                      )}
                      {/* Call */}
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`} className="lead-action-btn" title="Call">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.81 12.81 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" /></svg>
                        </a>
                      )}
                      {/* Delete */}
                      <button className="lead-action-btn lead-action-btn--del" title="Delete" onClick={() => handleDelete(lead._id)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Lead Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Add New Lead</h2>
            <form onSubmit={handleCreateLead} className="modal-form">
              <div className="modal-field">
                <label>Full Name *</label>
                <input value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} required placeholder="John Doe" autoFocus />
              </div>
              <div className="modal-row">
                <div className="modal-field">
                  <label>Email</label>
                  <input type="email" value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })} placeholder="john@example.com" />
                </div>
                <div className="modal-field">
                  <label>Phone</label>
                  <input value={createForm.phone} onChange={e => setCreateForm({ ...createForm, phone: e.target.value })} placeholder="+91 9876543210" />
                </div>
              </div>
              <div className="modal-row">
                <div className="modal-field">
                  <label>Source</label>
                  <select value={createForm.source} onChange={e => setCreateForm({ ...createForm, source: e.target.value })}>
                    <option value="manual">Manual</option>
                    <option value="webhook">Webhook / n8n</option>
                    <option value="import">Import</option>
                    <option value="api">API</option>
                  </select>
                </div>
                <div className="modal-field" style={{ justifyContent: 'flex-end' }}>
                  <label className="wa-checkbox">
                    <input type="checkbox" checked={createForm.whatsappOptIn} onChange={e => setCreateForm({ ...createForm, whatsappOptIn: e.target.checked })} />
                    <span>WhatsApp Opt-In</span>
                  </label>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="modal-cancel" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="modal-submit" disabled={saving}>{saving ? 'Creating...' : 'Create Lead'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Send Modal */}
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
                    <h2 className="modal-title" style={{ marginBottom: 0 }}>Send WhatsApp Message</h2>
                    <p className="wa-to">To: <strong>{waModal.name}</strong> — {waModal.phone}</p>
                  </div>
                </div>
                <div className="modal-form" style={{ marginTop: '20px' }}>
                  <div className="modal-field">
                    <label>Message</label>
                    <textarea value={waMessage} onChange={e => setWaMessage(e.target.value)} rows={4} placeholder="Type your message..." />
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
        .leads-page { animation: fadeUp .4s ease-out; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

        .leads-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .leads-title { font-size: 24px; font-weight: 700; color: #f1f5f9; margin: 0; }
        .leads-subtitle { font-size: 14px; color: #94a3b8; margin: 4px 0 0; }
        .leads-add-btn { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; border-radius: 12px; color: white; font-weight: 600; font-size: 14px; cursor: pointer; transition: all .2s; }
        .leads-add-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(99,102,241,.35); }

        .leads-controls { display: flex; gap: 16px; margin-bottom: 24px; }
        .leads-search { flex: 1; position: relative; display: flex; align-items: center; background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.1); border-radius: 12px; padding: 0 12px; }
        .leads-search svg { color: #64748b; flex-shrink: 0; }
        .leads-search input { width: 100%; padding: 10px; background: transparent; border: none; color: #f1f5f9; outline: none; font-size: 14px; }
        .leads-filter { padding: 10px 16px; background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.1); border-radius: 12px; color: #f1f5f9; outline: none; font-size: 14px; }
        .leads-filter option { background: #0f172a; }

        .leads-table-container { background: rgba(15,23,42,.5); border: 1px solid rgba(255,255,255,.05); border-radius: 16px; overflow: hidden; }
        .leads-table { width: 100%; border-collapse: collapse; text-align: left; }
        .leads-table th { padding: 14px 16px; background: rgba(255,255,255,.02); font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .5px; border-bottom: 1px solid rgba(255,255,255,.05); }
        .leads-table td { padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,.03); font-size: 14px; color: #e2e8f0; }

        .lead-name-cell { display: flex; flex-direction: column; }
        .lead-name { font-weight: 600; color: #f8fafc; }
        .lead-email { font-size: 12px; color: #64748b; }
        .lead-phone { font-size: 13px; color: #94a3b8; font-family: monospace; }
        .lead-date { font-size: 13px; color: #64748b; }

        .lead-status { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: capitalize; }
        .lead-status--new { background: rgba(59,130,246,.1); color: #60a5fa; }
        .lead-status--contacted { background: rgba(139,92,246,.1); color: #a78bfa; }
        .lead-status--qualified { background: rgba(16,185,129,.1); color: #34d399; }
        .lead-status--converted { background: rgba(245,158,11,.1); color: #fbbf24; }
        .lead-status--lost { background: rgba(239,68,68,.1); color: #f87171; }
        .lead-source { background: rgba(255,255,255,.05); padding: 3px 8px; border-radius: 6px; font-size: 12px; text-transform: capitalize; }

        .lead-actions { display: flex; gap: 6px; }
        .lead-action-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 8px; color: #94a3b8; cursor: pointer; transition: .2s; text-decoration: none; }
        .lead-action-btn:hover { background: rgba(255,255,255,.1); color: #f1f5f9; }
        .lead-action-btn--wa { border-color: rgba(37,211,102,.2); }
        .lead-action-btn--wa:hover { background: rgba(37,211,102,.15); }
        .lead-action-btn--del:hover { background: rgba(239,68,68,.15); color: #f87171; border-color: rgba(239,68,68,.3); }

        /* Modal (shared) */
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
        .modal-field input:focus, .modal-field textarea:focus, .modal-field select:focus { border-color: rgba(99,102,241,.5); box-shadow: 0 0 0 3px rgba(99,102,241,.1); }
        .modal-field input::placeholder, .modal-field textarea::placeholder { color: rgba(148,163,184,.4); }
        .modal-field select option { background: #0f172a; color: #e2e8f0; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
        .modal-cancel { padding: 10px 20px; background: transparent; border: 1px solid rgba(255,255,255,.1); border-radius: 10px; color: #94a3b8; font-weight: 500; cursor: pointer; transition: .2s; }
        .modal-cancel:hover { background: rgba(255,255,255,.05); }
        .modal-submit { padding: 10px 24px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; border-radius: 10px; color: white; font-weight: 600; cursor: pointer; transition: .2s; }
        .modal-submit:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(99,102,241,.3); }
        .modal-submit:disabled { opacity: .6; cursor: not-allowed; }
        .modal-submit--wa { background: linear-gradient(135deg, #25D366, #128C7E); }
        .modal-submit--wa:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(37,211,102,.3); }

        .wa-checkbox { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; color: #94a3b8; }
        .wa-checkbox input { accent-color: #25D366; width: 16px; height: 16px; }

        .wa-modal-header { display: flex; align-items: center; gap: 14px; }
        .wa-to { font-size: 13px; color: #64748b; margin: 4px 0 0; }
        .wa-to strong { color: #e2e8f0; }
        .wa-preview { background: #0b141a; border-radius: 12px; padding: 16px; border: 1px solid rgba(37,211,102,.1); }
        .wa-preview-bubble { background: #1f2c34; padding: 12px 16px; border-radius: 0 12px 12px 12px; color: #e2e8f0; font-size: 14px; line-height: 1.6; white-space: pre-wrap; max-height: 100px; overflow-y: auto; }

        .wa-success { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px 0; text-align: center; }
        .wa-success h3 { font-size: 20px; font-weight: 700; color: #25D366; margin: 0; }
        .wa-success p { color: #94a3b8; margin: 0; }

        .leads-loading { padding: 60px; display: flex; justify-content: center; }
        .leads-spinner { width: 30px; height: 30px; border: 3px solid rgba(99,102,241,.2); border-top-color: #6366f1; border-radius: 50%; animation: spin .8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .leads-empty { padding: 60px; display: flex; flex-direction: column; align-items: center; gap: 16px; color: #64748b; font-size: 14px; }
      `}</style>
    </div>
  );
};

export default LeadsPage;
