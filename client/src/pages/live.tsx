import { Layout } from "@/components/layout";
import { footballService, FootballMatch } from "@/lib/football-service";
import { useQuery } from "@tanstack/react-query";
import { Play, AlertCircle, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useState } from "react";
import { MatchCenterModal } from "@/components/match-center-modal";

export default function LivePage() {
  const [selectedMatch, setSelectedMatch] = useState<FootballMatch | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: liveGames = [], isLoading, error } = useQuery({
    queryKey: ['live-games'],
    queryFn: footballService.getLiveFixtures,
    refetchInterval: 60000, // Refresh every minute
  });

  const handleMatchClick = (match: FootballMatch) => {
    setSelectedMatch(match);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMatch(null);
  };

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Play className="w-5 h-5 text-red-500 animate-pulse" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Ao Vivo</h1>
        </div>
        <p className="text-muted-foreground">
          Acompanhe os jogos em tempo real • Clique para ver estatísticas
        </p>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl bg-white/5" />
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>Erro ao carregar jogos ao vivo. Tente novamente mais tarde.</span>
        </div>
      )}

      {!isLoading && !error && liveGames.length === 0 && (
        <div className="p-12 text-center rounded-xl bg-card border border-primary/10">
          <Play className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground">Nenhum jogo ao vivo no momento.</p>
        </div>
      )}

      {!isLoading && !error && liveGames.length > 0 && (
        <div className="space-y-4">
          {liveGames.map((match) => (
            <button
              key={match.fixture.id}
              onClick={() => handleMatchClick(match)}
              data-testid={`match-live-${match.fixture.id}`}
              className="w-full bg-card border border-primary/10 hover:border-primary/30 transition-all p-5 rounded-xl group cursor-pointer text-left"
            >
              {/* League & Time */}
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-primary/70">{match.league.name}</span>
                <span className="text-xs font-bold text-red-500 animate-pulse flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  {match.fixture.status.elapsed}'
                </span>
              </div>

              {/* Teams & Score */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <img src={match.teams.home.logo} alt={match.teams.home.name} className="w-10 h-10 object-contain" />
                  <span className="font-display font-bold text-white">{match.teams.home.name}</span>
                </div>

                <div className="px-6 flex items-center gap-3">
                  <span className="text-3xl font-display font-black text-white">{match.goals.home ?? 0}</span>
                  <span className="text-lg text-muted-foreground">:</span>
                  <span className="text-3xl font-display font-black text-white">{match.goals.away ?? 0}</span>
                </div>

                <div className="flex items-center gap-3 flex-1 justify-end">
                  <span className="font-display font-bold text-white text-right">{match.teams.away.name}</span>
                  <img src={match.teams.away.logo} alt={match.teams.away.name} className="w-10 h-10 object-contain" />
                </div>
              </div>

              {/* View Stats Hint */}
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                <TrendingUp className="w-3 h-3" />
                <span>Clique para ver estatísticas detalhadas</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Match Center Modal */}
      <MatchCenterModal
        match={selectedMatch}
        open={isModalOpen}
        onClose={handleCloseModal}
      />
    </Layout>
  );
}
