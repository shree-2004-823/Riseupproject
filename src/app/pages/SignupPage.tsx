import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { FloatingWidgets } from '../components/auth/FloatingWidgets';
import { InputField } from '../components/auth/InputField';
import { PasswordStrengthMeter } from '../components/auth/PasswordStrengthMeter';
import { PrimaryButton } from '../components/auth/PrimaryButton';
import { Chrome, Home } from 'lucide-react';

export function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

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

    if (!validateForm()) return;

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Redirect to onboarding
      navigate('/onboarding');
    }, 1500);
  };

  const handleGoogleSignup = () => {
    // Simulate Google OAuth
    console.log('Google signup clicked');
  };

  const isFormValid =
    formData.fullName.trim() &&
    formData.email.trim() &&
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

        {/* Divider */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-white/40 text-sm">or</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        {/* Google Button */}
        <PrimaryButton variant="secondary" onClick={handleGoogleSignup}>
          <div className="flex items-center justify-center space-x-3">
            <Chrome size={20} />
            <span>Continue with Google</span>
          </div>
        </PrimaryButton>

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
        </div>
      </motion.div>
    </AuthLayout>
  );
}