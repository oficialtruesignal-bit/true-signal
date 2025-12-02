import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Target, 
  CornerRightDown, 
  Swords, 
  CloudRain, 
  Brain, 
  TrendingUp, 
  ChevronRight,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';

interface GoalsAnalysis {
  over15Pct: number;
  over25Pct: number;
  over35Pct: number;
  avgGoalsHome: number;
  avgGoalsAway: number;
  expectedGoals: number;
  bttsRate: number;
  homeExpectedGoals: number;
  awayExpectedGoals: number;
}

interface CornersAnalysis {
  avgCornersHome: number;
  avgCornersAway: number;
  totalExpectedCorners: number;
  over75Pct: number;
  over85Pct: number;
  over95Pct: number;
  over105Pct: number;
}

interface H2HAnalysis {
  totalGames: number;
  homeWins: number;
  awayWins: number;
  draws: number;
  avgGoals: number;
  avgCorners: number;
}

interface ClimateAnalysis {
  temperature: string;
  humidity: string;
  conditions: string;
  impact: string;
}

interface MarketRecommendation {
  marketType: string;
  marketLabel: string;
  selection: string;
  bookmakerOdd: number;
  modelProbability: number;
  fairOdd: number;
  evPercent: number;
  evRating: 'excellent' | 'good' | 'moderate' | 'low' | 'negative';
  suggestedStake: number;
  kellyStake: number;
  rationale: string[];
  confidenceLevel: 'high' | 'medium' | 'low';
  isMainPick: boolean;
  isValueBet: boolean;
}

interface TipAnalysisData {
  goalsAnalysis: GoalsAnalysis | null;
  cornersAnalysis: CornersAnalysis | null;
  h2hAnalysis: H2HAnalysis | null;
  climateAnalysis: ClimateAnalysis | null;
  tacticalInsights: string[];
  finalRecommendation: string;
}

interface Props {
  tipId: string;
  homeTeam: string;
  awayTeam: string;
  trigger: React.ReactNode;
}

export function TipAnalysisModal({ tipId, homeTeam, awayTeam, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<TipAnalysisData | null>(null);
  const [recommendations, setRecommendations] = useState<MarketRecommendation[]>([]);

  useEffect(() => {
    if (open && !analysis) {
      fetchAnalysis();
    }
  }, [open]);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/tips/${tipId}/analysis`);
      if (response.data.success) {
        setAnalysis(response.data.analysis);
        setRecommendations(response.data.marketRecommendations || []);
      }
    } catch (err: any) {
      console.error('Error fetching analysis:', err);
      setError(err.response?.data?.error || 'Erro ao carregar análise');
    } finally {
      setLoading(false);
    }
  };

  const getEvColor = (ev: number) => {
    if (ev >= 10) return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (ev >= 5) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    if (ev >= 0) return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
    return 'text-red-400 bg-red-500/20 border-red-500/30';
  };

  const getConfidenceColor = (level: string) => {
    if (level === 'high') return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (level === 'medium') return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] bg-[#0d0d0d] border-white/10 p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0 border-b border-white/5">
          <DialogTitle className="flex items-center gap-3 text-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
              <Brain className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <span className="text-sm font-normal text-gray-400">Análise Completa</span>
              <p className="text-base font-bold">{homeTeam} vs {awayTeam}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[70vh]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              <p className="text-gray-400 text-sm">Gerando análise com IA...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 px-6">
              <AlertTriangle className="w-10 h-10 text-orange-400" />
              <p className="text-gray-300 text-center">{error}</p>
              <button 
                onClick={fetchAnalysis}
                className="mt-4 px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          ) : analysis ? (
            <Tabs defaultValue="ev" className="w-full">
              <TabsList className="w-full justify-start bg-[#1a1a1a] border-b border-white/5 rounded-none p-0">
                <TabsTrigger value="ev" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 rounded-none px-4 py-2.5 text-xs">
                  <TrendingUp className="w-3 h-3 mr-1.5" />
                  Mercados EV+
                </TabsTrigger>
                <TabsTrigger value="goals" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 rounded-none px-4 py-2.5 text-xs">
                  <Target className="w-3 h-3 mr-1.5" />
                  Gols
                </TabsTrigger>
                <TabsTrigger value="corners" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 rounded-none px-4 py-2.5 text-xs">
                  <CornerRightDown className="w-3 h-3 mr-1.5" />
                  Escanteios
                </TabsTrigger>
                <TabsTrigger value="h2h" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 rounded-none px-4 py-2.5 text-xs">
                  <Swords className="w-3 h-3 mr-1.5" />
                  H2H
                </TabsTrigger>
                <TabsTrigger value="tactics" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 rounded-none px-4 py-2.5 text-xs">
                  <Brain className="w-3 h-3 mr-1.5" />
                  Táticas
                </TabsTrigger>
              </TabsList>

              <div className="p-4">
                <TabsContent value="ev" className="m-0">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      Mercados com Valor Positivo (EV+)
                    </h3>
                    
                    {recommendations.length > 0 ? (
                      <div className="space-y-2">
                        {recommendations
                          .filter(r => r.evPercent > 0)
                          .sort((a, b) => b.evPercent - a.evPercent)
                          .map((rec, idx) => (
                            <div 
                              key={idx}
                              className={cn(
                                "p-3 rounded-lg border transition-colors",
                                rec.isMainPick 
                                  ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30" 
                                  : "bg-white/5 border-white/10"
                              )}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-white font-medium text-sm">{rec.marketLabel}</span>
                                    {rec.isMainPick && (
                                      <Badge className="bg-green-500/20 text-green-400 text-[10px] px-1.5 py-0">
                                        PRINCIPAL
                                      </Badge>
                                    )}
                                    {rec.isValueBet && (
                                      <Badge className="bg-purple-500/20 text-purple-400 text-[10px] px-1.5 py-0">
                                        VALUE
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-gray-300 text-sm mb-2">{rec.selection}</p>
                                  
                                  <div className="flex flex-wrap gap-2 text-[10px]">
                                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                                      Odd: {rec.bookmakerOdd.toFixed(2)}
                                    </span>
                                    <span className="px-2 py-0.5 rounded bg-gray-500/20 text-gray-300">
                                      Fair Odd: {rec.fairOdd.toFixed(2)}
                                    </span>
                                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                                      Prob: {rec.modelProbability.toFixed(0)}%
                                    </span>
                                    <span className={cn("px-2 py-0.5 rounded border", getConfidenceColor(rec.confidenceLevel))}>
                                      {rec.confidenceLevel === 'high' ? 'Alta' : rec.confidenceLevel === 'medium' ? 'Média' : 'Baixa'}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className={cn(
                                  "flex flex-col items-center px-3 py-2 rounded-lg border",
                                  getEvColor(rec.evPercent)
                                )}>
                                  <span className="text-lg font-bold">+{rec.evPercent.toFixed(1)}%</span>
                                  <span className="text-[10px] opacity-80">EV</span>
                                </div>
                              </div>
                              
                              {rec.rationale && typeof rec.rationale === 'object' && Array.isArray(rec.rationale) && rec.rationale.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-white/5">
                                  <p className="text-[10px] text-gray-400">
                                    {rec.rationale.join(' • ')}
                                  </p>
                                </div>
                              )}
                              
                              <div className="mt-2 flex items-center gap-3 text-[10px] text-gray-500">
                                <span>Stake sugerido: <span className="text-white font-medium">{rec.suggestedStake.toFixed(1)}u</span></span>
                                <span>Kelly: <span className="text-white font-medium">{(rec.kellyStake * 100).toFixed(1)}%</span></span>
                              </div>
                            </div>
                          ))
                        }
                        
                        {recommendations.filter(r => r.evPercent > 0).length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Nenhum mercado com EV positivo encontrado</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">Sem recomendações disponíveis</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="goals" className="m-0">
                  {analysis.goalsAnalysis ? (
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-400" />
                        Análise de Gols
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <StatCard 
                          label="Expectativa de Gols" 
                          value={analysis.goalsAnalysis.expectedGoals.toFixed(2)}
                          sublabel="xG total"
                        />
                        <StatCard 
                          label="BTTS Rate" 
                          value={`${analysis.goalsAnalysis.bttsRate.toFixed(0)}%`}
                          sublabel="Ambos marcam"
                        />
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-3">Probabilidades de Over/Under</p>
                        <div className="space-y-2">
                          <ProgressBar label="Over 1.5" value={analysis.goalsAnalysis.over15Pct} />
                          <ProgressBar label="Over 2.5" value={analysis.goalsAnalysis.over25Pct} />
                          <ProgressBar label="Over 3.5" value={analysis.goalsAnalysis.over35Pct} />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                          <p className="text-[10px] text-blue-300 mb-1">{homeTeam}</p>
                          <p className="text-xl font-bold text-white">{analysis.goalsAnalysis.homeExpectedGoals.toFixed(2)}</p>
                          <p className="text-[10px] text-gray-400">xG esperado</p>
                        </div>
                        <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                          <p className="text-[10px] text-red-300 mb-1">{awayTeam}</p>
                          <p className="text-xl font-bold text-white">{analysis.goalsAnalysis.awayExpectedGoals.toFixed(2)}</p>
                          <p className="text-[10px] text-gray-400">xG esperado</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <EmptyState message="Análise de gols não disponível" />
                  )}
                </TabsContent>

                <TabsContent value="corners" className="m-0">
                  {analysis.cornersAnalysis ? (
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <CornerRightDown className="w-4 h-4 text-orange-400" />
                        Análise de Escanteios
                      </h3>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <StatCard 
                          label={homeTeam} 
                          value={analysis.cornersAnalysis.avgCornersHome.toFixed(1)}
                          sublabel="média/jogo"
                        />
                        <StatCard 
                          label="Total Esperado" 
                          value={analysis.cornersAnalysis.totalExpectedCorners.toFixed(1)}
                          sublabel="escanteios"
                          highlight
                        />
                        <StatCard 
                          label={awayTeam} 
                          value={analysis.cornersAnalysis.avgCornersAway.toFixed(1)}
                          sublabel="média/jogo"
                        />
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-3">Probabilidades de Over Corners</p>
                        <div className="space-y-2">
                          <ProgressBar label="Over 7.5" value={analysis.cornersAnalysis.over75Pct} color="orange" />
                          <ProgressBar label="Over 8.5" value={analysis.cornersAnalysis.over85Pct} color="orange" />
                          <ProgressBar label="Over 9.5" value={analysis.cornersAnalysis.over95Pct} color="orange" />
                          <ProgressBar label="Over 10.5" value={analysis.cornersAnalysis.over105Pct} color="orange" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <EmptyState message="Análise de escanteios não disponível" />
                  )}
                </TabsContent>

                <TabsContent value="h2h" className="m-0">
                  {analysis.h2hAnalysis ? (
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Swords className="w-4 h-4 text-purple-400" />
                        Histórico de Confrontos
                      </h3>
                      
                      <div className="bg-white/5 rounded-lg p-4">
                        <p className="text-xs text-gray-400 mb-3">{analysis.h2hAnalysis.totalGames} jogos analisados</p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-center flex-1">
                            <p className="text-2xl font-bold text-green-400">{analysis.h2hAnalysis.homeWins}</p>
                            <p className="text-[10px] text-gray-400">{homeTeam}</p>
                          </div>
                          <div className="text-center px-4">
                            <p className="text-2xl font-bold text-gray-400">{analysis.h2hAnalysis.draws}</p>
                            <p className="text-[10px] text-gray-400">Empates</p>
                          </div>
                          <div className="text-center flex-1">
                            <p className="text-2xl font-bold text-red-400">{analysis.h2hAnalysis.awayWins}</p>
                            <p className="text-[10px] text-gray-400">{awayTeam}</p>
                          </div>
                        </div>
                        
                        <div className="h-2 rounded-full overflow-hidden flex bg-gray-700">
                          <div 
                            className="bg-green-500 transition-all" 
                            style={{ width: `${(analysis.h2hAnalysis.homeWins / analysis.h2hAnalysis.totalGames) * 100}%` }}
                          />
                          <div 
                            className="bg-gray-500 transition-all" 
                            style={{ width: `${(analysis.h2hAnalysis.draws / analysis.h2hAnalysis.totalGames) * 100}%` }}
                          />
                          <div 
                            className="bg-red-500 transition-all" 
                            style={{ width: `${(analysis.h2hAnalysis.awayWins / analysis.h2hAnalysis.totalGames) * 100}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <StatCard 
                          label="Média de Gols" 
                          value={analysis.h2hAnalysis.avgGoals.toFixed(1)}
                          sublabel="por jogo"
                        />
                        <StatCard 
                          label="Média Escanteios" 
                          value={analysis.h2hAnalysis.avgCorners.toFixed(1)}
                          sublabel="por jogo"
                        />
                      </div>
                    </div>
                  ) : (
                    <EmptyState message="Histórico de confrontos não disponível" />
                  )}
                </TabsContent>

                <TabsContent value="tactics" className="m-0">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Brain className="w-4 h-4 text-blue-400" />
                      Insights Táticos
                    </h3>
                    
                    {analysis.tacticalInsights && analysis.tacticalInsights.length > 0 ? (
                      <div className="space-y-2">
                        {analysis.tacticalInsights.map((insight, idx) => (
                          <div 
                            key={idx}
                            className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                          >
                            <ChevronRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-300">{insight}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState message="Insights táticos não disponíveis" />
                    )}
                    
                    {analysis.finalRecommendation && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
                        <p className="text-xs text-purple-300 mb-2 font-medium">Recomendação Final</p>
                        <p className="text-sm text-white">{analysis.finalRecommendation}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          ) : null}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({ label, value, sublabel, highlight }: { label: string; value: string; sublabel: string; highlight?: boolean }) {
  return (
    <div className={cn(
      "rounded-lg p-3 border",
      highlight 
        ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30" 
        : "bg-white/5 border-white/10"
    )}>
      <p className="text-[10px] text-gray-400 truncate">{label}</p>
      <p className={cn("text-xl font-bold", highlight ? "text-green-400" : "text-white")}>{value}</p>
      <p className="text-[10px] text-gray-500">{sublabel}</p>
    </div>
  );
}

function ProgressBar({ label, value, color = 'green' }: { label: string; value: number; color?: 'green' | 'orange' }) {
  const bgColor = color === 'green' ? 'bg-green-500' : 'bg-orange-500';
  const trackColor = color === 'green' ? 'bg-green-500/20' : 'bg-orange-500/20';
  
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 w-16">{label}</span>
      <div className={cn("flex-1 h-2 rounded-full", trackColor)}>
        <div 
          className={cn("h-full rounded-full transition-all", bgColor)}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="text-xs text-white font-medium w-10 text-right">{value.toFixed(0)}%</span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-8 text-gray-500">
      <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
