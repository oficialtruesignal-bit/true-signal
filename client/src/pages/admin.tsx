import { Layout } from "@/components/layout";
import { SignalForm } from "@/components/signal-form";
import { tipsService } from "@/lib/tips-service";
import { footballService, FootballMatch } from "@/lib/football-service";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Trophy, XCircle, Clock, Calendar, Search, Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Signal } from "@/lib/mock-data";

export default function Admin() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMatch, setSelectedMatch] = useState<FootballMatch | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch Tips
  const { data: signals = [] } = useQuery({
    queryKey: ['tips'],
    queryFn: tipsService.getAll,
  });

  // Fetch Fixtures for selection
  const { data: fixtures = [], isLoading: isLoadingFixtures } = useQuery({
    queryKey: ['fixtures', selectedDate],
    queryFn: () => footballService.getFixturesByDate(selectedDate),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: tipsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tips'] });
      setIsDialogOpen(false);
      setSelectedMatch(null);
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: Signal['status'] }) => 
      tipsService.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tips'] })
  });

  const handleCreateTip = (formData: any) => {
    createMutation.mutate(formData);
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-white mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">Gerencie os sinais e resultados.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Create Tip Flow */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-primary/20 rounded-xl p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Selecionar Jogo Real
            </h3>
            
            <div className="flex gap-2 mb-4">
              <Input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-black/40 border-primary/20 text-white"
              />
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {isLoadingFixtures ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
              ) : fixtures.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum jogo encontrado.</p>
              ) : (
                fixtures.map(match => (
                  <div 
                    key={match.fixture.id}
                    onClick={() => {
                      setSelectedMatch(match);
                      setIsDialogOpen(true);
                    }}
                    className="p-3 rounded-lg border border-white/5 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all group"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] text-muted-foreground">{format(new Date(match.fixture.date), 'HH:mm')}</span>
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 rounded">{match.league.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium text-white">
                      <span>{match.teams.home.name}</span>
                      <span className="text-muted-foreground text-xs">vs</span>
                      <span>{match.teams.away.name}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Active Signals Management */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-primary/20 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-primary/10 bg-primary/5 flex justify-between items-center">
              <h3 className="font-bold text-white">Sinais Ativos</h3>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">{signals.length} Total</span>
            </div>
            <div className="divide-y divide-white/5">
              {signals.map((signal) => (
                <div key={signal.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white/5 transition-colors gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white flex items-center gap-2">
                      {signal.homeTeam} vs {signal.awayTeam}
                      {signal.isLive && <span className="text-[10px] text-red-500 bg-red-500/10 px-1 rounded animate-pulse">LIVE</span>}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-primary border border-primary/20 px-1.5 rounded">{signal.league}</span>
                      <span className="text-xs text-muted-foreground">{signal.market} @{signal.odd}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className={`w-8 h-8 ${signal.status === 'green' ? 'bg-green-500/20 border-green-500 text-green-500' : 'border-white/10 hover:border-green-500 hover:text-green-500'}`}
                      onClick={() => updateStatusMutation.mutate({ id: signal.id, status: 'green' })}
                    >
                      <Trophy className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className={`w-8 h-8 ${signal.status === 'red' ? 'bg-red-500/20 border-red-500 text-red-500' : 'border-white/10 hover:border-red-500 hover:text-red-500'}`}
                      onClick={() => updateStatusMutation.mutate({ id: signal.id, status: 'red' })}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className={`w-8 h-8 ${signal.status === 'pending' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 'border-white/10 hover:border-yellow-500 hover:text-yellow-500'}`}
                      onClick={() => updateStatusMutation.mutate({ id: signal.id, status: 'pending' })}
                    >
                      <Clock className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Tip Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#121212] border-primary/20 text-white">
          <DialogHeader>
            <DialogTitle>Criar Sinal: {selectedMatch?.teams.home.name} x {selectedMatch?.teams.away.name}</DialogTitle>
          </DialogHeader>
          {selectedMatch && (
            <SignalForm 
              initialData={{
                league: selectedMatch.league.name,
                homeTeam: selectedMatch.teams.home.name,
                awayTeam: selectedMatch.teams.away.name,
              }}
              onAdd={handleCreateTip} 
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
