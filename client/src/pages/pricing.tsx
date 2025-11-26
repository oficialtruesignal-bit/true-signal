import { motion } from 'framer-motion';
import { Check, X, Sparkles, Clock, Zap, Crown, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useAccessControl } from '@/hooks/use-access-control';

const CHECKOUT_URL = '/checkout';

export default function PricingPage() {
  const { user } = useAuth();
  const { daysRemaining, isTrial, isPremium } = useAccessControl();
  const [, setLocation] = useLocation();

  const trialFeatures = [
    { text: 'Acesso por 15 dias', included: true },
    { text: 'Apenas 1 sinal por dia', included: true, highlight: true },
    { text: 'Recursos limitados', included: true },
  ];

  const primeFeatures = [
    { text: 'Acesso ilimitado', included: true },
    { text: 'Sinais ilimitados no dia', included: true, highlight: true },
    { text: 'Alertas push em tempo real', included: true },
    { text: 'IA sempre atualizada', included: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0a0a0a] to-[#121212] text-white">
      {/* Header */}
      <div className="border-b border-[#33b864]/20 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={user ? "/app" : "/"}>
            <button className="flex items-center gap-2 text-[#33b864] hover:text-[#2ea558] transition-colors">
              <ArrowRight className="w-5 h-5 rotate-180" />
              <span className="font-bold">Voltar</span>
            </button>
          </Link>
          <h1 className="text-2xl font-black text-[#33b864]" style={{ fontFamily: 'Sora, sans-serif' }}>
            Ocean Signal
          </h1>
          <div className="w-20" />
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#33b864]/10 border border-[#33b864]/30 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-[#33b864]" />
            <span className="text-sm font-bold text-[#33b864]">Planos e Preços</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
            Escolha seu{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#33b864] to-[#2ea558]">
              plano ideal
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Comece com 15 dias gratuitos e descubra o poder da inteligência artificial aplicada às apostas esportivas
          </p>

          {isTrial && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600/10 border border-yellow-600/30 rounded-lg">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-yellow-500">
                Você tem <strong>{daysRemaining} dias</strong> restantes no período gratuito
              </span>
            </div>
          )}

          {isPremium && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#33b864]/10 border border-[#33b864]/30 rounded-lg">
              <Crown className="w-4 h-4 text-[#33b864]" />
              <span className="text-sm text-[#33b864] font-bold">
                Você já é Ocean Prime! 🎉
              </span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Trial Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-600/20 to-gray-800/20 rounded-3xl blur-xl opacity-50" />
            
            <div className="relative bg-gradient-to-br from-white/5 to-black/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gray-600/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                    Período Gratuito
                  </h3>
                  <p className="text-sm text-gray-400">Experimente sem compromisso</p>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white">R$ 0</span>
                  <span className="text-gray-400">/15 dias</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Sem cartão de crédito necessário</p>
              </div>

              <ul className="space-y-3 mb-8">
                {trialFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${feature.highlight ? 'text-yellow-500' : 'text-gray-400'}`} />
                    ) : (
                      <X className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={`text-sm ${feature.included ? (feature.highlight ? 'text-yellow-500 font-semibold' : 'text-gray-300') : 'text-gray-600 line-through'}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {!user && (
                <Link href="/auth">
                  <button className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl transition-all">
                    Começar Grátis
                  </button>
                </Link>
              )}

              {user && isTrial && (
                <div className="py-4 bg-[#33b864]/5 border border-[#33b864]/20 text-[#33b864] font-bold rounded-xl text-center">
                  Plano Atual
                </div>
              )}
            </div>
          </motion.div>

          {/* Ocean Prime Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative group"
          >
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
              <div className="px-6 py-2 bg-gradient-to-r from-[#33b864] to-[#2ea558] rounded-full text-black font-black text-sm shadow-xl shadow-[#33b864]/50">
                MAIS POPULAR
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-br from-[#33b864]/30 to-[#2ea558]/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-90 transition-opacity" />
            
            <div className="relative bg-gradient-to-br from-[#33b864]/10 via-[#0a0a0a] to-black border-2 border-[#33b864]/30 rounded-3xl p-8 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#33b864]/30 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-[#33b864]" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                    Ocean Prime
                  </h3>
                  <p className="text-sm text-[#33b864]">Acesso completo ilimitado</p>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-[#33b864]">R$ 99,87</span>
                  <span className="text-gray-400">/mês</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Cancele quando quiser, sem multas</p>
              </div>

              <ul className="space-y-3 mb-8">
                {primeFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${feature.highlight ? 'text-[#33b864]' : 'text-[#33b864]/70'}`} />
                    <span className={`text-sm ${feature.highlight ? 'text-[#33b864] font-semibold' : 'text-gray-300'}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {isPremium ? (
                <div className="py-4 bg-[#33b864]/10 border border-[#33b864]/30 text-[#33b864] font-bold rounded-xl text-center">
                  ✓ Plano Ativo
                </div>
              ) : (
                <a
                  href={CHECKOUT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <button className="w-full py-4 bg-[#33b864] hover:bg-[#2ea558] text-black font-black rounded-xl transition-all shadow-xl shadow-[#33b864]/50 hover:shadow-[#33b864]/70 flex items-center justify-center gap-2 group">
                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Assinar Ocean Prime
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </a>
              )}

              <p className="text-xs text-center text-gray-500 mt-4">
                Garantia de reembolso de 15 dias
              </p>
            </div>
          </motion.div>

        </div>

        {/* FAQ / Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 max-w-3xl mx-auto text-center"
        >
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-4">💡 Perguntas Frequentes</h3>
            <div className="space-y-4 text-left">
              <div>
                <p className="text-sm font-semibold text-[#33b864] mb-1">O que acontece após o período gratuito?</p>
                <p className="text-sm text-gray-400">
                  Após 15 dias, seu acesso será bloqueado. Você pode assinar o Ocean Prime a qualquer momento para continuar.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#33b864] mb-1">Posso cancelar a qualquer momento?</p>
                <p className="text-sm text-gray-400">
                  Sim! Não há período mínimo de contrato. Cancele quando quiser, sem multas ou taxas adicionais.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#33b864] mb-1">Como funciona a garantia de reembolso?</p>
                <p className="text-sm text-gray-400">
                  Se não ficar satisfeito com a plataforma nos primeiros 15 dias, devolvemos 100% do seu investimento.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
