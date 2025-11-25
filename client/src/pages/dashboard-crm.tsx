import { Layout } from "@/components/layout";
import { useCRMDashboardData } from "@/hooks/use-crm-dashboard-data";
import { CompactLiveHud } from "@/components/compact-live-hud";
import { AIScanner } from "@/components/ai-scanner";
import { StatCard } from "@/components/dashboard/stat-card";
import { Scale, Flame, Activity, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { tipsService } from "@/lib/tips-service";

export default function DashboardCRM() {
  const stats = useCRMDashboardData();
  const [investors, setInvestors] = useState(624);
  
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
      const variation = Math.floor(Math.random() * 11) - 5;
      setInvestors(prev => Math.max(600, Math.min(650, prev + variation)));
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

      {/* Main Dashboard - Full Width */}
      <div className="flex flex-col gap-6 h-[calc(100vh-400px)]">
          {/* Performance HUD - 4 Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard 
              label="ODD MÉDIA" 
              value="@1.92"
              trendColor="text-orange-500"
              icon={<Scale className="w-4 h-4 text-orange-500" strokeWidth={1.5} />} 
            />

            <StatCard 
              label="SEQUÊNCIA ATUAL" 
              value="5V - 0D"
              icon={<Flame className="w-4 h-4 text-orange-500" strokeWidth={1.5} />} 
            />

            <StatCard 
              label="SINAIS (MÊS)" 
              value={totalSignals.toString()}
              icon={<Activity className="w-4 h-4 text-primary" strokeWidth={1.5} />} 
            />

            <StatCard 
              label="INVESTIDORES" 
              value={investors.toString()}
              trendColor="text-primary"
              icon={<Users className="w-4 h-4 text-primary" strokeWidth={1.5} />} 
            />
          </div>

          {/* AI Scanner - Full Width */}
          <div className="flex-1">
            <AIScanner />
          </div>
        </div>
    </Layout>
  );
}
