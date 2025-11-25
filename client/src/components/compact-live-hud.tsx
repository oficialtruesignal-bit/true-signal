import { useState, useEffect } from 'react';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  showGlow?: boolean;
}

function CircularProgress({ percentage, size = 112, strokeWidth = 12, showGlow = true }: CircularProgressProps) {
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
          filter: showGlow ? 'drop-shadow(0 0 6px #33b864)' : 'none',
          transition: 'stroke-dashoffset 0.5s ease',
        }}
      />
    </svg>
  );
}

export function CompactLiveHud() {
  const [usersOnline, setUsersOnline] = useState(3420);

  useEffect(() => {
    const interval = setInterval(() => {
      const variation = Math.floor(Math.random() * 101) - 50;
      setUsersOnline(prev => Math.max(3400, Math.min(3500, prev + variation)));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto flex justify-center items-center gap-6 md:gap-12 py-8">
      {/* Circle 1: Assertividade Global */}
      <div className="flex flex-col items-center gap-3" data-testid="hud-assertivity">
        <div className="relative w-28 h-28 flex items-center justify-center">
          <CircularProgress percentage={95} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white">94.8</span>
              <span className="text-sm font-semibold text-primary">%</span>
            </div>
          </div>
        </div>
        <span className="text-xs text-gray-400 font-medium">Assertividade</span>
      </div>

      {/* Circle 2: Usuários Online (Oscillating) */}
      <div className="flex flex-col items-center gap-3" data-testid="hud-users">
        <div className="relative w-28 h-28 flex items-center justify-center">
          <div className="animate-pulse-slow">
            <CircularProgress percentage={100} />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
              <span className="text-2xl font-bold text-white">
                {usersOnline.toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
        <span className="text-xs text-gray-400 font-medium">Online Agora</span>
      </div>

      {/* Circle 3: Total Sinais */}
      <div className="flex flex-col items-center gap-3" data-testid="hud-signals">
        <div className="relative w-28 h-28 flex items-center justify-center">
          <CircularProgress percentage={100} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-semibold text-primary">+</span>
              <span className="text-2xl font-bold text-white">18.9K</span>
            </div>
          </div>
        </div>
        <span className="text-xs text-gray-400 font-medium">Total de Sinais</span>
      </div>
    </div>
  );
}
