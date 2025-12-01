import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./use-auth";
import { useLocation } from "wouter";

export interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  selector: string;
  route?: string;
  placement?: "top" | "bottom" | "left" | "right";
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Painel Principal",
    description: "Este é seu centro de comando! Aqui você vê todos os sinais e métricas importantes.",
    icon: "🏠",
    selector: "[data-tour='home-icon']",
    route: "/app",
    placement: "top"
  },
  {
    id: "tips",
    title: "Sinais Premium",
    description: "Toque aqui para ver os bilhetes analisados pela nossa equipe com odds e valor de entrada.",
    icon: "🎫",
    selector: "[data-tour='tips-icon']",
    route: "/app",
    placement: "top"
  },
  {
    id: "live",
    title: "Jogos Ao Vivo",
    description: "Acompanhe partidas em tempo real com estatísticas e placares atualizados.",
    icon: "⚽",
    selector: "[data-tour='live-icon']",
    route: "/app",
    placement: "top"
  },
  {
    id: "pregame",
    title: "Pré-Jogo",
    description: "Analise as próximas partidas antes do início. Ideal para planejar suas entradas.",
    icon: "📅",
    selector: "[data-tour='pregame-icon']",
    route: "/app",
    placement: "top"
  },
  {
    id: "gestao",
    title: "Gestão de Banca",
    description: "Configure seu capital e perfil de risco para receber valores exatos de entrada.",
    icon: "💰",
    selector: "[data-tour='gestao-icon']",
    route: "/app",
    placement: "top"
  },
  {
    id: "settings",
    title: "Configurações",
    description: "Toque no ícone de engrenagem para acessar configurações, idioma e sua assinatura.",
    icon: "⚙️",
    selector: "[data-tour='settings-icon']",
    route: "/app",
    placement: "bottom"
  }
];

export function useOnboarding() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasChecked, setHasChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user?.id || hasChecked) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/profile/${user.id}/onboarding`);
        if (response.ok) {
          const data = await response.json();
          if (!data.hasCompletedTour) {
            setShowWelcome(true);
          }
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      } finally {
        setIsLoading(false);
        setHasChecked(true);
      }
    };

    checkOnboardingStatus();
  }, [user?.id, hasChecked]);

  const startTour = useCallback(() => {
    setShowWelcome(false);
    setCurrentStep(0);
    const firstStep = TOUR_STEPS[0];
    if (firstStep.route) {
      navigate(firstStep.route);
    }
    setTimeout(() => {
      setShowTour(true);
    }, 300);
  }, [navigate]);

  const nextStep = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      const nextStepData = TOUR_STEPS[currentStep + 1];
      if (nextStepData.route) {
        navigate(nextStepData.route);
      }
      setCurrentStep(prev => prev + 1);
    } else {
      completeTour();
    }
  }, [currentStep, navigate]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      const prevStepData = TOUR_STEPS[currentStep - 1];
      if (prevStepData.route) {
        navigate(prevStepData.route);
      }
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep, navigate]);

  const skipTour = useCallback(async () => {
    setShowWelcome(false);
    setShowTour(false);
    if (user?.id) {
      try {
        await fetch(`/api/profile/${user.id}/tour-completed`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: true }),
        });
      } catch (error) {
        console.error("Error marking tour as completed:", error);
      }
    }
  }, [user?.id]);

  const completeTour = useCallback(async () => {
    setShowTour(false);
    if (user?.id) {
      try {
        await fetch(`/api/profile/${user.id}/tour-completed`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: true }),
        });
      } catch (error) {
        console.error("Error marking tour as completed:", error);
      }
    }
  }, [user?.id]);

  return {
    showWelcome,
    showTour,
    currentStep,
    totalSteps: TOUR_STEPS.length,
    currentStepData: TOUR_STEPS[currentStep],
    steps: TOUR_STEPS,
    isLoading,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    setShowTour,
    setShowWelcome,
  };
}
