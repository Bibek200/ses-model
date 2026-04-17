import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

const CRMLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (isLoading) {
    return (
      <div className="crm-loading-screen">
        <div className="crm-loading-spinner" />
        <style>{`
          .crm-loading-screen {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #030712;
          }
          .crm-loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(99, 102, 241, 0.15);
            border-top-color: #6366f1;
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/crm/login" replace />;
  }

  return (
    <div className="crm-layout">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="crm-layout-main">
        <TopNav />
        <main className="crm-layout-content">
          <Outlet />
        </main>
      </div>

      <style>{`
        .crm-layout {
          display: flex;
          min-height: 100vh;
          background: #030712;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: #e2e8f0;
        }
        .crm-layout-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow-x: hidden;
        }
        .crm-layout-content {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
        }
        @media (max-width: 768px) {
          .crm-layout-content {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default CRMLayout;
