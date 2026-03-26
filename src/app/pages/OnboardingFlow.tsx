import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { StepGoals } from '../components/onboarding/StepGoals';
import { StepHabits } from '../components/onboarding/StepHabits';
import { StepRoutine } from '../components/onboarding/StepRoutine';
import { StepCoach } from '../components/onboarding/StepCoach';
import { StepSummary } from '../components/onboarding/StepSummary';
import { ProgressBar } from '../components/onboarding/ProgressBar';

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

  const totalSteps = 5;

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

  const handleComplete = () => {
    // Save onboarding data
    console.log('Onboarding completed:', data);
    // Navigate to dashboard
    navigate('/dashboard');
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
                onComplete={handleComplete}
                onBack={handleBack}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
