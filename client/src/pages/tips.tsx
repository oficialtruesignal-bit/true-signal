import { Layout } from "@/components/layout";
import { tipsService } from "@/lib/tips-service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Target, AlertCircle, Ticket, ShieldCheck, LockKeyhole, Sparkles, ArrowLeft, Gift } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { BetCard } from "@/components/bet-card";
import { useLanguage } from "@/hooks/use-language";
import { useAccessControl } from "@/hooks/use-access-control";
import { useUnreadTips } from "@/hooks/use-unread-tips";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

const CHECKOUT_URL = '/checkout';

export default function TipsPage() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { canSeeAllTips } = useAccessControl();
  const { user } = useAuth();
  const [unitValue, setUnitValue] = useState<number | null>(null);

  // Fetch user's bankroll unit value
  useEffect(() => {
    const fetchBankroll = async () => {
      if (!user?.id) return;
      try {
        const response = await fetch(`/api/profile/${user.id}/bankroll`);
        if (response.ok) {
          const data = await response.json();
          if (data.unitValue) {
            setUnitValue(parseFloat(data.unitValue));
          }
        }
      } catch (error) {
        console.error("Erro ao buscar bankroll:", error);
      }
    };
    fetchBankroll();
  }, [user?.id]);
  
  const { data: tips = [], isLoading, error } = useQuery({
    queryKey: ['tips'],
    queryFn: tipsService.getAll,
    refetchInterval: 30000, // Refresh every 30s
  });

  const tipIds = tips.map(tip => tip.id);
  const { markAllAsViewed } = useUnreadTips(tipIds);

  // Mark all tips as viewed when user opens the page
  useEffect(() => {
    if (tips.length > 0) {
      markAllAsViewed();
    }
  }, [tips.length]);

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
      {/* Back Button */}
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 group"
        data-testid="button-back"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm">Voltar</span>
      </button>

      {/* Header Profissional */}
      <div className="w-full mb-6">
        
        {/* Título Principal */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#33b864] to-[#28a054] rounded-xl flex items-center justify-center shadow-lg shadow-[#33b864]/20">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Bilhetes do Dia
              </h1>
              <p className="text-gray-500 text-xs">
                Análises profissionais com alto índice de acerto
              </p>
            </div>
          </div>
          
          {/* Badge de Performance */}
          <div className="hidden sm:flex items-center gap-2 bg-[#1a1a1a] px-4 py-2 rounded-xl border border-[#333]">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#33b864] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#33b864]"></span>
              </span>
              <span className="text-[#33b864] font-bold text-sm">83%</span>
            </div>
            <span className="text-gray-400 text-xs">assertividade</span>
          </div>
        </div>

        {/* Performance Mobile */}
        <div className="sm:hidden flex items-center justify-center gap-3 bg-[#1a1a1a] py-2.5 px-4 rounded-xl border border-[#333] mb-4">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#33b864] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#33b864]"></span>
            </span>
            <span className="text-[#33b864] font-bold">83%</span>
          </div>
          <span className="text-gray-400 text-sm">de assertividade nos últimos 30 dias</span>
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
        <div className="space-y-6">
          {/* Para usuários não-Prime: mostra o bilhete FREE primeiro */}
          {!canSeeAllTips && (() => {
            const freeTip = tips.find(t => t.isFree);
            const lockedTips = tips.filter(t => !t.isFree).slice(0, 10);
            
            return (
              <>
                {/* Bilhete FREE do dia */}
                {freeTip ? (
                  <div className="relative">
                    <div className="absolute -top-3 left-4 z-10">
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold px-3 py-1 text-xs border-0 shadow-lg">
                        <Gift className="w-3 h-3 mr-1" />
                        BILHETE GRÁTIS DO DIA
                      </Badge>
                    </div>
                    <div className="border-2 border-yellow-500/50 rounded-xl overflow-hidden">
                      <BetCard 
                        signal={freeTip}
                        onDelete={() => queryClient.invalidateQueries({ queryKey: ['tips'] })}
                        unitValue={unitValue}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6 text-center">
                    <Gift className="w-10 h-10 mx-auto mb-3 text-yellow-500" />
                    <h3 className="text-lg font-bold text-white mb-2">Bilhete Grátis em breve!</h3>
                    <p className="text-gray-400 text-sm">O bilhete grátis do dia será postado em breve. Fique atento!</p>
                  </div>
                )}

                {/* Bilhetes Premium Bloqueados */}
                {lockedTips.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <LockKeyhole className="w-5 h-5 text-[#33b864]" />
                        Bilhetes Premium
                      </h3>
                      <Badge className="bg-[#33b864]/20 text-[#33b864] border-[#33b864]/30">
                        {lockedTips.length} disponíveis
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {lockedTips.map((tip, index) => (
                        <div key={tip.id} className="relative" data-testid={`tip-locked-${index}`}>
                          <div className="blur-sm pointer-events-none select-none">
                            <BetCard 
                              signal={tip}
                              onDelete={() => {}}
                              unitValue={unitValue}
                            />
                          </div>
                          
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl border-2 border-[#33b864]/30">
                            <div className="text-center p-6">
                              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#33b864]/20 border-2 border-[#33b864] flex items-center justify-center">
                                <LockKeyhole className="w-7 h-7 text-[#33b864]" />
                              </div>
                              <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
                                Exclusivo Prime
                              </h3>
                              <p className="text-gray-300 text-sm mb-4">
                                Desbloqueie todos os sinais
                              </p>
                              <a href={CHECKOUT_URL} data-testid={`button-unlock-${index}`}>
                                <button className="px-5 py-2.5 bg-[#33b864] hover:bg-[#2ea558] text-black font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-xl shadow-[#33b864]/40 flex items-center gap-2 mx-auto text-sm">
                                  <Sparkles className="w-4 h-4" />
                                  Assinar
                                </button>
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
          
          {/* Para usuários Prime: mostra todos os bilhetes normalmente */}
          {canSeeAllTips && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {tips.map((tip, index) => (
                <div key={tip.id} className="relative" data-testid={`tip-container-${index}`}>
                  {tip.isFree && (
                    <div className="absolute -top-2 left-4 z-10">
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                        <Gift className="w-3 h-3 mr-1" />
                        FREE
                      </Badge>
                    </div>
                  )}
                  <BetCard 
                    signal={tip}
                    onDelete={() => queryClient.invalidateQueries({ queryKey: ['tips'] })}
                    unitValue={unitValue}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
