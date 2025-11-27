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
      
      <div className="relative z-10 max-w-3xl mx-auto lg:max-w-4xl lg:px-8">
        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Glow ring */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#33b864]/30 to-[#33b864]/30 rounded-3xl blur-xl" />
          
          <div className="relative bg-gradient-to-br from-[#33b864]/10 via-black to-[#33b864]/5 border-2 border-[#33b864]/40 rounded-3xl p-8 md:p-12 lg:p-16 backdrop-blur-xl">
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
              <div className="flex justify-center">
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
              </div>
              
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
          className="mt-12 text-center"
        >
          {/* Shield icon centered */}
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#33b864]/20 to-[#33b864]/5 border border-[#33b864]/30 flex items-center justify-center mb-6">
            <Shield className="w-8 h-8 text-[#33b864]" />
          </div>
          
          <h4 className="text-2xl font-black text-white mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
            O risco é 100% nosso
          </h4>
          
          <p className="text-gray-400 text-base leading-relaxed max-w-lg mx-auto mb-8">
            Você tem <span className="text-[#33b864] font-bold">15 DIAS</span> de teste. Se não lucrar, se não gostar ou mudar de ideia, devolvemos cada centavo. <span className="text-white font-semibold">Sem perguntas. Sem burocracia.</span>
          </p>
          
          {/* Guarantee badges - 2x2 grid with more spacing */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {['15 dias de teste', 'Reembolso total', 'Sem perguntas', 'Risco zero'].map((text, i) => (
              <div key={i} className="flex items-center justify-center gap-2 py-3">
                <CheckCircle2 className="w-5 h-5 text-[#33b864]" />
                <span className="text-sm text-gray-300">{text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
