import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import axios from "axios";
import { 
  Brain, 
  Check, 
  X, 
  Loader2, 
  TrendingUp, 
  Target, 
  Zap,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Calendar,
  Clock,
  BarChart3,
  CheckCircle2,
  Info,
  Link
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface BetLeg {
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  league: string;
  fixtureId?: string;
  market: string;
  outcome?: string;
  odd: number;
  probability?: number;
  confidence?: number;
  rationale?: string[];
  time: string;
}

interface AiDraft {
  id: string;
  fixtureId: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo: string | null;
  awayTeamLogo: string | null;
  matchTime: string;
  market: string;
  predictedOutcome: string;
  suggestedOdd: string;
  suggestedStake: string;
  confidence: string;
  probability: string;
  expectedValue: string | null;
  analysisRationale: string | null;
  formScore: string | null;
  goalTrendScore: string | null;
  h2hScore: string | null;
  status: string;
  createdAt: string;
  isCombo?: boolean;
  legs?: string;
  totalOdd?: string;
}

interface AiStats {
  pendingDrafts: number;
  highConfidence: number;
  markets: {
    over25: number;
    under25: number;
    btts: number;
    result: number;
    corners: number;
    cards: number;
    shots: number;
  };
}

type MarketFilter = 'all' | 'over25' | 'btts' | 'highConfidence' | 'corners' | 'cards' | 'shots';

export function AiDraftsPanel() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedDraft, setExpandedDraft] = useState<string | null>(null);
  const [selectedDrafts, setSelectedDrafts] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<MarketFilter>('all');
  const [editedCombos, setEditedCombos] = useState<Record<string, BetLeg[]>>({});
  const [betLinks, setBetLinks] = useState<Record<string, string>>({});

  const { data: drafts = [], isLoading: loadingDrafts, refetch: refetchDrafts } = useQuery<AiDraft[]>({
    queryKey: ['ai-drafts'],
    queryFn: async () => {
      const response = await axios.get('/api/ai/drafts');
      return response.data;
    },
  });

  const { data: stats } = useQuery<AiStats>({
    queryKey: ['ai-stats'],
    queryFn: async () => {
      const response = await axios.get('/api/ai/stats');
      return response.data;
    },
  });

  const runAnalysis = async () => {
    if (!user?.email || !user?.id) {
      toast.error("Você precisa estar logado como admin");
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await axios.post('/api/ai/analyze', {
        date: selectedDate,
        adminEmail: user.email,
        adminUserId: user.id,
      });

      if (response.data.success) {
        toast.success(response.data.message);
        refetchDrafts();
        queryClient.invalidateQueries({ queryKey: ['ai-stats'] });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao executar análise");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const approveDraft = async (id: string) => {
    if (!user?.email || !user?.id) return;

    try {
      const response = await axios.post(`/api/ai/drafts/${id}/approve`, {
        adminEmail: user.email,
        adminUserId: user.id,
        betLink: betLinks[id] || null,
      });

      if (response.data.success) {
        toast.success("Previsão aprovada e publicada!");
        refetchDrafts();
        queryClient.invalidateQueries({ queryKey: ['tips'] });
        queryClient.invalidateQueries({ queryKey: ['ai-stats'] });
        // Limpar o link após aprovar
        setBetLinks(prev => {
          const newLinks = { ...prev };
          delete newLinks[id];
          return newLinks;
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao aprovar previsão");
    }
  };

  const rejectDraft = async (id: string) => {
    if (!user?.email || !user?.id) return;

    try {
      const response = await axios.post(`/api/ai/drafts/${id}/reject`, {
        adminEmail: user.email,
        adminUserId: user.id,
      });

      if (response.data.success) {
        toast.success("Previsão rejeitada");
        refetchDrafts();
        queryClient.invalidateQueries({ queryKey: ['ai-stats'] });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao rejeitar previsão");
    }
  };

  const bulkApprove = async () => {
    if (!user?.email || !user?.id || selectedDrafts.size === 0) return;

    try {
      const response = await axios.post('/api/ai/drafts/bulk-approve', {
        ids: Array.from(selectedDrafts),
        adminEmail: user.email,
        adminUserId: user.id,
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setSelectedDrafts(new Set());
        refetchDrafts();
        queryClient.invalidateQueries({ queryKey: ['tips'] });
        queryClient.invalidateQueries({ queryKey: ['ai-stats'] });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao aprovar em lote");
    }
  };

  const toggleDraftSelection = (id: string) => {
    const newSelected = new Set(selectedDrafts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedDrafts(newSelected);
  };

  const selectAllHighConfidence = () => {
    const highConfidenceIds = drafts
      .filter(d => parseFloat(d.confidence) >= 85)
      .map(d => d.id);
    setSelectedDrafts(new Set(highConfidenceIds));
  };

  // Função para remover uma linha do combo
  const removeComboLeg = async (draftId: string, legIndex: number, currentLegs: BetLeg[]) => {
    if (currentLegs.length <= 1) {
      toast.error("Combo precisa ter pelo menos 1 linha. Rejeite o bilhete se não quiser publicar.");
      return;
    }

    const newLegs = currentLegs.filter((_, idx) => idx !== legIndex);
    
    // Recalcular odd total e probabilidade combinada
    const newTotalOdd = newLegs.reduce((acc, leg) => acc * leg.odd, 1);
    const newCombinedProbability = newLegs.reduce((acc, leg) => acc * ((leg.probability || 50) / 100), 1) * 100;
    const newAvgConfidence = newLegs.reduce((acc, leg) => acc + (leg.confidence || 85), 0) / newLegs.length;

    try {
      const response = await axios.patch(`/api/ai/drafts/${draftId}/update-legs`, {
        legs: newLegs,
        totalOdd: newTotalOdd,
        probability: newCombinedProbability,
        confidence: newAvgConfidence,
        adminEmail: user?.email,
        adminUserId: user?.id,
      });

      if (response.data.success) {
        toast.success(`Linha removida! Combo agora tem ${newLegs.length} seleções`);
        // Atualizar estado local para refletir a mudança
        setEditedCombos(prev => ({ ...prev, [draftId]: newLegs }));
        refetchDrafts();
        queryClient.invalidateQueries({ queryKey: ['ai-stats'] });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao remover linha do combo");
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-400 bg-green-500/20';
    if (confidence >= 75) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-orange-400 bg-orange-500/20';
  };

  const normalizeText = (text: string): string => {
    return text.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const filterDrafts = (drafts: AiDraft[]): AiDraft[] => {
    if (activeFilter === 'all') return drafts;
    
    return drafts.filter(draft => {
      const market = normalizeText(draft.market);
      const confidence = parseFloat(draft.confidence);
      
      switch (activeFilter) {
        case 'highConfidence':
          return confidence >= 85;
        case 'over25':
          return market.includes('over 2.5') || market.includes('over 1.5') || market.includes('gols');
        case 'btts':
          return market.includes('btts') || market.includes('ambas');
        case 'corners':
          return market.includes('corner') || market.includes('escanteio');
        case 'cards':
          return market.includes('card') || market.includes('cartao') || market.includes('cartoes');
        case 'shots':
          return market.includes('shot') || market.includes('chute');
        default:
          return true;
      }
    });
  };

  const filteredDrafts = filterDrafts(drafts);

  const formatMatchTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Stats - Clickable Filter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveFilter(activeFilter === 'all' ? 'all' : 'all')}
          className={`bg-gradient-to-br from-primary/20 to-primary/5 border rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02] ${activeFilter === 'all' ? 'border-primary ring-2 ring-primary/50' : 'border-primary/30'}`}
          data-testid="filter-all"
        >
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-primary" />
            <span className="text-xs text-gray-400">RASCUNHOS</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats?.pendingDrafts || 0}</p>
        </div>
        
        <div 
          onClick={() => setActiveFilter(activeFilter === 'highConfidence' ? 'all' : 'highConfidence')}
          className={`bg-gradient-to-br from-green-500/20 to-green-500/5 border rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02] ${activeFilter === 'highConfidence' ? 'border-green-400 ring-2 ring-green-400/50' : 'border-green-500/30'}`}
          data-testid="filter-high-confidence"
        >
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-green-400" />
            <span className="text-xs text-gray-400">ALTA CONFIANÇA</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{stats?.highConfidence || 0}</p>
        </div>
        
        <div 
          onClick={() => setActiveFilter(activeFilter === 'over25' ? 'all' : 'over25')}
          className={`bg-gradient-to-br from-blue-500/20 to-blue-500/5 border rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02] ${activeFilter === 'over25' ? 'border-blue-400 ring-2 ring-blue-400/50' : 'border-blue-500/30'}`}
          data-testid="filter-over25"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-gray-400">OVER 2.5</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">{stats?.markets?.over25 || 0}</p>
        </div>
        
        <div 
          onClick={() => setActiveFilter(activeFilter === 'btts' ? 'all' : 'btts')}
          className={`bg-gradient-to-br from-purple-500/20 to-purple-500/5 border rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02] ${activeFilter === 'btts' ? 'border-purple-400 ring-2 ring-purple-400/50' : 'border-purple-500/30'}`}
          data-testid="filter-btts"
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-gray-400">BTTS</span>
          </div>
          <p className="text-2xl font-bold text-purple-400">{stats?.markets?.btts || 0}</p>
        </div>
      </div>

      {/* Secondary Filter Row - More Markets */}
      <div className="grid grid-cols-3 gap-3">
        <div 
          onClick={() => setActiveFilter(activeFilter === 'corners' ? 'all' : 'corners')}
          className={`bg-gradient-to-br from-orange-500/20 to-orange-500/5 border rounded-lg p-3 cursor-pointer transition-all hover:scale-[1.02] ${activeFilter === 'corners' ? 'border-orange-400 ring-2 ring-orange-400/50' : 'border-orange-500/30'}`}
          data-testid="filter-corners"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🚩</span>
            <span className="text-xs text-gray-400">ESCANTEIOS</span>
          </div>
          <p className="text-xl font-bold text-orange-400">{stats?.markets?.corners || 0}</p>
        </div>
        
        <div 
          onClick={() => setActiveFilter(activeFilter === 'cards' ? 'all' : 'cards')}
          className={`bg-gradient-to-br from-red-500/20 to-red-500/5 border rounded-lg p-3 cursor-pointer transition-all hover:scale-[1.02] ${activeFilter === 'cards' ? 'border-red-400 ring-2 ring-red-400/50' : 'border-red-500/30'}`}
          data-testid="filter-cards"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🟨</span>
            <span className="text-xs text-gray-400">CARTÕES</span>
          </div>
          <p className="text-xl font-bold text-red-400">{stats?.markets?.cards || 0}</p>
        </div>
        
        <div 
          onClick={() => setActiveFilter(activeFilter === 'shots' ? 'all' : 'shots')}
          className={`bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border rounded-lg p-3 cursor-pointer transition-all hover:scale-[1.02] ${activeFilter === 'shots' ? 'border-cyan-400 ring-2 ring-cyan-400/50' : 'border-cyan-500/30'}`}
          data-testid="filter-shots"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <span className="text-xs text-gray-400">CHUTES</span>
          </div>
          <p className="text-xl font-bold text-cyan-400">{stats?.markets?.shots || 0}</p>
        </div>
      </div>

      {/* Active Filter Indicator */}
      {activeFilter !== 'all' && (
        <div className="flex items-center justify-between bg-primary/10 border border-primary/30 rounded-lg px-4 py-2">
          <span className="text-sm text-primary font-medium">
            Filtro ativo: <span className="font-bold uppercase">{activeFilter === 'highConfidence' ? 'Alta Confiança 85%+' : activeFilter === 'over25' ? 'Over 2.5 Gols' : activeFilter === 'btts' ? 'BTTS' : activeFilter === 'corners' ? 'Escanteios' : activeFilter === 'cards' ? 'Cartões' : 'Chutes'}</span>
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setActiveFilter('all')}
            className="text-primary hover:text-white"
          >
            <X className="w-4 h-4 mr-1" /> Limpar
          </Button>
        </div>
      )}

      {/* Confidence Explanation Card - Mobile Optimized */}
      <div className="bg-gradient-to-r from-primary/10 via-green-500/5 to-blue-500/10 border border-primary/20 rounded-xl p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-primary flex-shrink-0" />
          <h4 className="font-bold text-white text-xs sm:text-sm">O que significa a % de Confiança?</h4>
        </div>
        <p className="text-[10px] sm:text-xs text-gray-400 leading-relaxed mb-2">
          Indica o <span className="text-primary font-semibold">nível de certeza da IA</span> baseado em estatísticas, histórico H2H e forma dos times.
        </p>
        <div className="flex items-center justify-between gap-2 text-[10px] sm:text-xs">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            <span className="text-green-400 font-semibold">85%+</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
            <span className="text-yellow-400 font-semibold">75-84%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-400"></span>
            <span className="text-orange-400 font-semibold">&lt;75%</span>
          </span>
        </div>
      </div>

      {/* Analysis Controls */}
      <div className="bg-card border border-primary/20 rounded-xl p-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary/50 focus:outline-none"
              data-testid="input-ai-date"
            />
          </div>
          
          <Button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-primary to-green-600 hover:from-primary/90 hover:to-green-600/90 text-black font-bold gap-2"
            data-testid="button-run-analysis"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analisando jogos...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                Executar Análise IA
              </>
            )}
          </Button>

          {selectedDrafts.size > 0 && (
            <Button
              onClick={bulkApprove}
              className="bg-green-600 hover:bg-green-700 text-white font-bold gap-2"
              data-testid="button-bulk-approve"
            >
              <CheckCircle2 className="w-4 h-4" />
              Aprovar {selectedDrafts.size} Selecionados
            </Button>
          )}

          {drafts.length > 0 && (
            <Button
              onClick={selectAllHighConfidence}
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/10 gap-2"
              data-testid="button-select-high-confidence"
            >
              <Target className="w-4 h-4" />
              Selecionar Alta Confiança
            </Button>
          )}
        </div>
      </div>

      {/* Drafts List */}
      <div className="bg-card border border-primary/20 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-primary/10 bg-gradient-to-r from-primary/10 to-transparent flex justify-between items-center">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Previsões da IA
          </h3>
          <div className="flex items-center gap-2">
            {activeFilter !== 'all' && (
              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full font-semibold">
                {filteredDrafts.length} de {drafts.length}
              </span>
            )}
            <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-semibold">
              {filteredDrafts.length} Rascunhos
            </span>
          </div>
        </div>

        {loadingDrafts ? (
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filteredDrafts.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Brain className="w-12 h-12 mx-auto mb-4 opacity-30" />
            {activeFilter !== 'all' ? (
              <>
                <p>Nenhuma previsão encontrada para este filtro</p>
                <Button 
                  variant="ghost" 
                  onClick={() => setActiveFilter('all')}
                  className="mt-2 text-primary"
                >
                  Ver todas as previsões
                </Button>
              </>
            ) : (
              <>
                <p>Nenhuma previsão pendente</p>
                <p className="text-sm mt-2">Execute a análise para gerar previsões</p>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredDrafts.map((draft) => {
              const confidence = parseFloat(draft.confidence);
              const isExpanded = expandedDraft === draft.id;
              const isSelected = selectedDrafts.has(draft.id);
              const rationale = draft.analysisRationale ? JSON.parse(draft.analysisRationale) : [];
              const isCombo = draft.isCombo;
              
              // Safe parsing of legs with fallback
              let legs: BetLeg[] = [];
              try {
                if (draft.legs && typeof draft.legs === 'string') {
                  legs = JSON.parse(draft.legs);
                } else if (Array.isArray(draft.legs)) {
                  legs = draft.legs;
                }
              } catch (e) {
                console.warn('[AI Drafts] Failed to parse legs:', e);
                legs = [];
              }
              
              const displayOdd = isCombo && draft.totalOdd ? parseFloat(draft.totalOdd) : parseFloat(draft.suggestedOdd);

              return (
                <div 
                  key={draft.id}
                  className={`p-4 transition-all ${isSelected ? 'bg-primary/10' : 'hover:bg-white/5'} ${isCombo ? 'border-l-4 border-l-primary' : ''}`}
                >
                  {/* Combo Header */}
                  {isCombo && (
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-primary/20">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold text-primary uppercase tracking-wide">
                        Combo {legs.length} Seleções
                      </span>
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        Odd Total: {displayOdd.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Combo Legs List - Show each line with probability */}
                  {isCombo && legs.length > 0 ? (
                    <div className="space-y-2 mb-4">
                      {legs.map((leg, idx) => (
                        <div key={idx} className="bg-gradient-to-r from-background/80 to-background/40 rounded-lg p-3 border border-white/5 group">
                          <div className="flex items-center gap-2">
                            {/* Remove Button */}
                            <button
                              onClick={() => removeComboLeg(draft.id, idx, legs)}
                              className="w-6 h-6 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center flex-shrink-0 opacity-60 group-hover:opacity-100 transition-all"
                              title="Remover esta linha"
                              data-testid={`btn-remove-leg-${draft.id}-${idx}`}
                            >
                              <X className="w-3 h-3 text-red-400" />
                            </button>
                            
                            {/* Index Badge */}
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-primary">{idx + 1}</span>
                            </div>
                            
                            {/* Team Logos */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {leg.homeTeamLogo && (
                                <img src={leg.homeTeamLogo} alt="" className="w-5 h-5" />
                              )}
                              <span className="text-gray-500 text-[10px]">vs</span>
                              {leg.awayTeamLogo && (
                                <img src={leg.awayTeamLogo} alt="" className="w-5 h-5" />
                              )}
                            </div>
                            
                            {/* Market Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-primary truncate">{leg.market}</p>
                              {leg.outcome && <p className="text-xs text-gray-300 truncate">{leg.outcome}</p>}
                            </div>
                            
                            {/* Probability Badge */}
                            {leg.probability && (
                              <div className={`px-2 py-1 rounded-lg flex-shrink-0 ${
                                leg.probability >= 85 ? 'bg-green-500/20 text-green-400' : 
                                leg.probability >= 75 ? 'bg-yellow-500/20 text-yellow-400' : 
                                'bg-orange-500/20 text-orange-400'
                              }`}>
                                <p className="text-xs font-bold">{leg.probability.toFixed(0)}%</p>
                              </div>
                            )}
                            
                            {/* Odd */}
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-bold text-white">{leg.odd.toFixed(2)}</p>
                              <p className="text-[10px] text-gray-500">odd</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Combo Summary */}
                      <div className="mt-3 pt-3 border-t border-primary/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">Probabilidade Combinada:</span>
                          <span className={`text-sm font-bold ${
                            parseFloat(draft.probability) >= 50 ? 'text-green-400' : 
                            parseFloat(draft.probability) >= 30 ? 'text-yellow-400' : 'text-orange-400'
                          }`}>
                            {parseFloat(draft.probability).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">Odd Total:</span>
                          <span className="text-lg font-bold text-primary">{displayOdd.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Single Bet Row - Mobile Optimized */
                    <div className="space-y-3">
                      {/* Row 1: Market + Confidence + Odd + Time */}
                      <div className="flex items-center justify-between gap-2">
                        {/* Market Badge */}
                        <div className="flex-shrink-0">
                          <span className="inline-block bg-primary/20 text-primary px-3 py-1 rounded-lg text-sm font-semibold">
                            {draft.market}
                          </span>
                          {draft.predictedOutcome && (
                            <span className="ml-2 text-xs text-gray-400">{draft.predictedOutcome}</span>
                          )}
                        </div>
                        
                        {/* Confidence */}
                        <div className={`px-3 py-1.5 rounded-lg flex-shrink-0 ${getConfidenceColor(confidence)}`}>
                          <p className="text-sm font-bold">{confidence.toFixed(0)}%</p>
                        </div>

                        {/* Suggested Odd */}
                        <div className="text-center flex-shrink-0">
                          <p className="text-lg font-bold text-white">{displayOdd.toFixed(2)}</p>
                          <p className="text-[10px] text-gray-500">ODD</p>
                        </div>

                        {/* Match Time */}
                        <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          {formatMatchTime(draft.matchTime)}
                        </div>
                        
                        {/* Selection Checkbox */}
                        <button
                          onClick={() => toggleDraftSelection(draft.id)}
                          className={`w-8 h-8 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                            isSelected 
                              ? 'bg-primary border-primary' 
                              : 'border-white/20 hover:border-primary/50'
                          }`}
                          data-testid={`checkbox-draft-${draft.id}`}
                        >
                          {isSelected && <Check className="w-5 h-5 text-black" />}
                        </button>
                      </div>
                      
                      {/* Row 2: Team Logos + Match Info */}
                      <div className="flex items-center gap-3">
                        {/* Team Logos - Stacked */}
                        <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                          {draft.homeTeamLogo && (
                            <img src={draft.homeTeamLogo} alt="" className="w-7 h-7" />
                          )}
                          <span className="text-[8px] text-gray-600">vs</span>
                          {draft.awayTeamLogo && (
                            <img src={draft.awayTeamLogo} alt="" className="w-7 h-7" />
                          )}
                        </div>

                        {/* Match Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white text-sm truncate">
                            {draft.homeTeam}
                          </p>
                          <p className="font-bold text-white text-sm truncate">
                            {draft.awayTeam}
                          </p>
                          <p className="text-xs text-gray-400">{draft.league}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bet Link Input */}
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <Link className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <Input
                        placeholder="Cole o link do bilhete Bet365 aqui..."
                        value={betLinks[draft.id] || ''}
                        onChange={(e) => setBetLinks(prev => ({ ...prev, [draft.id]: e.target.value }))}
                        className="h-9 text-sm bg-background/50 border-border/50"
                        data-testid={`input-bet-link-${draft.id}`}
                      />
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      
                      {/* Confidence */}
                      <div className={`px-3 py-1.5 rounded-lg ${getConfidenceColor(confidence)}`}>
                        <p className="text-sm font-bold">{confidence.toFixed(0)}%</p>
                      </div>
                      
                      {/* Match Time */}
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {formatMatchTime(draft.matchTime)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => approveDraft(draft.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        data-testid={`button-approve-${draft.id}`}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectDraft(draft.id)}
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        data-testid={`button-reject-${draft.id}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Entenda o Motivo da Entrada - Expandable Button */}
                  <button
                    onClick={() => setExpandedDraft(isExpanded ? null : draft.id)}
                    className={`w-full mt-3 py-2 px-4 rounded-lg border transition-all flex items-center justify-center gap-2 text-sm font-medium ${
                      isExpanded 
                        ? 'bg-primary/20 border-primary/50 text-primary' 
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-primary/30'
                    }`}
                    data-testid={`button-expand-${draft.id}`}
                  >
                    <Brain className="w-4 h-4" />
                    {isExpanded ? 'Ocultar explicação' : 'Entenda o motivo da entrada'}
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {/* Expanded Details - Explicação do Analista */}
                  {isExpanded && (
                    <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
                      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 rounded-xl p-5 relative">
                        {/* Aspas decorativas */}
                        <div className="absolute top-3 left-4 text-4xl text-primary/30 font-serif">"</div>
                        
                        {/* Texto da análise */}
                        <div className="pl-8 pr-4 space-y-3">
                          <p className="text-gray-200 leading-relaxed text-sm">
                            {(() => {
                              const formScore = draft.formScore ? parseFloat(draft.formScore) : 0;
                              const goalTrend = draft.goalTrendScore ? parseFloat(draft.goalTrendScore) : 0;
                              const h2hScore = draft.h2hScore ? parseFloat(draft.h2hScore) : 0;
                              const prob = parseFloat(draft.probability);
                              const ev = draft.expectedValue ? parseFloat(draft.expectedValue) : 0;
                              
                              let analysis = `Analisando o confronto entre ${draft.homeTeam} e ${draft.awayTeam}, `;
                              
                              if (formScore > 70) {
                                analysis += `percebi que ambos os times estão em boa fase recente (${formScore.toFixed(0)}% de aproveitamento). `;
                              } else if (formScore > 50) {
                                analysis += `notei uma fase irregular dos times (${formScore.toFixed(0)}% de aproveitamento). `;
                              } else {
                                analysis += `os times não estão em sua melhor forma ultimamente. `;
                              }
                              
                              if (draft.market?.includes('Over') || draft.market?.includes('Gols')) {
                                if (goalTrend > 70) {
                                  analysis += `O histórico de gols é muito favorável — nos últimos jogos, a tendência de gols está em ${goalTrend.toFixed(0)}%, o que reforça a entrada em ${draft.market}. `;
                                } else {
                                  analysis += `A tendência de gols está em ${goalTrend.toFixed(0)}%, mas outros fatores compensam. `;
                                }
                              }
                              
                              if (draft.market?.includes('BTTS') || draft.market?.includes('Ambas')) {
                                analysis += `Olhando os últimos confrontos, ambas as equipes têm mostrado capacidade ofensiva consistente. `;
                              }
                              
                              if (draft.market?.includes('Escanteio') || draft.market?.includes('Corner')) {
                                analysis += `O padrão de escanteios desses times nos últimos jogos sustenta essa entrada. `;
                              }
                              
                              if (draft.market?.includes('Cartão') || draft.market?.includes('Card')) {
                                analysis += `O histórico de cartões e o estilo de jogo das equipes indicam potencial para essa entrada. `;
                              }
                              
                              if (h2hScore > 60) {
                                analysis += `O confronto direto também é um fator positivo — no histórico H2H (${h2hScore.toFixed(0)}%), esse padrão se repetiu. `;
                              }
                              
                              analysis += `Com base em tudo isso, a probabilidade calculada ficou em ${prob.toFixed(0)}%, `;
                              analysis += `o que me dá ${confidence.toFixed(0)}% de confiança nessa entrada.`;
                              
                              if (ev > 0) {
                                analysis += ` Além disso, o valor esperado é positivo (+${ev.toFixed(1)}%), indicando vantagem matemática a longo prazo.`;
                              }
                              
                              return analysis;
                            })()}
                          </p>
                          
                          {/* Dados estatísticos em linha */}
                          {rationale.length > 0 && (
                            <div className="pt-3 mt-3 border-t border-white/10">
                              <p className="text-xs text-gray-500 mb-2">Dados utilizados:</p>
                              <div className="flex flex-wrap gap-2">
                                {rationale.slice(0, 4).map((reason: string, index: number) => (
                                  <span key={index} className="text-xs bg-white/5 text-gray-400 px-2 py-1 rounded">
                                    {reason}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Aspas de fechamento */}
                        <div className="absolute bottom-3 right-4 text-4xl text-primary/30 font-serif">"</div>
                        
                        {/* Assinatura */}
                        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <Brain className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-white">TRUE SIGNAL IA</p>
                              <p className="text-[10px] text-gray-500">Análise automatizada</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-bold ${confidence >= 85 ? 'text-green-400' : confidence >= 75 ? 'text-yellow-400' : 'text-orange-400'}`}>
                              {confidence.toFixed(0)}% confiança
                            </p>
                            {draft.expectedValue && parseFloat(draft.expectedValue) > 0 && (
                              <div className="flex items-center gap-1">
                                <p className="text-xs text-green-400">+{parseFloat(draft.expectedValue).toFixed(1)}% EV</p>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <button className="w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                                      <Info className="w-2.5 h-2.5 text-gray-400" />
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-80 bg-background/95 backdrop-blur-sm border border-white/10 p-4" side="left">
                                    <div className="space-y-3">
                                      <h4 className="font-bold text-white flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-green-400" />
                                        O que é EV (Valor Esperado)?
                                      </h4>
                                      <p className="text-xs text-gray-300 leading-relaxed">
                                        O <span className="text-green-400 font-semibold">EV positivo</span> indica que a odd oferecida pela casa é <span className="text-white">maior do que deveria ser</span>, dando vantagem matemática a você.
                                      </p>
                                      <div className="bg-white/5 rounded-lg p-3 space-y-2">
                                        <p className="text-xs text-gray-400">
                                          <span className="text-white font-semibold">Exemplo:</span> Se a probabilidade é 67% e a odd é 1.65
                                        </p>
                                        <p className="text-xs text-gray-400">
                                          EV = (67% × 1.65) - 100% = <span className="text-green-400 font-bold">+10.5%</span>
                                        </p>
                                      </div>
                                      <div className="border-t border-white/10 pt-3">
                                        <p className="text-xs text-yellow-400 font-semibold mb-1">⚠️ Importante:</p>
                                        <p className="text-xs text-gray-400 leading-relaxed">
                                          EV positivo <span className="text-white">não garante ganhar esse jogo específico</span>. Significa que fazendo muitas apostas com EV+, você tende a ter <span className="text-green-400">lucro no longo prazo</span>.
                                        </p>
                                      </div>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
