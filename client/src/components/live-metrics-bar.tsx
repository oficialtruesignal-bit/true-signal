import { Users, Zap, Target } from "lucide-react";
import { useState, useEffect } from "react";

export function LiveMetricsBar() {
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [displayUsers, setDisplayUsers] = useState(3420);
  const [totalTips] = useState(18940);
  const [winRate] = useState(94.8);
  
  // CountUp animation on mount
  useEffect(() => {
    let current = 0;
    const target = 3420;
    const duration = 2000;
    const increment = target / (duration / 16);

    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setOnlineUsers(target);
        clearInterval(interval);
      } else {
        setOnlineUsers(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(interval);
  }, []);

  // Oscillation engine for online users (3-5 seconds)
  useEffect(() => {
    const oscillate = () => {
      setDisplayUsers(prev => {
        const variation = Math.floor(Math.random() * 40) - 15; // -15 to +25
        const newValue = prev + variation;
        // Keep between 3400 and 3500
        return Math.max(3400, Math.min(3500, newValue));
      });
    };

    const getRandomInterval = () => Math.random() * 2000 + 3000; // 3-5 seconds

    let timeoutId: number;
    const scheduleNext = () => {
      timeoutId = window.setTimeout(() => {
        oscillate();
        scheduleNext();
      }, getRandomInterval());
    };

    // Start after initial countup finishes
    const initialDelay = setTimeout(() => {
      scheduleNext();
    }, 2500);

    return () => {
      clearTimeout(initialDelay);
      clearTimeout(timeoutId);
    };
  }, []);

  // Sync display with oscillation
  useEffect(() => {
    setOnlineUsers(displayUsers);
  }, [displayUsers]);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-6 py-4 bg-[#121212]/50 backdrop-blur-sm border border-primary/20 rounded-full max-w-4xl mx-auto">
      {/* Metric 1: Online Users (Oscillating) */}
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-primary" strokeWidth={1.5} />
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-sm text-white font-bold font-mono">
            {onlineUsers.toLocaleString('pt-BR')}
          </span>
          <span className="text-sm text-gray-300">Online Agora</span>
        </div>
      </div>

      {/* Separator */}
      <div className="hidden sm:block w-px h-6 bg-primary/20" />

      {/* Metric 2: Total Tips Sent */}
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-primary" strokeWidth={1.5} />
        <div className="flex items-center gap-2">
          <span className="text-sm text-white font-bold font-mono">
            {totalTips.toLocaleString('pt-BR')}+
          </span>
          <span className="text-sm text-gray-300">Sinais Enviados</span>
        </div>
      </div>

      {/* Separator */}
      <div className="hidden sm:block w-px h-6 bg-primary/20" />

      {/* Metric 3: Win Rate */}
      <div className="flex items-center gap-2">
        <Target className="w-4 h-4 text-primary" strokeWidth={1.5} />
        <div className="flex items-center gap-2">
          <span className="text-sm text-primary font-bold font-mono">
            {winRate}%
          </span>
          <span className="text-sm text-gray-300">Assertividade Global</span>
        </div>
      </div>
    </div>
  );
}
