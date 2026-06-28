'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  FileText,
  Layout,
  Eye,
  Sliders,
  Download,
  Save,
  Zap,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  glowColor: string;
}

const STEPS: Step[] = [
  {
    id: 1,
    title: 'Welcome to Siraj Resume Builder',
    description: 'Create professional resumes in minutes using beautiful templates and ATS-friendly designs.',
    icon: Sparkles,
    accentColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    glowColor: 'rgba(99, 102, 241, 0.15)'
  },
  {
    id: 2,
    title: 'Create Your Resume',
    description: 'Fill in your personal details, education, work experience, projects, certifications, and skills. The app automatically organizes everything into a professional resume.',
    icon: FileText,
    accentColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    glowColor: 'rgba(16, 185, 129, 0.15)'
  },
  {
    id: 3,
    title: 'Choose a Template',
    description: 'Browse multiple professional resume templates. Switch between layouts instantly without losing your data. Preview changes in real time.',
    icon: Layout,
    accentColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    glowColor: 'rgba(245, 158, 11, 0.15)'
  },
  {
    id: 4,
    title: 'Live Preview',
    description: 'Use the Preview feature to see exactly how your resume will appear before downloading. Any changes you make update instantly.',
    icon: Eye,
    accentColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    glowColor: 'rgba(244, 63, 94, 0.15)'
  },
  {
    id: 5,
    title: 'Customize',
    description: 'Change colors, fonts, spacing, and template styles if available. Personalize your resume to match your profession.',
    icon: Sliders,
    accentColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    glowColor: 'rgba(168, 85, 247, 0.15)'
  },
  {
    id: 6,
    title: 'Export Resume',
    description: 'Export your resume as a high-quality PDF. Your resume will be optimized for printing and ATS systems.',
    icon: Download,
    accentColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    glowColor: 'rgba(59, 130, 246, 0.15)'
  },
  {
    id: 7,
    title: 'Save & Continue Later',
    description: 'If signed in, your resume is safely stored. You can continue editing anytime from any supported device.',
    icon: Save,
    accentColor: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
    glowColor: 'rgba(20, 184, 166, 0.15)'
  },
  {
    id: 8,
    title: "You're Ready!",
    description: "You're all set. Start building your professional resume now.",
    icon: Zap,
    accentColor: 'text-amber-300 bg-amber-500/15 border-amber-500/40',
    glowColor: 'rgba(245, 158, 11, 0.25)'
  }
];

export default function OnboardingTutorial({
  isOpen,
  onClose,
  isDarkMode = true
}: OnboardingTutorialProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEPS.length - 1;

  const handleSkip = useCallback(() => {
    localStorage.setItem('siraj_onboarding_completed', 'true');
    onClose();
  }, [onClose]);

  const handleFinish = useCallback(() => {
    localStorage.setItem('siraj_onboarding_completed', 'true');
    onClose();
  }, [onClose]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      handleFinish();
    } else {
      setDirection('forward');
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [isLastStep, handleFinish]);

  const handleBack = useCallback(() => {
    if (isFirstStep) return;
    setDirection('backward');
    setCurrentStepIndex((prev) => prev - 1);
  }, [isFirstStep]);

  // Focus management: focus the action button when opening or switching steps
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        nextButtonRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, currentStepIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handleBack();
      } else if (e.key === 'Escape') {
        handleSkip();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handleBack, handleSkip]);

  if (!isOpen) return null;

  const currentStep = STEPS[currentStepIndex];

  // Custom slide animations
  const slideVariants = {
    enter: (dir: 'forward' | 'backward') => ({
      x: dir === 'forward' ? 120 : -120,
      opacity: 0,
      scale: 0.96
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.35,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    exit: (dir: 'forward' | 'backward') => ({
      x: dir === 'forward' ? -120 : 120,
      opacity: 0,
      scale: 0.96,
      transition: {
        duration: 0.25,
        ease: [0.16, 1, 0.3, 1]
      }
    })
  };

  const StepIcon = currentStep.icon;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-desc"
    >
      {/* Dim backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleSkip}
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-[4px] cursor-pointer"
      />

      {/* Main onboarding card dialog */}
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 15, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full max-w-md relative rounded-3xl border shadow-2xl overflow-hidden flex flex-col ${
          isDarkMode
            ? 'bg-slate-900 border-white/10 text-white'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
        style={{
          boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px ${currentStep.glowColor}`
        }}
      >
        {/* Header Close button */}
        <button
          type="button"
          onClick={handleSkip}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors cursor-pointer z-10 ${
            isDarkMode
              ? 'text-slate-400 hover:text-white hover:bg-white/10'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
          aria-label="Skip onboarding"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Dynamic sliding steps wrapper */}
        <div className="p-6 sm:p-8 flex-1 flex flex-col items-center text-center relative min-h-[320px] justify-center select-none">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStepIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full flex flex-col items-center justify-center"
            >
              {/* Illustration / Icon ring container */}
              <div
                className={`w-16 h-16 rounded-2xl border flex items-center justify-center mb-6 transition-all duration-300 shadow-md ${currentStep.accentColor}`}
                style={{
                  boxShadow: `0 0 15px ${currentStep.glowColor}`
                }}
              >
                <StepIcon className="w-8 h-8" />
              </div>

              {/* Step Title */}
              <h2
                id="onboarding-title"
                className={`text-xl font-extrabold tracking-tight mb-3 font-display leading-tight ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}
              >
                {currentStep.title}
              </h2>

              {/* Step Description */}
              <p
                id="onboarding-desc"
                className={`text-xs sm:text-sm font-sans leading-relaxed max-w-sm ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                {currentStep.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation and Indicators rail */}
        <div
          className={`px-6 py-5 border-t flex flex-row items-center justify-between ${
            isDarkMode ? 'border-white/5 bg-slate-950/20' : 'border-slate-100 bg-slate-50'
          }`}
        >
          {/* Back button or Skip button */}
          <div>
            {isFirstStep ? (
              <button
                type="button"
                onClick={handleSkip}
                className={`text-xs font-bold font-sans transition-colors tracking-wide px-3 py-1.5 rounded-lg cursor-pointer ${
                  isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Skip
              </button>
            ) : (
              <button
                type="button"
                onClick={handleBack}
                className={`flex items-center gap-1 text-xs font-bold font-sans transition-all tracking-wide px-3 py-1.5 rounded-lg cursor-pointer ${
                  isDarkMode
                    ? 'text-slate-400 hover:text-white hover:bg-white/5'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back
              </button>
            )}
          </div>

          {/* Dots page indicator */}
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {STEPS.map((step, idx) => (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  setDirection(idx > currentStepIndex ? 'forward' : 'backward');
                  setCurrentStepIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStepIndex
                    ? `w-4 ${isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'}`
                    : `w-1.5 ${isDarkMode ? 'bg-white/20 hover:bg-white/40' : 'bg-slate-300 hover:bg-slate-400'}`
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Next / Start Building Button */}
          <div>
            <button
              type="button"
              ref={nextButtonRef}
              onClick={handleNext}
              className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all shadow-sm cursor-pointer select-none active:scale-[0.98] ${
                isLastStep
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                  : isDarkMode
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/10'
              }`}
            >
              {isLastStep ? (
                <>
                  Start Building
                  <Zap className="w-3.5 h-3.5 fill-current animate-bounce" style={{ animationDuration: '3s' }} />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
