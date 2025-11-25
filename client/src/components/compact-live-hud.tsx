import { TrendingUp, Flame } from 'lucide-react';
import { useCRMDashboardData } from '@/hooks/use-crm-dashboard-data';

export function CompactLiveHud() {
  const stats = useCRMDashboardData();
  const assertivityValue = stats.assertivity;

  return (
    <div className="w-full grid grid-cols-[45%_55%] gap-3 items-stretch mb-6">

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

      {/* --- COLUNA DIREITA: PILHA PADRONIZADA --- */}
      <div className="flex flex-col gap-3 h-full">

        {/* CARD 1: ROI (Estilo Idêntico aos cards de baixo) */}
        <div className="flex-1 bg-[#121212] border border-[#333] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" strokeWidth={1.5} />
            <span className="text-xs text-muted-foreground uppercase tracking-wide">ROI</span>
          </div>
          <p className="text-2xl font-bold font-mono text-primary">
            +{stats.roi.toFixed(1)}%
          </p>
        </div>

        {/* CARD 2: SEQUÊNCIA (Estilo Idêntico aos cards de baixo) */}
        <div className="flex-1 bg-[#121212] border border-[#333] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-500" strokeWidth={1.5} />
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Sequência</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white">
            {stats.currentStreak.wins}V / {stats.currentStreak.losses}D
          </p>
        </div>

      </div>

    </div>
  );
}
