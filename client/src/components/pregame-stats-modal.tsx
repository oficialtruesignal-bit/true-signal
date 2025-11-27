import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { footballService, FootballMatch, TeamSeasonStats } from "@/lib/football-service";
import { useQueries } from "@tanstack/react-query";
import { X, Trophy, Target, AlertTriangle, TrendingUp, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PregameStatsModalProps {
  match: FootballMatch | null;
  open: boolean;
  onClose: () => void;
}

function countCards(cards: Record<string, { total: number | null; percentage: string | null }>): number {
  return Object.values(cards).reduce((sum, card) => sum + (card.total || 0), 0);
}

function StatCompare({ 
  label, 
  homeValue, 
  awayValue,
  icon: Icon,
  suffix = ""
}: { 
  label: string; 
  homeValue: string | number; 
  awayValue: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  suffix?: string;
}) {
  const homeNum = typeof homeValue === 'string' ? parseFloat(homeValue) : homeValue;
  const awayNum = typeof awayValue === 'string' ? parseFloat(awayValue) : awayValue;
  const homeWins = homeNum > awayNum;
  const awayWins = awayNum > homeNum;
  
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <span className={`text-lg font-bold ${homeWins ? 'text-[#33b864]' : 'text-white'}`}>
        {homeValue}{suffix}
      </span>
      <div className="flex items-center gap-2 text-gray-400">
        {Icon && <Icon className="w-4 h-4" />}
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <span className={`text-lg font-bold ${awayWins ? 'text-[#33b864]' : 'text-white'}`}>
        {awayValue}{suffix}
      </span>
    </div>
  );
}

function FormBadge({ form }: { form: string }) {
  if (!form) return null;
  
  const lastFive = form.slice(0, 5).split('');
  
  return (
    <div className="flex gap-1">
      {lastFive.map((result, i) => (
        <span
          key={i}
          className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center ${
            result === 'W' ? 'bg-[#33b864] text-black' :
            result === 'D' ? 'bg-gray-500 text-white' :
            'bg-red-500 text-white'
          }`}
        >
          {result === 'W' ? 'V' : result === 'D' ? 'E' : 'D'}
        </span>
      ))}
    </div>
  );
}

export function PregameStatsModal({ match, open, onClose }: PregameStatsModalProps) {
  const queries = useQueries({
    queries: match ? [
      {
        queryKey: ['team-stats', match.teams.home.id, match.league.id, match.league.season],
        queryFn: () => footballService.getTeamStatistics(match.teams.home.id, match.league.id, match.league.season),
        enabled: open && !!match,
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ['team-stats', match.teams.away.id, match.league.id, match.league.season],
        queryFn: () => footballService.getTeamStatistics(match.teams.away.id, match.league.id, match.league.season),
        enabled: open && !!match,
        staleTime: 5 * 60 * 1000,
      }
    ] : []
  });

  if (!match) return null;

  const isLoading = queries.some(q => q.isLoading);
  const homeStats = queries[0]?.data as TeamSeasonStats | null;
  const awayStats = queries[1]?.data as TeamSeasonStats | null;

  const homeYellowCards = homeStats?.cards?.yellow ? countCards(homeStats.cards.yellow) : 0;
  const awayYellowCards = awayStats?.cards?.yellow ? countCards(awayStats.cards.yellow) : 0;
  const homeRedCards = homeStats?.cards?.red ? countCards(homeStats.cards.red) : 0;
  const awayRedCards = awayStats?.cards?.red ? countCards(awayStats.cards.red) : 0;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border-primary/20 p-0">
        <DialogTitle className="sr-only">
          {match.teams.home.name} vs {match.teams.away.name}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Estatísticas da temporada para {match.league.name}
        </DialogDescription>
        
        {/* Header */}
        <div className="sticky top-0 bg-[#121212] border-b border-primary/20 p-5 z-10">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-muted-foreground hover:text-white"
            data-testid="button-close-pregame-modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Match Info */}
          <div className="text-center mb-4">
            <span className="text-xs text-primary font-bold uppercase">{match.league.name}</span>
            <div className="text-xs text-gray-500 mt-1">
              {format(new Date(match.fixture.date), "EEEE, dd 'de' MMMM • HH:mm", { locale: ptBR })}
            </div>
          </div>

          {/* Teams */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center gap-2 flex-1">
              <img 
                src={match.teams.home.logo} 
                alt={match.teams.home.name} 
                className="w-14 h-14 object-contain"
              />
              <span className="text-sm font-bold text-white text-center max-w-[100px] truncate">
                {match.teams.home.name}
              </span>
              {homeStats?.form && <FormBadge form={homeStats.form} />}
            </div>

            <div className="px-4">
              <span className="text-2xl font-black text-gray-600">VS</span>
            </div>

            <div className="flex flex-col items-center gap-2 flex-1">
              <img 
                src={match.teams.away.logo} 
                alt={match.teams.away.name} 
                className="w-14 h-14 object-contain"
              />
              <span className="text-sm font-bold text-white text-center max-w-[100px] truncate">
                {match.teams.away.name}
              </span>
              {awayStats?.form && <FormBadge form={awayStats.form} />}
            </div>
          </div>
        </div>

        {/* Stats Content */}
        <div className="p-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
              <p className="text-gray-400 text-sm">Carregando estatísticas...</p>
            </div>
          ) : (!homeStats || !awayStats) ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Estatísticas indisponíveis para esta partida</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Season Stats Title */}
              <div className="text-center">
                <h3 className="text-sm font-bold text-primary uppercase tracking-wider">
                  Estatísticas da Temporada {match.league.season}
                </h3>
              </div>

              {/* Stats Grid */}
              <div className="bg-[#121212] rounded-xl p-4 border border-white/5">
                <StatCompare 
                  label="Vitórias" 
                  homeValue={homeStats.fixtures?.wins?.total || 0} 
                  awayValue={awayStats.fixtures?.wins?.total || 0}
                  icon={Trophy}
                />
                <StatCompare 
                  label="Jogos" 
                  homeValue={homeStats.fixtures?.played?.total || 0} 
                  awayValue={awayStats.fixtures?.played?.total || 0}
                />
                <StatCompare 
                  label="Média Gols" 
                  homeValue={homeStats.goals?.for?.average?.total || "0"} 
                  awayValue={awayStats.goals?.for?.average?.total || "0"}
                  icon={Target}
                />
                <StatCompare 
                  label="Gols Marcados" 
                  homeValue={homeStats.goals?.for?.total?.total || 0} 
                  awayValue={awayStats.goals?.for?.total?.total || 0}
                />
                <StatCompare 
                  label="Gols Sofridos" 
                  homeValue={homeStats.goals?.against?.total?.total || 0} 
                  awayValue={awayStats.goals?.against?.total?.total || 0}
                />
                <StatCompare 
                  label="Cartões Amarelos" 
                  homeValue={homeYellowCards} 
                  awayValue={awayYellowCards}
                  icon={AlertTriangle}
                />
                <StatCompare 
                  label="Cartões Vermelhos" 
                  homeValue={homeRedCards} 
                  awayValue={awayRedCards}
                />
              </div>

              {/* Win Rate */}
              <div className="bg-[#121212] rounded-xl p-4 border border-white/5">
                <div className="text-center mb-3">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Taxa de Vitória</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <span className="text-3xl font-black text-[#33b864]">
                      {homeStats.fixtures?.played?.total 
                        ? Math.round((homeStats.fixtures.wins.total / homeStats.fixtures.played.total) * 100) 
                        : 0}%
                    </span>
                  </div>
                  <div className="w-px h-12 bg-white/10" />
                  <div className="text-center flex-1">
                    <span className="text-3xl font-black text-white">
                      {awayStats.fixtures?.played?.total 
                        ? Math.round((awayStats.fixtures.wins.total / awayStats.fixtures.played.total) * 100) 
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
