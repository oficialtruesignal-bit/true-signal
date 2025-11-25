import { Signal } from "@/lib/mock-data";
import { Copy, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { getTeamLogo } from "@/lib/team-logos";
import { useState } from "react";

interface BetCardProps {
  signal: Signal;
}

// TeamShield Component with Official Logos
function TeamShield({ teamName }: { teamName: string }) {
  const [imageError, setImageError] = useState(false);
  const logoUrl = getTeamLogo(teamName);
  
  // If logo exists and hasn't errored, show official logo
  if (logoUrl && !imageError) {
    return (
      <img 
        src={logoUrl} 
        alt={teamName}
        className="w-8 h-8 rounded-full object-cover bg-white/5"
        onError={() => setImageError(true)}
      />
    );
  }
  
  // Fallback: Circle with team initial
  const initial = teamName.charAt(0).toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-[#33b864]/20 flex items-center justify-center border border-[#33b864]/40">
      <span className="text-[#33b864] font-sora font-bold text-sm">{initial}</span>
    </div>
  );
}

export function BetCard({ signal }: BetCardProps) {
  const hasMultipleLegs = signal.legs && signal.legs.length > 1;
  
  // Calculate total odd from legs (or use signal.odd for single bets)
  const totalOdd = signal.legs && signal.legs.length > 0
    ? signal.legs.reduce((acc, leg) => acc * leg.odd, 1)
    : signal.odd;
  
  const handleCopy = async () => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Build bet text
    let betText: string;
    if (hasMultipleLegs) {
      betText = `${signal.league}\nODD TOTAL: ${totalOdd.toFixed(2)}\n\n` + 
        signal.legs!.map(leg => `${leg.homeTeam} x ${leg.awayTeam} - ${leg.market} @${leg.odd.toFixed(2)}`).join('\n');
    } else {
      betText = `${signal.homeTeam} x ${signal.awayTeam} - ${signal.market} @${totalOdd.toFixed(2)}`;
    }
    
    try {
      await navigator.clipboard.writeText(betText);
      toast({
        title: "Entrada Copiada!",
        description: "Boa sorte na entrada 🍀",
        className: "bg-primary/10 border-primary/20 text-primary",
      });
      
      // If there's a betLink, open it in background
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
          className: "bg-[#33b864]/10 text-[#33b864] border-[#33b864]"
        };
      case "red":
        return {
          text: "VERMELHO",
          className: "bg-red-500/10 text-red-500 border-red-500"
        };
      default:
        return {
          text: "PENDENTE",
          className: "bg-[#121212] border-[#33b864] text-[#33b864]"
        };
    }
  };

  const statusBadge = getStatusBadge(signal.status);
  const copyCount = Math.floor(Math.random() * 2000) + 500;
  const signalId = signal.id.slice(0, 8).toUpperCase();

  // Get first leg time or signal timestamp
  const displayTime = hasMultipleLegs && signal.legs?.[0]?.time 
    ? signal.legs[0].time 
    : new Date(signal.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div 
      className="bg-[#0a0a0a] border border-[#33b864]/30 rounded-xl p-3 relative overflow-hidden hover:border-[#33b864]/50 transition-colors"
      data-testid={`bet-card-${signal.id}`}
    >
      {/* ----- LINHA SUPERIOR: Liga, Hora e Status ----- */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2 text-xs text-gray-400 font-inter">
          <span className="uppercase font-bold text-[#33b864] font-sora">{signal.league}</span>
          <span>•</span>
          <span className="font-mono">{displayTime}</span>
        </div>
        {/* Badge de Status */}
        <div className={cn(
          "text-[10px] font-bold px-2 py-1 rounded-full uppercase border font-sora",
          statusBadge.className
        )}>
          {statusBadge.text}
        </div>
      </div>

      {/* ----- CORPO PRINCIPAL: GRID RÍGIDO ----- */}
      {hasMultipleLegs ? (
        // Multiple legs - show compact list
        <div className="space-y-2 mb-3">
          <div className="text-center text-sm font-sora font-bold text-white mb-2">
            Múltipla ({signal.legs!.length} Jogos)
          </div>
          {signal.legs!.map((leg, index) => (
            <div key={index} className="bg-[#121212] rounded-lg p-2 border border-white/5">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                {/* Time Casa */}
                <div className="flex items-center justify-end gap-2">
                  <span className="font-sora font-semibold text-white text-sm text-right truncate">{leg.homeTeam}</span>
                  <TeamShield teamName={leg.homeTeam} />
                </div>
                
                {/* VS */}
                <div className="text-gray-500 font-sora font-semibold text-xs text-center px-1">vs</div>
                
                {/* Time Visitante */}
                <div className="flex items-center justify-start gap-2">
                  <TeamShield teamName={leg.awayTeam} />
                  <span className="font-sora font-semibold text-white text-sm text-left truncate">{leg.awayTeam}</span>
                </div>
              </div>
              <div className="mt-1 text-xs text-gray-400 text-center font-sora">{leg.market}</div>
            </div>
          ))}
        </div>
      ) : (
        // Single match - Grid layout
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 mb-3">
          {/* COLUNA 1: Time da Casa (Alinhado à Direita) */}
          <div className="flex items-center justify-end gap-3">
            <span className="font-sora font-bold text-white text-lg text-right truncate">{signal.homeTeam}</span>
            <TeamShield teamName={signal.homeTeam} />
          </div>

          {/* COLUNA 2: VS (Centralizado Fixo) */}
          <div className="text-gray-500 font-sora font-semibold text-sm text-center px-2">vs</div>

          {/* COLUNA 3: Time Visitante (Alinhado à Esquerda) */}
          <div className="flex items-center justify-start gap-3">
            <TeamShield teamName={signal.awayTeam} />
            <span className="font-sora font-bold text-white text-lg text-left truncate">{signal.awayTeam}</span>
          </div>
        </div>
      )}

      {/* ----- RODAPÉ: Mercado, ODD e Botão ----- */}
      <div className="flex items-center justify-between bg-[#121212] rounded-lg p-2 border border-white/5">
        {/* Lado Esquerdo: Mercado */}
        <div className="flex flex-col">
          <span className="text-[#33b864] font-sora font-bold uppercase text-sm">
            {hasMultipleLegs ? "Aposta Combinada" : signal.market}
          </span>
          <span className="text-gray-500 text-[10px] font-sora">Mercado Principal</span>
        </div>

        {/* Lado Direito: ODD + Botão (Agrupados) */}
        <div className="flex items-center gap-2">
          {/* Caixa da ODD */}
          <div className="bg-[#33b864]/10 border border-[#33b864]/40 rounded-md px-3 py-1">
            <span className="text-[#33b864] font-sora font-extrabold text-xl">@{totalOdd.toFixed(2)}</span>
          </div>

          {/* Botão de Copiar Compacto */}
          <button 
            onClick={handleCopy}
            data-testid={`button-copy-${signal.id}`}
            className="bg-[#33b864] hover:bg-[#289a54] text-[#0a0a0a] rounded-md p-2 flex items-center justify-center transition-colors"
          >
            <Copy className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Rodapézinho discreto (IDs) */}
      <div className="mt-2 text-[10px] text-gray-600 flex gap-3 font-mono">
        <span>#{signalId}</span>
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {copyCount.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
