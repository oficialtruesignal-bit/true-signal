import { Layout } from "@/components/layout";
import { BetCard } from "@/components/bet-card";
import { tipsService } from "@/lib/tips-service";
import { useQuery } from "@tanstack/react-query";
import { Target, Loader2, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardCommandCenter } from "@/components/dashboard-command-center";

export default function TipsPage() {
  const { data: tips = [], isLoading, error } = useQuery({
    queryKey: ['tips'],
    queryFn: tipsService.getAll,
    refetchInterval: 30000, // Refresh every 30s
  });

  return (
    <Layout>
      {/* Command Center Hero */}
      <DashboardCommandCenter />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Tips do Dia</h1>
        </div>
        <p className="text-muted-foreground">
          Análises curadas por 20 especialistas + IA com precisão de 97%
        </p>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl bg-white/5" />
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>Erro ao carregar tips. Tente novamente mais tarde.</span>
        </div>
      )}

      {!isLoading && !error && tips.length === 0 && (
        <div className="p-12 text-center rounded-xl bg-card border border-primary/10">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground">Nenhuma tip disponível no momento.</p>
          <p className="text-sm text-muted-foreground/60 mt-2">
            Novos sinais serão publicados em breve.
          </p>
        </div>
      )}

      {!isLoading && !error && tips.length > 0 && (
        <div className="space-y-4">
          {tips.map((tip) => (
            <BetCard key={tip.id} signal={tip} />
          ))}
        </div>
      )}
    </Layout>
  );
}
