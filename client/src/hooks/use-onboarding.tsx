import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./use-auth";

export interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  route?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "home",
    title: "Painel Principal",
    description: "Seu centro de comando! Veja a taxa de acerto, sinais online e as métricas mais importantes.",
    icon: "🏠",
    route: "/app"
  },
  {
    id: "tips",
    title: "Sinais Premium",
    description: "Aqui ficam os bilhetes analisados pela nossa equipe. Com valor de entrada baseado na sua gestão de banca.",
    icon: "🎫",
    route: "/tips"
  },
  {
    id: "live",
    title: "Jogos Ao Vivo",
    description: "Acompanhe partidas em tempo real com estatísticas detalhadas e atualizações instantâneas.",
    icon: "⚽",
    route: "/live"
  },
  {
    id: "pregame",
    title: "Pré-Jogo",
    description: "Analise as próximas partidas antes do apito inicial. Ideal para planejar suas entradas.",
    icon: "📅",
    route: "/pregame"
  },
  {
    id: "gestao",
    title: "Gestão de Banca",
    description: "Configure seu capital e perfil de risco. Receba valores exatos de entrada em cada bilhete.",
    icon: "💰",
    route: "/gestao"
  },
  {
    id: "settings",
    title: "Configurações",
    description: "Personalize o app, altere idioma, gerencie notificações e sua assinatura.",
    icon: "⚙️",
    route: "/settings"
  }
];

export function useOnboarding() {
  const { user } = useAuth();
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
            setShowTour(true);
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
    setCurrentStep(0);
    setShowTour(true);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTour();
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const skipTour = useCallback(async () => {
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
  };
}
