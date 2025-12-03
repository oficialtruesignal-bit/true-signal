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
import { Trophy, XCircle, Clock, ShieldAlert, Trash2, ScanLine, Copy, Check, Zap, PenLine, Crown, UserPlus, Loader2, Brain, LayoutDashboard, Flame, Target, Activity, RefreshCw, AlertTriangle, ChevronRight, Gift, Star, PlusCircle, Eye, Sparkles, TrendingUp, Diamond } from "lucide-react";
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

type AdminTab = 'tickets' | 'free' | 'live' | 'ai' | 'bots' | 'oraculo';

interface AnalyzedOpportunity {
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo: string;
  awayTeamLogo: string;
  league: string;
  leagueLogo: string;
  matchDate: string;
  matchTime: string;
  market: string;
  probability: number;
  bookmakerOdd: number | null;
  fairOdd: number;
  expectedValue: number | null;
  status: 'APPROVED' | 'REJECTED_NO_ODDS' | 'REJECTED_LOW_EV' | 'REJECTED_LOW_PROB';
  rejectionReason?: string;
  potentialBadge: 'DIAMOND' | 'GOLD' | 'SILVER' | null;
}

interface EliteSignal {
  fixtureId: number;
  league: string;
  leagueLogo: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo: string;
  awayTeamLogo: string;
  matchDate: string;
  matchTime: string;
  market: string;
  marketCategory: 'GOALS' | 'CORNERS' | 'CARDS' | 'BTTS' | 'RESULT';
  prediction: string;
  probability: number;
  bookmakerOdd: number;
  fairOdd: number;
  expectedValue: number;
  confidenceScore: number;
  badgeType: 'DIAMOND' | 'GOLD' | 'SILVER';
  reasoning: {
    primary: string;
    homeAnalysis: string;
    awayAnalysis: string;
    h2hInsight: string;
    refereeInsight?: string;
    contextInsight: string;
  };
  patternStrength: number;
  dataPoints: {
    homeForm: string;
    awayForm: string;
    h2hRecord: string;
    homePosition: string;
    awayPosition: string;
  };
}

function OraculoTab({ user }: { user: any }) {
  const [isScanning, setIsScanning] = useState(false);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [showAnalyzedModal, setShowAnalyzedModal] = useState(false);

  const { data: eliteData, refetch } = useQuery({
    queryKey: ['elite-results'],
    queryFn: async () => {
      const response = await axios.get('/api/elite/results');
      return response.data;
    },
    refetchInterval: false,
  });

  const runScan = async () => {
    setIsScanning(true);
    try {
      const response = await axios.post('/api/elite/scan', {
        adminEmail: user?.email,
        adminUserId: user?.id,
      });
      
      if (response.data.success) {
        toast.success(`🎯 ELITE ENGINE: ${response.data.diamondSignals} DIAMOND + ${response.data.goldSignals} GOLD encontrados! EV Médio: ${response.data.avgExpectedValue}%`);
        refetch();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao executar varredura');
    } finally {
      setIsScanning(false);
    }
  };

  const filteredOpportunities = eliteData?.opportunities?.filter((s: EliteSignal) => 
    filterCategory === 'ALL' || s.marketCategory === filterCategory
  ) || [];

  const categoryIcons: Record<string, React.ReactNode> = {
    'GOALS': '⚽',
    'CORNERS': '🚩',
    'CARDS': '🟨',
    'BTTS': '🔄',
    'RESULT': '🏆'
  };

  return (
    <div className="space-y-6">
      {/* Header ELITE ENGINE */}
      <Card className="border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 via-blue-600/5 to-purple-500/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/30 animate-pulse">
                <Diamond className="w-7 h-7 text-white" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  ELITE ENGINE
                  <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 text-xs">POISSON + xG</Badge>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Motor Preditivo Avançado • EV Calculation • Pattern Detection
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={runScan}
              disabled={isScanning}
              size="lg"
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white font-bold hover:opacity-90 shadow-lg shadow-cyan-500/30"
              data-testid="button-run-elite"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <ScanLine className="w-5 h-5 mr-2" />
                  🔍 PESQUISAR BILHETES
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-black/30 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Jogos Escaneados</p>
              <p className="text-xl font-bold text-white">{eliteData?.totalFixturesScanned || 0}</p>
            </div>
            <div 
              className="bg-black/30 rounded-lg p-3 text-center cursor-pointer hover:bg-black/50 transition-colors border border-transparent hover:border-cyan-500/30"
              onClick={() => setShowAnalyzedModal(true)}
              data-testid="button-show-analyzed"
            >
              <p className="text-xs text-gray-500">Analisados <Eye className="w-3 h-3 inline ml-1" /></p>
              <p className="text-xl font-bold text-cyan-400">{eliteData?.analyzedOpportunities?.length || eliteData?.fixturesAnalyzed || 0}</p>
            </div>
            <div className="bg-black/30 rounded-lg p-3 text-center border border-cyan-500/30">
              <p className="text-xs text-cyan-400">💎 DIAMOND</p>
              <p className="text-xl font-bold text-cyan-400">{eliteData?.diamondSignals || 0}</p>
            </div>
            <div className="bg-black/30 rounded-lg p-3 text-center border border-yellow-500/30">
              <p className="text-xs text-yellow-400">🏆 GOLD</p>
              <p className="text-xl font-bold text-yellow-400">{eliteData?.goldSignals || 0}</p>
            </div>
            <div className="bg-black/30 rounded-lg p-3 text-center border border-[#33b864]/30">
              <p className="text-xs text-[#33b864]">📈 EV Médio</p>
              <p className="text-xl font-bold text-[#33b864]">{eliteData?.avgExpectedValue || 0}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros e Legenda */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'GOALS', 'BTTS', 'CORNERS', 'CARDS'].map(cat => (
            <Button
              key={cat}
              size="sm"
              variant={filterCategory === cat ? "default" : "outline"}
              onClick={() => setFilterCategory(cat)}
              className={cn(
                "text-xs",
                filterCategory === cat && "bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0"
              )}
            >
              {cat === 'ALL' ? '🎯 Todos' : `${categoryIcons[cat]} ${cat}`}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <Badge className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black border-0 text-[10px]">
              <Diamond className="w-2.5 h-2.5 mr-0.5" />
              DIAMOND
            </Badge>
            <span className="text-gray-500 text-xs">EV≥7% + Prob≥72%</span>
          </div>
          <div className="flex items-center gap-1">
            <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black border-0 text-[10px]">
              <Star className="w-2.5 h-2.5 mr-0.5" />
              GOLD
            </Badge>
            <span className="text-gray-500 text-xs">EV≥4% + Prob≥62%</span>
          </div>
          <div className="flex items-center gap-1">
            <Badge className="bg-gray-500 text-white border-0 text-[10px]">
              SILVER
            </Badge>
            <span className="text-gray-500 text-xs">EV≥2.5% + Prob≥58%</span>
          </div>
        </div>
      </div>

      {/* Lista de Oportunidades ELITE */}
      {!eliteData?.hasResults ? (
        <Card className="border-dashed border-cyan-500/30">
          <CardContent className="py-16 text-center">
            <Diamond className="w-20 h-20 mx-auto mb-4 text-cyan-500/30" />
            <h3 className="text-xl font-bold text-white mb-2">Motor Elite Pronto</h3>
            <p className="text-gray-400 mb-4">Clique em "PESQUISAR BILHETES" para iniciar a análise completa</p>
            <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
              <span className="px-2 py-1 bg-black/30 rounded">📊 Modelo Poisson</span>
              <span className="px-2 py-1 bg-black/30 rounded">📈 xG Analysis</span>
              <span className="px-2 py-1 bg-black/30 rounded">💰 EV Calculation</span>
              <span className="px-2 py-1 bg-black/30 rounded">🔥 Clássicos</span>
              <span className="px-2 py-1 bg-black/30 rounded">📋 Posição Tabela</span>
              <span className="px-2 py-1 bg-black/30 rounded">🏠 Fator Casa</span>
            </div>
          </CardContent>
        </Card>
      ) : filteredOpportunities.length === 0 ? (
        <Card className="border-dashed border-gray-700">
          <CardContent className="py-16 text-center">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl font-bold text-white mb-2">
              {filterCategory === 'ALL' ? 'Nenhuma oportunidade encontrada' : `Nenhum bilhete de ${filterCategory}`}
            </h3>
            <p className="text-gray-400">Filtros aplicados não encontraram resultados com EV positivo</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredOpportunities.map((signal: EliteSignal, index: number) => (
            <Card 
              key={signal.fixtureId + '-' + signal.market + '-' + index} 
              className={cn(
                "border transition-all cursor-pointer",
                signal.badgeType === 'DIAMOND' 
                  ? "border-cyan-500/40 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 hover:border-cyan-400"
                  : signal.badgeType === 'GOLD'
                    ? "border-yellow-500/40 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 hover:border-yellow-400"
                    : "border-gray-600/40 bg-gradient-to-br from-gray-600/10 to-gray-700/10 hover:border-gray-500"
              )}
              onClick={() => setExpandedCard(expandedCard === index ? null : index)}
              data-testid={`elite-card-${index}`}
            >
              <CardContent className="p-4">
                {/* Header do Card */}
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <img src={signal.homeTeamLogo} alt="" className="w-10 h-10 rounded-full bg-white/10 border-2 border-white/20" />
                      <img src={signal.awayTeamLogo} alt="" className="w-10 h-10 rounded-full bg-white/10 border-2 border-white/20" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">
                        {signal.homeTeam} vs {signal.awayTeam}
                      </p>
                      <p className="text-gray-500 text-xs flex items-center gap-2">
                        <img src={signal.leagueLogo} alt="" className="w-4 h-4" />
                        {signal.league} • {signal.matchDate} {signal.matchTime}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {signal.badgeType === 'DIAMOND' ? (
                      <Badge className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white border-0 font-bold shadow-lg shadow-cyan-500/30">
                        <Diamond className="w-3 h-3 mr-1" />
                        DIAMOND
                      </Badge>
                    ) : signal.badgeType === 'GOLD' ? (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black border-0 font-bold">
                        <Star className="w-3 h-3 mr-1" />
                        GOLD
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-600 text-white border-0">
                        SILVER
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Mercado + Métricas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                  <div className="col-span-2 bg-black/40 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{categoryIcons[signal.marketCategory]}</span>
                      <span className="text-white font-bold text-sm">{signal.market}</span>
                    </div>
                    <p className="text-gray-400 text-xs">{signal.prediction}</p>
                  </div>
                  <div className="bg-black/40 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-gray-500">PROB</p>
                    <p className="text-lg font-bold text-white">{signal.probability}%</p>
                  </div>
                  <div className="bg-black/40 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-gray-500">EV</p>
                    <p className={cn(
                      "text-lg font-bold",
                      signal.expectedValue >= 8 ? "text-cyan-400" : 
                      signal.expectedValue >= 5 ? "text-[#33b864]" : "text-yellow-400"
                    )}>+{signal.expectedValue}%</p>
                  </div>
                </div>

                {/* Odds */}
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-2 mb-2">
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-gray-500">Odd Bet365: <span className="text-white font-bold">{signal.bookmakerOdd}</span></span>
                    <span className="text-gray-500">Odd Justa: <span className="text-cyan-400 font-bold">{signal.fairOdd}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500">{signal.dataPoints.homeForm}</span>
                    <span className="text-gray-400">vs</span>
                    <span className="text-gray-500">{signal.dataPoints.awayForm}</span>
                  </div>
                </div>

                {/* Detalhes Expandidos */}
                {expandedCard === index && (
                  <div className="space-y-3 mt-4 pt-4 border-t border-white/10">
                    <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-3">
                      <p className="text-xs text-cyan-400 mb-1 font-bold">📊 Análise Poisson</p>
                      <p className="text-sm text-white">{signal.reasoning.primary}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-black/20 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">🏠 Mandante ({signal.dataPoints.homePosition})</p>
                        <p className="text-xs text-gray-300">{signal.reasoning.homeAnalysis}</p>
                      </div>
                      <div className="bg-black/20 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">✈️ Visitante ({signal.dataPoints.awayPosition})</p>
                        <p className="text-xs text-gray-300">{signal.reasoning.awayAnalysis}</p>
                      </div>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">⚔️ H2H: {signal.dataPoints.h2hRecord}</p>
                      <p className="text-xs text-gray-300">{signal.reasoning.h2hInsight}</p>
                    </div>
                    {signal.reasoning.refereeInsight && (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                        <p className="text-xs text-yellow-400 mb-1">👨‍⚖️ Fator Árbitro</p>
                        <p className="text-xs text-gray-300">{signal.reasoning.refereeInsight}</p>
                      </div>
                    )}
                    <div className="bg-gradient-to-r from-[#33b864]/10 to-emerald-500/10 border border-[#33b864]/30 rounded-lg p-3">
                      <p className="text-xs text-[#33b864] mb-1">🎯 Contexto do Jogo</p>
                      <p className="text-sm text-white">{signal.reasoning.contextInsight}</p>
                    </div>
                  </div>
                )}

                {/* Indicador de Expansão */}
                <div className="flex justify-center mt-2">
                  <ChevronRight className={cn(
                    "w-4 h-4 text-gray-500 transition-transform",
                    expandedCard === index && "rotate-90"
                  )} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Oportunidades Analisadas */}
      {showAnalyzedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1a2e] border border-cyan-500/30 rounded-xl w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-2xl shadow-cyan-500/20">
            <div className="flex items-center justify-between p-4 border-b border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">Oportunidades Analisadas</h3>
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                  {eliteData?.analyzedOpportunities?.length || 0} mercados
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAnalyzedModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
              {!eliteData?.analyzedOpportunities?.length ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                  <p className="text-gray-400">Nenhuma oportunidade analisada ainda. Execute uma varredura primeiro.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Resumo */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                      <p className="text-xs text-green-400">Aprovados</p>
                      <p className="text-xl font-bold text-green-400">
                        {eliteData.analyzedOpportunities.filter((o: AnalyzedOpportunity) => o.status === 'APPROVED').length}
                      </p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
                      <p className="text-xs text-red-400">EV Baixo</p>
                      <p className="text-xl font-bold text-red-400">
                        {eliteData.analyzedOpportunities.filter((o: AnalyzedOpportunity) => o.status === 'REJECTED_LOW_EV').length}
                      </p>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 text-center">
                      <p className="text-xs text-orange-400">Prob. Baixa</p>
                      <p className="text-xl font-bold text-orange-400">
                        {eliteData.analyzedOpportunities.filter((o: AnalyzedOpportunity) => o.status === 'REJECTED_LOW_PROB').length}
                      </p>
                    </div>
                    <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-400">Sem Odds</p>
                      <p className="text-xl font-bold text-gray-400">
                        {eliteData.analyzedOpportunities.filter((o: AnalyzedOpportunity) => o.status === 'REJECTED_NO_ODDS').length}
                      </p>
                    </div>
                  </div>

                  {/* Lista de Oportunidades */}
                  {eliteData.analyzedOpportunities.map((opp: AnalyzedOpportunity, idx: number) => (
                    <div 
                      key={`${opp.fixtureId}-${opp.market}-${idx}`}
                      className={cn(
                        "rounded-lg p-3 border",
                        opp.status === 'APPROVED' 
                          ? "bg-green-500/10 border-green-500/30" 
                          : opp.status === 'REJECTED_LOW_EV'
                            ? "bg-red-500/10 border-red-500/30"
                            : opp.status === 'REJECTED_LOW_PROB'
                              ? "bg-orange-500/10 border-orange-500/30"
                              : "bg-gray-500/10 border-gray-500/30"
                      )}
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <img src={opp.homeTeamLogo} alt="" className="w-5 h-5" />
                          <span className="text-sm text-white font-medium">{opp.homeTeam}</span>
                          <span className="text-xs text-gray-500">vs</span>
                          <span className="text-sm text-white font-medium">{opp.awayTeam}</span>
                          <img src={opp.awayTeamLogo} alt="" className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={cn(
                            "text-[10px]",
                            opp.status === 'APPROVED' ? "bg-green-500 text-white" :
                            opp.status === 'REJECTED_LOW_EV' ? "bg-red-500 text-white" :
                            opp.status === 'REJECTED_LOW_PROB' ? "bg-orange-500 text-white" :
                            "bg-gray-500 text-white"
                          )}>
                            {opp.status === 'APPROVED' ? '✓ APROVADO' : 
                             opp.status === 'REJECTED_LOW_EV' ? '✗ EV BAIXO' :
                             opp.status === 'REJECTED_LOW_PROB' ? '✗ PROB BAIXA' :
                             '✗ SEM ODDS'}
                          </Badge>
                          {opp.potentialBadge && (
                            <Badge className={cn(
                              "text-[10px]",
                              opp.potentialBadge === 'DIAMOND' ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-black" :
                              opp.potentialBadge === 'GOLD' ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black" :
                              "bg-gray-500 text-white"
                            )}>
                              {opp.potentialBadge}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Mercado:</span>
                          <span className="ml-1 text-white">{opp.market}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Prob:</span>
                          <span className="ml-1 text-cyan-400">{opp.probability}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Odd:</span>
                          <span className="ml-1 text-white">{opp.bookmakerOdd?.toFixed(2) || '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Fair:</span>
                          <span className="ml-1 text-gray-400">{opp.fairOdd.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">EV:</span>
                          <span className={cn(
                            "ml-1",
                            (opp.expectedValue || 0) >= 3 ? "text-green-400" : "text-red-400"
                          )}>
                            {opp.expectedValue !== null ? `${opp.expectedValue}%` : '-'}
                          </span>
                        </div>
                      </div>
                      {opp.rejectionReason && (
                        <p className="mt-2 text-xs text-gray-400 italic">{opp.rejectionReason}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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

  const createFreeMutation = useMutation({
    mutationFn: async (formData: any) => {
      const newTip = await tipsService.create(formData);
      await axios.patch(`/api/tips/${newTip.id}/free`, {
        isFree: true,
        adminEmail: user?.email,
        adminUserId: user?.id,
      });
      return newTip;
    },
    onSuccess: async (newTip) => {
      queryClient.invalidateQueries({ queryKey: ['tips'] });
      toast.success("Bilhete FREE criado com sucesso!");
      
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
      toast.error(error.message || "Erro ao criar bilhete FREE.");
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

  const setFreeMutation = useMutation({
    mutationFn: async ({ id, isFree }: { id: string; isFree: boolean }) => {
      const response = await axios.patch(`/api/tips/${id}/free`, {
        isFree,
        adminEmail: user?.email,
        adminUserId: user?.id,
      });
      return response.data.tip;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tips'] });
      toast.success(variables.isFree ? "Bilhete marcado como FREE!" : "Bilhete removido do FREE");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar bilhete free.");
    }
  });

  const handleCreateTip = (formData: any) => {
    if (user?.role !== 'admin' && user?.email !== 'kwillianferreira@gmail.com') {
      toast.error("Apenas administradores podem criar tips.");
      return;
    }
    createMutation.mutate(formData);
  };

  const handleCreateFreeTip = (formData: any) => {
    if (user?.role !== 'admin' && user?.email !== 'kwillianferreira@gmail.com') {
      toast.error("Apenas administradores podem criar tips.");
      return;
    }
    createFreeMutation.mutate(formData);
  };

  const freeTip = signals.find(s => s.isFree);
  
  const tabs = [
    { id: 'tickets' as const, label: 'Bilhetes', icon: LayoutDashboard, color: 'from-[#33b864] to-emerald-600', badge: signals.length },
    { id: 'free' as const, label: 'Bilhete Free', icon: Gift, color: 'from-yellow-500 to-orange-500', badge: freeTip ? 1 : 0 },
    { id: 'oraculo' as const, label: 'ELITE ENGINE', icon: Diamond, color: 'from-cyan-500 to-blue-500' },
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

      {/* TAB 2: BILHETE FREE - Para usuários não-Prime */}
      {activeTab === 'free' && (
        <div className="space-y-6">
          {/* Explicação */}
          <Card className="border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Gift className="w-6 h-6 text-yellow-500" />
                Bilhete Grátis do Dia
              </CardTitle>
              <CardDescription className="text-gray-400">
                Crie um bilhete free manual ou selecione um bilhete existente. Usuários não-Prime verão este bilhete + 10 bloqueados.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Criar Bilhete FREE Manual */}
          <Card className="border-yellow-500/30">
            <CardHeader className="pb-3 border-b border-yellow-500/20">
              <CardTitle className="flex items-center gap-2 text-base">
                <PlusCircle className="w-5 h-5 text-yellow-500" />
                Criar Bilhete FREE Manual
              </CardTitle>
              <CardDescription className="text-gray-400">
                O bilhete criado aqui será automaticamente marcado como FREE
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ManualTicketForm onSubmit={handleCreateFreeTip} isSubmitting={createFreeMutation.isPending} />
            </CardContent>
          </Card>

          {/* Bilhete FREE Atual */}
          {freeTip ? (
            <Card className="border-[#33b864] bg-gradient-to-br from-[#33b864]/10 to-green-900/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base text-[#33b864]">
                    <Star className="w-5 h-5 fill-[#33b864]" />
                    Bilhete FREE Ativo
                  </CardTitle>
                  <Button
                    onClick={() => setFreeMutation.mutate({ id: freeTip.id, isFree: false })}
                    variant="outline"
                    size="sm"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                    data-testid="button-remove-free"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Remover
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-[#0d1117] rounded-xl p-4 border border-[#33b864]/30">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">FREE</Badge>
                        <span className="text-xs text-gray-500">{freeTip.league}</span>
                      </div>
                      <h4 className="text-white font-bold">{freeTip.homeTeam} vs {freeTip.awayTeam}</h4>
                      <p className="text-gray-400 text-sm">{freeTip.market}</p>
                    </div>
                    <div className="bg-[#33b864]/20 border border-[#33b864] rounded-lg px-3 py-1 text-center">
                      <span className="text-xs text-[#33b864] block">ODD</span>
                      <span className="text-lg font-bold text-[#33b864]">{freeTip.odd.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-yellow-500/30 border-dashed">
              <CardContent className="py-10 text-center">
                <Gift className="w-12 h-12 mx-auto mb-3 text-yellow-500/50" />
                <p className="text-gray-400">Nenhum bilhete FREE selecionado</p>
                <p className="text-sm text-gray-500 mt-1">Selecione um bilhete abaixo</p>
              </CardContent>
            </Card>
          )}

          {/* Lista de Bilhetes para selecionar */}
          <Card className="border-white/10">
            <CardHeader className="pb-3 border-b border-white/10">
              <CardTitle className="text-base">Selecionar Bilhete FREE</CardTitle>
              <CardDescription className="text-gray-400">
                Apenas bilhetes pendentes podem ser selecionados
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {signals.filter(s => s.status === 'pending').length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>Nenhum bilhete pendente disponível</p>
                </div>
              ) : (
                signals.filter(s => s.status === 'pending').map((signal) => (
                  <div
                    key={signal.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all",
                      signal.isFree 
                        ? "border-[#33b864] bg-[#33b864]/10" 
                        : "border-white/10 bg-white/5 hover:border-yellow-500/50"
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {signal.isFree && <Star className="w-4 h-4 text-[#33b864] fill-[#33b864]" />}
                        <span className="text-xs text-gray-500">{signal.league}</span>
                      </div>
                      <h4 className="text-white font-bold text-sm">{signal.homeTeam} vs {signal.awayTeam}</h4>
                      <p className="text-gray-400 text-xs">{signal.market.split('\n')[0]}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs text-gray-500 block">ODD</span>
                        <span className="text-lg font-bold text-[#33b864]">{signal.odd.toFixed(2)}</span>
                      </div>
                      <Button
                        onClick={() => setFreeMutation.mutate({ id: signal.id, isFree: !signal.isFree })}
                        disabled={setFreeMutation.isPending}
                        className={cn(
                          "h-10 px-4 rounded-xl font-bold transition-all",
                          signal.isFree 
                            ? "bg-[#33b864] text-black" 
                            : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 hover:bg-yellow-500 hover:text-black"
                        )}
                        data-testid={`button-set-free-${signal.id}`}
                      >
                        {signal.isFree ? (
                          <><Check className="w-4 h-4 mr-1" />FREE</>
                        ) : (
                          <><Gift className="w-4 h-4 mr-1" />Marcar</>
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB: ORÁCULO - Predictive Sports Engine V3.0 */}
      {activeTab === 'oraculo' && (
        <OraculoTab user={user} />
      )}

      {/* TAB 3: JOGOS QUENTES - EM CONSTRUÇÃO */}
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
