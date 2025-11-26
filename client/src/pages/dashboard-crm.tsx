import { Layout } from "@/components/layout";
import { CompactLiveHud } from "@/components/compact-live-hud";
import { AIScanner } from "@/components/ai-scanner";
import { TrialBanner } from "@/components/paywall/trial-banner";

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
    </Layout>
  );
}
