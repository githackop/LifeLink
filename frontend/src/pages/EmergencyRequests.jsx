import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEmergencyRequests } from '../services/requestService';
import { getErrorMessage } from '../services/api';
import RequestCard from '../components/requests/RequestCard';
import RequestDetailsModal from '../components/requests/RequestDetailsModal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';

const EmergencyRequests = () => {
  const { user } = useAuth();
  const isUnverified = user?.role === 'hospital' && !user?.isHospitalVerified;
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequestForDetails, setSelectedRequestForDetails] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getEmergencyRequests();
      setRequests(data.requests || []);
    } catch (err) {
      setError(getErrorMessage(err));
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Emergency Requests</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Urgent blood requests sent from your hospital account.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchRequests}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-sm text-brand-600 font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {isUnverified ? (
            <span
              className="text-sm font-medium text-slate-400 bg-slate-100 px-4 py-2 rounded-xl cursor-not-allowed border border-slate-200"
              title="Available after admin verification"
            >
              New emergency request
            </span>
          ) : (
            <Link
              to="/search-donors"
              className="text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 rounded-xl shadow-md"
            >
              New emergency request
            </Link>
          )}
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-16 rounded-2xl bg-red-50 border border-red-100">
          <p className="text-red-600 font-medium">{error}</p>
          <Button variant="secondary" className="mt-4" onClick={fetchRequests}>
            Try again
          </Button>
        </div>
      ) : requests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 rounded-2xl border border-dashed border-amber-200 bg-amber-50/30"
        >
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <p className="font-medium text-slate-700">No emergency requests</p>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Search donors and send a request — hospital requests are automatically marked as emergency.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {requests.map((request, index) => (
            <RequestCard
              key={request._id}
              request={request}
              view="sent"
              index={index}
              onViewDetails={(req) => setSelectedRequestForDetails(req)}
            />
          ))}
        </div>
      )}

      <RequestDetailsModal
        request={selectedRequestForDetails}
        isOpen={!!selectedRequestForDetails}
        onClose={() => setSelectedRequestForDetails(null)}
      />
    </div>
  );
};

export default EmergencyRequests;
