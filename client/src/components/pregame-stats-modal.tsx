import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { footballService, FootballMatch, PregameInsights, TeamAverages } from "@/lib/football-service";
import { useQuery } from "@tanstack/react-query";
import { X, Target, AlertTriangle, Loader2, CornerUpRight, Square } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PregameStatsModalProps {
  match: FootballMatch | null;
  open: boolean;
  onClose: () => void;
}

function StatCompare({ 
  label, 
  homeValue, 
  awayValue,
  icon: Icon,
}: { 
  label: string; 
  homeValue: string | number; 
  awayValue: string | number;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const homeNum = typeof homeValue === 'string' ? parseFloat(homeValue) : homeValue;
  const awayNum = typeof awayValue === 'string' ? parseFloat(awayValue) : awayValue;
  const homeWins = homeNum > awayNum;
  const awayWins = awayNum > homeNum;
  
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
      <span className={`text-base font-bold ${homeWins ? 'text-[#33b864]' : 'text-white'}`}>
        {homeValue}
      </span>
      <div className="flex items-center gap-2 text-gray-400">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <span className={`text-base font-bold ${awayWins ? 'text-[#33b864]' : 'text-white'}`}>
        {awayValue}
      </span>
    </div>
  );
}

function StatsSection({ 
  title, 
  homeAverages, 
  awayAverages,
  matchCount,
}: { 
  title: string; 
  homeAverages: TeamAverages | null; 
  awayAverages: TeamAverages | null;
  matchCount?: string;
}) {
  if (!homeAverages || !awayAverages) {
    return (
      <div className="bg-[#121212] rounded-xl p-4 border border-white/5">
        <div className="text-center mb-3">
          <span className="text-xs text-primary font-bold uppercase tracking-wider">{title}</span>
        </div>
        <p className="text-center text-gray-500 text-sm py-4">Dados insuficientes</p>
      </div>
    );
  }

  return (
    <div className="bg-[#121212] rounded-xl p-4 border border-white/5">
      <div className="text-center mb-3">
        <span className="text-xs text-primary font-bold uppercase tracking-wider">{title}</span>
        {matchCount && <span className="text-[10px] text-gray-500 ml-2">({matchCount})</span>}
      </div>
      <StatCompare 
        label="Gols Marcados" 
        homeValue={homeAverages.goalsFor} 
        awayValue={awayAverages.goalsFor}
        icon={Target}
      />
      <StatCompare 
        label="Gols Sofridos" 
        homeValue={homeAverages.goalsAgainst} 
        awayValue={awayAverages.goalsAgainst}
      />
      <StatCompare 
        label="Escanteios" 
        homeValue={homeAverages.corners} 
        awayValue={awayAverages.corners}
        icon={CornerUpRight}
      />
      <StatCompare 
        label="Cartões Amarelos" 
        homeValue={homeAverages.yellowCards} 
        awayValue={awayAverages.yellowCards}
        icon={Square}
      />
      <StatCompare 
        label="Cartões Vermelhos" 
        homeValue={homeAverages.redCards} 
        awayValue={awayAverages.redCards}
      />
    </div>
  );
}

export function PregameStatsModal({ match, open, onClose }: PregameStatsModalProps) {
  const { data: insights, isLoading } = useQuery({
    queryKey: ['pregame-insights', match?.teams.home.id, match?.teams.away.id, match?.league.id, match?.league.season],
    queryFn: () => footballService.getPregameInsights(
      match!.teams.home.id, 
      match!.teams.away.id, 
      match!.league.id, 
      match!.league.season
    ),
    enabled: open && !!match,
    staleTime: 5 * 60 * 1000,
  });

  if (!match) return null;

  const hasData = insights?.recentForm?.home?.averages || insights?.recentForm?.away?.averages;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border-primary/20 p-0">
        <DialogTitle className="sr-only">
          {match.teams.home.name} vs {match.teams.away.name}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Estatísticas dos últimos jogos e confrontos diretos
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
            </div>
          </div>
        </div>

        {/* Stats Content */}
        <div className="p-5 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
              <p className="text-gray-400 text-sm">Carregando estatísticas...</p>
            </div>
          ) : !hasData ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Estatísticas indisponíveis para esta partida</p>
            </div>
          ) : (
            <>
              {/* Last 5 Matches */}
              <StatsSection 
                title="Últimos 5 jogos" 
                homeAverages={insights?.recentForm?.home?.averages || null}
                awayAverages={insights?.recentForm?.away?.averages || null}
                matchCount={`média por jogo`}
              />

              {/* H2H - Last 3 Matches */}
              <StatsSection 
                title="Últimos 3 confrontos diretos" 
                homeAverages={insights?.headToHead?.home?.averages || null}
                awayAverages={insights?.headToHead?.away?.averages || null}
                matchCount={`H2H`}
              />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
