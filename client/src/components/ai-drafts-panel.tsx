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
  Link,
  ArrowUpDown,
  ArrowDown,
  ArrowUp
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
type SortOrder = 'desc' | 'asc' | 'none';
type SortField = 'probability' | 'confidence' | 'odd';

export function AiDraftsPanel() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isScanningPatterns, setIsScanningPatterns] = useState(false);
  const [patternOpportunities, setPatternOpportunities] = useState<any[]>([]);
  const [expandedDraft, setExpandedDraft] = useState<string | null>(null);
  const [selectedDrafts, setSelectedDrafts] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<MarketFilter>('all');
  const [editedCombos, setEditedCombos] = useState<Record<string, BetLeg[]>>({});
  const [betLinks, setBetLinks] = useState<Record<string, string>>({});
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [sortField, setSortField] = useState<SortField>('probability');

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

  const scanPatternOpportunities = async () => {
    if (!user?.email || !user?.id) {
      toast.error("Você precisa estar logado como admin");
      return;
    }

    setIsScanningPatterns(true);
    try {
      const response = await axios.get('/api/ai/pattern-scanner', {
        params: { date: selectedDate }
      });

      if (response.data.success) {
        setPatternOpportunities(response.data.opportunities || []);
        if (response.data.opportunities?.length > 0) {
          toast.success(`${response.data.opportunities.length} oportunidades encontradas com ≥80% probabilidade!`);
        } else {
          toast.info("Nenhuma oportunidade com ≥80% encontrada para esta data.");
        }
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || "Erro ao escanear padrões";
      if (errorMsg.includes('limit') || errorMsg.includes('request')) {
        toast.error("Limite de API atingido. Tente novamente amanhã.");
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setIsScanningPatterns(false);
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
    let filtered = drafts;
    
    if (activeFilter !== 'all') {
      filtered = drafts.filter(draft => {
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
    }
    
    // Aplicar ordenação
    if (sortOrder !== 'none') {
      filtered = [...filtered].sort((a, b) => {
        let valueA: number;
        let valueB: number;
        
        switch (sortField) {
          case 'probability':
            valueA = parseFloat(a.probability) || 0;
            valueB = parseFloat(b.probability) || 0;
            break;
          case 'confidence':
            valueA = parseFloat(a.confidence) || 0;
            valueB = parseFloat(b.confidence) || 0;
            break;
          case 'odd':
            valueA = parseFloat(a.suggestedOdd) || parseFloat(a.totalOdd || '0') || 0;
            valueB = parseFloat(b.suggestedOdd) || parseFloat(b.totalOdd || '0') || 0;
            break;
          default:
            valueA = parseFloat(a.probability) || 0;
            valueB = parseFloat(b.probability) || 0;
        }
        
        return sortOrder === 'desc' ? valueB - valueA : valueA - valueB;
      });
    }
    
    return filtered;
  };

  const toggleSortOrder = () => {
    if (sortOrder === 'desc') {
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      setSortOrder('none');
    } else {
      setSortOrder('desc');
    }
  };

  const getSortIcon = () => {
    if (sortOrder === 'desc') return <ArrowDown className="w-4 h-4" />;
    if (sortOrder === 'asc') return <ArrowUp className="w-4 h-4" />;
    return <ArrowUpDown className="w-4 h-4" />;
  };

  const getSortLabel = () => {
    const fieldLabels: Record<SortField, string> = {
      probability: 'Probabilidade',
      confidence: 'Confiança',
      odd: 'Odd'
    };
    
    if (sortOrder === 'none') return `Ordenar por ${fieldLabels[sortField]}`;
    if (sortOrder === 'desc') return `${fieldLabels[sortField]} (Maior → Menor)`;
    return `${fieldLabels[sortField]} (Menor → Maior)`;
  };

  const filteredDrafts = filterDrafts(drafts);

  // Formatar data/hora no timezone brasileiro
  const formatMatchTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateFormatted = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      timeZone: 'America/Sao_Paulo'
    });
    const timeFormatted = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    });
    return `${dateFormatted} às ${timeFormatted}`;
  };

  // Formatar apenas a hora
  const formatMatchHour = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    });
  };

  // Formatar apenas a data
  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'America/Sao_Paulo'
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
      <div className="bg-gradient-to-r from-primary/10 via-green-500/5 to-blue-500/10 border-2 border-[#33b864]/40 rounded-2xl p-3 sm:p-4 shadow-lg shadow-[#33b864]/10">
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

      {/* Analysis Controls - Unified Compact Group */}
      <div className="bg-card border-2 border-[#33b864]/40 rounded-2xl p-4 shadow-lg shadow-[#33b864]/10">
        <div className="flex flex-col gap-3">
          {/* Date Picker Row */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-background border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:border-primary/50 focus:outline-none flex-1"
              data-testid="input-ai-date"
            />
          </div>
          
          {/* Action Buttons - Horizontal Group */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              size="sm"
              className="bg-gradient-to-r from-primary to-green-600 hover:from-primary/90 hover:to-green-600/90 text-black font-bold gap-1.5 flex-1 min-w-[140px]"
              data-testid="button-run-analysis"
            >
              {isAnalyzing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Brain className="w-3.5 h-3.5" />
              )}
              {isAnalyzing ? 'Analisando...' : 'Análise IA'}
            </Button>

            <Button
              onClick={scanPatternOpportunities}
              disabled={isScanningPatterns}
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold gap-1.5 flex-1 min-w-[140px]"
              data-testid="button-scan-patterns"
            >
              {isScanningPatterns ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Target className="w-3.5 h-3.5" />
              )}
              {isScanningPatterns ? 'Escaneando...' : 'Oportunidades'}
            </Button>

            {drafts.length > 0 && (
              <Button
                onClick={selectAllHighConfidence}
                size="sm"
                className="bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 text-black font-bold gap-1.5 flex-1 min-w-[140px]"
                data-testid="button-select-high-confidence"
              >
                <Zap className="w-3.5 h-3.5" />
                Alta Confiança
              </Button>
            )}
          </div>

          {/* Bulk Approve - Full Width When Visible */}
          {selectedDrafts.size > 0 && (
            <Button
              onClick={bulkApprove}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white font-bold gap-2 w-full"
              data-testid="button-bulk-approve"
            >
              <CheckCircle2 className="w-4 h-4" />
              Aprovar {selectedDrafts.size} Selecionados
            </Button>
          )}
        </div>
      </div>

      {/* Pattern Scanner Results */}
      {patternOpportunities.length > 0 && (
        <div className="bg-card border-2 border-blue-500/40 rounded-2xl overflow-hidden shadow-lg shadow-blue-500/10">
          <div className="p-4 border-b border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-transparent flex justify-between items-center">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              Oportunidades (Regra dos 10 Jogos)
            </h3>
            <span className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full font-semibold">
              {patternOpportunities.length} padrões ≥80%
            </span>
          </div>
          <div className="divide-y divide-blue-500/10">
            {patternOpportunities.slice(0, 10).map((opp, idx) => (
              <div key={idx} className="p-4 hover:bg-blue-500/5 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-1">
                    <img src={opp.homeTeamLogo} alt="" className="w-6 h-6" />
                    <span className="text-sm font-bold text-white">{opp.homeTeam}</span>
                  </div>
                  <span className="text-xs text-gray-500">vs</span>
                  <div className="flex items-center gap-1">
                    <img src={opp.awayTeamLogo} alt="" className="w-6 h-6" />
                    <span className="text-sm font-bold text-white">{opp.awayTeam}</span>
                  </div>
                  <span className="ml-auto text-xs text-gray-400">{opp.league}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-blue-400">{opp.pattern}</span>
                    <p className="text-xs text-gray-400 mt-1">{opp.patternDescription}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${opp.probability >= 85 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {opp.probability.toFixed(0)}%
                    </div>
                    <p className="text-xs text-gray-500">
                      {opp.occurrences}/{opp.totalGames} jogos
                    </p>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-gray-400 space-y-1">
                  {opp.rationale?.slice(0, 2).map((r: string, i: number) => (
                    <p key={i}>• {r}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-blue-500/10 bg-blue-500/5">
            <p className="text-xs text-blue-400/70 text-center">
              Dados baseados nos últimos 10 jogos de cada time. Threshold mínimo: 80%
            </p>
          </div>
        </div>
      )}

      {/* Drafts List */}
      <div className="bg-card border-2 border-[#33b864]/40 rounded-2xl overflow-hidden shadow-lg shadow-[#33b864]/10">
        <div className="p-4 border-b border-primary/10 bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex justify-between items-center mb-3">
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
          
          {/* Sorting Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400 mr-1">Ordenar:</span>
            
            {/* Sort Field Selector */}
            <div className="flex items-center bg-background/50 rounded-lg p-0.5 border border-white/10">
              <button
                onClick={() => setSortField('probability')}
                className={`text-xs px-2.5 py-1 rounded-md transition-all ${
                  sortField === 'probability' 
                    ? 'bg-primary text-black font-bold' 
                    : 'text-gray-400 hover:text-white'
                }`}
                data-testid="sort-by-probability"
              >
                Probabilidade
              </button>
              <button
                onClick={() => setSortField('confidence')}
                className={`text-xs px-2.5 py-1 rounded-md transition-all ${
                  sortField === 'confidence' 
                    ? 'bg-primary text-black font-bold' 
                    : 'text-gray-400 hover:text-white'
                }`}
                data-testid="sort-by-confidence"
              >
                Confiança
              </button>
              <button
                onClick={() => setSortField('odd')}
                className={`text-xs px-2.5 py-1 rounded-md transition-all ${
                  sortField === 'odd' 
                    ? 'bg-primary text-black font-bold' 
                    : 'text-gray-400 hover:text-white'
                }`}
                data-testid="sort-by-odd"
              >
                Odd
              </button>
            </div>
            
            {/* Sort Order Toggle */}
            <button
              onClick={toggleSortOrder}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                sortOrder !== 'none'
                  ? 'bg-primary/20 border-primary/50 text-primary font-semibold'
                  : 'bg-background/50 border-white/10 text-gray-400 hover:text-white'
              }`}
              data-testid="toggle-sort-order"
            >
              {getSortIcon()}
              <span className="hidden sm:inline">
                {sortOrder === 'desc' ? 'Maior → Menor' : sortOrder === 'asc' ? 'Menor → Maior' : 'Sem ordem'}
              </span>
              <span className="sm:hidden">
                {sortOrder === 'desc' ? '↓' : sortOrder === 'asc' ? '↑' : '⇅'}
              </span>
            </button>
            
            {/* Quick Reset */}
            {(sortOrder !== 'desc' || sortField !== 'probability') && (
              <button
                onClick={() => { setSortField('probability'); setSortOrder('desc'); }}
                className="text-xs text-gray-500 hover:text-primary transition-colors underline underline-offset-2"
                data-testid="reset-sort"
              >
                Resetar
              </button>
            )}
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

                  {/* Combo Legs List - REDESIGNED CLEAN LAYOUT */}
                  {isCombo && legs.length > 0 ? (
                    <div className="space-y-3">
                      {legs.map((leg, idx) => (
                        <div key={idx} className="bg-slate-800/60 rounded-xl p-4 border border-white/10 group">
                          {/* Line Number + Remove */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                                {idx + 1}
                              </span>
                              <span className="text-xs text-gray-500">{leg.league}</span>
                            </div>
                            <button
                              onClick={() => removeComboLeg(draft.id, idx, legs)}
                              className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/30 flex items-center justify-center transition-all"
                              title="Remover"
                              data-testid={`btn-remove-leg-${draft.id}-${idx}`}
                            >
                              <X className="w-4 h-4 text-red-400" />
                            </button>
                          </div>

                          {/* Teams Row - Full Width */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-2 flex-1">
                              {leg.homeTeamLogo && <img src={leg.homeTeamLogo} alt="" className="w-8 h-8" />}
                              <span className="font-bold text-white text-base">{leg.homeTeam}</span>
                            </div>
                            <span className="text-gray-500 text-sm">vs</span>
                            <div className="flex items-center gap-2 flex-1 justify-end">
                              <span className="font-bold text-white text-base">{leg.awayTeam}</span>
                              {leg.awayTeamLogo && <img src={leg.awayTeamLogo} alt="" className="w-8 h-8" />}
                            </div>
                          </div>

                          {/* Market + Outcome - Full Width Clear */}
                          <div className="bg-primary/10 rounded-lg p-3 mb-3">
                            <p className="text-primary font-bold text-base">{leg.market}</p>
                            {leg.outcome && <p className="text-white text-sm mt-1">{leg.outcome}</p>}
                          </div>

                          {/* Stats Row */}
                          <div className="flex items-center justify-between">
                            <div className={`px-4 py-2 rounded-lg ${
                              (leg.probability || 0) >= 85 ? 'bg-green-500/20 text-green-400' : 
                              (leg.probability || 0) >= 75 ? 'bg-yellow-500/20 text-yellow-400' : 
                              'bg-orange-500/20 text-orange-400'
                            }`}>
                              <span className="text-lg font-bold">{(leg.probability || 0).toFixed(0)}%</span>
                              <span className="text-xs ml-1 opacity-70">prob</span>
                            </div>
                            <div className="bg-white/10 rounded-lg px-4 py-2">
                              <span className="text-xl font-bold text-white">{leg.odd.toFixed(2)}</span>
                              <span className="text-xs ml-1 text-gray-400">odd</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Combo Summary - Bigger and Clearer */}
                      <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl p-4 border border-primary/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Probabilidade Combinada</p>
                            <p className={`text-2xl font-bold ${
                              parseFloat(draft.probability) >= 50 ? 'text-green-400' : 
                              parseFloat(draft.probability) >= 30 ? 'text-yellow-400' : 'text-orange-400'
                            }`}>
                              {parseFloat(draft.probability).toFixed(1)}%
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400 mb-1">Odd Total</p>
                            <p className="text-3xl font-bold text-primary">{displayOdd.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Single Bet - REDESIGNED CLEAN LAYOUT */
                    <div className="space-y-4">
                      {/* Date/Time Header - PROMINENT */}
                      <div className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span className="text-sm font-semibold text-white">{formatMatchDate(draft.matchTime)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="text-sm font-bold text-primary">{formatMatchHour(draft.matchTime)}</span>
                        </div>
                      </div>
                      
                      {/* Teams Row - Full Width Clear */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 flex-1">
                          {draft.homeTeamLogo && <img src={draft.homeTeamLogo} alt="" className="w-10 h-10" />}
                          <div>
                            <p className="font-bold text-white text-base">{draft.homeTeam}</p>
                            <p className="text-xs text-gray-500">{draft.league}</p>
                          </div>
                        </div>
                        <span className="text-gray-500 font-bold">vs</span>
                        <div className="flex items-center gap-2 flex-1 justify-end text-right">
                          <div>
                            <p className="font-bold text-white text-base">{draft.awayTeam}</p>
                          </div>
                          {draft.awayTeamLogo && <img src={draft.awayTeamLogo} alt="" className="w-10 h-10" />}
                        </div>
                      </div>

                      {/* Market + Outcome - Full Width Clear Box */}
                      <div className="bg-primary/10 rounded-xl p-4 border border-primary/30">
                        <p className="text-primary font-bold text-lg">{draft.market}</p>
                        {draft.predictedOutcome && <p className="text-white text-sm mt-1">{draft.predictedOutcome}</p>}
                      </div>

                      {/* Stats Row - Big and Clear */}
                      <div className="flex items-center justify-between gap-3">
                        <div className={`flex-1 rounded-xl p-3 text-center ${getConfidenceColor(confidence)}`}>
                          <p className="text-2xl font-bold">{confidence.toFixed(0)}%</p>
                          <p className="text-xs opacity-70">Confiança</p>
                        </div>
                        <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
                          <p className="text-2xl font-bold text-white">{displayOdd.toFixed(2)}</p>
                          <p className="text-xs text-gray-400">Odd</p>
                        </div>
                        <button
                          onClick={() => toggleDraftSelection(draft.id)}
                          className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all ${
                            isSelected 
                              ? 'bg-primary border-primary' 
                              : 'border-white/20 hover:border-primary/50'
                          }`}
                          data-testid={`checkbox-draft-${draft.id}`}
                        >
                          {isSelected && <Check className="w-6 h-6 text-black" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Bet Link Input + Actions - Clean Row */}
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                    {/* Bet Link */}
                    <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-2">
                      <Link className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <Input
                        placeholder="Cole o link Bet365 aqui (opcional)"
                        value={betLinks[draft.id] || ''}
                        onChange={(e) => setBetLinks(prev => ({ ...prev, [draft.id]: e.target.value }))}
                        className="h-10 text-sm bg-transparent border-0 focus-visible:ring-0 placeholder:text-gray-500"
                        data-testid={`input-bet-link-${draft.id}`}
                      />
                    </div>

                    {/* Action Buttons - Big and Clear */}
                    <div className="flex gap-3">
                      <Button
                        onClick={() => approveDraft(draft.id)}
                        className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-bold text-base gap-2"
                        data-testid={`button-approve-${draft.id}`}
                      >
                        <Check className="w-5 h-5" />
                        Aprovar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => rejectDraft(draft.id)}
                        className="flex-1 h-12 border-red-500/50 text-red-400 hover:bg-red-500/10 font-bold text-base gap-2"
                        data-testid={`button-reject-${draft.id}`}
                      >
                        <X className="w-5 h-5" />
                        Rejeitar
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
