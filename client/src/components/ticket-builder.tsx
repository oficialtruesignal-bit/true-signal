import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, Trash2, Calculator, Send, X } from "lucide-react";
import { toast } from "sonner";

// Todas as categorias de mercados da Bet365
const MARKET_CATEGORIES = {
  "Jogador a Marcar": [
    "Primeiro Marcador",
    "Último Marcador", 
    "Marcar a Qualquer Momento",
    "Marcar 2 ou Mais",
    "Marcar Hat-trick"
  ],
  "Jogador - Cartão": [
    "Receber Cartão",
    "Receber Cartão Amarelo",
    "Receber Cartão Vermelho"
  ],
  "Jogador - Chutes ao Gol": [
    "1+ Chutes ao Gol",
    "2+ Chutes ao Gol",
    "3+ Chutes ao Gol"
  ],
  "Jogador - Chutes": [
    "1+ Chutes",
    "2+ Chutes",
    "3+ Chutes"
  ],
  "Resultado": [
    "Vitória Casa",
    "Empate",
    "Vitória Fora",
    "Casa ou Empate",
    "Fora ou Empate",
    "Casa ou Fora"
  ],
  "Para Ambos os Times Marcarem": [
    "Sim",
    "Não"
  ],
  "Chance Dupla": [
    "Casa ou Empate",
    "Fora ou Empate",
    "Casa ou Fora"
  ],
  "Total de Gols": [
    "Mais de 0.5",
    "Mais de 1.5",
    "Mais de 2.5",
    "Mais de 3.5",
    "Mais de 4.5",
    "Menos de 0.5",
    "Menos de 1.5",
    "Menos de 2.5",
    "Menos de 3.5",
    "Menos de 4.5"
  ],
  "Faixa de Gols": [
    "0-1 Gols",
    "0-2 Gols",
    "1-2 Gols",
    "1-3 Gols",
    "2-3 Gols",
    "2-4 Gols",
    "3+ Gols",
    "4+ Gols"
  ],
  "Escanteios": [
    "Mais de 6.5",
    "Mais de 7.5",
    "Mais de 8.5",
    "Mais de 9.5",
    "Mais de 10.5",
    "Menos de 6.5",
    "Menos de 7.5",
    "Menos de 8.5",
    "Menos de 9.5",
    "Menos de 10.5"
  ],
  "Cartões": [
    "Mais de 2.5",
    "Mais de 3.5",
    "Mais de 4.5",
    "Mais de 5.5",
    "Menos de 2.5",
    "Menos de 3.5",
    "Menos de 4.5",
    "Menos de 5.5"
  ],
  "Para Ambos os Times Receberem Cartões": [
    "Sim",
    "Não"
  ],
  "Time - Para Conseguir o Maior Número de": [
    "Gols - Casa",
    "Gols - Fora",
    "Escanteios - Casa",
    "Escanteios - Fora",
    "Cartões - Casa",
    "Cartões - Fora"
  ],
  "Jogador - Faltas Cometidas": [
    "1+ Faltas",
    "2+ Faltas",
    "3+ Faltas"
  ],
  "Jogador - Para Sofrer Falta": [
    "1+ Faltas Sofridas",
    "2+ Faltas Sofridas",
    "3+ Faltas Sofridas"
  ],
  "Jogador - Desarmes": [
    "1+ Desarmes",
    "2+ Desarmes",
    "3+ Desarmes"
  ],
  "Defesas de Goleiro": [
    "1+ Defesas",
    "2+ Defesas",
    "3+ Defesas",
    "4+ Defesas",
    "5+ Defesas"
  ],
  "Total de Chutes ao Gol": [
    "Mais de 4.5",
    "Mais de 5.5",
    "Mais de 6.5",
    "Menos de 4.5",
    "Menos de 5.5",
    "Menos de 6.5"
  ],
  "Total de Chutes": [
    "Mais de 18.5",
    "Mais de 20.5",
    "Mais de 22.5",
    "Menos de 18.5",
    "Menos de 20.5",
    "Menos de 22.5"
  ],
  "Intervalo/Final do Jogo": [
    "Casa/Casa",
    "Casa/Empate",
    "Casa/Fora",
    "Empate/Casa",
    "Empate/Empate",
    "Empate/Fora",
    "Fora/Casa",
    "Fora/Empate",
    "Fora/Fora"
  ],
  "Placar": [
    "1-0", "2-0", "2-1", "3-0", "3-1", "3-2",
    "0-0", "1-1", "2-2", "3-3",
    "0-1", "0-2", "1-2", "0-3", "1-3", "2-3",
    "Outro"
  ],
  "Tempo Com Mais Gols": [
    "1º Tempo",
    "2º Tempo",
    "Igual"
  ],
  "Time - Especiais": [
    "Casa - Vencer Sem Sofrer Gol",
    "Fora - Vencer Sem Sofrer Gol",
    "Casa - Vencer de Virada",
    "Fora - Vencer de Virada",
    "Casa - Marcar em Ambos os Tempos",
    "Fora - Marcar em Ambos os Tempos"
  ],
  "Time - Marcador de Gols": [
    "Casa - Mais de 0.5",
    "Casa - Mais de 1.5",
    "Casa - Mais de 2.5",
    "Fora - Mais de 0.5",
    "Fora - Mais de 1.5",
    "Fora - Mais de 2.5"
  ],
  "Partida/Tempo - Cartão Vermelho": [
    "Sim",
    "Não"
  ],
  "Margem de Vitória": [
    "Casa por 1",
    "Casa por 2",
    "Casa por 3+",
    "Fora por 1",
    "Fora por 2",
    "Fora por 3+",
    "Empate"
  ],
  "Gols - Ímpar/Par": [
    "Ímpar",
    "Par"
  ]
};

// Interface para uma perna/seleção do bilhete
interface BetLeg {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  matchTime: string;
  category: string;
  selection: string;
  odd: string;
  playerName?: string;
}

interface TicketBuilderProps {
  onSubmit: (data: {
    legs: BetLeg[];
    totalOdd: number;
    betLink: string;
  }) => void;
  isSubmitting?: boolean;
}

export function TicketBuilder({ onSubmit, isSubmitting }: TicketBuilderProps) {
  const [legs, setLegs] = useState<BetLeg[]>([
    {
      id: crypto.randomUUID(),
      homeTeam: "",
      awayTeam: "",
      league: "",
      matchTime: "",
      category: "",
      selection: "",
      odd: "",
      playerName: ""
    }
  ]);
  const [betLink, setBetLink] = useState("");

  // Calcular odd total
  const totalOdd = legs.reduce((acc, leg) => {
    const odd = parseFloat(leg.odd) || 1;
    return acc * odd;
  }, 1);

  const addLeg = () => {
    setLegs([
      ...legs,
      {
        id: crypto.randomUUID(),
        homeTeam: "",
        awayTeam: "",
        league: "",
        matchTime: "",
        category: "",
        selection: "",
        odd: "",
        playerName: ""
      }
    ]);
  };

  const removeLeg = (id: string) => {
    if (legs.length === 1) {
      toast.error("O bilhete precisa ter pelo menos uma aposta");
      return;
    }
    setLegs(legs.filter(leg => leg.id !== id));
  };

  const updateLeg = (id: string, field: keyof BetLeg, value: string) => {
    setLegs(legs.map(leg => 
      leg.id === id ? { ...leg, [field]: value } : leg
    ));
  };

  const handleSubmit = () => {
    // Validação
    for (const leg of legs) {
      if (!leg.homeTeam.trim()) {
        toast.error("Preencha o time da casa em todas as apostas");
        return;
      }
      if (!leg.awayTeam.trim()) {
        toast.error("Preencha o time visitante em todas as apostas");
        return;
      }
      if (!leg.category) {
        toast.error("Selecione uma categoria de mercado em todas as apostas");
        return;
      }
      if (!leg.selection) {
        toast.error("Selecione uma opção de mercado em todas as apostas");
        return;
      }
      if (!leg.odd || parseFloat(leg.odd) <= 0) {
        toast.error("Preencha a odd corretamente em todas as apostas");
        return;
      }
    }

    onSubmit({
      legs,
      totalOdd,
      betLink
    });
  };

  // Verificar se a categoria precisa de nome do jogador
  const needsPlayerName = (category: string) => {
    return category.toLowerCase().includes("jogador");
  };

  return (
    <div className="space-y-6">
      {/* Header com contador de apostas */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Criar Bilhete</h3>
            <p className="text-xs text-muted-foreground">
              {legs.length} {legs.length === 1 ? 'aposta' : 'apostas'} • Odd Total: <span className="text-primary font-bold">{totalOdd.toFixed(2)}</span>
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={addLeg}
          variant="outline"
          size="sm"
          className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
        >
          <Plus className="w-4 h-4" />
          Adicionar Aposta
        </Button>
      </div>

      {/* Lista de apostas */}
      <div className="space-y-4">
        {legs.map((leg, index) => (
          <div
            key={leg.id}
            className="relative bg-card/50 border border-border/50 rounded-xl p-4 space-y-4"
          >
            {/* Número e botão remover */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">
                Aposta #{index + 1}
              </span>
              {legs.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                  onClick={() => removeLeg(leg.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Times */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Time Casa</Label>
                <Input
                  placeholder="Ex: Flamengo"
                  value={leg.homeTeam}
                  onChange={(e) => updateLeg(leg.id, "homeTeam", e.target.value)}
                  className="bg-background/50 border-border/50"
                  data-testid={`input-home-team-${index}`}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Time Visitante</Label>
                <Input
                  placeholder="Ex: Palmeiras"
                  value={leg.awayTeam}
                  onChange={(e) => updateLeg(leg.id, "awayTeam", e.target.value)}
                  className="bg-background/50 border-border/50"
                  data-testid={`input-away-team-${index}`}
                />
              </div>
            </div>

            {/* Liga e Horário */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Liga/Competição</Label>
                <Input
                  placeholder="Ex: Brasileirão"
                  value={leg.league}
                  onChange={(e) => updateLeg(leg.id, "league", e.target.value)}
                  className="bg-background/50 border-border/50"
                  data-testid={`input-league-${index}`}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Horário do Jogo</Label>
                <Input
                  type="datetime-local"
                  value={leg.matchTime}
                  onChange={(e) => updateLeg(leg.id, "matchTime", e.target.value)}
                  className="bg-background/50 border-border/50"
                  data-testid={`input-match-time-${index}`}
                />
              </div>
            </div>

            {/* Categoria de Mercado */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Categoria do Mercado</Label>
              <Select
                value={leg.category}
                onValueChange={(value) => {
                  updateLeg(leg.id, "category", value);
                  updateLeg(leg.id, "selection", ""); // Reset selection when category changes
                }}
              >
                <SelectTrigger className="bg-background/50 border-border/50" data-testid={`select-category-${index}`}>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {Object.keys(MARKET_CATEGORIES).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Nome do Jogador (se necessário) */}
            {needsPlayerName(leg.category) && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Nome do Jogador</Label>
                <Input
                  placeholder="Ex: Gabigol"
                  value={leg.playerName || ""}
                  onChange={(e) => updateLeg(leg.id, "playerName", e.target.value)}
                  className="bg-background/50 border-border/50"
                  data-testid={`input-player-${index}`}
                />
              </div>
            )}

            {/* Seleção do Mercado */}
            {leg.category && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Seleção</Label>
                <Select
                  value={leg.selection}
                  onValueChange={(value) => updateLeg(leg.id, "selection", value)}
                >
                  <SelectTrigger className="bg-background/50 border-border/50" data-testid={`select-selection-${index}`}>
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {MARKET_CATEGORIES[leg.category as keyof typeof MARKET_CATEGORIES]?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Odd */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Odd</Label>
              <Input
                type="number"
                step="0.01"
                min="1"
                placeholder="Ex: 1.85"
                value={leg.odd}
                onChange={(e) => updateLeg(leg.id, "odd", e.target.value)}
                className="bg-background/50 border-border/50"
                data-testid={`input-odd-${index}`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Link da aposta */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Link do Bilhete (opcional)</Label>
        <Input
          placeholder="https://www.bet365.com/..."
          value={betLink}
          onChange={(e) => setBetLink(e.target.value)}
          className="bg-background/50 border-border/50"
          data-testid="input-bet-link"
        />
      </div>

      {/* Resumo e Botão de Enviar */}
      <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Odd Total</p>
            <p className="text-3xl font-bold text-primary">{totalOdd.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Tipo</p>
            <p className="text-lg font-semibold text-white">
              {legs.length === 1 ? "Simples" : `Múltipla (${legs.length})`}
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-black font-bold gap-2"
          data-testid="button-submit-ticket"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Disparar Bilhete
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
