import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Cpu, Database, Zap, Target, CheckCircle2 } from 'lucide-react';

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
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
            O Motor por Trás dos{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#33b864] to-[#2ea558]">
              Greens
            </span>
          </h2>
          <p className="text-xl text-gray-400">
            Nossa Tecnologia Proprietária em Ação
          </p>
        </motion.div>
        
        {/* HUD-style diagram */}
        <div className="relative max-w-5xl mx-auto">
          {/* Input Stage */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center mb-8"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-[#33b864]/20 rounded-2xl blur-xl" />
              <div className="relative bg-gradient-to-br from-[#33b864]/10 to-black border border-[#33b864]/30 rounded-2xl p-6 backdrop-blur-xl">
                <div className="flex items-center gap-4 mb-4">
                  <Database className="w-8 h-8 text-[#33b864]" />
                  <div>
                    <h3 className="text-xl font-bold text-white">INPUT: Coleta Massiva</h3>
                    <p className="text-sm text-gray-400">1.400+ ligas escaneadas simultaneamente</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {['Premier', 'LaLiga', 'Serie A', 'Bundesliga', 'Ligue 1', 'Brasileirão'].map((league, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={isInView ? { scale: 1 } : {}}
                      transition={{ delay: i * 0.1 + 0.3 }}
                      className="px-2 py-1 bg-[#33b864]/20 border border-[#33b864]/40 rounded text-xs text-[#33b864] text-center font-semibold"
                    >
                      {league}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Arrow down */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5 }}
              className="my-6"
            >
              <Zap className="w-8 h-8 text-[#33b864] animate-pulse" />
            </motion.div>
          </motion.div>
          
          {/* Processing Stage (The Core) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-col items-center mb-8"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-[#33b864]/30 rounded-3xl blur-2xl animate-pulse" />
              
              <div className="relative bg-gradient-to-br from-[#33b864]/20 via-[#0a0a0a] to-black border-2 border-[#33b864]/50 rounded-3xl p-8 backdrop-blur-xl">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#33b864] to-[#2ea558] flex items-center justify-center mb-4 shadow-2xl shadow-[#33b864]/50">
                    <Cpu className="w-10 h-10 text-black" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">O NÚCLEO DE IA</h3>
                  <p className="text-sm text-gray-400">Processamento em tempo real</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { title: 'Machine Learning', desc: 'Padrões históricos' },
                    { title: 'Análise Estatística', desc: 'Probabilidade real' },
                    { title: 'Validação Humana', desc: '20 especialistas' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 1 + i * 0.15 }}
                      className="text-center p-4 bg-black/40 border border-[#33b864]/20 rounded-xl"
                    >
                      <div className="text-sm font-bold text-[#33b864] mb-1">{item.title}</div>
                      <div className="text-xs text-gray-500">{item.desc}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Arrow down */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 1.2 }}
              className="my-6"
            >
              <Zap className="w-8 h-8 text-[#33b864] animate-pulse" />
            </motion.div>
          </motion.div>
          
          {/* Output Stage */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="flex flex-col items-center"
          >
            <div className="relative group w-full max-w-md">
              <div className="absolute inset-0 bg-[#33b864]/20 rounded-2xl blur-xl" />
              
              <div className="relative bg-gradient-to-br from-[#33b864]/10 to-black border border-[#33b864]/30 rounded-2xl p-6 backdrop-blur-xl">
                <div className="flex items-center gap-4 mb-4">
                  <Target className="w-8 h-8 text-[#33b864]" />
                  <div>
                    <h3 className="text-xl font-bold text-white">OUTPUT: Bilhete Pronto</h3>
                    <p className="text-sm text-gray-400">Entregue direto no seu app</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[#33b864]/5 border border-[#33b864]/20 rounded-xl">
                    <span className="text-sm text-gray-300">Manchester City vs Arsenal</span>
                    <CheckCircle2 className="w-5 h-5 text-[#33b864]" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#33b864]/5 border border-[#33b864]/20 rounded-xl">
                    <span className="text-sm text-gray-300">Over 2.5 Gols</span>
                    <span className="text-sm text-[#33b864] font-bold">@1.85</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#33b864]/20 to-[#33b864]/10 border border-[#33b864]/40 rounded-xl">
                    <span className="text-sm font-semibold text-white">Assertividade</span>
                    <span className="text-2xl font-black text-[#33b864]">94.2%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
