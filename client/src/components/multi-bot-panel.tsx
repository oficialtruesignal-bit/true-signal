import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Home,
  Plane,
  Clock,
  AlertTriangle,
  Target,
  Crosshair,
  Flag,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Activity,
  Check,
  X,
  Play,
  Pause,
  RefreshCw,
  BarChart3,
  Zap,
  Bot,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MultiBotPanelProps {
  adminEmail: string;
  adminUserId: string;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Home: <Home className="w-5 h-5" />,
  Plane: <Plane className="w-5 h-5" />,
  Clock: <Clock className="w-5 h-5" />,
  AlertTriangle: <AlertTriangle className="w-5 h-5" />,
  Target: <Target className="w-5 h-5" />,
  Crosshair: <Crosshair className="w-5 h-5" />,
  Flag: <Flag className="w-5 h-5" />,
  CreditCard: <CreditCard className="w-5 h-5" />,
  Bot: <Bot className="w-5 h-5" />,
  Activity: <Activity className="w-5 h-5" />,
  TrendingUp: <TrendingUp className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  BarChart3: <BarChart3 className="w-5 h-5" />,
};

const getIcon = (iconName: string | null | undefined): React.ReactNode => {
  if (!iconName) return <Bot className="w-5 h-5" />;
  return ICON_MAP[iconName] || <Bot className="w-5 h-5" />;
};

export function MultiBotPanel({ adminEmail, adminUserId }: MultiBotPanelProps) {
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all strategies
  const { data: strategiesData, isLoading: loadingStrategies } = useQuery({
    queryKey: ["multibot-strategies"],
    queryFn: async () => {
      const res = await fetch("/api/multibot/strategies");
      return res.json();
    },
    refetchInterval: 30000,
  });

  // Fetch all signals
  const { data: signalsData, isLoading: loadingSignals } = useQuery({
    queryKey: ["multibot-signals"],
    queryFn: async () => {
      const res = await fetch("/api/multibot/signals?limit=100");
      return res.json();
    },
    refetchInterval: 15000,
  });

  // Fetch performance stats
  const { data: performanceData } = useQuery({
    queryKey: ["multibot-performance"],
    queryFn: async () => {
      const res = await fetch("/api/multibot/performance");
      return res.json();
    },
    refetchInterval: 60000,
  });

  // Fetch detailed stats for selected bot
  const { data: botStats, isLoading: loadingBotStats } = useQuery({
    queryKey: ["multibot-bot-stats", selectedBot],
    queryFn: async () => {
      if (!selectedBot) return null;
      const res = await fetch(`/api/multibot/strategies/${selectedBot}/stats`);
      return res.json();
    },
    enabled: !!selectedBot,
  });

  // Toggle strategy mutation
  const toggleStrategyMutation = useMutation({
    mutationFn: async ({ strategyCode, isActive }: { strategyCode: string; isActive: boolean }) => {
      const res = await fetch(`/api/multibot/strategies/${strategyCode}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminEmail, adminUserId, isActive }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["multibot-strategies"] });
      toast({ title: "Status atualizado", description: "Bot foi atualizado com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao atualizar bot", variant: "destructive" });
    },
  });

  // Resolve signal mutation
  const resolveSignalMutation = useMutation({
    mutationFn: async ({ signalId, status, finalScore }: { signalId: string; status: string; finalScore: string }) => {
      const res = await fetch(`/api/multibot/signals/${signalId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminEmail, adminUserId, status, finalScore }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["multibot-signals"] });
      queryClient.invalidateQueries({ queryKey: ["multibot-performance"] });
      toast({ title: "Sinal resolvido", description: "Resultado atualizado com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao resolver sinal", variant: "destructive" });
    },
  });

  // Analyze matches mutation
  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/multibot/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminEmail, adminUserId }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["multibot-signals"] });
      toast({
        title: "Análise concluída",
        description: `${data.matchesAnalyzed} jogos analisados, ${data.signalsGenerated} sinais gerados`,
      });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha na análise", variant: "destructive" });
    },
  });

  const strategies = strategiesData?.strategies || [];
  const signals = signalsData?.signals || [];
  const performance = performanceData?.stats || [];

  // Calculate summary stats
  const totalSignals = signals.length;
  const pendingSignals = signals.filter((s: any) => s.signalStatus === "pending").length;
  const hitSignals = signals.filter((s: any) => s.signalStatus === "hit").length;
  const missSignals = signals.filter((s: any) => s.signalStatus === "miss").length;
  const overallHitRate = hitSignals + missSignals > 0
    ? ((hitSignals / (hitSignals + missSignals)) * 100).toFixed(1)
    : "0.0";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "hit": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "miss": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "void": return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="w-8 h-8 text-[#33b864]" />
          <div>
            <h2 className="text-2xl font-bold text-white">Multi-Bot System</h2>
            <p className="text-sm text-gray-400">
              {strategies.filter((s: any) => s.isActive).length} bots ativos de {strategies.length}
            </p>
          </div>
        </div>
        <Button
          onClick={() => analyzeMutation.mutate()}
          disabled={analyzeMutation.isPending}
          className="bg-[#33b864] hover:bg-[#2da055] text-white"
          data-testid="button-analyze-matches"
        >
          {analyzeMutation.isPending ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Zap className="w-4 h-4 mr-2" />
          )}
          Analisar Jogos Ao Vivo
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Total Sinais</span>
              <Activity className="w-4 h-4 text-gray-500" />
            </div>
            <p className="text-2xl font-bold text-white mt-1" data-testid="text-total-signals">{totalSignals}</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Pendentes</span>
              <Clock className="w-4 h-4 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-yellow-400 mt-1" data-testid="text-pending-signals">{pendingSignals}</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Acertos</span>
              <Check className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-400 mt-1" data-testid="text-hit-signals">{hitSignals}</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Erros</span>
              <X className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-400 mt-1" data-testid="text-miss-signals">{missSignals}</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">% Acerto</span>
              <BarChart3 className="w-4 h-4 text-[#33b864]" />
            </div>
            <p className="text-2xl font-bold text-[#33b864] mt-1" data-testid="text-hit-rate">{overallHitRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-900/50 border border-gray-800 overflow-x-auto flex-nowrap">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#33b864] min-w-fit">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="strategies" className="data-[state=active]:bg-[#33b864] min-w-fit">
            Estratégias
          </TabsTrigger>
          <TabsTrigger value="signals" className="data-[state=active]:bg-[#33b864] min-w-fit">
            Sinais
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-[#33b864] min-w-fit">
            Relatórios
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {strategies.map((strategy: any) => {
              const strategySignals = signals.filter((s: any) => s.strategyCode === strategy.strategyCode);
              const hits = strategySignals.filter((s: any) => s.signalStatus === "hit").length;
              const misses = strategySignals.filter((s: any) => s.signalStatus === "miss").length;
              const hitRate = hits + misses > 0 ? ((hits / (hits + misses)) * 100).toFixed(1) : "N/A";
              
              return (
                <Card
                  key={strategy.id}
                  className={`bg-gray-900/50 border-gray-800 cursor-pointer transition-all hover:border-[#33b864]/50 ${
                    selectedBot === strategy.strategyCode ? "border-[#33b864]" : ""
                  }`}
                  onClick={() => setSelectedBot(strategy.strategyCode)}
                  data-testid={`card-bot-${strategy.strategyCode}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${strategy.strategyColor}20` }}
                        >
                          {getIcon(strategy.strategyIcon)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white text-sm">
                            {strategy.strategyName}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {strategy.strategyType === "live_late" ? "75-90 min" :
                             strategy.strategyType === "live_ht" ? "1º Tempo" :
                             strategy.strategyType === "live_ft" ? "2º Tempo" :
                             strategy.strategyType === "special" ? "Especial" : "Pré-Live"}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={strategy.isActive}
                        onCheckedChange={(checked) =>
                          toggleStrategyMutation.mutate({
                            strategyCode: strategy.strategyCode,
                            isActive: checked,
                          })
                        }
                        onClick={(e) => e.stopPropagation()}
                        data-testid={`switch-bot-${strategy.strategyCode}`}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs text-gray-500">Sinais</p>
                        <p className="text-sm font-bold text-white">{strategySignals.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Acertos</p>
                        <p className="text-sm font-bold text-green-400">{hits}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">% Acerto</p>
                        <p className="text-sm font-bold" style={{ color: strategy.strategyColor }}>
                          {hitRate}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Strategies Tab */}
        <TabsContent value="strategies" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {strategies.map((strategy: any) => (
              <Card key={strategy.id} className="bg-gray-900/50 border-gray-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${strategy.strategyColor}20` }}
                      >
                        {getIcon(strategy.strategyIcon)}
                      </div>
                      <div>
                        <CardTitle className="text-lg text-white">
                          {strategy.strategyName}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className={strategy.isActive ? "text-green-400 border-green-400" : "text-gray-400"}
                        >
                          {strategy.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </div>
                    <Switch
                      checked={strategy.isActive}
                      onCheckedChange={(checked) =>
                        toggleStrategyMutation.mutate({
                          strategyCode: strategy.strategyCode,
                          isActive: checked,
                        })
                      }
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400 mb-4">
                    {strategy.strategyDescription}
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Tipo</p>
                      <p className="text-white font-medium">
                        {strategy.strategyType === "live_late" ? "Final (75-90')" :
                         strategy.strategyType === "live_ht" ? "1º Tempo" :
                         strategy.strategyType === "live_ft" ? "2º Tempo" :
                         strategy.strategyType === "special" ? "Especial" : "Pré-Live"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Pressão Mín.</p>
                      <p className="text-white font-medium">
                        {strategy.minPressureThreshold ? `${strategy.minPressureThreshold}%` : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Confiança Mín.</p>
                      <p className="text-white font-medium">{strategy.minConfidenceThreshold}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Signals Tab */}
        <TabsContent value="signals" className="mt-4">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#33b864]" />
                Sinais Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {loadingSignals ? (
                    <p className="text-gray-400 text-center py-4">Carregando...</p>
                  ) : signals.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">Nenhum sinal gerado ainda</p>
                  ) : (
                    signals.map((signal: any) => (
                      <div
                        key={signal.id}
                        className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                        data-testid={`card-signal-${signal.id}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge
                                variant="outline"
                                className={getStatusColor(signal.signalStatus)}
                              >
                                {signal.signalStatus === "hit" ? "✓ ACERTO" :
                                 signal.signalStatus === "miss" ? "✗ ERRO" :
                                 signal.signalStatus === "pending" ? "⏳ PENDENTE" : signal.signalStatus.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="text-gray-400 border-gray-600">
                                {signal.strategyCode}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-1">
                              {signal.homeTeamLogo && (
                                <img src={signal.homeTeamLogo} alt="" className="w-5 h-5" />
                              )}
                              <span className="text-white font-medium truncate">
                                {signal.homeTeam} vs {signal.awayTeam}
                              </span>
                              {signal.awayTeamLogo && (
                                <img src={signal.awayTeamLogo} alt="" className="w-5 h-5" />
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span>{signal.league}</span>
                              <span>{signal.signalMinute}'</span>
                              <span className="text-[#33b864]">{signal.market}</span>
                              <span>Confiança: {signal.confidenceScore}%</span>
                            </div>
                          </div>
                          
                          {signal.signalStatus === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-500 text-green-400 hover:bg-green-500/20"
                                onClick={() => resolveSignalMutation.mutate({
                                  signalId: signal.id,
                                  status: "hit",
                                  finalScore: signal.scoreWhenGenerated,
                                })}
                                data-testid={`button-hit-${signal.id}`}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500 text-red-400 hover:bg-red-500/20"
                                onClick={() => resolveSignalMutation.mutate({
                                  signalId: signal.id,
                                  status: "miss",
                                  finalScore: signal.scoreWhenGenerated,
                                })}
                                data-testid={`button-miss-${signal.id}`}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {strategies.map((strategy: any) => {
              const strategySignals = signals.filter((s: any) => s.strategyCode === strategy.strategyCode);
              const hits = strategySignals.filter((s: any) => s.signalStatus === "hit").length;
              const misses = strategySignals.filter((s: any) => s.signalStatus === "miss").length;
              const pending = strategySignals.filter((s: any) => s.signalStatus === "pending").length;
              const total = hits + misses;
              const hitRate = total > 0 ? ((hits / total) * 100).toFixed(1) : "0.0";
              
              let profit = 0;
              strategySignals.forEach((s: any) => {
                if (s.signalStatus === "hit") profit += Number(s.suggestedOdd || 1.5) - 1;
                if (s.signalStatus === "miss") profit -= 1;
              });

              return (
                <Card key={strategy.id} className="bg-gray-900/50 border-gray-800">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${strategy.strategyColor}20` }}
                      >
                        {getIcon(strategy.strategyIcon)}
                      </div>
                      <CardTitle className="text-lg text-white">
                        {strategy.strategyName}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 mb-1">Taxa de Acerto</p>
                        <p
                          className="text-2xl font-bold"
                          style={{ color: Number(hitRate) >= 55 ? "#33b864" : Number(hitRate) >= 45 ? "#eab308" : "#ef4444" }}
                        >
                          {hitRate}%
                        </p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 mb-1">Lucro/Prejuízo</p>
                        <div className="flex items-center justify-center gap-1">
                          {profit >= 0 ? (
                            <TrendingUp className="w-5 h-5 text-green-400" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-400" />
                          )}
                          <p className={`text-2xl font-bold ${profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {profit >= 0 ? "+" : ""}{profit.toFixed(2)}u
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center text-sm">
                      <div>
                        <p className="text-gray-500">Total</p>
                        <p className="font-bold text-white">{strategySignals.length}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Acertos</p>
                        <p className="font-bold text-green-400">{hits}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Erros</p>
                        <p className="font-bold text-red-400">{misses}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Pendentes</p>
                        <p className="font-bold text-yellow-400">{pending}</p>
                      </div>
                    </div>

                    {/* Visual progress bar */}
                    <div className="mt-4">
                      <div className="flex h-2 rounded-full overflow-hidden bg-gray-700">
                        <div
                          className="bg-green-500"
                          style={{ width: `${total > 0 ? (hits / total) * 100 : 0}%` }}
                        />
                        <div
                          className="bg-red-500"
                          style={{ width: `${total > 0 ? (misses / total) * 100 : 0}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Acertos: {total > 0 ? ((hits / total) * 100).toFixed(0) : 0}%</span>
                        <span>Erros: {total > 0 ? ((misses / total) * 100).toFixed(0) : 0}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
