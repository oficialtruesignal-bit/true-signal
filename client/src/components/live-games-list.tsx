import { useQuery } from "@tanstack/react-query";
import { footballService, FootballMatch } from "@/lib/football-service";
import { Clock, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function LiveGamesList() {
  const { data: games, isLoading, error } = useQuery({
    queryKey: ['live-games'],
    queryFn: footballService.getLiveFixtures,
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl bg-white/5" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        <span>Erro ao carregar jogos ao vivo. Tente novamente mais tarde.</span>
      </div>
    );
  }

  if (!games || games.length === 0) {
     return (
      <div className="p-8 text-center rounded-xl bg-card border border-primary/10">
        <p className="text-muted-foreground">Nenhum jogo ao vivo no momento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {games.map((match) => (
        <div key={match.fixture.id} className="bg-card border border-primary/10 hover:border-primary/30 transition-all p-4 rounded-xl flex items-center justify-between group">
          {/* Time Info */}
          <div className="flex flex-col items-center w-16 shrink-0">
            <span className="text-xs font-bold text-primary animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              {match.fixture.status.elapsed}'
            </span>
            <span className="text-[10px] text-muted-foreground uppercase">{match.fixture.status.short}</span>
          </div>

          {/* Teams & Score */}
          <div className="flex-1 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 justify-end text-right">
              <span className="font-display font-bold text-slate-900 dark:text-white hidden sm:block">{match.teams.home.name}</span>
              <span className="font-display font-bold text-slate-900 dark:text-white sm:hidden">{match.teams.home.name.substring(0, 3).toUpperCase()}</span>
              <img src={match.teams.home.logo} alt={match.teams.home.name} className="w-8 h-8 object-contain" />
            </div>

            <div className="px-4 flex flex-col items-center">
              <div className="bg-white/60 dark:bg-black/40 px-3 py-1 rounded border border-gray-200 dark:border-primary/20 font-mono text-xl font-bold text-primary tracking-widest shadow-[0_0_10px_rgba(51,184,100,0.1)]">
                {match.goals.home ?? 0} - {match.goals.away ?? 0}
              </div>
            </div>

            <div className="flex items-center gap-3 flex-1 justify-start text-left">
              <img src={match.teams.away.logo} alt={match.teams.away.name} className="w-8 h-8 object-contain" />
              <span className="font-display font-bold text-slate-900 dark:text-white hidden sm:block">{match.teams.away.name}</span>
              <span className="font-display font-bold text-slate-900 dark:text-white sm:hidden">{match.teams.away.name.substring(0, 3).toUpperCase()}</span>
            </div>
          </div>

          {/* Action */}
          <div className="w-auto flex justify-end pl-2 border-l border-white/5">
             <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
               <Clock className="w-4 h-4" />
             </button>
          </div>
        </div>
      ))}
    </div>
  );
}
