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
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { BLOOD_GROUPS } from '../../utils/bloodGroups';

const REASONS = [
  'Surgery',
  'Accident',
  'Cancer Treatment',
  'Emergency Operation',
  'Custom Message',
];

const SendRequestModal = ({ donor, open, onClose, onSubmit, loading }) => {
  const { user } = useAuth();
  
  // Primary visual states
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [isEmergency, setIsEmergency] = useState(false);
  const [message, setMessage] = useState('');
  
  // Advanced fields (collapsible, pre-filled for safety)
  const [patientName, setPatientName] = useState('Emergency Patient');
  const [unitsRequired, setUnitsRequired] = useState(1);
  const [city, setCity] = useState('');
  const [location, setLocation] = useState('');
  const [requiredBefore, setRequiredBefore] = useState('');
  const [reason, setReason] = useState('Emergency Operation');
  const [allowContact, setAllowContact] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (donor) {
      setBloodGroup(donor.bloodGroup || 'O+');
      setIsEmergency(user?.role === 'hospital'); // Default emergency to true for hospital accounts
      setMessage('');
      
      // Prepopulate advanced values with sensible defaults
      setPatientName('Emergency Patient');
      setUnitsRequired(1);
      setCity(donor.city || user?.city || '');
      setLocation(user?.address || 'City General Hospital');
      setReason('Emergency Operation');
      setAllowContact(true);
      setShowAdvanced(false);

      // Default requiredBefore date: 24 hours from now
      const tomorrow = new Date();
      tomorrow.setHours(tomorrow.getHours() + 24);
      // Format as YYYY-MM-DDTHH:MM (local time compatible string)
      const tzOffset = tomorrow.getTimezoneOffset() * 60000; // offset in milliseconds
      const localISOTime = new Date(tomorrow.getTime() - tzOffset).toISOString().slice(0, 16);
      setRequiredBefore(localISOTime);
    }
  }, [donor, user]);

  if (!donor) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!patientName.trim()) return;
    if (!city.trim()) return;
    if (!location.trim()) return;
    if (!requiredBefore) return;

    // Map the boolean toggle to API emergency levels
    const emergencyLevel = isEmergency ? 'urgent' : 'medium';

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

  const requesterNamePreview = user?.role === 'hospital' 
    ? user.hospitalName || user.name 
    : user?.name || 'Authorized User';

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
            className="relative pointer-events-auto w-full max-w-lg rounded-2xl border border-white/60 bg-white shadow-2xl p-6 overflow-hidden flex flex-col gap-4 max-h-[90vh] z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Droplets className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
                  Send Blood Request
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct connection request to <span className="font-bold text-slate-700">{donor.name}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 text-xs font-semibold space-y-4">
              
              {/* Sender Preview Panel */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Requesting as</span>
                  <span className="text-xs font-bold text-slate-800">{requesterNamePreview}</span>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-[10px] uppercase font-extrabold bg-rose-50 text-rose-600 border border-rose-100">
                  {user?.role || 'User'}
                </span>
              </div>

              {/* Blood group selection */}
              <div>
                <label className="block text-slate-500 mb-1.5 uppercase tracking-wide text-[9px]">Blood Group Needed</label>
                <div className="relative">
                  <Droplets className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/15 text-slate-800"
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Emergency Switch Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-white shadow-soft">
                <div className="flex gap-2">
                  <AlertTriangle className={`w-5 h-5 ${isEmergency ? 'text-rose-500 fill-rose-100' : 'text-slate-400'}`} />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Emergency Case</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Toggle if this is a life-threatening request</p>
                  </div>
                </div>
                
                {/* Custom Switch Toggle */}
                <button
                  type="button"
                  onClick={() => setIsEmergency(!isEmergency)}
                  disabled={user?.role === 'hospital'} // Hospitals are forced emergency requests
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-500/20 ${
                    isEmergency ? 'bg-rose-600' : 'bg-slate-200'
                  } ${user?.role === 'hospital' ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform duration-200 ease-in-out ${
                      isEmergency ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Request Message */}
              <div>
                <label className="block text-slate-500 mb-1.5 uppercase tracking-wide text-[9px]">Request Message / Instructions</label>
                <textarea
                  placeholder="Provide clinical context, room details, preferred contact times..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/15 text-slate-700"
                />
              </div>

              {/* Collapsible Advanced clinical details (Required for API consistency) */}
              <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/30">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full px-4 py-3 flex items-center justify-between text-slate-600 hover:text-slate-800 font-bold bg-slate-50 border-none transition-colors"
                >
                  <span className="flex items-center gap-1.5 text-xs text-slate-700">
                    <FileText className="w-4 h-4 text-slate-400" />
                    Additional Details (Pre-filled)
                  </span>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAdvanced && (
                  <div className="p-4 space-y-4 bg-white border-t border-slate-100">
                    
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
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/15 text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Units Required */}
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
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/15 text-slate-800"
                        />
                      </div>
                    </div>

                    {/* City & Address Location */}
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
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/15 text-slate-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-500 mb-1.5 uppercase tracking-wide text-[9px]">Hospital Location</label>
                        <div className="relative">
                          <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="e.g. Apollo Hospital"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/15 text-slate-800"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Required Before Date */}
                    <div>
                      <label className="block text-slate-500 mb-1.5 uppercase tracking-wide text-[9px]">Required Before Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="datetime-local"
                          value={requiredBefore}
                          onChange={(e) => setRequiredBefore(e.target.value)}
                          required
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/15 text-slate-800"
                        />
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
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/15 text-slate-800"
                        >
                          {REASONS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Allow Contact checkbox */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="allowContactDirect"
                        checked={allowContact}
                        onChange={(e) => setAllowContact(e.target.checked)}
                        className="rounded text-brand-600 focus:ring-brand-500"
                      />
                      <label htmlFor="allowContactDirect" className="text-slate-600 text-xs font-semibold">
                        Display direct contact details to donor
                      </label>
                    </div>

                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Button variant="secondary" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  className="bg-rose-600 text-white flex items-center gap-2 border-none font-bold"
                >
                  <Send className="w-4 h-4" />
                  Submit Request
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
