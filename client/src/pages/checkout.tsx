import { Layout } from "@/components/layout";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { CreditCard, Check, Sparkles, Shield, Zap, TrendingUp, Clock, Gift } from "lucide-react";
import { useAccessControl } from "@/hooks/use-access-control";
import { toast } from "sonner";
import axios from "axios";

export default function CheckoutPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { daysRemaining, isPremium } = useAccessControl();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para assinar");
      return;
    }

    setIsLoading(true);
    try {
      // Create subscription via backend
      const response = await axios.post("/api/mercadopago/create-subscription", {
        userId: user.id,
        userEmail: user.email,
      });

      const { initPoint } = response.data;

      // Redirect user to Mercado Pago checkout
      if (initPoint) {
        window.location.href = initPoint;
      } else {
        toast.error("Erro ao criar checkout. Tente novamente.");
      }
    } catch (error: any) {
      console.error("Erro ao criar assinatura:", error);
      toast.error(error.response?.data?.error || "Erro ao processar assinatura");
    } finally {
      setIsLoading(false);
    }
  };

  if (isPremium) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="w-20 h-20 bg-[#33b864]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-[#33b864]" />
          </div>
          <h1 className="text-3xl font-sora font-bold text-white mb-4">
            Você já é Ocean Prime!
          </h1>
          <p className="text-gray-300 mb-8">
            Aproveite todos os benefícios da sua assinatura premium.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#33b864]/10 rounded-full border border-[#33b864]/20 mb-4">
            <Sparkles className="w-4 h-4 text-[#33b864]" />
            <span className="text-sm font-bold text-[#33b864]">UPGRADE PARA OCEAN PRIME</span>
          </div>
          <h1 className="text-4xl font-sora font-bold text-white mb-4">
            Desbloqueie todo o potencial
          </h1>
          <p className="text-xl text-gray-300">
            {daysRemaining > 0 
              ? `Restam ${daysRemaining} dias de teste. Assine agora e tenha acesso ilimitado!`
              : "Seu período de teste expirou. Assine para continuar acessando os sinais!"
            }
          </p>
        </div>

        {/* Pricing Card */}
        <div className="bg-gradient-to-br from-[#121212] to-[#0a0a0a] border-2 border-[#33b864] rounded-3xl p-8 shadow-2xl shadow-[#33b864]/20 relative overflow-hidden mb-8">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#33b864]/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          
          {/* Popular badge */}
          <div className="absolute top-6 right-6">
            <div className="px-3 py-1 bg-[#33b864] text-black text-xs font-bold rounded-full">
              MAIS POPULAR
            </div>
          </div>

          <div className="relative">
            {/* Plan name */}
            <h2 className="text-2xl font-sora font-bold text-white mb-2">Ocean Prime</h2>
            <p className="text-gray-400 mb-6">Assinatura mensal com acesso ilimitado</p>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-5xl font-bold text-white">R$ 99,87</span>
              <span className="text-gray-400">/mês</span>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#33b864]/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-[#33b864]" />
                </div>
                <span className="text-white">Acesso ilimitado a todos os sinais</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#33b864]/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-[#33b864]" />
                </div>
                <span className="text-white">Sinais ilimitados por dia</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#33b864]/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-[#33b864]" />
                </div>
                <span className="text-white">Notificações em tempo real</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#33b864]/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-[#33b864]" />
                </div>
                <span className="text-white">Análise de IA sempre atualizada</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#33b864]/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-[#33b864]" />
                </div>
                <span className="text-white">Suporte prioritário</span>
              </div>
              {daysRemaining > 0 && (
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <Gift className="w-5 h-5 text-orange-500" />
                  </div>
                  <span className="text-white">
                    <strong className="text-orange-500">Bônus:</strong> Seus {daysRemaining} dias de teste continuam válidos!
                  </span>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full py-4 bg-[#33b864] hover:bg-[#2da055] text-black font-bold text-lg rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-[#33b864]/30 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-subscribe-ocean-prime"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                  Processando...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Assinar Ocean Prime
                </>
              )}
            </button>

            {/* Payment info */}
            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Pagamento seguro via Mercado Pago</span>
              </div>
            </div>

            {/* Cancellation policy */}
            <p className="text-center text-xs text-gray-500 mt-4">
              Cancele a qualquer momento. Sem taxas de cancelamento.
            </p>
          </div>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-white/10 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-[#33b864]/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-[#33b864]" />
            </div>
            <h3 className="font-bold text-white mb-2">Pagamento Seguro</h3>
            <p className="text-sm text-gray-400">Processado pelo Mercado Pago com criptografia SSL</p>
          </div>
          <div className="bg-card border border-white/10 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-[#33b864]/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-[#33b864]" />
            </div>
            <h3 className="font-bold text-white mb-2">87% de Assertividade</h3>
            <p className="text-sm text-gray-400">Taxa comprovada de acerto dos nossos sinais</p>
          </div>
          <div className="bg-card border border-white/10 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-[#33b864]/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-[#33b864]" />
            </div>
            <h3 className="font-bold text-white mb-2">Cancele Quando Quiser</h3>
            <p className="text-sm text-gray-400">Sem compromisso de permanência</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
