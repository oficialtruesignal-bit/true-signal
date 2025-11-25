import { Target, Signal, Trophy, Cpu } from "lucide-react";
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from "react";

// Generate 30 days of mock data with realistic growth pattern
const generateMockData = () => {
  const data = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 29);
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Assertivity grows from 88% to 95% with small variations
    const baseAssertivity = 88 + (i * 0.25);
    const assertivity = Math.min(95, baseAssertivity + (Math.random() * 2 - 1));
    
    // Volume varies between 15-45 signals per day
    const volume = Math.floor(20 + Math.random() * 25);
    
    data.push({
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      assertivity: Math.round(assertivity * 10) / 10,
      volume,
    });
  }
  
  return data;
};

const mockData = generateMockData();

// Custom Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    // Find correct values by dataKey to avoid confusion
    const assertivityData = payload.find((p: any) => p.dataKey === 'assertivity');
    const volumeData = payload.find((p: any) => p.dataKey === 'volume');
    
    return (
      <div className="bg-[#0a0a0a] border border-primary/30 rounded-lg p-3 shadow-[0_0_20px_rgba(51,184,100,0.3)]">
        <p className="text-xs text-muted-foreground mb-1">{payload[0].payload.date}</p>
        <p className="text-sm font-bold text-primary">
          Assertividade: {assertivityData?.value}%
        </p>
        <p className="text-xs text-muted-foreground">
          Sinais: {volumeData?.value}
        </p>
      </div>
    );
  }
  return null;
};

export function HomeDashboardPreview() {
  const [terminalMessages, setTerminalMessages] = useState<string[]>([
    '[AI_CORE]: System initialized...',
    '[SCANNER]: Analyzing 842 live matches...',
  ]);

  // Simulate AI terminal logs
  useEffect(() => {
    const messages = [
      '[PATTERN_MATCH]: High confidence in Premier League',
      '[VALIDATOR]: Cross-checking historical data...',
      '[AI_CORE]: Pattern found in BRA_A - Validating...',
      '[VALIDATOR]: Confidence level: 94.2% - OK',
      '[SIGNAL]: New opportunity detected',
      '[SCANNER]: Processing Bundesliga matches...',
      '[PATTERN_MATCH]: Trend identified in La Liga',
      '[AI_CORE]: Statistical model updated',
    ];
    
    let currentIndex = 2;
    const interval = setInterval(() => {
      setTerminalMessages((prev) => {
        const newMessages = [...prev, messages[currentIndex % messages.length]];
        currentIndex++;
        return newMessages.slice(-6); // Keep last 6 messages
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-24 overflow-hidden bg-[#0a0a0a]">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(51,184,100,0.05)_0%,_transparent_70%)]" />
      
      <div className="container relative z-10 mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            O Painel de Controle da Sua{" "}
            <span className="text-gradient">Liberdade Financeira</span>
          </h2>
          <p className="text-lg text-gray-400 dark:text-muted-foreground max-w-3xl mx-auto">
            Interface profissional projetada para clareza, velocidade e execução precisa.
            <br />
            Veja o que te espera do outro lado.
          </p>
        </div>

        {/* Dashboard Mockup with 3D Perspective */}
        <div 
          className="relative max-w-7xl mx-auto"
          style={{ 
            perspective: '2000px',
          }}
        >
          <div 
            className="relative bg-[#121212]/80 backdrop-blur-md border border-primary/30 rounded-2xl p-6 md:p-8 shadow-[0_0_60px_rgba(51,184,100,0.15)]"
            style={{
              transform: 'rotateX(2deg)',
              transformStyle: 'preserve-3d',
            }}
            data-testid="dashboard-mockup"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl pointer-events-none" />
            
            {/* Top KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="glass flex items-center gap-3 p-4 rounded-xl border border-primary/20">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Assertividade Global</p>
                  <p className="text-xl font-bold text-white font-mono">94.8%</p>
                </div>
              </div>

              <div className="glass flex items-center gap-3 p-4 rounded-xl border border-primary/20">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Signal className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Sinais Hoje</p>
                  <p className="text-xl font-bold text-white font-mono">14</p>
                </div>
              </div>

              <div className="glass flex items-center gap-3 p-4 rounded-xl border border-primary/20">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Sequência</p>
                  <p className="text-xl font-bold text-orange-500 font-mono">12 Greens 🔥</p>
                </div>
              </div>
            </div>

            {/* Main Content: Chart + AI Terminal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Complex Chart - Takes 2 columns */}
              <div className="lg:col-span-2 glass p-6 rounded-xl border border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-display font-bold text-white">
                      Análise Técnica • 30 Dias
                    </h3>
                    <p className="text-xs text-muted-foreground">Performance & Volume</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="text-[10px] text-muted-foreground">Assertividade</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-primary/20" />
                      <span className="text-[10px] text-muted-foreground">Volume</span>
                    </div>
                  </div>
                </div>
                
                <div className="h-[300px]" data-testid="complex-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={mockData}>
                      <defs>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="rgba(51, 184, 100, 0.05)" 
                      />
                      <XAxis 
                        dataKey="date" 
                        stroke="rgba(148, 163, 184, 0.5)" 
                        style={{ fontSize: '10px' }}
                        tick={{ fill: 'rgba(148, 163, 184, 0.7)' }}
                      />
                      <YAxis 
                        yAxisId="left"
                        stroke="rgba(51, 184, 100, 0.5)" 
                        style={{ fontSize: '10px' }}
                        tick={{ fill: 'rgba(51, 184, 100, 0.7)' }}
                        domain={[85, 100]}
                        label={{ value: 'Assertividade (%)', angle: -90, position: 'insideLeft', style: { fontSize: '10px', fill: 'rgba(51, 184, 100, 0.7)' } }}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        stroke="rgba(148, 163, 184, 0.5)" 
                        style={{ fontSize: '10px' }}
                        tick={{ fill: 'rgba(148, 163, 184, 0.7)' }}
                        domain={[0, 50]}
                        label={{ value: 'Volume', angle: 90, position: 'insideRight', style: { fontSize: '10px', fill: 'rgba(148, 163, 184, 0.7)' } }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        yAxisId="right"
                        dataKey="volume" 
                        fill="rgba(51, 184, 100, 0.2)" 
                        radius={[4, 4, 0, 0]}
                      />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="assertivity" 
                        stroke="#33b864" 
                        strokeWidth={3}
                        dot={false}
                        filter="url(#glow)"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Terminal - Right column */}
              <div className="glass p-6 rounded-xl border border-primary/20 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-display font-bold text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-primary animate-pulse" />
                    AI Terminal
                  </h3>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                </div>
                
                <div 
                  className="font-mono text-[10px] space-y-2 h-[280px] overflow-hidden"
                  data-testid="ai-terminal"
                >
                  {terminalMessages.map((msg, index) => (
                    <div 
                      key={index}
                      className="text-primary/80 animate-in fade-in slide-in-from-bottom-2 duration-300"
                      style={{ 
                        opacity: 1 - (terminalMessages.length - index - 1) * 0.15,
                      }}
                    >
                      {msg}
                    </div>
                  ))}
                  <div className="text-primary/60 animate-pulse">▊</div>
                </div>

                <div className="mt-4 pt-4 border-t border-primary/10">
                  <p className="text-[9px] text-muted-foreground flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Neural Network Active • Processing
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom badge */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-full">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-xs text-primary font-medium">
                  Sistema em operação 24/7 • Dados em tempo real
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground text-sm">
            Tecnologia de ponta ao alcance dos seus dedos.
          </p>
        </div>
      </div>
    </section>
  );
}
