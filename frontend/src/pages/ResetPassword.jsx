import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/ui/FormInput';
import Button from '../components/ui/Button';

const ResetPassword = () => {
  const { resetToken } = useParams();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.password) next.password = 'Password is required';
    else if (form.password.length < 6) next.password = 'At least 6 characters';
    if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      await resetPassword(resetToken, form.password);
      navigate('/', { replace: true });
    } catch {
      // handled in context
    } finally {
      setLoading(false);
    }
  };

  if (!resetToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-slate-600">
          Invalid reset link.{' '}
          <Link to="/forgot-password" className="text-brand-600 font-medium">
            Request a new one
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-slate-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8"
      >
        <Link
          to="/login"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        <h1 className="text-2xl font-bold text-slate-900">Set new password</h1>
        <p className="text-slate-500 mt-2 text-sm">Choose a strong password for your account.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <FormInput
            label="New password"
            name="password"
            type="password"
            placeholder="Min. 8 characters"
            icon={Lock}
            value={form.password}
            onChange={handleChange}
            error={errors.password}
          />
          <FormInput
            label="Confirm password"
            name="confirmPassword"
            type="password"
            placeholder="Repeat password"
            icon={Lock}
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />
          <Button type="submit" loading={loading} className="w-full">
            Update password
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
