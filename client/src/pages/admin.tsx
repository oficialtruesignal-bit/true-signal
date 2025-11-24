import { Layout } from "@/components/layout";
import { SignalForm } from "@/components/signal-form";
import { MOCK_SIGNALS, Signal } from "@/lib/mock-data";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trophy, XCircle, Clock } from "lucide-react";

export default function Admin() {
  const [signals, setSignals] = useState<Signal[]>(MOCK_SIGNALS);

  const handleAddSignal = (newSignal: Signal) => {
    setSignals([newSignal, ...signals]);
  };

  const updateStatus = (id: string, status: Signal["status"]) => {
    setSignals(signals.map(s => s.id === id ? { ...s, status } : s));
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-white mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">Create and manage betting signals.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <SignalForm onAdd={handleAddSignal} />
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card border border-white/5 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-white/5">
              <h3 className="font-bold text-white">Active Signals</h3>
            </div>
            <div className="divide-y divide-white/5">
              {signals.map((signal) => (
                <div key={signal.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">
                      {signal.homeTeam} vs {signal.awayTeam}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {signal.market} @{signal.odd}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className={`w-8 h-8 ${signal.status === 'green' ? 'bg-green-900/50 border-green-500 text-green-500' : 'border-white/10'}`}
                      onClick={() => updateStatus(signal.id, 'green')}
                    >
                      <Trophy className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className={`w-8 h-8 ${signal.status === 'red' ? 'bg-red-900/50 border-red-500 text-red-500' : 'border-white/10'}`}
                      onClick={() => updateStatus(signal.id, 'red')}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className={`w-8 h-8 ${signal.status === 'pending' ? 'bg-yellow-900/50 border-yellow-500 text-yellow-500' : 'border-white/10'}`}
                      onClick={() => updateStatus(signal.id, 'pending')}
                    >
                      <Clock className="w-4 h-4" />
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
