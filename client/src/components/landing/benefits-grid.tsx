import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Cpu, Shield, Users } from 'lucide-react';

export function BenefitsGrid() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <section ref={ref} className="relative py-20 lg:py-12 px-4 bg-gradient-to-b from-[#121212] via-black to-[#0a0a0a]">
      <div className="max-w-6xl mx-auto lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
            O Arsenal{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#33b864] to-[#2ea558]">
              Completo
            </span>
          </h2>
          <p className="text-sm md:text-base text-gray-400">
            Tudo que você precisa em um único lugar
          </p>
        </motion.div>
        
        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          {/* Box 1 - O Cérebro (Grande - 2x2) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="col-span-2 row-span-2 relative group"
          >
            <div className="h-full bg-gradient-to-br from-[#33b864]/20 via-[#0a0a0a] to-black border border-[#33b864]/30 rounded-3xl p-6 md:p-8 flex flex-col justify-between min-h-[280px]">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-[#33b864]/5 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#33b864] to-[#2ea558] flex items-center justify-center mb-4 shadow-lg shadow-[#33b864]/30">
                  <Cpu className="w-7 h-7 text-black" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
                  Scanner 24/7
                </h3>
              </div>
              
              <p className="relative text-gray-300 text-sm md:text-base leading-relaxed">
                Monitoramos <span className="text-[#33b864] font-bold">1.400 ligas</span> enquanto você dorme. 
                Algoritmos analisam cada partida em tempo real.
              </p>
              
              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#33b864]/20 to-transparent rounded-bl-full rounded-tr-3xl" />
            </div>
          </motion.div>
          
          {/* Box 2 - A Proteção (Média - 2x1) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="col-span-2 relative group"
          >
            <div className="h-full bg-gradient-to-br from-white/5 via-black/50 to-black border border-white/10 rounded-3xl p-5 md:p-6 hover:border-[#33b864]/30 transition-all min-h-[130px]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
                    Gestão de Banca
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    O sistema diz quanto apostar para proteger seu capital.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Box 3 - A Elite (Média - 2x1) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="col-span-2 relative group"
          >
            <div className="h-full bg-gradient-to-br from-white/5 via-black/50 to-black border border-white/10 rounded-3xl p-5 md:p-6 hover:border-[#33b864]/30 transition-all min-h-[130px]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
                    Suporte VIP
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Atendimento prioritário 24/7 para tirar suas dúvidas.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
          
          </div>
      </div>
    </section>
  );
}
