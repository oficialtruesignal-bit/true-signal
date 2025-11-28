import { Layout } from "@/components/layout";
import { CompactLiveHud } from "@/components/compact-live-hud";
import { AIScanner } from "@/components/ai-scanner";
import { TrialBanner } from "@/components/paywall/trial-banner";
import { Bell, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

function MobileNotificationCard() {
  const [isVisible, setIsVisible] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const handleEnableNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
      }
    }
  };

  if (!isVisible || notificationsEnabled) return null;

  return (
    <div className="md:hidden mt-4 bg-gradient-to-r from-[#0a1628] to-[#0d1f3c] border border-[#33b864]/30 rounded-xl p-4 shadow-lg" data-testid="card-mobile-notifications">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[#33b864]/20 flex items-center justify-center flex-shrink-0">
          <Bell className="w-5 h-5 text-[#33b864]" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold text-sm mb-1">
            Ative as Notificações
          </h3>
          <p className="text-gray-400 text-xs leading-relaxed mb-3">
            Receba alertas em tempo real e não perca nenhuma entrada. Suas operações na palma da mão.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleEnableNotifications}
              className="flex-1 bg-[#33b864] hover:bg-[#2da356] text-black font-bold text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              data-testid="button-enable-notifications"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Ativar Agora
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="px-3 py-2 text-gray-400 hover:text-white text-xs transition-colors"
              data-testid="button-dismiss-notifications"
            >
              Depois
            </button>
          </div>
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
      <div className="mb-6">
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
