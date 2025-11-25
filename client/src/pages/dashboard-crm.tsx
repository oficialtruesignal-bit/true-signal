import { Layout } from "@/components/layout";
import { useCRMDashboardData } from "@/hooks/use-crm-dashboard-data";
import { CompactLiveHud } from "@/components/compact-live-hud";
import { AIScanner } from "@/components/ai-scanner";
import { StatCard } from "@/components/dashboard/stat-card";
import { Percent, Flame, Users, Ticket } from "lucide-react";
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

      {/* Main Dashboard - Full Width */}
      <div className="flex flex-col gap-6 h-[calc(100vh-400px)]">
          {/* Performance HUD - 4 Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard 
              label="ROI" 
              value={`+${stats.roi.toFixed(1)}%`}
              trendColor="text-primary"
              icon={<Percent className="w-4 h-4 text-primary" strokeWidth={1.5} />} 
            />

            <StatCard 
              label="Sequência" 
              value={`${stats.currentStreak.wins}V / ${stats.currentStreak.losses}D`}
              icon={<Flame className="w-4 h-4 text-orange-500" strokeWidth={1.5} />} 
            />

            <StatCard 
              label="USUARIOS ONLINE" 
              value={usersOnline.toString()}
              icon={
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" strokeWidth={1.5} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                </div>
              } 
            />

            <StatCard 
              label="Sinais Enviados" 
              value={totalSignals.toString()}
              icon={<Ticket className="w-4 h-4 text-primary" strokeWidth={1.5} />} 
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
