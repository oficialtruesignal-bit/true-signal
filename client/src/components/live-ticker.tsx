import { Signal } from "@/lib/mock-data";
import { ArrowUpRight } from "lucide-react";

export function LiveTicker({ signals }: { signals: Signal[] }) {
  return (
    <div className="w-full bg-card border-y border-gray-200 dark:border-white/5 overflow-hidden py-2 mb-6">
      <div className="flex animate-scroll whitespace-nowrap">
        {[...signals, ...signals].map((signal, i) => (
          <div key={`${signal.id}-${i}`} className="flex items-center gap-2 mx-6 text-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-bold text-foreground">{signal.homeTeam} vs {signal.awayTeam}</span>
            <span className="text-muted-foreground text-xs">({signal.market})</span>
            <span className="font-mono text-primary font-bold">{signal.odd}</span>
            <ArrowUpRight className="w-3 h-3 text-green-500" />
          </div>
        ))}
      </div>
      
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
