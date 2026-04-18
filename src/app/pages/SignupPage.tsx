import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { FloatingWidgets } from '../components/auth/FloatingWidgets';
import { InputField } from '../components/auth/InputField';
import { PasswordStrengthMeter } from '../components/auth/PasswordStrengthMeter';
import { PrimaryButton } from '../components/auth/PrimaryButton';
import { Home } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api';

export function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateUsername = (username: string) => /^[a-zA-Z0-9._-]{3,24}$/.test(username);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (!validateUsername(formData.username)) {
      newErrors.username = 'Use 3 to 24 letters, numbers, dots, underscores, or hyphens';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      await signup({
        fullName: formData.fullName,
        email: formData.email,
        username: formData.username,
        password: formData.password,
      });

      navigate('/onboarding');
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
      } else {
        setServerError('Unable to create your account right now');
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.fullName.trim() &&
    formData.email.trim() &&
    formData.username.trim() &&
    formData.password.length >= 8 &&
    formData.password === formData.confirmPassword;

  return (
    <AuthLayout leftPanel={<FloatingWidgets />}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Home Button */}
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-white/60 hover:text-white transition-colors group"
        >
          <Home size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm">Back to Home</span>
        </Link>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Create your account</h1>
          <p className="text-white/60 text-lg">
            Start building a better version of yourself today
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {serverError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {serverError}
            </div>
          )}

          <InputField
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={(value) => setFormData({ ...formData, fullName: value })}
            error={errors.fullName}
            required
          />

          <InputField
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(value) => setFormData({ ...formData, email: value })}
            error={errors.email}
            required
          />

          <InputField
            label="Username"
            placeholder="Choose a username"
            value={formData.username}
            onChange={(value) => setFormData({ ...formData, username: value })}
            error={errors.username}
            required
          />

          <div>
            <InputField
              label="Password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={(value) => setFormData({ ...formData, password: value })}
              error={errors.password}
              required
            />
            <PasswordStrengthMeter password={formData.password} />
          </div>

          <InputField
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(value) =>
              setFormData({ ...formData, confirmPassword: value })
            }
            error={errors.confirmPassword}
            required
          />

          <PrimaryButton
            type="submit"
            disabled={!isFormValid}
            loading={loading}
          >
            Create Account
          </PrimaryButton>
        </form>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-white/60">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              Login
            </Link>
          </p>
          <p className="mt-3 text-sm text-white/45">You will be able to sign back in later with either your email or your username.</p>
        </div>
      </motion.div>
    </AuthLayout>
  );
}
