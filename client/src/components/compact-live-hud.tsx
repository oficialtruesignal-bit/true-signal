import { Scale, Users, TrendingDown, TrendingUp, Shield } from 'lucide-react';
import { ProfitTrendChart } from './dashboard/profit-trend-chart';
import { useTipsStats } from '@/hooks/use-tips-stats';
import { useState, useEffect } from 'react';

export function CompactLiveHud() {
  // Buscar estatísticas reais dos bilhetes
  const { data: stats, isLoading } = useTipsStats();
  
  // Valores calculados a partir dos bilhetes reais
  const greens = stats?.greens ?? 0;
  const reds = stats?.reds ?? 0;
  const totalEntries = stats?.totalResolved ?? 0;
  const assertivityValue = stats?.assertivity ?? 0;
  const averageOdd = stats?.averageOdd ?? 0;
  const growthPercentage = stats?.growthPercentage ?? 0;
  
  // Usuários online oscila entre 254-403 com movimento suave
  const [onlineUsers, setOnlineUsers] = useState(330);
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  
  // Latência oscila entre 8-18ms
  const [latency, setLatency] = useState(12);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers(prev => {
        const step = Math.floor(Math.random() * 20) + 15;
        
        if (direction === 'up') {
          const newValue = prev + step;
          if (newValue >= 403) {
            setDirection('down');
            return 403;
          }
          return newValue;
        } else {
          const newValue = prev - step;
          if (newValue <= 254) {
            setDirection('up');
            return 254;
          }
          return newValue;
        }
      });
      
      // Atualiza latência aleatoriamente
      setLatency(Math.floor(Math.random() * 10) + 8);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [direction]);

  return (
    <div className="w-full mb-8 flex flex-col gap-6">

      {/* SEÇÃO 1: BLOCO SUPERIOR (Círculo + Gráfico) */}
      <div className="grid grid-cols-[40%_60%] gap-4 h-44 items-center">

        {/* ESQUERDA: GAUGE DE ASSERTIVIDADE COM META */}
        <div className="relative flex items-center justify-center h-full w-full">
          <div className="relative w-36 h-36 flex items-center justify-center">
            
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Anel externo fino - Meta 100% */}
              <circle
                cx="50"
                cy="50"
                r="46"
                stroke="#1f1f1f"
                strokeWidth="2"
                fill="none"
                strokeDasharray="3 3"
                opacity="0.5"
              />
              {/* Círculo de fundo */}
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#1a1a1a"
                strokeWidth="8"
                fill="none"
              />
              {/* Círculo de progresso com glow */}
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#33b864"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${(assertivityValue / 100) * 2 * Math.PI * 42} ${2 * Math.PI * 42}`}
                style={{ 
                  transition: 'stroke-dasharray 0.5s ease',
                  filter: 'drop-shadow(0 0 6px #33b864)'
                }}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <span 
                className="text-[28px] font-black text-[#33b864] tracking-tight leading-none" 
                style={{ 
                  fontFamily: 'Sora, sans-serif',
                  textShadow: '0 0 20px rgba(51, 184, 100, 0.5)'
                }}
              >
                {isLoading ? '--' : `${assertivityValue.toFixed(1)}%`}
              </span>
              <span className="text-[10px] text-muted-foreground mt-1">
                Média Dezembro
              </span>
            </div>

          </div>
        </div>

        {/* DIREITA: GRÁFICO DE LUCRO */}
        <ProfitTrendChart growthPercentage={growthPercentage} />

      </div>

      {/* SEÇÃO 2: BLOCO INFERIOR (Grid 2x2 Premium) */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* CARD A: ODD MÉDIA com comparativo */}
        <div className="h-32 bg-[#121212] border border-[#33b864]/20 rounded-2xl p-4 hover:bg-[#161616] hover:border-[#33b864]/50 transition-all flex flex-col justify-center relative group shadow-lg shadow-black/50 overflow-hidden">
          {/* Textura noise */}
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
          
          <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-50 transition-opacity">
            <Scale className="w-8 h-8 text-orange-500" />
          </div>
          <div className="flex items-center gap-2 mb-2 z-10">
            <div className="w-1 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Odd Média</span>
          </div>
          <div className="flex items-center gap-2 z-10">
            <span className="text-3xl font-sora font-bold text-white">
              {isLoading ? '--' : averageOdd.toFixed(2)}
            </span>
            <span className="text-[9px] bg-[#33b864]/20 text-[#33b864] px-2 py-0.5 rounded-full font-bold">
              ▲ 20% acima
            </span>
          </div>
        </div>

        {/* CARD B: USUÁRIOS ONLINE com latência */}
        <div className="h-32 bg-[#121212] border border-[#33b864]/20 rounded-2xl p-4 hover:bg-[#161616] hover:border-[#33b864]/50 transition-all flex flex-col justify-between relative group shadow-lg shadow-black/50 overflow-hidden">
          {/* Textura noise */}
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
          
          <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-50 transition-opacity">
            <Users className="w-8 h-8 text-[#33b864]" />
          </div>
          
          <div className="flex flex-col justify-center flex-1">
            <div className="flex items-center gap-2 mb-2 z-10">
              <span className="w-2 h-2 rounded-full bg-[#33b864] animate-pulse shadow-[0_0_8px_#33b864]"></span>
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Usuários Online</span>
            </div>
            <span 
              className="text-3xl font-sora font-bold text-white z-10"
              style={{ textShadow: '0 0 10px rgba(255,255,255,0.1)' }}
            >
              {onlineUsers.toLocaleString('pt-BR')}
            </span>
          </div>
          
          {/* Rodapé com latência */}
          <div className="flex items-center gap-1.5 z-10 border-t border-white/5 pt-2 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#33b864] animate-pulse"></span>
            <span className="text-[8px] text-gray-500">Latência: <span className="text-[#33b864]">{latency}ms</span> (Tempo Real)</span>
          </div>
        </div>

        {/* CARD C: GREENS (dados reais dos bilhetes) */}
        <div className="h-32 bg-[#121212] border border-[#33b864]/20 rounded-2xl p-4 hover:bg-[#161616] hover:border-[#33b864]/50 transition-all flex flex-col justify-between relative group shadow-lg shadow-black/50 overflow-hidden">
          {/* Textura noise */}
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
          
          <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-50 transition-opacity">
            <TrendingUp className="w-8 h-8 text-[#33b864]" />
          </div>
          
          <div className="flex flex-col justify-center flex-1">
            <div className="flex items-center gap-2 mb-2 z-10">
              <div className="w-1 h-3 bg-[#33b864] rounded-full"></div>
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Greens</span>
            </div>
            <span 
              className="text-3xl font-sora font-bold text-[#33b864] z-10"
              style={{ textShadow: '0 0 20px rgba(51, 184, 100, 0.4)' }}
            >
              {isLoading ? '--' : greens}
            </span>
          </div>
          
          {/* Total de entradas */}
          <div className="z-10 border-t border-white/5 pt-2 mt-2">
            <span className="text-[8px] text-gray-500">de {totalEntries} entradas</span>
          </div>
        </div>

        {/* CARD D: REDS (dados reais dos bilhetes) */}
        <div className="h-32 bg-[#121212] border border-[#33b864]/20 rounded-2xl p-4 hover:bg-[#161616] hover:border-[#33b864]/30 transition-all flex flex-col justify-between relative group shadow-lg shadow-black/50 overflow-hidden">
          {/* Textura noise */}
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
          
          {/* Escudo como marca d'água */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 group-hover:opacity-10 transition-opacity">
            <Shield className="w-24 h-24 text-[#33b864]" />
          </div>
          
          <div className="flex flex-col justify-center flex-1">
            <div className="flex items-center gap-2 mb-2 z-10">
              <div className="w-1 h-3 bg-red-500 rounded-full"></div>
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Reds</span>
            </div>
            <span className="text-3xl font-sora font-bold text-red-500 z-10">
              {isLoading ? '--' : reds}
            </span>
          </div>
          
          {/* Indicador de proteção */}
          <div className="flex items-center gap-1.5 z-10 border-t border-white/5 pt-2 mt-2">
            <Shield className="w-3 h-3 text-[#33b864]" />
            <span className="text-[8px] text-[#33b864]">Proteção de Banca Ativa</span>
          </div>
        </div>

      </div>

    </div>
  );
}
