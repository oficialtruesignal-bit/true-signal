import { Flag, BarChart } from "lucide-react";
import { Card } from "./ui/card";
import { useLanguage } from "@/hooks/use-language";

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

const StatRow = ({ 
  label, 
  homeValue, 
  awayValue 
}: { 
  label: string; 
  homeValue: number; 
  awayValue: number; 
}) => {
  const total = homeValue + awayValue;
  if (total === 0) return null;
  
  const homePct = total === 0 ? 0 : (homeValue / total) * 100;
  const awayPct = total === 0 ? 0 : (awayValue / total) * 100;

  return (
    <div className="mb-5 w-full">
      {/* Linha de Títulos e Valores */}
      <div className="flex justify-between items-end mb-2 px-1">
        <span className="text-lg font-display font-bold text-[#33b864]">{homeValue}</span>
        <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">{label}</span>
        <span className="text-lg font-display font-bold text-white">{awayValue}</span>
      </div>

      {/* As Barras (Visualização Split) */}
      <div className="flex h-2 w-full bg-gray-800 rounded-full overflow-hidden">
        {/* Barra Home (Verde, cresce da esquerda) */}
        <div 
          style={{ width: `${homePct}%` }} 
          className="bg-[#33b864] h-full shadow-[0_0_10px_#33b864] transition-all duration-500"
        />
        {/* Espaço Vazio (Gap) */}
        <div className="w-1 h-full bg-black" />
        {/* Barra Away (Cinza, cresce da direita) */}
        <div 
          style={{ width: `${awayPct}%` }} 
          className="bg-gray-500 h-full transition-all duration-500"
        />
      </div>
    </div>
  );
};

export function GameStats({ homeTeam, awayTeam, statistics }: GameStatsProps) {
  const { t } = useLanguage();
  const stats = statistics;
  
  const hasAnyStats = Object.keys(stats).length > 0 && Object.values(stats).some(stat => stat !== null && stat !== undefined);
  
  if (!hasAnyStats) {
    return (
      <Card className="bg-[#0a0a0a] border-primary/20 p-12 text-center">
        <BarChart className="w-12 h-12 text-gray-800 mx-auto mb-4" />
        <p className="text-gray-400 text-sm font-medium">
          {t.matchCenter.noStats}
        </p>
      </Card>
    );
  }

  const homePossession = stats.possession?.home || 0;
  const awayPossession = stats.possession?.away || 0;

  return (
    <Card className="bg-[#0a0a0a] border-primary/20 p-6 space-y-6">
      {/* 1. CÍRCULO DE POSSE (CENTERED GAUGE) */}
      {stats.possession && (
        <div className="flex items-center justify-center gap-6 mb-6">
          {/* Lado Esquerdo (Home) */}
          <div className="text-right">
            <span className="text-2xl font-display font-bold text-[#33b864]">{homePossession}%</span>
            <p className="text-[10px] text-gray-500 uppercase">{t.matchCenter.home}</p>
          </div>

          {/* O Círculo (Centro) */}
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              {/* Fundo */}
              <path 
                className="text-gray-800" 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3" 
              />
              {/* Progresso (Home - Verde) */}
              <path 
                className="text-[#33b864] drop-shadow-[0_0_5px_rgba(51,184,100,0.5)]" 
                strokeDasharray={`${homePossession}, 100`} 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3" 
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold text-gray-400">{t.matchCenter.possession}</span>
            </div>
          </div>

          {/* Lado Direito (Away) */}
          <div className="text-left">
            <span className="text-2xl font-display font-bold text-white">{awayPossession}%</span>
            <p className="text-[10px] text-gray-500 uppercase">{t.matchCenter.away}</p>
          </div>
        </div>
      )}

      {/* 2. GRID DE EVENTOS (ESCANTEIOS/CARTÕES) */}
      {(stats.corners || stats.yellowCards || stats.redCards) && (
        <div className="grid grid-cols-3 divide-x divide-white/10 bg-[#121212] rounded-xl p-4 mb-6">
          {/* Escanteios */}
          {stats.corners && (
            <div className="flex flex-col items-center gap-2 px-4">
              <Flag className="w-5 h-5 text-[#33b864]" />
              <div className="text-sm font-display font-bold text-white">
                {stats.corners.home} - {stats.corners.away}
              </div>
              <span className="text-[10px] text-gray-500 uppercase font-bold">{t.matchCenter.corners}</span>
            </div>
          )}

          {/* Cartões Amarelos */}
          {stats.yellowCards && (
            <div className="flex flex-col items-center gap-2 px-4">
              <div className="w-3 h-4 bg-yellow-500 rounded-sm" />
              <div className="text-sm font-display font-bold text-white">
                {stats.yellowCards.home} - {stats.yellowCards.away}
              </div>
              <span className="text-[10px] text-gray-500 uppercase font-bold">{t.matchCenter.yellowCards}</span>
            </div>
          )}

          {/* Cartões Vermelhos */}
          {stats.redCards && (
            <div className="flex flex-col items-center gap-2 px-4">
              <div className="w-3 h-4 bg-red-500 rounded-sm" />
              <div className="text-sm font-display font-bold text-white">
                {stats.redCards.home} - {stats.redCards.away}
              </div>
              <span className="text-[10px] text-gray-500 uppercase font-bold">{t.matchCenter.redCards}</span>
            </div>
          )}
        </div>
      )}

      {/* 3. BARRAS DE ESTATÍSTICAS (ALINHAMENTO PERFEITO) */}
      <div className="space-y-4 pt-4">
        {/* Chutes no Gol */}
        {stats.shotsOnGoal && (
          <StatRow 
            label={t.matchCenter.shotsOnGoal} 
            homeValue={stats.shotsOnGoal.home} 
            awayValue={stats.shotsOnGoal.away} 
          />
        )}

        {/* Chutes Totais */}
        {stats.shotsTotal && (
          <StatRow 
            label={t.matchCenter.shotsTotal} 
            homeValue={stats.shotsTotal.home} 
            awayValue={stats.shotsTotal.away} 
          />
        )}

        {/* Ataques */}
        {stats.attacks && (
          <StatRow 
            label={t.matchCenter.attacks} 
            homeValue={stats.attacks.home} 
            awayValue={stats.attacks.away} 
          />
        )}

        {/* Ataques Perigosos */}
        {stats.dangerousAttacks && (
          <StatRow 
            label={t.matchCenter.dangerousAttacks} 
            homeValue={stats.dangerousAttacks.home} 
            awayValue={stats.dangerousAttacks.away} 
          />
        )}

        {/* Passes Chave */}
        {stats.keyPasses && (
          <StatRow 
            label={t.matchCenter.keyPasses} 
            homeValue={stats.keyPasses.home} 
            awayValue={stats.keyPasses.away} 
          />
        )}

        {/* Defesas do Goleiro */}
        {stats.saves && (
          <StatRow 
            label={t.matchCenter.saves} 
            homeValue={stats.saves.home} 
            awayValue={stats.saves.away} 
          />
        )}

        {/* Precisão de Passes */}
        {stats.passAccuracy && (
          <StatRow 
            label={t.matchCenter.passAccuracy} 
            homeValue={stats.passAccuracy.home} 
            awayValue={stats.passAccuracy.away} 
          />
        )}
      </div>
    </Card>
  );
}
