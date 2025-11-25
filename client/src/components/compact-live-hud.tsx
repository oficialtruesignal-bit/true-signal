import { TrendingUp, Flame } from 'lucide-react';
import { useCRMDashboardData } from '@/hooks/use-crm-dashboard-data';
import { HolographicCard } from './dashboard/holographic-card';

export function CompactLiveHud() {
  const stats = useCRMDashboardData();
  const assertivityValue = stats.assertivity;

  return (
    <div className="w-full mb-8">
      
      {/* GRID DE ALINHAMENTO PERFEITO */}
      <div className="grid grid-cols-[45%_55%] gap-3 h-[220px] items-stretch">

        {/* --- ESQUERDA: CÍRCULO (SEM FUNDO, SEM BORDA) --- */}
        <div className="flex items-center justify-center relative">
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

        {/* --- DIREITA: CARDS HOLOGRÁFICOS --- */}
        <div className="flex flex-col gap-4 h-full">
          
          {/* CARD 1: LUCRO LÍQUIDO (Tema Verde/Neon) */}
          <HolographicCard 
            label="LUCRO LÍQUIDO" 
            value="+106.2u"
            color="green"
            icon={<TrendingUp className="w-12 h-12" strokeWidth={1.5} />} 
          />

          {/* CARD 2: ROI TOTAL (Tema Verde) */}
          <HolographicCard 
            label="ROI TOTAL" 
            value="18.5%"
            color="green"
            icon={<TrendingUp className="w-12 h-12" strokeWidth={1.5} />} 
          />

        </div>

      </div>

    </div>
  );
}
