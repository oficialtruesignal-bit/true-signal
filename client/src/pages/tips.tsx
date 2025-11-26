import { Layout } from "@/components/layout";
import { tipsService } from "@/lib/tips-service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Target, AlertCircle, Ticket, ShieldCheck, LockKeyhole, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { BetCard } from "@/components/bet-card";
import { useLanguage } from "@/hooks/use-language";
import { useAccessControl } from "@/hooks/use-access-control";

const CHECKOUT_URL = 'https://checkout.exemplo.com/ocean-prime'; // Substituir pela URL real

export default function TipsPage() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { canSeeAllTips } = useAccessControl();
  
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
          toast.success(t.tips.newSignalAvailable, {
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
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'tips'
      }, (payload) => {
        console.log('🗑️ Sinal deletado:', payload.old);
        
        // Invalidate to remove deleted signal
        queryClient.invalidateQueries({ queryKey: ['tips'] });
        
        toast.info(t.tips.signalRemoved);
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
      {/* Header de Autoridade */}
      <div className="w-full mb-6">
        
        {/* Título Principal com Ícone */}
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-[#33b864]/10 rounded-lg border border-[#33b864]/20">
            <Ticket className="w-6 h-6 text-[#33b864]" />
          </div>
          <h1 className="text-3xl font-sora font-bold text-white">
            {t.tips.title}
          </h1>
        </div>

        {/* Banner de Credibilidade */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#121212] to-[#0a0a0a] border border-[#33b864]/20 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg shadow-[#33b864]/5">
          
          {/* Efeito de Luz Decorativo */}
          <div className="absolute top-0 left-0 w-1 h-full bg-[#33b864]"></div>
          
          {/* Texto de Assertividade */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#33b864] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#33b864]"></span>
              </span>
              <span className="text-[#33b864] font-bold text-xs uppercase tracking-wider">{t.tips.performanceLabel}</span>
            </div>
            <p className="text-gray-300 text-sm font-inter">
              {t.tips.performanceText} <span className="text-white font-bold font-sora">87%</span> {t.tips.performanceTickets}
            </p>
          </div>

          {/* Selo de Especialista */}
          <div className="flex items-center gap-2 bg-[#33b864]/10 px-3 py-1.5 rounded-full border border-[#33b864]/20">
            <ShieldCheck className="w-4 h-4 text-[#33b864]" />
            <span className="text-[10px] font-bold text-[#33b864] uppercase">{t.tips.expertBadge}</span>
          </div>

        </div>
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
          <span>{t.tips.error}</span>
        </div>
      )}

      {!isLoading && !error && tips.length === 0 && (
        <div className="p-8 text-center bg-[#121212] border border-[#333] rounded-xl">
          <Target className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground text-sm">{t.tips.noTips}</p>
        </div>
      )}

      {!isLoading && !error && tips.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {tips.map((tip, index) => {
            // Trial users see only the 1st tip clearly, 2nd and 3rd are blurred
            // If there are 4+ tips, only blur indices 1 and 2 (2nd and 3rd tips)
            const shouldBlur = !canSeeAllTips && index >= 1 && index <= 2;
            
            return (
              <div key={tip.id} className="relative" data-testid={`tip-container-${index}`}>
                <div className={shouldBlur ? 'blur-sm pointer-events-none select-none' : ''}>
                  <BetCard 
                    signal={tip}
                    onDelete={() => queryClient.invalidateQueries({ queryKey: ['tips'] })}
                  />
                </div>
                
                {shouldBlur && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl border-2 border-[#33b864]/30" data-testid={`paywall-overlay-${index}`}>
                    <div className="text-center p-6">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#33b864]/20 border-2 border-[#33b864] flex items-center justify-center">
                        <LockKeyhole className="w-8 h-8 text-[#33b864]" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
                        Exclusivo Ocean Prime
                      </h3>
                      <p className="text-gray-300 text-sm mb-4">
                        Desbloqueie todos os sinais e maximize seus lucros
                      </p>
                      <a
                        href={CHECKOUT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid="button-unlock-signal"
                      >
                        <button className="px-6 py-3 bg-[#33b864] hover:bg-[#2ea558] text-black font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-xl shadow-[#33b864]/40 flex items-center gap-2 mx-auto">
                          <Sparkles className="w-4 h-4" />
                          Assinar Agora
                        </button>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
