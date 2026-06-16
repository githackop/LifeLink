import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Droplets,
  LogOut,
  Menu,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/notifications/NotificationBell';
import { getInitials, roleLabels, sidebarMenus } from '../utils/roleConfig';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const menuItems = sidebarMenus[user?.role] || sidebarMenus.user;
  const badge = roleLabels[user?.role] || roleLabels.user;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
    ${isActive
      ? 'bg-gradient-to-r from-brand-600/10 to-rose-600/10 text-brand-700 shadow-sm border border-brand-200/50'
      : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'}`;

  const sidebarContent = (
    <>
      <div className="flex items-center gap-3 px-2 py-1">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-brand-600 to-rose-600 shadow-lg shadow-rose-500/25">
          <Droplets className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-bold text-slate-900 text-lg leading-tight">LifeLink</p>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
            Healthcare
          </p>
        </div>
      </div>

      <span
        className={`inline-flex self-start mt-6 px-2.5 py-1 rounded-lg text-xs font-semibold border ${badge.color}`}
      >
        {badge.label}
      </span>

      <nav className="mt-8 flex flex-col gap-1 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={navLinkClass}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Logout
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/20 to-sky-50/30">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 flex flex-col p-6 border-r border-white/40 bg-white/80 backdrop-blur-xl shadow-xl transition-transform duration-300 lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <button
          type="button"
          className="lg:hidden absolute top-4 right-4 p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
        {sidebarContent}
      </aside>

      <div className="lg:pl-72 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 border-b border-white/50 bg-white/70 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 h-16">
            <button
              type="button"
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 lg:flex-none" />

            <div className="flex items-center gap-2 sm:gap-4">
              <NotificationBell />

              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex items-center gap-2 sm:gap-3 p-1.5 sm:pr-3 rounded-xl hover:bg-slate-100/80 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-rose-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                    {getInitials(user?.name)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-slate-900 leading-tight truncate max-w-[120px]">
                      {user?.name}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                  </div>
                  <ChevronDown className="hidden sm:block w-4 h-4 text-slate-400" />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50 py-2 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>
                      <NavLink
                        to="/profile"
                        className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setProfileOpen(false)}
                      >
                        View profile
                      </NavLink>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {user?.role === 'hospital' && !user?.isHospitalVerified && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3 shadow-sm animate-pulse">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 text-sm">
                  Your hospital account is awaiting admin approval.
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Hospital features will be unlocked after verification.
                </p>
              </div>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
