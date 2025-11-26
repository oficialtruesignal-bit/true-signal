import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'wouter';
import { Zap, Clock, TrendingUp } from 'lucide-react';

export function FinalCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <section ref={ref} className="relative py-32 px-4 bg-gradient-to-b from-[#0a0a0a] via-black to-black overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[#33b864]/20 rounded-full blur-[200px]" />
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Urgency badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/30 rounded-full mb-8"
        >
          <Clock className="w-5 h-5 text-red-400 animate-pulse" />
          <span className="text-red-400 font-bold uppercase tracking-wider">Vagas Limitadas</span>
        </motion.div>
        
        {/* Main headline */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight"
          style={{ fontFamily: 'Sora, sans-serif' }}
        >
          A Janela de Oportunidade{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#33b864] to-[#2ea558]">
            Está Fechando
          </span>
        </motion.h2>
        
        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          Não garantimos este preço por muito tempo. Nossa infraestrutura suporta apenas{' '}
          <span className="text-white font-bold">200 operadores simultâneos</span>.
        </motion.p>
        
        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mb-12"
        >
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xl">
            <div className="text-3xl font-black text-[#33b864] mb-1">94.8%</div>
            <div className="text-xs text-gray-500">Assertividade</div>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xl">
            <div className="text-3xl font-black text-[#33b864] mb-1">1.420+</div>
            <div className="text-xs text-gray-500">Operadores</div>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xl">
            <div className="text-3xl font-black text-[#33b864] mb-1">R$ 497</div>
            <div className="text-xs text-gray-500">Investimento</div>
          </div>
        </motion.div>
        
        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.4, type: 'spring' }}
          className="mb-8"
        >
          <Link href="/auth">
            <button
              className="group relative px-12 md:px-20 py-6 md:py-8 bg-[#33b864] text-black font-black text-xl md:text-3xl rounded-2xl overflow-hidden shadow-2xl shadow-[#33b864]/60 hover:shadow-[#33b864]/90 transition-all duration-300 hover:scale-105 touch-manipulation"
              data-testid="button-final-cta"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#33b864] via-white/40 to-[#33b864]"
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: 'linear',
                }}
              />
              <span className="relative z-10 flex items-center gap-4" style={{ fontFamily: 'Sora, sans-serif' }}>
                <Zap className="w-8 h-8" />
                GARANTIR MEU ACESSO AGORA
              </span>
            </button>
          </Link>
        </motion.div>
        
        {/* Benefits reminder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#33b864]" />
            <span>Acesso Imediato</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#33b864]" />
            <span>Garantia 15 Dias</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#33b864]" />
            <span>Suporte 24/7</span>
          </div>
        </motion.div>
        
        {/* Scarcity bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-12 max-w-2xl mx-auto"
        >
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Capacidade do Servidor</span>
            <span className="text-[#33b864] font-bold">186/200 vagas ocupadas</span>
          </div>
          <div className="h-4 bg-black/50 rounded-full overflow-hidden border border-[#33b864]/20">
            <motion.div
              initial={{ width: 0 }}
              animate={isInView ? { width: '93%' } : {}}
              transition={{ duration: 2, ease: 'easeOut', delay: 1 }}
              className="h-full bg-gradient-to-r from-[#33b864] to-red-500 shadow-lg shadow-[#33b864]/50"
            />
          </div>
          <p className="text-xs text-red-400 mt-3 text-center font-semibold">
            ⚠️ Apenas 14 vagas restantes neste ciclo
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function CheckCircle2(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
