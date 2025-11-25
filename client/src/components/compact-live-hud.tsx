import { TrendingUp, Flame } from 'lucide-react';
import { useCRMDashboardData } from '@/hooks/use-crm-dashboard-data';

export function CompactLiveHud() {
  const stats = useCRMDashboardData();
  const assertivityValue = stats.assertivity;

  return (
    <div className="w-full max-w-lg mx-auto grid grid-cols-[45%_55%] gap-4 items-center mb-6">

      {/* --- COLUNA ESQUERDA: O GAUGE (ASSERTIVIDADE) --- */}
      <div className="flex items-center justify-center">
        <div className="relative w-40 h-40">
          
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
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="flex items-baseline">
              <span className="text-4xl font-sora font-bold text-white tracking-tighter">
                {assertivityValue.toFixed(1)}
              </span>
              <span className="text-lg font-sora text-[#33b864] font-bold ml-1">%</span>
            </div>
            <span className="text-[8px] text-gray-500 uppercase tracking-widest mt-1">
              Assertividade
            </span>
          </div>

        </div>
      </div>

      {/* --- COLUNA DIREITA: PILHA DE CARDS (STACK) --- */}
      <div className="flex flex-col gap-3">

        {/* Card Superior Direita: ROI */}
        <div className="bg-[#121212] border border-[#33b864]/20 rounded-xl p-3 flex flex-col justify-center relative overflow-hidden h-[70px]">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#33b864]"></div>
          <span className="text-[10px] text-gray-400 uppercase font-bold ml-2">ROI</span>
          <div className="flex items-center gap-2 ml-2">
            <TrendingUp className="w-4 h-4 text-[#33b864]" />
            <span className="text-lg font-sora font-bold text-white">+{stats.roi.toFixed(1)}%</span>
          </div>
        </div>

        {/* Card Inferior Direita: SEQUÊNCIA */}
        <div className="bg-[#121212] border border-[#33b864]/20 rounded-xl p-3 flex flex-col justify-center relative overflow-hidden h-[70px]">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#33b864]"></div>
          <span className="text-[10px] text-gray-400 uppercase font-bold ml-2">Sequência Atual</span>
          <div className="flex items-center gap-2 ml-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-lg font-sora font-bold text-white">{stats.currentStreak.wins}V / {stats.currentStreak.losses}D</span>
          </div>
        </div>

      </div>

    </div>
  );
}
