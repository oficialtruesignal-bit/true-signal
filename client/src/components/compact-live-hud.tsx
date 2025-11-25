import { useState, useEffect } from 'react';
import { Users, Ticket } from 'lucide-react';

export function CompactLiveHud() {
  const [usersOnline, setUsersOnline] = useState(620);
  const [totalSignals] = useState(151);
  const roi = 104.3;

  useEffect(() => {
    const interval = setInterval(() => {
      const variation = Math.floor(Math.random() * 21) - 10;
      setUsersOnline(prev => Math.max(340, Math.min(900, prev + variation)));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Progress calculation for ROI circle
  const roiPercentage = Math.min(roi, 100); // Cap at 100% for visual
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - roiPercentage / 100);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-6 py-6">

      {/* --- CÍRCULO CENTRAL DE ROI --- */}
      <div className="flex items-center justify-center" data-testid="hud-roi">
        {/* Container do Círculo com efeito de brilho no fundo */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          
          {/* SVG com Track + Progress Ring */}
          <svg className="absolute w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(51,184,100,0.15)]">
            {/* 1. Círculo de Fundo (Track) - Mais escuro e fino */}
            <circle
              cx="96" 
              cy="96" 
              r={radius}
              fill="transparent"
              stroke="#1a1a1a"
              strokeWidth="4"
            />
            {/* 2. Círculo de Progresso (Neon) - Com Glow */}
            <circle
              cx="96" 
              cy="96" 
              r={radius}
              fill="transparent"
              stroke="#33b864"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ filter: "drop-shadow(0 0 6px #33b864)" }}
            />
          </svg>

          {/* 3. Conteúdo Central - ROI */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <span className="text-5xl font-sora font-extrabold text-white tracking-tighter drop-shadow-lg">
              +{roi}<span className="text-2xl text-[#33b864]">%</span>
            </span>
            <span className="text-xs text-gray-500 uppercase tracking-[0.2em] mt-2 font-medium bg-[#121212] px-2 py-1 rounded border border-white/5 font-inter">
              ROI Total
            </span>
          </div>

        </div>
      </div>

    </div>
  );
}
