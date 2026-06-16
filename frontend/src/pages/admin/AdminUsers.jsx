import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Ban, CheckCircle, Trash2, RefreshCw, Eye } from 'lucide-react';
import { showError, showSuccess } from '../../utils/toast';
import {
  getAdminUsers,
  deleteAdminUser,
  toggleUserBlock,
} from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import { roleLabels } from '../../utils/roleConfig';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AdminUserDetailsModal from '../../components/admin/AdminUserDetailsModal';
import ConfirmModal from '../../components/common/ConfirmModal';

const ROLES = ['user', 'donor', 'hospital', 'admin'];

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionId, setActionId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Reusable confirmation modal states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleViewDetails = (user) => {
    setSelectedUserId(user._id);
    setDetailsModalOpen(true);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setDeleteLoading(true);
    try {
      const { data } = await deleteAdminUser(userToDelete._id);
      showSuccess(data.message);
      setConfirmOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (roleFilter) params.role = roleFilter;
      const { data } = await getAdminUsers(params);
      setUsers(data.users || []);
    } catch (err) {
      showError(getErrorMessage(err));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleBlock = async (user) => {
    setActionId(user._id);
    try {
      const { data } = await toggleUserBlock(user._id, !user.isBlocked);
      showSuccess(data.message);
      fetchUsers();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };


  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">User management</h1>
        <p className="text-slate-500 mt-1 text-sm">View, block, and remove platform accounts</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
          />
        </div>
        <Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="!py-2 focus:ring-violet-500/30 focus:border-violet-500"
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {roleLabels[r]?.label || r}
            </option>
          ))}
        </Select>
        <Button variant="secondary" onClick={fetchUsers} className="!py-2.5">
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
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3 font-medium text-slate-900">{u.name}</td>
                      <td className="px-6 py-3 text-slate-600">{u.email}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${
                            roleLabels[u.role]?.color || ''
                          }`}
                        >
                          {roleLabels[u.role]?.label || u.role}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            u.isBlocked
                              ? 'bg-red-100 text-red-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {u.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleViewDetails(u)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Details
                          </button>
                          {u.role !== 'admin' && (
                            <>
                              <button
                                type="button"
                                disabled={actionId === u._id}
                                onClick={() => handleBlock(u)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                              >
                                {u.isBlocked ? (
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
                              <button
                                type="button"
                                disabled={deleteLoading}
                                onClick={() => handleDeleteClick(u)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            </>
                          )}
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
        title="Delete User Account"
        description={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setUserToDelete(null);
        }}
        loading={deleteLoading}
        isDanger={true}
      />
    </div>
  );
};

export default AdminUsers;
