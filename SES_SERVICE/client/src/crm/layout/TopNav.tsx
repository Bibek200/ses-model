import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TopNav: React.FC = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/crm/login');
  };

  return (
    <header className="crm-topnav">
      <div className="crm-topnav-left">
        <h1 className="crm-topnav-title">
          {/* Dynamic title from route could go here */}
        </h1>
      </div>

      <div className="crm-topnav-right">
        {/* Search */}
        <div className="crm-topnav-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="text" placeholder="Search..." className="crm-topnav-search-input" />
          <kbd className="crm-topnav-kbd">⌘K</kbd>
        </div>

        {/* Notifications */}
        <button className="crm-topnav-icon-btn" title="Notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <span className="crm-topnav-notif-dot" />
        </button>

        {/* User dropdown */}
        <div className="crm-topnav-user-wrap" ref={dropdownRef}>
          <button
            className="crm-topnav-user-btn"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="crm-topnav-user-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showDropdown && (
            <div className="crm-topnav-dropdown">
              <div className="crm-topnav-dropdown-header">
                <span className="crm-topnav-dropdown-name">{user?.name}</span>
                <span className="crm-topnav-dropdown-email">{user?.email}</span>
              </div>
              <div className="crm-topnav-dropdown-divider" />
              <button className="crm-topnav-dropdown-item" onClick={() => { navigate('/crm/profile'); setShowDropdown(false); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                Profile
              </button>
              <button className="crm-topnav-dropdown-item" onClick={() => { navigate('/crm/settings'); setShowDropdown(false); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
                Settings
              </button>
              <div className="crm-topnav-dropdown-divider" />
              <button className="crm-topnav-dropdown-item crm-topnav-dropdown-item--danger" onClick={handleLogout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .crm-topnav {
          height: 64px;
          min-height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          background: rgba(7, 11, 27, 0.8);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .crm-topnav-left {
          display: flex;
          align-items: center;
        }

        .crm-topnav-title {
          font-size: 16px;
          font-weight: 600;
          color: rgba(226, 232, 240, 0.9);
          margin: 0;
        }

        .crm-topnav-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .crm-topnav-search {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          color: rgba(148, 163, 184, 0.5);
          min-width: 220px;
          transition: all 0.2s;
        }

        .crm-topnav-search:focus-within {
          border-color: rgba(99, 102, 241, 0.3);
          background: rgba(255, 255, 255, 0.06);
        }

        .crm-topnav-search-input {
          background: none;
          border: none;
          outline: none;
          color: #e2e8f0;
          font-size: 13px;
          font-family: inherit;
          width: 100%;
        }

        .crm-topnav-search-input::placeholder {
          color: rgba(148, 163, 184, 0.4);
        }

        .crm-topnav-kbd {
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(148, 163, 184, 0.5);
          font-family: inherit;
        }

        .crm-topnav-icon-btn {
          background: none;
          border: none;
          color: rgba(148, 163, 184, 0.6);
          cursor: pointer;
          padding: 8px;
          border-radius: 10px;
          display: flex;
          transition: all 0.15s;
          position: relative;
        }

        .crm-topnav-icon-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(226, 232, 240, 0.9);
        }

        .crm-topnav-notif-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 7px;
          height: 7px;
          background: #ef4444;
          border-radius: 50%;
          border: 2px solid rgba(7, 11, 27, 0.95);
        }

        .crm-topnav-user-wrap {
          position: relative;
        }

        .crm-topnav-user-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 8px 4px 4px;
          border-radius: 10px;
          color: rgba(148, 163, 184, 0.6);
          transition: all 0.15s;
        }

        .crm-topnav-user-btn:hover {
          background: rgba(255, 255, 255, 0.04);
        }

        .crm-topnav-user-avatar {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          color: white;
        }

        .crm-topnav-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 240px;
          background: rgba(15, 20, 40, 0.98);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 6px;
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
          animation: dropIn 0.15s ease-out;
        }

        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .crm-topnav-dropdown-header {
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .crm-topnav-dropdown-name {
          font-size: 13px;
          font-weight: 600;
          color: rgba(226, 232, 240, 0.95);
        }

        .crm-topnav-dropdown-email {
          font-size: 11px;
          color: rgba(148, 163, 184, 0.6);
        }

        .crm-topnav-dropdown-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.06);
          margin: 4px 0;
        }

        .crm-topnav-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 9px 12px;
          background: none;
          border: none;
          border-radius: 8px;
          color: rgba(203, 213, 225, 0.8);
          font-size: 13px;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.15s;
          text-align: left;
        }

        .crm-topnav-dropdown-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(226, 232, 240, 0.95);
        }

        .crm-topnav-dropdown-item--danger {
          color: rgba(248, 113, 113, 0.8);
        }

        .crm-topnav-dropdown-item--danger:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #fca5a5;
        }

        @media (max-width: 768px) {
          .crm-topnav-search {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};

export default TopNav;
