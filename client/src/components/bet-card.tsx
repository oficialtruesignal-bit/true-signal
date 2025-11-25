import { Signal } from "@/lib/mock-data";
import { Copy, Check, Trophy, XCircle, Clock, ExternalLink } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface BetCardProps {
  signal: Signal;
}

export function BetCard({ signal }: BetCardProps) {
  const handleBet = () => {
    // Haptic Feedback (if supported)
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    if (signal.betLink) {
      // Try to open link
      window.open(signal.betLink, "_blank");
      toast({
        title: "Link copiado!",
        description: "Boa sorte na entrada.",
        className: "bg-primary/10 border-primary/20 text-primary",
      });
    } else {
       // Just copy text if no link
       navigator.clipboard.writeText(`${signal.homeTeam} x ${signal.awayTeam} - ${signal.market}`);
       toast({
        title: "Entrada Copiada!",
        description: "Cole na sua casa de aposta.",
        className: "bg-primary/10 border-primary/20 text-primary",
      });
    }
  };

  const getStatusColor = (status: Signal["status"]) => {
    switch (status) {
      case "green": return "text-primary border-primary/20 bg-primary/10";
      case "red": return "text-red-500 border-red-500/20 bg-red-900/10";
      default: return "text-yellow-500 border-yellow-500/20 bg-yellow-500/10";
    }
  };

  const getStatusIcon = (status: Signal["status"]) => {
    switch (status) {
      case "green": return <Trophy className="w-3 h-3 mr-1" />;
      case "red": return <XCircle className="w-3 h-3 mr-1" />;
      default: return <Clock className="w-3 h-3 mr-1" />;
    }
  };

  return (
    <div className="group relative bg-card hover:bg-card-hover border border-primary/20 dark:border-primary/20 border-gray-200 transition-all duration-300 rounded-xl p-5 shadow-lg hover:shadow-[0_0_20px_rgba(51,184,100,0.1)] overflow-hidden flex flex-col h-full animate-in zoom-in-95 duration-300">
      
      <div className="relative z-10 flex flex-col gap-4 flex-1">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_5px_#33b864]" />
              {signal.league}
            </span>
          </div>
          <div className={cn(
            "px-2 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide flex items-center",
            getStatusColor(signal.status)
          )}>
            {getStatusIcon(signal.status)}
            {signal.status}
          </div>
        </div>

        {/* Teams */}
        <div className="flex flex-col gap-1 py-2 flex-1">
          <h3 className="text-lg font-display font-bold text-foreground leading-tight">
            {signal.homeTeam}
          </h3>
          <span className="text-xs text-muted-foreground font-mono">vs</span>
          <h3 className="text-lg font-display font-bold text-foreground leading-tight">
            {signal.awayTeam}
          </h3>
        </div>

        {/* Market & Odd */}
        <div className="flex items-center justify-between bg-black/40 dark:bg-black/40 bg-white/60 rounded-lg p-3 border border-gray-200 dark:border-white/5">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase">Mercado</span>
            <span className="text-sm font-medium text-foreground">{signal.market}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-muted-foreground uppercase">Odd</span>
            <span className="text-lg font-bold text-primary font-mono drop-shadow-[0_0_5px_rgba(51,184,100,0.5)]">@{signal.odd.toFixed(2)}</span>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={handleBet}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary hover:bg-primary-dark text-primary-foreground text-sm font-bold uppercase tracking-wide transition-all duration-200 shadow-[0_0_15px_rgba(51,184,100,0.2)] hover:shadow-[0_0_25px_rgba(51,184,100,0.4)] mt-2 group/btn border border-primary/50 active:scale-95"
        >
          COPIAR ENTRADA
          <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
