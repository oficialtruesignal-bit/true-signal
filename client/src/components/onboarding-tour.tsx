import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Rocket, ArrowRight, Home, Ticket, Play, Calendar, Wallet, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/hooks/use-onboarding";
import { Logo } from "@/components/logo";

const STEP_ICONS: Record<string, React.ReactNode> = {
  "welcome": <Home className="w-8 h-8 text-white" />,
  "tips": <Ticket className="w-8 h-8 text-white" />,
  "live": <Play className="w-8 h-8 text-white" />,
  "pregame": <Calendar className="w-8 h-8 text-white" />,
  "gestao": <Wallet className="w-8 h-8 text-white" />,
  "settings": <Settings className="w-8 h-8 text-white" />,
};

interface OnboardingTourProps {
  showTour: boolean;
  currentStep: number;
  totalSteps: number;
  currentStepData: {
    id: string;
    title: string;
    description: string;
    icon: string;
  };
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onComplete: () => void;
}

export function OnboardingTour({
  showTour,
  currentStep,
  totalSteps,
  currentStepData,
  onNext,
  onPrev,
  onSkip,
  onComplete,
}: OnboardingTourProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <AnimatePresence>
      {showTour && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-full max-w-md bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] rounded-2xl border border-[#33b864]/30 shadow-2xl shadow-[#33b864]/20 overflow-hidden"
          >
            {/* Header with Skip */}
            <div className="flex items-center justify-between px-6 pt-5">
              <div className="flex items-center gap-2">
                {[...Array(totalSteps)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentStep
                        ? "w-6 bg-[#33b864]"
                        : i < currentStep
                        ? "w-1.5 bg-[#33b864]/50"
                        : "w-1.5 bg-white/20"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={onSkip}
                className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
                data-testid="button-skip-tour"
              >
                Pular <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                    className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#33b864]/20 to-[#33b864]/5 border border-[#33b864]/30 flex items-center justify-center"
                  >
                    <span className="text-4xl">{currentStepData.icon}</span>
                  </motion.div>

                  {/* Step Number */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#33b864]/10 border border-[#33b864]/20 mb-4">
                    <span className="text-[#33b864] text-xs font-medium">
                      {currentStep + 1} de {totalSteps}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 
                    className="text-2xl font-bold text-white mb-3"
                    style={{ fontFamily: "Sora, sans-serif" }}
                  >
                    {currentStepData.title}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                    {currentStepData.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="px-6 pb-6 flex gap-3">
              {!isFirstStep && (
                <Button
                  variant="outline"
                  onClick={onPrev}
                  className="flex-1 h-12 border-white/10 text-white hover:bg-white/5"
                  data-testid="button-tour-prev"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>
              )}
              
              <Button
                onClick={isLastStep ? onComplete : onNext}
                className={`${isFirstStep ? "w-full" : "flex-1"} h-12 bg-[#33b864] hover:bg-[#2ea558] text-black font-bold`}
                data-testid="button-tour-next"
              >
                {isLastStep ? (
                  <>
                    Começar <Rocket className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    Próximo <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function WelcomeModal({
  isOpen,
  onStartTour,
  onSkip,
}: {
  isOpen: boolean;
  onStartTour: () => void;
  onSkip: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-full max-w-md bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] rounded-2xl border border-[#33b864]/30 shadow-2xl shadow-[#33b864]/20 overflow-hidden"
          >
            {/* Animated Background Effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#33b864]/10 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative px-6 py-10 text-center">
              {/* Welcome Icon - Professional Shield */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2, duration: 0.6 }}
                className="w-20 h-20 mx-auto mb-6"
              >
                <svg viewBox="0 0 80 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <defs>
                    <linearGradient id="welcome-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4ade80" />
                      <stop offset="100%" stopColor="#33b864" />
                    </linearGradient>
                    <filter id="welcome-glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <path 
                    d="M8 12 L8 64 Q8 80 40 92 Q72 80 72 64 L72 12 Q72 4 64 4 L16 4 Q8 4 8 12 Z" 
                    fill="none"
                    stroke="url(#welcome-gradient)"
                    strokeWidth="3"
                    filter="url(#welcome-glow)"
                  />
                  <path 
                    d="M16 48 L28 48 L34 36 L40 60 L46 44 L52 52 L64 52" 
                    stroke="#33b864" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  >
                    <animate attributeName="stroke-dasharray" values="0,200;100,200" dur="1.5s" fill="freeze" />
                  </path>
                  <circle cx="64" cy="52" r="4" fill="#33b864">
                    <animate attributeName="opacity" values="0;1" dur="1.5s" fill="freeze" />
                  </circle>
                </svg>
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-2"
              >
                <h1 
                  className="text-2xl font-bold text-white mb-4"
                  style={{ fontFamily: "Sora, sans-serif" }}
                >
                  Bem-Vindo ao
                </h1>
                <div className="flex justify-center">
                  <Logo size="xl" />
                </div>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-400 mb-8 max-w-xs mx-auto"
              >
                Vamos fazer um tour rápido para você conhecer todas as funcionalidades do app?
              </motion.p>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3"
              >
                <Button
                  onClick={onStartTour}
                  className="w-full h-14 bg-[#33b864] hover:bg-[#2ea558] text-black font-bold text-base"
                  data-testid="button-start-tour"
                >
                  Fazer o Tour <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                
                <button
                  onClick={onSkip}
                  className="w-full py-3 text-gray-400 hover:text-white transition-colors text-sm"
                  data-testid="button-skip-welcome"
                >
                  Não, obrigado. Já sei usar.
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
