import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Ban, CheckCircle, ShieldCheck, ShieldX, RefreshCw, Eye } from 'lucide-react';
import { showError, showSuccess } from '../../utils/toast';
import {
  getAdminHospitals,
  toggleHospitalVerify,
  toggleHospitalBlock,
} from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AdminUserDetailsModal from '../../components/admin/AdminUserDetailsModal';

const AdminHospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const handleViewDetails = (hospital) => {
    setSelectedUserId(hospital._id);
    setDetailsModalOpen(true);
  };

  const fetchHospitals = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAdminHospitals();
      setHospitals(data.hospitals || []);
    } catch (err) {
      showError(getErrorMessage(err));
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  const handleVerify = async (hospital) => {
    setActionId(`${hospital._id}-verify`);
    try {
      const { data } = await toggleHospitalVerify(hospital._id, !hospital.isVerified);
      showSuccess(data.message);
      fetchHospitals();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  const handleBlock = async (hospital) => {
    setActionId(`${hospital._id}-block`);
    try {
      const { data } = await toggleHospitalBlock(hospital._id, !hospital.isBlocked);
      showSuccess(data.message);
      fetchHospitals();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Hospital management</h1>
        <p className="text-slate-500 mt-1 text-sm">Verify facilities and manage access</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-end"
      >
        <Button variant="secondary" onClick={fetchHospitals} className="!py-2.5">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </motion.div>

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
                  <th className="px-6 py-3">Hospital</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Verification</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hospitals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No hospitals registered
                    </td>
                  </tr>
                ) : (
                  hospitals.map((h) => (
                    <tr key={h._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2 font-medium text-slate-900">
                          <Building2 className="w-4 h-4 text-emerald-600" />
                          {h.hospitalName || h.name}
                        </div>
                        {h.city && (
                          <p className="text-xs text-slate-400 mt-0.5 ml-6">{h.city}</p>
                        )}
                      </td>
                      <td className="px-6 py-3 text-slate-600">{h.email}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            h.isVerified
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {h.isVerified ? (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Verified
                            </>
                          ) : (
                            <>
                              <ShieldX className="w-3.5 h-3.5" />
                              Unverified
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            h.isBlocked
                              ? 'bg-red-100 text-red-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {h.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex justify-end flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleViewDetails(h)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                          <button
                            type="button"
                            disabled={actionId?.startsWith(h._id)}
                            onClick={() => handleVerify(h)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-50 text-violet-700 hover:bg-violet-100 disabled:opacity-50"
                          >
                            {h.isVerified ? (
                              <>
                                <ShieldX className="w-3.5 h-3.5" />
                                Unverify
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Verify
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            disabled={actionId?.startsWith(h._id)}
                            onClick={() => handleBlock(h)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                          >
                            {h.isBlocked ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                Unblock
                              </>
                            ) : (
                              <>
                                <Ban className="w-3.5 h-3.5" />
                                Block
                              </>
                            )}
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
    </div>
  );
};

export default AdminHospitals;
