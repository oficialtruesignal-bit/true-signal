import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function StatsCircle() {
  const [percentage, setPercentage] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let interval: NodeJS.Timeout | null = null;
    
    const timer = setTimeout(() => {
      let current = 0;
      interval = setInterval(() => {
        current += 1;
        setPercentage(current);
        if (current >= 95) {
          if (interval) clearInterval(interval);
        }
      }, 20);
    }, 500);

    return () => {
      clearTimeout(timer);
      if (interval) clearInterval(interval);
    };
  }, []);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-full h-64 bg-black/40 rounded-2xl border border-primary/20 p-6 flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
      
      <div className="relative z-10 flex flex-col items-center">
        <h3 className="text-white font-bold mb-6">Taxa de Assertividade Atual</h3>
        
        <div className="relative">
          <svg width="200" height="200" className="transform -rotate-90">
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke="#1a1a1a"
              strokeWidth="12"
              fill="none"
            />
            
            <motion.circle
              cx="100"
              cy="100"
              r={radius}
              stroke="url(#circleGradient)"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: mounted ? offset : circumference }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />

            <defs>
              <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#33b864" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              className="text-5xl font-bold text-primary drop-shadow-[0_0_15px_rgba(51,184,100,0.6)]"
              data-testid="text-accuracy-percentage"
            >
              {percentage}%
            </motion.div>
            <div className="text-xs text-gray-400 mt-1">de acerto</div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.5 }}
          className="mt-4 text-xs text-center text-gray-400"
        >
          Últimos 30 dias • 847 tips validadas
        </motion.div>
      </div>
    </div>
  );
}
