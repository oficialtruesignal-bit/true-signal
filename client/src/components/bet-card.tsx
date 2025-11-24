import { Signal } from "@/lib/mock-data";
import { Copy, Check, Trophy, XCircle, Clock } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface BetCardProps {
  signal: Signal;
}

export function BetCard({ signal }: BetCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${signal.homeTeam} vs ${signal.awayTeam} - ${signal.market} @${signal.odd}`);
    setCopied(true);
    toast({
      title: "Aposta copiada!",
      description: "Pronta para colar na sua casa de apostas.",
      className: "bg-card border-white/10 text-white",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: Signal["status"]) => {
    switch (status) {
      case "green": return "text-signal-success border-signal-success/20 bg-signal-success-bg";
      case "red": return "text-signal-error border-signal-error/20 bg-signal-error-bg";
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
    <div className="group relative bg-card hover:bg-card-hover border border-white/5 hover:border-primary/30 transition-all duration-300 rounded-xl p-5 shadow-lg overflow-hidden">
      {/* Hover Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />

      <div className="relative z-10 flex flex-col gap-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
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
        <div className="flex flex-col gap-1 py-2">
          <h3 className="text-lg font-display font-bold text-white leading-tight">
            {signal.homeTeam}
          </h3>
          <span className="text-xs text-muted-foreground font-mono">vs</span>
          <h3 className="text-lg font-display font-bold text-white leading-tight">
            {signal.awayTeam}
          </h3>
        </div>

        {/* Market & Odd */}
        <div className="flex items-center justify-between bg-black/20 rounded-lg p-3 border border-white/5">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase">Mercado</span>
            <span className="text-sm font-medium text-white">{signal.market}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-muted-foreground uppercase">Odd</span>
            <span className="text-lg font-bold text-primary font-mono">@{signal.odd.toFixed(2)}</span>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/5 hover:bg-primary hover:text-white text-sm font-medium transition-all duration-200 border border-white/5 hover:border-primary/50 group/btn"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />}
          {copied ? "Copiado!" : "Copiar Aposta"}
        </button>
      </div>
    </div>
  );
}
