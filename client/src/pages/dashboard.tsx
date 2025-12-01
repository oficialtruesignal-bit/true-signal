import { Layout } from "@/components/layout";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { TrendingUp, Target, Zap, Flame, Activity, Bot, Sparkles, ArrowRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LiveMetricsBar } from "@/components/live-metrics-bar";
import { InstallAppBanner } from "@/components/install-app-banner";
import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";

export default function Dashboard() {
  const { t } = useLanguage();
  const stats = useDashboardData();
  const [scannerMessages, setScannerMessages] = useState<string[]>([]);
  const [showFullDashboard, setShowFullDashboard] = useState(false);
  
  // AI Scanner simulation
  useEffect(() => {
    const messages = [
      '> Initializing Market Scanner...',
      '> Scanning Premier League matches...',
      '> Analyzing La Liga patterns...',
      '> Processing Serie A data...',
      '> Bundesliga: High confidence detected',
      '> Champions League: 3 opportunities found',
      '> Brasileirão: Value bet identified',
      '> Pattern match: Over 0.5 HT (88% confidence)',
      '> Flamengo vs Corinthians: BTTS analyzed',
      '> Manchester City: Home Win probability 92%',
      '> Real Madrid: Goal pattern detected',
      '> Bayern Munich: Over 2.5 FT signal',
      '> Arsenal vs Chelsea: Draw No Bet opportunity',
      '> Barcelona: Asian Handicap -0.5 green light',
      '> PSG: High-value market discovered',
      '> Liverpool: Attacking pattern confirmed',
    ];
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      setScannerMessages((prev) => {
        const newMessages = [...prev, messages[currentIndex]];
        currentIndex = (currentIndex + 1) % messages.length;
        return newMessages.slice(-8); // Keep last 8 messages
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          {t.dashboard.title}
        </h1>
        <p className="text-muted-foreground">{t.dashboard.subtitle}</p>
      </div>

      {/* Dashboard Preview - Clean & Professional */}
      {!showFullDashboard ? (
        <div className="space-y-6">
          {/* Live Metrics Bar */}
          <LiveMetricsBar />
          
          {/* Performance Chart Preview - Professional */}
          <div className="bg-card border border-primary/10 rounded-2xl p-6 shadow-[0_0_40px_rgba(51,184,100,0.1)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  {t.dashboard.performanceChart}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{t.dashboard.performanceSubtitle}</p>
              </div>
              <span className="text-[10px] font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-full border border-primary/20">
                {t.dashboard.realtime}
              </span>
            </div>
            
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.profitHistory}>
                  <defs>
                    <linearGradient id="previewGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#33b864" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#33b864" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 184, 100, 0.05)" />
                  <XAxis 
                    dataKey="time" 
                    stroke="rgba(148, 163, 184, 0.3)" 
                    style={{ fontSize: '9px' }}
                    tick={{ fill: 'rgba(148, 163, 184, 0.5)' }}
                  />
                  <YAxis 
                    stroke="rgba(148, 163, 184, 0.3)" 
                    style={{ fontSize: '9px' }}
                    tick={{ fill: 'rgba(148, 163, 184, 0.5)' }}
                    tickFormatter={(value) => `${value} pts`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#33b864" 
                    strokeWidth={3}
                    fill="url(#previewGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Install App Banner - Preview */}
          <div className="bg-gradient-to-r from-[#121212] to-[#0a0a0a] border border-[#33b864]/20 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-white">🚀 TESTE: Banner de instalação aqui!</h3>
            <p className="text-sm text-gray-300">Se você vê isso, o banner está funcionando!</p>
          </div>
          <InstallAppBanner />

          {/* CTA to See Full Dashboard - Enhanced */}
          <div className="text-center pt-4">
            <button
              onClick={() => setShowFullDashboard(true)}
              className="inline-flex items-center gap-3 px-10 py-5 bg-primary hover:bg-primary/90 text-black font-bold text-lg rounded-xl transition-all duration-300 shadow-[0_0_40px_rgba(51,184,100,0.4)] hover:shadow-[0_0_60px_rgba(51,184,100,0.6)] hover:scale-105"
              data-testid="button-view-full-dashboard"
            >
              <Sparkles className="w-5 h-5" />
              {t.dashboard.viewFull}
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-sm text-muted-foreground mt-4">
              {t.dashboard.viewFullDesc}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Bento Grid Layout - Full Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* KPI Cards - Top (3 cards now - removed Banca) */}
        <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Assertividade */}
          <div 
            className="bg-card border border-primary/10 rounded-2xl p-6 shadow-[0_0_30px_rgba(51,184,100,0.08)] hover:shadow-[0_0_40px_rgba(51,184,100,0.15)] transition-all duration-300"
            data-testid="kpi-winrate"
          >
            <div className="flex items-center justify-between mb-3">
              <Target className="w-5 h-5 text-primary" />
              <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded border border-emerald-500/20">
                ELITE
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Taxa de Acerto</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white font-mono">
                {stats.winRate.toFixed(1)}%
              </p>
              <p className="text-[10px] text-muted-foreground">
                Precisão Institucional
              </p>
            </div>
          </div>

          {/* Tips Enviadas */}
          <div 
            className="bg-card border border-primary/10 rounded-2xl p-6 shadow-[0_0_30px_rgba(51,184,100,0.08)] hover:shadow-[0_0_40px_rgba(51,184,100,0.15)] transition-all duration-300"
            data-testid="kpi-total"
          >
            <div className="flex items-center justify-between mb-3">
              <Zap className="w-5 h-5 text-primary" />
              <Activity className="w-4 h-4 text-primary animate-pulse" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Sinais Enviados</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white font-mono">
                {stats.totalTips.toLocaleString('pt-BR')}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Volume Acumulado
              </p>
            </div>
          </div>

          {/* Sequência Atual */}
          <div 
            className="bg-card border border-primary/10 rounded-2xl p-6 shadow-[0_0_30px_rgba(51,184,100,0.08)] hover:shadow-[0_0_40px_rgba(51,184,100,0.15)] transition-all duration-300"
            data-testid="kpi-streak"
          >
            <div className="flex items-center justify-between mb-3">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-[10px] font-bold bg-orange-500/10 text-orange-500 px-2 py-1 rounded border border-orange-500/20 animate-pulse">
                HOT
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Sequência Verde</p>
              <p className="text-3xl font-bold text-orange-500 font-mono flex items-center gap-2">
                {stats.currentStreak} 
                <Flame className="w-6 h-6 animate-pulse" />
              </p>
              <p className="text-[10px] text-muted-foreground">
                Greens Consecutivos
              </p>
            </div>
          </div>
        </div>

        {/* Performance Chart - Center */}
        <div className="lg:col-span-8 bg-card border border-primary/10 rounded-2xl p-6 shadow-[0_0_30px_rgba(51,184,100,0.08)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Evolução de Performance
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Últimas 24 horas • Atualização em tempo real</p>
            </div>
          </div>
          
          <div className="h-[300px]" data-testid="profit-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.profitHistory}>
                <defs>
                  <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#33b864" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#33b864" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis 
                  dataKey="time" 
                  stroke="rgba(148, 163, 184, 0.5)" 
                  style={{ fontSize: '10px' }}
                  tick={{ fill: 'rgba(148, 163, 184, 0.7)' }}
                />
                <YAxis 
                  stroke="rgba(148, 163, 184, 0.5)" 
                  style={{ fontSize: '10px' }}
                  tick={{ fill: 'rgba(148, 163, 184, 0.7)' }}
                  tickFormatter={(value) => `${value} pts`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#121212', 
                    border: '1px solid rgba(51, 184, 100, 0.2)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: number) => [`${value.toFixed(0)} pontos`, 'Performance']}
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#33b864" 
                  strokeWidth={2}
                  fill="url(#profitGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Scanner - Right Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#1a1a1a] border-2 border-white/10 rounded-2xl p-6 shadow-xl shadow-black/60 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary animate-pulse" />
                AI Scanner
              </h2>
              <span className="text-[9px] font-bold bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20 animate-pulse">
                SCANNING
              </span>
            </div>
            
            <div 
              className="font-mono text-[11px] space-y-2 h-[300px] overflow-hidden"
              data-testid="ai-scanner"
            >
              {scannerMessages.map((msg, index) => (
                <div 
                  key={index} 
                  className="text-primary/70 animate-in fade-in slide-in-from-bottom-2 duration-300"
                  style={{ 
                    opacity: 1 - (scannerMessages.length - index - 1) * 0.15,
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  {msg}
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-primary/10">
              <p className="text-[10px] text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                Sistema Ativo • Processando mercados globais
              </p>
            </div>
          </div>

          {/* Install App Banner */}
          <InstallAppBanner />
        </div>

        {/* Recent Activity - Bottom */}
        <div className="lg:col-span-12 bg-card border border-primary/10 rounded-2xl p-6 shadow-[0_0_30px_rgba(51,184,100,0.08)]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Histórico de Sinais
            </h2>
            <p className="text-xs text-muted-foreground">
              {stats.recentTips.length} sinais recentes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" data-testid="activity-list">
            {stats.recentTips.slice(0, 12).map((tip) => (
              <div 
                key={tip.id}
                className="flex items-center justify-between p-4 bg-background/50 dark:bg-background/30 rounded-xl border border-gray-200 dark:border-white/5 hover:border-primary/20 transition-all duration-200"
                data-testid={`tip-${tip.id}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{tip.matchName}</p>
                  <p className="text-xs text-primary truncate">{tip.league}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{tip.market} {tip.odd.toFixed(2)}</p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  {tip.status === 'green' && (
                    <span className="text-xs font-bold bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                      GREEN
                    </span>
                  )}
                  {tip.status === 'red' && (
                    <span className="text-xs font-bold bg-red-500/10 text-red-500 px-3 py-1.5 rounded-lg border border-red-500/20">
                      RED
                    </span>
                  )}
                  {tip.status === 'pending' && (
                    <span className="text-xs font-bold bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-lg border border-amber-500/20 animate-pulse">
                      LIVE
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
        </>
      )}
    </Layout>
  );
}
