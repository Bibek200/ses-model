import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
  badge?: string;
  phase?: string;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/crm/dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Leads',
    path: '/crm/leads',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
    phase: 'Phase 1',
  },
  {
    label: 'Customers',
    path: '/crm/customers',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    phase: 'Phase 1',
  },
  {
    label: 'Pipeline',
    path: '/crm/pipeline',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    phase: 'Phase 1',
  },
  {
    label: 'Orders',
    path: '/crm/orders',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
    phase: 'Phase 2',
  },
  {
    label: 'Inventory',
    path: '/crm/inventory',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    phase: 'Phase 2',
  },
  {
    label: 'Campaigns',
    path: '/crm/campaigns',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 2L11 13" />
        <path d="M22 2L15 22L11 13L2 9L22 2Z" />
      </svg>
    ),
    phase: 'Phase 2',
  },
  {
    label: 'Employees',
    path: '/crm/employees',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
      </svg>
    ),
    roles: ['super_admin', 'admin'],
  },
  {
    label: 'Analytics',
    path: '/crm/analytics',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    phase: 'Phase 4',
  },
];

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { user } = useAuth();
  const location = useLocation();

  const filteredItems = navItems.filter((item) => {
    if (item.roles && user && !item.roles.includes(user.role)) return false;
    return true;
  });

  return (
    <aside className={`crm-sidebar ${collapsed ? 'crm-sidebar--collapsed' : ''}`}>
      {/* Header */}
      <div className="crm-sidebar-header">
        <div className="crm-sidebar-logo">
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="url(#sb-grad)" />
            <path d="M12 20L18 14L26 22L20 28L12 20Z" fill="white" fillOpacity="0.9" />
            <path d="M20 12L28 20L26 22L18 14L20 12Z" fill="white" fillOpacity="0.6" />
            <defs>
              <linearGradient id="sb-grad" x1="0" y1="0" x2="40" y2="40">
                <stop stopColor="#6366f1" />
                <stop offset="1" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          {!collapsed && <span className="crm-sidebar-title">Nexus CRM</span>}
        </div>
        <button className="crm-sidebar-toggle" onClick={onToggle} aria-label="Toggle sidebar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {collapsed ? (
              <>
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            ) : (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Nav Links */}
      <nav className="crm-sidebar-nav">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`crm-sidebar-link ${isActive ? 'crm-sidebar-link--active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <span className="crm-sidebar-link-icon">{item.icon}</span>
              {!collapsed && (
                <>
                  <span className="crm-sidebar-link-label">{item.label}</span>
                  {item.phase && (
                    <span className="crm-sidebar-link-badge">{item.phase}</span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User section at bottom */}
      {user && !collapsed && (
        <div className="crm-sidebar-user">
          <div className="crm-sidebar-user-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="crm-sidebar-user-info">
            <span className="crm-sidebar-user-name">{user.name}</span>
            <span className="crm-sidebar-user-role">{user.role.replace('_', ' ')}</span>
          </div>
        </div>
      )}

      <style>{`
        .crm-sidebar {
          width: 260px;
          min-width: 260px;
          height: 100vh;
          background: rgba(7, 11, 27, 0.95);
          border-right: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          flex-direction: column;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: sticky;
          top: 0;
          z-index: 30;
        }

        .crm-sidebar--collapsed {
          width: 72px;
          min-width: 72px;
        }

        .crm-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          min-height: 64px;
        }

        .crm-sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .crm-sidebar-title {
          font-size: 18px;
          font-weight: 700;
          background: linear-gradient(135deg, #c7d2fe, #e9d5ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          white-space: nowrap;
        }

        .crm-sidebar-toggle {
          background: none;
          border: none;
          color: rgba(148, 163, 184, 0.6);
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          display: flex;
          transition: all 0.2s;
        }

        .crm-sidebar-toggle:hover {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(203, 213, 225, 0.9);
        }

        .crm-sidebar-nav {
          flex: 1;
          overflow-y: auto;
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .crm-sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 10px;
          color: rgba(148, 163, 184, 0.8);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.15s ease;
          position: relative;
        }

        .crm-sidebar--collapsed .crm-sidebar-link {
          justify-content: center;
          padding: 10px;
        }

        .crm-sidebar-link:hover {
          background: rgba(255, 255, 255, 0.04);
          color: rgba(226, 232, 240, 0.95);
        }

        .crm-sidebar-link--active {
          background: rgba(99, 102, 241, 0.12);
          color: #a5b4fc;
        }

        .crm-sidebar-link--active .crm-sidebar-link-icon {
          color: #818cf8;
        }

        .crm-sidebar-link--active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 20px;
          background: linear-gradient(180deg, #6366f1, #a855f7);
          border-radius: 0 4px 4px 0;
        }

        .crm-sidebar-link-icon {
          flex-shrink: 0;
          display: flex;
        }

        .crm-sidebar-link-label {
          white-space: nowrap;
        }

        .crm-sidebar-link-badge {
          margin-left: auto;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 6px;
          background: rgba(99, 102, 241, 0.15);
          color: rgba(165, 180, 252, 0.7);
          font-weight: 600;
          white-space: nowrap;
        }

        .crm-sidebar-user {
          padding: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .crm-sidebar-user-avatar {
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

        .crm-sidebar-user-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .crm-sidebar-user-name {
          font-size: 13px;
          font-weight: 600;
          color: rgba(226, 232, 240, 0.9);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .crm-sidebar-user-role {
          font-size: 11px;
          color: rgba(148, 163, 184, 0.6);
          text-transform: capitalize;
        }

        .crm-sidebar-nav::-webkit-scrollbar {
          width: 4px;
        }

        .crm-sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }

        .crm-sidebar-nav::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 4px;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
