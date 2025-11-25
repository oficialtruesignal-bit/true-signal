import { Layout } from "@/components/layout";
import { useCRMDashboardData } from "@/hooks/use-crm-dashboard-data";
import { CompactLiveHud } from "@/components/compact-live-hud";
import { AIScanner } from "@/components/ai-scanner";
import { TrendingUp, Target, Percent, Flame, Activity } from "lucide-react";

export default function DashboardCRM() {
  const stats = useCRMDashboardData();

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
          Central de Operações
        </h1>
        <p className="text-sm text-muted-foreground">Gestão de Performance em Unidades</p>
      </div>

      {/* Compact Live HUD - 3 círculos horizontais */}
      <div className="mb-6 flex justify-center">
        <CompactLiveHud />
      </div>

      {/* Main Dashboard - Full Width */}
      <div className="flex flex-col gap-6 h-[calc(100vh-280px)]">
          {/* Performance HUD - 2 Metrics */}
          <div className="grid grid-cols-2 gap-3">
            {/* ROI */}
            <div className="bg-[#121212] border border-[#333] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="w-4 h-4 text-primary" strokeWidth={1.5} />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">ROI</span>
              </div>
              <p className="text-2xl font-bold font-mono text-primary">
                +{stats.roi.toFixed(1)}%
              </p>
            </div>

            {/* Streak */}
            <div className="bg-[#121212] border border-[#333] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-orange-500" strokeWidth={1.5} />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Sequência</span>
              </div>
              <p className="text-2xl font-bold font-mono text-white">
                {stats.currentStreak.wins}V / {stats.currentStreak.losses}D
              </p>
            </div>
          </div>

          {/* AI Scanner - Full Width */}
          <div className="flex-1">
            <AIScanner />
          </div>

          {/* System Status Bar */}
          <div className="bg-[#121212] border border-[#333] rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Activity className="w-3 h-3 text-primary animate-pulse" />
                <span className="text-[10px] text-muted-foreground font-mono">
                  Varredura de Mercado... {stats.systemStatus.gamesAnalyzed.toLocaleString()} jogos analisados
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-[10px] text-muted-foreground">
                Sincronizado há {Math.floor((Date.now() - stats.systemStatus.lastSync.getTime()) / 1000)}s
              </span>
            </div>
          </div>
        </div>
    </Layout>
  );
}
