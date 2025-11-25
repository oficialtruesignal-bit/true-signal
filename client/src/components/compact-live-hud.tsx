import { useState, useEffect } from 'react';
import { Users, Ticket } from 'lucide-react';

interface CircularProgressProps {
  percentage: number;
  size: number;
  strokeWidth?: number;
}

function CircularProgress({ percentage, size, strokeWidth = 12 }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#222"
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress Ring with Glow */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#33b864"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{
          filter: 'drop-shadow(0 0 8px #33b864)',
          transition: 'stroke-dashoffset 0.5s ease',
        }}
      />
    </svg>
  );
}

export function CompactLiveHud() {
  const [usersOnline, setUsersOnline] = useState(620);
  const [totalSignals] = useState(151);

  useEffect(() => {
    const interval = setInterval(() => {
      const variation = Math.floor(Math.random() * 21) - 10;
      setUsersOnline(prev => Math.max(340, Math.min(900, prev + variation)));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-6 max-w-4xl mx-auto py-6">
      
      {/* ÁREA 1: INFO STACK HORIZONTAL (OS RETÂNGULOS) */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
        
        {/* Retângulo 1: Usuários Online */}
        <div 
          className="flex-1 bg-[#121212] border border-[#33b864]/20 rounded-xl p-4 flex items-center justify-between shadow-lg shadow-[#33b864]/5"
          data-testid="hud-users"
        >
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase font-bold font-inter">Investidores Online</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-[#33b864] animate-pulse"></span>
              <span className="text-xl font-sora font-bold text-white">{usersOnline}</span>
            </div>
          </div>
          <Users className="text-[#33b864] w-6 h-6 opacity-50" />
        </div>

        {/* Retângulo 2: Total de Sinais */}
        <div 
          className="flex-1 bg-[#121212] border border-[#33b864]/20 rounded-xl p-4 flex items-center justify-between shadow-lg shadow-[#33b864]/5"
          data-testid="hud-signals"
        >
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase font-bold font-inter">Sinais Enviados</span>
            <span className="text-xl font-sora font-bold text-white mt-1">{totalSignals}</span>
          </div>
          <Ticket className="text-[#33b864] w-6 h-6 opacity-50" />
        </div>

      </div>

      {/* ÁREA 2: O HERO CIRCLE (ASSERTIVIDADE) - EMBAIXO */}
      <div className="relative flex flex-col items-center justify-center" data-testid="hud-assertivity">
        <div className="w-32 h-32 md:w-40 md:h-40 relative">
          <CircularProgress percentage={95} size={160} strokeWidth={14} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl md:text-4xl font-sora font-bold text-white">94.8%</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 font-sora">Assertividade</span>
          </div>
        </div>
      </div>

    </div>
  );
}
