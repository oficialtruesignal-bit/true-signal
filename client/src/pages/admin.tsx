import { Layout } from "@/components/layout";
import { SignalForm } from "@/components/signal-form";
import { ManualTicketForm } from "@/components/manual-ticket-form";
import { AiDraftsPanel } from "@/components/ai-drafts-panel";
import { MultiBotPanel } from "@/components/multi-bot-panel";
import { tipsService } from "@/lib/tips-service";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, XCircle, Clock, ShieldAlert, Trash2, ScanLine, Copy, Check, Zap, PenLine, Crown, UserPlus, Loader2, Brain, LayoutDashboard, Flame, Target, Activity, RefreshCw, AlertTriangle, ChevronRight } from "lucide-react";
import { Signal } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { toast } from "sonner";
import axios from "axios";
import { cn } from "@/lib/utils";

interface LivePressureData {
  fixtureId: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  matchMinute: number;
  score: string;
  homePressure: number;
  awayPressure: number;
  homeGoalProbability: number;
  awayGoalProbability: number;
  homePressureDelta: number;
  awayPressureDelta: number;
  alertTriggered: boolean;
  alertType?: string;
}

type AdminTab = 'tickets' | 'live' | 'ai' | 'bots';

export default function Admin() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [premiumEmail, setPremiumEmail] = useState("");
  const [premiumDays, setPremiumDays] = useState("30");
  const [isActivatingPremium, setIsActivatingPremium] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('tickets');
  const [ticketSubTab, setTicketSubTab] = useState<'manual' | 'scanner'>('manual');
  
  console.log('🔧 Admin Page Loaded - Version 5.0 - Multi-Bot System');

  // DESATIVADO: Monitor de Jogos Quentes - Em Construção (consumo excessivo de API-Football)

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

    if (!user?.email || !user?.id) {
      toast.error("Você precisa estar logado como admin");
      return;
    }

    setIsActivatingPremium(true);
    try {
      const response = await axios.post("/api/admin/activate-premium", {
        email: premiumEmail.trim(),
        days: days,
        adminEmail: user.email,
        adminUserId: user.id,
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
    const text = `🎯 TRUE SIGNAL

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

  useEffect(() => {
    if (user && user.role !== 'admin' && user.email !== 'kwillianferreira@gmail.com') {
      toast.error("Acesso negado. Apenas administradores podem acessar esta página.");
      setLocation("/app");
    }
  }, [user, setLocation]);

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

  const { data: signals = [] } = useQuery({
    queryKey: ['tips'],
    queryFn: tipsService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: tipsService.create,
    onSuccess: async (newTip) => {
      queryClient.invalidateQueries({ queryKey: ['tips'] });
      toast.success("Sinal criado com sucesso!");
      
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

  const tabs = [
    { id: 'tickets' as const, label: 'Bilhetes', icon: LayoutDashboard, color: 'from-[#33b864] to-emerald-600', badge: signals.length },
    { id: 'live' as const, label: 'Jogos Quentes', icon: Flame, color: 'from-orange-500 to-red-500' },
    { id: 'ai' as const, label: 'IA Preditiva', icon: Brain, color: 'from-purple-500 to-pink-500' },
    { id: 'bots' as const, label: 'Multi-Bot', icon: Target, color: 'from-cyan-500 to-blue-500' },
  ];

  return (
    <Layout>
      {/* ========== HEADER MOBILE ========== */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-display font-bold text-white mb-1">Painel Admin</h1>
        <p className="text-muted-foreground text-sm">Central de controle TRUE SIGNAL</p>
      </div>

      {/* ========== NAVEGAÇÃO MOBILE - ABAS GRANDES ========== */}
      <div className="grid grid-cols-2 gap-3 mb-6 md:hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all min-h-[100px]",
                isActive 
                  ? `bg-gradient-to-br ${tab.color} border-transparent shadow-lg` 
                  : "bg-white/5 border-white/10 hover:border-white/20"
              )}
              data-testid={`tab-${tab.id}`}
            >
              <Icon className={cn("w-8 h-8 mb-2", isActive ? "text-white" : "text-gray-400")} />
              <span className={cn("text-sm font-bold", isActive ? "text-white" : "text-gray-300")}>
                {tab.label}
              </span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={cn(
                  "absolute top-2 right-2 text-[10px] font-bold rounded-full w-6 h-6 flex items-center justify-center",
                  isActive ? "bg-white/30 text-white" : "bg-red-500 text-white animate-pulse"
                )}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========== NAVEGAÇÃO DESKTOP ========== */}
      <div className="hidden md:flex gap-2 mb-6 bg-background/50 p-2 rounded-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-3 rounded-lg font-bold text-sm transition-all",
                isActive 
                  ? `bg-gradient-to-r ${tab.color} text-white` 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
              data-testid={`tab-desktop-${tab.id}`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={cn(
                  "text-[10px] rounded-full px-2 py-0.5",
                  isActive ? "bg-white/30" : "bg-red-500 text-white"
                )}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========== CONTEÚDO DAS ABAS ========== */}

      {/* TAB 1: BILHETES */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          {/* Card Liberar Premium - Mobile Otimizado */}
          <Card className="border-yellow-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Crown className="w-6 h-6 text-yellow-500" />
                Liberar Acesso Premium
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">Email do Usuário</label>
                <input
                  type="email"
                  value={premiumEmail}
                  onChange={(e) => setPremiumEmail(e.target.value)}
                  placeholder="usuario@email.com"
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-base text-white placeholder:text-gray-500 focus:border-yellow-500/50 focus:outline-none"
                  data-testid="input-premium-email"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Dias de Acesso</label>
                <input
                  type="number"
                  value={premiumDays}
                  onChange={(e) => setPremiumDays(e.target.value)}
                  min="1"
                  max="365"
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-base text-white focus:border-yellow-500/50 focus:outline-none"
                  data-testid="input-premium-days"
                />
              </div>
              <Button
                onClick={handleActivatePremium}
                disabled={isActivatingPremium || !premiumEmail.trim()}
                className="w-full h-14 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold text-base rounded-xl"
                data-testid="button-activate-premium"
              >
                {isActivatingPremium ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Ativando...</>
                ) : (
                  <><UserPlus className="w-5 h-5 mr-2" />Ativar Premium</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Sub-abas Manual/Scanner - Mobile Otimizado */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => setTicketSubTab('manual')}
              className={cn(
                "flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
                ticketSubTab === 'manual'
                  ? "bg-[#33b864] border-[#33b864] text-black"
                  : "bg-white/5 border-white/10 text-gray-300"
              )}
              data-testid="tab-manual"
            >
              <PenLine className="w-5 h-5" />
              <span className="font-bold">Manual</span>
            </button>
            <button
              onClick={() => setTicketSubTab('scanner')}
              className={cn(
                "flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
                ticketSubTab === 'scanner'
                  ? "bg-[#33b864] border-[#33b864] text-black"
                  : "bg-white/5 border-white/10 text-gray-300"
              )}
              data-testid="tab-scanner"
            >
              <ScanLine className="w-5 h-5" />
              <span className="font-bold">Scanner IA</span>
            </button>
          </div>

          {/* Formulário de criação */}
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              {ticketSubTab === 'manual' ? (
                <ManualTicketForm onSubmit={handleCreateTip} isSubmitting={createMutation.isPending} />
              ) : (
                <SignalForm onAdd={(data) => handleCreateTip(data)} />
              )}
            </CardContent>
          </Card>

          {/* Lista de Bilhetes - Estilo Bet365 */}
          <Card className="border-primary/20">
            <CardHeader className="pb-4 border-b border-primary/10">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="w-6 h-6 text-primary" />
                  Sinais Ativos
                </CardTitle>
                <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 text-sm px-3 py-1">
                  {signals.length} Total
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {signals.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <LayoutDashboard className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum sinal criado ainda</p>
                </div>
              ) : (
                signals.map((signal) => (
                  <div 
                    key={signal.id} 
                    className="bg-gradient-to-br from-[#0d1117] to-[#161b22] border border-white/10 rounded-2xl overflow-hidden"
                  >
                    {/* Barra de status superior */}
                    <div className={cn(
                      "h-1.5",
                      signal.status === 'green' ? 'bg-gradient-to-r from-green-500 to-green-400' :
                      signal.status === 'red' ? 'bg-gradient-to-r from-red-500 to-red-400' :
                      'bg-gradient-to-r from-yellow-500 to-yellow-400'
                    )} />
                    
                    <div className="p-4">
                      {/* Header com ODD grande */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {signal.isLive && (
                              <span className="text-xs text-red-500 bg-red-500/20 px-2 py-1 rounded-full animate-pulse font-bold">LIVE</span>
                            )}
                            <span className={cn(
                              "text-xs px-2 py-1 rounded-full font-bold",
                              signal.status === 'green' ? 'bg-green-500/20 text-green-400' :
                              signal.status === 'red' ? 'bg-red-500/20 text-red-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            )}>
                              {signal.status === 'green' ? '✓ GREEN' : signal.status === 'red' ? '✗ RED' : '⏳ PENDENTE'}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold text-white leading-tight">
                            {signal.homeTeam}
                          </h4>
                          <p className="text-gray-400 text-sm">vs {signal.awayTeam}</p>
                        </div>
                        
                        <div className="bg-[#33b864]/20 border-2 border-[#33b864] rounded-xl px-4 py-2 text-center min-w-[80px]">
                          <span className="text-[10px] text-[#33b864] block uppercase font-medium">ODD</span>
                          <span className="text-2xl font-bold text-[#33b864]">{signal.odd.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      {/* Timeline estilo Bet365 */}
                      <div className="relative pl-5 mb-4">
                        <div className="absolute left-[6px] top-1 bottom-1 w-[2px] bg-[#33b864]"></div>
                        {signal.market.split('\n').filter(line => line.trim()).map((line, idx) => (
                          <div key={idx} className="relative flex items-start gap-3 mb-2 last:mb-0">
                            <div className="absolute -left-5 top-1 w-3 h-3 rounded-full bg-[#33b864] flex items-center justify-center">
                              <Check className="w-2 h-2 text-black" />
                            </div>
                            <p className="text-white text-sm font-medium ml-1">{line.trim()}</p>
                          </div>
                        ))}
                      </div>
                      
                      {/* Botões de ação - Touch-friendly */}
                      <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
                        {/* Linha 1: Status - Grid para não cortar */}
                        <div className="grid grid-cols-3 gap-2">
                          <Button 
                            onClick={() => updateStatusMutation.mutate({ id: signal.id, status: 'green' })}
                            className={cn(
                              "h-11 rounded-xl font-bold text-sm px-2",
                              signal.status === 'green' 
                                ? 'bg-green-500 text-white' 
                                : 'bg-green-500/20 text-green-400 border border-green-500/50'
                            )}
                            data-testid={`button-status-green-${signal.id}`}
                          >
                            <Trophy className="w-4 h-4 mr-1" />
                            GREEN
                          </Button>
                          <Button 
                            onClick={() => updateStatusMutation.mutate({ id: signal.id, status: 'red' })}
                            className={cn(
                              "h-11 rounded-xl font-bold text-sm px-2",
                              signal.status === 'red' 
                                ? 'bg-red-500 text-white' 
                                : 'bg-red-500/20 text-red-400 border border-red-500/50'
                            )}
                            data-testid={`button-status-red-${signal.id}`}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            RED
                          </Button>
                          <Button 
                            onClick={() => updateStatusMutation.mutate({ id: signal.id, status: 'pending' })}
                            className={cn(
                              "h-11 rounded-xl font-bold text-sm px-2",
                              signal.status === 'pending' 
                                ? 'bg-yellow-500 text-black' 
                                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                            )}
                            data-testid={`button-status-pending-${signal.id}`}
                          >
                            <Clock className="w-4 h-4 mr-1" />
                            PEND
                          </Button>
                        </div>
                        
                        {/* Linha 2: Copiar e Deletar */}
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => copyTicket(signal)}
                            className={cn(
                              "flex-1 h-12 rounded-xl font-bold",
                              copiedId === signal.id ? 'bg-green-500 text-white' : 'bg-[#33b864] text-black'
                            )}
                            data-testid={`button-copy-${signal.id}`}
                          >
                            {copiedId === signal.id ? (
                              <><Check className="w-5 h-5 mr-2" />Copiado!</>
                            ) : (
                              <><Copy className="w-5 h-5 mr-2" />Copiar Bilhete</>
                            )}
                          </Button>
                          <Button 
                            onClick={() => { if (confirm(`Deletar o sinal?`)) deleteMutation.mutate(signal.id); }}
                            className="h-12 px-4 rounded-xl bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white"
                            data-testid={`button-delete-${signal.id}`}
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: JOGOS QUENTES - EM CONSTRUÇÃO */}
      {activeTab === 'live' && (
        <div className="flex flex-col items-center justify-center py-20">
          <Card className="border-orange-500/30 max-w-md w-full">
            <CardContent className="pt-8 pb-10 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 border-2 border-orange-500/30 flex items-center justify-center">
                <Flame className="w-12 h-12 text-orange-500 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Em Construção</h3>
              <p className="text-gray-400 mb-6">
                O Monitor de Jogos Quentes está sendo otimizado para reduzir consumo de API.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-orange-400 bg-orange-500/10 rounded-full px-4 py-2">
                <Clock className="w-4 h-4" />
                <span>Previsão: Em breve</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: IA PREDITIVA */}
      {activeTab === 'ai' && <AiDraftsPanel />}

      {/* TAB 4: MULTI-BOT */}
      {activeTab === 'bots' && <MultiBotPanel adminEmail={user?.email || ""} adminUserId={user?.id || ""} />}
    </Layout>
  );
}
