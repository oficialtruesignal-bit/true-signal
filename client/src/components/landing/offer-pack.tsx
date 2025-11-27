import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'wouter';
import { Zap, Shield, CheckCircle2, Sparkles } from 'lucide-react';

export function OfferPack() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <section ref={ref} className="relative py-20 px-4 bg-gradient-to-b from-[#0a0a0a] via-black to-[#121212] overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#33b864]/10 rounded-full blur-[200px]" />
      
      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Glow ring */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#33b864]/30 to-[#33b864]/30 rounded-3xl blur-xl" />
          
          <div className="relative bg-gradient-to-br from-[#33b864]/10 via-black to-[#33b864]/5 border-2 border-[#33b864]/40 rounded-3xl p-8 md:p-12 backdrop-blur-xl">
            {/* Top badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-2 px-4 py-2 bg-[#33b864] text-black font-bold text-sm rounded-full shadow-lg shadow-[#33b864]/50">
                <Sparkles className="w-4 h-4" />
                OFERTA ESPECIAL
              </div>
            </div>
            
            <div className="text-center pt-4">
              {/* Plan name */}
              <h3 className="text-2xl md:text-3xl font-black text-white mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
                Plano Ocean Prime
              </h3>
              
              {/* Price */}
              <div className="mb-8">
                <div className="text-gray-500 line-through text-lg mb-2">De R$ 2.847/mês</div>
                <div className="flex items-end justify-center gap-2">
                  <span className="text-5xl md:text-7xl font-black text-[#33b864]" style={{ fontFamily: 'Sora, sans-serif' }}>
                    R$ 99,87
                  </span>
                  <span className="text-gray-400 text-xl pb-3">/mês</span>
                </div>
              </div>
              
              {/* CTA Button - Pulsing */}
              <Link href="/auth">
                <motion.button
                  animate={{ 
                    boxShadow: [
                      '0 0 20px rgba(51, 184, 100, 0.4)',
                      '0 0 40px rgba(51, 184, 100, 0.8)',
                      '0 0 20px rgba(51, 184, 100, 0.4)',
                    ]
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-full md:w-auto px-12 py-5 bg-[#33b864] text-black font-black text-xl rounded-2xl hover:bg-[#2ea558] transition-colors flex items-center justify-center gap-3"
                  data-testid="button-offer-cta"
                >
                  <Zap className="w-6 h-6" />
                  QUERO ACESSO IMEDIATO
                </motion.button>
              </Link>
              
              <p className="text-sm text-gray-400 mt-4">
                💡 <span className="text-white font-medium">Menos que 1 green paga o mês inteiro</span>
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Cancele quando quiser. Sem multas.
              </p>
            </div>
          </div>
        </motion.div>
        
        {/* Guarantee Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 bg-gradient-to-br from-white/5 to-black/50 border border-[#33b864]/20 rounded-2xl p-6 md:p-8"
        >
          <div className="flex items-start gap-4">
            {/* Shield icon */}
            <div className="w-16 h-16 flex-shrink-0 rounded-2xl bg-gradient-to-br from-[#33b864]/20 to-[#33b864]/5 border border-[#33b864]/30 flex items-center justify-center">
              <Shield className="w-8 h-8 text-[#33b864]" />
            </div>
            
            <div className="flex-1">
              <h4 className="text-xl font-black text-white mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
                O risco é 100% nosso
              </h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Você tem <span className="text-[#33b864] font-bold">15 DIAS</span> de teste. Se não lucrar, se não gostar do design ou se simplesmente mudar de ideia, nós devolvemos cada centavo. <span className="text-white font-semibold">Sem perguntas. Sem burocracia.</span>
              </p>
            </div>
          </div>
          
          {/* Guarantee badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {['15 dias de teste', 'Reembolso total', 'Sem perguntas', 'Risco zero'].map((text, i) => (
              <div key={i} className="flex items-center gap-2 p-3 bg-black/30 border border-[#33b864]/10 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-[#33b864] flex-shrink-0" />
                <span className="text-xs text-gray-300">{text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
