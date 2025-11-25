import { Dialog, DialogContent } from "@/components/ui/dialog";
import { footballService, FootballMatch } from "@/lib/football-service";
import { useQuery } from "@tanstack/react-query";
import { X, Loader2, AlertCircle } from "lucide-react";
import { GameStats } from "@/components/game-stats";
import { mapFixtureStatistics } from "@/lib/stats-mapper";

interface MatchCenterModalProps {
  match: FootballMatch | null;
  open: boolean;
  onClose: () => void;
}

export function MatchCenterModal({ match, open, onClose }: MatchCenterModalProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['match-stats', match?.fixture.id],
    queryFn: () => footballService.getFixtureStatistics(match!.fixture.id),
    enabled: !!match && open,
    refetchInterval: 10000, // Atualiza a cada 10 segundos
    staleTime: 5000, // Considera dados obsoletos após 5 segundos
  });

  if (!match) return null;

  // Map API stats to GameStats format
  const mappedStats = stats ? mapFixtureStatistics(stats) : {};
  
  console.log('🎯 Match Center - Estatísticas mapeadas:', {
    fixtureId: match.fixture.id,
    teams: `${match.teams.home.name} vs ${match.teams.away.name}`,
    mappedStats
  });

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
            <GameStats
              homeTeam={{
                team: match.teams.home.name,
                logo: match.teams.home.logo,
              }}
              awayTeam={{
                team: match.teams.away.name,
                logo: match.teams.away.logo,
              }}
              statistics={mappedStats}
            />
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
