import { Layout } from "@/components/layout";
import { SignalForm } from "@/components/signal-form";
import { ManualTicketForm } from "@/components/manual-ticket-form";
import { AiDraftsPanel } from "@/components/ai-drafts-panel";
import { MultiBotPanel } from "@/components/multi-bot-panel";
import { tipsService } from "@/lib/tips-service";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Trophy, XCircle, Clock, ShieldAlert, Trash2, ScanLine, Copy, Check, Zap, ExternalLink, PenLine, Crown, UserPlus, Loader2, Brain, LayoutDashboard, Flame, Target, Home, Plane, TrendingUp, Activity, Play, Pause, RefreshCw, AlertTriangle, BarChart3 } from "lucide-react";
import { Signal } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { toast } from "sonner";
import axios from "axios";

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

export default function Admin() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [premiumEmail, setPremiumEmail] = useState("");
  const [premiumDays, setPremiumDays] = useState("30");
  const [isActivatingPremium, setIsActivatingPremium] = useState(false);
  const [isMonitorRunning, setIsMonitorRunning] = useState(false);
  
  console.log('🔧 Admin Page Loaded - Version 5.0 - Multi-Bot System');

  const { data: liveMatches = [], isLoading: isLoadingLive, refetch: refetchLive } = useQuery({
    queryKey: ['live-pressure'],
    queryFn: async () => {
      const response = await axios.get('/api/live/pressure');
      const data = response.data;
      if (Array.isArray(data)) return data as LivePressureData[];
      if (data?.matches && Array.isArray(data.matches)) return data.matches as LivePressureData[];
      return [];
    },
    refetchInterval: isMonitorRunning ? 30000 : false,
    enabled: isMonitorRunning,
  });

  const { data: liveAlerts = [] } = useQuery({
    queryKey: ['live-alerts'],
    queryFn: async () => {
      const response = await axios.get('/api/live/alerts?limit=20');
      return response.data;
    },
    refetchInterval: 60000,
  });

  const toggleMonitor = async () => {
    try {
      const adminData = { adminEmail: user?.email, adminUserId: user?.id };
      if (isMonitorRunning) {
        await axios.post('/api/live/monitor/stop', adminData);
        toast.success("Monitor de gols ao vivo pausado");
      } else {
        await axios.post('/api/live/monitor/start', adminData);
        toast.success("Monitor de gols ao vivo iniciado!");
        refetchLive();
      }
      setIsMonitorRunning(!isMonitorRunning);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Erro ao controlar monitor");
    }
  };

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

  const hotMatches = liveMatches
    .filter(m => m.homePressure >= 65 || m.awayPressure >= 65)
    .sort((a, b) => Math.max(b.homePressure, b.awayPressure) - Math.max(a.homePressure, a.awayPressure));

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-white mb-1">Painel Administrativo</h1>
        <p className="text-muted-foreground text-sm">Central de controle TRUE SIGNAL</p>
      </div>

      <Tabs defaultValue="tickets" className="w-full">
        <TabsList className="flex w-full mb-6 bg-background/50 p-1.5 h-auto overflow-x-auto gap-1 scrollbar-hide">
          <TabsTrigger 
            value="tickets" 
            className="flex-shrink-0 gap-1.5 px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-black font-bold text-xs sm:text-sm whitespace-nowrap"
            data-testid="tab-tickets"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Bilhetes</span>
          </TabsTrigger>
          <TabsTrigger 
            value="live" 
            className="flex-shrink-0 gap-1.5 px-3 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white font-bold text-xs sm:text-sm relative whitespace-nowrap"
            data-testid="tab-live"
          >
            <Flame className="w-4 h-4" />
            <span className="hidden sm:inline">Jogos Quentes</span>
            {hotMatches.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {hotMatches.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="ai" 
            className="flex-shrink-0 gap-1.5 px-3 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white font-bold text-xs sm:text-sm whitespace-nowrap"
            data-testid="tab-ai-predictions"
          >
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">IA Preditiva</span>
          </TabsTrigger>
          <TabsTrigger 
            value="bots" 
            className="flex-shrink-0 gap-1.5 px-3 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white font-bold text-xs sm:text-sm whitespace-nowrap"
            data-testid="tab-bots"
          >
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Multi-Bot</span>
          </TabsTrigger>
        </TabsList>

        {/* ==================== TAB 1: BILHETES ==================== */}
        <TabsContent value="tickets" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <Card className="border-yellow-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    Liberar Acesso Premium
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Email do Usuário</label>
                    <input
                      type="email"
                      value={premiumEmail}
                      onChange={(e) => setPremiumEmail(e.target.value)}
                      placeholder="usuario@email.com"
                      className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-yellow-500/50 focus:outline-none"
                      data-testid="input-premium-email"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Dias de Acesso</label>
                    <input
                      type="number"
                      value={premiumDays}
                      onChange={(e) => setPremiumDays(e.target.value)}
                      min="1"
                      max="365"
                      className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-yellow-500/50 focus:outline-none"
                      data-testid="input-premium-days"
                    />
                  </div>
                  <Button
                    onClick={handleActivatePremium}
                    disabled={isActivatingPremium || !premiumEmail.trim()}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold"
                    data-testid="button-activate-premium"
                  >
                    {isActivatingPremium ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Ativando...</>
                    ) : (
                      <><UserPlus className="w-4 h-4 mr-2" />Ativar Premium</>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardContent className="pt-4">
                  <Tabs defaultValue="manual" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4 bg-background/50 p-1 h-10">
                      <TabsTrigger value="manual" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-black text-sm" data-testid="tab-manual">
                        <PenLine className="w-4 h-4" />
                        Manual
                      </TabsTrigger>
                      <TabsTrigger value="scanner" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-black text-sm" data-testid="tab-scanner">
                        <ScanLine className="w-4 h-4" />
                        Scanner IA
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="manual" className="mt-0">
                      <ManualTicketForm onSubmit={handleCreateTip} isSubmitting={createMutation.isPending} />
                    </TabsContent>
                    
                    <TabsContent value="scanner" className="mt-0">
                      <SignalForm onAdd={(data) => handleCreateTip(data)} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="border-primary/20">
                <CardHeader className="pb-3 border-b border-primary/10 bg-gradient-to-r from-primary/10 to-transparent">
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Zap className="w-5 h-5 text-primary" />
                      Sinais Disponíveis
                    </CardTitle>
                    <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                      {signals.length} Total
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3 max-h-[600px] overflow-y-auto">
                  {signals.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">Nenhum sinal criado ainda</div>
                  ) : (
                    signals.map((signal) => (
                      <div key={signal.id} className="relative bg-gradient-to-br from-[#0d1117] to-[#161b22] border border-primary/20 rounded-xl overflow-hidden group hover:border-primary/40 transition-all">
                        <div className={`absolute top-0 left-0 right-0 h-1 ${
                          signal.status === 'green' ? 'bg-gradient-to-r from-green-500 to-green-400' :
                          signal.status === 'red' ? 'bg-gradient-to-r from-red-500 to-red-400' :
                          'bg-gradient-to-r from-yellow-500 to-yellow-400'
                        }`} />
                        
                        <div className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {signal.isLive && (
                                  <span className="text-[10px] text-red-500 bg-red-500/20 px-2 py-0.5 rounded-full animate-pulse font-bold">LIVE</span>
                                )}
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                  signal.status === 'green' ? 'bg-green-500/20 text-green-400' :
                                  signal.status === 'red' ? 'bg-red-500/20 text-red-400' :
                                  'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                  {signal.status === 'green' ? 'GREEN' : signal.status === 'red' ? 'RED' : 'PENDENTE'}
                                </span>
                              </div>
                              <h4 className="text-base font-bold text-white">
                                {signal.homeTeam} <span className="text-primary">vs</span> {signal.awayTeam}
                              </h4>
                            </div>
                            
                            <div className="bg-primary/20 border border-primary/30 rounded-lg px-2.5 py-1.5 text-center">
                              <span className="text-[10px] text-primary/70 block">ODD</span>
                              <span className="text-lg font-bold text-primary">{signal.odd.toFixed(2)}</span>
                            </div>
                          </div>
                          
                          <div className="bg-white/5 rounded-lg px-2.5 py-1.5 mb-3">
                            <span className="text-xs text-muted-foreground">Mercado:</span>
                            <p className="text-xs text-white font-medium mt-0.5">{signal.market}</p>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t border-white/10">
                            <div className="flex items-center gap-1.5">
                              <Button size="sm" variant="outline" className={`h-7 px-2 ${signal.status === 'green' ? 'bg-green-500/20 border-green-500 text-green-400' : 'border-white/20 hover:border-green-500 hover:text-green-400'}`}
                                onClick={() => updateStatusMutation.mutate({ id: signal.id, status: 'green' })} data-testid={`button-status-green-${signal.id}`}>
                                <Trophy className="w-3.5 h-3.5" />
                              </Button>
                              <Button size="sm" variant="outline" className={`h-7 px-2 ${signal.status === 'red' ? 'bg-red-500/20 border-red-500 text-red-400' : 'border-white/20 hover:border-red-500 hover:text-red-400'}`}
                                onClick={() => updateStatusMutation.mutate({ id: signal.id, status: 'red' })} data-testid={`button-status-red-${signal.id}`}>
                                <XCircle className="w-3.5 h-3.5" />
                              </Button>
                              <Button size="sm" variant="outline" className={`h-7 px-2 ${signal.status === 'pending' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' : 'border-white/20 hover:border-yellow-500 hover:text-yellow-400'}`}
                                onClick={() => updateStatusMutation.mutate({ id: signal.id, status: 'pending' })} data-testid={`button-status-pending-${signal.id}`}>
                                <Clock className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                            
                            <div className="flex items-center gap-1.5">
                              <Button size="sm" className={`h-7 px-3 ${copiedId === signal.id ? 'bg-green-500' : 'bg-primary'} text-black font-semibold text-xs`}
                                onClick={() => copyTicket(signal)} data-testid={`button-copy-${signal.id}`}>
                                {copiedId === signal.id ? <><Check className="w-3.5 h-3.5 mr-1" />OK</> : <><Copy className="w-3.5 h-3.5 mr-1" />Copiar</>}
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 px-2 border-red-500/50 text-red-400 hover:bg-red-500/20"
                                onClick={() => { if (confirm(`Deletar o sinal?`)) deleteMutation.mutate(signal.id); }} data-testid={`button-delete-${signal.id}`}>
                                <Trash2 className="w-3.5 h-3.5" />
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
          </div>
        </TabsContent>

        {/* ==================== TAB 2: JOGOS QUENTES ==================== */}
        <TabsContent value="live" className="mt-0">
          <div className="space-y-4">
            <Card className="border-orange-500/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-500" />
                      Monitor de Gols Ao Vivo
                    </CardTitle>
                    <CardDescription>Análise de pressão em tempo real com IA calibrada</CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-green-500/20 text-green-400 border border-green-500/50">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      Ativo 24/7
                    </div>
                    <Button variant="outline" size="sm" onClick={() => refetchLive()}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingLive ? 'animate-spin' : ''}`} />
                      Atualizar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-orange-400">{hotMatches.length}</div>
                    <div className="text-xs text-gray-400">Jogos Quentes</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-400">{liveMatches.length}</div>
                    <div className="text-xs text-gray-400">Ao Vivo</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-purple-400">{liveAlerts.length}</div>
                    <div className="text-xs text-gray-400">Alertas Hoje</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-400">8</div>
                    <div className="text-xs text-gray-400">Bots Disponíveis</div>
                  </div>
                </div>

                {hotMatches.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-30 animate-pulse" />
                    <p>Monitorando... Nenhum jogo quente no momento</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {hotMatches.map((match) => {
                      const dominantSide = match.homePressure > match.awayPressure ? 'home' : 'away';
                      const pressure = dominantSide === 'home' ? match.homePressure : match.awayPressure;
                      const goalProb = dominantSide === 'home' ? match.homeGoalProbability : match.awayGoalProbability;
                      const delta = dominantSide === 'home' ? match.homePressureDelta : match.awayPressureDelta;
                      const tier = pressure >= 85 ? 'PRIME' : pressure >= 80 ? 'CORE' : 'WATCH';
                      const tierColor = tier === 'PRIME' ? 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30' : 
                                        tier === 'CORE' ? 'text-green-400 bg-green-500/20 border-green-500/30' : 
                                        'text-blue-400 bg-blue-500/20 border-blue-500/30';

                      return (
                        <div key={match.fixtureId} className="bg-gradient-to-br from-[#0d1117] to-[#161b22] border border-orange-500/30 rounded-xl p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full animate-pulse">{match.matchMinute}'</span>
                                <span className="text-xs text-gray-400">{match.league}</span>
                                <Badge className={`text-[10px] ${tierColor}`}>{tier === 'PRIME' ? '💎' : tier === 'CORE' ? '⭐' : '👁️'} {tier}</Badge>
                              </div>
                              <h4 className="text-base font-bold text-white">
                                {match.homeTeam} <span className="text-primary">{match.score}</span> {match.awayTeam}
                              </h4>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-2xl font-bold text-orange-400">{pressure.toFixed(0)}%</div>
                              <div className="text-xs text-gray-400">Pressão {dominantSide === 'home' ? 'Casa' : 'Visitante'}</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-2 mt-3">
                            <div className="bg-white/5 rounded-lg p-2 text-center">
                              <div className="text-sm font-bold text-white">{match.homePressure.toFixed(0)}%</div>
                              <div className="text-[10px] text-gray-400">Home</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2 text-center">
                              <div className="text-sm font-bold text-white">{match.awayPressure.toFixed(0)}%</div>
                              <div className="text-[10px] text-gray-400">Away</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2 text-center">
                              <div className={`text-sm font-bold ${goalProb >= 70 ? 'text-green-400' : 'text-yellow-400'}`}>{goalProb.toFixed(0)}%</div>
                              <div className="text-[10px] text-gray-400">Prob. Gol</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2 text-center">
                              <div className={`text-sm font-bold ${delta >= 15 ? 'text-green-400' : delta >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {delta >= 0 ? '+' : ''}{delta.toFixed(0)}%
                              </div>
                              <div className="text-[10px] text-gray-400">Delta</div>
                            </div>
                          </div>

                          {match.alertTriggered && (
                            <div className="mt-3 flex items-center gap-2 text-xs bg-orange-500/20 text-orange-400 px-3 py-2 rounded-lg">
                              <AlertTriangle className="w-4 h-4" />
                              Alerta disparado: {match.alertType}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ==================== TAB 3: IA PREDITIVA ==================== */}
        <TabsContent value="ai" className="mt-0">
          <AiDraftsPanel />
        </TabsContent>

        {/* ==================== TAB 4: MULTI-BOT ==================== */}
        <TabsContent value="bots" className="mt-0">
          <MultiBotPanel adminEmail={user?.email || ""} adminUserId={user?.id || ""} />
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
