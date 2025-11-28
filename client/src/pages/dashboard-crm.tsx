import { Layout } from "@/components/layout";
import { CompactLiveHud } from "@/components/compact-live-hud";
import { AIScanner } from "@/components/ai-scanner";
import { TrialBanner } from "@/components/paywall/trial-banner";
import { Bell, CheckCircle2, Smartphone } from "lucide-react";
import { useState, useEffect } from "react";
import { notificationService } from "@/lib/notification-service";

function MobileNotificationCard() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const enabled = await notificationService.isEnabled();
      setNotificationsEnabled(enabled);
    };
    checkStatus();
  }, []);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      const granted = await notificationService.requestPermission();
      if (granted) {
        setNotificationsEnabled(true);
        // Envia notificação de teste para confirmar que está funcionando
        if ('Notification' in window) {
          new Notification("Notificações Ativadas! ✅", {
            body: "Você receberá alertas de novas entradas em tempo real.",
            icon: "/favicon.ico",
          });
        }
      }
    } catch (error) {
      console.error("Erro ao ativar notificações:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="md:hidden mt-4 bg-gradient-to-r from-[#0a1628] to-[#0d1f3c] border border-[#33b864]/30 rounded-xl p-4 shadow-lg" data-testid="card-mobile-notifications">
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-full ${notificationsEnabled ? 'bg-[#33b864]/30' : 'bg-[#33b864]/20'} flex items-center justify-center flex-shrink-0`}>
          {notificationsEnabled ? (
            <CheckCircle2 className="w-6 h-6 text-[#33b864]" />
          ) : (
            <Bell className="w-6 h-6 text-[#33b864]" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold text-sm mb-1">
            {notificationsEnabled ? 'Notificações Ativadas' : 'Ative as Notificações'}
          </h3>
          <p className="text-gray-400 text-xs leading-relaxed mb-3">
            {notificationsEnabled 
              ? 'Você receberá alertas em tempo real no seu celular sempre que uma nova entrada for publicada.'
              : 'Receba alertas diretamente no seu celular e não perca nenhuma entrada. Suas operações na palma da mão, 24h por dia.'}
          </p>
          
          <button
            onClick={handleEnableNotifications}
            disabled={notificationsEnabled || isLoading}
            className={`w-full py-2.5 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              notificationsEnabled 
                ? 'bg-[#33b864]/20 text-[#33b864] cursor-default' 
                : 'bg-[#33b864] hover:bg-[#2da356] text-black'
            }`}
            data-testid="button-enable-notifications"
          >
            {isLoading ? (
              <>Ativando...</>
            ) : notificationsEnabled ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Ativado
              </>
            ) : (
              <>
                <Smartphone className="w-4 h-4" />
                Ativar Notificações
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardCRM() {

  return (
    <Layout>
      {/* Trial Banner (only shows for trial users) */}
      <TrialBanner />
      
      {/* Header */}
      <div className="mb-6 mt-4">
        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
          Central de Operações
        </h1>
        <p className="text-sm text-muted-foreground">Gestão de Performance em Unidades</p>
      </div>

      {/* Compact Live HUD - Split View (Círculo + Cards) */}
      <CompactLiveHud />

      {/* AI Scanner - Full Width */}
      <div className="flex-1 mt-6">
        <AIScanner />
      </div>

      {/* Mobile Notification Card */}
      <MobileNotificationCard />
    </Layout>
  );
}
