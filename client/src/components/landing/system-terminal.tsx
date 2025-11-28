import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Signal, TrendingUp } from 'lucide-react';

export function SystemTerminal() {
  const [uptime, setUptime] = useState('99.9');
  const [signals, setSignals] = useState(14);
  const [accuracy, setAccuracy] = useState(92.4);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSignals(prev => (prev + 1) % 20);
    }, 15000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="bg-black/80 border border-[#33b864]/30 rounded-2xl p-6 font-mono text-sm backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-800">
        <div className="w-3 h-3 rounded-full bg-[#33b864] animate-pulse" />
        <span className="text-[#33b864] font-bold">VANTAGE SYSTEM STATUS</span>
      </div>
      
      <div className="space-y-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-between"
        >
          <span className="text-gray-400 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#33b864]" />
            Uptime
          </span>
          <span className="text-[#33b864] font-bold">{uptime}%</span>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between"
        >
          <span className="text-gray-400 flex items-center gap-2">
            <Signal className="w-4 h-4 text-blue-400" />
            Sinais Enviados Hoje
          </span>
          <span className="text-white font-bold">{signals}</span>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between"
        >
          <span className="text-gray-400 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#33b864]" />
            Assertividade Semanal
          </span>
          <span className="text-[#33b864] font-bold">{accuracy}%</span>
        </motion.div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="text-xs text-gray-600">
          <span className="text-[#33b864]">$</span> ./monitor --status
        </div>
        <div className="text-xs text-gray-500 mt-1">
          [OK] All systems operational
        </div>
      </div>
    </div>
  );
}
