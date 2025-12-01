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
  CheckCircle2
} from "lucide-react";

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
}

interface AiStats {
  pendingDrafts: number;
  highConfidence: number;
  markets: {
    over25: number;
    under25: number;
    btts: number;
    result: number;
  };
}

export function AiDraftsPanel() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedDraft, setExpandedDraft] = useState<string | null>(null);
  const [selectedDrafts, setSelectedDrafts] = useState<Set<string>>(new Set());

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
      });

      if (response.data.success) {
        toast.success("Previsão aprovada e publicada!");
        refetchDrafts();
        queryClient.invalidateQueries({ queryKey: ['tips'] });
        queryClient.invalidateQueries({ queryKey: ['ai-stats'] });
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
      .filter(d => parseFloat(d.confidence) >= 80)
      .map(d => d.id);
    setSelectedDrafts(new Set(highConfidenceIds));
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-400 bg-green-500/20';
    if (confidence >= 75) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-orange-400 bg-orange-500/20';
  };

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
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-primary" />
            <span className="text-xs text-gray-400">RASCUNHOS</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats?.pendingDrafts || 0}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-green-400" />
            <span className="text-xs text-gray-400">ALTA CONFIANÇA</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{stats?.highConfidence || 0}</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-gray-400">OVER 2.5</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">{stats?.markets?.over25 || 0}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-gray-400">BTTS</span>
          </div>
          <p className="text-2xl font-bold text-purple-400">{stats?.markets?.btts || 0}</p>
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
          <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-semibold">
            {drafts.length} Rascunhos
          </span>
        </div>

        {loadingDrafts ? (
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : drafts.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Brain className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Nenhuma previsão pendente</p>
            <p className="text-sm mt-2">Execute a análise para gerar previsões</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {drafts.map((draft) => {
              const confidence = parseFloat(draft.confidence);
              const isExpanded = expandedDraft === draft.id;
              const isSelected = selectedDrafts.has(draft.id);
              const rationale = draft.analysisRationale ? JSON.parse(draft.analysisRationale) : [];

              return (
                <div 
                  key={draft.id}
                  className={`p-4 transition-all ${isSelected ? 'bg-primary/10' : 'hover:bg-white/5'}`}
                >
                  {/* Main Row */}
                  <div className="flex items-center gap-4">
                    {/* Selection Checkbox */}
                    <button
                      onClick={() => toggleDraftSelection(draft.id)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-primary border-primary' 
                          : 'border-white/20 hover:border-primary/50'
                      }`}
                      data-testid={`checkbox-draft-${draft.id}`}
                    >
                      {isSelected && <Check className="w-4 h-4 text-black" />}
                    </button>

                    {/* Team Logos */}
                    <div className="flex items-center gap-1">
                      {draft.homeTeamLogo && (
                        <img src={draft.homeTeamLogo} alt="" className="w-8 h-8" />
                      )}
                      <span className="text-gray-500 text-xs">vs</span>
                      {draft.awayTeamLogo && (
                        <img src={draft.awayTeamLogo} alt="" className="w-8 h-8" />
                      )}
                    </div>

                    {/* Match Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate">
                        {draft.homeTeam} vs {draft.awayTeam}
                      </p>
                      <p className="text-xs text-gray-400">{draft.league}</p>
                    </div>

                    {/* Market */}
                    <div className="text-center">
                      <p className="text-sm font-semibold text-primary">{draft.market}</p>
                      <p className="text-xs text-gray-400">{draft.predictedOutcome}</p>
                    </div>

                    {/* Confidence */}
                    <div className={`px-3 py-1.5 rounded-lg ${getConfidenceColor(confidence)}`}>
                      <p className="text-sm font-bold">{confidence.toFixed(0)}%</p>
                    </div>

                    {/* Suggested Odd */}
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">{parseFloat(draft.suggestedOdd).toFixed(2)}</p>
                      <p className="text-[10px] text-gray-500">ODD</p>
                    </div>

                    {/* Match Time */}
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {formatMatchTime(draft.matchTime)}
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
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setExpandedDraft(isExpanded ? null : draft.id)}
                        className="text-gray-400 hover:text-white"
                        data-testid={`button-expand-${draft.id}`}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Scores */}
                        <div className="bg-background/50 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            Scores da Análise
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-400">Forma</span>
                              <span className="text-sm text-white">{draft.formScore ? `${parseFloat(draft.formScore).toFixed(0)}%` : '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-400">Tendência de Gols</span>
                              <span className="text-sm text-white">{draft.goalTrendScore ? `${parseFloat(draft.goalTrendScore).toFixed(0)}%` : '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-400">H2H</span>
                              <span className="text-sm text-white">{draft.h2hScore ? `${parseFloat(draft.h2hScore).toFixed(0)}%` : '-'}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-white/10">
                              <span className="text-sm text-gray-400">Probabilidade</span>
                              <span className="text-sm font-bold text-primary">{parseFloat(draft.probability).toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Rationale */}
                        <div className="md:col-span-2 bg-background/50 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                            <Brain className="w-4 h-4" />
                            Análise da IA
                          </h4>
                          <ul className="space-y-1.5">
                            {rationale.map((reason: string, index: number) => (
                              <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Expected Value */}
                      {draft.expectedValue && (
                        <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                          <p className="text-sm">
                            <span className="text-gray-400">Valor Esperado (EV): </span>
                            <span className={`font-bold ${parseFloat(draft.expectedValue) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {parseFloat(draft.expectedValue) > 0 ? '+' : ''}{parseFloat(draft.expectedValue).toFixed(1)}%
                            </span>
                          </p>
                        </div>
                      )}
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
