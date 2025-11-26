import { Layout } from "@/components/layout";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tipsService } from "@/lib/tips-service";
import { footballService, FootballMatch } from "@/lib/football-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2, Search, Zap, ShieldAlert, Calendar, Trophy, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminCreate() {
  const { user, reloadProfile } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Debug log to see what user data we have
  useEffect(() => {
    console.log('🎯 [ADMIN-CREATE DEBUG] Current user object:', user);
    console.log('🎯 [ADMIN-CREATE DEBUG] User role:', user?.role);
    console.log('🎯 [ADMIN-CREATE DEBUG] User email:', user?.email);
    console.log('🎯 [ADMIN-CREATE DEBUG] Is admin?', user?.role === 'admin' || user?.email === 'kwillianferreira@gmail.com');
  }, [user]);

  // Force reload profile on mount to ensure fresh data
  useEffect(() => {
    const forceReload = async () => {
      console.log('🔄 [ADMIN-CREATE DEBUG] Forcing profile reload on mount...');
      await reloadProfile();
      
      // Check if we need to reload the page to clear Supabase cache
      const hasReloaded = sessionStorage.getItem('admin-create-reloaded');
      if (!hasReloaded && user) {
        console.log('🔄 [ADMIN-CREATE DEBUG] First load - will reload page to clear cache...');
        sessionStorage.setItem('admin-create-reloaded', 'true');
        window.location.reload();
      }
    };
    
    forceReload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin' && user.email !== 'kwillianferreira@gmail.com') {
      console.log('❌ [ADMIN-CREATE DEBUG] Access denied - redirecting to /app');
      toast.error("Acesso negado. Apenas administradores podem criar tips.");
      setLocation("/app");
    }
  }, [user, setLocation]);

  // Show access denied if not admin
  if (!user || (user.role !== 'admin' && user.email !== 'kwillianferreira@gmail.com')) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Acesso Negado</h2>
          <p className="text-muted-foreground">Apenas administradores podem criar tips.</p>
        </div>
      </Layout>
    );
  }

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMatch, setSelectedMatch] = useState<FootballMatch | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [manualMode, setManualMode] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    market: "",
    odd: "",
    betLink: "",
    // Manual fields
    manualLeague: "",
    manualHomeTeam: "",
    manualAwayTeam: "",
  });

  // Fetch fixtures for selection
  const { data: fixtures = [], isLoading: isLoadingFixtures, isError: isFixturesError } = useQuery({
    queryKey: ['fixtures', selectedDate],
    queryFn: () => footballService.getFixturesByDate(selectedDate),
  });

  // Auto-switch to manual mode if API fails
  useEffect(() => {
    if (isFixturesError) {
      setManualMode(true);
      toast.info("API indisponível. Use o modo manual para criar a tip.");
    }
  }, [isFixturesError]);

  // Filter fixtures by search
  const filteredFixtures = fixtures.filter(match => {
    const searchLower = searchQuery.toLowerCase();
    return (
      match.teams.home.name.toLowerCase().includes(searchLower) ||
      match.teams.away.name.toLowerCase().includes(searchLower) ||
      match.league.name.toLowerCase().includes(searchLower)
    );
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: tipsService.create,
    onSuccess: async (newTip) => {
      queryClient.invalidateQueries({ queryKey: ['tips'] });
      
      toast.success("🚀 Sinal Disparado!", {
        description: "Tip enviada para todos os usuários!",
      });
      
      // Send notification
      try {
        const { notificationService } = await import("@/lib/notification-service");
        await notificationService.sendNewTipNotification({
          match: `${newTip.homeTeam} vs ${newTip.awayTeam}`,
          market: newTip.market,
          odd: newTip.odd,
        });
      } catch (error) {
        console.error("Error sending notification:", error);
      }

      // Reset form and redirect
      setSelectedMatch(null);
      setFormData({ 
        market: "", 
        odd: "", 
        betLink: "",
        manualLeague: "",
        manualHomeTeam: "",
        manualAwayTeam: "",
      });
      setManualMode(false);
      setLocation("/tips");
    },
    onError: (error: any) => {
      toast.error("Erro ao criar tip", {
        description: error.message || "Verifique sua conexão e tente novamente.",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation - Either selected match OR manual fields must be filled
    let league, homeTeam, awayTeam;

    if (manualMode) {
      // Manual mode validation
      if (!formData.manualLeague.trim()) {
        toast.error("Preencha a liga/competição");
        return;
      }
      if (!formData.manualHomeTeam.trim()) {
        toast.error("Preencha o time da casa");
        return;
      }
      if (!formData.manualAwayTeam.trim()) {
        toast.error("Preencha o time visitante");
        return;
      }
      league = formData.manualLeague;
      homeTeam = formData.manualHomeTeam;
      awayTeam = formData.manualAwayTeam;
    } else {
      // API mode validation
      if (!selectedMatch) {
        toast.error("Selecione um jogo ou ative o modo manual");
        return;
      }
      league = selectedMatch.league.name;
      homeTeam = selectedMatch.teams.home.name;
      awayTeam = selectedMatch.teams.away.name;
    }

    if (!formData.market.trim()) {
      toast.error("Preencha o mercado da aposta");
      return;
    }
    if (!formData.odd || parseFloat(formData.odd) <= 1) {
      toast.error("Odd inválida (deve ser maior que 1.0)");
      return;
    }

    // Submit
    createMutation.mutate({
      league,
      homeTeam,
      awayTeam,
      homeTeamLogo: !manualMode && selectedMatch ? selectedMatch.teams.home.logo : undefined,
      awayTeamLogo: !manualMode && selectedMatch ? selectedMatch.teams.away.logo : undefined,
      fixtureId: !manualMode && selectedMatch ? selectedMatch.fixture.id.toString() : undefined,
      market: formData.market,
      odd: parseFloat(formData.odd),
      betLink: formData.betLink,
      status: "pending",
      isLive: false,
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white">Admin Studio</h1>
          </div>
          <p className="text-muted-foreground">Crie e dispare sinais para os usuários em tempo real.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Match Selection */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card border border-primary/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  {manualMode ? (
                    <>
                      <Edit3 className="w-4 h-4 text-primary" />
                      Modo Manual
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 text-primary" />
                      Selecionar Jogo
                    </>
                  )}
                </h3>
                <button
                  onClick={() => setManualMode(!manualMode)}
                  className="text-xs text-primary hover:text-primary/80 border border-primary/20 px-2 py-1 rounded transition-colors"
                >
                  {manualMode ? "API" : "Manual"}
                </button>
              </div>
              
              {manualMode ? (
                /* Manual Input Fields */
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1">Liga / Competição *</Label>
                    <Input 
                      type="text"
                      placeholder="Ex: Premier League"
                      value={formData.manualLeague}
                      onChange={(e) => setFormData({ ...formData, manualLeague: e.target.value })}
                      className="bg-black/40 border-primary/20 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1">Time da Casa *</Label>
                    <Input 
                      type="text"
                      placeholder="Ex: Manchester United"
                      value={formData.manualHomeTeam}
                      onChange={(e) => setFormData({ ...formData, manualHomeTeam: e.target.value })}
                      className="bg-black/40 border-primary/20 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1">Time Visitante *</Label>
                    <Input 
                      type="text"
                      placeholder="Ex: Liverpool"
                      value={formData.manualAwayTeam}
                      onChange={(e) => setFormData({ ...formData, manualAwayTeam: e.target.value })}
                      className="bg-black/40 border-primary/20 text-white"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {/* Date Picker */}
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Data
                      </Label>
                      <Input 
                        type="date" 
                        value={selectedDate} 
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-black/40 border-primary/20 text-white"
                      />
                    </div>

                    {/* Search */}
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1">Buscar Time/Liga</Label>
                      <Input 
                        type="text"
                        placeholder="Ex: Manchester, Premier League..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-black/40 border-primary/20 text-white"
                      />
                    </div>
                  </div>

                  {/* Fixtures List */}
                  <div className="mt-4 space-y-2 max-h-[500px] overflow-y-auto pr-2">
                    {isLoadingFixtures ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="animate-spin text-primary" />
                      </div>
                    ) : filteredFixtures.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhum jogo encontrado.
                      </p>
                    ) : (
                      filteredFixtures.map(match => (
                        <button
                          key={match.fixture.id}
                          onClick={() => setSelectedMatch(match)}
                          className={`w-full p-3 rounded-lg border transition-all text-left ${
                            selectedMatch?.fixture.id === match.fixture.id
                              ? 'border-primary bg-primary/10'
                              : 'border-white/5 hover:border-primary/50 hover:bg-primary/5'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] text-muted-foreground">
                              {format(new Date(match.fixture.date), 'HH:mm')}
                            </span>
                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 rounded">
                              {match.league.name}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm font-medium text-white">
                            <span>{match.teams.home.name}</span>
                            <span className="text-muted-foreground text-xs">vs</span>
                            <span>{match.teams.away.name}</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="bg-card border border-primary/20 rounded-xl p-6">
              <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                Detalhes da Aposta
              </h3>

              {/* Selected Match Display */}
              {manualMode ? (
                formData.manualHomeTeam && formData.manualAwayTeam ? (
                  <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="text-xs text-muted-foreground mb-1">Jogo Manual:</div>
                    <div className="text-white font-bold">
                      {formData.manualHomeTeam} vs {formData.manualAwayTeam}
                    </div>
                    {formData.manualLeague && (
                      <div className="text-xs text-primary mt-1">{formData.manualLeague}</div>
                    )}
                  </div>
                ) : (
                  <div className="mb-6 p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                    <p className="text-yellow-500 text-sm">
                      ⚠️ Preencha os times à esquerda
                    </p>
                  </div>
                )
              ) : selectedMatch ? (
                <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="text-xs text-muted-foreground mb-1">Jogo Selecionado:</div>
                  <div className="text-white font-bold">
                    {selectedMatch.teams.home.name} vs {selectedMatch.teams.away.name}
                  </div>
                  <div className="text-xs text-primary mt-1">{selectedMatch.league.name}</div>
                </div>
              ) : (
                <div className="mb-6 p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                  <p className="text-yellow-500 text-sm">
                    ⚠️ Selecione um jogo à esquerda ou use o modo manual
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {/* Market */}
                <div>
                  <Label htmlFor="market" className="text-white mb-2 block">
                    Mercado (Entrada) *
                  </Label>
                  <Input
                    id="market"
                    type="text"
                    placeholder="Ex: Over 2.5 Gols, Vitória Casa, Ambas Marcam..."
                    value={formData.market}
                    onChange={(e) => setFormData({ ...formData, market: e.target.value })}
                    className="bg-black/40 border-primary/20 text-white focus-visible:ring-primary"
                    required
                  />
                </div>

                {/* Odd */}
                <div>
                  <Label htmlFor="odd" className="text-white mb-2 block">
                    Odd (Cotação) *
                  </Label>
                  <Input
                    id="odd"
                    type="number"
                    step="0.01"
                    min="1.01"
                    placeholder="Ex: 1.80"
                    value={formData.odd}
                    onChange={(e) => setFormData({ ...formData, odd: e.target.value })}
                    className="bg-black/40 border-primary/20 text-white focus-visible:ring-primary text-lg font-bold"
                    style={{ color: '#33b864' }}
                    required
                  />
                </div>

                {/* Bet Link */}
                <div>
                  <Label htmlFor="betLink" className="text-white mb-2 block">
                    Link da Bet (Opcional)
                  </Label>
                  <Input
                    id="betLink"
                    type="url"
                    placeholder="https://..."
                    value={formData.betLink}
                    onChange={(e) => setFormData({ ...formData, betLink: e.target.value })}
                    className="bg-black/40 border-primary/20 text-white focus-visible:ring-primary"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending || 
                    (!manualMode && !selectedMatch) || 
                    (manualMode && (!formData.manualHomeTeam || !formData.manualAwayTeam || !formData.manualLeague))
                  }
                  className="w-full bg-primary hover:bg-primary/90 text-black font-bold text-lg py-6 shadow-[0_0_20px_rgba(51,184,100,0.3)] hover:shadow-[0_0_30px_rgba(51,184,100,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Disparando...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      DISPARAR SINAL 🚀
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
