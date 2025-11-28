import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Zap, Globe, Users, Smartphone, Copy, CheckCircle2 } from 'lucide-react';
import { ProfitSimulator } from './profit-simulator';
import { TimeComparison } from './time-comparison';

export function TechSolution() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <section ref={ref} className="relative py-16 px-4 bg-gradient-to-b from-black via-[#0a0a0a] to-[#121212] overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(#33b864 1px, transparent 1px), linear-gradient(90deg, #33b864 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto lg:px-8">
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
          
          {/* Demo Video + Simulator Grid (Desktop: side by side) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12"
          >
            <div className="text-center mb-6 lg:mb-10">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
                Veja como é <span className="text-[#33b864]">simples</span>
              </h3>
              <p className="text-sm text-gray-400">Basta clicar em "Copiar" e colar na sua casa de apostas</p>
            </div>
            
            {/* Desktop: 2 columns, Mobile: stacked */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center lg:gap-12">
              {/* Left: Realistic App Mockup */}
              <div className="flex justify-center w-full lg:w-auto">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="relative"
                >
                  {/* Phone glow effect */}
                  <div className="absolute inset-0 bg-[#33b864]/30 rounded-[50px] blur-3xl scale-110" />
                  
                  {/* Realistic iPhone Frame */}
                  <div className="relative w-[280px] md:w-[320px] aspect-[9/19] bg-black rounded-[50px] p-3 shadow-2xl border-4 border-gray-800">
                    {/* Screen */}
                    <div className="w-full h-full bg-[#0a0a0a] rounded-[42px] overflow-hidden border border-[#33b864]/20">
                      {/* Notch */}
                      <div className="h-7 bg-black rounded-b-2xl mx-auto w-28 relative z-10" />
                      
                      {/* App Header */}
                      <div className="px-4 py-3 bg-[#0a0a0a] border-b border-white/5">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-gray-500">Bem-vindo de volta!</span>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-[#33b864]/20 flex items-center justify-center">
                            <span className="text-[8px] text-[#33b864]">K</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Page Title */}
                      <div className="px-4 py-3">
                        <h4 className="text-[14px] font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>Bilhetes</h4>
                        <p className="text-[9px] text-[#33b864]">Prontos</p>
                      </div>
                      
                      {/* Bet Cards */}
                      <div className="px-3 space-y-2">
                        {/* Bet Card 1 */}
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="bg-[#121212] rounded-xl border border-[#33b864]/20 overflow-hidden"
                        >
                          <div className="px-3 py-2 border-b border-white/5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <img src="https://media.api-sports.io/football/teams/2282.png" className="w-5 h-5" alt="" />
                                <span className="text-[9px] text-white font-medium">FC Juarez vs Toluca</span>
                                <img src="https://media.api-sports.io/football/teams/2283.png" className="w-5 h-5" alt="" />
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[8px] text-gray-500">FC Juarez vs Toluca (fim)</span>
                              <span className="text-[8px] text-gray-500">#3336864</span>
                            </div>
                          </div>
                          <div className="px-3 py-2 flex items-center justify-between">
                            <span className="text-[9px] text-gray-400">ODD</span>
                            <span className="text-[12px] text-[#33b864] font-bold">2.48</span>
                          </div>
                        </motion.div>
                        
                        {/* Bet Card 2 */}
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 }}
                          className="bg-[#121212] rounded-xl border border-[#33b864]/20 overflow-hidden"
                        >
                          <div className="px-3 py-2 border-b border-white/5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <img src="https://media.api-sports.io/football/teams/2282.png" className="w-5 h-5" alt="" />
                                <span className="text-[9px] text-white font-medium">FC Juarez</span>
                              </div>
                              <span className="text-[8px] text-gray-500">13202.8v0</span>
                              <span className="text-[10px] text-[#33b864] font-bold">2.086</span>
                            </div>
                          </div>
                          <div className="px-3 py-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[9px] text-white">AMBAS MARCAM</span>
                              <span className="text-[9px] text-gray-500">8</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-[8px] text-gray-500">Abuje Clomete</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-[9px] text-gray-400">ODD</span>
                                  <span className="text-[11px] text-[#33b864] font-bold">2.48</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-[8px] text-gray-500">Bxnja</span>
                                <div className="text-[10px] text-gray-400">2.354</div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                        
                        {/* Copy Button with Hand Animation */}
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1 }}
                          className="relative"
                        >
                          <motion.button
                            animate={{ scale: [1, 0.95, 1] }}
                            transition={{ repeat: Infinity, duration: 2, delay: 1.5 }}
                            className="w-full bg-[#33b864] text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-[11px]"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            COPIAR BILHETE
                          </motion.button>
                          
                          {/* Animated Hand Pointer */}
                          <motion.div
                            initial={{ opacity: 0, x: 50, y: 30 }}
                            animate={{ 
                              opacity: [0, 1, 1, 0],
                              x: [50, 0, 0, 0],
                              y: [30, 0, -5, 0]
                            }}
                            transition={{ 
                              repeat: Infinity, 
                              duration: 3,
                              times: [0, 0.3, 0.5, 1],
                              delay: 1
                            }}
                            className="absolute -bottom-4 -right-4 text-4xl"
                          >
                            👆
                          </motion.div>
                        </motion.div>
                        
                        {/* Success feedback */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ 
                            opacity: [0, 0, 1, 1, 0],
                            scale: [0.8, 0.8, 1, 1, 0.8]
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 3,
                            times: [0, 0.4, 0.5, 0.8, 1],
                            delay: 1
                          }}
                          className="flex items-center justify-center gap-1 py-2"
                        >
                          <CheckCircle2 className="w-3 h-3 text-[#33b864]" />
                          <span className="text-[9px] text-[#33b864]">Copiado! Cole na sua casa de apostas</span>
                        </motion.div>
                      </div>
                      
                      {/* Bottom Navigation */}
                      <div className="absolute bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/10 px-4 py-3">
                        <div className="flex items-center justify-around">
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-5 h-5 rounded bg-[#33b864]/20 flex items-center justify-center">
                              <span className="text-[8px] text-[#33b864]">📊</span>
                            </div>
                            <span className="text-[7px] text-[#33b864]">Painel</span>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-5 h-5 rounded bg-white/5 flex items-center justify-center">
                              <span className="text-[8px] text-white">🎫</span>
                            </div>
                            <span className="text-[7px] text-white">Bilhetes</span>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-5 h-5 rounded bg-white/5 flex items-center justify-center">
                              <span className="text-[8px] text-gray-500">⚽</span>
                            </div>
                            <span className="text-[7px] text-gray-500">Ao Vivo</span>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-5 h-5 rounded bg-white/5 flex items-center justify-center">
                              <span className="text-[8px] text-gray-500">📅</span>
                            </div>
                            <span className="text-[7px] text-gray-500">Pré-Jogo</span>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-5 h-5 rounded bg-white/5 flex items-center justify-center">
                              <span className="text-[8px] text-gray-500">⚙️</span>
                            </div>
                            <span className="text-[7px] text-gray-500">Config</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Right: Profit Simulator (Desktop only, hidden on mobile - shown separately below) */}
              <div className="hidden lg:block lg:w-[480px]">
                <ProfitSimulator />
              </div>
            </div>
          </motion.div>
          
          {/* Time Comparison - Before vs After */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <TimeComparison />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
