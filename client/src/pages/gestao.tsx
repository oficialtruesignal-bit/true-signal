import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Wallet, RefreshCw, Shield, TrendingUp, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BankrollSetupModal } from "@/components/bankroll-setup-modal";
import { toast } from "sonner";

export default function GestaoPage() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [bankrollData, setBankrollData] = useState<{
    bankrollInitial: number | null;
    riskProfile: string | null;
    unitValue: number | null;
  }>({
    bankrollInitial: null,
    riskProfile: null,
    unitValue: null,
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
      return;
    }

    if (user) {
      fetchBankrollData();
    }
  }, [user, isLoading]);

  const fetchBankrollData = async () => {
    try {
      const response = await fetch(`/api/profile/${user?.id}/bankroll`);
      if (response.ok) {
        const data = await response.json();
        setBankrollData({
          bankrollInitial: data.bankrollInitial ? parseFloat(data.bankrollInitial) : null,
          riskProfile: data.riskProfile,
          unitValue: data.unitValue ? parseFloat(data.unitValue) : null,
        });

        if (!data.unitValue) {
          setShowSetupModal(true);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar dados de bankroll:", error);
    }
  };

  const handleSetupComplete = async (data: {
    bankrollInitial: number;
    riskProfile: string;
    unitValue: number;
  }) => {
    try {
      const response = await fetch(`/api/profile/${user?.id}/bankroll`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setBankrollData(data);
        setShowSetupModal(false);
        toast.success("Estratégia configurada com sucesso!");
      } else {
        toast.error("Erro ao salvar configuração");
      }
    } catch (error) {
      console.error("Erro ao salvar bankroll:", error);
      toast.error("Erro ao salvar configuração");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getRiskProfileInfo = (profile: string | null) => {
    switch (profile) {
      case "conservador":
        return { name: "Conservador", divisor: 100, color: "#3b82f6" };
      case "moderado":
        return { name: "Moderado", divisor: 50, color: "#33b864" };
      case "agressivo":
        return { name: "Agressivo", divisor: 30, color: "#f97316" };
      default:
        return { name: "-", divisor: 50, color: "#33b864" };
    }
  };

  const profileInfo = getRiskProfileInfo(bankrollData.riskProfile);

  const pieData = [
    { name: "Capital Livre", value: 85, color: "#33b864" },
    { name: "Em Jogo", value: 15, color: "#f97316" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#33b864] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#0a0a0a] pb-24">
      <BankrollSetupModal
        isOpen={showSetupModal}
        onComplete={handleSetupComplete}
      />

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Sora, sans-serif" }}>
            Gestão de Banca
          </h1>
          <p className="text-gray-400 text-sm">
            Controle inteligente do seu capital
          </p>
        </motion.div>

        {bankrollData.unitValue ? (
          <>
            {/* Main Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#33b864]/10 to-black border border-[#33b864]/30 rounded-2xl p-6 mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#33b864]/20 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-[#33b864]" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Sua Unidade Padrão</p>
                    <p className="text-3xl font-bold text-[#33b864]">
                      {formatCurrency(bankrollData.unitValue)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Capital Inicial</p>
                  <p className="text-white font-bold">
                    {bankrollData.bankrollInitial
                      ? formatCurrency(bankrollData.bankrollInitial)
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Perfil de Risco</p>
                  <p className="text-white font-bold capitalize">
                    {profileInfo.name}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Chart Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6"
            >
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#33b864]" />
                Distribuição do Capital
              </h3>
              
              <div className="flex items-center gap-6">
                <div className="w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={50}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-gray-400 text-sm">{item.name}</span>
                      </div>
                      <span className="text-white font-bold">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Golden Rule Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 mb-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-yellow-400 font-bold mb-2">A Regra de Ouro</h3>
                  <p className="text-yellow-400/80 text-sm leading-relaxed">
                    "Sua banca é sua empresa. Sua unidade é seu estoque. 
                    Nunca fuja da gestão sugerida nos bilhetes. 
                    A matemática vence no longo prazo."
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Reconfigure Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                onClick={() => setShowSetupModal(true)}
                variant="outline"
                className="w-full h-14 border-white/20 text-white hover:bg-white/5"
                data-testid="button-reconfigure-bankroll"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Recalcular Banca / Novo Aporte
              </Button>
            </motion.div>
          </>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 rounded-full bg-[#33b864]/20 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-[#33b864]" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Configure sua Gestão de Banca
            </h2>
            <p className="text-gray-400 mb-8 max-w-sm mx-auto">
              Defina seu capital e perfil de risco para receber recomendações 
              personalizadas de entrada em cada bilhete.
            </p>
            <Button
              onClick={() => setShowSetupModal(true)}
              className="h-14 px-8 bg-[#33b864] hover:bg-[#289a54] text-black font-bold"
              data-testid="button-setup-bankroll"
            >
              Configurar Agora
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
