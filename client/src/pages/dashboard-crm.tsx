import { Layout } from "@/components/layout";
import { useCRMDashboardData } from "@/hooks/use-crm-dashboard-data";
import { CompactLiveHud } from "@/components/compact-live-hud";
import { AIScanner } from "@/components/ai-scanner";
import { TrendingUp, Target, Percent, Flame, Activity, Users, Ticket } from "lucide-react";
import { useState, useEffect } from "react";

export default function DashboardCRM() {
  const stats = useCRMDashboardData();
  const [usersOnline, setUsersOnline] = useState(620);
  const [totalSignals] = useState(151);

  useEffect(() => {
    const interval = setInterval(() => {
      const variation = Math.floor(Math.random() * 21) - 10;
      setUsersOnline(prev => Math.max(340, Math.min(900, prev + variation)));
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

      {/* Compact Live HUD - Medidor de Assertividade */}
      <div className="mb-2 flex justify-center">
        <CompactLiveHud />
      </div>

      {/* Main Dashboard - Full Width */}
      <div className="flex flex-col gap-6 h-[calc(100vh-280px)]">
          {/* Performance HUD - 4 Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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

            {/* Investidores Online */}
            <div className="bg-[#121212] border border-[#333] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-primary" strokeWidth={1.5} />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Investidores Online</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                <p className="text-2xl font-bold font-mono text-white">
                  {usersOnline}
                </p>
              </div>
            </div>

            {/* Sinais Enviados */}
            <div className="bg-[#121212] border border-[#333] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Ticket className="w-4 h-4 text-primary" strokeWidth={1.5} />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Sinais Enviados</span>
              </div>
              <p className="text-2xl font-bold font-mono text-white">
                {totalSignals}
              </p>
            </div>
          </div>

          {/* AI Scanner - Full Width */}
          <div className="flex-1">
            <AIScanner />
          </div>
        </div>
    </Layout>
  );
}
