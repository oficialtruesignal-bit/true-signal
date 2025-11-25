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

      {/* --- BLOCO 1: CARDS SUPERIORES (LADO A LADO) --- */}
      <div className="flex flex-row items-stretch justify-center gap-4 w-full max-w-lg mx-auto">
        
        {/* CARD ESQUERDA: INVESTIDORES ONLINE */}
        <div 
          className="flex-1 bg-[#121212] border border-[#33b864]/20 rounded-xl p-3 flex flex-col items-center justify-center shadow-lg shadow-[#33b864]/5 relative overflow-hidden h-20"
          data-testid="hud-users"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#33b864] to-transparent opacity-20"></div>
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1 font-inter">Investidores Online</span>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#33b864] animate-ping"></span>
            <span className="text-xl font-sora font-bold text-white">{usersOnline}</span>
          </div>
        </div>

        {/* CARD DIREITA: SINAIS ENVIADOS */}
        <div 
          className="flex-1 bg-[#121212] border border-[#33b864]/20 rounded-xl p-3 flex flex-col items-center justify-center shadow-lg shadow-[#33b864]/5 relative overflow-hidden h-20"
          data-testid="hud-signals"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#33b864] to-transparent opacity-20"></div>
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1 font-inter">Sinais Enviados</span>
          <span className="text-xl font-sora font-bold text-white">{totalSignals}</span>
        </div>

      </div>

      {/* --- BLOCO 2: CÍRCULO CENTRAL (ASSERTIVIDADE) --- */}
      <div className="flex items-center justify-center" data-testid="hud-assertivity">
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
