import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  Mail,
  Calendar,
  Users,
  Plus,
  X,
  Search,
  MapPin,
  Activity,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  BarChart2,
  SlidersHorizontal,
  Info,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { showError, showSuccess } from '../utils/toast';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonCardList } from '../components/ui/Skeleton';
import ConfirmModal from '../components/common/ConfirmModal';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';

import {
  getHospitalDonors,
  addManualHospitalDonor,
  updateHospitalDonor,
  deleteHospitalDonor,
} from '../services/hospitalDonorService';

import { getErrorMessage } from '../services/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const HospitalDonors = () => {
  const { user } = useAuth();
  const isUnverified = user?.role === 'hospital' && !user?.isHospitalVerified;
  
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Add/Edit Form State
  const [formOpen, setFormOpen] = useState(false);
  const [editingDonor, setEditingDonor] = useState(null);
  const [form, setForm] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    bloodGroup: 'O+',
    city: '',
    totalDonations: 1,
    lastDonationDate: new Date().toISOString().split('T')[0],
    canContact: true
  });

  // Modal Detail View State
  const [selectedDonorDetails, setSelectedDonorDetails] = useState(null);

  // Deletion State
  const [donorToDelete, setDonorToDelete] = useState(null);

  // =========================
  // FETCH DONORS
  // =========================
  const fetchDonors = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getHospitalDonors();
      setDonors(data?.donors || []);
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  // =========================
  // ANALYTICS & COMPUTED STATS
  // =========================
  const stats = useMemo(() => {
    const total = donors.length;
    
    // Unique blood groups
    const bgSet = new Set(donors.map(d => d.bloodGroup).filter(Boolean));
    const bloodGroupsCovered = bgSet.size;

    // Unique cities
    const citySet = new Set(donors.map(d => d.city?.trim().toLowerCase()).filter(Boolean));
    const citiesCovered = citySet.size;

    // Recent additions (added in the last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentAdditions = donors.filter(d => d.createdAt && new Date(d.createdAt) > sevenDaysAgo).length;

    // Most common blood group
    const bgCounts = {};
    donors.forEach(d => {
      if (d.bloodGroup) {
        bgCounts[d.bloodGroup] = (bgCounts[d.bloodGroup] || 0) + 1;
      }
    });
    
    let mostCommonGroup = 'N/A';
    let maxCount = 0;
    Object.entries(bgCounts).forEach(([bg, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonGroup = bg;
      }
    });

    // Blood group counts for emergency readiness
    const distribution = {};
    BLOOD_GROUPS.forEach(bg => {
      distribution[bg] = 0;
    });
    donors.forEach(d => {
      if (d.bloodGroup && distribution[d.bloodGroup] !== undefined) {
        distribution[d.bloodGroup]++;
      }
    });

    return {
      total,
      bloodGroupsCovered,
      citiesCovered,
      recentAdditions,
      mostCommonGroup,
      distribution
    };
  }, [donors]);

  // Get unique list of cities for the filter dropdown
  const uniqueCities = useMemo(() => {
    const cities = donors.map(d => d.city?.trim()).filter(Boolean);
    return Array.from(new Set(cities)).sort();
  }, [donors]);

  // =========================
  // FILTERED DONORS LIST
  // =========================
  const filteredDonors = useMemo(() => {
    return donors.filter(donor => {
      const nameMatch = !searchQuery.trim() || 
        donor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donor.phoneNumber?.includes(searchQuery) ||
        donor.email?.toLowerCase().includes(searchQuery.toLowerCase());

      const bgMatch = !selectedBloodGroup || donor.bloodGroup === selectedBloodGroup;
      
      const cityMatch = !selectedCity || 
        donor.city?.trim().toLowerCase() === selectedCity.toLowerCase();

      return nameMatch && bgMatch && cityMatch;
    });
  }, [donors, searchQuery, selectedBloodGroup, selectedCity]);

  // =========================
  // ACTIONS / HANDLERS
  // =========================
  const handleOpenAdd = () => {
    if (isUnverified) return;
    setEditingDonor(null);
    setForm({
      name: '',
      phoneNumber: '',
      email: '',
      bloodGroup: 'O+',
      city: '',
      totalDonations: 1,
      lastDonationDate: new Date().toISOString().split('T')[0],
      canContact: true
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (donor) => {
    setEditingDonor(donor);
    setForm({
      name: donor.name || '',
      phoneNumber: donor.phoneNumber || '',
      email: donor.email || '',
      bloodGroup: donor.bloodGroup || 'O+',
      city: donor.city || '',
      totalDonations: donor.totalDonations ?? 1,
      lastDonationDate: donor.lastDonationDate 
        ? new Date(donor.lastDonationDate).toISOString().split('T')[0] 
        : new Date().toISOString().split('T')[0],
      canContact: donor.canContact ?? true
    });
    setFormOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phoneNumber.trim() || !form.bloodGroup) {
      showError('Name, Phone Number, and Blood Group are required');
      return;
    }

    setActionLoading(true);
    try {
      if (editingDonor) {
        // Update donor
        const { data } = await updateHospitalDonor(editingDonor._id, form);
        showSuccess(data.message || 'Donor updated successfully');
      } else {
        // Create manual donor
        const { data } = await addManualHospitalDonor(form);
        showSuccess(data.message || 'Donor added successfully');
      }
      setFormOpen(false);
      fetchDonors();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDelete = (donor) => {
    setDonorToDelete(donor);
  };

  const handleConfirmDelete = async () => {
    if (!donorToDelete) return;
    setActionLoading(true);
    try {
      const { data } = await deleteHospitalDonor(donorToDelete._id);
      showSuccess(data.message || 'Donor removed successfully');
      setDonorToDelete(null);
      fetchDonors();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-8 h-8 text-brand-600" />
            Hospital Donor Directory
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Emergency donor registry records managed locally by your hospital. These records are not app users.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          disabled={isUnverified}
          title={isUnverified ? "Available after admin verification" : ""}
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-500 hover:to-rose-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 self-start sm:self-center"
        >
          <Plus className="w-5 h-5" />
          Add Emergency Donor
        </button>
      </div>

      {/* WARNING BANNER FOR UNVERIFIED HOSPITALS */}
      {isUnverified && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 flex items-start gap-3 shadow-sm">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900 text-sm">Action Disabled</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Your hospital account requires admin approval before you can add new donors to your emergency directory.
            </p>
          </div>
        </div>
      )}

      {/* TOP DASHBOARD METRIC SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Donors', value: stats.total, color: 'text-brand-600' },
          { label: 'Blood Groups', value: stats.bloodGroupsCovered, color: 'text-rose-600' },
          { label: 'Cities Covered', value: stats.citiesCovered, color: 'text-slate-700' },
          { label: 'Recent Additions', value: stats.recentAdditions, color: 'text-emerald-600' },
          { label: 'Most Common BG', value: stats.mostCommonGroup, color: 'text-indigo-600' }
        ].map((card, idx) => (
          <div key={idx} className="bg-white/80 backdrop-blur border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow transition-all duration-200">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{card.label}</p>
            <p className={`text-2xl font-black mt-2 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* MIDDLE SECTION: SEARCH/FILTERS & EMERGENCY READINESS STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* EMERGENCY READINESS CHART (Blood Group Stats) */}
        <div className="bg-white/95 border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-50">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-rose-500" />
              Emergency Blood Readiness
            </h3>
            <span className="text-[10px] uppercase font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md">
              Directory Stats
            </span>
          </div>

          <div className="space-y-3.5">
            {BLOOD_GROUPS.map(bg => {
              const count = stats.distribution[bg] || 0;
              const percent = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={bg} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-bold">{bg}</span>
                    <span className="text-slate-500">{count} {count === 1 ? 'donor' : 'donors'} ({percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-brand-500 to-rose-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SEARCH, FILTERS & CARDS */}
        <div className="lg:col-span-2 space-y-6">
          {/* SEARCH & FILTER CONTROLS */}
          <div className="relative z-20 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, phone, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowFilters(f => !f)}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                  showFilters
                    ? 'bg-slate-100 border-slate-300 text-slate-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {(selectedBloodGroup || selectedCity) && (
                  <span className="w-2 h-2 rounded-full bg-brand-500" />
                )}
              </button>
            </div>

            {/* EXPANDABLE FILTER DRAWER */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden border-t border-slate-50 pt-3 flex flex-wrap gap-4"
                >
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                      Blood Group
                    </label>
                    <Select
                      value={selectedBloodGroup}
                      onChange={(e) => setSelectedBloodGroup(e.target.value)}
                      className="!py-1.5 bg-slate-50 text-xs text-slate-800"
                    >
                      <option value="">All Groups</option>
                      {BLOOD_GROUPS.map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </Select>
                  </div>

                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                      City
                    </label>
                    <Select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="!py-1.5 bg-slate-50 text-xs text-slate-800"
                    >
                      <option value="">All Cities</option>
                      {uniqueCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </Select>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBloodGroup('');
                      setSelectedCity('');
                      setSearchQuery('');
                    }}
                    className="self-end text-xs text-brand-600 font-bold hover:text-brand-500 p-2"
                  >
                    Clear All
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ADD / EDIT FORM CONTAINER */}
          <AnimatePresence>
            {formOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/95 border border-slate-100 rounded-3xl p-6 shadow-xl flex flex-col gap-5 relative overflow-hidden"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingDonor ? 'Edit Emergency Record' : 'Add Emergency Record'}
                  </h3>
                  <button
                    onClick={() => setFormOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-6">
                  {/* SECTION 1: PERSONAL INFO */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-600 border-l-2 border-brand-500 pl-2">
                      Personal Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1 font-medium">Donor Name</label>
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleFormChange}
                          placeholder="e.g. John Doe"
                          required
                          className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1 font-medium">Blood Group</label>
                        <Select
                          name="bloodGroup"
                          value={form.bloodGroup}
                          onChange={handleFormChange}
                          className="!py-2"
                        >
                          {BLOOD_GROUPS.map(bg => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: CONTACT INFO */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-600 border-l-2 border-brand-500 pl-2">
                      Contact Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1 font-medium">Phone Number</label>
                        <input
                          type="text"
                          name="phoneNumber"
                          value={form.phoneNumber}
                          onChange={handleFormChange}
                          placeholder="e.g. +123456789"
                          required
                          className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1 font-medium">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleFormChange}
                          placeholder="e.g. name@domain.com"
                          className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1 font-medium">City</label>
                        <input
                          type="text"
                          name="city"
                          value={form.city}
                          onChange={handleFormChange}
                          placeholder="e.g. New York"
                          className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: DONATION DETAILS & STATUS */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-600 border-l-2 border-brand-500 pl-2">
                      Donation Details & Permissions
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1 font-medium">Total Donations</label>
                        <input
                          type="number"
                          name="totalDonations"
                          min="1"
                          value={form.totalDonations}
                          onChange={handleFormChange}
                          className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1 font-medium">Last Donation Date</label>
                        <input
                          type="date"
                          name="lastDonationDate"
                          value={form.lastDonationDate}
                          onChange={handleFormChange}
                          className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none text-slate-700 text-sm">
                        <input
                          type="checkbox"
                          name="canContact"
                          checked={form.canContact}
                          onChange={handleFormChange}
                          className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        />
                        <span>Allow emergency contact (marked as "Contact Allowed" badge)</span>
                      </label>
                    </div>
                  </div>

                  {/* ACTIONS FOOTER */}
                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setFormOpen(false)}
                      disabled={actionLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      loading={actionLoading}
                    >
                      {editingDonor ? 'Update Record' : 'Save Record'}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* LISTING DONOR CARDS */}
          {loading ? (
            <SkeletonCardList count={3} />
          ) : filteredDonors.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No donors saved yet"
              description="Build your emergency donor network by storing donor information for future blood requests."
            />
          ) : (
            <div className="grid gap-5">
              {filteredDonors.map((donor, index) => (
                <motion.div
                  key={donor._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.05, 0.4) }}
                  className="bg-white border border-slate-100 hover:border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden"
                >
                  <div className="space-y-4 flex-1">
                    {/* TOP: PROFILE SUMMARY */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-rose-600 flex items-center justify-center text-white text-lg font-black shadow flex-shrink-0">
                          {donor.bloodGroup}
                        </div>
                        <div>
                          <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                            {donor.name || 'Unknown'}
                          </h4>
                          {donor.city && (
                            <p className="inline-flex items-center gap-0.5 text-xs text-slate-400 font-semibold mt-0.5">
                              <MapPin className="w-3 h-3" />
                              {donor.city}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* BADGE: CONTACT PERMISSION */}
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                        donor.canContact
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {donor.canContact ? 'Contact Allowed' : 'Contact Disabled'}
                      </span>
                    </div>

                    {/* DETAILS GRID */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 border-t border-slate-50 pt-4 text-xs font-semibold text-slate-600">
                      <div className="space-y-0.5">
                        <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Phone</p>
                        <p className="text-slate-800 break-all select-all">{donor.phoneNumber || '—'}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Email</p>
                        <p className="text-slate-800 break-all select-all">{donor.email || '—'}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Total Donations</p>
                        <p className="text-brand-600 font-extrabold">{donor.totalDonations ?? 0} times</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Last Donation</p>
                        <p className="text-slate-800">
                          {donor.lastDonationDate
                            ? new Date(donor.lastDonationDate).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* QUICK ACTIONS BUTTONS */}
                  <div className="flex md:flex-col justify-end flex-wrap gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-slate-50">
                    <div className="flex gap-2 w-full justify-start md:justify-end">
                      <button
                        onClick={() => setSelectedDonorDetails(donor)}
                        className="p-2 rounded-xl border border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(donor)}
                        className="p-2 rounded-xl border border-slate-100 bg-brand-50 text-brand-600 hover:bg-brand-100 hover:text-brand-700 transition-colors"
                        title="Edit Record"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(donor)}
                        className="p-2 rounded-xl border border-slate-100 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                        title="Remove Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DETAILED VIEW MODAL */}
      <AnimatePresence>
        {selectedDonorDetails && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm pointer-events-auto"
              onClick={() => setSelectedDonorDetails(null)}
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative pointer-events-auto w-full max-w-lg rounded-3xl border border-white/60 bg-white/95 backdrop-blur-xl shadow-2xl p-6 md:p-8 flex flex-col gap-6"
            >
              {/* Close trigger */}
              <button
                onClick={() => setSelectedDonorDetails(null)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Profile Card Summary */}
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-rose-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                  {selectedDonorDetails.bloodGroup}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
                    {selectedDonorDetails.name}
                  </h3>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border mt-1.5 ${
                    selectedDonorDetails.canContact
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}>
                    {selectedDonorDetails.canContact ? 'Contact Allowed' : 'Contact Disabled'}
                  </span>
                </div>
              </div>

              {/* Grid data */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 space-y-3.5 text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-1.5 font-bold">
                    <Phone className="w-4 h-4 text-brand-500" />
                    Contact Info
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Phone</p>
                    <p className="text-slate-800 text-sm">{selectedDonorDetails.phoneNumber}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Email</p>
                    <p className="text-slate-800 text-sm break-all">{selectedDonorDetails.email || '—'}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">City</p>
                    <p className="text-slate-800 text-sm">{selectedDonorDetails.city || '—'}</p>
                  </div>
                </div>

                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 space-y-3.5 text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-1.5 font-bold">
                    <Activity className="w-4 h-4 text-rose-500" />
                    Donation History
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Total Donations</p>
                    <p className="text-brand-600 text-sm font-black">{selectedDonorDetails.totalDonations ?? 0} times</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Last Donation Date</p>
                    <p className="text-slate-800 text-sm">
                      {selectedDonorDetails.lastDonationDate
                        ? new Date(selectedDonorDetails.lastDonationDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Added Date</p>
                    <p className="text-slate-800 text-sm">
                      {selectedDonorDetails.createdAt
                        ? new Date(selectedDonorDetails.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Clinical note disclaimer */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-3 flex items-start gap-2.5 text-blue-800 text-xs">
                <Info className="w-4.5 h-4.5 text-blue-600 shrink-0 mt-0.5" />
                <p className="leading-normal font-medium">
                  This record is managed locally by your hospital. Data resides local to your facility and is not shared with active donors or other facilities.
                </p>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-2 border-t border-slate-100">
                <Button
                  onClick={() => setSelectedDonorDetails(null)}
                  className="w-full sm:w-auto"
                >
                  Close Profile
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION DELETION DIALOG */}
      <ConfirmModal
        isOpen={Boolean(donorToDelete)}
        title="Remove Donor Record"
        description={`Are you sure you want to permanently remove ${donorToDelete?.name || 'this donor'} from your emergency registry? This action cannot be undone.`}
        confirmText="Remove Record"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDonorToDelete(null)}
        loading={actionLoading}
        isDanger={true}
      />
    </div>
  );
};

export default HospitalDonors;