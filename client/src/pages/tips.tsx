import { Layout } from "@/components/layout";
import { tipsService } from "@/lib/tips-service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Target, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { BetCard } from "@/components/bet-card";

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
        console.log('🔔 Novo sinal recebido:', payload.new);
        
        // Invalidate and refetch to get the new signal
        queryClient.invalidateQueries({ queryKey: ['tips'] });
        
        // Show toast notification with correct field names
        const newTip = payload.new as any;
        if (newTip.home_team && newTip.away_team && newTip.market) {
          toast.success('Novo Sinal Disponível!', {
            description: `${newTip.home_team} vs ${newTip.away_team} - ${newTip.market}`,
          });
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'tips'
      }, (payload) => {
        console.log('🔄 Sinal atualizado:', payload.new);
        
        // Only invalidate if status or odd changed (avoid unnecessary refetches)
        const oldTip = payload.old as any;
        const newTip = payload.new as any;
        if (oldTip?.status !== newTip?.status || oldTip?.odd !== newTip?.odd) {
          queryClient.invalidateQueries({ queryKey: ['tips'] });
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime subscription ativa para sinais');
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);


  return (
    <Layout>
      {/* Compact Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">Sinais</h1>
        <p className="text-sm text-muted-foreground">
          {tips.length} sinais disponíveis
        </p>
      </div>

      {isLoading && (
        <div className="space-y-1">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full bg-[#1a1a1a]" />
          ))}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Erro ao carregar sinais.</span>
        </div>
      )}

      {!isLoading && !error && tips.length === 0 && (
        <div className="p-8 text-center bg-[#121212] border border-[#333]">
          <Target className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground text-sm">Nenhum sinal disponível no momento.</p>
        </div>
      )}

      {!isLoading && !error && tips.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {tips.map((tip) => (
            <BetCard key={tip.id} signal={tip} />
          ))}
        </div>
      )}
    </Layout>
  );
}
