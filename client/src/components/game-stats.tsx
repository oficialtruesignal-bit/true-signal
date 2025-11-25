import { Flag } from "lucide-react";
import { Card } from "./ui/card";

interface TeamStats {
  team: string;
  logo?: string;
}

interface GameStatsProps {
  homeTeam: TeamStats;
  awayTeam: TeamStats;
  statistics: {
    xg?: { home: number; away: number };
    attacks?: { home: number; away: number };
    dangerousAttacks?: { home: number; away: number };
    possession?: { home: number; away: number };
    corners?: { home: number; away: number };
    yellowCards?: { home: number; away: number };
    redCards?: { home: number; away: number };
    shotsTotal?: { home: number; away: number };
    shotsOnGoal?: { home: number; away: number };
    keyPasses?: { home: number; away: number };
    saves?: { home: number; away: number };
    passAccuracy?: { home: number; away: number };
  };
}

function CircularProgress({ 
  value, 
  max, 
  size = 80, 
  strokeWidth = 8 
}: { 
  value: number; 
  max: number; 
  size?: number; 
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Guard against division by zero
  const safeMax = max > 0 ? max : 1;
  const progress = (value / safeMax) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#333"
        strokeWidth={strokeWidth}
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#33b864"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
    </svg>
  );
}

function LinearBar({ 
  homeValue, 
  awayValue, 
  label 
}: { 
  homeValue: number; 
  awayValue: number; 
  label: string;
}) {
  const total = homeValue + awayValue;
  const homePercent = total > 0 ? (homeValue / total) * 100 : 50;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{homeValue}</span>
        <span className="text-white font-medium">{label}</span>
        <span>{awayValue}</span>
      </div>
      <div className="h-2 bg-[#333] rounded-full overflow-hidden flex">
        <div 
          className="bg-primary transition-all duration-500" 
          style={{ width: `${homePercent}%` }}
        />
        <div 
          className="bg-primary/40 transition-all duration-500" 
          style={{ width: `${100 - homePercent}%` }}
        />
      </div>
    </div>
  );
}

export function GameStats({ homeTeam, awayTeam, statistics }: GameStatsProps) {
  const stats = statistics;

  return (
    <Card className="bg-[#0a0a0a] border-primary/20 p-6 space-y-6">
      {/* xG Header */}
      {stats.xg && (
        <div className="text-center pb-4 border-b border-primary/10">
          <div className="flex items-center justify-center gap-4 text-lg font-bold">
            <span className="text-primary">{stats.xg.home.toFixed(2)} xG</span>
            <span className="text-muted-foreground">-</span>
            <span className="text-primary/70">{stats.xg.away.toFixed(2)} xG</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Expected Goals</p>
        </div>
      )}

      {/* Circular Progress Section */}
      <div className="grid grid-cols-3 gap-4 py-4">
        {/* Attacks */}
        {stats.attacks && (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center gap-3">
              <span className="text-lg font-bold text-primary w-8 text-right">{stats.attacks.home}</span>
              <div className="relative">
                <CircularProgress 
                  value={stats.attacks.home} 
                  max={stats.attacks.home + stats.attacks.away}
                  size={70}
                  strokeWidth={6}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {stats.attacks.home + stats.attacks.away > 0 
                      ? Math.round((stats.attacks.home / (stats.attacks.home + stats.attacks.away)) * 100) 
                      : 50}%
                  </span>
                </div>
              </div>
              <span className="text-lg font-bold text-primary/60 w-8 text-left">{stats.attacks.away}</span>
            </div>
            <span className="text-xs text-muted-foreground">Ataques</span>
          </div>
        )}

        {/* Dangerous Attacks */}
        {stats.dangerousAttacks && (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center gap-3">
              <span className="text-lg font-bold text-primary w-8 text-right">{stats.dangerousAttacks.home}</span>
              <div className="relative">
                <CircularProgress 
                  value={stats.dangerousAttacks.home} 
                  max={stats.dangerousAttacks.home + stats.dangerousAttacks.away}
                  size={70}
                  strokeWidth={6}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {stats.dangerousAttacks.home + stats.dangerousAttacks.away > 0 
                      ? Math.round((stats.dangerousAttacks.home / (stats.dangerousAttacks.home + stats.dangerousAttacks.away)) * 100) 
                      : 50}%
                  </span>
                </div>
              </div>
              <span className="text-lg font-bold text-primary/60 w-8 text-left">{stats.dangerousAttacks.away}</span>
            </div>
            <span className="text-xs text-muted-foreground">Perigosos</span>
          </div>
        )}

        {/* Possession */}
        {stats.possession && (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center gap-3">
              <span className="text-lg font-bold text-primary w-12 text-right">{stats.possession.home}%</span>
              <div className="relative">
                <CircularProgress 
                  value={stats.possession.home} 
                  max={100}
                  size={70}
                  strokeWidth={6}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{stats.possession.home}%</span>
                </div>
              </div>
              <span className="text-lg font-bold text-primary/60 w-12 text-left">{stats.possession.away}%</span>
            </div>
            <span className="text-xs text-muted-foreground">Posse</span>
          </div>
        )}
      </div>

      {/* Events Row (Corners, Cards) */}
      <div className="flex items-center justify-around py-4 border-y border-primary/10">
        {/* Corners */}
        {stats.corners && (
          <div className="flex flex-col items-center gap-2">
            <Flag className="w-5 h-5 text-primary" />
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-white">{stats.corners.home}</span>
              <span className="text-xs text-muted-foreground">-</span>
              <span className="text-sm font-bold text-white">{stats.corners.away}</span>
            </div>
            <span className="text-xs text-muted-foreground">Escanteios</span>
          </div>
        )}

        {/* Yellow Cards */}
        {stats.yellowCards && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-3 h-4 bg-yellow-500 rounded-sm"></div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-white">{stats.yellowCards.home}</span>
              <span className="text-xs text-muted-foreground">-</span>
              <span className="text-sm font-bold text-white">{stats.yellowCards.away}</span>
            </div>
            <span className="text-xs text-muted-foreground">Amarelos</span>
          </div>
        )}

        {/* Red Cards */}
        {stats.redCards && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-3 h-4 bg-red-500 rounded-sm"></div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-white">{stats.redCards.home}</span>
              <span className="text-xs text-muted-foreground">-</span>
              <span className="text-sm font-bold text-white">{stats.redCards.away}</span>
            </div>
            <span className="text-xs text-muted-foreground">Vermelhos</span>
          </div>
        )}
      </div>

      {/* Shots Section */}
      {stats.shotsTotal && stats.shotsOnGoal && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-white">
              {stats.shotsTotal.home}/{stats.shotsOnGoal.home}
            </span>
            <span className="text-xs text-muted-foreground">Finalizações (Total / No Gol)</span>
            <span className="text-sm font-bold text-white">
              {stats.shotsTotal.away}/{stats.shotsOnGoal.away}
            </span>
          </div>
          <LinearBar 
            homeValue={stats.shotsOnGoal.home} 
            awayValue={stats.shotsOnGoal.away} 
            label="Chutes no Gol"
          />
        </div>
      )}

      {/* Skill Bars */}
      <div className="space-y-4 pt-4">
        {stats.keyPasses && (
          <LinearBar 
            homeValue={stats.keyPasses.home} 
            awayValue={stats.keyPasses.away} 
            label="Passes Chave"
          />
        )}
        
        {stats.saves && (
          <LinearBar 
            homeValue={stats.saves.home} 
            awayValue={stats.saves.away} 
            label="Defesas do Goleiro"
          />
        )}
        
        {stats.passAccuracy && (
          <LinearBar 
            homeValue={stats.passAccuracy.home} 
            awayValue={stats.passAccuracy.away} 
            label="Precisão de Passes (%)"
          />
        )}
      </div>
    </Card>
  );
}
