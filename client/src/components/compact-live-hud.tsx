import { TrendingUp, Zap, Scale, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useCRMDashboardData } from '@/hooks/use-crm-dashboard-data';
import { useBankroll } from '@/hooks/use-bankroll';
import { NeonCard } from './dashboard/neon-card';
import { useQuery } from '@tanstack/react-query';
import { tipsService } from '@/lib/tips-service';
import { useState, useEffect } from 'react';

export function CompactLiveHud() {
  const stats = useCRMDashboardData();
  const bankroll = useBankroll();
  const assertivityValue = stats.assertivity;
  
  // Fetch tips para cálculos financeiros
  const { data: tips = [] } = useQuery({
    queryKey: ['tips'],
    queryFn: tipsService.getAll,
  });
  
  // Simular investidores online (oscila entre 3400-3500)
  const [onlineUsers, setOnlineUsers] = useState(3420);
  
  useEffect(() => {
    const oscillate = () => {
      setOnlineUsers(prev => {
        const variation = Math.floor(Math.random() * 40) - 15;
        const newValue = prev + variation;
        return Math.max(3400, Math.min(3500, newValue));
      });
    };
    
    const getRandomInterval = () => Math.random() * 2000 + 3000;
    
    let timeoutId: number;
    const scheduleNext = () => {
      timeoutId = window.setTimeout(() => {
        oscillate();
        scheduleNext();
      }, getRandomInterval());
    };
    
    scheduleNext();
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  // Cálculos de métricas financeiras baseadas nos tips
  const unitsWon = tips.filter(t => t.status === 'green').reduce((acc, t) => acc + (t.odd - 1), 0);
  const unitsLost = tips.filter(t => t.status === 'red').length;
  const averageOdd = tips.length > 0 ? (tips.reduce((acc, t) => acc + t.odd, 0) / tips.length).toFixed(2) : "0.00";

  return (
    <div className="w-full mb-8">
      
      {/* BLOCO SUPERIOR: CÍRCULO + 2 CARDS */}
      <div className="grid grid-cols-[40%_60%] gap-4 h-60 items-stretch mb-4">

        {/* --- ESQUERDA: REATOR DE ASSERTIVIDADE (GAUGE) --- */}
        <div className="relative flex items-center justify-center h-full">
          <div className="relative w-40 h-40 flex items-center justify-center">
            
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {Array.from({ length: 60 }).map((_, i) => {
                const isActive = i < Math.round((assertivityValue / 100) * 60);
                const color = isActive ? "#33b864" : "#222222"; 
                
                return (
                  <line
                    key={i}
                    x1="50" y1="2" x2="50" y2="12"
                    stroke={color}
                    strokeWidth="2.5"
                    transform={`rotate(${i * (360 / 60)} 50 50)`}
                    style={{ transition: 'stroke 0.5s ease' }}
                  />
                );
              })}
            </svg>

            {/* Conteúdo Central (Texto) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <span className="text-3xl font-sora font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                {assertivityValue.toFixed(1)}%
              </span>
              <span className="text-[9px] font-mono text-[#33b864] tracking-[0.2em] mt-1 uppercase">
                Assertividade
              </span>
            </div>

          </div>
        </div>

        {/* --- DIREITA: 2 CARDS "MESTRES" (Altura Fixa h-28 cada) --- */}
        <div className="flex flex-col gap-4 h-full justify-between">
          
          {/* Card Banca Atual (Brilho Intenso) */}
          <NeonCard intensity="high" className="h-28 flex-shrink-0">
            <div className="flex items-center gap-2 mb-1 z-10 relative">
              <TrendingUp className="w-4 h-4 text-[#33b864]" />
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Banca Atual</span>
            </div>
            <span className={`text-3xl font-sora font-bold z-10 relative drop-shadow-sm ${
              bankroll.totalProfit > 0 ? 'text-[#33b864]' : bankroll.totalProfit < 0 ? 'text-red-500' : 'text-white'
            }`}>
              {((bankroll.currentBankroll / bankroll.initialBankroll) * 100).toFixed(1)}%
            </span>
          </NeonCard>

          {/* Card Lucro Total (Brilho Suave) */}
          <NeonCard intensity="low" className="h-28 flex-shrink-0">
            <div className="flex items-center gap-2 mb-1 z-10 relative">
              <Zap className="w-4 h-4 text-[#33b864]" />
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Lucro Total</span>
            </div>
            <span className={`text-3xl font-sora font-bold z-10 relative drop-shadow-sm ${
              bankroll.totalProfit > 0 ? 'text-[#33b864]' : bankroll.totalProfit < 0 ? 'text-red-500' : 'text-white'
            }`}>
              {bankroll.totalProfit > 0 ? '+' : ''}{((bankroll.totalProfit / bankroll.initialBankroll) * 100).toFixed(1)}%
            </span>
          </NeonCard>

        </div>

      </div>

      {/* --- BLOCO INFERIOR: 4 CARDS DE DETALHE (Grid 2x2) --- */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* CARD 1: ODD MÉDIA (Informativo) */}
        <div className="h-28 bg-[#121212] border border-white/5 rounded-2xl p-4 hover:bg-[#1a1a1a] transition-colors flex flex-col justify-center relative group">
          <div className="absolute inset-0 border border-[#33b864]/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          <div className="flex items-center gap-2 mb-2">
            <Scale className="w-3 h-3 text-orange-500" />
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">ODD MÉDIA</span>
          </div>
          <span className="text-2xl font-sora font-bold text-orange-500">@{averageOdd}</span>
        </div>

        {/* CARD 2: INVESTIDORES ONLINE (Prova Social) */}
        <div className="h-28 bg-[#121212] border border-white/5 rounded-2xl p-4 hover:bg-[#1a1a1a] transition-colors flex flex-col justify-center relative group">
          <div className="absolute inset-0 border border-[#33b864]/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-3 h-3 text-[#33b864]" />
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">ONLINE AGORA</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#33b864] animate-pulse"></span>
            <span className="text-2xl font-sora font-bold text-white">{onlineUsers.toLocaleString('pt-BR')}</span>
          </div>
        </div>

        {/* CARD 3: UNIDADES GANHAS (Positivo) */}
        <div className="h-28 bg-[#121212] border border-white/5 rounded-2xl p-4 hover:bg-[#1a1a1a] transition-colors flex flex-col justify-center relative group">
          <div className="absolute inset-0 border border-[#33b864]/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="w-3 h-3 text-[#33b864]" />
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">UNIDADES GANHAS</span>
          </div>
          <span className="text-2xl font-sora font-bold text-[#33b864]">+{unitsWon.toFixed(1)}u</span>
        </div>

        {/* CARD 4: UNIDADES PERDIDAS (Negativo) */}
        <div className="h-28 bg-[#121212] border border-white/5 rounded-2xl p-4 hover:bg-[#1a1a1a] transition-colors flex flex-col justify-center relative group">
          <div className="absolute inset-0 border border-red-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownRight className="w-3 h-3 text-red-500" />
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">UNIDADES PERDIDAS</span>
          </div>
          <span className="text-2xl font-sora font-bold text-red-500">-{unitsLost.toFixed(1)}u</span>
        </div>

      </div>

    </div>
  );
}
