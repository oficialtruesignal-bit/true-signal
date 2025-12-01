import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Shield, CheckCircle2, Sparkles } from 'lucide-react';

export function GuaranteeSeal() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  const benefits = [
    '5 dias de acesso gratuito',
    'Todas as funcionalidades liberadas',
    'Sem cartão de crédito',
    'Cancele quando quiser',
  ];
  
  return (
    <section ref={ref} className="relative py-20 px-4 bg-gradient-to-b from-[#121212] via-black to-[#0a0a0a]">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-[#33b864]/20 rounded-full blur-3xl opacity-60" />
          
          <div className="relative bg-gradient-to-br from-[#33b864]/10 via-black to-[#33b864]/5 border-2 border-[#33b864]/30 rounded-3xl p-12 backdrop-blur-xl">
            {/* Shield Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={isInView ? { scale: 1, rotate: 0 } : {}}
              transition={{ duration: 1, type: 'spring' }}
              className="flex justify-center mb-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-[#33b864] rounded-full blur-2xl opacity-50" />
                <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-[#33b864] to-[#2ea558] flex items-center justify-center shadow-2xl">
                  <Sparkles className="w-14 h-14 text-black" />
                </div>
              </div>
            </motion.div>
            
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl md:text-3xl font-black text-white mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
                Teste{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#33b864] to-[#4ade80]">
                  Grátis por 5 Dias
                </span>
              </h2>
              <p className="text-xl text-gray-300">
                Experimente a plataforma completa sem pagar nada
              </p>
            </motion.div>
            
            {/* Benefits List */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-3 p-4 bg-white/5 border border-[#33b864]/20 rounded-xl"
                >
                  <div className="w-6 h-6 rounded-full bg-[#33b864]/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-[#33b864]" />
                  </div>
                  <span className="text-gray-200 font-medium">{benefit}</span>
                </motion.div>
              ))}
            </div>
            
            {/* Bottom statement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.9 }}
              className="text-center p-6 bg-gradient-to-r from-[#33b864]/10 to-[#33b864]/5 border border-[#33b864]/30 rounded-2xl"
            >
              <p className="text-lg text-gray-300 leading-relaxed">
                Durante os <span className="text-white font-bold">5 dias de teste</span>, você terá acesso completo a todos os sinais e funcionalidades.
                Se gostar, assine o plano <span className="text-[#33b864] font-bold">True Signal Prime</span> por apenas R$ 47,90/mês.
              </p>
              <p className="text-sm text-gray-400 mt-4">
                Sem compromisso. Cancele quando quiser.
              </p>
            </motion.div>
            
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 1.1, type: 'spring' }}
              className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-gradient-to-br from-[#33b864] to-[#2ea558] flex items-center justify-center shadow-2xl border-4 border-black transform rotate-12"
            >
              <div className="text-center">
                <div className="text-xl font-black text-black">GRÁTIS</div>
                <div className="text-xs text-black font-bold">5 DIAS</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
