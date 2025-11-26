import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp } from 'lucide-react';

const data = [
  { name: '1', val: 10 }, { name: '2', val: 25 }, { name: '3', val: 20 },
  { name: '4', val: 40 }, { name: '5', val: 35 }, { name: '6', val: 60 },
  { name: '7', val: 85 },
];

export function ProfitTrendChart() {
  return (
    <div className="w-full h-full bg-[#121212] border border-[#33b864]/20 rounded-2xl p-4 flex flex-col relative overflow-hidden shadow-lg hover:border-[#33b864]/40 transition-colors">
      
      {/* CABEÇALHO DO CARD */}
      <div className="flex flex-col z-10 relative">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-[#33b864]" />
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Crescimento Banca</span>
        </div>
        <span className="text-3xl font-sora font-black text-white drop-shadow-md">
          +85.0%
        </span>
      </div>

      {/* ÁREA DO GRÁFICO (Ajustado para o fundo) */}
      <div className="absolute bottom-0 left-0 right-0 h-24 w-full opacity-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#33b864" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#33b864" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip cursor={false} content={() => null} />
            <Area 
              type="monotone" 
              dataKey="val" 
              stroke="#33b864" 
              strokeWidth={3} 
              fill="url(#chartGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
