import React, { useState, useEffect } from 'react';
import { pipelineApi } from '../api/crmApi';

interface KanbanLead {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  assignedTo?: { name: string };
}

interface KanbanStage {
  stage: string;
  leads: KanbanLead[];
}

const stageColors: Record<string, string> = {
  'New Lead': '#60a5fa',
  'Contacted': '#a78bfa',
  'Qualified': '#fbbf24',
  'Proposal Sent': '#f97316',
  'Negotiation': '#818cf8',
  'Won': '#34d399',
  'Lost': '#f87171',
};

const PipelinePage: React.FC = () => {
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('');
  const [kanbanData, setKanbanData] = useState<KanbanStage[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Pipeline Modal
  const [showCreate, setShowCreate] = useState(false);
  const [pipelineName, setPipelineName] = useState('');
  const [stages, setStages] = useState([
    { name: 'New Lead', order: 1, color: '#60a5fa' },
    { name: 'Contacted', order: 2, color: '#a78bfa' },
    { name: 'Qualified', order: 3, color: '#fbbf24' },
    { name: 'Proposal Sent', order: 4, color: '#f97316' },
    { name: 'Negotiation', order: 5, color: '#818cf8' },
    { name: 'Won', order: 6, color: '#34d399' },
    { name: 'Lost', order: 7, color: '#f87171' },
  ]);
  const [saving, setSaving] = useState(false);

  const fetchPipelines = async () => {
    setLoading(true);
    const res = await pipelineApi.getAll();
    if (res.success && res.data?.pipelines && res.data.pipelines.length > 0) {
      setPipelines(res.data.pipelines);
      if (!selectedPipelineId) {
        setSelectedPipelineId(res.data.pipelines[0]._id);
      }
    }
    setLoading(false);
  };

  useEffect(() => { fetchPipelines(); }, []);

  useEffect(() => {
    if (!selectedPipelineId) return;
    const fetchKanban = async () => {
      setLoading(true);
      const res = await pipelineApi.getLeads(selectedPipelineId);
      if (res.success && res.data) {
        setKanbanData(res.data.kanbanData || []);
      }
      setLoading(false);
    };
    fetchKanban();
  }, [selectedPipelineId]);

  const handleMoveLead = async (leadId: string, newStage: string) => {
    const res = await pipelineApi.moveStage(leadId, newStage);
    if (res.success) {
      setKanbanData(prev => prev.map(col => {
        const filteredLeads = col.leads.filter(l => l._id !== leadId);
        if (col.stage === newStage) {
          const leadToMove = prev.flatMap(c => c.leads).find(l => l._id === leadId);
          if (leadToMove) return { ...col, leads: [...filteredLeads, leadToMove] };
        }
        return { ...col, leads: filteredLeads };
      }));
    }
  };

  const handleCreatePipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await pipelineApi.create({
      name: pipelineName,
      stages: stages.filter(s => s.name.trim() !== ''),
      isDefault: pipelines.length === 0,
    });
    if (res.success && res.data?.pipeline) {
      setShowCreate(false);
      setPipelineName('');
      setPipelines(prev => [...prev, res.data.pipeline]);
      setSelectedPipelineId(res.data.pipeline._id);
      fetchPipelines();
    }
    setSaving(false);
  };

  const addStage = () => {
    setStages([...stages, { name: '', order: stages.length + 1, color: '#6366f1' }]);
  };

  const removeStage = (idx: number) => {
    setStages(stages.filter((_, i) => i !== idx));
  };

  const updateStage = (idx: number, name: string) => {
    setStages(stages.map((s, i) => i === idx ? { ...s, name } : s));
  };

  const totalLeads = kanbanData.reduce((sum, col) => sum + col.leads.length, 0);

  return (
    <div className="pipeline-page">
      <div className="pipeline-header">
        <div>
          <h1 className="pipeline-title">Sales Pipeline</h1>
          <p className="pipeline-subtitle">Visual workflow of your sales process — {totalLeads} leads in pipeline</p>
        </div>
        <div className="pipeline-header-actions">
          {pipelines.length > 0 && (
            <select value={selectedPipelineId} onChange={(e) => setSelectedPipelineId(e.target.value)} className="pipeline-select">
              {pipelines.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          )}
          <button className="pipeline-add-btn" onClick={() => setShowCreate(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            New Pipeline
          </button>
        </div>
      </div>

      <div className="kanban-wrapper">
        {loading ? (
          <div className="kanban-loading"><div className="kanban-spinner" /></div>
        ) : pipelines.length === 0 ? (
          <div className="kanban-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(99,102,241,0.2)" strokeWidth="1.5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <h3>No Pipeline Yet</h3>
            <p>Create your first sales pipeline to start tracking leads through stages.</p>
            <button className="kanban-empty-btn" onClick={() => setShowCreate(true)}>
              Create Pipeline
            </button>
          </div>
        ) : kanbanData.length === 0 ? (
          <div className="kanban-empty">
            <p>No stages found. The pipeline may be empty.</p>
          </div>
        ) : (
          <div className="kanban-board">
            {kanbanData.map((stage) => {
              const color = stageColors[stage.stage] || '#6366f1';
              return (
                <div key={stage.stage} className="kanban-column">
                  <div className="kanban-column-header">
                    <div className="kanban-column-header-left">
                      <span className="kanban-column-dot" style={{ background: color }} />
                      <span className="kanban-column-title">{stage.stage}</span>
                    </div>
                    <span className="kanban-column-count">{stage.leads.length}</span>
                  </div>
                  <div className="kanban-leads-list">
                    {stage.leads.length === 0 ? (
                      <div className="kanban-col-empty">No leads</div>
                    ) : (
                      stage.leads.map((lead) => (
                        <div key={lead._id} className="kanban-lead-card">
                          <div className="lead-card-body">
                            <span className="lead-card-name">{lead.name}</span>
                            {lead.email && <span className="lead-card-detail">📧 {lead.email}</span>}
                            {lead.phone && <span className="lead-card-detail">📱 {lead.phone}</span>}
                            {lead.assignedTo && <span className="lead-card-agent">👤 {lead.assignedTo.name}</span>}
                          </div>
                          <div className="lead-card-actions">
                            <select
                              className="lead-move-select"
                              onChange={(e) => handleMoveLead(lead._id, e.target.value)}
                              value={stage.stage}
                            >
                              {kanbanData.map(s => (
                                <option key={s.stage} value={s.stage}>→ {s.stage}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Pipeline Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Create Sales Pipeline</h2>
            <form onSubmit={handleCreatePipeline} className="modal-form">
              <div className="modal-field">
                <label>Pipeline Name *</label>
                <input value={pipelineName} onChange={e => setPipelineName(e.target.value)} required placeholder="e.g. B2B Sales Pipeline" autoFocus />
              </div>

              <div className="modal-field">
                <label>Stages (drag to reorder)</label>
                <div className="stages-list">
                  {stages.map((stage, idx) => (
                    <div key={idx} className="stage-row">
                      <span className="stage-num">{idx + 1}</span>
                      <span className="stage-dot" style={{ background: stage.color }} />
                      <input
                        value={stage.name}
                        onChange={e => updateStage(idx, e.target.value)}
                        placeholder="Stage name..."
                        className="stage-input"
                      />
                      {stages.length > 2 && (
                        <button type="button" className="stage-remove" onClick={() => removeStage(idx)}>×</button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" className="add-stage-btn" onClick={addStage}>+ Add Stage</button>
              </div>

              <div className="modal-actions">
                <button type="button" className="modal-cancel" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="modal-submit" disabled={saving || !pipelineName}>
                  {saving ? 'Creating...' : 'Create Pipeline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .pipeline-page { height: calc(100vh - 120px); display: flex; flex-direction: column; animation: fadeUp .4s ease-out; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

        .pipeline-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-shrink: 0; }
        .pipeline-title { font-size: 24px; font-weight: 700; color: #f1f5f9; margin: 0; }
        .pipeline-subtitle { font-size: 14px; color: #94a3b8; margin: 4px 0 0; }
        .pipeline-header-actions { display: flex; gap: 12px; align-items: center; }
        .pipeline-select { padding: 8px 16px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); border-radius: 10px; color: #f1f5f9; cursor: pointer; font-size: 14px; outline: none; }
        .pipeline-select option { background: #0f172a; }
        .pipeline-add-btn { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; border-radius: 12px; color: white; font-weight: 600; font-size: 14px; cursor: pointer; transition: all .2s; }
        .pipeline-add-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(99,102,241,.35); }

        .kanban-wrapper { flex: 1; overflow-x: auto; overflow-y: hidden; padding-bottom: 16px; }
        .kanban-board { display: flex; gap: 16px; height: 100%; min-width: max-content; }
        .kanban-column { width: 280px; min-width: 280px; background: rgba(255,255,255,.02); border-radius: 16px; display: flex; flex-direction: column; border: 1px solid rgba(255,255,255,.05); }
        .kanban-column-header { padding: 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,.05); }
        .kanban-column-header-left { display: flex; align-items: center; gap: 8px; }
        .kanban-column-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .kanban-column-title { font-size: 13px; font-weight: 700; color: #e2e8f0; text-transform: uppercase; letter-spacing: .5px; }
        .kanban-column-count { font-size: 12px; background: rgba(255,255,255,.06); padding: 2px 10px; border-radius: 20px; color: #94a3b8; font-weight: 600; }

        .kanban-leads-list { padding: 12px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; flex: 1; }
        .kanban-col-empty { font-size: 13px; color: #475569; text-align: center; padding: 20px 0; }
        .kanban-lead-card { background: rgba(15,23,42,.8); border: 1px solid rgba(255,255,255,.06); border-radius: 12px; padding: 14px; transition: .2s; }
        .kanban-lead-card:hover { border-color: rgba(99,102,241,.3); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.2); }
        .lead-card-body { display: flex; flex-direction: column; gap: 4px; }
        .lead-card-name { font-weight: 700; color: #f8fafc; font-size: 14px; }
        .lead-card-detail { font-size: 12px; color: #64748b; }
        .lead-card-agent { font-size: 11px; color: #818cf8; font-weight: 600; margin-top: 4px; }

        .lead-card-actions { margin-top: 10px; padding-top: 10px; border-top: 1px dashed rgba(255,255,255,.05); }
        .lead-move-select { width: 100%; background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.08); color: #94a3b8; font-size: 12px; padding: 6px 8px; border-radius: 8px; outline: none; cursor: pointer; }
        .lead-move-select option { background: #0f172a; }

        .kanban-loading { display: flex; justify-content: center; align-items: center; height: 100%; }
        .kanban-spinner { width: 40px; height: 40px; border: 4px solid rgba(99,102,241,.2); border-top-color: #6366f1; border-radius: 50%; animation: spin .8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .kanban-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; height: 100%; text-align: center; }
        .kanban-empty h3 { font-size: 20px; font-weight: 700; color: #f1f5f9; margin: 0; }
        .kanban-empty p { color: #64748b; font-size: 14px; margin: 0; max-width: 400px; }
        .kanban-empty-btn { padding: 12px 28px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; border-radius: 12px; color: white; font-weight: 600; font-size: 15px; cursor: pointer; transition: .2s; }
        .kanban-empty-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(99,102,241,.4); }

        /* Modal */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; animation: fadeIn .2s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal-card { background: #0f172a; border: 1px solid rgba(255,255,255,.08); border-radius: 20px; padding: 32px; width: 520px; max-width: 95vw; max-height: 90vh; overflow-y: auto; animation: modalIn .3s ease-out; }
        @keyframes modalIn { from { opacity: 0; transform: scale(.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .modal-title { font-size: 20px; font-weight: 700; color: #f1f5f9; margin: 0 0 24px; }
        .modal-form { display: flex; flex-direction: column; gap: 16px; }
        .modal-field { display: flex; flex-direction: column; gap: 6px; }
        .modal-field label { font-size: 13px; font-weight: 500; color: #94a3b8; }
        .modal-field input { padding: 10px 14px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 10px; color: #f1f5f9; font-size: 14px; font-family: inherit; outline: none; transition: .2s; }
        .modal-field input:focus { border-color: rgba(99,102,241,.5); box-shadow: 0 0 0 3px rgba(99,102,241,.1); }
        .modal-field input::placeholder { color: rgba(148,163,184,.4); }
        .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
        .modal-cancel { padding: 10px 20px; background: transparent; border: 1px solid rgba(255,255,255,.1); border-radius: 10px; color: #94a3b8; font-weight: 500; cursor: pointer; transition: .2s; }
        .modal-cancel:hover { background: rgba(255,255,255,.05); }
        .modal-submit { padding: 10px 24px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; border-radius: 10px; color: white; font-weight: 600; cursor: pointer; transition: .2s; }
        .modal-submit:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(99,102,241,.3); }
        .modal-submit:disabled { opacity: .6; cursor: not-allowed; }

        .stages-list { display: flex; flex-direction: column; gap: 8px; }
        .stage-row { display: flex; align-items: center; gap: 8px; }
        .stage-num { width: 24px; height: 24px; border-radius: 6px; background: rgba(255,255,255,.04); display: flex; align-items: center; justify-content: center; font-size: 11px; color: #64748b; font-weight: 700; flex-shrink: 0; }
        .stage-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .stage-input { flex: 1; padding: 8px 12px; background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06); border-radius: 8px; color: #f1f5f9; font-size: 13px; outline: none; }
        .stage-input:focus { border-color: rgba(99,102,241,.4); }
        .stage-remove { background: none; border: none; color: #f87171; font-size: 18px; cursor: pointer; padding: 2px 6px; transition: .2s; }
        .stage-remove:hover { color: #ef4444; }
        .add-stage-btn { align-self: flex-start; background: rgba(99,102,241,.1); border: 1px dashed rgba(99,102,241,.3); border-radius: 8px; color: #818cf8; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; transition: .2s; margin-top: 4px; }
        .add-stage-btn:hover { background: rgba(99,102,241,.2); }
      `}</style>
    </div>
  );
};

export default PipelinePage;
