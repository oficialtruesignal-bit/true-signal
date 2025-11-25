import { Layout } from "@/components/layout";
import { useCRMDashboardData } from "@/hooks/use-crm-dashboard-data";
import { CompactLiveHud } from "@/components/compact-live-hud";
import { ActivityHeatmap } from "@/components/activity-heatmap";
import { AIScanner } from "@/components/ai-scanner";
import { TrendingUp, Target, Percent, Flame, Copy, Clock, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

      {/* Compact Live HUD */}
      <div className="mb-6">
        <CompactLiveHud />
      </div>

      {/* Main CRM Layout: 30% Sidebar + 70% Main Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-280px)]">
        {/* LEFT SIDEBAR: Signal Feed (30%) */}
        <div className="lg:col-span-4 bg-[#121212] border border-[#333] rounded-lg p-4 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">
              Feed de Sinais Ao Vivo
            </h2>
            <span className="text-xs text-muted-foreground">
              {stats.activeSignals.length} Ativos
            </span>
          </div>

          {/* Signal List - Scrollable */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {stats.recentSignals.map((signal) => (
              <div
                key={signal.id}
                className="bg-[#0a0a0a] border border-[#222] rounded p-3 hover:border-primary/30 transition-colors cursor-pointer"
                data-testid={`signal-${signal.id}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-bold text-muted-foreground bg-[#1a1a1a] px-1.5 py-0.5 rounded">
                        {signal.leagueShort}
                      </span>
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[9px] text-muted-foreground">{signal.time}</span>
                    </div>
                    <p className="text-xs font-semibold text-white truncate">
                      {signal.matchName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-primary">{signal.market}</span>
                      <span className="text-[10px] text-muted-foreground">@{signal.odd.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    {signal.status === 'pending' && (
                      <span className="text-[9px] font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20">
                        PENDENTE
                      </span>
                    )}
                    {signal.status === 'processing' && (
                      <span className="text-[9px] font-bold bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded border border-blue-500/20 animate-pulse">
                        AO VIVO
                      </span>
                    )}
                    {signal.status === 'green' && (
                      <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/20">
                        VERDE
                      </span>
                    )}
                    {signal.status === 'red' && (
                      <span className="text-[9px] font-bold bg-red-500/10 text-red-500 px-2 py-0.5 rounded border border-red-500/20">
                        VERMELHO
                      </span>
                    )}
                    <button className="p-1 hover:bg-[#1a1a1a] rounded transition-colors">
                      <Copy className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT AREA: Main Dashboard (70%) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
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

          {/* Data Intelligence: Chart + AI Scanner + Heatmap */}
          <div className="grid lg:grid-cols-3 gap-4 flex-1">
            {/* Units Evolution Chart */}
            <div className="bg-[#121212] border border-[#333] rounded-lg p-4">
              <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wide">
                Gráfico de Consistência
              </h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.unitsHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#555"
                      style={{ fontSize: '9px' }}
                      tick={{ fill: '#666' }}
                    />
                    <YAxis 
                      stroke="#555"
                      style={{ fontSize: '9px' }}
                      tick={{ fill: '#666' }}
                      tickFormatter={(value) => `${value}u`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#0a0a0a',
                        border: '1px solid #333',
                        borderRadius: '4px',
                        fontSize: '10px',
                      }}
                      formatter={(value: number) => [`${value.toFixed(1)}u`, 'Unidades']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="units" 
                      stroke="#33b864" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Scanner Matrix */}
            <div>
              <AIScanner />
            </div>

            {/* Activity Heatmap */}
            <div className="bg-[#121212] border border-[#333] rounded-lg p-4">
              <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wide">
                Calendário de Atividade
              </h3>
              <ActivityHeatmap data={stats.activityDays} />
            </div>
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
