import { Layout } from "@/components/layout";
import { footballService, FootballMatch } from "@/lib/football-service";
import { useQueries } from "@tanstack/react-query";
import { Calendar, AlertCircle, Clock, Search, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, addDays, isAfter, addMinutes, isSameDay } from "date-fns";
import { ptBR, enUS, es, fr, it, zhCN } from "date-fns/locale";
import { useMemo, useState } from "react";
import { useLanguage } from "@/hooks/use-language";

// Map language to date-fns locale
const localeMap = {
  pt: ptBR,
  en: enUS,
  es: es,
  fr: fr,
  it: it,
  cn: zhCN,
};

export default function PreGamePage() {
  const { t, language } = useLanguage();
  const dateLocale = localeMap[language] || ptBR;
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedDateIndex, setSelectedDateIndex] = useState<number | null>(null); // null = todos os dias
  
  // Today + Next 6 days (7 days window)
  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  // Busca jogos para todos os próximos 7 dias simultaneamente
  const queries = useQueries({
    queries: dates.map(date => ({
      queryKey: ['football-fixtures-pregame', format(date, 'yyyy-MM-dd')],
      queryFn: () => footballService.getFixturesByDate(format(date, 'yyyy-MM-dd')),
      refetchInterval: 60000, // Refresh every 1 min
    }))
  });

  // Combina todos os fixtures e filtra
  const { allFixtures, isLoading, hasError } = useMemo(() => {
    const now = new Date();
    const oneMinuteFromNow = addMinutes(now, 1);
    
    // Verifica se alguma query ainda está carregando
    const loading = queries.some(q => q.isLoading);
    
    // Verifica se houve algum erro
    const error = queries.some(q => q.error);
    
    // Combina todos os fixtures de todas as queries
    const combined: FootballMatch[] = [];
    queries.forEach(q => {
      if (q.data) {
        combined.push(...q.data);
      }
    });
    
    // Filtra: apenas jogos que começam em MAIS de 1 minuto
    const filtered = combined.filter((match) => {
      const matchDate = new Date(match.fixture.date);
      return isAfter(matchDate, oneMinuteFromNow);
    });
    
    // Ordena por data (mais próximos primeiro)
    filtered.sort((a, b) => 
      new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
    );
    
    return {
      allFixtures: filtered,
      isLoading: loading,
      hasError: error
    };
  }, [queries]);

  // Filtra jogos baseado na pesquisa e dia selecionado
  const fixtures = useMemo(() => {
    let filtered = allFixtures;
    
    // Filtra por dia selecionado
    if (selectedDateIndex !== null) {
      const selectedDate = dates[selectedDateIndex];
      filtered = filtered.filter(match => 
        isSameDay(new Date(match.fixture.date), selectedDate)
      );
    }
    
    // Filtra por pesquisa
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((match) => 
        match.teams.home.name.toLowerCase().includes(query) ||
        match.teams.away.name.toLowerCase().includes(query) ||
        match.league.name.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [allFixtures, searchQuery, selectedDateIndex, dates]);

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white">{t.pregame.title}</h1>
          </div>
          
          {/* Search Toggle */}
          <button
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              if (isSearchOpen) setSearchQuery("");
            }}
            className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 hover:border-primary/40 flex items-center justify-center transition-colors"
            data-testid="button-search-toggle-pregame"
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
              placeholder={t.pregame.searchPlaceholder}
              className="w-full px-4 py-3 bg-card border border-primary/20 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              data-testid="input-search-pregame"
              autoFocus
            />
          </div>
        )}
        
        <p className="text-muted-foreground">
          {t.pregame.subtitle}
        </p>
        
        {/* Day Filter Tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedDateIndex(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
              selectedDateIndex === null 
                ? 'bg-primary text-black' 
                : 'bg-card border border-primary/20 text-muted-foreground hover:border-primary/40'
            }`}
            data-testid="filter-all-days"
          >
            Todos
          </button>
          {dates.map((date, index) => (
            <button
              key={date.toISOString()}
              onClick={() => setSelectedDateIndex(index)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedDateIndex === index 
                  ? 'bg-primary text-black' 
                  : 'bg-card border border-primary/20 text-muted-foreground hover:border-primary/40'
              }`}
              data-testid={`filter-day-${index}`}
            >
              <span className="uppercase">{format(date, 'EEE', { locale: dateLocale })}</span>
              <span className="ml-1 text-[10px] opacity-70">{format(date, 'dd/MM')}</span>
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl bg-white/5" />
          ))}
        </div>
      )}

      {hasError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{t.pregame.error}</span>
        </div>
      )}

      {!isLoading && !hasError && allFixtures.length === 0 && (
        <div className="p-12 text-center rounded-xl bg-card border border-primary/10">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground">{t.pregame.noGames}</p>
        </div>
      )}

      {!isLoading && !hasError && allFixtures.length > 0 && fixtures.length === 0 && (
        <div className="p-12 text-center rounded-xl bg-card border border-primary/10">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground">{t.pregame.noResults} "{searchQuery}"</p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-4 text-sm text-primary hover:text-primary/80 transition-colors"
            data-testid="button-clear-search-pregame"
          >
            {t.pregame.clearSearch}
          </button>
        </div>
      )}

      {!isLoading && !hasError && fixtures.length > 0 && (
        <div className="space-y-6">
          {/* Agrupa jogos por data */}
          {dates.map(date => {
            const matchesForDate = fixtures.filter(match => 
              isSameDay(new Date(match.fixture.date), date)
            );
            
            if (matchesForDate.length === 0) return null;
            
            return (
              <div key={date.toISOString()}>
                                
                {/* Jogos do dia */}
                <div className="space-y-3">
                  {matchesForDate.map((match) => (
                    <div
                      key={match.fixture.id}
                      data-testid={`match-pregame-${match.fixture.id}`}
                      className="bg-card border border-primary/10 p-5 rounded-xl hover:border-primary/20 transition-colors"
                    >
                      {/* League & Time */}
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-primary/70">{match.league.name}</span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{format(new Date(match.fixture.date), 'HH:mm')}</span>
                        </div>
                      </div>

                      {/* Teams */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <img 
                            src={match.teams.home.logo} 
                            alt={match.teams.home.name} 
                            className="w-10 h-10 object-contain flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <span className="font-display font-bold text-white truncate max-w-[180px] block">{match.teams.home.name}</span>
                        </div>

                        <div className="px-6 flex-shrink-0">
                          <span className="text-lg text-muted-foreground font-bold">vs</span>
                        </div>

                        <div className="flex items-center gap-3 flex-1 justify-end min-w-0">
                          <span className="font-display font-bold text-white text-right truncate max-w-[180px] block">{match.teams.away.name}</span>
                          <img 
                            src={match.teams.away.logo} 
                            alt={match.teams.away.name} 
                            className="w-10 h-10 object-contain flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
