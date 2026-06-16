import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Droplets, MapPin, RefreshCw, Users, AlertTriangle } from 'lucide-react';
import { showError, showSuccess } from '../utils/toast';
import { useAuth } from '../context/AuthContext';
import { searchDonors } from '../services/donorsService';
import { createRequest } from '../services/requestService';
import { getErrorMessage } from '../services/api';
import { BLOOD_GROUPS } from '../utils/bloodGroups';
import DonorCard from '../components/requests/DonorCard';
import SendRequestModal from '../components/requests/SendRequestModal';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonDonorGrid } from '../components/ui/Skeleton';

const defaultFilters = {
  search: '',
  bloodGroup: '',
  city: '',
  availability: '',
};

const SearchDonors = () => {
  const { user } = useAuth();
  const isHospital = user?.role === 'hospital';
  const isHospitalUnverified = user?.role === 'hospital' && !user?.isHospitalVerified;
  const [filters, setFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchDonors = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (appliedFilters.search.trim()) params.search = appliedFilters.search.trim();
      if (appliedFilters.bloodGroup) params.bloodGroup = appliedFilters.bloodGroup;
      if (appliedFilters.city.trim()) params.city = appliedFilters.city.trim();
      if (appliedFilters.availability !== '') params.availability = appliedFilters.availability;

      const { data } = await searchDonors(params);
      setDonors(data.donors || []);
    } catch (err) {
      setError(getErrorMessage(err));
      setDonors([]);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  const handleApplyFilters = (e) => {
    e?.preventDefault();
    setAppliedFilters({ ...filters });
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  const handleSendRequest = (donor) => {
    setSelectedDonor(donor);
    setModalOpen(true);
  };

  const handleSubmitRequest = async (payload) => {
    setSubmitLoading(true);
    try {
      await createRequest(payload);
      showSuccess('Blood request sent successfully');
      setModalOpen(false);
      setSelectedDonor(null);
      fetchDonors();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Search Donors</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Find available blood donors and send requests instantly.
        </p>
        {isHospital && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
            <AlertTriangle className="w-3.5 h-3.5" />
            Hospital requests are automatically marked as emergency
          </p>
        )}
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        onSubmit={handleApplyFilters}
        className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-5 shadow-soft space-y-4"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Filter className="w-4 h-4 text-brand-600" />
          Filters
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, city, or blood group..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/15 focus:border-brand-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Blood group</label>
            <div className="relative">
              <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={filters.bloodGroup}
                onChange={(e) => setFilters((f) => ({ ...f, bloodGroup: e.target.value }))}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
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
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">City</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Any city"
                value={filters.city}
                onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Availability</label>
            <select
              value={filters.availability}
              onChange={(e) => setFilters((f) => ({ ...f, availability: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
            >
              <option value="">All</option>
              <option value="true">Available only</option>
              <option value="false">Unavailable</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="submit">Apply filters</Button>
          <Button type="button" variant="secondary" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </motion.form>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 flex items-center gap-1.5">
          <Users className="w-4 h-4" />
          {loading ? 'Searching...' : `${donors.length} donor${donors.length !== 1 ? 's' : ''} found`}
        </p>
        <button
          type="button"
          onClick={fetchDonors}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-500 font-medium disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <SkeletonDonorGrid count={6} />
      ) : error ? (
        <div className="text-center py-16 rounded-2xl bg-red-50 border border-red-100">
          <p className="text-red-600 font-medium">{error}</p>
          <Button variant="secondary" className="mt-4" onClick={fetchDonors}>
            Try again
          </Button>
        </div>
      ) : donors.length === 0 ? (
        <EmptyState
          icon={Droplets}
          title="No donors found"
          description="Try adjusting your filters or check back later."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {donors.map((donor, index) => (
            <DonorCard
              key={donor._id}
              donor={donor}
              index={index}
              onSendRequest={handleSendRequest}
              actionLoading={submitLoading}
              disabledOverride={isHospitalUnverified}
            />
          ))}
        </div>
      )}

      <SendRequestModal
        donor={selectedDonor}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedDonor(null);
        }}
        onSubmit={handleSubmitRequest}
        loading={submitLoading}
      />
    </div>
  );
};

export default SearchDonors;
