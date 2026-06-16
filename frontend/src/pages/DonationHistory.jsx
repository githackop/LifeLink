import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  History,
  RefreshCw,
  Heart,
  Users,
  Calendar,
  Activity,
  Percent,
  MapPin,
  Building2,
  Droplets,
  Mail,
  Phone,
  FileText,
  UserCheck,
} from 'lucide-react';
import { getDonationHistory, getRequestStats } from '../services/requestService';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const DonationHistory = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [historyRes, statsRes] = await Promise.all([
        getDonationHistory(),
        getRequestStats(),
      ]);
      setDonations(historyRes.data.donations || []);
      setStats(statsRes.data.stats || null);
    } catch (err) {
      setError(getErrorMessage(err));
      setDonations([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Statistics calculation helpers
  const totalDonations = stats?.acceptedRequests ?? donations.length;
  const livesHelped = totalDonations; // 1 donation = 1 life helped

  const lastDonationDate =
    donations.length > 0
      ? new Date(donations[0].updatedAt || donations[0].createdAt).toLocaleDateString()
      : 'N/A';

  const acceptanceRate =
    stats?.totalRequestsReceived > 0
      ? ((stats.acceptedRequests / stats.totalRequestsReceived) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4">
      {/* HEADER SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <History className="w-8 h-8 text-rose-500" />
            Donation Dashboard
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            View your donation impact, availability parameters, and direct request history timeline.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchHistory}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-16 rounded-2xl bg-red-50 border border-red-100">
          <p className="text-red-600 font-medium">{error}</p>
          <Button variant="secondary" className="mt-4" onClick={fetchHistory}>
            Try again
          </Button>
        </div>
      ) : (
        <>
          {/* STAT CARDS SECTION */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
          >
            {/* CARD 1: TOTAL DONATIONS */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-soft p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Total Donations</span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-black text-slate-900 leading-tight">{totalDonations}</span>
                <span className="text-[10px] text-slate-400 block font-medium mt-0.5">Fulfillments</span>
              </div>
            </div>

            {/* CARD 2: LIVES HELPED */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-soft p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Lives Helped</span>
                <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-black text-slate-900 leading-tight">{livesHelped}</span>
                <span className="text-[10px] text-slate-400 block font-medium mt-0.5">Patients Assisted</span>
              </div>
            </div>

            {/* CARD 3: LAST DONATION */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-soft p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Last Donation</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-base font-extrabold text-slate-900 leading-tight block truncate">
                  {lastDonationDate}
                </span>
                <span className="text-[10px] text-slate-400 block font-medium mt-1">Donation Date</span>
              </div>
            </div>

            {/* CARD 4: AVAILABILITY STATUS */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-soft p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Availability</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span
                  className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                    user?.availability
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {user?.availability ? 'Available' : 'Unavailable'}
                </span>
                <span className="text-[10px] text-slate-400 block font-medium mt-1.5">Profile Context</span>
              </div>
            </div>

            {/* CARD 5: ACCEPTANCE RATE */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-soft p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Acceptance Rate</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Percent className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-black text-slate-900 leading-tight">{acceptanceRate}%</span>
                <span className="text-[10px] text-slate-400 block font-medium mt-0.5">Fulfillment Ratio</span>
              </div>
            </div>
          </motion.div>

          {/* TIMELINE SECTION */}
          {donations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 rounded-3xl border border-dashed border-slate-200 bg-white/50 max-w-xl mx-auto shadow-sm"
            >
              <History className="w-14 h-14 text-slate-300 mx-auto mb-3" />
              <h3 className="font-extrabold text-slate-800 text-base">No donation history available yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Once you accept and fulfill direct requests, your historical records will construct an interactive timeline.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                Fulfillment Timeline
              </h2>

              {/* Vertical Timeline Wrapper */}
              <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 ml-3 sm:ml-4 space-y-6">
                {donations.map((donation, index) => {
                  const requester = donation.requester;
                  const isHospital = requester?.role === 'hospital' || !!requester?.hospitalName;
                  const avatarBg = isHospital
                    ? 'bg-gradient-to-br from-teal-500 to-emerald-600'
                    : 'bg-gradient-to-br from-violet-500 to-indigo-600';

                  const donationDateString = new Date(
                    donation.completedAt || donation.updatedAt || donation.createdAt
                  ).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <motion.div
                      key={donation._id}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative"
                    >
                      {/* Left Timeline Dot */}
                      <span className="absolute -left-[37px] sm:-left-[45px] top-1.5 w-6 h-6 rounded-full bg-emerald-50 border-4 border-emerald-500 flex items-center justify-center shadow-sm z-10">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      </span>

                      {/* Donation timeline event header */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                          Donation Completed
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-400 font-bold">{donationDateString}</span>
                      </div>

                      {/* Timeline Card */}
                      <div className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-5 shadow-soft hover:shadow-md transition-shadow max-w-3xl space-y-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold shadow-sm ${avatarBg}`}
                          >
                            {isHospital ? (
                              <Building2 className="w-4.5 h-4.5" />
                            ) : (
                              requester?.name?.charAt(0)?.toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-extrabold text-slate-900 text-sm">
                                {requester?.hospitalName || requester?.name || 'Anonymous Recipient'}
                              </h4>
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-slate-100 text-slate-600 border uppercase">
                                {requester?.role || 'User'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 flex items-center gap-0.5 mt-0.5 font-medium">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {requester?.city || donation.city || 'N/A'}
                            </p>
                          </div>
                        </div>

                        {/* Recipient details */}
                        <div className="grid grid-cols-2 gap-2 bg-slate-50/50 rounded-xl p-3 border border-slate-100 text-xs">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-slate-400 font-medium uppercase tracking-wider text-[9px]">Blood Group</span>
                            <span className="text-rose-700 font-extrabold text-sm flex items-center gap-1">
                              <Droplets className="w-4 h-4 fill-rose-500 text-rose-500" />
                              {donation.bloodGroup}
                            </span>
                          </div>
                          {donation.hospitalName && (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-slate-400 font-medium uppercase tracking-wider text-[9px]">Hospital Facility</span>
                              <span className="text-slate-800 font-bold truncate">
                                {donation.hospitalName}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Donation Notes (Message) */}
                        {donation.message && (
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wide block">Donation Notes</span>
                            <p className="text-xs text-slate-600 bg-white/60 p-3 border border-slate-100 rounded-xl italic leading-relaxed">
                              "{donation.message}"
                            </p>
                          </div>
                        )}

                        {/* Fulfill details */}
                        <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-400 font-medium">
                          {requester?.email && (
                            <span className="inline-flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5" />
                              {requester.email}
                            </span>
                          )}
                          {requester?.phoneNumber && (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                              <Phone className="w-3.5 h-3.5" />
                              {requester.phoneNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DonationHistory;
