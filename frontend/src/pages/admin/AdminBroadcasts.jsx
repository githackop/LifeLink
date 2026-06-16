import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Trash2,
  RefreshCw,
  Eye,
  AlertTriangle,
  MapPin,
  Droplets,
  Radio,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { getBroadcastRequests } from '../../services/requestService';
import { deleteAdminBroadcast } from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import { showError, showSuccess } from '../../utils/toast';
import { BLOOD_GROUPS } from '../../utils/bloodGroups';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import BroadcastDetailsModal from '../../components/requests/BroadcastDetailsModal';
import ConfirmModal from '../../components/common/ConfirmModal';

const EMERGENCY_LEVELS = ['low', 'medium', 'high', 'urgent'];

const AdminBroadcasts = () => {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Reusable confirmation modal states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [broadcastToDelete, setBroadcastToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    bloodGroup: '',
    city: '',
    emergencyLevel: '',
    status: '',
  });

  const fetchBroadcasts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.bloodGroup) params.bloodGroup = filters.bloodGroup;
      if (filters.city.trim()) params.city = filters.city.trim();
      if (filters.emergencyLevel) params.emergencyLevel = filters.emergencyLevel;
      if (filters.status) params.status = filters.status;

      const { data } = await getBroadcastRequests(params);
      setBroadcasts(data.requests || []);
    } catch (err) {
      showError(getErrorMessage(err));
      setBroadcasts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(fetchBroadcasts, 300);
    return () => clearTimeout(timer);
  }, [fetchBroadcasts]);

  const handleDeleteClick = (request) => {
    setBroadcastToDelete(request);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!broadcastToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteAdminBroadcast(broadcastToDelete._id);
      showSuccess('Broadcast request deleted successfully');
      setConfirmOpen(false);
      setBroadcastToDelete(null);
      fetchBroadcasts();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleOpenDetails = (request) => {
    setSelectedRequest(request);
    setDetailsOpen(true);
  };

  const handleResetFilters = () => {
    setFilters({
      bloodGroup: '',
      city: '',
      emergencyLevel: '',
      status: '',
    });
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
          <Radio className="w-7 h-7 text-violet-600" />
          Broadcast Management
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Monitor, filter, and moderate active emergency broadcasts</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-5 shadow-soft space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Filter className="w-4 h-4 text-violet-600" />
            Filters
          </div>
          {(filters.bloodGroup || filters.city || filters.emergencyLevel || filters.status) && (
            <button onClick={handleResetFilters} className="text-xs text-rose-600 hover:text-rose-500 font-semibold">
              Clear filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Blood group */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Blood group</label>
            <div className="relative">
              <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Select
              icon={Droplets}
              value={filters.bloodGroup}
              onChange={(e) => setFilters((f) => ({ ...f, bloodGroup: e.target.value }))}
              className="!py-2 text-xs"
            >
              <option value="">All groups</option>
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </Select>
            </div>
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">City</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Any city"
                value={filters.city}
                onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              />
            </div>
          </div>

          {/* Emergency Level */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Emergency level</label>
            <div className="relative">
              <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Select
              icon={AlertTriangle}
              value={filters.emergencyLevel}
              onChange={(e) => setFilters((f) => ({ ...f, emergencyLevel: e.target.value }))}
              className="!py-2 text-xs"
            >
              <option value="">All levels</option>
              {EMERGENCY_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level.toUpperCase()}
                </option>
              ))}
            </Select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Status</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Select
              icon={Clock}
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="!py-2 text-xs"
            >
              <option value="">All status</option>
              <option value="active">Active</option>
              <option value="closed">Resolved / Closed</option>
            </Select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Table grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-soft overflow-hidden"
      >
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3">Patient Name</th>
                  <th className="px-6 py-3">Blood Group</th>
                  <th className="px-6 py-3">City</th>
                  <th className="px-6 py-3">Created By</th>
                  <th className="px-6 py-3">Created Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {broadcasts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      No broadcast requests found
                    </td>
                  </tr>
                ) : (
                  broadcasts.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3 font-semibold text-slate-900">
                        {b.patientName || 'Anonymous Patient'}
                      </td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold">
                          <Droplets className="w-3.5 h-3.5 animate-pulse" />
                          {b.bloodGroup}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {b.city}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="font-medium text-slate-950">
                          {b.hospitalName || b.requester?.hospitalName || b.requester?.name}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                          {b.requester?.role || 'Hospital'}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-slate-500 text-xs">
                        {new Date(b.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                            b.status === 'closed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {b.status === 'closed' ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Resolved
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3 h-3 animate-bounce" />
                              Active
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(b)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                          <button
                            type="button"
                            disabled={deleteLoading}
                            onClick={() => handleDeleteClick(b)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Reusable details modal */}
      <BroadcastDetailsModal
        request={selectedRequest}
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedRequest(null);
        }}
      />

      <ConfirmModal
        isOpen={confirmOpen}
        title="Delete Broadcast Request"
        description={`Are you sure you want to delete this broadcast request${broadcastToDelete?.patientName ? ` for ${broadcastToDelete.patientName}` : ''}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setBroadcastToDelete(null);
        }}
        loading={deleteLoading}
        isDanger={true}
      />
    </div>
  );
};

export default AdminBroadcasts;
