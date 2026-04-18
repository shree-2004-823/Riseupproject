import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { FloatingWidgets } from '../components/auth/FloatingWidgets';
import { InputField } from '../components/auth/InputField';
import { PrimaryButton } from '../components/auth/PrimaryButton';
import { Home } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    const newErrors: Record<string, string> = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Email or username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      const user = await login({
        identifier: formData.identifier,
        password: formData.password,
      });

      navigate(user.onboardingCompleted ? '/dashboard' : '/onboarding');
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
      } else {
        setServerError('Unable to log in right now');
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.identifier.trim() && formData.password;

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
          <h1 className="text-4xl font-bold text-white">Welcome back</h1>
          <p className="text-white/60 text-lg">
            Continue your journey to a better you
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
            label="Email or Username"
            placeholder="Enter your email or username"
            value={formData.identifier}
            onChange={(value) => setFormData({ ...formData, identifier: value })}
            error={errors.identifier}
            required
          />

          <div>
            <InputField
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(value) => setFormData({ ...formData, password: value })}
              error={errors.password}
              required
            />
            <div className="mt-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/65">
              Sign in with either your email or your username. Once you are in, you can change your password from Settings.
            </div>
          </div>

          <PrimaryButton
            type="submit"
            disabled={!isFormValid}
            loading={loading}
          >
            Login
          </PrimaryButton>
        </form>

        {/* Signup Link */}
        <div className="text-center">
          <p className="text-white/60">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </AuthLayout>
  );
}
