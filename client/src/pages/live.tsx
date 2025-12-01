import { Layout } from "@/components/layout";
import { footballService, FootballMatch } from "@/lib/football-service";
import { useQuery } from "@tanstack/react-query";
import { Play, AlertCircle, TrendingUp, Search, X, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useState, useMemo } from "react";
import { MatchCenterModal } from "@/components/match-center-modal";
import { useLanguage } from "@/hooks/use-language";

export default function LivePage() {
  const { t } = useLanguage();
  const [selectedMatch, setSelectedMatch] = useState<FootballMatch | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { data: liveGames = [], isLoading, error } = useQuery({
    queryKey: ['football-live-games'],
    queryFn: footballService.getLiveFixtures,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleMatchClick = (match: FootballMatch) => {
    setSelectedMatch(match);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMatch(null);
  };

  // Filtrar jogos baseado na pesquisa
  const filteredGames = useMemo(() => {
    if (!searchQuery.trim()) return liveGames;
    
    const query = searchQuery.toLowerCase();
    return liveGames.filter((match) => 
      match.teams.home.name.toLowerCase().includes(query) ||
      match.teams.away.name.toLowerCase().includes(query) ||
      match.league.name.toLowerCase().includes(query)
    );
  }, [liveGames, searchQuery]);

  return (
    <Layout>
      {/* Back Button */}
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 group"
        data-testid="button-back"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm">Voltar</span>
      </button>

      <div className="mb-8">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Play className="w-5 h-5 text-red-500 animate-pulse" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white">{t.live.title}</h1>
          </div>
          
          {/* Search Toggle */}
          <button
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              if (isSearchOpen) setSearchQuery("");
            }}
            className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 hover:border-primary/40 flex items-center justify-center transition-colors"
            data-testid="button-search-toggle"
          >
            {isSearchOpen ? (
              <X className="w-5 h-5 text-primary" />
            ) : (
              <Search className="w-5 h-5 text-primary" />
            )}
          </button>
        </div>

        {/* Search Input */}
        {isSearchOpen && (
          <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.live.searchPlaceholder}
              className="w-full px-4 py-3 bg-card border border-primary/20 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              data-testid="input-search-teams"
              autoFocus
            />
          </div>
        )}
        
        <p className="text-muted-foreground">
          {t.live.subtitle}
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
          <span>{t.live.error}</span>
        </div>
      )}

      {!isLoading && !error && liveGames.length === 0 && (
        <div className="p-12 text-center rounded-xl bg-card border border-primary/10">
          <Play className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground">{t.live.noGames}</p>
        </div>
      )}

      {!isLoading && !error && liveGames.length > 0 && filteredGames.length === 0 && (
        <div className="p-12 text-center rounded-xl bg-card border border-primary/10">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground">{t.live.noResults} "{searchQuery}"</p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-4 text-sm text-primary hover:text-primary/80 transition-colors"
            data-testid="button-clear-search"
          >
            {t.live.clearSearch}
          </button>
        </div>
      )}

      {!isLoading && !error && filteredGames.length > 0 && (
        <div className="space-y-4">
          {filteredGames.map((match) => (
            <button
              key={match.fixture.id}
              onClick={() => handleMatchClick(match)}
              data-testid={`match-live-${match.fixture.id}`}
              className="w-full bg-card border border-primary/10 hover:border-primary/30 transition-all p-5 rounded-xl group cursor-pointer text-left"
            >
              {/* League & Time */}
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-primary/70 truncate max-w-[200px] block">{match.league.name}</span>
                <span className="text-xs font-bold text-red-500 animate-pulse flex items-center gap-1 flex-shrink-0">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  {match.fixture.status.elapsed}'
                </span>
              </div>

              {/* Teams & Score */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img 
                    src={match.teams.home.logo} 
                    alt={match.teams.home.name} 
                    className="w-10 h-10 object-contain flex-shrink-0" 
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect fill="%23333" width="40" height="40"/></svg>';
                    }}
                  />
                  <span className="font-display font-bold text-white truncate max-w-[180px] block">
                    {match.teams.home.name}
                  </span>
                </div>

                <div className="px-6 flex items-center gap-3 flex-shrink-0">
                  <span className="text-3xl font-display font-black text-white">{match.goals.home ?? 0}</span>
                  <span className="text-lg text-muted-foreground">:</span>
                  <span className="text-3xl font-display font-black text-white">{match.goals.away ?? 0}</span>
                </div>

                <div className="flex items-center gap-3 flex-1 justify-end min-w-0">
                  <span className="font-display font-bold text-white text-right truncate max-w-[180px] block">
                    {match.teams.away.name}
                  </span>
                  <img 
                    src={match.teams.away.logo} 
                    alt={match.teams.away.name} 
                    className="w-10 h-10 object-contain flex-shrink-0" 
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect fill="%23333" width="40" height="40"/></svg>';
                    }}
                  />
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
