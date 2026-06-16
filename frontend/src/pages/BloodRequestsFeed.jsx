import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  Filter,
  Droplets,
  MapPin,
  AlertTriangle,
  Users,
  Plus,
  Send,
  Calendar,
  X,
  Phone,
  Mail,
  UserCheck,
  Search,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  getBroadcastRequests,
  volunteerForRequest,
  createRequest,
  respondToBroadcastRequest,
} from '../services/requestService';
import { getErrorMessage } from '../services/api';
import { showError, showSuccess } from '../utils/toast';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonCardList } from '../components/ui/Skeleton';
import { BLOOD_GROUPS } from '../utils/bloodGroups';

const EMERGENCY_COLORS = {
  low: 'bg-blue-50 text-blue-700 border-blue-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  urgent: 'bg-rose-50 text-rose-700 border-rose-200',
};

const BloodRequestsFeed = () => {
  const { user } = useAuth();
  const { connected, subscribeToRequests } = useSocket();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    bloodGroup: '',
    city: '',
    emergencyLevel: '',
  });

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [newRequest, setNewRequest] = useState({
    bloodGroup: '',
    city: '',
    emergencyLevel: 'medium',
    message: '',
  });

  const isDonor = user?.role === 'donor';
  const isHospital = user?.role === 'hospital';
  const canCreate = user?.role === 'user' || user?.role === 'hospital';

  // Fetch requests from backend
  const fetchRequests = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');

    try {
      const params = {};
      if (filters.bloodGroup) params.bloodGroup = filters.bloodGroup;
      if (filters.city.trim()) params.city = filters.city.trim();
      if (filters.emergencyLevel) params.emergencyLevel = filters.emergencyLevel;

      const { data } = await getBroadcastRequests(params);
      setRequests(data.requests || []);
    } catch (err) {
      setError(getErrorMessage(err));
      if (!silent) setRequests([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Live updates via sockets
  useEffect(() => {
    const unsubscribe = subscribeToRequests((event) => {
      if (event.type === 'broadcast_request') {
        // Fetch matching filters check
        const matchesBloodGroup = !filters.bloodGroup || event.bloodGroup === filters.bloodGroup;
        const matchesCity = !filters.city || event.city.toLowerCase().includes(filters.city.toLowerCase().trim());
        const matchesEmergency = !filters.emergencyLevel || event.emergencyLevel === filters.emergencyLevel;

        if (matchesBloodGroup && matchesCity && matchesEmergency) {
          setRequests((prev) => {
            if (prev.some((r) => r._id === event.requestId)) return prev;

            const newBroadcastObj = {
              _id: event.requestId,
              bloodGroup: event.bloodGroup,
              city: event.city,
              message: event.message,
              emergencyLevel: event.emergencyLevel,
              createdAt: event.createdAt,
              requestType: 'broadcast',
              status: 'pending',
              volunteers: [],
              requester: {
                _id: event.requesterId,
                name: event.requesterName,
                role: 'user', // default role metadata
              },
            };

            return [newBroadcastObj, ...prev];
          });
        }
      }
    });

    return unsubscribe;
  }, [subscribeToRequests, filters]);

  // Volunteer logic
  const handleVolunteer = async (id) => {
    setActionLoadingId(id);
    try {
      const { data } = await volunteerForRequest(id);
      showSuccess(data.message);
      // update state locally
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? data.request : r))
      );
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  // Hospital response logic
  const handleHospitalRespond = async (id) => {
    setActionLoadingId(id);
    try {
      await respondToBroadcastRequest(id);
      showSuccess('Response sent to the requester successfully!');
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  // Submit Broadcast Request modal
  const handleCreateBroadcast = async (e) => {
    e.preventDefault();
    if (!newRequest.bloodGroup) {
      showError('Please select a blood group');
      return;
    }
    if (!newRequest.city.trim()) {
      showError('Please specify the city');
      return;
    }

    setModalLoading(true);
    try {
      await createRequest({
        requestType: 'broadcast',
        bloodGroup: newRequest.bloodGroup,
        city: newRequest.city.trim(),
        emergencyLevel: newRequest.emergencyLevel,
        message: newRequest.message,
        emergency: newRequest.emergencyLevel === 'urgent' || newRequest.emergencyLevel === 'high',
      });

      showSuccess('Broadcast request created successfully');
      setModalOpen(false);
      setNewRequest({
        bloodGroup: '',
        city: '',
        emergencyLevel: 'medium',
        message: '',
      });
      fetchRequests();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setModalLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      bloodGroup: '',
      city: '',
      emergencyLevel: '',
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
              <Radio className="w-7 h-7 text-rose-500 animate-pulse" />
              Emergency Broadcast Feed
            </h1>
            {connected && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase ring-2 ring-emerald-50">
                Live
              </span>
            )}
          </div>
          <p className="text-slate-500 mt-1 text-sm">
            Real-time emergency blood requests visible to all matching users and hospitals.
          </p>
        </div>

        {canCreate && (
          <Button
            onClick={() => {
              if (user?.role === 'hospital' && !user?.isVerified) return;
              setModalOpen(true);
            }}
            disabled={user?.role === 'hospital' && !user?.isVerified}
            title={user?.role === 'hospital' && !user?.isVerified ? "Available after admin verification" : ""}
            className="self-start sm:self-center flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white shadow-lg shadow-rose-500/25 border-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            Broadcast Request
          </Button>
        )}
      </div>

      {/* FILTER PANEL */}
      <div className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-5 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Filter className="w-4 h-4 text-brand-600" />
            Filters
          </div>
          {(filters.bloodGroup || filters.city || filters.emergencyLevel) && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-rose-600 hover:text-rose-500 font-semibold"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Blood group filter */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Blood Group</label>
            <div className="relative">
              <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={filters.bloodGroup}
                onChange={(e) => setFilters((f) => ({ ...f, bloodGroup: e.target.value }))}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white/80 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
              >
                <option value="">All groups</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* City filter */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">City</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Any city"
                value={filters.city}
                onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white/80 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
              />
            </div>
          </div>

          {/* Emergency Level Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Emergency Level</label>
            <div className="relative">
              <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={filters.emergencyLevel}
                onChange={(e) => setFilters((f) => ({ ...f, emergencyLevel: e.target.value }))}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white/80 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
              >
                <option value="">All levels</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* FEED GRID */}
      {loading ? (
        <SkeletonCardList count={4} />
      ) : error ? (
        <div className="text-center py-16 rounded-2xl bg-red-50 border border-red-100">
          <p className="text-red-600 font-medium">{error}</p>
          <Button variant="secondary" className="mt-4" onClick={() => fetchRequests()}>
            Try again
          </Button>
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={Radio}
          title="No broadcast requests yet"
          description="Try modifying your filters or post a new request to notify the community."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {requests.map((request, index) => {
            const hasVolunteered = request.volunteers?.some(
              (v) => v.donorId === user?._id || v.donorId?._id === user?._id
            );
            const isRequester =
              request.requester?._id === user?._id || request.requester === user?._id;

            return (
              <motion.article
                key={request._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl border border-white/60 bg-white/75 backdrop-blur-xl p-5 shadow-soft border-l-4 border-l-rose-500 relative overflow-hidden"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-rose-500/20">
                      {request.bloodGroup}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-base">
                          {request.hospitalName || request.requester?.hospitalName || request.requester?.name || 'Anonymous'}
                        </h3>
                        {isRequester && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">
                            Your Request
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {request.city}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold uppercase tracking-wider border ${
                        EMERGENCY_COLORS[request.emergencyLevel] ||
                        EMERGENCY_COLORS.medium
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {request.emergencyLevel}
                    </span>

                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(request.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* MESSAGE */}
                {request.message && (
                  <p className="mt-4 text-sm text-slate-600 bg-slate-50/70 rounded-xl p-3 border border-slate-100">
                    {request.message}
                  </p>
                )}

                {/* DYNAMIC VIEW FOR VOLUNTEERS OR CONTACTS */}
                {/* 1. DONOR CAN VOLUNTEER */}
                {isDonor && (
                  <div className="mt-5 flex items-center gap-3">
                    {hasVolunteered ? (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 font-semibold text-sm rounded-xl border border-emerald-200">
                        <UserCheck className="w-4 h-4" />
                        You volunteered!
                      </span>
                    ) : (
                      <Button
                        onClick={() => handleVolunteer(request._id)}
                        loading={actionLoadingId === request._id}
                        className="bg-brand-600 hover:bg-brand-500 text-white font-medium shadow-md flex items-center gap-2"
                      >
                        <Droplets className="w-4 h-4" />
                        I Can Donate
                      </Button>
                    )}
                  </div>
                )}

                {/* 2. REQUESTER VIEW (INTERESTED DONORS LIST) */}
                {isRequester && (
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Users className="w-4 h-4 text-rose-500" />
                      Interested Donors ({request.volunteers?.length || 0})
                    </h4>
                    {request.volunteers?.length === 0 ? (
                      <p className="text-xs text-slate-400">No donors have volunteered yet. Sockets are listening...</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {request.volunteers.map((vol) => (
                          <div
                            key={vol.donorId}
                            className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col gap-1 text-xs"
                          >
                            <span className="font-semibold text-slate-800">{vol.name}</span>
                            <span className="text-slate-500 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {vol.phoneNumber || 'N/A'}
                            </span>
                            <span className="text-slate-500 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {vol.email || 'N/A'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. HOSPITAL INTEGRATION */}
                {isHospital && (
                  <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                    <div className="flex flex-wrap gap-3 text-slate-500">
                      {request.requester?.phoneNumber && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {request.requester.phoneNumber}
                        </span>
                      )}
                      {request.requester?.email && (
                        <span className="inline-flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {request.requester.email}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          if (user?.role === 'hospital' && !user?.isVerified) return;
                          handleHospitalRespond(request._id);
                        }}
                        disabled={user?.role === 'hospital' && !user?.isVerified}
                        title={user?.role === 'hospital' && !user?.isVerified ? "Available after admin verification" : ""}
                        loading={actionLoadingId === request._id}
                        className="text-xs font-semibold py-1.5 px-3 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Respond to Request
                      </Button>
                      {user?.role === 'hospital' && !user?.isVerified ? (
                        <span
                          className="inline-flex items-center gap-1 text-slate-400 cursor-not-allowed font-semibold"
                          title="Available after admin verification"
                        >
                          <Search className="w-4 h-4" />
                          Search Directory
                        </span>
                      ) : (
                        <Link
                          to={`/hospital-donors`}
                          className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-500 font-semibold transition-colors"
                        >
                          <Search className="w-4 h-4" />
                          Search Directory
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>
      )}

      {/* CREATE BROADCAST REQUEST MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setModalOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
                  Create Broadcast Request
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateBroadcast} className="space-y-4">
                {/* Blood Group */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Blood Group Required</label>
                  <div className="relative">
                    <Droplets className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={newRequest.bloodGroup}
                      onChange={(e) => setNewRequest((n) => ({ ...n, bloodGroup: e.target.value }))}
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
                    >
                      <option value="">Select blood group</option>
                      {BLOOD_GROUPS.map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">City / Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Vijayawada"
                      value={newRequest.city}
                      onChange={(e) => setNewRequest((n) => ({ ...n, city: e.target.value }))}
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
                    />
                  </div>
                </div>

                {/* Emergency Level */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Emergency Level</label>
                  <div className="relative">
                    <AlertTriangle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={newRequest.emergencyLevel}
                      onChange={(e) => setNewRequest((n) => ({ ...n, emergencyLevel: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Message / Details</label>
                  <textarea
                    placeholder="Provide details about hospital name, contact person, or urgent timing..."
                    value={newRequest.message}
                    onChange={(e) => setNewRequest((n) => ({ ...n, message: e.target.value }))}
                    rows={3}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={modalLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={modalLoading} className="bg-rose-600 text-white flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Broadcast Now
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BloodRequestsFeed;
