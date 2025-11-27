import { useState } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { TrendingUp, Percent, Wallet } from 'lucide-react';

export function ProfitSimulator() {
  const [initialCapital, setInitialCapital] = useState(1000);
  
  const dailyReturn = 0.03;
  const days = 30;
  const finalValue = Math.round(initialCapital * Math.pow(1 + dailyReturn, days));
  const profit = finalValue - initialCapital;
  const roi = ((profit / initialCapital) * 100).toFixed(0);
  
  return (
    <div className="bg-gradient-to-br from-[#0a0a0a] to-black border border-[#33b864]/30 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
      <h3 className="text-xl md:text-2xl font-bold text-white mb-2 text-center" style={{ fontFamily: 'Sora, sans-serif' }}>
        Simule seu Crescimento
      </h3>
      <p className="text-sm text-gray-400 text-center mb-8">
        Arraste e veja seu potencial de lucro
      </p>
      
      {/* Slider Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-400">Investimento Inicial</span>
          <motion.span 
            key={initialCapital}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-2xl md:text-3xl font-bold text-[#33b864] font-mono"
          >
            R$ {initialCapital.toLocaleString()}
          </motion.span>
        </div>
        
        <div className="py-4 px-2">
          <Slider
            value={[initialCapital]}
            onValueChange={(value) => setInitialCapital(value[0])}
            min={100}
            max={5000}
            step={100}
            className="[&_[role=slider]]:bg-[#33b864] [&_[role=slider]]:border-[#33b864] [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-[#33b864]/50"
          />
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>R$ 100</span>
            <span>R$ 5.000</span>
          </div>
        </div>
      </div>
      
      {/* Results */}
      <motion.div
        key={finalValue}
        initial={{ scale: 0.95, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        className="space-y-4"
      >
        {/* Main Result */}
        <div className="bg-[#33b864]/10 border-2 border-[#33b864]/40 rounded-2xl p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Wallet className="w-5 h-5 text-[#33b864]" />
            <span className="text-sm text-gray-300">Lucro Estimado (30 dias)</span>
          </div>
          <div className="text-4xl md:text-5xl font-black text-[#33b864] font-mono" style={{ fontFamily: 'Sora, sans-serif' }}>
            R$ {profit.toLocaleString()}
          </div>
        </div>
        
        {/* ROI Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-black border border-[#33b864]/30 rounded-full">
            <TrendingUp className="w-5 h-5 text-[#33b864]" />
            <span className="text-gray-400">ROI Projetado:</span>
            <span className="text-2xl font-bold text-[#33b864]">+{roi}%</span>
          </div>
        </div>
      </motion.div>
      
      {/* Disclaimer */}
      <p className="text-xs text-center text-gray-500 mt-6">
        Baseado na performance média histórica de 3%/dia. Matemática, não mágica.
      </p>
    </div>
  );
}
