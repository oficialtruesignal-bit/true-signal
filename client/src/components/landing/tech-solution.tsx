import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Cpu, Zap, Target, CheckCircle2, Globe, Users, Smartphone, Play } from 'lucide-react';
import appDemoVideo from '@assets/generated_videos/app_bilhetes_copiar_bet365_demo.mp4';

export function TechSolution() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <section ref={ref} className="relative py-20 px-4 bg-gradient-to-b from-black via-[#0a0a0a] to-[#121212] overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(#33b864 1px, transparent 1px), linear-gradient(90deg, #33b864 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
            Como funciona na{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#33b864] to-[#2ea558]">
              prática
            </span>
          </h2>
          <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto">
            Simples: nós analisamos, você recebe pronto no celular
          </p>
        </motion.div>
        
        {/* Simple 3-step flow */}
        <div className="relative max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-[#33b864]/10 to-black border border-[#33b864]/30 rounded-2xl p-6 h-full">
                <div className="w-14 h-14 rounded-full bg-[#33b864]/20 flex items-center justify-center mb-4">
                  <Globe className="w-7 h-7 text-[#33b864]" />
                </div>
                <div className="text-[#33b864] font-bold text-sm mb-2">PASSO 1</div>
                <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
                  Monitoramos tudo
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Nossa tecnologia acompanha jogos do mundo inteiro, 24 horas por dia, buscando as melhores oportunidades.
                </p>
              </div>
              
              {/* Arrow (desktop only) */}
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <Zap className="w-6 h-6 text-[#33b864]/50" />
              </div>
            </motion.div>
            
            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-[#33b864]/10 to-black border border-[#33b864]/30 rounded-2xl p-6 h-full">
                <div className="w-14 h-14 rounded-full bg-[#33b864]/20 flex items-center justify-center mb-4">
                  <Users className="w-7 h-7 text-[#33b864]" />
                </div>
                <div className="text-[#33b864] font-bold text-sm mb-2">PASSO 2</div>
                <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
                  Especialistas validam
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Nossa equipe de 20 analistas profissionais revisa cada oportunidade antes de liberar. Só passa o que tem alta chance de acerto.
                </p>
              </div>
              
              {/* Arrow (desktop only) */}
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <Zap className="w-6 h-6 text-[#33b864]/50" />
              </div>
            </motion.div>
            
            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="bg-gradient-to-br from-[#33b864]/10 to-black border border-[#33b864]/30 rounded-2xl p-6 h-full">
                <div className="w-14 h-14 rounded-full bg-[#33b864]/20 flex items-center justify-center mb-4">
                  <Smartphone className="w-7 h-7 text-[#33b864]" />
                </div>
                <div className="text-[#33b864] font-bold text-sm mb-2">PASSO 3</div>
                <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
                  Você recebe pronto
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Chega uma notificação no seu celular com tudo mastigado. É só copiar e colar na sua casa de apostas favorita.
                </p>
              </div>
            </motion.div>
          </div>
          
          {/* Demo Video */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
                Veja como é <span className="text-[#33b864]">simples</span>
              </h3>
              <p className="text-sm text-gray-400">Basta clicar em "Copiar" e colar na sua casa de apostas</p>
            </div>
            
            <div className="flex justify-center px-4">
              <div className="relative w-[240px] md:w-[280px] shadow-2xl shadow-[#33b864]/20">
                <video
                  src={appDemoVideo}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto rounded-[16px]"
                />
              </div>
            </div>
          </motion.div>
          
          {/* Result card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-10"
          >
            <div className="bg-gradient-to-r from-[#33b864]/20 via-[#33b864]/10 to-[#33b864]/20 border border-[#33b864]/40 rounded-2xl p-6 md:p-8 text-center">
              <p className="text-gray-300 mb-2">Resultado:</p>
              <p className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                Você gasta <span className="text-[#33b864]">30 segundos</span> no que antes levava <span className="text-red-400 line-through">horas</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
