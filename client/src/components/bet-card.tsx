import { Signal } from "@/lib/mock-data";
import { Copy, Users, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { getTeamLogo } from "@/lib/team-logos";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { tipsService } from "@/lib/tips-service";
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

export function BetCard({ signal, onDelete, unitValue }: BetCardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'admin';
  const [currentStatus, setCurrentStatus] = useState<Signal["status"]>(signal.status);
  const [officialLeague, setOfficialLeague] = useState<string>(signal.league);
  const [officialMatchTime, setOfficialMatchTime] = useState<string | null>(null);
  const [homeTeamLogo, setHomeTeamLogo] = useState<string | null>(signal.homeTeamLogo || null);
  const [awayTeamLogo, setAwayTeamLogo] = useState<string | null>(signal.awayTeamLogo || null);
  const [isCopied, setIsCopied] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [hasFetchedFromAPI, setHasFetchedFromAPI] = useState(false);
  const hasMultipleLegs = signal.legs && signal.legs.length > 1;

  // Busca dados oficiais da API-Football se houver fixtureId e não houver logos salvos
  useEffect(() => {
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
  }, [signal.fixtureId, signal.homeTeamLogo, signal.awayTeamLogo, hasFetchedFromAPI]);
  
  const totalOdd = signal.legs && signal.legs.length > 0
    ? signal.legs.reduce((acc, leg) => acc * leg.odd, 1)
    : signal.odd;

  // Simula atualização automática de status após o jogo
  useEffect(() => {
    if (signal.status !== "pending") return;
    
    // Verifica se já passou o horário do jogo
    const matchDate = new Date(new Date(signal.timestamp).getTime() + 2 * 60 * 60 * 1000);
    const now = new Date();
    
    // Se o jogo já passou (mais de 2 horas desde a criação)
    if (now > matchDate) {
      const timer = setTimeout(() => {
        // 70% de chance de ser verde (win)
        const isWin = Math.random() < 0.7;
        setCurrentStatus(isWin ? "green" : "red");
      }, 3000); // Atualiza após 3 segundos
      
      return () => clearTimeout(timer);
    }
  }, [signal.status, signal.timestamp]);
  
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
        signal.legs!.map(leg => `${leg.homeTeam} x ${leg.awayTeam} - ${leg.market} ODD ${leg.odd.toFixed(2)}`).join('\n');
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
  const displayTime = hasMultipleLegs && signal.legs?.[0]?.time 
    ? signal.legs[0].time 
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
        className="w-full bg-[#0a0a0a] border border-[#33b864]/30 rounded-2xl overflow-hidden shadow-lg shadow-[#33b864]/5 relative group hover:border-[#33b864]/50 transition-all"
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
      className="w-full bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-lg relative group"
      data-testid={`bet-card-${signal.id}`}
    >
      {/* --- HEADER: ODD TOTAL + Controles Admin --- */}
      <div className="px-4 py-3 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <span className="text-[10px] text-gray-500">{dateOnly} às {timeOnly}</span>
              <div className="flex items-center gap-1">
                {/* Botão Deletar */}
                <button 
                  onClick={() => setShowDeleteDialog(true)}
                  className="p-1 rounded hover:bg-red-500/10 transition-colors"
                  data-testid="delete-signal-button-header"
                >
                  <Trash2 className="w-3 h-3 text-red-500" />
                </button>
                {/* Menu de Status */}
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

      {/* --- BODY: Linhas do bilhete com timeline --- */}
      <div className="p-4">
        {/* Timeline vertical com bolinhas */}
        <div className="relative pl-6">
          {/* Linha vertical conectora */}
          <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-gray-700"></div>
          
          {/* Cada linha do mercado */}
          <div className="space-y-4">
            {signal.market.split('\n').filter(line => line.trim()).map((line, idx, arr) => (
              <div key={idx} className="relative flex items-start">
                {/* Bolinha */}
                <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-[#1a1a1a] border-2 border-gray-600 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
                </div>
                {/* Texto da linha */}
                <span className="text-white font-medium text-sm leading-relaxed">
                  {line.trim()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Times com logos pequenos */}
        <div className="flex items-center pt-4 mt-4 border-t border-white/10">
          {/* Time Casa */}
          <div className="flex items-center gap-2 flex-1">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-white/5 flex-shrink-0">
              {homeTeamLogo ? (
                <img src={homeTeamLogo} alt={signal.homeTeam} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#33b864] text-xs font-bold">
                  {signal.homeTeam.charAt(0)}
                </div>
              )}
            </div>
            <span className="text-white text-sm font-medium">{signal.homeTeam}</span>
          </div>

          {/* X central */}
          <span className="text-gray-500 font-bold text-sm px-3">X</span>

          {/* Time Fora */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className="text-white text-sm font-medium">{signal.awayTeam}</span>
            <div className="w-6 h-6 rounded-full overflow-hidden bg-white/5 flex-shrink-0">
              {awayTeamLogo ? (
                <img src={awayTeamLogo} alt={signal.awayTeam} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#33b864] text-xs font-bold">
                  {signal.awayTeam.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Campeonato + Data e Hora do Jogo */}
        <div className="text-center mt-3 pt-3 border-t border-white/5">
          <div className="text-[#33b864] text-xs font-medium mb-1">{officialLeague}</div>
          {officialMatchTime && (
            <span className="text-gray-400 text-xs">
              {(() => {
                const date = new Date(officialMatchTime);
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                return `${day}/${month} às ${hours}:${minutes}`;
              })()}
            </span>
          )}
        </div>
        
        {/* Entrada Recomendada - Mostra stake e valor em reais se configurado */}
        <div className="mt-3 pt-3 border-t border-white/5 text-center">
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
        </div>
      </div>

      {/* --- FOOTER: Botão de Ação --- */}
      <div className="px-4 pb-4">
        {currentStatus === 'green' ? (
          <div 
            className="w-full bg-[#33b864] h-12 rounded-xl flex items-center justify-center gap-2"
          >
            <span className="text-black font-bold text-sm tracking-wide">
              ✓ GANHOU
            </span>
          </div>
        ) : currentStatus === 'red' ? (
          <div 
            className="w-full bg-red-500 h-12 rounded-xl flex items-center justify-center gap-2"
          >
            <span className="text-white font-bold text-sm tracking-wide">
              ✗ PERDIDA
            </span>
          </div>
        ) : (
          <button 
            onClick={handleCopy}
            data-testid={`button-copy-${signal.id}`}
            className="w-full bg-[#33b864] hover:bg-[#289a54] active:scale-[0.98] transition-all h-12 rounded-xl flex items-center justify-center gap-2"
          >
            <span className="text-black font-bold text-sm tracking-wide">
              {isCopied ? "✓ COPIADO" : "COPIAR BILHETE"}
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
