import { Signal } from "@/lib/mock-data";
import { Copy, Heart, Brain, TrendingUp, Info, ChevronDown, ChevronUp, Check, Eye, Pencil, Trash2 } from "lucide-react";
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

function TeamShield({ teamName, logoUrl: propLogoUrl, size = "md" }: { teamName: string; logoUrl?: string | null; size?: "sm" | "md" | "lg" }) {
  const [imageError, setImageError] = useState(false);
  const fallbackLogoUrl = getTeamLogo(teamName);
  const logoUrl = propLogoUrl || fallbackLogoUrl;
  
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  };
  
  if (logoUrl && !imageError) {
    return (
      <img 
        src={logoUrl} 
        alt={teamName}
        className={cn(sizeClasses[size], "rounded-full object-cover bg-white/5")}
        onError={() => setImageError(true)}
      />
    );
  }
  
  const initial = teamName?.charAt(0)?.toUpperCase() || '?';
  return (
    <div className={cn(
      sizeClasses[size], 
      "rounded-full bg-[#33b864]/20 flex items-center justify-center border border-[#33b864]/40"
    )}>
      <span className={cn(
        "text-[#33b864] font-bold",
        size === "sm" ? "text-xs" : size === "md" ? "text-base" : "text-lg"
      )}>{initial}</span>
    </div>
  );
}

function AnalysisModal({ signal, isOpen, onClose }: { signal: Signal; isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl p-5 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#33b864]/20 flex items-center justify-center">
              <Brain className="w-4 h-4 text-[#33b864]" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">TRUE SIGNAL IA</p>
              <p className="text-[10px] text-gray-500">Análise automatizada</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <span className="text-gray-400 text-xl">×</span>
          </button>
        </div>
        
        {signal.analysisSummary && (
          <div className="p-4 bg-[#0d0d0d] rounded-xl border border-white/5">
            <p className="text-sm text-gray-200 leading-relaxed pl-3 border-l-2 border-[#33b864]">
              "{signal.analysisSummary}"
            </p>
          </div>
        )}
        
        <div className="space-y-2">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide">Dados utilizados:</p>
          <div className="flex flex-wrap gap-2">
            {signal.homeTeam && signal.homeGoalsAvg && (
              <span className="px-2 py-1 text-[10px] bg-white/5 text-gray-400 rounded border border-white/10">
                {signal.homeTeam}: {parseFloat(String(signal.homeGoalsAvg)).toFixed(2)} gols/jogo
              </span>
            )}
            {signal.awayTeam && signal.awayGoalsAvg && (
              <span className="px-2 py-1 text-[10px] bg-white/5 text-gray-400 rounded border border-white/10">
                {signal.awayTeam}: {parseFloat(String(signal.awayGoalsAvg)).toFixed(2)} gols/jogo
              </span>
            )}
            {signal.probability && (
              <span className="px-2 py-1 text-[10px] bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">
                Probabilidade: {signal.probability.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          {signal.confidence && (
            <span className={cn(
              "text-sm font-bold",
              signal.confidence >= 85 ? "text-green-400" :
              signal.confidence >= 75 ? "text-yellow-400" : "text-orange-400"
            )}>
              {signal.confidence.toFixed(0)}% confiança
            </span>
          )}
          {signal.expectedValue && signal.expectedValue > 0 && (
            <span className="text-sm font-bold text-green-400">
              +{signal.expectedValue.toFixed(1)}% EV
            </span>
          )}
        </div>
      </div>
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
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [hasFetchedFromAPI, setHasFetchedFromAPI] = useState(false);
  
  const userBet = getBet(signal.id);
  const userHasEntered = hasEntered(signal.id);
  
  const parsedLegs = (() => {
    if (!signal.legs) return [];
    if (Array.isArray(signal.legs)) return signal.legs;
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
  const isComboTip = signal.isCombo ?? hasMultipleLegs;
  
  useEffect(() => {
    if (isComboTip) return;
    const hasLogosInDB = signal.homeTeamLogo && signal.awayTeamLogo;
    if (hasLogosInDB || hasFetchedFromAPI || !signal.fixtureId) return;

    const fetchFixtureData = async () => {
      try {
        const response = await axios.get(`/api/football/fixtures/${signal.fixtureId}`);
        const fixture = response.data.response?.[0];
        
        if (fixture) {
          if (fixture.league?.name) setOfficialLeague(fixture.league.name);
          if (fixture.fixture?.date) setOfficialMatchTime(fixture.fixture.date);
          if (fixture.teams?.home?.logo) setHomeTeamLogo(fixture.teams.home.logo);
          if (fixture.teams?.away?.logo) setAwayTeamLogo(fixture.teams.away.logo);
        }
        setHasFetchedFromAPI(true);
      } catch (error) {
        console.error('Erro ao buscar fixture:', error);
        setHasFetchedFromAPI(true);
      }
    };
    
    fetchFixtureData();
  }, [signal.fixtureId, hasFetchedFromAPI, isComboTip, signal.homeTeamLogo, signal.awayTeamLogo]);

  const totalOdd = (() => {
    if (signal.odd) return parseFloat(String(signal.odd));
    if (parsedLegs.length > 0) {
      return parsedLegs.reduce((acc, leg) => acc * (leg.odd || 1), 1);
    }
    return 1;
  })();

  const expectedValue = signal.expectedValue || 0;
  const stakeUnits = 2.0;
  const stakeValue = unitValue ? (stakeUnits * unitValue) : 2;

  const handleCopy = async () => {
    if (signal.betLink) {
      window.open(signal.betLink, '_blank');
      toast({
        title: "Abrindo Bet365...",
        description: "Você será redirecionado para fazer sua aposta.",
      });
    } else {
      const textToCopy = isComboTip
        ? parsedLegs.map(leg => `${leg.homeTeam} x ${leg.awayTeam} - ${leg.market}: ${leg.outcome} @${leg.odd?.toFixed(2)}`).join('\n')
        : `${signal.homeTeam} x ${signal.awayTeam} - ${signal.market} @${totalOdd.toFixed(2)}`;
      
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      toast({
        title: "Bilhete copiado!",
        description: "Cole na sua casa de apostas.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleStatusChange = async (newStatus: 'pending' | 'green' | 'red') => {
    try {
      await tipsService.updateStatus(signal.id, newStatus);
      setCurrentStatus(newStatus);
      queryClient.invalidateQueries({ queryKey: ['tips'] });
      toast({
        title: "Status atualizado",
        description: `Bilhete marcado como ${newStatus === 'green' ? 'GANHOU' : newStatus === 'red' ? 'PERDIDA' : 'PENDENTE'}`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await tipsService.delete(signal.id);
      queryClient.invalidateQueries({ queryKey: ['tips'] });
      toast({
        title: "Bilhete removido",
        description: "O bilhete foi deletado com sucesso.",
      });
      onDelete?.();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível deletar o bilhete.",
        variant: "destructive",
      });
    }
    setShowDeleteDialog(false);
  };

  const displayHomeTeam = isComboTip ? parsedLegs[0]?.homeTeam : signal.homeTeam;
  const displayAwayTeam = isComboTip ? parsedLegs[0]?.awayTeam : signal.awayTeam;
  const displayHomeLogo = isComboTip ? parsedLegs[0]?.homeTeamLogo : homeTeamLogo;
  const displayAwayLogo = isComboTip ? parsedLegs[0]?.awayTeamLogo : awayTeamLogo;
  const displayLeague = isComboTip ? parsedLegs[0]?.league || signal.league : officialLeague;
  const displayDateTime = (() => {
    if (isComboTip) {
      const legTime = parsedLegs[0]?.time;
      if (legTime) {
        const today = new Date();
        const day = today.getDate().toString().padStart(2, '0');
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        return `${day}/${month} • ${legTime}`;
      }
      return null;
    }
    if (officialMatchTime) {
      const date = new Date(officialMatchTime);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${day}/${month} • ${hours}:${minutes}`;
    }
    return null;
  })();

  const markets = isComboTip && parsedLegs.length > 0
    ? parsedLegs.map(leg => ({ text: `${leg.market}${leg.outcome ? ': ' + leg.outcome : ''}`, odd: leg.odd }))
    : signal.market.split('\n').filter(line => line.trim()).map(line => ({ text: line.trim(), odd: null }));

  const hasAnalysis = signal.analysisSummary || signal.confidence || signal.expectedValue;

  return (
    <>
      <div 
        className="w-full bg-[#0a0a0a] border-2 border-[#33b864]/40 rounded-2xl overflow-hidden shadow-lg shadow-[#33b864]/10"
        data-testid={`bet-card-${signal.id}`}
      >
        {/* BLOCO A: HEADER - Favoritar + Badges EV/ODD */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(signal.id)}
              disabled={isFavoritesPending}
              className={cn(
                "w-10 h-10 rounded-xl border flex items-center justify-center transition-all",
                tipIsFavorited 
                  ? "bg-red-500/10 border-red-500/30 text-red-500" 
                  : "bg-transparent border-white/20 text-gray-500 hover:text-red-400 hover:border-red-500/30"
              )}
              data-testid={`button-favorite-${signal.id}`}
            >
              <Heart className={cn("w-5 h-5", tipIsFavorited && "fill-current")} />
            </button>
            
            {isAdmin && (
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setShowDeleteDialog(true)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/10 flex items-center justify-center transition-colors"
                  data-testid="delete-signal-button"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#33b864]/10 flex items-center justify-center transition-colors"
                      data-testid="edit-status-button"
                    >
                      <Pencil className="w-4 h-4 text-[#33b864]" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-[#121212] border-[#33b864]/30">
                    <DropdownMenuItem onClick={() => handleStatusChange('pending')} className="text-[#33b864] cursor-pointer hover:bg-[#33b864]/10">
                      ⏳ PENDENTE
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('green')} className="text-green-500 cursor-pointer hover:bg-green-500/10">
                      ✅ GANHOU
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('red')} className="text-red-500 cursor-pointer hover:bg-red-500/10">
                      ❌ PERDIDA
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {expectedValue > 0 && (
              <div className="px-3 py-1.5 rounded-lg bg-[#33b864]/10 border border-[#33b864]/30">
                <span className="text-[#33b864] font-bold text-sm">+EV {expectedValue.toFixed(1)}%</span>
              </div>
            )}
            <div className="px-4 py-1.5 rounded-lg bg-[#33b864]">
              <span className="text-black font-bold text-sm">ODD {totalOdd.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* BLOCO B: INFORMAÇÕES DO JOGO */}
        <div className="mx-4 p-4 bg-white/5 rounded-xl border border-white/5">
          <div className="flex items-center justify-between">
            <TeamShield teamName={displayHomeTeam || ''} logoUrl={displayHomeLogo} size="lg" />
            
            <div className="flex-1 text-center px-2 min-w-0">
              <p className="text-white font-bold text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                {displayHomeTeam} <span className="text-gray-500 font-normal">x</span> {displayAwayTeam}
              </p>
              <p className="text-gray-500 text-xs mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
                {displayLeague}{displayDateTime ? ` • ${displayDateTime}` : ''}
              </p>
            </div>
            
            <TeamShield teamName={displayAwayTeam || ''} logoUrl={displayAwayLogo} size="lg" />
          </div>
        </div>

        {/* BLOCO C: LISTA DE MERCADOS COM TIMELINE */}
        <div className="px-4 py-4">
          <div className="relative pl-6">
            {markets.length > 1 && (
              <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-[#33b864]"></div>
            )}
            
            <div className="space-y-3">
              {markets.map((market, idx) => (
                <div key={idx} className="relative flex items-center gap-3">
                  <div className="absolute -left-6 w-4 h-4 rounded-full bg-[#33b864] flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-black" strokeWidth={3} />
                  </div>
                  <div className="flex-1">
                    <span className="text-white font-medium text-sm">{market.text}</span>
                    {market.odd && (
                      <span className="text-gray-400 text-sm ml-1">(@{market.odd.toFixed(2)})</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BLOCO D: RODAPÉ DE AÇÃO */}
        <div className="px-4 pb-4 space-y-3">
          {/* Linha 1: Entrada + Ver Análise */}
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 bg-[#1a1a1a] rounded-lg border border-white/10">
              <span className="text-gray-400 text-xs">Entrada: </span>
              <span className="text-white font-bold text-xs">R$ {stakeValue.toFixed(2)}</span>
              <span className="text-gray-500 text-[10px] ml-1">({stakeUnits.toFixed(1)}u)</span>
            </div>
            
            {hasAnalysis && (
              <button 
                onClick={() => setShowAnalysis(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-transparent border border-white/20 rounded-lg hover:bg-white/5 transition-colors"
                data-testid={`btn-analysis-${signal.id}`}
              >
                <Eye className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-gray-300 text-xs font-medium">VER ANÁLISE</span>
              </button>
            )}
          </div>
          
          {/* Linha 2: Botão Principal */}
          {currentStatus === 'green' ? (
            <div className="w-full h-12 bg-green-500/20 border border-green-500 rounded-xl flex items-center justify-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-bold text-sm uppercase tracking-wide">GANHOU</span>
            </div>
          ) : currentStatus === 'red' ? (
            <div className="w-full h-12 bg-red-500/20 border border-red-500 rounded-xl flex items-center justify-center gap-2">
              <span className="text-red-400 font-bold text-sm uppercase tracking-wide">✗ PERDIDA</span>
            </div>
          ) : (
            <button 
              onClick={handleCopy}
              data-testid={`button-copy-${signal.id}`}
              className="w-full h-12 bg-[#33b864] hover:bg-[#289a54] active:scale-[0.98] transition-all rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#33b864]/20"
            >
              <Copy className="w-5 h-5 text-black" />
              <span className="text-black font-bold text-sm uppercase tracking-wide">
                {isCopied ? "COPIADO!" : "COPIAR BILHETE"}
              </span>
            </button>
          )}
        </div>
      </div>

      <AnalysisModal signal={signal} isOpen={showAnalysis} onClose={() => setShowAnalysis(false)} />
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-[#121212] border-[#33b864]/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Deletar Bilhete?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Esta ação não pode ser desfeita. O bilhete será permanentemente removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
