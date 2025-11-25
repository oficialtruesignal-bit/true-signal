import { Signal, BetLeg } from "@/lib/mock-data";
import { Copy, Trophy, XCircle, Clock, Users } from "lucide-react";
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
          className: "bg-primary/10 text-primary border-primary/30 shadow-[0_0_10px_rgba(51,184,100,0.3)]"
        };
      case "red":
        return {
          text: "VERMELHO",
          className: "bg-red-500/10 text-red-500 border-red-500/30"
        };
      default:
        return {
          text: "PENDENTE",
          className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30 animate-pulse"
        };
    }
  };

  const statusBadge = getStatusBadge(signal.status);
  const copyCount = Math.floor(Math.random() * 2000) + 500;
  const signalId = signal.id.slice(0, 8).toUpperCase();

  return (
    <div 
      className="relative bg-[#0a0a0a] border border-[#33b864]/40 rounded-2xl p-6 shadow-[0_0_30px_rgba(51,184,100,0.15)] hover:shadow-[0_0_40px_rgba(51,184,100,0.25)] transition-all duration-300 overflow-hidden group"
      data-testid={`bet-card-${signal.id}`}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="relative z-10">
        {/* HEADER */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col gap-2">
            <h3 className="font-display font-bold text-white text-lg tracking-tight">
              {signal.league}
            </h3>
            <div className="flex items-center gap-3">
              {/* ID Badge */}
              <span className="text-[10px] text-muted-foreground font-mono px-2 py-1 bg-[#121212] rounded border border-[#222]">
                ID: #{signalId}
              </span>
              {/* Copy Counter */}
              <div className="flex items-center gap-1.5 px-2 py-1 bg-transparent border border-primary/20 rounded text-[10px] text-primary/80">
                <Users className="w-3 h-3" />
                <span className="font-mono">{copyCount.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          {/* STATUS BADGE (Top Right) */}
          <div className={cn(
            "px-3 py-1.5 rounded-full text-[10px] font-bold border uppercase tracking-wider",
            statusBadge.className
          )}>
            {statusBadge.text}
          </div>
        </div>

        {/* ODD TOTAL (Central Highlight) */}
        <div className="bg-[#121212] border border-primary/20 rounded-xl p-6 mb-6 text-center">
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2 font-medium">
            ODD TOTAL
          </div>
          <div className="font-display font-extrabold text-5xl text-[#33b864] drop-shadow-[0_0_20px_rgba(51,184,100,0.6)]" style={{ textShadow: '0 0 30px rgba(51,184,100,0.5), 0 0 60px rgba(51,184,100,0.3)' }}>
            {totalOdd.toFixed(2)}
          </div>
        </div>

        {/* GAMES LIST */}
        <div className="bg-[#121212] border border-[#222] rounded-xl p-4 mb-4">
          {hasMultipleLegs ? (
            // Multiple Legs with Timeline
            <div className="relative pl-6">
              {/* Render each leg */}
              <div className="space-y-4">
                {signal.legs!.map((leg, index) => (
                  <div key={index} className="relative">
                    {/* Timeline Dot */}
                    <div className="absolute -left-[21px] top-2 w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_rgba(51,184,100,0.6)] border-2 border-[#121212] z-10" />
                    
                    {/* Vertical Line connecting to next dot (except for last item) */}
                    {index < signal.legs!.length - 1 && (
                      <div className="absolute -left-[18px] top-5 w-[2px] h-[calc(100%+1rem)] bg-primary/20" />
                    )}
                    
                    {/* Leg Content */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-bold text-white font-display leading-tight">
                            {leg.homeTeam}
                          </span>
                          <span className="text-[10px] text-muted-foreground">vs</span>
                          <span className="text-sm font-bold text-white font-display leading-tight">
                            {leg.awayTeam}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {leg.time}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#222]">
                        <span className="text-xs text-white font-medium">
                          {leg.market}
                        </span>
                        <div className="px-2.5 py-1 bg-primary/20 text-primary rounded-md text-xs font-bold font-mono">
                          @{leg.odd.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Single Leg
            <div className="relative pl-6">
              <div className="absolute left-2 top-2 h-[calc(100%-16px)] w-[2px] bg-primary/20" />
              <div className="absolute left-[5px] top-4 w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_rgba(51,184,100,0.6)] border-2 border-[#121212]" />
              
              <div className="space-y-3 pt-1">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-white font-display leading-tight">
                      {signal.homeTeam}
                    </span>
                    <span className="text-[10px] text-muted-foreground">vs</span>
                    <span className="text-sm font-bold text-white font-display leading-tight">
                      {signal.awayTeam}
                    </span>
                  </div>
                  
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {new Date(signal.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#222]">
                  <span className="text-xs text-white font-medium">
                    {signal.market}
                  </span>
                  <div className="px-2.5 py-1 bg-primary/20 text-primary rounded-md text-xs font-bold font-mono">
                    @{signal.odd.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* COPY BUTTON */}
        <button
          onClick={handleCopy}
          data-testid={`button-copy-${signal.id}`}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-black font-bold uppercase tracking-wide transition-all duration-200 shadow-[0_0_20px_rgba(51,184,100,0.3)] hover:shadow-[0_0_30px_rgba(51,184,100,0.5)] active:scale-98 border-2 border-primary/50"
        >
          <Copy className="w-4 h-4" />
          COPIAR ENTRADA
        </button>
      </div>
    </div>
  );
}
