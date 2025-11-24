import { Layout } from "@/components/layout";
import { Hero } from "@/components/hero";
import { LiveTicker } from "@/components/live-ticker";
import { BetCard } from "@/components/bet-card";
import { LiveGamesList } from "@/components/live-games-list";
import { MOCK_SIGNALS, MOCK_LIVE_GAMES } from "@/lib/mock-data";
import { Zap, Activity, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  return (
    <Layout>
      <LiveTicker signals={MOCK_SIGNALS} />
      
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo de volta, Jogador.</p>
      </div>

      <Tabs defaultValue="tips" className="space-y-6">
        <TabsList className="bg-card border border-white/5 p-1 rounded-xl w-full md:w-auto grid grid-cols-3 md:flex">
          <TabsTrigger value="tips" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg">
            <Zap className="w-4 h-4 mr-2" /> Tips do Dia
          </TabsTrigger>
          <TabsTrigger value="live" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg">
            <Activity className="w-4 h-4 mr-2" /> Jogos ao Vivo
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg">
            <Calendar className="w-4 h-4 mr-2" /> Agenda
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tips" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Hero />
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-display font-bold text-white">Sinais Recentes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_SIGNALS.map((signal) => (
              <BetCard key={signal.id} signal={signal} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="live" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-card border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" />
                Acontecendo Agora
              </h2>
              <span className="text-xs font-bold bg-green-500/10 text-green-500 px-2 py-1 rounded border border-green-500/20 animate-pulse">
                LIVE DATA
              </span>
            </div>
            <LiveGamesList games={MOCK_LIVE_GAMES} />
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-card border border-white/5 rounded-2xl p-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Agenda de Jogos</h3>
            <p className="text-muted-foreground">Nenhum jogo agendado para as próximas horas.</p>
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
