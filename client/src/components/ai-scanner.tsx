import { useState, useEffect } from 'react';
import { Activity, Brain, Database, Zap } from 'lucide-react';

const LEAGUES = ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'Champions League', 'Brasileirão'];
const MARKETS = ['Over 0.5 HT', 'BTTS', 'Over 1.5 FT', 'Home Win', 'DNB', 'Asian Handicap'];
const TEAMS = ['Man City', 'Arsenal', 'Real Madrid', 'Barcelona', 'Bayern', 'PSG', 'Flamengo', 'Liverpool'];

interface ScanLine {
  id: string;
  text: string;
  timestamp: number;
}

export function AIScanner() {
  const [lines, setLines] = useState<ScanLine[]>([]);
  const [analyzing, setAnalyzing] = useState(0);

  useEffect(() => {
    const addLine = () => {
      const templates = [
        `Analyzing ${TEAMS[Math.floor(Math.random() * TEAMS.length)]} vs ${TEAMS[Math.floor(Math.random() * TEAMS.length)]}...`,
        `Scanning ${LEAGUES[Math.floor(Math.random() * LEAGUES.length)]} fixtures...`,
        `Evaluating ${MARKETS[Math.floor(Math.random() * MARKETS.length)]} market...`,
        `Processing live odds data (${Math.floor(Math.random() * 500) + 100} sources)...`,
        `AI Confidence: ${(85 + Math.random() * 12).toFixed(1)}% - Signal detected`,
        `Cross-validating with 20 specialists...`,
        `Statistical model convergence: ${(92 + Math.random() * 7).toFixed(1)}%`,
        `Pattern recognition: ${Math.floor(Math.random() * 15) + 5} opportunities found`,
      ];

      const newLine: ScanLine = {
        id: `line-${Date.now()}-${Math.random()}`,
        text: templates[Math.floor(Math.random() * templates.length)],
        timestamp: Date.now(),
      };

      setLines(prev => [newLine, ...prev].slice(0, 8));
    };

    const interval = setInterval(addLine, 1800);
    const analyzeInterval = setInterval(() => {
      setAnalyzing(prev => (prev + 1) % 4);
    }, 500);

    // Add initial lines and store timeout IDs for cleanup
    const initialTimeouts: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < 5; i++) {
      initialTimeouts.push(setTimeout(addLine, i * 400));
    }

    return () => {
      clearInterval(interval);
      clearInterval(analyzeInterval);
      initialTimeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  return (
    <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary animate-pulse" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wide">
            AI Scanner {'.'.repeat(analyzing)}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
          <span className="text-[9px] text-primary font-mono">LIVE</span>
        </div>
      </div>

      <div className="space-y-1.5 font-mono text-[10px] h-[180px] overflow-hidden">
        {lines.map((line, idx) => (
          <div
            key={line.id}
            className="text-primary/60 transition-all duration-300 animate-scan-in"
            style={{
              opacity: 1 - (idx * 0.12),
              transform: `translateY(${idx * 0}px)`,
            }}
          >
            <span className="text-primary/40">{'>'}</span> {line.text}
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-[#222] flex items-center justify-between text-[9px]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Database className="w-3 h-3 text-primary/60" />
            <span className="text-muted-foreground">{Math.floor(Math.random() * 200) + 1200} games</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-primary/60" />
            <span className="text-muted-foreground">{(Math.random() * 5 + 15).toFixed(1)}ms</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Activity className="w-3 h-3 text-primary" />
          <span className="text-primary font-semibold">Processing</span>
        </div>
      </div>
    </div>
  );
}
