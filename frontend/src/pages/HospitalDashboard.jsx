import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Building2,
  FileBadge,
  MapPin,
  Activity,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { getHospitalDashboard } from '../services/dashboardService';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/dashboard/StatCard';
import RecentActivity from '../components/dashboard/RecentActivity';
import DonorListCard from '../components/requests/DonorListCard';
import RequestCard from '../components/requests/RequestCard';
import { DashboardError, DashboardLoading } from '../components/dashboard/DashboardState';

const HospitalDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data: res } = await getHospitalDashboard();
      setData(res.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setData({
          stats: {},
          user: user,
          donors: [],
          emergencyRequests: [],
          recentActivity: [],
        });
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) return <DashboardLoading />;
  if (error) return <DashboardError message={error} onRetry={fetchDashboard} />;

  const stats = data?.stats || {};
  const profile = data?.user || user;
  const donors = data?.donors || [];
  const emergencyList = data?.emergencyRequests || [];
  const isUnverified = user?.role === 'hospital' && !user?.isHospitalVerified;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 sm:p-8 text-white shadow-xl shadow-emerald-500/25"
      >
        <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <p className="text-emerald-100 text-sm font-medium">Hospital portal</p>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">
            {data?.hospitalName || profile?.hospitalName}
          </h1>
          <div className="flex flex-wrap gap-3 mt-4 text-sm">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15">
              <FileBadge className="w-4 h-4" />
              {profile?.licenseNumber}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15">
              <MapPin className="w-4 h-4" />
              {profile?.city}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Registered Donors"
          value={stats.totalDonors ?? stats.connectedDonors ?? 0}
          icon={Users}
          accent="sky"
          delay={0.05}
        />
        <StatCard
          title="Active Requests"
          value={stats.activeRequests ?? 0}
          subtitle="Pending + accepted"
          icon={Activity}
          accent="emerald"
          delay={0.1}
        />
        <StatCard
          title="Emergency Requests"
          value={stats.emergencyRequests ?? stats.emergencyRequestsCount ?? 0}
          icon={AlertTriangle}
          accent="amber"
          delay={0.15}
        />
        <StatCard
          title="Pending"
          value={stats.pendingRequests ?? 0}
          icon={Clock}
          accent="violet"
          delay={0.2}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-5 shadow-soft flex items-start gap-3"
      >
        <Building2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-900 text-sm">Facility address</p>
          <p className="text-sm text-slate-500 mt-1">{profile?.address}</p>
        </div>
      </motion.div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Recent emergency requests
          </h2>
          {isUnverified ? (
            <span
              className="text-sm font-medium text-slate-400 cursor-not-allowed"
              title="Available after admin verification"
            >
              View all →
            </span>
          ) : (
            <Link to="/emergency-requests" className="text-sm font-medium text-brand-600 hover:text-brand-500">
              View all →
            </Link>
          )}
        </div>
        {emergencyList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/40 p-8 text-center">
            <p className="text-sm text-slate-600">No emergency requests yet.</p>
            {isUnverified ? (
              <span
                className="inline-block mt-2 text-sm font-medium text-slate-400 cursor-not-allowed"
                title="Available after admin verification"
              >
                Send an emergency request →
              </span>
            ) : (
              <Link to="/search-donors" className="inline-block mt-2 text-sm font-medium text-amber-700">
                Send an emergency request →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {emergencyList.map((request, index) => (
              <RequestCard key={request._id} request={request} view="sent" index={index} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-500" />
            Donor database preview
          </h2>
          {isUnverified ? (
            <span
              className="text-sm font-medium text-slate-400 cursor-not-allowed"
              title="Available after admin verification"
            >
              View all donors →
            </span>
          ) : (
            <Link to="/donor-database" className="text-sm font-medium text-brand-600 hover:text-brand-500">
              View all donors →
            </Link>
          )}
        </div>
        {donors.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 p-8 text-center">
            <p className="text-sm text-slate-600">No donors registered on the platform yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {donors.map((donor, index) => (
              <DonorListCard key={donor._id} donor={donor} index={index} compact />
            ))}
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-3">
        {isUnverified ? (
          <span
            className="text-sm font-medium text-slate-400 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 inline-flex items-center gap-1.5 cursor-not-allowed"
            title="Available after admin verification"
          >
            <CheckCircle2 className="w-4 h-4" />
            All sent requests
          </span>
        ) : (
          <Link
            to="/my-requests"
            className="text-sm font-medium text-brand-600 bg-brand-50 px-4 py-2 rounded-xl border border-brand-100 inline-flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            All sent requests
          </Link>
        )}
      </div>

      <RecentActivity items={data?.recentActivity || []} />
    </div>
  );
};

export default HospitalDashboard;
