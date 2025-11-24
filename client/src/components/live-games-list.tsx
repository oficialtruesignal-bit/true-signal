import { LiveGame } from "@/lib/mock-data";
import { Clock } from "lucide-react";

export function LiveGamesList({ games }: { games: LiveGame[] }) {
  return (
    <div className="space-y-4">
      {games.map((game) => (
        <div key={game.id} className="bg-card border border-white/5 hover:border-primary/20 transition-all p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-4 w-1/3">
            <span className="text-xs font-bold text-muted-foreground uppercase w-16">{game.minute}'</span>
            <div className="flex flex-col">
              <span className="font-display font-bold text-white">{game.homeTeam}</span>
              <span className="font-display font-bold text-white">{game.awayTeam}</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center w-1/3">
            <div className="bg-black/40 px-4 py-2 rounded-lg border border-white/5 font-mono text-xl font-bold text-primary tracking-widest">
              {game.homeScore} - {game.awayScore}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-green-500 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              AO VIVO
            </div>
          </div>

          <div className="w-1/3 flex justify-end">
             <button className="px-3 py-1.5 text-xs font-bold bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/5 transition-colors">
               Ver Estatísticas
             </button>
          </div>
        </div>
      ))}
    </div>
  );
}
