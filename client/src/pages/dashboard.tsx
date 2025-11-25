import { Layout } from "@/components/layout";
import { Hero } from "@/components/hero";
import { LiveTicker } from "@/components/live-ticker";
import { BetCard } from "@/components/bet-card";
import { LiveGamesList } from "@/components/live-games-list";
import { tipsService } from "@/lib/tips-service";
import { footballService } from "@/lib/football-service";
import { useQuery } from "@tanstack/react-query";
import { Zap, Activity, Calendar, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: signals = [] } = useQuery({
    queryKey: ['tips'],
    queryFn: tipsService.getAll,
  });

  const { data: upcomingGames = [] } = useQuery({
    queryKey: ['upcoming-games'],
    queryFn: () => footballService.getFixturesByDate(format(new Date(), 'yyyy-MM-dd')),
  });

  return (
    <Layout>
      <LiveTicker signals={signals} />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Bem-vindo ao QG do Investidor.</p>
        </div>
        
        {/* Quick Filters */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary">
            <Filter className="w-4 h-4 mr-2" /> Hoje
          </Button>
          <Button variant="outline" size="sm" className="border-gray-200 dark:border-white/10 hover:bg-primary/5 dark:hover:bg-white/5 text-muted-foreground">
            Amanhã
          </Button>
        </div>
      </div>

      <Tabs defaultValue="tips" className="space-y-6">
        <TabsList className="bg-card border border-primary/20 dark:border-primary/20 border-gray-200 p-1 rounded-xl w-full md:w-auto grid grid-cols-3 md:flex">
          <TabsTrigger value="tips" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold rounded-lg transition-all">
            <Zap className="w-4 h-4 mr-2" /> Tips do Dia
          </TabsTrigger>
          <TabsTrigger value="live" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold rounded-lg transition-all">
            <Activity className="w-4 h-4 mr-2" /> Ao Vivo
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold rounded-lg transition-all">
            <Calendar className="w-4 h-4 mr-2" /> Próximos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tips" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Hero />
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-display font-bold text-foreground">Sinais Quentes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {signals.map((signal) => (
              <BetCard key={signal.id} signal={signal} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="live" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-card border border-primary/20 dark:border-primary/20 border-gray-200 rounded-2xl p-6 shadow-[0_0_30px_rgba(51,184,100,0.05)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Painel ao Vivo
              </h2>
              <span className="text-[10px] font-bold bg-red-500/10 text-red-500 px-2 py-1 rounded border border-red-500/20 animate-pulse">
                LIVE DATA
              </span>
            </div>
            <LiveGamesList />
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-card border border-primary/20 dark:border-primary/20 border-gray-200 rounded-2xl p-6">
             <h2 className="text-xl font-display font-bold text-foreground mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Jogos de Hoje
              </h2>
              <div className="space-y-3">
                {upcomingGames.length > 0 ? upcomingGames.map((match: any) => (
                  <div key={match.fixture.id} className="flex items-center justify-between p-3 hover:bg-primary/5 dark:hover:bg-white/5 rounded-lg border border-gray-200 dark:border-white/5 transition-colors">
                     <div className="flex items-center gap-4">
                       <span className="text-xs text-muted-foreground w-12">{format(new Date(match.fixture.date), 'HH:mm')}</span>
                       <div className="flex flex-col">
                         <span className="text-foreground font-medium text-sm">{match.teams.home.name} vs {match.teams.away.name}</span>
                         <span className="text-[10px] text-primary">{match.league.name}</span>
                       </div>
                     </div>
                  </div>
                )) : (
                  <p className="text-muted-foreground text-center py-8">Nenhum jogo encontrado na API.</p>
                )}
              </div>
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
