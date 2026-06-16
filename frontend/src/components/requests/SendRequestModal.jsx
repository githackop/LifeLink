import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Droplets,
  User,
  Calendar,
  MapPin,
  Building2,
  AlertTriangle,
  Hash,
  FileText,
  Clock,
} from 'lucide-react';
import Button from '../ui/Button';
import { BLOOD_GROUPS } from '../../utils/bloodGroups';

const REASONS = [
  'Surgery',
  'Accident',
  'Cancer Treatment',
  'Emergency Operation',
  'Custom Message'
];

const SendRequestModal = ({ donor, open, onClose, onSubmit, loading }) => {
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [patientName, setPatientName] = useState('');
  const [unitsRequired, setUnitsRequired] = useState(1);
  const [city, setCity] = useState('');
  const [location, setLocation] = useState('');
  const [requiredBefore, setRequiredBefore] = useState('');
  const [reason, setReason] = useState('Custom Message');
  const [emergencyLevel, setEmergencyLevel] = useState('medium');
  const [allowContact, setAllowContact] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (donor) {
      setBloodGroup(donor.bloodGroup || 'O+');
      setPatientName('');
      setUnitsRequired(1);
      setCity(donor.city || '');
      setLocation('');
      setRequiredBefore('');
      setReason('Custom Message');
      setEmergencyLevel('medium');
      setAllowContact(true);
      setMessage('');
    }
  }, [donor]);

  if (!donor) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!patientName.trim()) return;
    if (!city.trim()) return;
    if (!location.trim()) return;
    if (!requiredBefore) return;

    onSubmit({
      donorId: donor._id,
      bloodGroup,
      patientName: patientName.trim(),
      unitsRequired: parseInt(unitsRequired) || 1,
      city: city.trim(),
      location: location.trim(),
      requiredBefore,
      reason,
      emergencyLevel,
      allowContact,
      message: message.trim() || undefined,
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm pointer-events-auto"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative pointer-events-auto w-full max-w-lg rounded-2xl border border-slate-100 bg-white shadow-2xl p-6 overflow-hidden flex flex-col gap-4 max-h-[90vh] z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Droplets className="w-5 h-5 text-rose-500 fill-rose-500" />
                  Request Donor Blood
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Send a direct request to donor {donor.name}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 text-xs font-semibold space-y-4">
              
              {/* Patient Name */}
              <div>
                <label className="block text-slate-500 mb-1.5 uppercase tracking-wide text-[9px]">Patient Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Rahul Kumar"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
                  />
                </div>
              </div>

              {/* Blood group & Units */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1.5 uppercase tracking-wide text-[9px]">Blood Group Needed</label>
                  <div className="relative">
                    <Droplets className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
                    >
                      {BLOOD_GROUPS.map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1.5 uppercase tracking-wide text-[9px]">Units Required</label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={unitsRequired}
                      onChange={(e) => setUnitsRequired(parseInt(e.target.value) || 1)}
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
                    />
                  </div>
                </div>
              </div>

              {/* City & Address location */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1.5 uppercase tracking-wide text-[9px]">City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Vijayawada"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1.5 uppercase tracking-wide text-[9px]">Hospital Location</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Apollo Hospitals"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
                    />
                  </div>
                </div>
              </div>

              {/* Date & Urgency Level */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1.5 uppercase tracking-wide text-[9px]">Required Before Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="datetime-local"
                      value={requiredBefore}
                      onChange={(e) => setRequiredBefore(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1.5 uppercase tracking-wide text-[9px]">Urgency Level</label>
                  <div className="relative">
                    <AlertTriangle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={emergencyLevel}
                      onChange={(e) => setEmergencyLevel(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent / Critical</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Case Reason */}
              <div>
                <label className="block text-slate-500 mb-1.5 uppercase tracking-wide text-[9px]">Medical Case / Reason</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
                  >
                    {REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-slate-500 mb-1.5 uppercase tracking-wide text-[9px]">Message / Special Instructions</label>
                <textarea
                  placeholder="Provide patient status, room details, preferred contact times..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={2}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
                />
              </div>

              {/* Allow contact checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allowContactDirect"
                  checked={allowContact}
                  onChange={(e) => setAllowContact(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="allowContactDirect" className="text-slate-600 text-xs font-semibold">
                  Display direct phone and email contact info to donor
                </label>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button variant="secondary" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" loading={loading} className="bg-rose-600 text-white flex items-center gap-2 border-none">
                  <Send className="w-4 h-4" />
                  Send Request
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SendRequestModal;
