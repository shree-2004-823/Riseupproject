import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { StepGoals } from '../components/onboarding/StepGoals';
import { StepHabits } from '../components/onboarding/StepHabits';
import { StepRoutine } from '../components/onboarding/StepRoutine';
import { StepCoach } from '../components/onboarding/StepCoach';
import { StepSummary } from '../components/onboarding/StepSummary';
import { ProgressBar } from '../components/onboarding/ProgressBar';
import { apiFetch, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export interface OnboardingData {
  goals: string[];
  habits: string[];
  customHabits: string[];
  routine: {
    wakeTime: string;
    workoutTime: string;
    reminderTime: string;
    sleepTime: string;
  };
  coachPersonality: string;
}

export function OnboardingFlow() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    goals: [],
    habits: [],
    customHabits: [],
    routine: {
      wakeTime: '07:00',
      workoutTime: '08:00',
      reminderTime: '20:00',
      sleepTime: '22:00',
    },
    coachPersonality: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  const totalSteps = 5;

  useEffect(() => {
    let ignore = false;

    void apiFetch<OnboardingData>('/onboarding')
      .then((response) => {
        if (!ignore && response.goals.length > 0) {
          setData(response);
        }
      })
      .catch(() => {
        // Fresh users won't have onboarding data yet.
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setServerError('');
    setSaving(true);

    try {
      await apiFetch('/onboarding', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (user) {
        setUser({ ...user, onboardingCompleted: true });
      }

      navigate('/dashboard');
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
      } else {
        setServerError('Unable to save your onboarding right now');
      }
    } finally {
      setSaving(false);
    }
  };

  const updateData = (updates: Partial<OnboardingData>) => {
    setData({ ...data, ...updates });
  };

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      {/* Animated background */}
      <motion.div
        animate={{
          background: [
            'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 40% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
          ],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0"
      ></motion.div>

      <div className="relative z-10">
        {/* Progress Bar */}
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

        {/* Step Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          {serverError && (
            <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-200">
              {serverError}
            </div>
          )}

          {loading ? (
            <div className="text-center text-white/70 py-20">Loading your onboarding...</div>
          ) : (
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <StepGoals
                key="goals"
                selectedGoals={data.goals}
                onUpdate={(goals) => updateData({ goals })}
                onNext={handleNext}
              />
            )}
            {currentStep === 2 && (
              <StepHabits
                key="habits"
                selectedHabits={data.habits}
                customHabits={data.customHabits}
                onUpdate={(habits, customHabits) =>
                  updateData({ habits, customHabits })
                }
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {currentStep === 3 && (
              <StepRoutine
                key="routine"
                routine={data.routine}
                onUpdate={(routine) => updateData({ routine })}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {currentStep === 4 && (
              <StepCoach
                key="coach"
                selectedCoach={data.coachPersonality}
                onUpdate={(coachPersonality) => updateData({ coachPersonality })}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {currentStep === 5 && (
              <StepSummary
                key="summary"
                data={data}
                onComplete={saving ? () => {} : handleComplete}
                onBack={handleBack}
              />
            )}
          </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
