import { Layout } from "@/components/layout";
import { CompactLiveHud } from "@/components/compact-live-hud";
import { AIScanner } from "@/components/ai-scanner";
import { TrialBanner } from "@/components/paywall/trial-banner";
import { Bell } from "lucide-react";
import { useState, useEffect } from "react";

function MobileNotificationCard() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const handleToggleNotifications = async () => {
    if ('Notification' in window) {
      if (!notificationsEnabled) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotificationsEnabled(true);
        }
      }
    }
  };

  return (
    <div className="md:hidden mt-4 bg-gradient-to-r from-[#0a1628] to-[#0d1f3c] border border-[#33b864]/30 rounded-xl p-4 shadow-lg" data-testid="card-mobile-notifications">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full ${notificationsEnabled ? 'bg-[#33b864]/30' : 'bg-[#33b864]/20'} flex items-center justify-center flex-shrink-0`}>
          <Bell className={`w-5 h-5 ${notificationsEnabled ? 'text-[#33b864]' : 'text-[#33b864]'}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold text-sm">
            {notificationsEnabled ? 'Notificações Ativas' : 'Ative as Notificações'}
          </h3>
          <p className="text-gray-400 text-xs">
            {notificationsEnabled ? 'Você receberá alertas em tempo real' : 'Não perca nenhuma entrada'}
          </p>
        </div>
        <button
          onClick={handleToggleNotifications}
          className={`w-14 h-7 rounded-full relative transition-colors ${notificationsEnabled ? 'bg-[#33b864]' : 'bg-gray-600'}`}
          data-testid="button-toggle-notifications"
        >
          <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all ${notificationsEnabled ? 'right-1' : 'left-1'}`} />
        </button>
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
