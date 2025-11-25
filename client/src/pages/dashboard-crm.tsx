import { Layout } from "@/components/layout";
import { useCRMDashboardData } from "@/hooks/use-crm-dashboard-data";
import { CompactLiveHud } from "@/components/compact-live-hud";
import { AIScanner } from "@/components/ai-scanner";
import { BetCard } from "@/components/bet-card";
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

      {/* Main CRM Layout: 40% Sidebar + 60% Main Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-280px)]">
        {/* LEFT SIDEBAR: Premium Bet Cards Feed (40%) */}
        <div className="lg:col-span-5 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">
              Sinais Premium
            </h2>
            <span className="text-xs text-muted-foreground">
              {stats.activeSignals.length} Ativos
            </span>
          </div>

          {/* BetCard List - Scrollable */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {stats.recentSignals.slice(0, 5).map((signal) => {
              // Convert CRM signal to BetCard-compatible format
              const [homeTeam, awayTeam] = signal.matchName.split(' vs ');
              const betCardSignal = {
                id: signal.id,
                league: signal.league,
                homeTeam: homeTeam || signal.matchName,
                awayTeam: awayTeam || '',
                market: signal.market,
                odd: signal.odd,
                status: signal.status === 'processing' ? 'pending' as const : signal.status,
                timestamp: signal.timestamp.toISOString(),
                betLink: 'https://bet365.com'
              };
              
              return <BetCard key={signal.id} signal={betCardSignal} />;
            })}
          </div>
        </div>

        {/* RIGHT AREA: Main Dashboard (60%) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Performance HUD - 4 Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Assertivity */}
            <div className="bg-[#121212] border border-[#333] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-primary" strokeWidth={1.5} />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Assertividade</span>
              </div>
              <p className="text-2xl font-bold font-mono text-primary">
                {stats.assertivity.toFixed(1)}%
              </p>
            </div>

            {/* Units Accumulated */}
            <div className="bg-[#121212] border border-[#333] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" strokeWidth={1.5} />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Unidades</span>
              </div>
              <p className="text-2xl font-bold font-mono text-white">
                +{(stats.totalUnits - 100).toFixed(1)}u
              </p>
            </div>

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
      </div>
    </Layout>
  );
}
