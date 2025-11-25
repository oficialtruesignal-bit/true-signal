import { Layout } from "@/components/layout";
import { footballService, FootballMatch } from "@/lib/football-service";
import { useQuery } from "@tanstack/react-query";
import { Calendar, AlertCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, addDays, isAfter, addMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useMemo } from "react";

export default function PreGamePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Today + Next 6 days (7 days window)
  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  const { data: rawFixtures = [], isLoading, error } = useQuery({
    queryKey: ['football-fixtures-pregame', selectedDate],
    queryFn: () => footballService.getFixturesByDate(format(selectedDate, 'yyyy-MM-dd')),
    refetchInterval: 60000, // Refresh every 1 min (to catch matches starting soon)
  });

  // Filtro temporal rigoroso: apenas jogos que começam em mais de 1 minuto
  const fixtures = useMemo(() => {
    const now = new Date();
    const oneMinuteFromNow = addMinutes(now, 1);
    
    return rawFixtures.filter((match) => {
      const matchDate = new Date(match.fixture.date);
      // Mantém apenas jogos que começam DEPOIS de 1 minuto a partir de agora
      return isAfter(matchDate, oneMinuteFromNow);
    });
  }, [rawFixtures]);

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Pré-Jogo</h1>
        </div>
        <p className="text-muted-foreground">
          Jogos programados para os próximos 7 dias • Filtro: apenas jogos futuros
        </p>
      </div>

      {/* Date Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {dates.map((date) => (
          <button
            key={date.toISOString()}
            onClick={() => setSelectedDate(date)}
            data-testid={`date-${format(date, 'yyyy-MM-dd')}`}
            className={`px-4 py-2 rounded-xl border transition-all whitespace-nowrap flex-shrink-0 ${
              format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                ? 'bg-primary/20 border-primary text-primary font-bold'
                : 'bg-card border-white/10 text-muted-foreground hover:border-primary/30'
            }`}
          >
            <div className="text-[10px] font-medium mb-0.5 uppercase">
              {format(date, 'EEE', { locale: ptBR })}
            </div>
            <div className="text-sm font-display font-bold">
              {format(date, 'dd/MM')}
            </div>
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl bg-white/5" />
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>Erro ao carregar jogos. Tente novamente mais tarde.</span>
        </div>
      )}

      {!isLoading && !error && fixtures.length === 0 && (
        <div className="p-12 text-center rounded-xl bg-card border border-primary/10">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground">Nenhum jogo programado para esta data.</p>
        </div>
      )}

      {!isLoading && !error && fixtures.length > 0 && (
        <div className="space-y-4">
          {fixtures.map((match) => (
            <div
              key={match.fixture.id}
              data-testid={`match-pregame-${match.fixture.id}`}
              className="bg-card border border-primary/10 p-5 rounded-xl"
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
                  <img src={match.teams.home.logo} alt={match.teams.home.name} className="w-10 h-10 object-contain flex-shrink-0" />
                  <span className="font-display font-bold text-white truncate max-w-[180px] block">{match.teams.home.name}</span>
                </div>

                <div className="px-6 flex-shrink-0">
                  <span className="text-lg text-muted-foreground font-bold">vs</span>
                </div>

                <div className="flex items-center gap-3 flex-1 justify-end min-w-0">
                  <span className="font-display font-bold text-white text-right truncate max-w-[180px] block">{match.teams.away.name}</span>
                  <img src={match.teams.away.logo} alt={match.teams.away.name} className="w-10 h-10 object-contain flex-shrink-0" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
