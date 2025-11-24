import { Layout } from "@/components/layout";
import { Hero } from "@/components/hero";
import { LiveTicker } from "@/components/live-ticker";
import { BetCard } from "@/components/bet-card";
import { MOCK_SIGNALS } from "@/lib/mock-data";
import { Zap } from "lucide-react";

export default function Dashboard() {
  return (
    <Layout>
      <LiveTicker signals={MOCK_SIGNALS} />
      <Hero />
      
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-display font-bold text-white">Sinais Recentes</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_SIGNALS.map((signal) => (
          <BetCard key={signal.id} signal={signal} />
        ))}
      </div>
    </Layout>
  );
}
