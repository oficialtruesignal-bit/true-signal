import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'wouter';
import { Zap, CheckCircle2 } from 'lucide-react';

export function FinalCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <section ref={ref} className="relative py-20 px-4 bg-gradient-to-b from-[#121212] via-black to-black overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#33b864]/15 rounded-full blur-[150px]" />
      
      <div className="relative z-10 max-w-3xl mx-auto text-center lg:max-w-4xl lg:px-8">
        {/* Main headline */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-2xl md:text-3xl lg:text-5xl font-black text-white mb-4 leading-tight"
          style={{ fontFamily: 'Sora, sans-serif' }}
        >
          CONFIE EM QUEM REALMENTE
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#33b864] to-[#2ea558]">
            FATURA NESSE MERCADO
          </span>
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
          className="text-gray-400 text-lg mb-8"
        >
          Sistema global com operadores em dezenas de países
        </motion.p>
        
        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.2, type: 'spring' }}
          className="mb-8"
        >
          <Link href="/auth?mode=register">
            <motion.button
              className="group relative px-10 py-5 bg-[#33b864] text-black font-black text-lg md:text-xl rounded-2xl overflow-hidden shadow-xl shadow-[#33b864]/40 hover:shadow-[#33b864]/70 transition-all duration-300 hover:scale-105"
              data-testid="button-final-cta"
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 10px 40px -10px rgba(51, 184, 100, 0.4)',
                  '0 10px 40px -10px rgba(51, 184, 100, 0.8)',
                  '0 10px 40px -10px rgba(51, 184, 100, 0.4)',
                ],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: 'easeInOut',
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#33b864] via-white/30 to-[#33b864]"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
              />
              <span className="relative z-10 flex items-center gap-3" style={{ fontFamily: 'Sora, sans-serif' }}>
                <Zap className="w-6 h-6" />
                FAZER TESTE GRÁTIS
              </span>
            </motion.button>
          </Link>
        </motion.div>
        
        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-gray-400"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#33b864]" />
            <span>5 dias grátis</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#33b864]" />
            <span>Garantia total</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#33b864]" />
            <span>Cancele quando quiser</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
