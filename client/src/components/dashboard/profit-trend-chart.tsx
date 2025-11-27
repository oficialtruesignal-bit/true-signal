import { AreaChart, Area, ResponsiveContainer, Tooltip, ReferenceLine, YAxis } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

const data = [
  { name: '1', val: 10 }, { name: '2', val: 25 }, { name: '3', val: 20 },
  { name: '4', val: 40 }, { name: '5', val: 35 }, { name: '6', val: 60 },
  { name: '7', val: 85 },
];

// Valor médio de referência
const averageValue = 35;

interface ProfitTrendChartProps {
  growthPercentage: number;
}

export function ProfitTrendChart({ growthPercentage }: ProfitTrendChartProps) {
  const isPositive = growthPercentage >= 0;
  const color = isPositive ? '#33b864' : '#ef4444';
  const Icon = isPositive ? TrendingUp : TrendingDown;
  
  return (
    <div className="h-full bg-[#121212] border border-[#33b864]/20 rounded-2xl p-4 hover:bg-[#161616] hover:border-[#33b864]/50 transition-all flex flex-col justify-center relative group shadow-lg shadow-black/50 overflow-hidden">
      
      {/* Textura noise */}
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
      
      {/* Ícone decorativo no canto */}
      <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-50 transition-opacity">
        <Icon className="w-8 h-8" style={{ color }} />
      </div>

      {/* Label com barra vertical */}
      <div className="flex items-center gap-2 mb-2 z-10">
        <div className="w-1 h-3 rounded-full" style={{ backgroundColor: color }}></div>
        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Crescimento</span>
      </div>

      {/* Valor com glow */}
      <span 
        className="text-3xl font-sora font-bold z-10" 
        style={{ 
          color,
          textShadow: isPositive ? '0 0 20px rgba(51, 184, 100, 0.4)' : '0 0 20px rgba(239, 68, 68, 0.4)'
        }}
      >
        {isPositive ? '+' : ''}{growthPercentage.toFixed(1)}%
      </span>

      {/* Gráfico de fundo com linha de referência */}
      <div className="absolute bottom-0 left-0 right-0 h-20 w-full opacity-70">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#33b864" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#33b864" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <YAxis domain={[0, 100]} hide />
            <Tooltip cursor={false} content={() => null} />
            
            {/* Linha de referência - Performance Média */}
            <ReferenceLine 
              y={averageValue} 
              stroke="#444" 
              strokeDasharray="4 4" 
              strokeWidth={1}
            />
            
            <Area 
              type="monotone" 
              dataKey="val" 
              stroke="#33b864" 
              strokeWidth={2} 
              fill="url(#chartGradient)"
              style={{ filter: 'drop-shadow(0 0 4px rgba(51, 184, 100, 0.5))' }}
            />
          </AreaChart>
        </ResponsiveContainer>
        
        {/* Label da linha de referência */}
        <div className="absolute left-2 top-[45%] transform -translate-y-1/2">
          <span className="text-[7px] text-gray-500 bg-[#121212]/80 px-1 rounded">Média</span>
        </div>
      </div>

    </div>
  );
}
