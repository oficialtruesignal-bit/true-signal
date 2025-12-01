import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { TourStep } from "@/hooks/use-onboarding";

interface SpotlightTourProps {
  isOpen: boolean;
  currentStep: number;
  totalSteps: number;
  stepData: TourStep;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onComplete: () => void;
}

interface ElementPosition {
  top: number;
  left: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export function SpotlightTour({
  isOpen,
  currentStep,
  totalSteps,
  stepData,
  onNext,
  onPrev,
  onSkip,
  onComplete,
}: SpotlightTourProps) {
  const [elementPosition, setElementPosition] = useState<ElementPosition | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const updatePosition = useCallback(() => {
    if (!stepData?.selector) return;
    
    const element = document.querySelector(stepData.selector);
    if (element) {
      const rect = element.getBoundingClientRect();
      const padding = 8;
      
      const pos: ElementPosition = {
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
      };
      
      setElementPosition(pos);

      const tooltipWidth = 300;
      const tooltipHeight = 200;
      const margin = 16;
      
      let tooltipTop = 0;
      let tooltipLeft = 0;

      switch (stepData.placement) {
        case "top":
          tooltipTop = pos.top - tooltipHeight - margin;
          tooltipLeft = pos.centerX - tooltipWidth / 2;
          break;
        case "bottom":
          tooltipTop = pos.top + pos.height + margin;
          tooltipLeft = pos.centerX - tooltipWidth / 2;
          break;
        case "left":
          tooltipTop = pos.centerY - tooltipHeight / 2;
          tooltipLeft = pos.left - tooltipWidth - margin;
          break;
        case "right":
          tooltipTop = pos.centerY - tooltipHeight / 2;
          tooltipLeft = pos.left + pos.width + margin;
          break;
        default:
          tooltipTop = pos.top - tooltipHeight - margin;
          tooltipLeft = pos.centerX - tooltipWidth / 2;
      }

      tooltipLeft = Math.max(margin, Math.min(tooltipLeft, window.innerWidth - tooltipWidth - margin));
      tooltipTop = Math.max(margin, Math.min(tooltipTop, window.innerHeight - tooltipHeight - margin));

      setTooltipPosition({ top: tooltipTop, left: tooltipLeft });
    }
  }, [stepData]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(updatePosition, 100);
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition);
      };
    }
  }, [isOpen, updatePosition, currentStep]);

  if (!isOpen || !elementPosition) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200]"
      >
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: "none" }}
        >
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={elementPosition.left}
                y={elementPosition.top}
                width={elementPosition.width}
                height={elementPosition.height}
                rx="12"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.85)"
            mask="url(#spotlight-mask)"
          />
        </svg>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute pointer-events-none"
          style={{
            top: elementPosition.top,
            left: elementPosition.left,
            width: elementPosition.width,
            height: elementPosition.height,
          }}
        >
          <div className="absolute inset-0 rounded-xl border-2 border-[#33b864] shadow-[0_0_20px_rgba(51,184,100,0.5)]" />
          <div className="absolute inset-0 rounded-xl animate-ping border-2 border-[#33b864]/30" style={{ animationDuration: "2s" }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="absolute w-[300px] bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] rounded-2xl border border-[#33b864]/40 shadow-2xl shadow-[#33b864]/30 overflow-hidden"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
          }}
        >
          <div className="flex items-center justify-between px-4 pt-4">
            <div className="flex items-center gap-1.5">
              {[...Array(totalSteps)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentStep
                      ? "w-5 bg-[#33b864]"
                      : i < currentStep
                      ? "w-1.5 bg-[#33b864]/50"
                      : "w-1.5 bg-white/20"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={onSkip}
              className="text-gray-400 hover:text-white transition-colors text-xs flex items-center gap-1"
              data-testid="button-skip-spotlight"
            >
              Pular <X className="w-3 h-3" />
            </button>
          </div>

          <div className="px-4 py-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#33b864]/20 to-[#33b864]/5 border border-[#33b864]/30 flex items-center justify-center">
                <span className="text-2xl">{stepData.icon}</span>
              </div>
              <div>
                <div className="text-[10px] text-[#33b864] font-medium mb-0.5">
                  Passo {currentStep + 1} de {totalSteps}
                </div>
                <h3 
                  className="text-lg font-bold text-white"
                  style={{ fontFamily: "Sora, sans-serif" }}
                >
                  {stepData.title}
                </h3>
              </div>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              {stepData.description}
            </p>

            <div className="flex gap-2">
              {!isFirstStep && (
                <Button
                  variant="outline"
                  onClick={onPrev}
                  className="flex-1 h-10 border-white/10 text-white hover:bg-white/5 text-sm"
                  data-testid="button-spotlight-prev"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Voltar
                </Button>
              )}
              
              <Button
                onClick={isLastStep ? onComplete : onNext}
                className={`${isFirstStep ? "w-full" : "flex-1"} h-10 bg-[#33b864] hover:bg-[#2ea558] text-black font-bold text-sm`}
                data-testid="button-spotlight-next"
              >
                {isLastStep ? (
                  <>
                    Concluir <Rocket className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    Próximo <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
