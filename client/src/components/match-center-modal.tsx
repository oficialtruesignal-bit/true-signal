import { Dialog, DialogContent } from "@/components/ui/dialog";
import { footballService, FootballMatch, FixtureStatistics } from "@/lib/football-service";
import { useQuery } from "@tanstack/react-query";
import { X, Loader2, AlertCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface MatchCenterModalProps {
  match: FootballMatch | null;
  open: boolean;
  onClose: () => void;
}

export function MatchCenterModal({ match, open, onClose }: MatchCenterModalProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['match-stats', match?.fixture.id],
    queryFn: () => footballService.getFixtureStatistics(match!.fixture.id),
    enabled: !!match,
  });

  if (!match) return null;

  const homeStats = stats?.[0]?.statistics || [];
  const awayStats = stats?.[1]?.statistics || [];

  // Helper to get stat value
  const getStat = (stats: any[], type: string): number => {
    const stat = stats.find(s => s.type === type);
    const value = stat?.value;
    if (typeof value === 'string') {
      return parseInt(value.replace('%', '')) || 0;
    }
    return Number(value) || 0;
  };

  // Data for circular charts
  const possession = {
    home: getStat(homeStats, 'Ball Possession'),
    away: getStat(awayStats, 'Ball Possession'),
  };

  const shotsOnGoal = {
    home: getStat(homeStats, 'Shots on Goal'),
    away: getStat(awayStats, 'Shots on Goal'),
  };

  const totalShots = {
    home: getStat(homeStats, 'Total Shots'),
    away: getStat(awayStats, 'Total Shots'),
  };

  const corners = {
    home: getStat(homeStats, 'Corner Kicks'),
    away: getStat(awayStats, 'Corner Kicks'),
  };

  const yellowCards = {
    home: getStat(homeStats, 'Yellow Cards'),
    away: getStat(awayStats, 'Yellow Cards'),
  };

  const redCards = {
    home: getStat(homeStats, 'Red Cards'),
    away: getStat(awayStats, 'Red Cards'),
  };

  // Circular Progress Chart Component
  const CircularStat = ({ home, away, label }: { home: number; away: number; label: string }) => {
    const total = home + away || 1;
    const homePercent = (home / total) * 100;
    const awayPercent = (away / total) * 100;

    const data = [
      { value: home, color: '#33b864' },
      { value: away, color: '#374151' },
    ];

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={28}
                outerRadius={38}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-xl font-display font-bold text-white">{home}</div>
            <div className="text-[10px] text-muted-foreground">vs</div>
            <div className="text-xl font-display font-bold text-muted-foreground">{away}</div>
          </div>
        </div>
        <div className="text-xs text-center text-muted-foreground mt-2 font-medium">{label}</div>
      </div>
    );
  };

  // Heatmap Component (Simplified Field Zones)
  const Heatmap = () => {
    // Calculate ball possession zones (mock logic based on passes)
    const homePassAccuracy = getStat(homeStats, 'Passes %');
    const awayPassAccuracy = getStat(awayStats, 'Passes %');
    
    const defensiveZone = possession.home > possession.away ? 35 : 25;
    const middleZone = 45;
    const attackZone = possession.home > possession.away ? 20 : 30;

    return (
      <div className="mt-6">
        <h4 className="text-xs font-bold text-white mb-3 text-center">Mapa de Ação (Zonas)</h4>
        <div className="bg-gradient-to-b from-green-900/20 to-green-950/20 border border-white/10 rounded-lg p-4">
          <svg viewBox="0 0 300 200" className="w-full h-auto">
            {/* Field Background */}
            <rect x="0" y="0" width="300" height="200" fill="#0a2e0a" />
            
            {/* Zones */}
            <rect x="0" y="0" width="100" height="200" fill={`rgba(51, 184, 100, ${defensiveZone / 100})`} />
            <rect x="100" y="0" width="100" height="200" fill={`rgba(51, 184, 100, ${middleZone / 100})`} />
            <rect x="200" y="0" width="100" height="200" fill={`rgba(51, 184, 100, ${attackZone / 100})`} />
            
            {/* Zone Lines */}
            <line x1="100" y1="0" x2="100" y2="200" stroke="white" strokeWidth="1" opacity="0.3" />
            <line x1="200" y1="0" x2="200" y2="200" stroke="white" strokeWidth="1" opacity="0.3" />
            
            {/* Labels */}
            <text x="50" y="100" fill="white" fontSize="10" textAnchor="middle" opacity="0.7">DEF</text>
            <text x="150" y="100" fill="white" fontSize="10" textAnchor="middle" opacity="0.7">MEIO</text>
            <text x="250" y="100" fill="white" fontSize="10" textAnchor="middle" opacity="0.7">ATK</text>
            
            {/* Percentages */}
            <text x="50" y="115" fill="white" fontSize="12" textAnchor="middle" fontWeight="bold">{defensiveZone}%</text>
            <text x="150" y="115" fill="white" fontSize="12" textAnchor="middle" fontWeight="bold">{middleZone}%</text>
            <text x="250" y="115" fill="white" fontSize="12" textAnchor="middle" fontWeight="bold">{attackZone}%</text>
          </svg>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-primary/20 p-0">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-primary/20 p-6 z-10">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-muted-foreground hover:text-white"
            data-testid="button-close-modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Score */}
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-3">
              <img src={match.teams.home.logo} alt={match.teams.home.name} className="w-12 h-12" />
              <div className="text-right">
                <div className="text-sm text-muted-foreground">{match.teams.home.name}</div>
                <div className="text-4xl font-display font-black text-white">{match.goals.home ?? 0}</div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="text-sm text-primary font-bold">{match.fixture.status.elapsed}'</div>
              <div className="text-xs text-muted-foreground">{match.fixture.status.short}</div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-left">
                <div className="text-sm text-muted-foreground">{match.teams.away.name}</div>
                <div className="text-4xl font-display font-black text-white">{match.goals.away ?? 0}</div>
              </div>
              <img src={match.teams.away.logo} alt={match.teams.away.name} className="w-12 h-12" />
            </div>
          </div>

          <div className="text-center mt-2 text-xs text-muted-foreground">{match.league.name}</div>
        </div>

        {/* Stats Content */}
        <div className="p-6">
          {isLoading && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {!isLoading && stats && (
            <>
              {/* Circular Stats */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-white mb-4 text-center">Stats Pressure</h3>
                <div className="grid grid-cols-3 gap-4">
                  <CircularStat home={totalShots.home} away={totalShots.away} label="Total Ataques" />
                  <CircularStat home={shotsOnGoal.home} away={shotsOnGoal.away} label="Chutes no Gol" />
                  <CircularStat home={possession.home} away={possession.away} label="Posse (%)" />
                </div>
              </div>

              {/* Cards & Corners */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-card border border-yellow-500/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-3 h-4 bg-yellow-500 rounded-sm"></div>
                    <span className="text-xs font-bold text-white">Amarelos</span>
                    <div className="w-3 h-4 bg-yellow-500 rounded-sm"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-display font-bold text-white">{yellowCards.home}</span>
                    <span className="text-xs text-muted-foreground">vs</span>
                    <span className="text-2xl font-display font-bold text-white">{yellowCards.away}</span>
                  </div>
                </div>

                <div className="bg-card border border-red-500/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-3 h-4 bg-red-500 rounded-sm"></div>
                    <span className="text-xs font-bold text-white">Vermelhos</span>
                    <div className="w-3 h-4 bg-red-500 rounded-sm"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-display font-bold text-white">{redCards.home}</span>
                    <span className="text-xs text-muted-foreground">vs</span>
                    <span className="text-2xl font-display font-bold text-white">{redCards.away}</span>
                  </div>
                </div>

                <div className="bg-card border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-xs font-bold text-white">Escanteios</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-display font-bold text-primary">{corners.home}</span>
                    <span className="text-xs text-muted-foreground">vs</span>
                    <span className="text-2xl font-display font-bold text-primary">{corners.away}</span>
                  </div>
                </div>
              </div>

              {/* Heatmap */}
              <Heatmap />
            </>
          )}

          {!isLoading && !stats && (
            <div className="p-8 text-center text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Estatísticas não disponíveis para este jogo.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
