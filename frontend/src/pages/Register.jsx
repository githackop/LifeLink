import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Building2,
  FileBadge,
  Home,
  Heart,
  Activity,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/ui/FormInput';
import Button from '../components/ui/Button';
import RoleSelector, { BLOOD_GROUPS } from '../components/auth/RoleSelector';
import { showSuccess } from '../utils/toast';

const initialForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  phoneNumber: '',
  role: 'user',
  bloodGroup: 'O+',
  city: '',
  availability: true,
  hospitalName: '',
  licenseNumber: '',
  address: '',
};

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Password Complexity Checker
  const criteria = [
    { label: 'Minimum 8 characters', met: form.password.length >= 8 },
    { label: 'At least one uppercase letter (A-Z)', met: /[A-Z]/.test(form.password) },
    { label: 'At least one lowercase letter (a-z)', met: /[a-z]/.test(form.password) },
    { label: 'At least one number (0-9)', met: /[0-9]/.test(form.password) },
    { label: 'At least one special character (e.g. !@#$%)', met: /[^A-Za-z0-9]/.test(form.password) },
  ];

  const metCount = criteria.filter((c) => c.met).length;

  const getStrength = () => {
    if (form.password.length === 0) return { label: 'None', color: 'bg-slate-200', text: 'text-slate-400' };
    if (metCount <= 2) return { label: 'Weak', color: 'bg-red-500 w-1/4', text: 'text-red-500' };
    if (metCount <= 4) return { label: 'Medium', color: 'bg-amber-500 w-2/4', text: 'text-amber-500' };
    return { label: 'Strong', color: 'bg-emerald-500 w-full', text: 'text-emerald-500' };
  };

  const strength = getStrength();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.email.trim()) next.email = 'Email is required';
    
    if (!form.password) {
      next.password = 'Password is required';
    } else if (metCount < 5) {
      next.password = 'Password must meet all complexity requirements';
    }
    
    if (form.password !== form.confirmPassword) {
      next.confirmPassword = 'Passwords do not match';
    }
    if (!form.phoneNumber.trim()) next.phoneNumber = 'Phone is required';

    if (form.role === 'donor') {
      if (!form.bloodGroup) next.bloodGroup = 'Blood group is required';
      if (!form.city.trim()) next.city = 'City is required';
    }
    if (form.role === 'hospital') {
      if (!form.hospitalName.trim()) next.hospitalName = 'Hospital name is required';
      if (!form.licenseNumber.trim()) next.licenseNumber = 'License number is required';
      if (!form.address.trim()) next.address = 'Address is required';
      if (!form.city.trim()) next.city = 'City is required';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        phoneNumber: form.phoneNumber,
        role: form.role,
      };

      if (form.role === 'donor') {
        Object.assign(payload, {
          bloodGroup: form.bloodGroup,
          city: form.city,
          availability: form.availability,
        });
      } else if (form.role === 'hospital') {
        Object.assign(payload, {
          hospitalName: form.hospitalName,
          licenseNumber: form.licenseNumber,
          address: form.address,
          city: form.city,
        });
      }

      const res = await register(payload);
      showSuccess(res.message || 'OTP verification code sent successfully!');
      navigate(`/verify-account?email=${encodeURIComponent(form.email)}`, { replace: true });
    } catch {
      // handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <motion.section
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative lg:w-[42%] min-h-[280px] lg:min-h-screen flex flex-col justify-between p-8 lg:p-12 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-rose-700 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15),_transparent_50%)]" />
        <motion.div
          className="absolute bottom-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur">
              <Heart className="w-6 h-6 text-white fill-white/30" />
            </div>
            <span className="text-xl font-bold tracking-tight">LifeLink</span>
          </Link>
        </div>

        <div className="relative z-10 my-8 lg:my-0">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight"
          >
            Join the network that connects donors, hospitals & communities.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-4 text-lg text-rose-100/90 max-w-md"
          >
            Real-time blood donation & emergency coordination — built for modern healthcare.
          </motion.p>

          <div className="mt-8 flex flex-wrap gap-4">
            {[
              { icon: Activity, text: 'Live availability' },
              { icon: Heart, text: 'Trusted donors' },
              { icon: Building2, text: 'Hospital verified' },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur text-white text-sm"
              >
                <Icon className="w-4 h-4" />
                {text}
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-sm text-rose-200/70 hidden lg:block">
          © {new Date().getFullYear()} LifeLink. Saving lives together.
        </p>
      </motion.section>

      <section className="flex-1 bg-slate-50 overflow-y-auto">
        <div className="max-w-xl mx-auto px-6 py-10 lg:py-12">
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Create your account</h1>
            <p className="text-slate-500 mt-1">Choose your role and complete your profile</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">I am joining as</p>
              <RoleSelector value={form.role} onChange={(role) => setForm((p) => ({ ...p, role }))} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Full name"
                name="name"
                placeholder="Jane Doe"
                icon={User}
                value={form.name}
                onChange={handleChange}
                error={errors.name}
              />
              <FormInput
                label="Phone number"
                name="phoneNumber"
                type="tel"
                placeholder="+1 555 000 0000"
                icon={Phone}
                value={form.phoneNumber}
                onChange={handleChange}
                error={errors.phoneNumber}
              />
            </div>

            <FormInput
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              icon={Mail}
              value={form.email}
              onChange={handleChange}
              error={errors.email}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Password"
                name="password"
                type="password"
                autoComplete="new-password"
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
                autoComplete="new-password"
                placeholder="Repeat password"
                icon={Lock}
                value={form.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
              />
            </div>

            {/* Password Strength Meter */}
            {form.password && (
              <div className="space-y-3 p-4 rounded-2xl bg-white border border-slate-100 shadow-soft">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-400">Password Strength:</span>
                  <span className={strength.text}>{strength.label}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-300 rounded-full ${strength.color}`} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-50">
                  {criteria.map((c, i) => (
                    <div key={i} className="flex items-center gap-1.5 font-medium">
                      {c.met ? (
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1.5 mr-1.5 flex-shrink-0" />
                      )}
                      <span className={c.met ? 'text-emerald-700' : 'text-slate-500'}>
                        {c.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {form.role === 'donor' && (
                <motion.div
                  key="donor"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
                    <p className="text-sm font-medium text-rose-800 mb-3">Donor details</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-700">Blood group</label>
                        <select
                          name="bloodGroup"
                          value={form.bloodGroup}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 focus:outline-none focus:ring-4 focus:ring-brand-500/15 focus:border-brand-500"
                        >
                          {BLOOD_GROUPS.map((bg) => (
                            <option key={bg} value={bg}>
                              {bg}
                            </option>
                          ))}
                        </select>
                      </div>
                      <FormInput
                        label="City"
                        name="city"
                        placeholder="Your city"
                        icon={MapPin}
                        value={form.city}
                        onChange={handleChange}
                        error={errors.city}
                      />
                    </div>
                    <label className="flex items-center gap-2 mt-4 cursor-pointer text-sm text-slate-700">
                      <input
                        type="checkbox"
                        name="availability"
                        checked={form.availability}
                        onChange={handleChange}
                        className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                      />
                      I am available to donate now
                    </label>
                  </div>
                </motion.div>
              )}

              {form.role === 'hospital' && (
                <motion.div
                  key="hospital"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-4">
                    <p className="text-sm font-medium text-emerald-800">Hospital details</p>
                    <FormInput
                      label="Hospital name"
                      name="hospitalName"
                      placeholder="City General Hospital"
                      icon={Building2}
                      value={form.hospitalName}
                      onChange={handleChange}
                      error={errors.hospitalName}
                    />
                    <FormInput
                      label="License number"
                      name="licenseNumber"
                      placeholder="MED-XXXX-XXXX"
                      icon={FileBadge}
                      value={form.licenseNumber}
                      onChange={handleChange}
                      error={errors.licenseNumber}
                    />
                    <FormInput
                      label="Address"
                      name="address"
                      placeholder="123 Healthcare Ave"
                      icon={Home}
                      value={form.address}
                      onChange={handleChange}
                      error={errors.address}
                    />
                    <FormInput
                      label="City"
                      name="city"
                      placeholder="City"
                      icon={MapPin}
                      value={form.city}
                      onChange={handleChange}
                      error={errors.city}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" loading={loading} className="w-full">
              Create account
            </Button>

            <p className="text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-500">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Register;
