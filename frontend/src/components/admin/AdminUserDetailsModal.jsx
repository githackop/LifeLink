import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Clock,
  Activity,
  Heart,
  Building2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Award,
  ListFilter,
  CheckCircle,
  XCircle,
  HelpCircle,
  Database
} from 'lucide-react';
import { getAdminUserDetails } from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import LoadingSpinner from '../ui/LoadingSpinner';

const AdminUserDetailsModal = ({ userId, open, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      if (!open || !userId) return;
      setLoading(true);
      setError('');
      try {
        const res = await getAdminUserDetails(userId);
        setData(res.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [open, userId]);

  if (!open) return null;

  // Formatting dates helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get Role Color Class
  const getRoleBadgeStyle = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'hospital':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'donor':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // Render Stats Grid
  const renderStats = (activity, role, roleSpecificData) => {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Requests Sent</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{activity?.totalRequestsSent ?? 0}</p>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Requests Received</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{activity?.totalRequestsReceived ?? 0}</p>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Accepted</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{activity?.acceptedRequests ?? 0}</p>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Rejected/Pending</p>
          <p className="text-2xl font-bold text-rose-500 mt-1">
            {activity?.rejectedRequests ?? 0} <span className="text-xs text-slate-400 font-normal">/ {activity?.pendingRequests ?? 0}</span>
          </p>
        </div>
        
        {/* Role Specific Quick Stats */}
        {role === 'donor' && roleSpecificData?.requestStats && (
          <div className="col-span-2 bg-rose-50/50 border border-rose-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-rose-600 font-semibold uppercase tracking-wider">Acceptance Rate</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-3xl font-extrabold text-rose-700">{roleSpecificData.requestStats.acceptanceRate}%</p>
              <p className="text-xs text-rose-500">of requests accepted</p>
            </div>
            <div className="w-full bg-rose-200/50 rounded-full h-2 mt-2">
              <div
                className="bg-rose-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${roleSpecificData.requestStats.acceptanceRate}%` }}
              />
            </div>
          </div>
        )}

        {role === 'hospital' && (
          <>
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">Saved Donors</p>
              <p className="text-2xl font-bold text-emerald-800 mt-1">{roleSpecificData?.donorsSaved ?? 0}</p>
            </div>
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">Broadcast Requests</p>
              <p className="text-2xl font-bold text-emerald-800 mt-1">{roleSpecificData?.broadcastRequestsCreated ?? 0}</p>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm pointer-events-auto"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative pointer-events-auto w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/60 bg-white/95 backdrop-blur-xl shadow-2xl p-6 md:p-8 flex flex-col gap-6"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <LoadingSpinner />
              <p className="text-sm font-medium text-slate-500">Fetching profile details...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <XCircle className="w-12 h-12 text-rose-500 mb-3" />
              <h3 className="text-lg font-bold text-slate-800">Failed to load details</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-xs">{error}</p>
              <button
                onClick={onClose}
                className="mt-5 px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          ) : data ? (
            <>
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pb-6 border-b border-slate-100">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {(data.user?.hospitalName || data.user?.name)?.charAt(0)?.toUpperCase()}
                </div>
                <div className="text-center sm:text-left flex-1 space-y-1.5">
                  <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">
                    {data.user?.hospitalName || data.user?.name}
                  </h2>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border tracking-wide ${getRoleBadgeStyle(data.user?.role)}`}>
                      {data.user?.role}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                      data.user?.isBlocked
                        ? 'bg-red-100 text-red-800 border-red-200'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}>
                      {data.user?.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                    {data.user?.role === 'hospital' && (
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                        data.user?.isVerified
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                        {data.user?.isVerified ? 'Verified' : 'Pending Verification'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Main Content Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Panel: Basic Info & Account Details */}
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-violet-500" />
                      Basic Information
                    </h3>
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-3.5">
                      <div className="flex justify-between text-sm gap-2">
                        <span className="text-slate-400 font-medium">Full Name</span>
                        <span className="text-slate-700 font-semibold text-right">{data.user?.name}</span>
                      </div>
                      <div className="flex justify-between text-sm gap-2">
                        <span className="text-slate-400 font-medium flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Email</span>
                        <span className="text-slate-700 font-semibold text-right break-all">{data.user?.email}</span>
                      </div>
                      <div className="flex justify-between text-sm gap-2">
                        <span className="text-slate-400 font-medium flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Phone</span>
                        <span className="text-slate-700 font-semibold text-right">{data.user?.phoneNumber || '—'}</span>
                      </div>
                      <div className="flex justify-between text-sm gap-2">
                        <span className="text-slate-400 font-medium">Blood Group</span>
                        <span className="text-rose-600 font-extrabold">{data.user?.bloodGroup || '—'}</span>
                      </div>
                      <div className="flex justify-between text-sm gap-2">
                        <span className="text-slate-400 font-medium flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Location</span>
                        <span className="text-slate-700 font-semibold text-right">
                          {[data.user?.city, data.user?.address].filter(Boolean).join(', ') || '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4 text-violet-500" />
                      Account Information
                    </h3>
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-3.5 text-sm">
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-400 font-medium">User ID</span>
                        <span className="text-slate-600 font-mono text-xs select-all">{data.user?._id}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-400 font-medium flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Created Date</span>
                        <span className="text-slate-700 font-semibold text-right">{formatDate(data.user?.createdAt)}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-400 font-medium flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Last Updated</span>
                        <span className="text-slate-700 font-semibold text-right">{formatDate(data.user?.updatedAt)}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-400 font-medium">Last Login</span>
                        <span className="text-slate-500 italic">Not tracked</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Panel: Stats & Role-Specific metrics */}
                <div className="space-y-6">
                  {/* Activity Stats */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                      <Activity className="w-4 h-4 text-rose-500" />
                      Activity Information
                    </h3>
                    {renderStats(data.activity, data.user?.role, data.roleSpecificData)}
                  </div>

                  {/* Role Specific info */}
                  {data.user?.role === 'donor' && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                        <Award className="w-4 h-4 text-rose-500" />
                        Donor Details
                      </h3>
                      <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-3.5 text-sm">
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-400 font-medium">Availability Status</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            data.roleSpecificData?.availabilityStatus ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {data.roleSpecificData?.availabilityStatus ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-400 font-medium">Can Contact</span>
                          <span className="text-slate-700 font-semibold">{data.roleSpecificData?.canContact ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-400 font-medium">Emergency Eligible</span>
                          <span className="text-slate-700 font-semibold">{data.roleSpecificData?.emergencyEligible ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-400 font-medium">Last Donation Date</span>
                          <span className="text-slate-700 font-semibold">{formatDate(data.roleSpecificData?.lastDonationDate)}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-400 font-medium">Total Donations</span>
                          <span className="text-rose-600 font-extrabold">{data.roleSpecificData?.totalDonations ?? 0}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {data.user?.role === 'hospital' && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        Hospital Details
                      </h3>
                      <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-3.5 text-sm">
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-400 font-medium">License Number</span>
                          <span className="text-slate-700 font-semibold">{data.user?.licenseNumber || '—'}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-400 font-medium">Verification Status</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            data.user?.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {data.user?.isVerified ? 'Verified' : 'Pending Verification'}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-400 font-medium">Emergency Requests Created</span>
                          <span className="text-slate-700 font-semibold">{data.roleSpecificData?.emergencyRequests ?? 0}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-400 font-medium">Total Saved Donors</span>
                          <span className="text-emerald-700 font-bold">{data.roleSpecificData?.directoryInformation?.totalSavedDonors ?? 0}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-400 font-medium">Last Donor Added</span>
                          <span className="text-slate-700 font-semibold">
                            {data.roleSpecificData?.directoryInformation?.lastDonorAdded
                              ? `${data.roleSpecificData.directoryInformation.lastDonorAdded.name} (${new Date(data.roleSpecificData.directoryInformation.lastDonorAdded.createdAt).toLocaleDateString()})`
                              : 'None'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Bottom Hospital Connections Section (For Donors only) */}
              {data.user?.role === 'donor' && (
                <div className="mt-2 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <Database className="w-4 h-4 text-rose-500" />
                    Hospital Directories Connection ({data.roleSpecificData?.hospitalConnections?.count ?? 0})
                  </h3>
                  {data.roleSpecificData?.hospitalConnections?.hospitals?.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-2xl bg-slate-50/50">
                      <table className="w-full text-left text-xs divide-y divide-slate-100">
                        <thead>
                          <tr className="bg-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                            <th className="px-4 py-2">Hospital Name</th>
                            <th className="px-4 py-2">Email</th>
                            <th className="px-4 py-2">City</th>
                            <th className="px-4 py-2">Saved On</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {data.roleSpecificData.hospitalConnections.hospitals.map((conn) => (
                            <tr key={conn._id} className="hover:bg-slate-50">
                              <td className="px-4 py-2 font-medium text-slate-800">{conn.hospitalName || conn.name}</td>
                              <td className="px-4 py-2 text-slate-600">{conn.email || '—'}</td>
                              <td className="px-4 py-2 text-slate-600">{conn.city || '—'}</td>
                              <td className="px-4 py-2 text-slate-500">{new Date(conn.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                      This donor has not been added to any hospital directories yet.
                    </div>
                  )}
                </div>
              )}
            </>
          ) : null}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AdminUserDetailsModal;
