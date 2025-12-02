import { Signal } from "@/lib/mock-data";
import { Copy, Users, Pencil, Trash2, Heart, Brain, TrendingUp, Info, ChevronDown, ChevronUp, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { getTeamLogo } from "@/lib/team-logos";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { tipsService } from "@/lib/tips-service";
import { useFavorites } from "@/hooks/use-favorites";
import { useUserBets } from "@/hooks/use-user-bets";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface BetCardProps {
  signal: Signal;
  onDelete?: () => void;
  unitValue?: number | null;
}

// TeamShield Component with Official Logos (40px)
function TeamShield({ teamName, logoUrl: propLogoUrl }: { teamName: string; logoUrl?: string }) {
  const [imageError, setImageError] = useState(false);
  const fallbackLogoUrl = getTeamLogo(teamName);
  const logoUrl = propLogoUrl || fallbackLogoUrl;
  
  if (logoUrl && !imageError) {
    return (
      <img 
        src={logoUrl} 
        alt={teamName}
        className="w-10 h-10 rounded-full object-cover bg-white/5"
        onError={() => setImageError(true)}
      />
    );
  }
  
  const initial = teamName.charAt(0).toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full bg-[#33b864]/20 flex items-center justify-center border border-[#33b864]/40">
      <span className="text-[#33b864] font-sora font-bold text-lg">{initial}</span>
    </div>
  );
}

// Função para abreviar nomes de times longos
function abbreviateTeamName(teamName: string): string {
  if (teamName.length <= 12) return teamName;
  
  // Remove palavras comuns
  const cleaned = teamName
    .replace(/FC /gi, '')
    .replace(/CF /gi, '')
    .replace(/United/gi, 'Utd')
    .replace(/Athletic/gi, 'Ath')
    .replace(/Internacional/gi, 'Inter')
    .replace(/Atlético/gi, 'Atl');
  
  if (cleaned.length <= 12) return cleaned;
  
  // Se ainda estiver grande, trunca
  return cleaned.substring(0, 11) + '.';
}

// Seção de Análise Expandível - Igual ao print do cliente
function AnalysisSection({ signal }: { signal: Signal }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const hasAnalysis = signal.analysisSummary || signal.confidence || signal.expectedValue;
  if (!hasAnalysis) return null;
  
  return (
    <div className="mt-3 pt-3 border-t border-white/5">
      {/* Botão Toggle Expandir/Recolher */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-center gap-2 py-2 text-[#33b864] hover:text-[#289a54] transition-colors"
        data-testid={`btn-toggle-analysis-${signal.id}`}
      >
        <Info className="w-4 h-4" />
        <span className="text-sm font-medium">
          {isExpanded ? 'Ocultar explicação' : 'Ver explicação'}
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      
      {/* Conteúdo Expandido */}
      {isExpanded && (
        <div className="mt-3 p-4 rounded-xl bg-[#0d0d0d] border border-white/10">
          {/* Texto da análise com aspas */}
          {signal.analysisSummary && (
            <div className="mb-4">
              <p className="text-sm text-gray-200 leading-relaxed pl-3 border-l-2 border-[#33b864]">
                "{signal.analysisSummary}"
              </p>
            </div>
          )}
          
          {/* Dados utilizados - Tags */}
          <div className="mb-4">
            <p className="text-[10px] text-gray-500 mb-2 uppercase tracking-wide">Dados utilizados:</p>
            <div className="flex flex-wrap gap-2">
              {signal.homeTeam && (
                <span className="px-2 py-1 text-[10px] bg-white/5 text-gray-400 rounded border border-white/10">
                  {signal.homeTeam} gols: {signal.homeGoalsAvg ? parseFloat(String(signal.homeGoalsAvg)).toFixed(2) : '0.00'} média
                </span>
              )}
              {signal.awayTeam && (
                <span className="px-2 py-1 text-[10px] bg-white/5 text-gray-400 rounded border border-white/10">
                  {signal.awayTeam} gols: {signal.awayGoalsAvg ? parseFloat(String(signal.awayGoalsAvg)).toFixed(2) : '0.00'} média
                </span>
              )}
              {signal.probability && (
                <span className="px-2 py-1 text-[10px] bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">
                  Probabilidade: {signal.probability.toFixed(1)}%
                </span>
              )}
              {signal.odd && signal.expectedValue && (
                <span className="px-2 py-1 text-[10px] bg-green-500/10 text-green-400 rounded border border-green-500/20">
                  Odd Bet365: {parseFloat(String(signal.odd)).toFixed(2)} | EV: +{signal.expectedValue.toFixed(1)}%
                </span>
              )}
            </div>
          </div>
          
          {/* Footer - Assinatura + Badges */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            {/* Assinatura TRUE SIGNAL IA */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#33b864]/20 flex items-center justify-center">
                <Brain className="w-3 h-3 text-[#33b864]" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">TRUE SIGNAL IA</p>
                <p className="text-[10px] text-gray-500">Análise automatizada</p>
              </div>
            </div>
            
            {/* Badges de Confiança e EV */}
            <div className="flex flex-col items-end gap-1">
              {signal.confidence && (
                <span className={cn(
                  "text-xs font-bold",
                  signal.confidence >= 85 ? "text-green-400" :
                  signal.confidence >= 75 ? "text-yellow-400" :
                  "text-orange-400"
                )}>
                  {signal.confidence.toFixed(0)}% confiança
                </span>
              )}
              {signal.expectedValue && signal.expectedValue > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-green-400">
                    +{signal.expectedValue.toFixed(1)}% EV
                  </span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button 
                        className="w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        data-testid={`btn-ev-info-${signal.id}`}
                      >
                        <Info className="w-2.5 h-2.5 text-gray-400" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 bg-[#1a1a1a] border border-white/10 p-3" side="top">
                      <div className="space-y-2">
                        <h4 className="font-bold text-white text-xs flex items-center gap-2">
                          <TrendingUp className="w-3 h-3 text-green-400" />
                          O que é EV?
                        </h4>
                        <p className="text-[10px] text-gray-300 leading-relaxed">
                          <span className="text-green-400 font-semibold">EV positivo</span> significa que a odd oferecida está acima do valor justo calculado pela nossa IA.
                        </p>
                        <div className="bg-green-500/10 rounded-lg p-2 border border-green-500/20">
                          <p className="text-[10px] text-gray-300">
                            A cada R$100 apostados, você tende a lucrar <span className="text-green-400 font-bold">R${signal.expectedValue.toFixed(2)}</span> em média.
                          </p>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function BetCard({ signal, onDelete, unitValue }: BetCardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { isFavorite, toggleFavorite, isPending: isFavoritesPending } = useFavorites();
  const { hasEntered, getBet, enterBet, markResult, isEntering, isMarkingResult } = useUserBets();
  const isAdmin = user?.role === 'admin';
  const [currentStatus, setCurrentStatus] = useState<Signal["status"]>(signal.status);
  const [officialLeague, setOfficialLeague] = useState<string>(signal.league);
  const [officialMatchTime, setOfficialMatchTime] = useState<string | null>(null);
  const [homeTeamLogo, setHomeTeamLogo] = useState<string | null>(signal.homeTeamLogo || null);
  const [awayTeamLogo, setAwayTeamLogo] = useState<string | null>(signal.awayTeamLogo || null);
  const [isCopied, setIsCopied] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [hasFetchedFromAPI, setHasFetchedFromAPI] = useState(false);
  const [isComboExpanded, setIsComboExpanded] = useState(false);
  
  const userBet = getBet(signal.id);
  const userHasEntered = hasEntered(signal.id);
  
  // Use backend-normalized legs (already parsed as array)
  const parsedLegs = (() => {
    if (!signal.legs) return [];
    if (Array.isArray(signal.legs)) return signal.legs;
    // Fallback parsing for legacy data
    if (typeof signal.legs === 'string') {
      try {
        const parsed = JSON.parse(signal.legs);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  })();
  
  const hasMultipleLegs = parsedLegs.length > 1;
  const tipIsFavorited = isFavorite(signal.id);

  // Use explicit isCombo field from backend (with fallback detection for legacy data)
  const isComboTip = signal.isCombo ?? hasMultipleLegs;
  
  // Busca dados oficiais da API-Football se houver fixtureId e não houver logos salvos
  // Não buscar para combos (fixtureId null ou detectado como combo)
  useEffect(() => {
    // Combos não têm fixture único - não buscar
    if (isComboTip) return;
    
    // Se já temos logos salvos no banco, não precisa buscar da API
    const hasLogosInDB = signal.homeTeamLogo && signal.awayTeamLogo;
    if (hasLogosInDB || hasFetchedFromAPI || !signal.fixtureId) return;

    const fetchFixtureData = async () => {
      try {
        console.log(`🔄 Buscando dados do fixture ${signal.fixtureId}...`);
        const response = await axios.get(`/api/football/fixtures/${signal.fixtureId}`);
        const fixture = response.data.response?.[0];
        
        console.log('📊 Dados da API-Football:', fixture);
        
        if (fixture) {
          // Atualiza com dados oficiais
          console.log('✅ Liga oficial:', fixture.league.name);
          console.log('✅ Data oficial:', fixture.fixture.date);
          console.log('✅ Logo casa:', fixture.teams.home.logo);
          console.log('✅ Logo fora:', fixture.teams.away.logo);
          setOfficialLeague(fixture.league.name);
          setOfficialMatchTime(fixture.fixture.date);
          // Só atualiza logos se não estiverem no banco
          if (!signal.homeTeamLogo) setHomeTeamLogo(fixture.teams.home.logo);
          if (!signal.awayTeamLogo) setAwayTeamLogo(fixture.teams.away.logo);
        } else {
          console.log('❌ Nenhum fixture encontrado');
        }
        setHasFetchedFromAPI(true);
      } catch (error) {
        console.error('❌ Erro ao buscar dados da partida:', error);
        setHasFetchedFromAPI(true);
      }
    };

    fetchFixtureData();
  }, [signal.fixtureId, signal.homeTeamLogo, signal.awayTeamLogo, hasFetchedFromAPI, isComboTip]);
  
  // Use explicit totalOdd from backend or calculate from legs
  const totalOdd = signal.totalOdd 
    ? parseFloat(String(signal.totalOdd))
    : (parsedLegs.length > 0
        ? parsedLegs.reduce((acc, leg) => acc * (leg.odd || 1), 1)
        : parseFloat(String(signal.odd)));

  // Mantém o estado local sincronizado com o status do banco de dados
  useEffect(() => {
    setCurrentStatus(signal.status);
  }, [signal.status]);
  
  const handleStatusChange = async (newStatus: Signal["status"]) => {
    const previousStatus = currentStatus;
    
    try {
      // Optimistic UI: atualiza imediatamente
      setCurrentStatus(newStatus);
      
      // Chama a API para persistir
      await tipsService.updateStatus(signal.id, newStatus);
      
      // Invalida cache para refetch em outras páginas
      queryClient.invalidateQueries({ queryKey: ['tips'] });
      
      toast({
        title: "Status atualizado!",
        description: `Bilhete marcado como ${newStatus.toUpperCase()}`,
      });
    } catch (error) {
      // Rollback em caso de erro
      setCurrentStatus(previousStatus);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await tipsService.delete(signal.id);
      
      // Invalida cache para refetch
      queryClient.invalidateQueries({ queryKey: ['tips'] });
      
      toast({
        title: "Sinal deletado!",
        description: "O sinal foi removido com sucesso",
      });
      
      // Callback para atualizar lista
      onDelete?.();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível deletar o sinal",
        variant: "destructive",
      });
    }
  };

  const handleCopy = async () => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    let betText: string;
    if (hasMultipleLegs) {
      betText = `${signal.league}\nODD TOTAL: ${totalOdd.toFixed(2)}\n\n` + 
        parsedLegs.map(leg => `${leg.homeTeam} x ${leg.awayTeam} - ${leg.market} ODD ${(leg.odd || 1).toFixed(2)}`).join('\n');
    } else {
      betText = `${signal.homeTeam} x ${signal.awayTeam} - ${signal.market} ODD ${totalOdd.toFixed(2)}`;
    }
    
    try {
      await navigator.clipboard.writeText(betText);
      
      // Muda para "COPIADO" por 2 segundos
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      
      toast({
        title: "Entrada Copiada!",
        description: "Boa sorte na entrada 🍀",
        className: "bg-primary/10 border-primary/20 text-primary",
      });
      
      if (signal.betLink) {
        setTimeout(() => {
          window.open(signal.betLink, "_blank");
        }, 300);
      }
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Tente novamente",
        className: "bg-red-500/10 border-red-500/20 text-red-500",
      });
    }
  };

  const handleEnterBet = async () => {
    if (!user) {
      toast({
        title: "Faça login",
        description: "Entre na sua conta para registrar suas entradas",
        variant: "destructive",
      });
      return;
    }

    try {
      await enterBet(signal.id, String(signal.stake || '1'), String(totalOdd));
      
      // Também copia o bilhete
      await handleCopy();
      
      toast({
        title: "Entrada registrada! 🎯",
        description: "Agora você pode marcar o resultado depois do jogo",
        className: "bg-primary/10 border-primary/20 text-primary",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível registrar a entrada",
        variant: "destructive",
      });
    }
  };

  const handleMarkResult = async (result: 'green' | 'red') => {
    // Bloqueia se o bilhete já foi resolvido pelo sistema
    if (currentStatus !== 'pending') {
      toast({
        title: "Bilhete já resolvido",
        description: `Este bilhete já foi marcado como ${currentStatus === 'green' ? 'GANHOU' : 'PERDEU'}`,
        variant: "destructive",
      });
      return;
    }
    
    try {
      await markResult(signal.id, result);
      toast({
        title: result === 'green' ? "Parabéns! 🎉" : "Acontece... 💪",
        description: result === 'green' 
          ? "Resultado marcado como GANHOU!" 
          : "Resultado marcado como PERDEU. Vamos recuperar!",
        className: result === 'green' 
          ? "bg-green-500/10 border-green-500/20 text-green-500"
          : "bg-red-500/10 border-red-500/20 text-red-500",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar o resultado",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: Signal["status"]) => {
    switch (status) {
      case "green":
        return {
          text: "GANHOU",
          className: "bg-[#33b864]/5 text-[#33b864] border-[#33b864]"
        };
      case "red":
        return {
          text: "PERDIDA",
          className: "bg-red-500/5 text-red-500 border-red-500"
        };
      default:
        return {
          text: "PENDENTE",
          className: "bg-[#33b864]/5 border-[#33b864] text-[#33b864]"
        };
    }
  };

  const statusBadge = getStatusBadge(currentStatus);
  const copyCount = Math.floor(Math.random() * 2000) + 500;
  const signalId = signal.id.slice(0, 8).toUpperCase();

  // Usa data oficial da API se disponível, senão usa 2h após criação
  const matchDate = officialMatchTime 
    ? new Date(officialMatchTime)
    : new Date(new Date(signal.timestamp).getTime() + 2 * 60 * 60 * 1000);
  
  const matchDateTime = matchDate.toLocaleString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit',
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo'
  });

  // Horário do jogo formatado
  const timeOnly = matchDate.toLocaleString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo'
  });
  const dateOnly = matchDate.toLocaleString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit',
    timeZone: 'America/Sao_Paulo'
  });

  // Data + Horário para o cabeçalho (ex: "27/11 às 18:07")
  const displayTime = hasMultipleLegs && parsedLegs[0]?.time 
    ? parsedLegs[0].time 
    : `${dateOnly} às ${timeOnly}`;

  // Data/hora de criação do bilhete (horário de Brasília)
  const createdDateTime = new Date(signal.timestamp).toLocaleString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit',
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo'
  });

  // Se o signal tem imagem, renderiza o layout de imagem
  if (signal.imageUrl) {
    return (
      <div 
        className="w-full bg-[#242424] border border-white/15 rounded-2xl overflow-hidden shadow-lg shadow-black/50 relative group hover:border-[#33b864]/40 transition-all"
        data-testid={`bet-card-image-${signal.id}`}
      >
        {/* A IMAGEM DO BILHETE */}
        <div className="relative w-full">
          <img 
            src={signal.imageUrl} 
            alt="Bilhete" 
            className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          />

          {/* Badge de Status - só aparece quando pendente */}
          {currentStatus === 'pending' && (
            <div className={cn(
              "absolute top-3 left-3 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wide backdrop-blur-md",
              statusBadge.className,
              "bg-black/80"
            )}>
              {statusBadge.text}
            </div>
          )}

          {/* Editor Admin (apenas para admin) */}
          {isAdmin && (
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              {/* Botão de Deletar */}
              <button 
                onClick={() => setShowDeleteDialog(true)}
                className="p-2 rounded-lg bg-black/80 backdrop-blur-md hover:bg-red-500/20 transition-colors border border-red-500/30"
                data-testid="delete-signal-button"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
              
              {/* Menu de Status */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="p-2 rounded-lg bg-black/80 backdrop-blur-md hover:bg-[#33b864]/20 transition-colors border border-[#33b864]/30"
                    data-testid="edit-status-button"
                  >
                    <Pencil className="w-4 h-4 text-[#33b864]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#121212] border-[#33b864]/30">
                  <DropdownMenuItem
                    onClick={() => handleStatusChange('pending')}
                    className="text-[#33b864] cursor-pointer hover:bg-[#33b864]/10"
                  >
                    ⏳ PENDENTE
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleStatusChange('green')}
                    className="text-green-500 cursor-pointer hover:bg-green-500/10"
                  >
                    ✅ GANHOU
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleStatusChange('red')}
                    className="text-red-500 cursor-pointer hover:bg-red-500/10"
                  >
                    ❌ PERDIDA
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* RODAPÉ COM BOTÃO DE AÇÃO */}
        <div className="p-4 bg-[#121212] border-t border-[#33b864]/10">
          {currentStatus === 'green' ? (
            <div 
              className="w-full bg-green-500/20 border border-green-500 h-12 rounded-xl flex items-center justify-center gap-2"
            >
              <span className="text-green-400 font-sora font-bold text-sm tracking-wide">
                ✓ GANHOU
              </span>
            </div>
          ) : currentStatus === 'red' ? (
            <div 
              className="w-full bg-red-500/20 border border-red-500 h-12 rounded-xl flex items-center justify-center gap-2"
            >
              <span className="text-red-400 font-sora font-bold text-sm tracking-wide">
                ✗ PERDIDA
              </span>
            </div>
          ) : (
            <button 
              onClick={handleCopy}
              data-testid={`button-copy-${signal.id}`}
              className="w-full bg-[#33b864] hover:bg-[#289a54] active:scale-[0.98] transition-all h-12 rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(51,184,100,0.3)]"
            >
              <Copy className="w-5 h-5 text-black" />
              <span className="text-black font-sora font-bold text-sm tracking-wide uppercase">
                {isCopied ? "COPIADO" : "PEGAR BILHETE AGORA"}
              </span>
            </button>
          )}
          
          {/* Metadados */}
          <div className="mt-3 flex items-center gap-3 px-1 text-[9px] text-gray-500 font-mono">
            <span>#{signalId}</span>
            <span>•</span>
            <span>Criado: {createdDateTime}</span>
          </div>
        </div>

        {/* Dialog de confirmação de delete */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="bg-[#121212] border-[#33b864]/30">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Deletar Sinal?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Esta ação não pode ser desfeita. O sinal será permanentemente removido do sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Deletar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // Layout tradicional (sem imagem) - NOVO DESIGN ESTILO BETANO
  return (
    <div 
      className="w-full bg-[#242424] border border-white/15 rounded-2xl overflow-hidden shadow-lg shadow-black/50 relative group"
      data-testid={`bet-card-${signal.id}`}
    >
      {/* --- HEADER: ODD TOTAL + Controles Admin + Favorito --- */}
      {/* Mobile Header: Stacked layout */}
      <div className="sm:hidden px-4 py-3 border-b border-white/10">
        {/* Linha 1: ODD grande e centralizada */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="text-gray-400 text-xs uppercase tracking-wide">Odd do Bilhete</span>
          <span className="text-[#33b864] font-bold text-2xl">{totalOdd.toFixed(2)}</span>
        </div>
        {/* Linha 2: Ações */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(signal.id)}
              disabled={isFavoritesPending}
              className={cn(
                "p-2 rounded-lg transition-all",
                tipIsFavorited 
                  ? "bg-red-500/20 text-red-500" 
                  : "bg-white/5 text-gray-500 hover:text-red-400 hover:bg-red-500/10"
              )}
              data-testid={`button-favorite-mobile-${signal.id}`}
            >
              <Heart className={cn("w-4 h-4", tipIsFavorited && "fill-current")} />
            </button>
            {isAdmin && (
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setShowDeleteDialog(true)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 transition-colors"
                  data-testid="delete-signal-button-mobile"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className="p-2 rounded-lg bg-white/5 hover:bg-[#33b864]/10 transition-colors"
                      data-testid="edit-status-button-mobile"
                    >
                      <Pencil className="w-4 h-4 text-[#33b864]" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-[#121212] border-[#33b864]/30">
                    <DropdownMenuItem
                      onClick={() => handleStatusChange('pending')}
                      className="text-[#33b864] cursor-pointer hover:bg-[#33b864]/10"
                    >
                      ⏳ PENDENTE
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange('green')}
                      className="text-green-500 cursor-pointer hover:bg-green-500/10"
                    >
                      ✅ GANHOU
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange('red')}
                      className="text-red-500 cursor-pointer hover:bg-red-500/10"
                    >
                      ❌ PERDIDA
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
          {isAdmin && (
            <span className="text-[10px] text-gray-500">{dateOnly} às {timeOnly}</span>
          )}
        </div>
      </div>
      
      {/* Desktop Header: Horizontal layout */}
      <div className="hidden sm:flex px-4 py-3 justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleFavorite(signal.id)}
            disabled={isFavoritesPending}
            className={cn(
              "p-1.5 rounded-lg transition-all",
              tipIsFavorited 
                ? "bg-red-500/20 text-red-500" 
                : "bg-white/5 text-gray-500 hover:text-red-400 hover:bg-red-500/10"
            )}
            data-testid={`button-favorite-${signal.id}`}
          >
            <Heart className={cn("w-4 h-4", tipIsFavorited && "fill-current")} />
          </button>
          {isAdmin && (
            <>
              <span className="text-[10px] text-gray-500">{dateOnly} às {timeOnly}</span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setShowDeleteDialog(true)}
                  className="p-1 rounded hover:bg-red-500/10 transition-colors"
                  data-testid="delete-signal-button-header"
                >
                  <Trash2 className="w-3 h-3 text-red-500" />
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className="p-1 rounded hover:bg-[#33b864]/10 transition-colors"
                      data-testid="edit-status-button"
                    >
                      <Pencil className="w-3 h-3 text-[#33b864]" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#121212] border-[#33b864]/30">
                    <DropdownMenuItem
                      onClick={() => handleStatusChange('pending')}
                      className="text-[#33b864] cursor-pointer hover:bg-[#33b864]/10"
                    >
                      ⏳ PENDENTE
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange('green')}
                      className="text-green-500 cursor-pointer hover:bg-green-500/10"
                    >
                      ✅ GANHOU
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange('red')}
                      className="text-red-500 cursor-pointer hover:bg-red-500/10"
                    >
                      ❌ PERDIDA
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-xs">ODD DO BILHETE</span>
          <span className="text-white font-bold text-xl">{totalOdd.toFixed(2)}</span>
        </div>
      </div>

      {/* --- BODY: Linhas do bilhete com timeline estilo Bet365 --- */}
      <div className="p-4">
        {/* Timeline vertical com bolinhas verdes */}
        <div className="relative pl-5">
          {/* Linha vertical verde conectora */}
          <div className="absolute left-[6px] top-2 bottom-2 w-[2px] bg-[#33b864]"></div>
          
          {/* Para COMBO: mostrar cada leg como linha simples */}
          {isComboTip && parsedLegs.length > 0 ? (
            <div className="space-y-3">
              {parsedLegs.map((leg, idx) => (
                <div key={idx} className="relative flex items-start gap-3">
                  {/* Bolinha verde sólida */}
                  <div className="absolute -left-5 top-1.5 w-3 h-3 rounded-full bg-[#33b864] flex items-center justify-center">
                    <Check className="w-2 h-2 text-black" />
                  </div>
                  {/* Conteúdo da seleção - APENAS mercado/outcome */}
                  <div className="flex-1 ml-1">
                    <p className="text-white font-medium text-sm">
                      {leg.market}: {leg.outcome || ''}
                    </p>
                    <p className="text-gray-500 text-[11px]">
                      @{leg.odd?.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Para aposta simples: mostrar linhas do market */
            <div className="space-y-3">
              {signal.market.split('\n').filter(line => line.trim()).map((line, idx) => (
                <div key={idx} className="relative flex items-start gap-3">
                  {/* Bolinha verde sólida */}
                  <div className="absolute -left-5 top-1.5 w-3 h-3 rounded-full bg-[#33b864] flex items-center justify-center">
                    <Check className="w-2 h-2 text-black" />
                  </div>
                  {/* Texto da linha */}
                  <p className="text-white font-medium text-sm leading-relaxed ml-1">
                    {line.trim()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Times com logos pequenos - para apostas simples E combos */}
        <div className="flex items-center pt-4 mt-4 border-t border-white/10">
          {/* Time Casa */}
          <div className="flex items-center gap-2 flex-1">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-white/5 flex-shrink-0">
              {(isComboTip ? parsedLegs[0]?.homeTeamLogo : homeTeamLogo) ? (
                <img 
                  src={isComboTip ? parsedLegs[0]?.homeTeamLogo : homeTeamLogo} 
                  alt={isComboTip ? parsedLegs[0]?.homeTeam : signal.homeTeam} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#33b864] text-xs font-bold">
                  {(isComboTip ? parsedLegs[0]?.homeTeam : signal.homeTeam)?.charAt(0)}
                </div>
              )}
            </div>
            <span className="text-white text-sm font-medium">
              {isComboTip ? parsedLegs[0]?.homeTeam : signal.homeTeam}
            </span>
          </div>

          {/* X central */}
          <span className="text-gray-500 font-bold text-sm px-3">X</span>

          {/* Time Fora */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className="text-white text-sm font-medium">
              {isComboTip ? parsedLegs[0]?.awayTeam : signal.awayTeam}
            </span>
            <div className="w-6 h-6 rounded-full overflow-hidden bg-white/5 flex-shrink-0">
              {(isComboTip ? parsedLegs[0]?.awayTeamLogo : awayTeamLogo) ? (
                <img 
                  src={isComboTip ? parsedLegs[0]?.awayTeamLogo : awayTeamLogo} 
                  alt={isComboTip ? parsedLegs[0]?.awayTeam : signal.awayTeam} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#33b864] text-xs font-bold">
                  {(isComboTip ? parsedLegs[0]?.awayTeam : signal.awayTeam)?.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Campeonato + Data e Hora do Jogo */}
        <div className="text-center mt-3 pt-3 border-t border-white/5">
          <div className="text-[#33b864] text-xs font-medium mb-1">
            {isComboTip ? parsedLegs[0]?.league || signal.league : officialLeague}
          </div>
          {(isComboTip ? parsedLegs[0]?.time : officialMatchTime) && (
            <span className="text-gray-400 text-xs">
              {isComboTip ? parsedLegs[0]?.time : (() => {
                const date = new Date(officialMatchTime!);
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                return `${day}/${month} às ${hours}:${minutes}`;
              })()}
            </span>
          )}
        </div>
        
        {/* Entrada Recomendada - Layout Responsivo Mobile/Desktop */}
        <div className="mt-4 pt-4 border-t border-white/10">
          {/* Mobile: Layout vertical empilhado */}
          <div className="flex flex-col gap-3 sm:hidden">
            {/* Linha 1: Entrada centralizada */}
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#33b864]/10 border border-[#33b864]/30">
                <span className="text-gray-400 text-xs">Entrada:</span>
                <span className="text-[#33b864] font-bold text-sm">{(signal.stake || 1).toFixed(1)}u</span>
                {unitValue && unitValue > 0 && (
                  <>
                    <span className="text-gray-500 mx-1">=</span>
                    <span className="text-white font-bold text-sm">
                      R$ {((signal.stake || 1) * unitValue).toFixed(2).replace('.', ',')}
                    </span>
                  </>
                )}
              </span>
            </div>
            
            {/* Linha 2: EV e Análise lado a lado */}
            <div className="flex items-center justify-center gap-3">
              {/* EV Badge */}
              {signal.expectedValue && signal.expectedValue > 0 ? (
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30">
                  <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400 font-bold text-xs">
                    EV +{signal.expectedValue.toFixed(1)}%
                  </span>
                </div>
              ) : null}
              
              {/* Botão Análise */}
              {(signal.analysisSummary || signal.confidence || signal.expectedValue) && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 transition-colors"
                      data-testid={`btn-analysis-mobile-${signal.id}`}
                    >
                      <Brain className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-blue-400 font-medium text-[10px]">Ver análise completa</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-[320px] p-0 bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden"
                    side="top"
                    align="center"
                  >
                    {/* Header com gradiente */}
                    <div className="bg-gradient-to-r from-[#33b864]/20 to-blue-500/20 px-4 py-3 border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#33b864]/20 flex items-center justify-center">
                            <Brain className="w-4 h-4 text-[#33b864]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">TRUE SIGNAL IA</p>
                            <p className="text-[10px] text-gray-400">Análise Preditiva</p>
                          </div>
                        </div>
                        {signal.confidence && (
                          <span className={cn(
                            "px-2 py-1 rounded text-[10px] font-bold",
                            signal.confidence >= 85 ? "bg-green-500/20 text-green-400" :
                            signal.confidence >= 75 ? "bg-yellow-500/20 text-yellow-400" : "bg-orange-500/20 text-orange-400"
                          )}>
                            {signal.confidence.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-3 space-y-3 max-h-[300px] overflow-y-auto">
                      {signal.analysisSummary && (
                        <div className="bg-white/5 rounded-lg p-2.5">
                          <p className="text-[11px] text-gray-300 leading-relaxed">
                            "{signal.analysisSummary}"
                          </p>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
          
          {/* Desktop: Layout horizontal original */}
          <div className="hidden sm:flex items-center justify-between gap-2">
            {/* EV Badge - Esquerda */}
            <div className="flex-shrink-0">
              {signal.expectedValue && signal.expectedValue > 0 ? (
                <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span className="text-green-400 font-bold text-xs">
                    EV +{signal.expectedValue.toFixed(1)}%
                  </span>
                </div>
              ) : (
                <div className="w-16" />
              )}
            </div>
            
            {/* Entrada - Centro */}
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#33b864]/10 border border-[#33b864]/30">
              <span className="text-gray-400 text-xs">Entrada:</span>
              <span className="text-[#33b864] font-bold text-sm">{(signal.stake || 1).toFixed(1)}u</span>
              {unitValue && unitValue > 0 && (
                <>
                  <span className="text-gray-500">=</span>
                  <span className="text-white font-bold text-sm">
                    R$ {((signal.stake || 1) * unitValue).toFixed(2).replace('.', ',')}
                  </span>
                </>
              )}
            </span>
            
            {/* Botão Análise - Direita */}
            <div className="flex-shrink-0">
              {(signal.analysisSummary || signal.confidence || signal.expectedValue) ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 transition-colors"
                      data-testid={`btn-analysis-popover-${signal.id}`}
                    >
                      <Brain className="w-3 h-3 text-blue-400" />
                      <span className="text-blue-400 font-medium text-xs">Ver análise completa</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-[340px] p-0 bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden"
                    side="top"
                    align="end"
                  >
                    {/* Header com gradiente */}
                    <div className="bg-gradient-to-r from-[#33b864]/20 to-blue-500/20 px-4 py-3 border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#33b864]/20 flex items-center justify-center">
                            <Brain className="w-4 h-4 text-[#33b864]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">TRUE SIGNAL IA</p>
                            <p className="text-[10px] text-gray-400">Análise Preditiva</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {signal.confidence && (
                            <span className={cn(
                              "px-2 py-1 rounded text-[10px] font-bold",
                              signal.confidence >= 85 ? "bg-green-500/20 text-green-400" :
                              signal.confidence >= 75 ? "bg-yellow-500/20 text-yellow-400" : "bg-orange-500/20 text-orange-400"
                            )}>
                              {signal.confidence.toFixed(0)}% Confiança
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-3">
                      {/* Resumo da análise */}
                      {signal.analysisSummary && (
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-[11px] text-gray-300 leading-relaxed">
                            "{signal.analysisSummary}"
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Footer */}
                    <div className="px-4 py-2 bg-white/5 border-t border-white/5">
                      <p className="text-[9px] text-gray-500 text-center">
                        Análise baseada nos últimos 10 jogos de cada time
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <div className="w-16" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- FOOTER: Botão de Ação --- */}
      <div className="px-4 pb-4 space-y-2">
        {/* Botão Copiar Bilhete */}
        <button
          onClick={() => {
            // Gerar texto formatado com bolinhas
            const lines = signal.market.split('\n').filter(line => line.trim());
            const isCombo = lines.length > 1 || signal.isCombo;
            
            let text = `🎯 TRUE SIGNAL\n`;
            text += `━━━━━━━━━━━━━━━━\n\n`;
            
            if (isCombo && parsedLegs.length > 0) {
              text += `📋 COMBO ${parsedLegs.length} SELEÇÕES\n\n`;
              parsedLegs.forEach((leg, idx) => {
                text += `⚫ ${leg.homeTeam} vs ${leg.awayTeam}\n`;
                text += `   📊 ${leg.market}: ${leg.outcome}\n`;
                text += `   💰 Odd: @${leg.odd?.toFixed(2)}\n`;
                if (leg.league) text += `   🏆 ${leg.league}\n`;
                text += `\n`;
              });
              text += `━━━━━━━━━━━━━━━━\n`;
              text += `💎 ODD TOTAL: @${totalOdd.toFixed(2)}\n`;
            } else {
              text += `⚽ ${signal.homeTeam} vs ${signal.awayTeam}\n`;
              text += `🏆 ${officialLeague}\n\n`;
              lines.forEach(line => {
                text += `⚫ ${line.trim()}\n`;
              });
              text += `\n━━━━━━━━━━━━━━━━\n`;
              text += `💎 ODD: @${totalOdd.toFixed(2)}\n`;
            }
            
            text += `📈 Entrada: ${(signal.stake || 1).toFixed(1)}u`;
            if (unitValue && unitValue > 0) {
              text += ` = R$ ${((signal.stake || 1) * unitValue).toFixed(2).replace('.', ',')}`;
            }
            text += `\n`;
            
            if (signal.expectedValue && signal.expectedValue > 0) {
              text += `✅ EV: +${signal.expectedValue.toFixed(1)}%\n`;
            }
            if (signal.confidence) {
              text += `🔒 Confiança: ${signal.confidence.toFixed(0)}%\n`;
            }
            
            text += `\n━━━━━━━━━━━━━━━━\n`;
            text += `🔗 Powered by TRUE SIGNAL`;
            
            navigator.clipboard.writeText(text);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
          }}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 h-10 rounded-xl flex items-center justify-center gap-2 transition-all"
          data-testid={`button-copy-${signal.id}`}
        >
          {isCopied ? (
            <>
              <Check className="w-4 h-4 text-[#33b864]" />
              <span className="text-[#33b864] font-medium text-sm">Bilhete Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300 font-medium text-sm">Copiar Bilhete</span>
            </>
          )}
        </button>
        
        {/* Usuário já marcou resultado próprio */}
        {userBet?.result === 'green' ? (
          <div className="w-full bg-[#33b864] h-12 rounded-xl flex items-center justify-center gap-2">
            <Check className="w-5 h-5 text-black" />
            <span className="text-black font-bold text-sm tracking-wide">
              VOCÊ GANHOU!
            </span>
          </div>
        ) : userBet?.result === 'red' ? (
          <div className="w-full bg-red-500 h-12 rounded-xl flex items-center justify-center gap-2">
            <X className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-sm tracking-wide">
              VOCÊ PERDEU
            </span>
          </div>
        ) : userHasEntered ? (
          /* Usuário entrou mas ainda não marcou resultado - mostrar botões de resultado */
          <div className="space-y-2">
            <p className="text-[10px] text-gray-400 text-center">Qual foi o resultado?</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleMarkResult('green')}
                disabled={isMarkingResult}
                data-testid={`button-mark-green-${signal.id}`}
                className="flex-1 bg-[#33b864] hover:bg-[#289a54] active:scale-[0.98] disabled:opacity-50 transition-all h-12 rounded-xl flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5 text-black" />
                <span className="text-black font-bold text-sm">GANHOU</span>
              </button>
              <button
                onClick={() => handleMarkResult('red')}
                disabled={isMarkingResult}
                data-testid={`button-mark-red-${signal.id}`}
                className="flex-1 bg-red-500 hover:bg-red-600 active:scale-[0.98] disabled:opacity-50 transition-all h-12 rounded-xl flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5 text-white" />
                <span className="text-white font-bold text-sm">PERDEU</span>
              </button>
            </div>
          </div>
        ) : currentStatus === 'green' ? (
          /* Bilhete já foi marcado como ganhou pelo admin - mostrar apenas status */
          <div className="w-full bg-[#33b864] h-12 rounded-xl flex items-center justify-center gap-2">
            <span className="text-black font-bold text-sm tracking-wide">
              ✓ GANHOU
            </span>
          </div>
        ) : currentStatus === 'red' ? (
          <div className="w-full bg-red-500 h-12 rounded-xl flex items-center justify-center gap-2">
            <span className="text-white font-bold text-sm tracking-wide">
              ✗ PERDIDA
            </span>
          </div>
        ) : (
          /* Status pendente - mostrar botão de entrada */
          <button 
            onClick={handleEnterBet}
            disabled={isEntering}
            data-testid={`button-enter-${signal.id}`}
            className="w-full bg-[#33b864] hover:bg-[#289a54] active:scale-[0.98] disabled:opacity-50 transition-all h-12 rounded-xl flex items-center justify-center gap-2"
          >
            <span className="text-black font-bold text-sm tracking-wide">
              {isEntering ? "REGISTRANDO..." : isCopied ? "✓ COPIADO" : "ENTRAR NESSA"}
            </span>
          </button>
        )}
      </div>

      {/* Dialog de confirmação de delete */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-[#121212] border-[#33b864]/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Deletar Sinal?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Esta ação não pode ser desfeita. O sinal será permanentemente removido do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
