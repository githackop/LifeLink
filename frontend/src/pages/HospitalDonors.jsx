import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, Calendar, Users, Plus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { showError, showSuccess } from '../utils/toast';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonCardList } from '../components/ui/Skeleton';

import {
  getHospitalDonors,
  addManualHospitalDonor,
} from '../services/hospitalDonorService';

import { getErrorMessage } from '../services/api';

const HospitalDonors = () => {
  const { user } = useAuth();
  const isUnverified = user?.role === 'hospital' && !user?.isVerified;
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    bloodGroup: '',
    city: '',
  });

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
  // INPUT HANDLER
  // =========================
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // =========================
  // SUBMIT HANDLER
  // =========================
  const handleSubmit = async () => {
    try {
      if (!form.name || !form.phoneNumber || !form.bloodGroup) {
        showError('Name, Phone Number, and Blood Group are required');
        return;
      }

      // IMPORTANT: send RAW object (not wrapped)
      await addManualHospitalDonor(form);

      showSuccess('Donor added successfully');

      setForm({
        name: '',
        phoneNumber: '',
        email: '',
        bloodGroup: '',
        city: '',
      });

      setShowForm(false);
      fetchDonors();
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-rose-500" />
            <h1 className="text-2xl font-bold text-slate-900">Hospital Donors</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1 ml-8">
            Donors linked to your facility after completed donations
          </p>
        </div>

        <button
          onClick={() => {
            if (isUnverified) return;
            setShowForm((prev) => !prev);
          }}
          disabled={isUnverified}
          title={isUnverified ? "Available after admin verification" : ""}
          className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Close' : 'Add Donor'}
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="p-4 border rounded-xl bg-white space-y-3">

          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />

          <input
            name="phoneNumber"
            placeholder="Phone Number"
            value={form.phoneNumber}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />

          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />

          <input
            name="bloodGroup"
            placeholder="Blood Group (e.g. A+)"
            value={form.bloodGroup}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />

          <input
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />

          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Save Donor
          </button>
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <SkeletonCardList count={4} />
      ) : donors.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No hospital donors yet"
          description="Donors appear here after you complete a blood request with them, or add one manually."
        />
      ) : (
        <div className="grid gap-4">

          {donors.map((donor, index) => (
            <motion.div
              key={donor._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-xl border bg-white shadow-sm"
            >

              {/* TOP */}
              <div className="flex justify-between">
                <div>
                  <h2 className="font-semibold text-lg">
                    {donor.name || 'Unknown'}
                  </h2>

                  <p className="text-sm text-slate-500">
                    Blood Group: {donor.bloodGroup || 'N/A'}
                  </p>
                </div>

                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                  {donor.totalDonations || 0} donations
                </span>
              </div>

              {/* CONTACT */}
              <div className="mt-3 space-y-1 text-sm text-slate-600">

                {donor.phoneNumber && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {donor.phoneNumber}
                  </p>
                )}

                {donor.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {donor.email}
                  </p>
                )}

                {donor.lastDonationDate && (
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Last donation:{' '}
                    {new Date(donor.lastDonationDate).toLocaleDateString()}
                  </p>
                )}

                {donor.city && (
                  <p className="text-xs text-slate-400">
                    {donor.city}
                  </p>
                )}

              </div>

            </motion.div>
          ))}

        </div>
      )}

    </div>
  );
};

export default HospitalDonors;