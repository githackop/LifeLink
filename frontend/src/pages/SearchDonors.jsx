import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Droplets,
  MapPin,
  RefreshCw,
  Users,
  AlertTriangle,
  Award,
  Activity,
  Heart,
  CheckCircle,
} from 'lucide-react';
import { showError, showSuccess } from '../utils/toast';
import { useAuth } from '../context/AuthContext';
import { searchDonors } from '../services/donorsService';
import { createRequest } from '../services/requestService';
import { getErrorMessage } from '../services/api';
import { BLOOD_GROUPS } from '../utils/bloodGroups';
import { getDonorStats } from '../utils/donorStats';
import DonorCard from '../components/requests/DonorCard';
import DonorDetailsModal from '../components/requests/DonorDetailsModal';
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
  
  // Sort states
  const [sortBy, setSortBy] = useState('active'); // 'active' | 'donations' | 'name'

  // Modal triggers
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // View details modal trigger
  const [detailsDonor, setDetailsDonor] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

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

  const handleViewDetails = (donor) => {
    setDetailsDonor(donor);
    setDetailsOpen(true);
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

  // Compute live statistics from search results
  const totalAvailableDonors = donors.filter((d) => d.availability).length;
  const uniqueCitiesCovered = new Set(donors.map((d) => d.city?.trim()?.toLowerCase()).filter(Boolean)).size;
  const bloodGroupsAvailable = new Set(donors.filter((d) => d.availability).map((d) => d.bloodGroup)).size;

  // Sorting logic on the client side
  const getSortedDonors = useCallback(() => {
    const sorted = [...donors];
    sorted.sort((a, b) => {
      const statsA = getDonorStats(a._id);
      const statsB = getDonorStats(b._id);

      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'donations') {
        return statsB.donations - statsA.donations;
      }
      if (sortBy === 'active') {
        // Available donors first
        if (a.availability !== b.availability) {
          return a.availability ? -1 : 1;
        }
        // Then verified donors first
        if (statsA.isVerified !== statsB.isVerified) {
          return statsA.isVerified ? -1 : 1;
        }
        // Then alphabetical
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
    return sorted;
  }, [donors, sortBy]);

  const sortedDonorsList = getSortedDonors();

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* SECTION 1: HERO / SEARCH STATS AREA */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-50 to-white border border-rose-100/40 p-6 md:p-8 shadow-soft"
      >
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-200/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-12 w-48 h-48 bg-brand-200/10 rounded-full blur-2xl -z-10" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100/60 border border-rose-200/40 text-brand-700 text-xs font-bold uppercase tracking-wider">
              <Droplets className="w-3.5 h-3.5 fill-rose-600 animate-pulse" />
              Live Blood Donor Network
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Find Blood Donors
            </h1>
            <p className="text-slate-500 text-sm sm:text-base font-medium">
              Connect with verified blood donors near you and send blood requests instantly.
            </p>

            {isHospital && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 fill-amber-100" />
                Hospital Mode: Requests are prioritized as emergency level automatically.
              </p>
            )}
          </div>

          {/* Stats Dashboard Grid */}
          <div className="grid grid-cols-3 gap-3 w-full lg:w-auto min-w-[280px] sm:min-w-[420px]">
            <motion.div
              whileHover={{ y: -3, scale: 1.02 }}
              className="bg-white/80 backdrop-blur-md border border-white p-3.5 rounded-2xl shadow-soft text-center"
            >
              <div className="w-8 h-8 mx-auto rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 mb-1.5">
                <Activity className="w-4 h-4" />
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Available</p>
              <p className="text-xl font-extrabold text-emerald-600 mt-0.5">
                {loading ? '—' : totalAvailableDonors}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -3, scale: 1.02 }}
              className="bg-white/80 backdrop-blur-md border border-white p-3.5 rounded-2xl shadow-soft text-center"
            >
              <div className="w-8 h-8 mx-auto rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mb-1.5">
                <MapPin className="w-4 h-4" />
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cities</p>
              <p className="text-xl font-extrabold text-blue-600 mt-0.5">
                {loading ? '—' : uniqueCitiesCovered}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -3, scale: 1.02 }}
              className="bg-white/80 backdrop-blur-md border border-white p-3.5 rounded-2xl shadow-soft text-center"
            >
              <div className="w-8 h-8 mx-auto rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 mb-1.5">
                <Droplets className="w-4 h-4 fill-rose-100" />
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Blood Types</p>
              <p className="text-xl font-extrabold text-brand-600 mt-0.5">
                {loading ? '—' : bloodGroupsAvailable}
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* SECTION 2: SEARCH + FILTERS BAR */}
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        onSubmit={handleApplyFilters}
        className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-5 shadow-soft space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
            <Filter className="w-4 h-4 text-brand-600" />
            Filter Directory
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-slate-600 font-bold transition-colors"
          >
            Clear Filters
          </button>
        </div>

        {/* Primary Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, city, or blood group (e.g. O+)..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 text-sm font-semibold text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Secondary Select filters & Sorting */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-bold">
          {/* Blood group */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">Blood group</label>
            <div className="relative">
              <Droplets className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={filters.bloodGroup}
                onChange={(e) => setFilters((f) => ({ ...f, bloodGroup: e.target.value }))}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 text-slate-800"
              >
                <option value="">All Groups</option>
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
            <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">City</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Any City"
                value={filters.city}
                onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">Availability</label>
            <select
              value={filters.availability}
              onChange={(e) => setFilters((f) => ({ ...f, availability: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 text-slate-800"
            >
              <option value="">All Available & Unavailable</option>
              <option value="true">Available Only</option>
              <option value="false">Unavailable Only</option>
            </select>
          </div>

          {/* Sorting control */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">Sort Results By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 text-slate-800"
            >
              <option value="active">Recently Active</option>
              <option value="donations">Most Donations</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="submit">Apply Search Filters</Button>
          <Button type="button" variant="secondary" onClick={handleReset}>
            Reset Filters
          </Button>
        </div>
      </motion.form>

      {/* SECTION 3: RESULTS AREA */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-slate-400" />
          {loading ? 'Searching...' : `${donors.length} donor${donors.length !== 1 ? 's' : ''} found`}
        </p>
        <button
          type="button"
          onClick={fetchDonors}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-500 font-extrabold disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Network
        </button>
      </div>

      {loading ? (
        <SkeletonDonorGrid count={6} />
      ) : error ? (
        <div className="text-center py-16 rounded-2xl bg-red-50 border border-red-100 max-w-lg mx-auto p-6">
          <p className="text-red-600 font-bold">{error}</p>
          <Button variant="secondary" className="mt-4" onClick={fetchDonors}>
            Try again
          </Button>
        </div>
      ) : sortedDonorsList.length === 0 ? (
        <EmptyState
          icon={Droplets}
          title="No donors found"
          description="Try adjusting your search criteria or filters."
          action={
            <Button variant="secondary" onClick={handleReset}>
              Reset filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedDonorsList.map((donor, index) => (
            <DonorCard
              key={donor._id}
              donor={donor}
              index={index}
              onSendRequest={handleSendRequest}
              onViewDetails={handleViewDetails}
              actionLoading={submitLoading}
              disabledOverride={isHospitalUnverified}
            />
          ))}
        </div>
      )}

      {/* Direct send request modal */}
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

      {/* Clinical view details modal */}
      <DonorDetailsModal
        donor={detailsDonor}
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setDetailsDonor(null);
        }}
      />
    </div>
  );
};

export default SearchDonors;
