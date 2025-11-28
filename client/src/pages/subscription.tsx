import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useAccessControl } from "@/hooks/use-access-control";
import { Crown, Calendar, Clock, RefreshCw, CheckCircle, AlertTriangle, XCircle, Sparkles, Shield, Zap, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { differenceInDays, format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";

const CHECKOUT_URL = '/checkout';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { isPremium, isTrial, isExpired, daysRemaining } = useAccessControl();
  const [isRenewing, setIsRenewing] = useState(false);

  const subscriptionEndsAt = user?.subscriptionEndsAt ? new Date(user.subscriptionEndsAt) : null;
  const subscriptionActivatedAt = user?.subscriptionActivatedAt ? new Date(user.subscriptionActivatedAt) : null;

  const handleRenew = () => {
    window.location.href = CHECKOUT_URL;
  };

  const getStatusInfo = () => {
    if (isPremium) {
      return {
        icon: <CheckCircle className="w-6 h-6" />,
        title: "Vantage Prime Ativo",
        subtitle: "Você tem acesso completo a todos os bilhetes",
        color: "text-[#33b864]",
        bgColor: "bg-[#33b864]/10",
        borderColor: "border-[#33b864]/30",
      };
    }
    if (isTrial) {
      return {
        icon: <Clock className="w-6 h-6" />,
        title: "Período de Teste",
        subtitle: `Restam ${daysRemaining} dias de teste gratuito`,
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
        borderColor: "border-yellow-500/30",
      };
    }
    return {
      icon: <XCircle className="w-6 h-6" />,
      title: "Assinatura Expirada",
      subtitle: "Renove agora para continuar acessando",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
    };
  };

  const statusInfo = getStatusInfo();

  // Calculate days until expiration for Prime users
  const daysUntilExpiration = subscriptionEndsAt 
    ? Math.max(0, differenceInDays(subscriptionEndsAt, new Date()))
    : 0;

  const isAboutToExpire = isPremium && daysUntilExpiration <= 7;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#33b864]/10 rounded-lg border border-[#33b864]/20">
            <Crown className="w-6 h-6 text-[#33b864]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
              Minha Assinatura
            </h1>
            <p className="text-gray-400 text-sm">Gerencie seu plano Vantage Prime</p>
          </div>
        </div>

        {/* Status Card */}
        <div className={`${statusInfo.bgColor} border ${statusInfo.borderColor} rounded-2xl p-6`} data-testid="subscription-status-card">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${statusInfo.bgColor} ${statusInfo.color}`}>
              {statusInfo.icon}
            </div>
            <div className="flex-1">
              <h2 className={`text-xl font-bold ${statusInfo.color}`} style={{ fontFamily: 'Sora, sans-serif' }}>
                {statusInfo.title}
              </h2>
              <p className="text-gray-400 mt-1">{statusInfo.subtitle}</p>
            </div>
          </div>

          {/* Prime Details */}
          {isPremium && subscriptionEndsAt && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Ativado em</p>
                  <p className="text-white font-medium">
                    {subscriptionActivatedAt 
                      ? format(subscriptionActivatedAt, "dd 'de' MMMM, yyyy", { locale: ptBR })
                      : "—"
                    }
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Válido até</p>
                  <p className="text-white font-medium">
                    {format(subscriptionEndsAt, "dd 'de' MMMM, yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>

              {/* Days Counter */}
              <div className="mt-6 bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#33b864]" />
                    <span className="text-gray-300">Dias restantes</span>
                  </div>
                  <div className={`text-2xl font-bold ${isAboutToExpire ? 'text-yellow-500' : 'text-[#33b864]'}`}>
                    {daysUntilExpiration}
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${isAboutToExpire ? 'bg-yellow-500' : 'bg-[#33b864]'}`}
                    style={{ width: `${Math.min(100, (daysUntilExpiration / 30) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Renewal Warning */}
              {isAboutToExpire && (
                <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-500 font-medium">Sua assinatura está acabando!</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Renove agora para não perder acesso aos bilhetes premium.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {!isPremium && (
            <Button
              onClick={handleRenew}
              className="w-full h-14 bg-[#33b864] hover:bg-[#289a54] text-black font-bold text-lg rounded-xl gap-2 shadow-lg shadow-[#33b864]/30"
              data-testid="button-subscribe"
            >
              <Sparkles className="w-5 h-5" />
              {isExpired ? "Renovar Assinatura" : "Assinar Vantage Prime"}
            </Button>
          )}

          {isPremium && isAboutToExpire && (
            <Button
              onClick={handleRenew}
              className="w-full h-14 bg-[#33b864] hover:bg-[#289a54] text-black font-bold text-lg rounded-xl gap-2 shadow-lg shadow-[#33b864]/30"
              data-testid="button-renew"
            >
              <RefreshCw className="w-5 h-5" />
              Renovar Agora
            </Button>
          )}
        </div>

        {/* Benefits */}
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
            Benefícios do Vantage Prime
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#33b864]/10 rounded-lg shrink-0">
                <CheckCircle className="w-4 h-4 text-[#33b864]" />
              </div>
              <div>
                <p className="text-white font-medium">Acesso Ilimitado</p>
                <p className="text-gray-500 text-sm">Todos os bilhetes e sinais premium disponíveis</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#33b864]/10 rounded-lg shrink-0">
                <Shield className="w-4 h-4 text-[#33b864]" />
              </div>
              <div>
                <p className="text-white font-medium">Análises Validadas</p>
                <p className="text-gray-500 text-sm">Por especialistas + IA de alta performance</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#33b864]/10 rounded-lg shrink-0">
                <Zap className="w-4 h-4 text-[#33b864]" />
              </div>
              <div>
                <p className="text-white font-medium">Notificações Instantâneas</p>
                <p className="text-gray-500 text-sm">Receba novos sinais em tempo real</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-gradient-to-br from-[#33b864]/10 to-[#33b864]/5 border border-[#33b864]/30 rounded-2xl p-6 text-center">
          <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Investimento mensal</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-gray-400 text-lg">R$</span>
            <span className="text-4xl font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>99,87</span>
            <span className="text-gray-400">/mês</span>
          </div>
          <p className="text-[#33b864] text-sm mt-2">30 dias de acesso completo</p>
        </div>

        {/* Support */}
        <div className="text-center pt-4">
          <p className="text-gray-500 text-sm">
            Dúvidas sobre sua assinatura?{" "}
            <a 
              href="https://wa.me/5511999999999" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#33b864] hover:underline inline-flex items-center gap-1"
            >
              Fale com o suporte
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
}
