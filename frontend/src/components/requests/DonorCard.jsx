import { motion } from 'framer-motion';
import { Droplets, MapPin, Phone, Clock, Send, Check } from 'lucide-react';
import Button from '../ui/Button';

const DonorCard = ({ donor, index = 0, onSendRequest, actionLoading, disabledOverride = false }) => {
  const unavailable = !donor.availability;
  const pending = donor.hasPendingRequest;
  const disabled = !donor.canRequest || actionLoading || disabledOverride;

  let buttonLabel = 'Send Request';
  if (unavailable) buttonLabel = 'Unavailable';
  else if (pending) buttonLabel = 'Request Pending';

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-5 shadow-soft hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white font-bold shadow-md">
            {donor.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{donor.name}</h3>
            <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
              {donor.city || 'City not set'}
            </p>
          </div>
        </div>
        <span
          className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
            donor.availability
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          {donor.availability ? 'Available' : 'Unavailable'}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 text-sm font-semibold">
          <Droplets className="w-4 h-4" />
          {donor.bloodGroup}
        </span>
        {donor.phoneNumber && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-600 text-sm">
            <Phone className="w-4 h-4" />
            {donor.phoneNumber}
          </span>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100">
        {pending && (
          <p className="text-xs text-amber-600 flex items-center gap-1 mb-3">
            <Clock className="w-3.5 h-3.5" />
            You have a pending request with this donor
          </p>
        )}
        <Button
          type="button"
          className="w-full !py-2.5"
          disabled={disabled}
          variant={disabled && !pending ? 'secondary' : 'primary'}
          title={disabledOverride ? "Available after admin verification" : ""}
          onClick={() => {
            if (disabledOverride) return;
            onSendRequest(donor);
          }}
        >
          {pending ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
          {buttonLabel}
        </Button>
      </div>
    </motion.article>
  );
};

export default DonorCard;
