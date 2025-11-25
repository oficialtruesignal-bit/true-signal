import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { footballService, FootballMatch } from "@/lib/football-service";
import { useQuery } from "@tanstack/react-query";
import { X, Loader2, AlertCircle } from "lucide-react";
import { GameStats } from "@/components/game-stats";
import { mapFootballStatistics } from "@/lib/football-mapper";

interface MatchCenterModalProps {
  match: FootballMatch | null;
  open: boolean;
  onClose: () => void;
}

export function MatchCenterModal({ match, open, onClose }: MatchCenterModalProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['football-match-stats', match?.fixture.id],
    queryFn: () => footballService.getFixtureStatistics(match!.fixture.id),
    enabled: !!match && open,
    refetchInterval: 10000, // Atualiza a cada 10 segundos
    staleTime: 5000, // Considera dados obsoletos após 5 segundos
  });

  if (!match) return null;

  // Map API-Football stats to GameStats format (with team_id verification!)
  const mappedStats = stats ? mapFootballStatistics(stats, match) : {};
  
  console.log('🎯 Match Center - Estatísticas API-Football mapeadas:', {
    fixtureId: match.fixture.id,
    teams: `${match.teams.home.name} vs ${match.teams.away.name}`,
    teamIds: { home: match.teams.home.id, away: match.teams.away.id },
    mappedStats
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-primary/20 p-0">
        <DialogTitle className="sr-only">
          {match.teams.home.name} vs {match.teams.away.name}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Estatísticas detalhadas da partida {match.league.name}
        </DialogDescription>
        
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
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
              <img 
                src={match.teams.home.logo} 
                alt={match.teams.home.name} 
                className="w-10 h-10 flex-shrink-0 object-contain" 
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect fill="%23333" width="40" height="40"/></svg>';
                }}
              />
              <div className="text-right min-w-0">
                <div className="text-xs text-muted-foreground truncate max-w-[100px]" title={match.teams.home.name}>
                  {match.teams.home.name.length > 20 ? match.teams.home.name.substring(0, 20) + '...' : match.teams.home.name}
                </div>
                <div className="text-3xl font-display font-black text-white">{match.goals.home ?? 0}</div>
              </div>
            </div>

            <div className="flex flex-col items-center flex-shrink-0 px-4">
              <div className="text-sm text-primary font-bold">{match.fixture.status.elapsed}'</div>
              <div className="text-xs text-muted-foreground uppercase">{match.fixture.status.short}</div>
            </div>

            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="text-left min-w-0">
                <div className="text-xs text-muted-foreground truncate max-w-[100px]" title={match.teams.away.name}>
                  {match.teams.away.name.length > 20 ? match.teams.away.name.substring(0, 20) + '...' : match.teams.away.name}
                </div>
                <div className="text-3xl font-display font-black text-white">{match.goals.away ?? 0}</div>
              </div>
              <img 
                src={match.teams.away.logo} 
                alt={match.teams.away.name} 
                className="w-10 h-10 flex-shrink-0 object-contain" 
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect fill="%23333" width="40" height="40"/></svg>';
                }}
              />
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
            <div className="p-12 text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-primary/30" />
              <p className="text-muted-foreground text-sm font-medium">Dados indisponíveis no momento</p>
              <p className="text-xs text-muted-foreground/60 mt-2">
                As estatísticas serão carregadas quando disponibilizadas pela API
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
