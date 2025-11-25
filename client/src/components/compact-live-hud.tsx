import { TrendingUp, Zap } from 'lucide-react';
import { useCRMDashboardData } from '@/hooks/use-crm-dashboard-data';
import { useBankroll } from '@/hooks/use-bankroll';
import { NeonCard } from './dashboard/neon-card';

export function CompactLiveHud() {
  const stats = useCRMDashboardData();
  const bankroll = useBankroll();
  const assertivityValue = stats.assertivity;

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
              {bankroll.totalProfit > 0 ? '+' : ''}{bankroll.totalProfitUnits.toFixed(1)}u
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
              R$ {bankroll.totalProfit.toFixed(2)}
            </span>
          </NeonCard>

        </div>

      </div>

    </div>
  );
}
