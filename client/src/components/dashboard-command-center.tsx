import { TrendingUp, Target, Zap } from "lucide-react";
import { Card } from "./ui/card";

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: string;
  positive?: boolean;
}

function KPICard({ icon, label, value, delta, positive = true }: KPICardProps) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <Card className="relative bg-black/40 backdrop-blur-md border-primary/20 p-6 rounded-2xl hover:border-primary/40 transition-all duration-300 overflow-hidden">
        {/* Animated glow border */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center backdrop-blur-sm">
              {icon}
            </div>
            <div className={`text-xs font-bold px-3 py-1 rounded-full ${
              positive 
                ? 'bg-primary/20 text-primary border border-primary/30' 
                : 'bg-red-500/20 text-red-500 border border-red-500/30'
            }`}>
              {delta}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-4xl font-display font-black text-white tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              {value}
            </div>
            <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
              {label}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function DashboardCommandCenter() {
  // Mock data - would be replaced with real API data
  const kpis = {
    greenRate: { value: "94.2%", delta: "+2.4%", positive: true },
    roi: { value: "+187%", delta: "+12%", positive: true },
    activeTips: { value: "8", delta: "LIVE", positive: true },
  };

  return (
    <div className="relative mb-8 overflow-hidden rounded-3xl">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background opacity-50" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-mesh-1" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-mesh-2" />
      </div>

      {/* Glassmorphic container */}
      <div className="relative bg-gradient-to-br from-black/30 to-black/10 backdrop-blur-sm border border-primary/10 rounded-3xl p-8 shadow-[0_8px_32px_rgba(51,184,100,0.1)]">
        {/* Header */}
        <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 backdrop-blur-sm mb-4">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#33b864]" />
            <span className="text-xs font-bold text-primary tracking-wide uppercase">Sistema Operacional</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-black text-white tracking-tight mb-2">
            Command Center
          </h2>
          <p className="text-muted-foreground">Monitoramento em tempo real das suas operações</p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <KPICard
            icon={<Target className="w-6 h-6 text-primary" />}
            label="Green Rate"
            value={kpis.greenRate.value}
            delta={kpis.greenRate.delta}
            positive={kpis.greenRate.positive}
          />
          <KPICard
            icon={<TrendingUp className="w-6 h-6 text-primary" />}
            label="ROI Total"
            value={kpis.roi.value}
            delta={kpis.roi.delta}
            positive={kpis.roi.positive}
          />
          <KPICard
            icon={<Zap className="w-6 h-6 text-primary" />}
            label="Tips Ativos"
            value={kpis.activeTips.value}
            delta={kpis.activeTips.delta}
            positive={kpis.activeTips.positive}
          />
        </div>
      </div>
    </div>
  );
}
