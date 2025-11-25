import { Layout } from "@/components/layout";
import { useCRMDashboardData } from "@/hooks/use-crm-dashboard-data";
import { CompactLiveHud } from "@/components/compact-live-hud";
import { AIScanner } from "@/components/ai-scanner";
import { TrendingUp, Target, Percent, Flame, Activity, Users, Ticket } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { tipsService } from "@/lib/tips-service";

export default function DashboardCRM() {
  const stats = useCRMDashboardData();
  const [usersOnline, setUsersOnline] = useState(620);
  
  // Busca sinais reais do banco de dados
  const { data: tips = [] } = useQuery({
    queryKey: ['tips'],
    queryFn: tipsService.getAll,
    refetchInterval: 30000, // Atualiza a cada 30s
  });
  
  // Começa em 124 e adiciona os sinais reais criados pelo admin
  const BASE_SIGNALS = 124;
  const totalSignals = BASE_SIGNALS + tips.length;

  useEffect(() => {
    const interval = setInterval(() => {
      const variation = Math.floor(Math.random() * 21) - 10;
      setUsersOnline(prev => Math.max(312, Math.min(902, prev + variation)));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
          Central de Operações
        </h1>
        <p className="text-sm text-muted-foreground">Gestão de Performance em Unidades</p>
      </div>

      {/* Compact Live HUD - Split View (Círculo + Cards) */}
      <CompactLiveHud />

      {/* AI Scanner - Full Width */}
      <div className="flex-1">
        <AIScanner />
      </div>
    </Layout>
  );
}
