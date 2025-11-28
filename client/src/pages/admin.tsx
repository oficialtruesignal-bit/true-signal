import { Layout } from "@/components/layout";
import { SignalForm } from "@/components/signal-form";
import { ManualTicketForm } from "@/components/manual-ticket-form";
import { tipsService } from "@/lib/tips-service";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, XCircle, Clock, ShieldAlert, Trash2, ScanLine, Copy, Check, Zap, ExternalLink, PenLine, Crown, UserPlus, Loader2 } from "lucide-react";
import { Signal } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { toast } from "sonner";
import axios from "axios";

export default function Admin() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [premiumEmail, setPremiumEmail] = useState("");
  const [premiumDays, setPremiumDays] = useState("30");
  const [isActivatingPremium, setIsActivatingPremium] = useState(false);
  
  console.log('🔧 Admin Page Loaded - Version 3.0 - Premium Cards');

  const handleActivatePremium = async () => {
    if (!premiumEmail.trim()) {
      toast.error("Digite o email do usuário");
      return;
    }
    
    const days = parseInt(premiumDays);
    if (isNaN(days) || days < 1) {
      toast.error("Digite um número válido de dias");
      return;
    }

    setIsActivatingPremium(true);
    try {
      const response = await axios.post("/api/admin/activate-premium", {
        email: premiumEmail.trim(),
        days: days,
      });
      
      if (response.data.success) {
        toast.success(`Acesso Premium ativado para ${premiumEmail} por ${days} dias!`);
        setPremiumEmail("");
        setPremiumDays("30");
      } else {
        toast.error(response.data.error || "Erro ao ativar premium");
      }
    } catch (error: any) {
      console.error("Error activating premium:", error);
      toast.error(error.response?.data?.error || "Erro ao ativar acesso premium");
    } finally {
      setIsActivatingPremium(false);
    }
  };

  const copyTicket = (signal: Signal) => {
    const text = `🎯 VANTAGE

⚽ ${signal.homeTeam} vs ${signal.awayTeam}
📊 ${signal.market}
💰 ODD: ${signal.odd.toFixed(2)}
${signal.betLink ? `🔗 ${signal.betLink}` : ''}

📱 @vantage`;
    
    navigator.clipboard.writeText(text);
    setCopiedId(signal.id);
    toast.success("Bilhete copiado!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin' && user.email !== 'kwillianferreira@gmail.com') {
      toast.error("Acesso negado. Apenas administradores podem acessar esta página.");
      setLocation("/app");
    }
  }, [user, setLocation]);

  // Show loading or access denied if not admin
  if (!user || (user.role !== 'admin' && user.email !== 'kwillianferreira@gmail.com')) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Acesso Negado</h2>
          <p className="text-muted-foreground">Apenas administradores podem acessar esta página.</p>
        </div>
      </Layout>
    );
  }

  // Fetch Tips
  const { data: signals = [] } = useQuery({
    queryKey: ['tips'],
    queryFn: tipsService.getAll,
  });

  // Mutations with admin check
  const createMutation = useMutation({
    mutationFn: tipsService.create,
    onSuccess: async (newTip) => {
      queryClient.invalidateQueries({ queryKey: ['tips'] });
      toast.success("Sinal criado com sucesso!");
      
      // Send push notification to users
      try {
        const { notificationService } = await import("@/lib/notification-service");
        await notificationService.sendNewTipNotification({
          match: `${newTip.homeTeam} vs ${newTip.awayTeam}`,
          market: newTip.market,
          odd: newTip.odd,
        });
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar tip. Apenas administradores podem criar tips.");
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: Signal['status'] }) => 
      tipsService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tips'] });
      toast.success("Status atualizado!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar status. Apenas administradores podem editar tips.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tipsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tips'] });
      toast.success("Sinal deletado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao deletar sinal.");
    }
  });

  const handleCreateTip = (formData: any) => {
    if (user?.role !== 'admin' && user?.email !== 'kwillianferreira@gmail.com') {
      toast.error("Apenas administradores podem criar tips.");
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-white mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">Gerencie os sinais e resultados.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Create Tip Flow */}
        <div className="lg:col-span-1 space-y-6">
          {/* Premium Access Manager */}
          <div className="bg-card border border-yellow-500/30 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-yellow-500" />
              <h3 className="font-bold text-white">Liberar Acesso Premium</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1.5">Email do Usuário</label>
                <input
                  type="email"
                  value={premiumEmail}
                  onChange={(e) => setPremiumEmail(e.target.value)}
                  placeholder="usuario@email.com"
                  className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:border-yellow-500/50 focus:outline-none transition-colors"
                  data-testid="input-premium-email"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400 block mb-1.5">Dias de Acesso</label>
                <input
                  type="number"
                  value={premiumDays}
                  onChange={(e) => setPremiumDays(e.target.value)}
                  min="1"
                  max="365"
                  placeholder="30"
                  className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:border-yellow-500/50 focus:outline-none transition-colors"
                  data-testid="input-premium-days"
                />
              </div>
              
              <Button
                onClick={handleActivatePremium}
                disabled={isActivatingPremium || !premiumEmail.trim()}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-2.5"
                data-testid="button-activate-premium"
              >
                {isActivatingPremium ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Ativando...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Ativar Premium
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="bg-card border border-primary/20 rounded-xl p-6">
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-5 bg-background/50 p-1 h-11">
                <TabsTrigger 
                  value="manual" 
                  className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-black font-medium"
                  data-testid="tab-manual"
                >
                  <PenLine className="w-4 h-4" />
                  Manual
                </TabsTrigger>
                <TabsTrigger 
                  value="scanner" 
                  className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-black font-medium"
                  data-testid="tab-scanner"
                >
                  <ScanLine className="w-4 h-4" />
                  Scanner IA
                </TabsTrigger>
              </TabsList>
              
              {/* Criador Manual - Puxa da API */}
              <TabsContent value="manual" className="mt-0">
                <ManualTicketForm 
                  onSubmit={handleCreateTip}
                  isSubmitting={createMutation.isPending}
                />
              </TabsContent>
              
              {/* Scanner de Imagem com IA */}
              <TabsContent value="scanner" className="mt-0">
                <SignalForm 
                  onAdd={(data) => {
                    handleCreateTip(data);
                  }} 
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Column: Active Signals Management */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-primary/20 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-primary/10 bg-gradient-to-r from-primary/10 to-transparent flex justify-between items-center">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Sinais Disponíveis
              </h3>
              <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-semibold">{signals.length} Total</span>
            </div>
            
            <div className="p-4 space-y-4">
              {signals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum sinal criado ainda
                </div>
              ) : (
                signals.map((signal) => (
                  <div 
                    key={signal.id} 
                    className="relative bg-gradient-to-br from-[#0d1117] to-[#161b22] border border-primary/20 rounded-xl overflow-hidden group hover:border-primary/40 transition-all"
                  >
                    {/* Status indicator bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${
                      signal.status === 'green' ? 'bg-gradient-to-r from-green-500 to-green-400' :
                      signal.status === 'red' ? 'bg-gradient-to-r from-red-500 to-red-400' :
                      'bg-gradient-to-r from-yellow-500 to-yellow-400'
                    }`} />
                    
                    <div className="p-4">
                      {/* Header with match info */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {signal.isLive && (
                              <span className="text-[10px] text-red-500 bg-red-500/20 px-2 py-0.5 rounded-full animate-pulse font-bold">
                                LIVE
                              </span>
                            )}
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              signal.status === 'green' ? 'bg-green-500/20 text-green-400' :
                              signal.status === 'red' ? 'bg-red-500/20 text-red-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {signal.status === 'green' ? 'GREEN' : signal.status === 'red' ? 'RED' : 'PENDENTE'}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold text-white font-sora">
                            {signal.homeTeam} <span className="text-primary">vs</span> {signal.awayTeam}
                          </h4>
                          {signal.matchTime && (
                            <span className="text-xs text-muted-foreground mt-1">
                              ⏰ {signal.matchTime}
                            </span>
                          )}
                        </div>
                        
                        {/* ODD Badge */}
                        <div className="bg-primary/20 border border-primary/30 rounded-lg px-3 py-2 text-center">
                          <span className="text-[10px] text-primary/70 block">ODD</span>
                          <span className="text-xl font-bold text-primary font-sora">{signal.odd.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      {/* Market info - organized by topics */}
                      <div className="bg-white/5 rounded-lg px-3 py-2 mb-4">
                        <span className="text-xs text-muted-foreground">Mercado:</span>
                        <div className="mt-1 space-y-0.5">
                          {signal.market.split(' + ').map((m, idx) => (
                            <p key={idx} className="text-xs text-white font-medium flex items-start gap-1.5">
                              <span className="text-primary">•</span>
                              <span>{m.trim()}</span>
                            </p>
                          ))}
                        </div>
                      </div>
                      
                      {/* Link if exists */}
                      {signal.betLink && (
                        <a 
                          href={signal.betLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 mb-4 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Abrir na casa de apostas
                        </a>
                      )}
                      
                      {/* Actions row */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        {/* Status buttons */}
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className={`h-8 px-3 ${signal.status === 'green' ? 'bg-green-500/20 border-green-500 text-green-400' : 'border-white/20 hover:border-green-500 hover:text-green-400'}`}
                            onClick={() => updateStatusMutation.mutate({ id: signal.id, status: 'green' })}
                            data-testid={`button-status-green-${signal.id}`}
                          >
                            <Trophy className="w-4 h-4 mr-1" />
                            Green
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className={`h-8 px-3 ${signal.status === 'red' ? 'bg-red-500/20 border-red-500 text-red-400' : 'border-white/20 hover:border-red-500 hover:text-red-400'}`}
                            onClick={() => updateStatusMutation.mutate({ id: signal.id, status: 'red' })}
                            data-testid={`button-status-red-${signal.id}`}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Red
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className={`h-8 px-3 ${signal.status === 'pending' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' : 'border-white/20 hover:border-yellow-500 hover:text-yellow-400'}`}
                            onClick={() => updateStatusMutation.mutate({ id: signal.id, status: 'pending' })}
                            data-testid={`button-status-pending-${signal.id}`}
                          >
                            <Clock className="w-4 h-4 mr-1" />
                          </Button>
                        </div>
                        
                        {/* Copy and Delete buttons */}
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm"
                            className={`h-8 px-4 ${copiedId === signal.id ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-primary/90'} text-black font-semibold`}
                            onClick={() => copyTicket(signal)}
                            data-testid={`button-copy-${signal.id}`}
                          >
                            {copiedId === signal.id ? (
                              <>
                                <Check className="w-4 h-4 mr-1" />
                                Copiado!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-1" />
                                Copiar
                              </>
                            )}
                          </Button>
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="h-8 w-8 border-white/20 hover:border-red-500 hover:text-red-500 hover:bg-red-500/10"
                            onClick={() => {
                              if (confirm(`Deletar o sinal ${signal.homeTeam} vs ${signal.awayTeam}?`)) {
                                deleteMutation.mutate(signal.id);
                              }
                            }}
                            data-testid={`button-delete-${signal.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
