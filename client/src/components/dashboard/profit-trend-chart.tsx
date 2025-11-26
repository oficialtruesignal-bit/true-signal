import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp } from 'lucide-react';

const data = [
  { name: '1', val: 10 }, { name: '2', val: 25 }, { name: '3', val: 20 },
  { name: '4', val: 40 }, { name: '5', val: 35 }, { name: '6', val: 60 },
  { name: '7', val: 85 },
];

export function ProfitTrendChart() {
  return (
    <div className="h-full bg-[#121212] border border-[#33b864]/20 rounded-2xl p-4 hover:bg-[#161616] hover:border-[#33b864]/50 transition-all flex flex-col justify-center relative group shadow-lg shadow-black/50">
      
      {/* Ícone decorativo no canto */}
      <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-50 transition-opacity">
        <TrendingUp className="w-8 h-8 text-[#33b864]" />
      </div>

      {/* Label com barra vertical */}
      <div className="flex items-center gap-2 mb-2 z-10">
        <div className="w-1 h-3 bg-[#33b864] rounded-full"></div>
        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Crescimento Banca</span>
      </div>

      {/* Valor */}
      <span className="text-3xl font-sora font-bold text-[#33b864] z-10">+85.0%</span>

      {/* Gráfico de fundo */}
      <div className="absolute bottom-0 left-0 right-0 h-16 w-full opacity-60">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#33b864" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#33b864" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip cursor={false} content={() => null} />
            <Area 
              type="monotone" 
              dataKey="val" 
              stroke="#33b864" 
              strokeWidth={2} 
              fill="url(#chartGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
