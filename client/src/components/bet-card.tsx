import { Signal } from "@/lib/mock-data";
import { Copy, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { getTeamLogo } from "@/lib/team-logos";
import { useState, useEffect } from "react";
import axios from "axios";

interface BetCardProps {
  signal: Signal;
}

// TeamShield Component with Official Logos (40px)
function TeamShield({ teamName }: { teamName: string }) {
  const [imageError, setImageError] = useState(false);
  const logoUrl = getTeamLogo(teamName);
  
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

export function BetCard({ signal }: BetCardProps) {
  const [currentStatus, setCurrentStatus] = useState<Signal["status"]>(signal.status);
  const [officialLeague, setOfficialLeague] = useState<string>(signal.league);
  const [officialMatchTime, setOfficialMatchTime] = useState<string | null>(null);
  const hasMultipleLegs = signal.legs && signal.legs.length > 1;

  // Busca dados oficiais da API-Football se houver fixtureId
  useEffect(() => {
    if (!signal.fixtureId) return;

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
          setOfficialLeague(fixture.league.name);
          setOfficialMatchTime(fixture.fixture.date);
        } else {
          console.log('❌ Nenhum fixture encontrado');
        }
      } catch (error) {
        console.error('❌ Erro ao buscar dados da partida:', error);
      }
    };

    fetchFixtureData();
  }, [signal.fixtureId]);
  
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
          text: "VERDE",
          className: "bg-[#33b864]/5 text-[#33b864] border-[#33b864]"
        };
      case "red":
        return {
          text: "VERMELHO",
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

  // Hora do jogo para exibir no cabeçalho (horário de Brasília)
  const displayTime = hasMultipleLegs && signal.legs?.[0]?.time 
    ? signal.legs[0].time 
    : matchDate.toLocaleString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo'
      });

  // Data/hora de criação do bilhete (horário de Brasília)
  const createdDateTime = new Date(signal.timestamp).toLocaleString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit',
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo'
  });

  return (
    <div 
      className="w-full bg-[#0a0a0a] border border-[#33b864]/30 rounded-2xl p-5 shadow-lg shadow-[#33b864]/5 relative overflow-hidden group hover:border-[#33b864]/50 transition-all"
      data-testid={`bet-card-${signal.id}`}
    >
      {/* --- 1. CABEÇALHO (LIGA • HORA + STATUS) --- */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-xs font-bold font-sora tracking-wide whitespace-nowrap">
          <span className="text-[#33b864] uppercase truncate">{officialLeague}</span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-400">{displayTime}</span>
        </div>
        <div className={cn(
          "px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wide",
          statusBadge.className
        )}>
          {statusBadge.text}
        </div>
      </div>

      {/* --- 2. OS TIMES (HORIZONTAL E CENTRALIZADO) --- */}
      <div className="flex items-center justify-center gap-4 mb-6">
        {/* Time Casa */}
        <span className="font-sora font-bold text-white text-xl md:text-2xl">{abbreviateTeamName(signal.homeTeam)}</span>
        
        {/* Escudo Casa */}
        <TeamShield teamName={signal.homeTeam} />

        {/* VS */}
        <span className="text-gray-600 font-sora font-medium text-sm">vs</span>

        {/* Escudo Fora */}
        <TeamShield teamName={signal.awayTeam} />

        {/* Time Fora */}
        <span className="font-sora font-bold text-white text-xl md:text-2xl">{abbreviateTeamName(signal.awayTeam)}</span>
      </div>

      {/* --- 3. CONTAINER DE INFORMAÇÃO (CAIXA ESCURA) --- */}
      <div className="bg-[#121212] rounded-xl p-4 border border-white/5 flex items-center justify-between mb-4">
        
        {/* Lado Esquerdo: Mercado */}
        <div className="flex flex-col gap-1">
          <span className="text-[#33b864] font-sora font-extrabold text-lg uppercase leading-none">
            {hasMultipleLegs ? "APOSTA COMBINADA" : signal.market}
          </span>
          <span className="text-gray-500 text-[10px] font-medium">
            Mercado Principal
          </span>
        </div>

        {/* Lado Direito: ODD */}
        <div className="border border-[#33b864]/50 rounded-lg px-3 py-2 bg-[#33b864]/5">
          <span className="text-[#33b864] font-sora text-sm font-bold mr-1">ODD</span>
          <span className="text-white font-sora text-xl font-extrabold">{totalOdd.toFixed(2)}</span>
        </div>
      </div>

      {/* --- 4. O BOTÃO DE AÇÃO (FULL WIDTH) --- */}
      <button 
        onClick={handleCopy}
        data-testid={`button-copy-${signal.id}`}
        className="w-full bg-[#33b864] hover:bg-[#289a54] active:scale-[0.98] transition-all h-12 rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(51,184,100,0.3)]"
      >
        <Copy className="w-5 h-5 text-black" />
        <span className="text-black font-sora font-bold text-sm tracking-wide">COPIAR BILHETE</span>
      </button>

      {/* --- 5. RODAPÉ (METADADOS) --- */}
      <div className="mt-3 flex items-center gap-3 px-1 text-[9px] text-gray-500 font-mono">
        <span>#{signalId}</span>
        <span>•</span>
        <span>Criado: {createdDateTime}</span>
      </div>

    </div>
  );
}
