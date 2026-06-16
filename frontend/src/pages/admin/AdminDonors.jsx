import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Trash2, RefreshCw, MapPin, Droplets, Eye } from 'lucide-react';
import { showError, showSuccess } from '../../utils/toast';
import { getAdminDonors, deleteAdminDonor } from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import { BLOOD_GROUPS } from '../../utils/bloodGroups';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AdminUserDetailsModal from '../../components/admin/AdminUserDetailsModal';
import ConfirmModal from '../../components/common/ConfirmModal';

const AdminDonors = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bloodGroup, setBloodGroup] = useState('');
  const [city, setCity] = useState('');
  const [actionId, setActionId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Reusable confirmation modal states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [donorToDelete, setDonorToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleViewDetails = (donor) => {
    setSelectedUserId(donor._id);
    setDetailsModalOpen(true);
  };

  const handleDeleteClick = (donor) => {
    setDonorToDelete(donor);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!donorToDelete) return;
    setDeleteLoading(true);
    try {
      const { data } = await deleteAdminDonor(donorToDelete._id);
      showSuccess(data.message);
      setConfirmOpen(false);
      setDonorToDelete(null);
      fetchDonors();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  const fetchDonors = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (bloodGroup) params.bloodGroup = bloodGroup;
      if (city.trim()) params.city = city.trim();
      const { data } = await getAdminDonors(params);
      setDonors(data.donors || []);
    } catch (err) {
      showError(getErrorMessage(err));
      setDonors([]);
    } finally {
      setLoading(false);
    }
  }, [bloodGroup, city]);

  useEffect(() => {
    const timer = setTimeout(fetchDonors, 300);
    return () => clearTimeout(timer);
  }, [fetchDonors]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Donor management</h1>
        <p className="text-slate-500 mt-1 text-sm">Manage registered blood donors</p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={(e) => {
          e.preventDefault();
          fetchDonors();
        }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <select
          value={bloodGroup}
          onChange={(e) => setBloodGroup(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
        >
          <option value="">All blood groups</option>
          {BLOOD_GROUPS.map((bg) => (
            <option key={bg} value={bg}>
              {bg}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Filter by city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
        />
        <Button type="submit" variant="secondary" className="!py-2.5">
          <Filter className="w-4 h-4" />
          Apply
        </Button>
        <Button type="button" variant="secondary" onClick={fetchDonors} className="!py-2.5">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </motion.form>

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
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Blood group</th>
                  <th className="px-6 py-3">City</th>
                  <th className="px-6 py-3">Contact</th>
                  <th className="px-6 py-3">Availability</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No donors found
                    </td>
                  </tr>
                ) : (
                  donors.map((d) => (
                    <tr key={d._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3 font-medium text-slate-900">{d.name}</td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center gap-1 text-rose-700 font-medium">
                          <Droplets className="w-3.5 h-3.5" />
                          {d.bloodGroup || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {d.city || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-slate-600">
                        <div>{d.phoneNumber || '—'}</div>
                        <div className="text-xs text-slate-400">{d.email}</div>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            d.availability
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {d.availability ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleViewDetails(d)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                          <button
                            type="button"
                            disabled={deleteLoading}
                            onClick={() => handleDeleteClick(d)}
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

      <AdminUserDetailsModal
        userId={selectedUserId}
        open={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedUserId(null);
        }}
      />

      <ConfirmModal
        isOpen={confirmOpen}
        title="Delete Donor Profile"
        description={`Are you sure you want to delete donor ${donorToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setDonorToDelete(null);
        }}
        loading={deleteLoading}
        isDanger={true}
      />
    </div>
  );
};

export default AdminDonors;
