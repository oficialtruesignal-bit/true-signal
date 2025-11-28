import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function ProfitChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const oceanPoints = "M0,100 L20,95 L40,85 L60,70 L80,50 L100,25";
  const commonPoints = "M0,100 L20,98 L40,95 L60,93 L80,95 L100,100";

  return (
    <div className="relative w-full h-64 bg-black/40 rounded-2xl border border-primary/20 p-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-50" />
      
      <div className="relative z-10 h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold">Performance Acumulada 2024</h3>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-primary font-semibold">TRUE SIGNAL</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <span className="text-gray-400">Apostador Comum</span>
            </div>
          </div>
        </div>

        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#33b864" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#33b864" stopOpacity="0" />
            </linearGradient>
          </defs>

          <motion.path
            d={commonPoints + " L100,100 L0,100 Z"}
            fill="url(#oceanGradient)"
            opacity={0.1}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: mounted ? 1 : 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          
          <motion.path
            d={commonPoints}
            stroke="#6b7280"
            strokeWidth="0.5"
            fill="none"
            strokeDasharray="2,2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: mounted ? 1 : 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />

          <motion.path
            d={oceanPoints + " L100,100 L0,100 Z"}
            fill="url(#oceanGradient)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: mounted ? 1 : 0 }}
            transition={{ duration: 2, ease: "easeInOut", delay: 0.3 }}
          />
          
          <motion.path
            d={oceanPoints}
            stroke="#33b864"
            strokeWidth="1"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: mounted ? 1 : 0 }}
            transition={{ duration: 2, ease: "easeInOut", delay: 0.3 }}
          />

          <motion.circle
            cx="100"
            cy="25"
            r="1.5"
            fill="#33b864"
            initial={{ scale: 0 }}
            animate={{ scale: mounted ? [1, 1.5, 1] : 0 }}
            transition={{ duration: 2, repeat: Infinity, delay: 2.3 }}
          />
        </svg>

        <div className="flex justify-between text-xs text-gray-600 mt-2">
          <span>Jan</span>
          <span>Dez</span>
        </div>
      </div>

      <div className="absolute top-6 right-6 text-right">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.5, type: "spring" }}
          className="text-2xl font-bold text-primary drop-shadow-[0_0_10px_rgba(51,184,100,0.5)]"
          data-testid="text-roi-percentage"
        >
          +450%
        </motion.div>
        <div className="text-xs text-gray-400">ROI Médio</div>
      </div>
    </div>
  );
}
