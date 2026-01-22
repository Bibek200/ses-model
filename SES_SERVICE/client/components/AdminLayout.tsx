import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Settings,
  MessageSquare,
  LogOut,
  LayoutDashboard,
  Activity,
  ChevronRight,
  Bell,
  Search,
  User as UserIcon
} from 'lucide-react';
import { userService } from '../lib/api';
import { User } from '../types';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    let user = userService.getCurrentUser();
    if (!user) {
      const users = userService.getAllUsers();
      user = users[0];
      userService.setCurrentUser(user);
    }
    setCurrentUser(user);
  }, []);

  const handleLogout = () => {
    userService.logout();
    navigate('/login');
  };

  if (!currentUser) return (
    <div className="h-screen bg-[#020617] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
    </div>
  );

  const isAdmin = currentUser.role === 'admin';

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('webhook-logs')) return 'Webhook Activity Logs';
    if (path.includes('webhook')) return 'Webhook Settings';
    if (path.includes('inquiries')) return 'Customer Inquiries';
    return 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden font-inter">
      {/* Sidebar Decor */}
      <div className="absolute top-0 left-0 w-64 h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-20%] w-[100%] h-[40%] bg-indigo-600/20 blur-[100px] rounded-full"></div>
      </div>

      {/* Sidebar */}
      <aside className="w-72 glass border-r border-white/5 flex flex-col relative z-20">
        <div className="p-8 mb-4">
          <div className="flex items-center gap-3.5 group">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-transform group-hover:scale-110">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter uppercase italic">Nexus</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <div className="px-4 mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Core Navigation</p>
          </div>

          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActive ? 'bg-indigo-600/10 border border-indigo-500/20' : 'hover:bg-white/5 border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3.5">
                  <LayoutDashboard className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <span className={`font-bold text-sm ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>Overview</span>
                </div>
                {isActive && <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>}
              </>
            )}
          </NavLink>

          {isAdmin && (
            <>
              <NavLink
                to="/admin/webhook"
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActive ? 'bg-indigo-600/10 border border-indigo-500/20' : 'hover:bg-white/5 border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3.5">
                      <Settings className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                      <span className={`font-bold text-sm ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>Webhook Setup</span>
                    </div>
                    {isActive && <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>}
                  </>
                )}
              </NavLink>

              <NavLink
                to="/admin/webhook-logs"
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActive ? 'bg-indigo-600/10 border border-indigo-500/20' : 'hover:bg-white/5 border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3.5">
                      <Activity className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                      <span className={`font-bold text-sm ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>Webhook Logs</span>
                    </div>
                    {isActive && <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>}
                  </>
                )}
              </NavLink>
            </>
          )}

          <NavLink
            to="/admin/inquiries"
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActive ? 'bg-indigo-600/10 border border-indigo-500/20' : 'hover:bg-white/5 border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3.5">
                  <MessageSquare className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <span className={`font-bold text-sm ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>Inquiries</span>
                </div>
                {isActive && <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>}
              </>
            )}
          </NavLink>
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-white/[0.03] border border-white/5 rounded-[24px] p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center font-black text-white shadow-xl">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-sm text-white truncate">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-none mt-1">{currentUser.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 border border-white/5 hover:border-red-500/20 transition-all font-bold text-xs"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-20">
        <header className="h-24 px-10 flex items-center justify-between border-b border-white/5 bg-[#020617]/50 backdrop-blur-xl">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">{getPageTitle()}</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-1 w-1 rounded-full bg-indigo-500"></div>
              <p className="text-xs text-slate-500 font-medium">Build Something Epic - Lead Tracker</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/5 rounded-2xl w-80 group focus-within:border-indigo-500/50 transition-all">
              <Search className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400" />
              <input type="text" placeholder="Global dynamic search..." className="bg-transparent border-none outline-none text-sm text-slate-300 w-full placeholder:text-slate-600" />
            </div>

            <button className="relative h-12 w-12 rounded-2xl border border-white/5 hover:bg-white/5 transition-all flex items-center justify-center group">
              <Bell className="h-5 w-5 text-slate-400 group-hover:text-white" />
              <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
            </button>
            <div className="h-10 w-px bg-white/5 mx-2"></div>
            <div className="h-12 w-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 bg-grid-white bg-[size:40px_40px] bg-fixed">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;