import { Layout } from "@/components/layout";
import { useCRMDashboardData } from "@/hooks/use-crm-dashboard-data";
import { useBankroll } from "@/hooks/use-bankroll";
import { CompactLiveHud } from "@/components/compact-live-hud";
import { AIScanner } from "@/components/ai-scanner";
import { NeonCard } from "@/components/dashboard/neon-card";
import { Scale, Flame, Activity, Users } from "lucide-react";
import { useState, useEffect } from "react";

export default function DashboardCRM() {
  const stats = useCRMDashboardData();
  const bankroll = useBankroll();
  const [investors, setInvestors] = useState(624);

  useEffect(() => {
    const interval = setInterval(() => {
      const variation = Math.floor(Math.random() * 11) - 5;
      setInvestors(prev => Math.max(600, Math.min(650, prev + variation)));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
          Central de Operações
        </h1>
        <p className="text-sm text-muted-foreground">Gestão de Performance em Unidades</p>
      </div>

      {/* Compact Live HUD - Split View (Círculo + Cards) */}
      <CompactLiveHud />

      {/* Main Dashboard - Full Width */}
      <div className="flex flex-col gap-6 h-[calc(100vh-400px)]">
          {/* Performance HUD - 4 Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <NeonCard intensity="low" className="h-28 flex-shrink-0">
              <div className="flex items-center gap-2 mb-1 z-10 relative">
                <Scale className="w-4 h-4 text-orange-500" strokeWidth={1.5} />
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Odd Média</span>
              </div>
              <span className="text-2xl font-sora font-bold text-orange-500 z-10 relative drop-shadow-sm">
                {bankroll.averageOdd > 0 ? bankroll.averageOdd.toFixed(2) : '--'}
              </span>
            </NeonCard>

            <NeonCard intensity="low" className="h-28 flex-shrink-0">
              <div className="flex items-center gap-2 mb-1 z-10 relative">
                <Flame className="w-4 h-4 text-orange-500" strokeWidth={1.5} />
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Sequência</span>
              </div>
              <span className="text-2xl font-sora font-bold text-white z-10 relative drop-shadow-sm">
                {stats.currentStreak.wins}V - {stats.currentStreak.losses}D
              </span>
            </NeonCard>

            <NeonCard intensity="low" className="h-28 flex-shrink-0">
              <div className="flex items-center gap-2 mb-1 z-10 relative">
                <Activity className="w-4 h-4 text-[#33b864]" strokeWidth={1.5} />
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Sinais (Mês)</span>
              </div>
              <span className="text-2xl font-sora font-bold text-white z-10 relative drop-shadow-sm">{bankroll.monthTips}</span>
            </NeonCard>

            <NeonCard intensity="high" className="h-28 flex-shrink-0">
              <div className="flex items-center gap-2 mb-1 z-10 relative">
                <Users className="w-4 h-4 text-[#33b864]" strokeWidth={1.5} />
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Investidores</span>
              </div>
              <span className="text-2xl font-sora font-bold text-[#33b864] z-10 relative drop-shadow-sm">{investors}</span>
            </NeonCard>
          </div>

          {/* AI Scanner - Full Width */}
          <div className="flex-1">
            <AIScanner />
          </div>
        </div>
    </Layout>
  );
}
