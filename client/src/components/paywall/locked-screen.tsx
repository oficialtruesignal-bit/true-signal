import { motion } from 'framer-motion';
import { LockKeyhole, Sparkles, Check } from 'lucide-react';

const CHECKOUT_URL = '/checkout';

export function LockedScreen() {
  const benefits = [
    'Acesso ilimitado a TODOS os sinais',
    'Dashboard analytics profissional completo',
    'Notificações em tempo real',
    'Comunidade VIP exclusiva',
    'Suporte prioritário 24/7',
    'Gestão automatizada de banca',
  ];
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-red-950/10 to-black" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[150px]" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-2xl w-full"
      >
        {/* Lock Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, type: 'spring' }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700 rounded-full blur-2xl opacity-50" />
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-2xl">
              <LockKeyhole className="w-16 h-16 text-white" />
            </div>
          </div>
        </motion.div>
        
        {/* Main message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
            Seu Período de Teste Acabou
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Você testou a precisão da nossa IA por 5 dias.
          </p>
          <p className="text-lg text-gray-400">
            Agora é hora de desbloquear todo o poder do <span className="text-[#33b864] font-bold">TRUE SIGNAL</span>.
          </p>
        </motion.div>
        
        {/* Pricing card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative group mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#33b864] to-[#2ea558] rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
          
          <div className="relative bg-gradient-to-br from-black via-[#0a0a0a] to-black border-2 border-[#33b864] rounded-3xl p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/40 rounded-full mb-4 animate-pulse">
                <Sparkles className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400 font-black uppercase tracking-wider">TRUE SIGNAL PRIME</span>
              </div>
              
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-xl text-gray-500 line-through">R$ 99,87</span>
                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded">-52%</span>
              </div>
              
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-5xl md:text-6xl font-black text-[#33b864] font-mono">R$ 47,90</span>
                <span className="text-gray-400 text-lg">/mês</span>
              </div>
              
              <p className="text-gray-400 text-sm">
                Investimento que se paga em 1 sinal certo
              </p>
            </div>
            
            <ul className="space-y-3 mb-8">
              {benefits.map((benefit, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-[#33b864]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#33b864]" />
                  </div>
                  <span className="text-gray-300">{benefit}</span>
                </motion.li>
              ))}
            </ul>
            
            <a
              href={CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full"
              data-testid="button-subscribe-premium"
            >
              <button className="w-full bg-[#33b864] hover:bg-[#2ea558] text-black font-black py-5 rounded-xl transition-all duration-300 hover:scale-105 shadow-xl shadow-[#33b864]/40 text-lg touch-manipulation">
                ASSINAR TRUE SIGNAL PRIME - R$ 47,90/MÊS
              </button>
            </a>
            
            <p className="text-center text-sm text-gray-500 mt-4">
              🔒 Pagamento 100% seguro • Cancele quando quiser
            </p>
          </div>
        </motion.div>
        
        {/* Footer note */}
        <p className="text-center text-sm text-gray-500">
          Tem dúvidas? Entre em contato com nosso suporte:{' '}
          <a href="mailto:support@apptruesignal.com" className="text-[#33b864] hover:underline">
            support@apptruesignal.com
          </a>
        </p>
      </motion.div>
    </div>
  );
}
