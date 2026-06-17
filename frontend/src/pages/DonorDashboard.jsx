import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Droplets, MapPin, Inbox, CheckCircle2, Clock, XCircle, History } from 'lucide-react';
import toast from 'react-hot-toast';
import { getDonorDashboard } from '../services/dashboardService';
import { getRequestStats } from '../services/requestService';
import { updateAvailability } from '../services/donorService';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/dashboard/StatCard';
import RecentActivity from '../components/dashboard/RecentActivity';
import { DashboardError, DashboardLoading } from '../components/dashboard/DashboardState';

const DonorDashboard = () => {
  const { user, updateUser } = useAuth();
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toggleLoading, setToggleLoading] = useState(false);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [dashboardRes, statsRes] = await Promise.all([
        getDonorDashboard(),
        getRequestStats(),
      ]);
      setData(dashboardRes.data.data);
      setStats(statsRes.data.stats);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const profile = data?.user || user;
  const available = profile?.availability ?? false;

  const handleAvailabilityChange = async (nextValue) => {
    setToggleLoading(true);
    try {
      const { data: res } = await updateAvailability(nextValue);
      updateUser(res.user);
      setData((prev) => ({ ...prev, user: res.user }));
      toast.success(res.message);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setToggleLoading(false);
    }
  };

  if (loading) return <DashboardLoading />;
  if (error) return <DashboardError message={error} onRetry={fetchDashboard} />;

  const displayStats = stats || data?.stats || {};

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 p-6 sm:p-8 text-white shadow-xl shadow-rose-500/25 h-full flex flex-col justify-between"
          >
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 h-full">
              <div>
                <p className="text-rose-100 text-sm font-medium">Donor profile</p>
                <h1 className="text-2xl sm:text-3xl font-bold mt-1">{profile?.name}</h1>
                <div className="flex flex-wrap gap-3 mt-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 text-sm font-semibold">
                    <Droplets className="w-4 h-4" />
                    {profile?.bloodGroup}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 text-sm">
                    <MapPin className="w-4 h-4" />
                    {profile?.city || 'City not set'}
                  </span>
                </div>
              </div>
              <span
                className={`self-start sm:self-auto px-4 py-2 rounded-full text-sm font-semibold backdrop-blur
                  ${available ? 'bg-emerald-400/30 text-white' : 'bg-slate-900/30 text-rose-100'}`}
              >
                {available ? '● Available' : '○ Unavailable'}
              </span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl p-6 shadow-soft flex flex-col justify-between min-h-[160px] h-full"
        >
          <div>
            <h2 className="font-semibold text-slate-800 text-lg">Donation Availability</h2>
            <p className="text-slate-500 text-sm mt-1">
              Current Status:{' '}
              <span className={`font-semibold ${available ? 'text-emerald-600' : 'text-slate-500'}`}>
                {available ? 'Available' : 'Unavailable'}
              </span>
            </p>
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-slate-600 font-semibold">Available for Donation</span>
            <button
              type="button"
              disabled={toggleLoading}
              onClick={() => handleAvailabilityChange(!available)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60 flex-shrink-0
                ${available ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-slate-300'}`}
              aria-pressed={available}
              aria-label="Toggle availability"
            >
              {toggleLoading ? (
                <span className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-3.5 h-3.5 border-2 rounded-full animate-spin border-t-transparent ${available ? 'border-white' : 'border-slate-500'}`} />
                </span>
              ) : (
                <motion.span
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={`absolute flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm
                    ${available ? 'left-[calc(100%-1.375rem)]' : 'left-1'}`}
                />
              )}
            </button>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Received"
          value={displayStats.totalRequestsReceived ?? 0}
          icon={Inbox}
          accent="violet"
          delay={0.05}
        />
        <StatCard
          title="Pending"
          value={displayStats.pendingRequests ?? 0}
          icon={Clock}
          accent="amber"
          delay={0.1}
        />
        <StatCard
          title="Accepted"
          value={displayStats.acceptedRequests ?? displayStats.requestsAccepted ?? 0}
          icon={CheckCircle2}
          accent="emerald"
          delay={0.15}
        />
        <StatCard
          title="Rejected"
          value={displayStats.rejectedRequests ?? 0}
          icon={XCircle}
          accent="rose"
          delay={0.2}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/requests-received"
          className="text-sm font-medium text-brand-600 hover:text-brand-500 bg-brand-50 px-4 py-2 rounded-xl border border-brand-100"
        >
          View incoming requests →
        </Link>
        <Link
          to="/donation-history"
          className="text-sm font-medium text-emerald-700 hover:text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 inline-flex items-center gap-1.5"
        >
          <History className="w-4 h-4" />
          Donation history
        </Link>
      </div>

      <RecentActivity items={data?.recentActivity || []} />
    </div>
  );
};

export default DonorDashboard;
