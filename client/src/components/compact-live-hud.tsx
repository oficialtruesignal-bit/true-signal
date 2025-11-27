import { Scale, Users, TrendingDown, TrendingUp } from 'lucide-react';
import { useCRMDashboardData } from '@/hooks/use-crm-dashboard-data';
import { useBankroll } from '@/hooks/use-bankroll';
import { ProfitTrendChart } from './dashboard/profit-trend-chart';
import { useState, useEffect } from 'react';

export function CompactLiveHud() {
  const stats = useCRMDashboardData();
  const bankroll = useBankroll();
  
  // Assertividade oscila entre 89% e 91% a cada 30 minutos
  const [assertivityValue, setAssertivityValue] = useState(() => {
    // Usar hora atual para determinar valor inicial consistente
    const now = new Date();
    const halfHourSlot = Math.floor(now.getTime() / (30 * 60 * 1000));
    const values = [89.0, 89.5, 90.0, 90.5, 91.0, 90.5, 90.0, 89.5];
    return values[halfHourSlot % values.length];
  });
  
  useEffect(() => {
    const updateAssertivity = () => {
      const now = new Date();
      const halfHourSlot = Math.floor(now.getTime() / (30 * 60 * 1000));
      const values = [89.0, 89.5, 90.0, 90.5, 91.0, 90.5, 90.0, 89.5];
      setAssertivityValue(values[halfHourSlot % values.length]);
    };
    
    // Calcular tempo até próxima meia hora
    const now = new Date();
    const msUntilNextHalfHour = (30 - (now.getMinutes() % 30)) * 60 * 1000 - now.getSeconds() * 1000;
    
    const initialTimeout = setTimeout(() => {
      updateAssertivity();
      // Depois, atualizar a cada 30 minutos
      const interval = setInterval(updateAssertivity, 30 * 60 * 1000);
      return () => clearInterval(interval);
    }, msUntilNextHalfHour);
    
    return () => clearTimeout(initialTimeout);
  }, []);
  
  // Simular investidores online (oscila entre 312-612)
  const [onlineUsers, setOnlineUsers] = useState(450);
  
  useEffect(() => {
    const oscillate = () => {
      setOnlineUsers(prev => {
        const variation = Math.floor(Math.random() * 40) - 15;
        const newValue = prev + variation;
        return Math.max(312, Math.min(612, newValue));
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
  
  // Calcular crescimento da banca em %
  const bankrollGrowth = bankroll.initialBankroll > 0 
    ? ((bankroll.currentBankroll - bankroll.initialBankroll) / bankroll.initialBankroll * 100)
    : 0;

  return (
    <div className="w-full mb-8 flex flex-col gap-6">

      {/* SEÇÃO 1: BLOCO SUPERIOR (Círculo + Gráfico) */}
      <div className="grid grid-cols-[40%_60%] gap-4 h-40 items-center">

        {/* ESQUERDA: GAUGE DE ASSERTIVIDADE */}
        <div className="relative flex items-center justify-center h-full w-full">
          <div className="relative w-36 h-36 flex items-center justify-center">
            
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Círculo de fundo */}
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#1a1a1a"
                strokeWidth="8"
                fill="none"
              />
              {/* Círculo de progresso */}
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#33b864"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${(assertivityValue / 100) * 2 * Math.PI * 42} ${2 * Math.PI * 42}`}
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <span className="text-[28px] font-black text-[#33b864] tracking-tight leading-none" style={{ fontFamily: 'Sora, sans-serif' }}>
                {assertivityValue.toFixed(1)}%
              </span>
              <span className="text-[10px] text-gray-400 mt-1">
                Novembro
              </span>
            </div>

          </div>
        </div>

        {/* DIREITA: GRÁFICO DE LUCRO */}
        <ProfitTrendChart growthPercentage={bankrollGrowth} />

      </div>

      {/* SEÇÃO 2: BLOCO INFERIOR (Grid 2x2 Limpo) */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* CARD A: ODD MÉDIA */}
        <div className="h-28 bg-[#121212] border border-[#33b864]/20 rounded-2xl p-4 hover:bg-[#161616] hover:border-[#33b864]/50 transition-all flex flex-col justify-center relative group shadow-lg shadow-black/50">
          <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-50 transition-opacity">
            <Scale className="w-8 h-8 text-orange-500" />
          </div>
          <div className="flex items-center gap-2 mb-2 z-10">
            <div className="w-1 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Odd Média</span>
          </div>
          <span className="text-3xl font-sora font-bold text-white z-10">{bankroll.averageOdd.toFixed(2)}</span>
        </div>

        {/* CARD B: USUÁRIOS ONLINE */}
        <div className="h-28 bg-[#121212] border border-[#33b864]/20 rounded-2xl p-4 hover:bg-[#161616] hover:border-[#33b864]/50 transition-all flex flex-col justify-center relative group shadow-lg shadow-black/50">
          <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-50 transition-opacity">
            <Users className="w-8 h-8 text-[#33b864]" />
          </div>
          <div className="flex items-center gap-2 mb-2 z-10">
            <span className="w-2 h-2 rounded-full bg-[#33b864] animate-pulse shadow-[0_0_8px_#33b864]"></span>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Usuários Online</span>
          </div>
          <span className="text-3xl font-sora font-bold text-white z-10">{onlineUsers.toLocaleString('pt-BR')}</span>
        </div>

        {/* CARD C: UNIDADES GANHAS */}
        <div className="h-28 bg-[#121212] border border-[#33b864]/20 rounded-2xl p-4 hover:bg-[#161616] hover:border-[#33b864]/50 transition-all flex flex-col justify-center relative group shadow-lg shadow-black/50">
          <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-50 transition-opacity">
            <TrendingUp className="w-8 h-8 text-[#33b864]" />
          </div>
          <div className="flex items-center gap-2 mb-2 z-10">
            <div className="w-1 h-3 bg-[#33b864] rounded-full"></div>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Ganhos</span>
          </div>
          <span className="text-3xl font-sora font-bold text-[#33b864] z-10">{bankroll.greenCount > 0 ? '+' : ''}{bankroll.totalProfitUnits > 0 ? bankroll.totalProfitUnits.toFixed(1) : '0.0'}u</span>
        </div>

        {/* CARD D: UNIDADES PERDIDAS */}
        <div className="h-28 bg-[#121212] border border-[#33b864]/20 rounded-2xl p-4 hover:bg-[#161616] hover:border-red-500/50 transition-all flex flex-col justify-center relative group shadow-lg shadow-black/50">
          <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-50 transition-opacity">
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
          <div className="flex items-center gap-2 mb-2 z-10">
            <div className="w-1 h-3 bg-red-500 rounded-full"></div>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Perdas</span>
          </div>
          <span className="text-3xl font-sora font-bold text-red-500 z-10">{bankroll.redCount > 0 ? bankroll.redCount : 0}</span>
        </div>

      </div>

    </div>
  );
}
