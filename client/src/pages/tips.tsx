import { Layout } from "@/components/layout";
import { BetCard } from "@/components/bet-card";
import { tipsService } from "@/lib/tips-service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Target, Loader2, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardCommandCenter } from "@/components/dashboard-command-center";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function TipsPage() {
  const queryClient = useQueryClient();
  
  const { data: tips = [], isLoading, error } = useQuery({
    queryKey: ['tips'],
    queryFn: tipsService.getAll,
    refetchInterval: 30000, // Refresh every 30s
  });

  // Realtime subscription for new tips
  useEffect(() => {
    const channel = supabase
      .channel('tips')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'tips' 
      }, (payload) => {
        console.log('🔔 Nova tip recebida:', payload.new);
        
        // Invalidate and refetch to get the new tip
        queryClient.invalidateQueries({ queryKey: ['tips'] });
        
        // Show toast notification with correct field names
        const newTip = payload.new as any;
        if (newTip.home_team && newTip.away_team && newTip.market) {
          toast.success('Nova Tip Disponível!', {
            description: `${newTip.home_team} vs ${newTip.away_team} - ${newTip.market}`,
          });
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'tips'
      }, (payload) => {
        console.log('🔄 Tip atualizada:', payload.new);
        
        // Only invalidate if status or odd changed (avoid unnecessary refetches)
        const oldTip = payload.old as any;
        const newTip = payload.new as any;
        if (oldTip?.status !== newTip?.status || oldTip?.odd !== newTip?.odd) {
          queryClient.invalidateQueries({ queryKey: ['tips'] });
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime subscription ativa para tips');
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);

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
        <div className="space-y-4 pb-24 md:pb-4">
          {tips.map((tip) => (
            <BetCard key={tip.id} signal={tip} />
          ))}
        </div>
      )}
    </Layout>
  );
}
