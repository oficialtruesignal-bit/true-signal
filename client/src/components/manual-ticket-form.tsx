import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { footballService, FootballMatch } from "@/lib/football-service";
import { Calendar, Clock, Trophy, Search, ChevronRight, Send, Loader2, Plus, Trash2, PenLine } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BetLeg {
  id: string;
  market: string;
}

interface ManualTicketFormProps {
  onSubmit: (data: {
    homeTeam: string;
    awayTeam: string;
    league: string;
    matchTime: string;
    market: string;
    odd: number;
    betLink: string;
    homeTeamLogo?: string;
    awayTeamLogo?: string;
    fixtureId?: string;
  }) => void;
  isSubmitting?: boolean;
}

interface ManualMatchData {
  homeTeam: string;
  awayTeam: string;
  league: string;
  matchTime: string;
}

export function ManualTicketForm({ onSubmit, isSubmitting }: ManualTicketFormProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMatch, setSelectedMatch] = useState<FootballMatch | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [betLink, setBetLink] = useState("");
  
  // Modo de entrada manual (quando não encontra na API)
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualData, setManualData] = useState<ManualMatchData>({
    homeTeam: "",
    awayTeam: "",
    league: "",
    matchTime: "",
  });
  
  // Múltiplas linhas do bilhete
  const [legs, setLegs] = useState<BetLeg[]>([
    { id: crypto.randomUUID(), market: "" }
  ]);
  
  // Odd total única
  const [totalOdd, setTotalOdd] = useState("");

  // Buscar jogos da API
  const { data: fixtures = [], isLoading } = useQuery({
    queryKey: ['fixtures', selectedDate],
    queryFn: () => footballService.getFixturesByDate(selectedDate),
  });

  // Filtrar jogos pela busca
  const filteredFixtures = fixtures.filter(match => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      match.teams.home.name.toLowerCase().includes(query) ||
      match.teams.away.name.toLowerCase().includes(query) ||
      match.league.name.toLowerCase().includes(query)
    );
  });

  const addLeg = () => {
    setLegs([...legs, { id: crypto.randomUUID(), market: "" }]);
  };

  const removeLeg = (id: string) => {
    if (legs.length === 1) return;
    setLegs(legs.filter(leg => leg.id !== id));
  };

  const updateLeg = (id: string, field: keyof BetLeg, value: string) => {
    setLegs(legs.map(leg => 
      leg.id === id ? { ...leg, [field]: value } : leg
    ));
  };

  const handleSubmit = () => {
    // Validar se tem jogo selecionado (API ou manual)
    if (!selectedMatch && !isManualMode) {
      toast.error("Selecione um jogo primeiro");
      return;
    }

    // Validar dados manuais se estiver em modo manual
    if (isManualMode) {
      if (!manualData.homeTeam.trim() || !manualData.awayTeam.trim()) {
        toast.error("Preencha os nomes dos times");
        return;
      }
      if (!manualData.league.trim()) {
        toast.error("Preencha o campeonato");
        return;
      }
      if (!manualData.matchTime.trim()) {
        toast.error("Preencha o horário do jogo");
        return;
      }
    }

    // Validar legs
    for (const leg of legs) {
      if (!leg.market.trim()) {
        toast.error("Preencha todas as linhas do bilhete");
        return;
      }
    }
    
    // Validar odd total
    if (!totalOdd || parseFloat(totalOdd) <= 0) {
      toast.error("Preencha a odd total do bilhete");
      return;
    }

    // Combinar mercados com quebra de linha
    const marketText = legs.map(leg => leg.market.trim()).filter(m => m).join('\n');
    const oddValue = parseFloat(totalOdd);

    if (isManualMode) {
      // Enviar dados manuais
      onSubmit({
        homeTeam: manualData.homeTeam.trim(),
        awayTeam: manualData.awayTeam.trim(),
        league: manualData.league.trim(),
        matchTime: manualData.matchTime.trim(),
        market: marketText,
        odd: oddValue,
        betLink: betLink,
      });

      // Reset
      setIsManualMode(false);
      setManualData({ homeTeam: "", awayTeam: "", league: "", matchTime: "" });
    } else if (selectedMatch) {
      // Formatar horário da API
      const matchDate = new Date(selectedMatch.fixture.date);
      const day = matchDate.getDate().toString().padStart(2, '0');
      const month = (matchDate.getMonth() + 1).toString().padStart(2, '0');
      const hours = matchDate.getHours().toString().padStart(2, '0');
      const minutes = matchDate.getMinutes().toString().padStart(2, '0');
      const matchTime = `${day}/${month} às ${hours}:${minutes}`;

      onSubmit({
        homeTeam: selectedMatch.teams.home.name,
        awayTeam: selectedMatch.teams.away.name,
        league: selectedMatch.league.name,
        matchTime: matchTime,
        market: marketText,
        odd: oddValue,
        betLink: betLink,
        homeTeamLogo: selectedMatch.teams.home.logo,
        awayTeamLogo: selectedMatch.teams.away.logo,
        fixtureId: selectedMatch.fixture.id.toString(),
      });

      // Reset
      setSelectedMatch(null);
    }
    
    setLegs([{ id: crypto.randomUUID(), market: "" }]);
    setTotalOdd("");
    setBetLink("");
  };

  // Formatar data do jogo
  const formatMatchTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "HH:mm", { locale: ptBR });
  };

  return (
    <div className="space-y-5">
      {/* Se não selecionou jogo, mostrar seletor */}
      {!selectedMatch ? (
        <>
          {/* Seletor de Data */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Data do Jogo
            </Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-background/50 border-border/50"
              data-testid="input-date"
            />
          </div>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar time ou campeonato..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 border-border/50"
              data-testid="input-search"
            />
          </div>

          {/* Lista de Jogos */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                <span className="ml-2 text-muted-foreground">Carregando jogos...</span>
              </div>
            ) : filteredFixtures.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                {searchQuery ? "Nenhum jogo encontrado" : "Nenhum jogo nesta data"}
              </div>
            ) : (
              filteredFixtures.map((match) => (
                <button
                  key={match.fixture.id}
                  onClick={() => setSelectedMatch(match)}
                  className="w-full p-3 bg-background/30 hover:bg-primary/10 border border-border/30 hover:border-primary/30 rounded-lg transition-all text-left group"
                  data-testid={`match-${match.fixture.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {/* Campeonato e Horário */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                        <Trophy className="w-3 h-3" />
                        <span>{match.league.name}</span>
                        <span className="text-primary">•</span>
                        <Clock className="w-3 h-3" />
                        <span>{formatMatchTime(match.fixture.date)}</span>
                      </div>
                      
                      {/* Times */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {match.teams.home.logo && (
                            <img src={match.teams.home.logo} alt="" className="w-5 h-5" />
                          )}
                          <span className="font-medium text-white text-sm">{match.teams.home.name}</span>
                        </div>
                        <span className="text-primary font-bold text-xs">vs</span>
                        <div className="flex items-center gap-2">
                          {match.teams.away.logo && (
                            <img src={match.teams.away.logo} alt="" className="w-5 h-5" />
                          )}
                          <span className="font-medium text-white text-sm">{match.teams.away.name}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Botão para digitar manualmente */}
          <div className="pt-3 border-t border-border/30">
            <button
              onClick={() => setIsManualMode(true)}
              className="w-full p-3 bg-background/30 hover:bg-primary/5 border border-dashed border-border/50 hover:border-primary/30 rounded-lg transition-all flex items-center justify-center gap-2 text-muted-foreground hover:text-primary"
              data-testid="button-manual-mode"
            >
              <PenLine className="w-4 h-4" />
              <span className="text-sm">Não encontrou? Digite manualmente</span>
            </button>
          </div>
        </>
      ) : isManualMode ? (
        /* Modo Manual - Digitar dados do jogo */
        <>
          <div className="space-y-4">
            {/* Voltar */}
            <button 
              onClick={() => setIsManualMode(false)}
              className="text-xs text-muted-foreground hover:text-white transition-colors flex items-center gap-1"
              data-testid="button-exit-manual"
            >
              ← Voltar para busca
            </button>
            
            {/* Título */}
            <div className="flex items-center gap-2 text-primary">
              <PenLine className="w-4 h-4" />
              <span className="text-sm font-medium">Entrada Manual</span>
            </div>

            {/* Campeonato */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Campeonato</Label>
              <Input
                placeholder="Ex: Premier League"
                value={manualData.league}
                onChange={(e) => setManualData({...manualData, league: e.target.value})}
                className="bg-background/50 border-border/50 text-sm"
                data-testid="input-manual-league"
              />
            </div>

            {/* Times */}
            <div className="grid grid-cols-5 gap-2 items-end">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs text-muted-foreground">Time Casa</Label>
                <Input
                  placeholder="Ex: Arsenal"
                  value={manualData.homeTeam}
                  onChange={(e) => setManualData({...manualData, homeTeam: e.target.value})}
                  className="bg-background/50 border-border/50 text-sm"
                  data-testid="input-manual-home"
                />
              </div>
              <div className="flex items-center justify-center pb-2">
                <span className="text-primary font-bold text-sm">vs</span>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs text-muted-foreground">Time Fora</Label>
                <Input
                  placeholder="Ex: Chelsea"
                  value={manualData.awayTeam}
                  onChange={(e) => setManualData({...manualData, awayTeam: e.target.value})}
                  className="bg-background/50 border-border/50 text-sm"
                  data-testid="input-manual-away"
                />
              </div>
            </div>

            {/* Horário */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Data e Horário</Label>
              <Input
                placeholder="Ex: 28/11 às 16:00"
                value={manualData.matchTime}
                onChange={(e) => setManualData({...manualData, matchTime: e.target.value})}
                className="bg-background/50 border-border/50 text-sm"
                data-testid="input-manual-time"
              />
            </div>
          </div>

          {/* Apostas */}
          <div className="space-y-3 pt-4 border-t border-border/30">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-muted-foreground">Apostas</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addLeg}
                className="h-7 px-2 text-xs text-primary hover:text-primary/80"
                data-testid="button-add-leg-manual"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Adicionar
              </Button>
            </div>
            
            {legs.map((leg, index) => (
              <div key={leg.id} className="flex gap-2 items-start">
                <div className="flex-1">
                  <Input
                    placeholder="Ex: Resultado Final - Vitória Casa"
                    value={leg.market}
                    onChange={(e) => updateLeg(leg.id, "market", e.target.value)}
                    className="bg-background/50 border-border/50 text-sm"
                    data-testid={`input-manual-market-${index}`}
                  />
                </div>
                {legs.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLeg(leg.id)}
                    className="h-9 w-9 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    data-testid={`button-remove-manual-leg-${index}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            
            {/* Odd Total */}
            <div className="pt-3 border-t border-border/20">
              <Label className="text-sm text-muted-foreground mb-2 block">Odd Total do Bilhete</Label>
              <Input
                type="number"
                step="0.01"
                min="1"
                placeholder="Ex: 2.50"
                value={totalOdd}
                onChange={(e) => setTotalOdd(e.target.value)}
                className="bg-background/50 border-border/50 text-sm w-32"
                data-testid="input-manual-total-odd"
              />
            </div>
          </div>

          {/* Link (opcional) */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Link do Bilhete (opcional)</Label>
            <Input
              placeholder="https://..."
              value={betLink}
              onChange={(e) => setBetLink(e.target.value)}
              className="bg-background/50 border-border/50 text-sm"
              data-testid="input-manual-bet-link"
            />
          </div>

          {/* Resumo e Botão */}
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground">Odd Total</p>
                <p className="text-2xl font-bold text-primary">{totalOdd || "--"}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Tipo</p>
                <p className="text-sm font-semibold text-white">
                  {legs.length === 1 ? "Simples" : `Múltipla (${legs.length})`}
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-black font-bold gap-2"
              data-testid="button-submit-manual"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Disparar Bilhete
                </>
              )}
            </Button>
          </div>
        </>
      ) : (
        /* Jogo selecionado - Mostrar formulário de mercado/odd */
        <>
          {/* Card do Jogo Selecionado */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs text-primary">
                <Trophy className="w-3.5 h-3.5" />
                <span className="font-medium">{selectedMatch.league.name}</span>
              </div>
              <button 
                onClick={() => setSelectedMatch(null)}
                className="text-xs text-muted-foreground hover:text-white transition-colors"
                data-testid="button-change-match"
              >
                Trocar jogo
              </button>
            </div>
            
            {/* Times */}
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="flex flex-col items-center gap-1.5">
                {selectedMatch.teams.home.logo && (
                  <img src={selectedMatch.teams.home.logo} alt="" className="w-10 h-10" />
                )}
                <span className="font-bold text-white text-sm text-center">{selectedMatch.teams.home.name}</span>
              </div>
              <span className="text-2xl font-bold text-primary">vs</span>
              <div className="flex flex-col items-center gap-1.5">
                {selectedMatch.teams.away.logo && (
                  <img src={selectedMatch.teams.away.logo} alt="" className="w-10 h-10" />
                )}
                <span className="font-bold text-white text-sm text-center">{selectedMatch.teams.away.name}</span>
              </div>
            </div>
            
            {/* Horário */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{format(new Date(selectedMatch.fixture.date), "dd/MM 'às' HH:mm", { locale: ptBR })}</span>
            </div>
          </div>

          {/* Apostas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-muted-foreground">Apostas</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addLeg}
                className="h-7 px-2 text-xs text-primary hover:text-primary/80"
                data-testid="button-add-leg"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Adicionar
              </Button>
            </div>
            
            {legs.map((leg, index) => (
              <div key={leg.id} className="flex gap-2 items-start">
                <div className="flex-1">
                  <Input
                    placeholder="Ex: Resultado Final - Vitória Casa"
                    value={leg.market}
                    onChange={(e) => updateLeg(leg.id, "market", e.target.value)}
                    className="bg-background/50 border-border/50 text-sm"
                    data-testid={`input-market-${index}`}
                  />
                </div>
                {legs.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLeg(leg.id)}
                    className="h-9 w-9 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    data-testid={`button-remove-leg-${index}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            
            {/* Odd Total */}
            <div className="pt-3 border-t border-border/20">
              <Label className="text-sm text-muted-foreground mb-2 block">Odd Total do Bilhete</Label>
              <Input
                type="number"
                step="0.01"
                min="1"
                placeholder="Ex: 2.50"
                value={totalOdd}
                onChange={(e) => setTotalOdd(e.target.value)}
                className="bg-background/50 border-border/50 text-sm w-32"
                data-testid="input-total-odd"
              />
            </div>
          </div>

          {/* Link (opcional) */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Link do Bilhete (opcional)</Label>
            <Input
              placeholder="https://..."
              value={betLink}
              onChange={(e) => setBetLink(e.target.value)}
              className="bg-background/50 border-border/50 text-sm"
              data-testid="input-bet-link"
            />
          </div>

          {/* Resumo e Botão */}
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground">Odd Total</p>
                <p className="text-2xl font-bold text-primary">{totalOdd || "--"}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Tipo</p>
                <p className="text-sm font-semibold text-white">
                  {legs.length === 1 ? "Simples" : `Múltipla (${legs.length})`}
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-black font-bold gap-2"
              data-testid="button-submit"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Disparar Bilhete
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
