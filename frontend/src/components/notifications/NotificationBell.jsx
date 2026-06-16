import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Droplets,
  CheckCircle2,
  XCircle,
  Inbox,
  Wifi,
  WifiOff,
  Shield,
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const formatTime = (iso) => {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 10) return 'Just now';
  if (diffMins < 1) return 'Just now';
  if (diffMins === 1) return '1 minute ago';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const NotificationIcon = ({ item }) => {
  if (item.type === 'new_request' || item.type === 'broadcast_request') {
    return <Droplets className="w-4 h-4" />;
  }
  if (item.type === 'admin_update') {
    return <Shield className="w-4 h-4" />;
  }
  if (item.status === 'accepted') {
    return <CheckCircle2 className="w-4 h-4" />;
  }
  return <XCircle className="w-4 h-4" />;
};

const iconClassFor = (item) => {
  if (item.type === 'new_request' || item.type === 'broadcast_request') return 'bg-rose-100 text-rose-600';
  if (item.type === 'admin_update') return 'bg-violet-100 text-violet-600';
  if (item.status === 'accepted') return 'bg-emerald-100 text-emerald-600';
  if (item.status === 'rejected') return 'bg-red-100 text-red-600';
  return 'bg-amber-100 text-amber-600';
};

const NotificationBell = () => {
  const { user } = useAuth();
  const {
    connected,
    notifications,
    unreadCount,
    markAllRead,
    markAsRead,
    onlineUsers,
  } = useSocket();

  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const isAdmin = user?.role === 'admin';
  const footerPath = isAdmin
    ? '/admin-dashboard'
    : user?.role === 'donor'
      ? '/requests-received'
      : '/my-requests';
  const footerLabel = isAdmin ? 'Open admin dashboard' : 'View all requests';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      markAllRead();
    }
  }, [open, markAllRead]);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            key={unreadCount}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold ring-2 ring-white"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
        <span
          className={`absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-white
            ${connected ? 'bg-emerald-500' : 'bg-slate-400'}`}
          title={connected ? 'Live connected' : 'Reconnecting...'}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            className="absolute right-0 mt-2 w-[min(100vw-2rem,380px)] rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-2xl shadow-slate-200/50 overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 text-sm">Notifications</p>
                <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                  {connected ? (
                    <>
                      <Wifi className="w-3 h-3 text-emerald-500" />
                      Live · {onlineUsers.length} online
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3" />
                      Connecting...
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="max-h-[min(60vh,400px)] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 text-center px-4">
                  <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-600">No notifications yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {isAdmin
                      ? 'Platform alerts appear here when users or requests change.'
                      : 'Real-time alerts appear when requests are sent or updated.'}
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {notifications.map((item) => {
                    const isHospitalRelated = 
                      item.metadata?.hospitalName || 
                      item.requesterName?.toLowerCase().includes('hospital') || 
                      item.title?.toLowerCase().includes('hospital') || 
                      item.body?.toLowerCase().includes('hospital') ||
                      item.message?.toLowerCase().includes('hospital');

                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => markAsRead(item.id)}
                          className={`w-full text-left px-4 py-3 hover:bg-slate-50/80 transition-colors relative
                            ${!item.read ? 'bg-brand-50/40' : ''}`}
                        >
                          <div className="flex gap-3">
                            <div
                              className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${iconClassFor(item)}`}
                            >
                              <NotificationIcon item={item} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-900 leading-snug pr-4">
                                {item.title}
                              </p>
                              {item.body || item.message ? (
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                                  {item.body || item.message}
                                </p>
                              ) : null}

                              {/* Badges container */}
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {item.bloodGroup && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-100/50">
                                    🩸 {item.bloodGroup}
                                  </span>
                                )}
                                {item.emergency && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200/50 uppercase tracking-wider">
                                    ⚠️ Emergency
                                  </span>
                                )}
                                {isHospitalRelated && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100/50">
                                    🏥 Hospital
                                  </span>
                                )}
                              </div>

                              <p className="text-[10px] text-slate-400 mt-1.5">
                                {formatTime(item.createdAt)}
                              </p>
                            </div>
                          </div>
                          {!item.read && (
                            <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-brand-600 ring-2 ring-white" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
              <Link
                to={footerPath}
                onClick={() => setOpen(false)}
                className="block text-center text-xs font-semibold text-brand-600 hover:text-brand-500 py-1"
              >
                {footerLabel} →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
