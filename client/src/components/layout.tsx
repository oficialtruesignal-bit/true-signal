import { Link, useLocation } from "wouter";
import { Home, LayoutDashboard, Settings, LogOut, Bell, Ticket, Play, Calendar, Plus, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useEffect, useState } from "react";
import OneSignal from 'react-onesignal';
import { Button } from "./ui/button";
import { Logo } from "./logo";
import { useQuery } from "@tanstack/react-query";
import { tipsService } from "@/lib/tips-service";
import { useUnreadTips } from "@/hooks/use-unread-tips";
import { useOnboarding } from "@/hooks/use-onboarding";
import { WelcomeModal } from "./onboarding-tour";
import { SpotlightTour } from "./spotlight-tour";
import { BankrollSetupModal } from "./bankroll-setup-modal";
import { useContentProtection } from "@/hooks/use-content-protection";
import { PWAInstallPrompt } from "./pwa-install-prompt";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [showWelcome, setShowWelcome] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const { isBlurred } = useContentProtection();
  
  // Onboarding tour
  const {
    showWelcome: onboardingShowWelcome,
    showTour,
    showBankrollSetup,
    currentStep,
    totalSteps,
    currentStepData,
    isLoading: onboardingLoading,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    closeBankrollSetup,
    setShowWelcome: setOnboardingShowWelcome,
  } = useOnboarding();

  // Sync welcome modal state
  useEffect(() => {
    if (onboardingShowWelcome && !hasShownWelcome) {
      setShowWelcome(true);
      setHasShownWelcome(true);
    }
  }, [onboardingShowWelcome, hasShownWelcome]);

  const handleStartTour = () => {
    setShowWelcome(false);
    startTour();
  };

  const handleSkipWelcome = () => {
    setShowWelcome(false);
    skipTour();
  };

  // Get tips for unread count
  const { data: tips = [] } = useQuery({
    queryKey: ['tips'],
    queryFn: tipsService.getAll,
    refetchInterval: 30000,
  });

  const tipIds = tips.map(tip => tip.id);
  const { unreadCount } = useUnreadTips(tipIds);

  // Initial OneSignal Init
  useEffect(() => {
    const initOneSignal = async () => {
      const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
      
      if (!appId) {
        console.log("OneSignal: No APP_ID configured (notifications disabled)");
        return;
      }

      try {
        await OneSignal.init({
          appId,
          allowLocalhostAsSecureOrigin: true,
        });
        
        console.log("OneSignal initialized successfully");
      } catch (error) {
        console.error("OneSignal init error:", error);
      }
    };

    initOneSignal();
  }, [user]);

  // Force reload profile (clear cache)
  const reloadProfile = async () => {
    if (user) {
      const { data } = await (await import("@/lib/supabase")).supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) {
        console.log('🔄 Profile reloaded:', data);
        window.location.reload(); // Force full reload
      }
    }
  };

  // Desktop Nav Items (with Admin)
  const desktopNavItems = [
    { icon: Home, label: t.nav.home, path: "/app" },
    { icon: Ticket, label: t.nav.tips, path: "/tips" },
    { icon: Play, label: t.nav.live, path: "/live" },
    { icon: Calendar, label: t.nav.pregame, path: "/pregame" },
    { icon: Wallet, label: t.nav.bankroll || "Gestão", path: "/gestao" },
    { icon: Settings, label: t.nav.settings, path: "/settings" },
    { icon: LayoutDashboard, label: t.nav.admin, path: "/admin", hidden: !(user?.role === 'admin' || user?.email === 'kwillianferreira@gmail.com') },
  ];

  // Mobile Nav Items (5 icons, Settings moved to header)
  const mobileNavItems = [
    { icon: Home, label: t.nav.home, path: "/app" },
    { icon: Ticket, label: t.nav.tips, path: "/tips" },
    { icon: Play, label: t.nav.live, path: "/live" },
    { icon: Calendar, label: t.nav.pregame, path: "/pregame" },
    { icon: Wallet, label: "Gestão", path: "/gestao" },
  ];

  return (
    <div 
      className={cn(
        "min-h-screen bg-background text-foreground pb-20 md:pb-0 md:pl-64 font-sans select-none",
        isBlurred && "blur-xl pointer-events-none"
      )}
      style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
    >
      {/* Overlay de proteção quando blur ativo */}
      {isBlurred && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <p className="text-white text-xl font-bold">Conteúdo Protegido</p>
            <p className="text-gray-400 text-sm mt-2">Volte para a tela para continuar</p>
          </div>
        </div>
      )}
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-primary/20 p-6 z-50">
        <Link href="/app" className="mb-10 px-2 block">
          <Logo size="md" showText={true} />
        </Link>

        <div className="mb-6 px-2">
           <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                {user?.firstName?.charAt(0) || "U"}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs text-muted-foreground">{t.nav.welcome}</span>
                <span className="text-sm font-bold text-foreground truncate">{user?.firstName || "..."}</span>
              </div>
           </div>
        </div>

        <nav className="space-y-2 flex-1">
          {desktopNavItems.filter(item => !item.hidden).map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group border relative",
                location === item.path
                  ? "bg-primary/15 text-primary border-primary/30 shadow-[0_0_20px_rgba(51,184,100,0.15)]"
                  : "text-gray-400 border-white/5 hover:text-primary hover:bg-primary/10 hover:border-primary/20"
              )}
            >
              <div className={cn(
                "relative p-2 rounded-lg transition-all",
                location === item.path 
                  ? "bg-primary/20 shadow-[0_0_12px_rgba(51,184,100,0.4)]" 
                  : "bg-white/5 group-hover:bg-primary/15"
              )}>
                <item.icon
                  className={cn(
                    "w-5 h-5 transition-all",
                    location === item.path 
                      ? "text-primary drop-shadow-[0_0_8px_rgba(51,184,100,0.6)]" 
                      : "text-gray-400 group-hover:text-primary"
                  )}
                />
                {item.path === "/tips" && unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                )}
              </div>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
          
          {/* Botão Sair - ao lado de Configurações */}
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group border w-full text-gray-400 border-white/5 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20"
          >
            <div className="p-2 rounded-lg transition-all bg-white/5 group-hover:bg-red-500/15">
              <LogOut className="w-5 h-5 transition-all text-gray-400 group-hover:text-red-400" />
            </div>
            <span className="font-medium">{t.nav.logout}</span>
          </button>
        </nav>

        <div className="mt-auto space-y-2">
          <div className="bg-white/60 dark:bg-black/40 border-gray-200 dark:border-white/5 rounded-xl p-4 border">
            <div className="flex items-center gap-2 text-foreground text-sm font-bold mb-2">
              <Bell className="w-4 h-4 text-primary" /> {t.nav.notifications}
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {t.nav.notificationsDesc}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={async () => {
                const { notificationService } = await import("@/lib/notification-service");
                await notificationService.requestPermission();
              }}
              className="w-full text-xs h-7 border-primary/20 text-primary hover:bg-primary/10"
            >
              {t.nav.activateNow}
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-gray-200 dark:border-primary/20 z-50 flex items-center justify-between px-4">
        <Logo size="sm" showText={true} />
        <div className="flex items-center gap-1">
           <span className="text-sm font-bold text-foreground">{t.nav.hello} {user?.firstName?.split(' ')[0] || user?.firstName}</span>
           <Link href="/settings" data-tour="settings-icon" className="p-2 text-muted-foreground hover:text-primary transition-colors">
            <Settings className="w-5 h-5" />
          </Link>
           <button onClick={logout} className="p-2 text-muted-foreground hover:text-red-400 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 md:pt-6 px-4 md:px-8 max-w-7xl mx-auto animate-in fade-in duration-500 pb-24">
        {children}
      </main>

      {/* Mobile Bottom Nav - 5 Icons */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-card/95 backdrop-blur-md border-t border-primary/20 z-50 flex items-center justify-around px-2 safe-area-pb">
        {mobileNavItems.map((item, index) => {
          const tourIds = ['home-icon', 'tips-icon', 'live-icon', 'pregame-icon', 'gestao-icon'];
          return (
            <Link 
              key={item.path} 
              href={item.path}
              data-testid={`nav-${item.label.toLowerCase()}`}
              data-tour={tourIds[index]}
              className={cn(
                "flex flex-col items-center justify-center h-full gap-1.5 transition-all relative flex-1",
                location === item.path ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <item.icon
                  className={cn(
                    "w-7 h-7 transition-all",
                    location === item.path ? "scale-110 drop-shadow-[0_0_12px_rgba(51,184,100,0.8)]" : ""
                  )}
                  strokeWidth={location === item.path ? 2.5 : 2}
                />
                {item.path === "/tips" && unreadCount > 0 && (
                  <div className="absolute -top-1.5 -right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                )}
              </div>
              <span className={cn(
                "text-[11px] font-medium transition-all text-center whitespace-nowrap",
                location === item.path ? "font-bold" : ""
              )}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Admin FAB (Floating Action Button) */}
      {(user?.role === 'admin' || user?.email === 'kwillianferreira@gmail.com') && (
        <Link href="/admin">
          <button
            data-testid="fab-create-tip"
            className="fixed bottom-20 right-4 md:bottom-8 md:right-8 w-14 h-14 bg-primary hover:bg-primary/90 text-black rounded-full shadow-[0_0_30px_rgba(51,184,100,0.4)] hover:shadow-[0_0_40px_rgba(51,184,100,0.6)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 z-40 border-2 border-primary/50"
            aria-label="Criar Novo Sinal"
          >
            <Plus className="w-6 h-6" strokeWidth={3} />
          </button>
        </Link>
      )}

      {/* Onboarding Tour */}
      <WelcomeModal
        isOpen={showWelcome}
        onStartTour={handleStartTour}
        onSkip={handleSkipWelcome}
      />
      
      <SpotlightTour
        isOpen={showTour}
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepData={currentStepData}
        onNext={nextStep}
        onPrev={prevStep}
        onSkip={skipTour}
        onComplete={completeTour}
      />

      {/* Bankroll Setup Modal - After Tour */}
      <BankrollSetupModal
        isOpen={showBankrollSetup}
        onComplete={async (data) => {
          if (user?.id) {
            await fetch(`/api/profile/${user.id}/bankroll`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });
          }
          closeBankrollSetup();
        }}
      />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

    </div>
  );
}
