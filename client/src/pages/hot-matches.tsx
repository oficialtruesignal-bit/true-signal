import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Flame, 
  Activity, 
  Target, 
  Bell, 
  BellOff, 
  RefreshCw,
  TrendingUp,
  Clock,
  Zap,
  AlertTriangle,
  Play,
  Square,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface HotMatch {
  id: string;
  fixtureId: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo: string | null;
  awayTeamLogo: string | null;
  matchMinute: string;
  homeScore: string;
  awayScore: string;
  matchStatus: string;
  homePossession: string;
  awayPossession: string;
  homeShotsOnTarget: string;
  awayShotsOnTarget: string;
  homeCorners: string;
  awayCorners: string;
  homeDangerousAttacks: string;
  awayDangerousAttacks: string;
  homePressureIndex: string;
  awayPressureIndex: string;
  homeGoalProbability: string;
  awayGoalProbability: string;
  homePressureDelta: string;
  awayPressureDelta: string;
  alertTriggered: boolean;
  createdAt: string;
}

interface LiveAlert {
  id: string;
  fixtureId: string;
  alertType: string;
  teamSide: string;
  pressureIndex: string;
  goalProbability: string;
  alertTitle: string;
  alertMessage: string;
  matchMinute: string;
  currentScore: string;
  createdAt: string;
}

export default function HotMatchesPage() {
  const { user } = useAuth();
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const isAdmin = user?.role === "admin" || user?.email === "kwillianferreira@gmail.com";

  const { data: hotMatchesData, isLoading: isLoadingMatches, refetch: refetchMatches } = useQuery({
    queryKey: ["hot-matches"],
    queryFn: async () => {
      const res = await fetch("/api/live/pressure?limit=30");
      if (!res.ok) throw new Error("Failed to fetch hot matches");
      return res.json();
    },
    refetchInterval: autoRefresh ? 30000 : false,
  });

  const { data: alertsData, isLoading: isLoadingAlerts } = useQuery({
    queryKey: ["live-alerts"],
    queryFn: async () => {
      const res = await fetch("/api/live/alerts?limit=10");
      if (!res.ok) throw new Error("Failed to fetch alerts");
      return res.json();
    },
    refetchInterval: autoRefresh ? 30000 : false,
  });

  const { data: monitorStatus, refetch: refetchStatus } = useQuery({
    queryKey: ["monitor-status"],
    queryFn: async () => {
      const res = await fetch("/api/live/monitor/status");
      if (!res.ok) throw new Error("Failed to fetch status");
      return res.json();
    },
    refetchInterval: 10000,
  });

  const startMonitor = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/live/monitor/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail: user?.email,
          adminUserId: user?.id,
          intervalMs: 45000,
        }),
      });
      if (!res.ok) throw new Error("Failed to start monitor");
      return res.json();
    },
    onSuccess: () => {
      refetchStatus();
      refetchMatches();
    },
  });

  const stopMonitor = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/live/monitor/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail: user?.email,
          adminUserId: user?.id,
        }),
      });
      if (!res.ok) throw new Error("Failed to stop monitor");
      return res.json();
    },
    onSuccess: () => {
      refetchStatus();
    },
  });

  const hotMatches: HotMatch[] = hotMatchesData?.matches || [];
  const alerts: LiveAlert[] = alertsData?.alerts || [];
  const isMonitorRunning = monitorStatus?.status?.isRunning || false;

  const getPressureColor = (pressure: number) => {
    if (pressure >= 80) return "text-red-500";
    if (pressure >= 60) return "text-orange-500";
    if (pressure >= 40) return "text-yellow-500";
    return "text-green-500";
  };

  const getPressureBg = (pressure: number) => {
    if (pressure >= 80) return "bg-red-500/20 border-red-500/50";
    if (pressure >= 60) return "bg-orange-500/20 border-orange-500/50";
    if (pressure >= 40) return "bg-yellow-500/20 border-yellow-500/50";
    return "bg-green-500/20 border-green-500/50";
  };

  const formatDelta = (delta: string) => {
    const num = parseFloat(delta);
    if (num > 0) return `+${num.toFixed(1)}%`;
    return `${num.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-950 text-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Flame className="w-8 h-8 text-orange-500" />
              Jogos Quentes
            </h1>
            <p className="text-zinc-400 mt-1">
              Monitor de pressão ao vivo - Alta probabilidade de gol
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <label htmlFor="auto-refresh" className="text-sm text-zinc-400">
                Auto-refresh
              </label>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchMatches()}
              className="border-zinc-700"
              data-testid="button-refresh"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>

            {isAdmin && (
              <Button
                variant={isMonitorRunning ? "destructive" : "default"}
                size="sm"
                onClick={() => isMonitorRunning ? stopMonitor.mutate() : startMonitor.mutate()}
                disabled={startMonitor.isPending || stopMonitor.isPending}
                className={!isMonitorRunning ? "bg-[#33b864] hover:bg-[#2da558]" : ""}
                data-testid="button-toggle-monitor"
              >
                {isMonitorRunning ? (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    Parar Monitor
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Iniciar Monitor
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm",
            isMonitorRunning 
              ? "bg-green-500/20 text-green-400 border border-green-500/50" 
              : "bg-zinc-800 text-zinc-400 border border-zinc-700"
          )}>
            <div className={cn(
              "w-2 h-2 rounded-full",
              isMonitorRunning ? "bg-green-500 animate-pulse" : "bg-zinc-600"
            )} />
            {isMonitorRunning ? "Monitor Ativo" : "Monitor Inativo"}
          </div>

          <Badge variant="outline" className="border-zinc-700">
            {hotMatches.length} jogos monitorados
          </Badge>
        </div>

        {alerts.length > 0 && (
          <Card className="bg-zinc-900/50 border-orange-500/30 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-500" />
                Alertas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.slice(0, 5).map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700"
                  >
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="font-medium text-sm">{alert.alertTitle}</p>
                        <p className="text-xs text-zinc-400">{alert.alertMessage}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                        {parseFloat(alert.goalProbability).toFixed(0)}% prob. gol
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {isLoadingMatches ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-[#33b864]" />
          </div>
        ) : hotMatches.length === 0 ? (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="py-12 text-center">
              <Activity className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-zinc-400">
                Nenhum jogo ao vivo no momento
              </h3>
              <p className="text-sm text-zinc-500 mt-1">
                {isMonitorRunning 
                  ? "Aguardando jogos com alta pressão..."
                  : "Inicie o monitor para começar a rastrear jogos ao vivo"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {hotMatches.map((match, index) => {
                const homePressure = parseFloat(match.homePressureIndex);
                const awayPressure = parseFloat(match.awayPressureIndex);
                const maxPressure = Math.max(homePressure, awayPressure);
                const isExpanded = expandedMatch === match.id;
                const dominantSide = homePressure > awayPressure ? 'home' : 'away';
                const dominantTeam = dominantSide === 'home' ? match.homeTeam : match.awayTeam;

                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card 
                      className={cn(
                        "bg-zinc-900/50 border transition-all duration-300 cursor-pointer hover:bg-zinc-900/70",
                        getPressureBg(maxPressure),
                        match.alertTriggered && "ring-2 ring-orange-500/50"
                      )}
                      onClick={() => setExpandedMatch(isExpanded ? null : match.id)}
                      data-testid={`card-match-${match.fixtureId}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {match.alertTriggered && (
                              <div className="absolute -top-2 -left-2">
                                <span className="flex h-4 w-4">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                                  <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500" />
                                </span>
                              </div>
                            )}

                            <div className="flex flex-col items-center gap-1">
                              <Badge variant="outline" className="text-xs border-zinc-600">
                                {match.league}
                              </Badge>
                              <div className="flex items-center gap-1 text-zinc-400">
                                <Clock className="w-3 h-3" />
                                <span className="text-xs font-mono">{match.matchMinute}'</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="flex flex-col items-center gap-1 w-24">
                                {match.homeTeamLogo && (
                                  <img 
                                    src={match.homeTeamLogo} 
                                    alt={match.homeTeam}
                                    className="w-8 h-8 object-contain"
                                  />
                                )}
                                <span className="text-xs text-center line-clamp-1">{match.homeTeam}</span>
                              </div>

                              <div className="text-center">
                                <div className="text-2xl font-bold">
                                  {match.homeScore} - {match.awayScore}
                                </div>
                              </div>

                              <div className="flex flex-col items-center gap-1 w-24">
                                {match.awayTeamLogo && (
                                  <img 
                                    src={match.awayTeamLogo} 
                                    alt={match.awayTeam}
                                    className="w-8 h-8 object-contain"
                                  />
                                )}
                                <span className="text-xs text-center line-clamp-1">{match.awayTeam}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="hidden md:flex flex-col items-center">
                              <span className="text-xs text-zinc-500 mb-1">Pressão</span>
                              <div className="flex items-center gap-2">
                                <span className={cn("text-sm font-bold", getPressureColor(homePressure))}>
                                  {homePressure.toFixed(0)}%
                                </span>
                                <span className="text-zinc-600">vs</span>
                                <span className={cn("text-sm font-bold", getPressureColor(awayPressure))}>
                                  {awayPressure.toFixed(0)}%
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col items-center">
                              <span className="text-xs text-zinc-500 mb-1">Prob. Gol</span>
                              <div className="flex items-center gap-1">
                                <Target className="w-4 h-4 text-orange-500" />
                                <span className="font-bold text-orange-400">
                                  {Math.max(
                                    parseFloat(match.homeGoalProbability),
                                    parseFloat(match.awayGoalProbability)
                                  ).toFixed(0)}%
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col items-center">
                              <span className="text-xs text-zinc-500 mb-1">Dominante</span>
                              <Badge className={cn(
                                "text-xs",
                                dominantSide === 'home' ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"
                              )}>
                                {dominantTeam.substring(0, 12)}
                              </Badge>
                            </div>

                            <Button variant="ghost" size="sm" className="p-1">
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5" />
                              ) : (
                                <ChevronDown className="w-5 h-5" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <Separator className="my-4 bg-zinc-800" />

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                  <span className="text-xs text-zinc-500">Posse de Bola</span>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{match.homePossession}%</span>
                                    <span className="font-medium">{match.awayPossession}%</span>
                                  </div>
                                  <Progress 
                                    value={parseFloat(match.homePossession)} 
                                    className="h-2 bg-zinc-800"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <span className="text-xs text-zinc-500">Chutes ao Gol</span>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{match.homeShotsOnTarget}</span>
                                    <span className="font-medium">{match.awayShotsOnTarget}</span>
                                  </div>
                                  <div className="flex gap-1">
                                    <div 
                                      className="h-2 bg-blue-500 rounded-l" 
                                      style={{ 
                                        width: `${(parseInt(match.homeShotsOnTarget) / (parseInt(match.homeShotsOnTarget) + parseInt(match.awayShotsOnTarget) || 1)) * 100}%` 
                                      }} 
                                    />
                                    <div 
                                      className="h-2 bg-purple-500 rounded-r flex-1" 
                                    />
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <span className="text-xs text-zinc-500">Escanteios</span>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{match.homeCorners}</span>
                                    <span className="font-medium">{match.awayCorners}</span>
                                  </div>
                                  <div className="flex gap-1">
                                    <div 
                                      className="h-2 bg-blue-500 rounded-l" 
                                      style={{ 
                                        width: `${(parseInt(match.homeCorners) / (parseInt(match.homeCorners) + parseInt(match.awayCorners) || 1)) * 100}%` 
                                      }} 
                                    />
                                    <div 
                                      className="h-2 bg-purple-500 rounded-r flex-1" 
                                    />
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <span className="text-xs text-zinc-500">Ataques Perigosos</span>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{match.homeDangerousAttacks}</span>
                                    <span className="font-medium">{match.awayDangerousAttacks}</span>
                                  </div>
                                  <div className="flex gap-1">
                                    <div 
                                      className="h-2 bg-blue-500 rounded-l" 
                                      style={{ 
                                        width: `${(parseInt(match.homeDangerousAttacks) / (parseInt(match.homeDangerousAttacks) + parseInt(match.awayDangerousAttacks) || 1)) * 100}%` 
                                      }} 
                                    />
                                    <div 
                                      className="h-2 bg-purple-500 rounded-r flex-1" 
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className={cn(
                                  "p-3 rounded-lg border",
                                  getPressureBg(homePressure)
                                )}>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">{match.homeTeam}</span>
                                    <div className="flex items-center gap-1">
                                      {parseFloat(match.homePressureDelta) > 0 && (
                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                      )}
                                      <span className={cn(
                                        "text-xs",
                                        parseFloat(match.homePressureDelta) > 0 ? "text-green-400" : "text-red-400"
                                      )}>
                                        {formatDelta(match.homePressureDelta)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                      <div className="flex justify-between text-xs text-zinc-500 mb-1">
                                        <span>Pressão</span>
                                        <span className={getPressureColor(homePressure)}>
                                          {homePressure.toFixed(1)}%
                                        </span>
                                      </div>
                                      <Progress 
                                        value={homePressure} 
                                        className="h-2"
                                      />
                                    </div>
                                    <div className="text-center">
                                      <Target className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                                      <span className="text-sm font-bold text-orange-400">
                                        {parseFloat(match.homeGoalProbability).toFixed(0)}%
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className={cn(
                                  "p-3 rounded-lg border",
                                  getPressureBg(awayPressure)
                                )}>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">{match.awayTeam}</span>
                                    <div className="flex items-center gap-1">
                                      {parseFloat(match.awayPressureDelta) > 0 && (
                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                      )}
                                      <span className={cn(
                                        "text-xs",
                                        parseFloat(match.awayPressureDelta) > 0 ? "text-green-400" : "text-red-400"
                                      )}>
                                        {formatDelta(match.awayPressureDelta)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                      <div className="flex justify-between text-xs text-zinc-500 mb-1">
                                        <span>Pressão</span>
                                        <span className={getPressureColor(awayPressure)}>
                                          {awayPressure.toFixed(1)}%
                                        </span>
                                      </div>
                                      <Progress 
                                        value={awayPressure} 
                                        className="h-2"
                                      />
                                    </div>
                                    <div className="text-center">
                                      <Target className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                                      <span className="text-sm font-bold text-orange-400">
                                        {parseFloat(match.awayGoalProbability).toFixed(0)}%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {maxPressure >= 70 && (
                                <div className="mt-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center gap-3">
                                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                                  <div>
                                    <p className="text-sm font-medium text-orange-400">
                                      Alta Pressão Detectada
                                    </p>
                                    <p className="text-xs text-zinc-400">
                                      {dominantTeam} está pressionando fortemente. 
                                      Probabilidade de gol nos próximos 5 minutos: {Math.max(
                                        parseFloat(match.homeGoalProbability),
                                        parseFloat(match.awayGoalProbability)
                                      ).toFixed(0)}%
                                    </p>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        <Card className="bg-zinc-900/30 border-zinc-800">
          <CardContent className="py-4">
            <div className="flex items-center justify-between text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>Última atualização: {new Date().toLocaleTimeString('pt-BR')}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>&gt;80% Crítico</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span>&gt;60% Alto</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span>&gt;40% Médio</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>&lt;40% Baixo</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
