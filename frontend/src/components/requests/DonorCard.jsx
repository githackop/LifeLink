import { motion } from 'framer-motion';
import { Droplets, MapPin, Phone, Mail, Clock, Send, Check, Eye, Heart, Calendar, Award, Zap } from 'lucide-react';
import { getDonorStats } from '../../utils/donorStats';
import Button from '../ui/Button';

const DonorCard = ({
  donor,
  index = 0,
  onSendRequest,
  onViewDetails,
  actionLoading,
  disabledOverride = false,
}) => {
  const unavailable = !donor.availability;
  const pending = donor.hasPendingRequest;
  const disabled = !donor.canRequest || actionLoading || disabledOverride;

  const stats = getDonorStats(donor._id);

  let buttonLabel = 'Send Request';
  if (unavailable) buttonLabel = 'Unavailable';
  else if (pending) buttonLabel = 'Request Pending';

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-5 shadow-soft hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Profile Section */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white font-bold shadow-md">
              {donor.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-bold text-slate-900 leading-snug">{donor.name}</h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-rose-50 border border-rose-100 text-rose-600">
                  Donor
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {donor.city || 'City not set'}
              </p>
            </div>
          </div>
        </div>

        {/* Status Badges Section */}
        <div className="flex flex-wrap gap-1.5 mt-3.5">
          <span
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
              donor.availability
                ? 'bg-emerald-50 border border-emerald-100 text-emerald-700'
                : 'bg-slate-100 border border-slate-200 text-slate-500'
            }`}
          >
            {donor.availability ? 'Available' : 'Unavailable'}
          </span>
          {stats.isVerified && (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 border border-blue-100 text-blue-700 flex items-center gap-0.5">
              <Award className="w-3 h-3 text-blue-500" />
              Verified
            </span>
          )}
          {stats.isEmergencyReady && (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 border border-amber-100 text-amber-700 flex items-center gap-0.5">
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
              Emergency Ready
            </span>
          )}
        </div>

        {/* Donor Information */}
        <div className="mt-4 grid grid-cols-2 gap-2 bg-slate-50/50 rounded-xl p-3 border border-slate-100">
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Blood Group</p>
            <p className="inline-flex items-center gap-1 text-rose-600 font-extrabold text-sm mt-0.5">
              <Droplets className="w-3.5 h-3.5 fill-rose-600" />
              {donor.bloodGroup}
            </p>
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total Donations</p>
            <p className="inline-flex items-center gap-1 text-slate-800 font-extrabold text-sm mt-0.5">
              <Heart className="w-3.5 h-3.5 fill-slate-500 text-slate-500" />
              {stats.donations}
            </p>
          </div>
          <div className="col-span-2 pt-1.5 border-t border-slate-100/80">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Last Donation Date</p>
            <p className="inline-flex items-center gap-1 text-slate-700 font-semibold text-xs mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {stats.lastDonationDate ? new Date(stats.lastDonationDate).toLocaleDateString() : 'Never'}
            </p>
          </div>
        </div>

        {/* Contact Information */}
        {(donor.phoneNumber || donor.email) && (
          <div className="mt-3.5 space-y-1.5 px-0.5">
            {donor.phoneNumber && (
              <a
                href={`tel:${donor.phoneNumber}`}
                className="text-xs text-slate-600 hover:text-brand-600 flex items-center gap-2 font-semibold transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {donor.phoneNumber}
              </a>
            )}
            {donor.email && (
              <a
                href={`mailto:${donor.email}`}
                className="text-xs text-slate-600 hover:text-brand-600 flex items-center gap-2 font-medium transition-colors overflow-hidden text-ellipsis whitespace-nowrap block"
              >
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {donor.email}
              </a>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-2">
        {pending && (
          <p className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Active request pending
          </p>
        )}
        <div className="flex gap-2">
          {onViewDetails && (
            <button
              type="button"
              onClick={() => onViewDetails(donor)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              Details
            </button>
          )}
          <Button
            type="button"
            className="flex-[1.5] !py-2.5 !px-3"
            disabled={disabled}
            variant={disabled && !pending ? 'secondary' : 'primary'}
            title={disabledOverride ? 'Available after admin verification' : ''}
            onClick={() => {
              if (disabledOverride) return;
              onSendRequest(donor);
            }}
          >
            {pending ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
            <span className="text-xs font-bold">{buttonLabel}</span>
          </Button>
        </div>
      </div>
    </motion.article>
  );
};

export default DonorCard;
