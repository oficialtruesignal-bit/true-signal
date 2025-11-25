import { useState, useEffect } from 'react';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  showGlow?: boolean;
}

function CircularProgress({ percentage, size, strokeWidth = 12, showGlow = true }: CircularProgressProps) {
  // Use CSS for responsive sizing instead of fixed size
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const actualSize = size || (isMobile ? 80 : 112);
  const radius = (actualSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={actualSize} height={actualSize} className="transform -rotate-90 w-full h-full">
      {/* Background Track */}
      <circle
        cx={actualSize / 2}
        cy={actualSize / 2}
        r={radius}
        stroke="#222"
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress Ring with Glow */}
      <circle
        cx={actualSize / 2}
        cy={actualSize / 2}
        r={radius}
        stroke="#33b864"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{
          filter: showGlow ? 'drop-shadow(0 0 6px #33b864)' : 'none',
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
    <div className="w-full flex flex-row justify-center items-center gap-8 md:gap-16 lg:gap-24 py-6 sm:py-8">
      {/* Circle 1: Assertividade Global */}
      <div className="flex flex-col items-center gap-2 sm:gap-3" data-testid="hud-assertivity">
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 flex items-center justify-center">
          <CircularProgress percentage={95} strokeWidth={10} showGlow={false} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="flex items-baseline gap-0.5 sm:gap-1">
              <span className="text-xl sm:text-2xl font-bold text-white">94.8</span>
              <span className="text-xs sm:text-sm font-semibold text-primary">%</span>
            </div>
          </div>
        </div>
        <span className="text-[10px] sm:text-xs text-gray-400 font-medium">Assertividade</span>
      </div>

      {/* Circle 2: Usuários Online (Oscillating) */}
      <div className="flex flex-col items-center gap-2 sm:gap-3" data-testid="hud-users">
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 flex items-center justify-center">
          <div className="animate-pulse-slow">
            <CircularProgress percentage={100} strokeWidth={10} showGlow={false} />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-ping" />
              <span className="text-lg sm:text-2xl font-bold text-white">
                {usersOnline.toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
        <span className="text-[10px] sm:text-xs text-gray-400 font-medium">Online Agora</span>
      </div>

      {/* Circle 3: Total Sinais */}
      <div className="flex flex-col items-center gap-2 sm:gap-3" data-testid="hud-signals">
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 flex items-center justify-center">
          <CircularProgress percentage={100} strokeWidth={10} showGlow={false} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="flex items-baseline gap-0.5 sm:gap-1">
              <span className="text-xl sm:text-2xl font-bold text-white">{totalSignals}</span>
            </div>
          </div>
        </div>
        <span className="text-[10px] sm:text-xs text-gray-400 font-medium">Total de Sinais</span>
      </div>
    </div>
  );
}
