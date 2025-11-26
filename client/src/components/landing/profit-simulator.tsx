import { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Slider } from '@/components/ui/slider';

export function ProfitSimulator() {
  const [initialCapital, setInitialCapital] = useState(1000);
  
  const calculateProjection = (initial: number) => {
    const dailyReturn = 0.03;
    const data = [];
    
    for (let day = 0; day <= 30; day++) {
      const value = initial * Math.pow(1 + dailyReturn, day);
      data.push({
        day,
        value: Math.round(value),
      });
    }
    
    return data;
  };
  
  const projectionData = calculateProjection(initialCapital);
  const finalValue = projectionData[30].value;
  const profit = finalValue - initialCapital;
  const roi = ((profit / initialCapital) * 100).toFixed(1);
  
  return (
    <div className="bg-gradient-to-br from-[#0a0a0a] to-black border border-[#33b864]/30 rounded-3xl p-8 backdrop-blur-xl">
      <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center" style={{ fontFamily: 'Sora, sans-serif' }}>
        O Poder dos Juros Compostos na Sua Mão
      </h3>
      <p className="text-gray-400 text-center mb-8">
        Arraste o slider e veja sua banca crescer exponencialmente
      </p>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm md:text-base text-gray-400">Investimento Inicial</span>
          <span className="text-3xl md:text-4xl font-bold text-[#33b864] font-mono">
            R$ {initialCapital.toLocaleString()}
          </span>
        </div>
        
        <div className="py-6 px-2">
          <Slider
            value={[initialCapital]}
            onValueChange={(value) => setInitialCapital(value[0])}
            min={100}
            max={5000}
            step={100}
            className="mb-8"
          />
        </div>
        
        <div className="h-64 md:h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#33b864" opacity={0.1} />
              <XAxis 
                dataKey="day" 
                stroke="#666" 
                label={{ value: 'Dias', position: 'insideBottom', offset: -5, fill: '#999' }}
              />
              <YAxis 
                stroke="#666"
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(1)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#000',
                  border: '1px solid #33b864',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                formatter={(value: number) => [`R$ ${value.toLocaleString()}`, 'Banca']}
                labelFormatter={(label) => `Dia ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#33b864" 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: '#33b864' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          key={finalValue}
          className="grid grid-cols-3 gap-4 bg-black/50 rounded-xl p-6 border border-[#33b864]/20"
        >
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Resultado em 30 dias</div>
            <div className="text-2xl font-bold text-[#33b864] font-mono">
              R$ {finalValue.toLocaleString()}
            </div>
          </div>
          <div className="text-center border-l border-r border-gray-800">
            <div className="text-xs text-gray-400 mb-1">Lucro Líquido</div>
            <div className="text-2xl font-bold text-white font-mono">
              R$ {profit.toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">ROI</div>
            <div className="text-2xl font-bold text-[#33b864] font-mono">
              +{roi}%
            </div>
          </div>
        </motion.div>
      </div>
      
      <p className="text-xs text-center text-gray-500">
        *Projeção baseada em retorno médio de 3% ao dia com gestão de banca conservadora
      </p>
    </div>
  );
}
