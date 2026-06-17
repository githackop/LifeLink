import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, RefreshCw, Mail, ArrowLeft, Heart, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { resendVerificationOtp } from '../services/authService';
import { showSuccess, showError } from '../utils/toast';
import Button from '../components/ui/Button';

const VerifyAccount = () => {
  const { verifyEmailOtp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);

  // Countdown timer for resending OTP
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // If no email was passed, redirect to register
  useEffect(() => {
    if (!email) {
      showError('Please register or log in first.');
      navigate('/register', { replace: true });
    }
  }, [email, navigate]);

  const handleChange = (element, index) => {
    const value = element.value.replace(/[^0-9]/g, '');
    if (!value) {
      const nextOtp = [...otp];
      nextOtp[index] = '';
      setOtp(nextOtp);
      return;
    }

    const nextOtp = [...otp];
    // Take the last character typed
    nextOtp[index] = value[value.length - 1];
    setOtp(nextOtp);

    // Focus next input
    if (index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0 && inputRefs.current[index - 1]) {
        // Clear previous input and focus it
        const nextOtp = [...otp];
        nextOtp[index - 1] = '';
        setOtp(nextOtp);
        inputRefs.current[index - 1].focus();
      } else {
        const nextOtp = [...otp];
        nextOtp[index] = '';
        setOtp(nextOtp);
      }
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pastedData)) {
      showError('Please paste a valid 6-digit OTP code.');
      return;
    }

    const digits = pastedData.split('');
    setOtp(digits);
    // Focus the last input
    if (inputRefs.current[5]) {
      inputRefs.current[5].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      showError('Please enter a 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      await verifyEmailOtp(email, otpCode);
      navigate('/', { replace: true });
    } catch {
      // Handled in context (shows toast notification)
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setResending(true);
    try {
      const { data } = await resendVerificationOtp(email);
      showSuccess(data.message || 'Verification code resent successfully!');
      setTimer(60);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
      
      <motion.div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-rose-500/20 blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-brand-500/20 blur-3xl"
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.2, 0.4] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-rose-600 shadow-xl shadow-rose-500/30 mb-4"
          >
            <ShieldCheck className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Verify Your Email</h1>
          <p className="text-slate-400 mt-2">Enter the verification code sent to your inbox</p>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/20 p-8 border border-white/20">
          <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-2xl text-slate-700 text-sm mb-6 border border-rose-100">
            <Mail className="w-5 h-5 text-brand-500 shrink-0" />
            <div className="truncate">
              We sent a 6-digit OTP code to:
              <strong className="block text-slate-950 font-semibold truncate">{email}</strong>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between gap-2" onPaste={handlePaste}>
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  name={`otp-${index}`}
                  maxLength="1"
                  ref={(el) => (inputRefs.current[index] = el)}
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-slate-200 bg-slate-50 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 transition-all text-slate-900"
                />
              ))}
            </div>

            <Button
              type="submit"
              loading={loading}
              disabled={otp.join('').length !== 6}
              className="w-full h-12"
            >
              Verify Account
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6 flex flex-col items-center justify-center gap-4 text-sm text-slate-600 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResend}
                disabled={timer > 0 || resending}
                className={`flex items-center gap-1.5 font-semibold transition-colors ${
                  timer > 0
                    ? 'text-slate-400 cursor-not-allowed'
                    : 'text-brand-600 hover:text-brand-500'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                {resending ? 'Resending...' : 'Resend Code'}
              </button>
              {timer > 0 && (
                <span className="text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-md text-xs">
                  {timer}s cooldown
                </span>
              )}
            </div>

            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 font-medium text-slate-500 hover:text-brand-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyAccount;
