import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../api/crmApi';

const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const res = await analyticsApi.getOverview();
      if (res.success && res.data) setData(res.data);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="ana-loading"><div className="ana-spinner" /></div>;

  const { stats, sourceDistribution } = data || {};

  return (
    <div className="analytics-page">
      <div className="ana-header">
        <h1 className="ana-title">Business Intelligence</h1>
        <p className="ana-subtitle">Data-driven insights for your CRM operations</p>
      </div>

      <div className="ana-stats-grid">
        <div className="ana-stat-card">
          <span className="stat-label">Total Revenue</span>
          <span className="stat-value">₹{stats?.totalRevenue.toLocaleString()}</span>
          <span className="stat-trend trend-up">+12.5% vs last month</span>
        </div>
        <div className="ana-stat-card">
          <span className="stat-label">Acquired Leads</span>
          <span className="stat-value">{stats?.totalLeads}</span>
          <span className="stat-trend trend-up">+8.2% vs last month</span>
        </div>
        <div className="ana-stat-card">
          <span className="stat-label">Active Customers</span>
          <span className="stat-value">{stats?.customersCount}</span>
          <span className="stat-trend trend-down">-1.4% vs last month</span>
        </div>
      </div>

      <div className="ana-charts-row">
        <div className="ana-chart-box">
          <h3>Lead Sources</h3>
          <div className="source-list">
            {sourceDistribution?.map((s: any) => (
              <div key={s._id} className="source-item">
                <span className="source-name">{s._id || 'Direct'}</span>
                <div className="source-bar-bg">
                  <div 
                    className="source-bar-fill" 
                    style={{ width: `${(s.count / stats?.totalLeads) * 100}%` }} 
                  />
                </div>
                <span className="source-count">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="ana-chart-box">
          <h3>AI Insights</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Based on current trends, your most profitable lead source is <strong style={{ color: '#6366f1' }}>Webhooks</strong>. 
            Automated WhatsApp campaigns have increased engagement by <strong style={{ color: '#34d399' }}>24%</strong> this week.
          </p>
          <div className="ai-badge">Gemini Powered</div>
        </div>
      </div>

      <style>{`
        .analytics-page { animation: fadeIn 0.4s ease-out; }
        .ana-header { margin-bottom: 32px; }
        .ana-title { font-size: 24px; font-weight: 700; color: #f1f5f9; margin: 0; }
        .ana-subtitle { font-size: 14px; color: #94a3b8; margin: 4px 0 0; }
        
        .ana-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 32px; }
        .ana-stat-card { background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; }
        .stat-label { font-size: 13px; font-weight: 600; color: #94a3b8; text-transform: uppercase; margin-bottom: 12px; }
        .stat-value { font-size: 32px; font-weight: 800; color: #f1f5f9; margin-bottom: 8px; }
        .stat-trend { font-size: 12px; font-weight: 600; }
        .trend-up { color: #34d399; }
        .trend-down { color: #f87171; }
        
        .ana-charts-row { display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; }
        .ana-chart-box { background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 24px; }
        .ana-chart-box h3 { font-size: 16px; font-weight: 700; color: #f1f5f9; margin: 0 0 20px; }
        
        .source-item { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .source-name { width: 80px; font-size: 13px; color: #e2e8f0; text-transform: capitalize; }
        .source-bar-bg { flex: 1; height: 8px; background: rgba(255, 255, 255, 0.05); border-radius: 4px; overflow: hidden; }
        .source-bar-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 4px; }
        .source-count { width: 30px; font-size: 12px; color: #94a3b8; text-align: right; }
        
        .ai-badge { display: inline-block; margin-top: 20px; padding: 4px 10px; background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 20px; color: #818cf8; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        
        .ana-loading { padding: 60px; display: flex; justify-content: center; }
        .ana-spinner { width: 30px; height: 30px; border: 3px solid rgba(99, 102, 241, 0.2); border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default AnalyticsPage;
