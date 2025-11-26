import { Scale, Users, TrendingDown, TrendingUp } from 'lucide-react';
import { useCRMDashboardData } from '@/hooks/use-crm-dashboard-data';
import { ProfitTrendChart } from './dashboard/profit-trend-chart';
import { useQuery } from '@tanstack/react-query';
import { tipsService } from '@/lib/tips-service';
import { useState, useEffect } from 'react';

export function CompactLiveHud() {
  const stats = useCRMDashboardData();
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
      
      {/* BLOCO SUPERIOR: CÍRCULO + GRÁFICO (Altura Reduzida para h-48) */}
      <div className="grid grid-cols-[40%_60%] gap-4 h-48 items-center mb-4">

        {/* --- ESQUERDA: CÍRCULO FLUTUANTE (Sem Background, Sem Borda) --- */}
        <div className="relative flex items-center justify-center h-full w-full">
          <div className="relative w-52 h-52 flex items-center justify-center">
            
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {Array.from({ length: 60 }).map((_, i) => {
                const isActive = i < Math.round((assertivityValue / 100) * 60);
                const color = isActive ? "#33b864" : "#222222"; 
                
                return (
                  <line
                    key={i}
                    x1="50" y1="10" x2="50" y2="20"
                    stroke={color}
                    strokeWidth="2"
                    transform={`rotate(${i * (360 / 60)} 50 50)`}
                    style={{ transition: 'stroke 0.5s ease' }}
                  />
                );
              })}
            </svg>

            {/* Conteúdo Central (Texto) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <span className="text-4xl font-sora font-black text-white tracking-tighter drop-shadow-lg">
                {assertivityValue.toFixed(1)}<span className="text-lg text-[#33b864]">%</span>
              </span>
              <span className="text-[9px] text-gray-500 uppercase tracking-[0.2em] mt-1 bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                Assertividade
              </span>
            </div>

          </div>
        </div>

        {/* --- DIREITA: GRÁFICO DE LUCRO (Se ajusta automaticamente ao h-48) --- */}
        <ProfitTrendChart />

      </div>

      {/* --- BLOCO INFERIOR: GRID 2x2 (PADRONIZADO E FUTURISTA) --- */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        
        {/* 1. ODD MÉDIA */}
        <div className="h-28 bg-[#121212] border border-[#33b864]/20 rounded-2xl p-4 hover:bg-[#161616] hover:border-[#33b864]/50 transition-all flex flex-col justify-center relative group shadow-lg shadow-black/50">
          <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-50 transition-opacity">
            <Scale className="w-8 h-8 text-orange-500" />
          </div>
          <div className="flex items-center gap-2 mb-2 z-10">
            <div className="w-1 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Odd Média</span>
          </div>
          <span className="text-3xl font-sora font-bold text-white z-10">@{averageOdd}</span>
        </div>

        {/* 2. ONLINE AGORA */}
        <div className="h-28 bg-[#121212] border border-[#33b864]/20 rounded-2xl p-4 hover:bg-[#161616] hover:border-[#33b864]/50 transition-all flex flex-col justify-center relative group shadow-lg shadow-black/50">
          <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-50 transition-opacity">
            <Users className="w-8 h-8 text-[#33b864]" />
          </div>
          <div className="flex items-center gap-2 mb-2 z-10">
            <span className="w-2 h-2 rounded-full bg-[#33b864] animate-pulse shadow-[0_0_8px_#33b864]"></span>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Online</span>
          </div>
          <span className="text-3xl font-sora font-bold text-white z-10">{onlineUsers.toLocaleString('pt-BR')}</span>
        </div>

        {/* 3. UNIDADES GANHAS */}
        <div className="h-28 bg-[#121212] border border-[#33b864]/20 rounded-2xl p-4 hover:bg-[#161616] hover:border-[#33b864]/50 transition-all flex flex-col justify-center relative group shadow-lg shadow-black/50">
          <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-50 transition-opacity">
            <TrendingUp className="w-8 h-8 text-[#33b864]" />
          </div>
          <div className="flex items-center gap-2 mb-2 z-10">
            <div className="w-1 h-3 bg-[#33b864] rounded-full"></div>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Ganhos</span>
          </div>
          <span className="text-3xl font-sora font-bold text-[#33b864] z-10">+{unitsWon.toFixed(1)}u</span>
        </div>

        {/* 4. UNIDADES PERDIDAS */}
        <div className="h-28 bg-[#121212] border border-[#33b864]/20 rounded-2xl p-4 hover:bg-[#161616] hover:border-red-500/50 transition-all flex flex-col justify-center relative group shadow-lg shadow-black/50">
          <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-50 transition-opacity">
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
          <div className="flex items-center gap-2 mb-2 z-10">
            <div className="w-1 h-3 bg-red-500 rounded-full"></div>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Perdas</span>
          </div>
          <span className="text-3xl font-sora font-bold text-red-500 z-10">-{unitsLost.toFixed(1)}u</span>
        </div>

      </div>

    </div>
  );
}
