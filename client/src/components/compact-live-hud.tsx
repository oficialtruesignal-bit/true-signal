import { TrendingUp, Flame } from 'lucide-react';
import { useCRMDashboardData } from '@/hooks/use-crm-dashboard-data';

export function CompactLiveHud() {
  const stats = useCRMDashboardData();
  const assertivityValue = stats.assertivity;

  return (
    <div className="w-full mb-8">
      
      {/* GRID PRINCIPAL: CÍRCULO SOLTO + CARDS PADRÃO */}
      <div className="grid grid-cols-[45%_55%] gap-4 h-56 items-center">

        {/* --- COLUNA ESQUERDA: O CÍRCULO (SEM CARD, SEM BORDA) --- */}
        <div className="flex items-center justify-center h-full relative">
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
              <div className="flex items-baseline">
                <span className="text-4xl font-sora font-bold text-white tracking-tighter">
                  {assertivityValue.toFixed(1)}
                </span>
                <span className="text-lg font-sora text-[#33b864] font-bold ml-1">%</span>
              </div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                Assertividade
              </span>
            </div>

          </div>
        </div>

        {/* --- COLUNA DIREITA: CARDS CLONADOS (ESTILO PADRÃO) --- */}
        <div className="flex flex-col gap-4 h-full">

          {/* CARD 1: ROI TOTAL (Estilo Idêntico ao "Padrão de Baixo") */}
          <div className="flex-1 bg-[#121212] border border-[#33b864]/20 rounded-xl p-4 flex flex-col justify-center shadow-lg hover:border-[#33b864]/40 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-[#33b864]" />
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">ROI Total</span>
            </div>
            <span className="text-2xl font-sora font-bold text-white">+{stats.roi.toFixed(1)}%</span>
          </div>

          {/* CARD 2: SEQUÊNCIA (Estilo Idêntico ao "Padrão de Baixo") */}
          <div className="flex-1 bg-[#121212] border border-[#33b864]/20 rounded-xl p-4 flex flex-col justify-center shadow-lg hover:border-[#33b864]/40 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Sequência</span>
            </div>
            <span className="text-2xl font-sora font-bold text-white">{stats.currentStreak.wins}V / {stats.currentStreak.losses}D</span>
          </div>

        </div>

      </div>

    </div>
  );
}
