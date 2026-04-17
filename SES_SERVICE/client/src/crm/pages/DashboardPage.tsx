import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyticsApi, leadsApi, ordersApi } from '../api/crmApi';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [analyticsRes, leadsRes] = await Promise.all([
        analyticsApi.getOverview(),
        leadsApi.getAll({ limit: 5 }),
      ]);

      if (analyticsRes.success && analyticsRes.data) setStats(analyticsRes.data);
      if (leadsRes.success && leadsRes.data) setRecentLeads(leadsRes.data.leads || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner" />
        <style>{`
          .dash-loading { display: flex; justify-content: center; align-items: center; min-height: 60vh; }
          .dash-spinner { width: 36px; height: 36px; border: 3px solid rgba(99,102,241,.15); border-top-color: #6366f1; border-radius: 50%; animation: spin .7s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="dash-page">
      {/* Welcome */}
      <div className="dash-welcome">
        <div>
          <h1 className="dash-greeting">{greeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="dash-role">Role: <strong>{user?.role?.replace('_', ' ')}</strong> • Nexus CRM</p>
        </div>
        <div className="dash-date">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="dash-grid">
        <div className="dash-card dash-card--revenue">
          <div className="dash-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
          </div>
          <div className="dash-card-body">
            <span className="dash-card-label">Total Revenue</span>
            <span className="dash-card-value">₹{(stats?.stats?.totalRevenue || 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="dash-card dash-card--leads">
          <div className="dash-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
          </div>
          <div className="dash-card-body">
            <span className="dash-card-label">Total Leads</span>
            <span className="dash-card-value">{stats?.stats?.totalLeads || 0}</span>
          </div>
        </div>

        <div className="dash-card dash-card--new">
          <div className="dash-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          </div>
          <div className="dash-card-body">
            <span className="dash-card-label">New Leads</span>
            <span className="dash-card-value">{stats?.stats?.newLeads || 0}</span>
          </div>
        </div>

        <div className="dash-card dash-card--customers">
          <div className="dash-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
          </div>
          <div className="dash-card-body">
            <span className="dash-card-label">Active Customers</span>
            <span className="dash-card-value">{stats?.stats?.customersCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="dash-bottom">
        {/* Lead Sources */}
        <div className="dash-section">
          <h3 className="dash-section-title">Lead Sources</h3>
          <div className="dash-source-list">
            {(stats?.sourceDistribution || []).length === 0 ? (
              <p className="dash-empty-hint">No lead data yet. Create leads to see distribution.</p>
            ) : (
              stats.sourceDistribution.map((s: any) => {
                const percent = stats.stats.totalLeads > 0 ? (s.count / stats.stats.totalLeads) * 100 : 0;
                return (
                  <div key={s._id} className="dash-source-item">
                    <span className="dash-source-name">{s._id || 'Direct'}</span>
                    <div className="dash-source-bar-bg">
                      <div className="dash-source-bar-fill" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="dash-source-count">{s.count}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Leads */}
        <div className="dash-section">
          <h3 className="dash-section-title">Recent Leads</h3>
          <div className="dash-recent-list">
            {recentLeads.length === 0 ? (
              <p className="dash-empty-hint">No leads yet.</p>
            ) : (
              recentLeads.map((lead: any) => (
                <div key={lead._id} className="dash-recent-item">
                  <div className="dash-recent-avatar">{lead.name.charAt(0).toUpperCase()}</div>
                  <div className="dash-recent-info">
                    <span className="dash-recent-name">{lead.name}</span>
                    <span className="dash-recent-meta">{lead.source} • {new Date(lead.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className={`dash-recent-status dash-recent-status--${lead.status}`}>{lead.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        .dash-page { animation: fadeUp .4s ease-out; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

        .dash-welcome { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .dash-greeting { font-size: 28px; font-weight: 800; color: #f1f5f9; margin: 0; }
        .dash-role { font-size: 14px; color: #64748b; margin: 4px 0 0; text-transform: capitalize; }
        .dash-role strong { color: #a5b4fc; }
        .dash-date { font-size: 14px; color: #475569; background: rgba(255,255,255,.03); padding: 8px 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,.05); }

        .dash-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
        .dash-card { background: rgba(15,23,42,.5); border: 1px solid rgba(255,255,255,.05); border-radius: 16px; padding: 24px; display: flex; align-items: center; gap: 16px; transition: .3s; }
        .dash-card:hover { transform: translateY(-4px); border-color: rgba(99,102,241,.2); box-shadow: 0 12px 40px rgba(0,0,0,.15); }
        .dash-card-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .dash-card--revenue .dash-card-icon { background: rgba(16,185,129,.1); color: #34d399; }
        .dash-card--leads .dash-card-icon { background: rgba(99,102,241,.1); color: #818cf8; }
        .dash-card--new .dash-card-icon { background: rgba(59,130,246,.1); color: #60a5fa; }
        .dash-card--customers .dash-card-icon { background: rgba(245,158,11,.1); color: #fbbf24; }
        .dash-card-body { display: flex; flex-direction: column; }
        .dash-card-label { font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .5px; }
        .dash-card-value { font-size: 28px; font-weight: 800; color: #f1f5f9; margin-top: 4px; }

        .dash-bottom { display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; }
        .dash-section { background: rgba(15,23,42,.5); border: 1px solid rgba(255,255,255,.05); border-radius: 16px; padding: 24px; }
        .dash-section-title { font-size: 16px; font-weight: 700; color: #f1f5f9; margin: 0 0 20px; }
        .dash-empty-hint { font-size: 14px; color: #475569; }

        .dash-source-list { display: flex; flex-direction: column; gap: 14px; }
        .dash-source-item { display: flex; align-items: center; gap: 12px; }
        .dash-source-name { width: 70px; font-size: 13px; color: #e2e8f0; text-transform: capitalize; font-weight: 500; }
        .dash-source-bar-bg { flex: 1; height: 8px; background: rgba(255,255,255,.05); border-radius: 4px; overflow: hidden; }
        .dash-source-bar-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #a78bfa); border-radius: 4px; transition: width .6s ease; }
        .dash-source-count { width: 30px; font-size: 13px; color: #94a3b8; text-align: right; font-weight: 600; }

        .dash-recent-list { display: flex; flex-direction: column; gap: 12px; }
        .dash-recent-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 12px; transition: .2s; }
        .dash-recent-item:hover { background: rgba(255,255,255,.03); }
        .dash-recent-avatar { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #6366f1, #a855f7); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: white; flex-shrink: 0; }
        .dash-recent-info { display: flex; flex-direction: column; flex: 1; min-width: 0; }
        .dash-recent-name { font-size: 14px; font-weight: 600; color: #f1f5f9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .dash-recent-meta { font-size: 12px; color: #475569; text-transform: capitalize; }
        .dash-recent-status { padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: capitalize; }
        .dash-recent-status--new { background: rgba(59,130,246,.1); color: #60a5fa; }
        .dash-recent-status--contacted { background: rgba(139,92,246,.1); color: #a78bfa; }
        .dash-recent-status--qualified { background: rgba(16,185,129,.1); color: #34d399; }
        .dash-recent-status--converted { background: rgba(245,158,11,.1); color: #fbbf24; }
        .dash-recent-status--lost { background: rgba(239,68,68,.1); color: #f87171; }

        @media (max-width: 1024px) {
          .dash-grid { grid-template-columns: repeat(2, 1fr); }
          .dash-bottom { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
