import { Signal, BetLeg } from "@/lib/mock-data";
import { Copy, Trophy, Users, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface BetCardProps {
  signal: Signal;
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
          className: "bg-primary/10 text-primary border-primary/30"
        };
      case "red":
        return {
          text: "VERMELHO",
          className: "bg-red-500/10 text-red-500 border-red-500/30"
        };
      default:
        return {
          text: "PENDENTE",
          className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"
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
      className="relative bg-[#0a0a0a] border border-[#33b864]/30 rounded-lg p-3 hover:border-[#33b864]/50 transition-all duration-200 overflow-hidden"
      data-testid={`bet-card-${signal.id}`}
    >
      {/* Main Horizontal Layout */}
      <div className="flex gap-3">
        {/* LEFT COLUMN - Game Info (70%) */}
        <div className="flex-1 flex flex-col gap-2">
          {/* Line 1: Header - League & Time */}
          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-sora">
            <span className="px-2 py-0.5 bg-[#121212] rounded border border-[#222] uppercase tracking-wide">
              {signal.league}
            </span>
            <span className="font-mono">{displayTime}</span>
            {/* Status Badge */}
            <div className={cn(
              "ml-auto px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider font-sora",
              statusBadge.className
            )}>
              {statusBadge.text}
            </div>
          </div>

          {/* Line 2: The Match - Horizontal */}
          {hasMultipleLegs ? (
            // Multiple legs - show count
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Target className="w-3 h-3 text-primary" />
              </div>
              <span className="text-lg font-sora font-bold text-white">
                Múltipla ({signal.legs!.length} Jogos)
              </span>
            </div>
          ) : (
            // Single match
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#121212] border border-[#222]" />
              <span className="text-lg font-sora font-bold text-white">
                {signal.homeTeam}
              </span>
              <span className="text-sm text-gray-500 font-sora">vs</span>
              <span className="text-lg font-sora font-bold text-white">
                {signal.awayTeam}
              </span>
              <div className="w-6 h-6 rounded-full bg-[#121212] border border-[#222]" />
            </div>
          )}

          {/* Line 3: Market */}
          <div className="flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-primary" />
            <div className="flex flex-col">
              <span className="text-sm font-sora font-semibold text-white">
                {hasMultipleLegs ? "Aposta Combinada" : signal.market}
              </span>
              <span className="text-[10px] text-gray-500 font-sora">Mercado Principal</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - ODD & Action (30%) */}
        <div className="flex flex-col gap-2 items-end justify-between min-w-[120px]">
          {/* ODD Box */}
          <div className="bg-[#33b864]/10 border border-[#33b864]/30 rounded-lg px-4 py-2 text-center">
            <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-0.5 font-sora">ODD</div>
            <div className="text-3xl font-sora font-extrabold text-[#33b864]">
              @{totalOdd.toFixed(2)}
            </div>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            data-testid={`button-copy-${signal.id}`}
            className="w-full bg-[#33b864] hover:bg-[#289a54] text-black font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 text-xs transition-colors font-sora uppercase tracking-wide"
          >
            <Copy className="w-3.5 h-3.5" />
            Copiar
          </button>
        </div>
      </div>

      {/* Footer - Badges (ID & Copy Count) */}
      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#222]">
        <span className="text-[9px] text-gray-600 font-mono">
          #{signalId}
        </span>
        <div className="flex items-center gap-1 text-[9px] text-gray-600">
          <Users className="w-3 h-3" />
          <span className="font-mono">{copyCount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
