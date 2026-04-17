import React, { useState, useEffect } from 'react';
import { campaignsApi } from '../api/crmApi';

interface Campaign {
  _id: string;
  name: string;
  type: string;
  audience: string;
  status: string;
  templateName?: string;
  message?: string;
  sentCount: number;
  readCount: number;
  failedCount: number;
  createdAt: string;
}

const CampaignsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'broadcast', audience: 'leads', message: '', templateName: '' });

  const fetchCampaigns = async () => {
    setLoading(true);
    const res = await campaignsApi.getAll();
    if (res.success && res.data) setCampaigns(res.data.campaigns || []);
    setLoading(false);
  };

  useEffect(() => { fetchCampaigns(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await campaignsApi.create(form);
    if (res.success) {
      setShowModal(false);
      setForm({ name: '', type: 'broadcast', audience: 'leads', message: '', templateName: '' });
      fetchCampaigns();
    }
    setSaving(false);
  };

  const handleRun = async (id: string) => {
    if (!window.confirm('Start broadcasting this campaign? This will send WhatsApp messages to the target audience.')) return;
    const res = await campaignsApi.run(id);
    if (res.success) {
      fetchCampaigns();
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return '🕐';
      case 'running': return '🚀';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '📋';
    }
  };

  return (
    <div className="camp-page">
      <div className="camp-header">
        <div>
          <h1 className="camp-title">WhatsApp Campaigns</h1>
          <p className="camp-subtitle">Marketing broadcasts and automated sequences via Meta Cloud API</p>
        </div>
        <button className="camp-add-btn" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          New Campaign
        </button>
      </div>

      {/* Stats */}
      <div className="camp-stats">
        <div className="camp-stat-card">
          <span className="camp-stat-label">Total Campaigns</span>
          <span className="camp-stat-value">{campaigns.length}</span>
        </div>
        <div className="camp-stat-card">
          <span className="camp-stat-label">Messages Sent</span>
          <span className="camp-stat-value">{campaigns.reduce((s, c) => s + c.sentCount, 0).toLocaleString()}</span>
        </div>
        <div className="camp-stat-card">
          <span className="camp-stat-label">Read Rate</span>
          <span className="camp-stat-value">
            {(() => {
              const sent = campaigns.reduce((s, c) => s + c.sentCount, 0);
              const read = campaigns.reduce((s, c) => s + c.readCount, 0);
              return sent > 0 ? `${Math.round((read / sent) * 100)}%` : '—';
            })()}
          </span>
        </div>
      </div>

      {/* Campaign Grid */}
      <div className="camp-list">
        {loading ? (
          <div className="camp-loading"><div className="camp-spinner" /></div>
        ) : campaigns.length === 0 ? (
          <div className="camp-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5"><path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" /></svg>
            <p>No campaigns created yet. Set up your first WhatsApp broadcast.</p>
          </div>
        ) : (
          <div className="camp-grid">
            {campaigns.map(c => (
              <div key={c._id} className="camp-card">
                <div className="camp-card-top">
                  <span className={`camp-status status--${c.status}`}>
                    {statusIcon(c.status)} {c.status}
                  </span>
                  <span className="camp-type">{c.type}</span>
                </div>

                <h3 className="camp-name">{c.name}</h3>

                <p className="camp-audience">
                  Target: <span className="camp-audience-tag">{c.audience}</span>
                </p>

                {c.message && (
                  <div className="camp-message-preview">
                    <span className="camp-msg-label">Message:</span>
                    <p className="camp-msg-text">{c.message.substring(0, 100)}{c.message.length > 100 ? '...' : ''}</p>
                  </div>
                )}

                <div className="camp-metrics">
                  <div className="camp-metric">
                    <span className="cm-label">Sent</span>
                    <span className="cm-value">{c.sentCount}</span>
                  </div>
                  <div className="camp-metric">
                    <span className="cm-label">Read</span>
                    <span className="cm-value cm-value--green">{c.readCount}</span>
                  </div>
                  <div className="camp-metric">
                    <span className="cm-label">Failed</span>
                    <span className="cm-value cm-value--red">{c.failedCount}</span>
                  </div>
                </div>

                <div className="camp-card-footer">
                  <span className="camp-date">{new Date(c.createdAt).toLocaleDateString()}</span>
                  {c.status === 'scheduled' && (
                    <button className="camp-run-btn" onClick={() => handleRun(c._id)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                      Run Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Create WhatsApp Campaign</h2>
            <form onSubmit={handleCreate} className="modal-form">
              <div className="modal-field">
                <label>Campaign Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Diwali Sale 2026" />
              </div>

              <div className="modal-row">
                <div className="modal-field">
                  <label>Campaign Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="broadcast">Broadcast</option>
                    <option value="drip">Drip Sequence</option>
                    <option value="promotional">Promotional</option>
                  </select>
                </div>
                <div className="modal-field">
                  <label>Target Audience</label>
                  <select value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })}>
                    <option value="leads">All Leads</option>
                    <option value="customers">All Customers</option>
                    <option value="all">Everyone</option>
                  </select>
                </div>
              </div>

              <div className="modal-field">
                <label>WhatsApp Template Name (optional)</label>
                <input value={form.templateName} onChange={e => setForm({ ...form, templateName: e.target.value })} placeholder="Meta approved template name" />
              </div>

              <div className="modal-field">
                <label>Message Body *</label>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required rows={4} placeholder="Hi {{name}}, we have an exciting offer for you..." />
                <span className="field-hint">Use {"{{name}}"} for personalization. Max 1024 characters.</span>
              </div>

              <div className="camp-preview-box">
                <div className="camp-preview-header">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                  <span>WhatsApp Preview</span>
                </div>
                <div className="camp-preview-msg">
                  {form.message || 'Your message will appear here...'}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="modal-submit" disabled={saving}>
                  {saving ? 'Creating...' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .camp-page { animation: fadeUp .4s ease-out; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

        .camp-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .camp-title { font-size: 24px; font-weight: 700; color: #f1f5f9; margin: 0; }
        .camp-subtitle { font-size: 14px; color: #94a3b8; margin: 4px 0 0; }
        .camp-add-btn { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: linear-gradient(135deg, #25D366, #128C7E); border: none; border-radius: 12px; color: white; font-weight: 600; font-size: 14px; cursor: pointer; transition: all .2s; }
        .camp-add-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(37,211,102,.3); }

        .camp-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
        .camp-stat-card { background: rgba(15,23,42,.5); border: 1px solid rgba(255,255,255,.05); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 8px; }
        .camp-stat-label { font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .5px; }
        .camp-stat-value { font-size: 28px; font-weight: 800; color: #f1f5f9; }

        .camp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
        .camp-card { background: rgba(15,23,42,.5); border: 1px solid rgba(255,255,255,.05); border-radius: 16px; padding: 24px; transition: .3s; display: flex; flex-direction: column; gap: 12px; }
        .camp-card:hover { transform: translateY(-4px); border-color: rgba(99,102,241,.2); box-shadow: 0 12px 40px rgba(0,0,0,.2); }

        .camp-card-top { display: flex; justify-content: space-between; align-items: center; }
        .camp-status { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: capitalize; }
        .status--scheduled { background: rgba(59,130,246,.1); color: #60a5fa; }
        .status--running { background: rgba(139,92,246,.1); color: #a78bfa; }
        .status--completed { background: rgba(16,185,129,.1); color: #34d399; }
        .status--failed { background: rgba(239,68,68,.1); color: #f87171; }
        .camp-type { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: .5px; }

        .camp-name { font-size: 18px; font-weight: 700; color: #f1f5f9; margin: 0; }
        .camp-audience { font-size: 13px; color: #94a3b8; margin: 0; }
        .camp-audience-tag { color: #25D366; font-weight: 600; text-transform: capitalize; }

        .camp-message-preview { padding: 12px; background: rgba(255,255,255,.02); border-radius: 10px; border-left: 3px solid #25D366; }
        .camp-msg-label { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; }
        .camp-msg-text { font-size: 13px; color: #94a3b8; margin: 4px 0 0; line-height: 1.5; }

        .camp-metrics { display: flex; gap: 20px; padding: 14px 0; border-top: 1px solid rgba(255,255,255,.04); }
        .camp-metric { display: flex; flex-direction: column; }
        .cm-label { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; }
        .cm-value { font-size: 20px; font-weight: 800; color: #f1f5f9; }
        .cm-value--green { color: #34d399; }
        .cm-value--red { color: #f87171; }

        .camp-card-footer { display: flex; justify-content: space-between; align-items: center; }
        .camp-date { font-size: 12px; color: #475569; }
        .camp-run-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: rgba(37,211,102,.1); border: 1px solid rgba(37,211,102,.2); border-radius: 10px; color: #25D366; font-weight: 700; font-size: 13px; cursor: pointer; transition: .2s; }
        .camp-run-btn:hover { background: rgba(37,211,102,.2); }

        /* WhatsApp Preview */
        .camp-preview-box { background: #0b141a; border-radius: 12px; padding: 16px; border: 1px solid rgba(37,211,102,.15); }
        .camp-preview-header { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #25D366; font-weight: 600; margin-bottom: 10px; }
        .camp-preview-msg { background: #1f2c34; padding: 12px 16px; border-radius: 0 12px 12px 12px; color: #e2e8f0; font-size: 14px; line-height: 1.6; white-space: pre-wrap; max-height: 120px; overflow-y: auto; }

        /* Modal (shared) */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; animation: fadeIn .2s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal-card { background: #0f172a; border: 1px solid rgba(255,255,255,.08); border-radius: 20px; padding: 32px; width: 560px; max-width: 95vw; max-height: 90vh; overflow-y: auto; animation: modalIn .3s ease-out; }
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
        .field-hint { font-size: 11px; color: #475569; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
        .modal-cancel { padding: 10px 20px; background: transparent; border: 1px solid rgba(255,255,255,.1); border-radius: 10px; color: #94a3b8; font-weight: 500; cursor: pointer; transition: .2s; }
        .modal-cancel:hover { background: rgba(255,255,255,.05); }
        .modal-submit { padding: 10px 24px; background: linear-gradient(135deg, #25D366, #128C7E); border: none; border-radius: 10px; color: white; font-weight: 600; cursor: pointer; transition: .2s; }
        .modal-submit:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(37,211,102,.3); }
        .modal-submit:disabled { opacity: .6; cursor: not-allowed; }

        .camp-loading { padding: 60px; display: flex; justify-content: center; }
        .camp-spinner { width: 30px; height: 30px; border: 3px solid rgba(37,211,102,.2); border-top-color: #25D366; border-radius: 50%; animation: spin .8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .camp-empty { padding: 60px; display: flex; flex-direction: column; align-items: center; gap: 16px; color: #64748b; font-size: 14px; }
      `}</style>
    </div>
  );
};

export default CampaignsPage;
