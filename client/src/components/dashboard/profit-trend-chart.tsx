import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

// Dados simulados de crescimento de banca (Ex: últimos 7 dias/sinais)
const data = [
  { name: 'D1', profit: 10 },
  { name: 'D2', profit: 25 },
  { name: 'D3', profit: 18 },
  { name: 'D4', profit: 35 },
  { name: 'D5', profit: 42 },
  { name: 'D6', profit: 58 },
  { name: 'D7', profit: 85 },
];

export function ProfitTrendChart() {
  return (
    <div className="h-full bg-[#121212] border border-[#33b864]/20 rounded-3xl p-4 flex flex-col relative overflow-hidden shadow-[0_0_30px_rgba(51,184,100,0.05)] group">
      
      {/* Título e Valor Atual */}
      <div className="flex justify-between items-start mb-2 z-10 px-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-[#33b864]" />
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Crescimento da Banca</span>
          </div>
          <span className="text-3xl font-sora font-black text-white drop-shadow-[0_0_10px_rgba(51,184,100,0.3)]">
            +85.0%
          </span>
        </div>
      </div>

      {/* O Gráfico */}
      <div className="flex-1 w-full h-full min-h-[120px] -ml-4 -mb-4">
        <ResponsiveContainer width="115%" height="115%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#33b864" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#33b864" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" hide={true} />
            <YAxis hide={true} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #33b864', borderRadius: '8px' }}
              itemStyle={{ color: '#33b864' }}
              labelStyle={{ color: 'white' }}
            />
            <Area 
              type="monotone" 
              dataKey="profit" 
              stroke="#33b864" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorProfit)" 
              style={{ filter: 'drop-shadow(0px 0px 6px rgb(51 184 100 / 0.5))' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
       
      <div className="absolute inset-0 border-2 border-[#33b864]/0 rounded-3xl group-hover:border-[#33b864]/30 transition-all pointer-events-none"></div>

    </div>
  );
}
