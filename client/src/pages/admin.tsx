import { Layout } from "@/components/layout";
import { SignalForm } from "@/components/signal-form";
import { tipsService } from "@/lib/tips-service";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Trophy, XCircle, Clock, ShieldAlert, Trash2, ScanLine } from "lucide-react";
import { Signal } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Admin() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Force console log to verify page is loading fresh code
  console.log('🔧 Admin Page Loaded - Version 2.0 - ODD Format Changed');

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
          {/* AI Scanner - Criar Sinal */}
          <div className="bg-card border border-primary/20 rounded-xl p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-primary" />
              Criar Novo Sinal
            </h3>
            <SignalForm 
              onAdd={(data) => {
                handleCreateTip(data);
              }} 
            />
          </div>
        </div>

        {/* Right Column: Active Signals Management */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-primary/20 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-primary/10 bg-primary/5 flex justify-between items-center">
              <h3 className="font-bold text-white">Sinais Disponíveis</h3>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">{signals.length} Total</span>
            </div>
            <div className="divide-y divide-white/5">
              {signals.map((signal) => (
                <div key={signal.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white/5 transition-colors gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white flex items-center gap-2">
                      {signal.homeTeam} vs {signal.awayTeam}
                      {signal.isLive && <span className="text-[10px] text-red-500 bg-red-500/10 px-1 rounded animate-pulse">LIVE</span>}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-primary border border-primary/20 px-1.5 rounded font-sora">{signal.league}</span>
                      <span className="text-xs text-white font-sora font-semibold">{signal.market} | ODD {signal.odd.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className={`w-8 h-8 ${signal.status === 'green' ? 'bg-green-500/20 border-green-500 text-green-500' : 'border-white/10 hover:border-green-500 hover:text-green-500'}`}
                      onClick={() => updateStatusMutation.mutate({ id: signal.id, status: 'green' })}
                      data-testid={`button-status-green-${signal.id}`}
                    >
                      <Trophy className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className={`w-8 h-8 ${signal.status === 'red' ? 'bg-red-500/20 border-red-500 text-red-500' : 'border-white/10 hover:border-red-500 hover:text-red-500'}`}
                      onClick={() => updateStatusMutation.mutate({ id: signal.id, status: 'red' })}
                      data-testid={`button-status-red-${signal.id}`}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className={`w-8 h-8 ${signal.status === 'pending' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 'border-white/10 hover:border-yellow-500 hover:text-yellow-500'}`}
                      onClick={() => updateStatusMutation.mutate({ id: signal.id, status: 'pending' })}
                      data-testid={`button-status-pending-${signal.id}`}
                    >
                      <Clock className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className="w-8 h-8 border-white/10 hover:border-red-500 hover:text-red-500 hover:bg-red-500/10"
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
