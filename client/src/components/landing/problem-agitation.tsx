import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { TrendingDown, AlertTriangle, Heart, Brain, Target, Zap, Database, LineChart } from 'lucide-react';

export function ProblemAgitation() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  const oldWay = [
    { icon: AlertTriangle, text: 'Bancas quebradas em sequências de reds' },
    { icon: Heart, text: 'Decisões baseadas em emoção e "feeling"' },
    { icon: TrendingDown, text: 'Análises manuais que levam horas' },
    { icon: Brain, text: 'Grupos de Telegram vendendo ilusão' },
  ];
  
  const newWay = [
    { icon: Database, text: 'Big Data processando milhões de dados' },
    { icon: Zap, text: 'Decisões frias baseadas em matemática' },
    { icon: LineChart, text: 'Oportunidades entregues em segundos' },
    { icon: Target, text: 'IA validada por 20 analistas profissionais' },
  ];
  
  return (
    <section ref={ref} className="relative py-20 px-4 bg-gradient-to-b from-[#121212] via-[#0a0a0a] to-black">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-3xl lg:text-4xl font-black text-white mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
            De Qual Lado Você Está?
          </h2>
          <p className="text-xl text-gray-400">
            A diferença entre quebrar a banca e multiplicá-la
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Old Way (Red/Gray) */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-gray-900/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
            
            <div className="relative bg-gradient-to-br from-red-950/30 via-gray-900/30 to-black border border-red-900/20 rounded-3xl p-8 backdrop-blur-xl h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-lg md:text-2xl font-bold text-red-400" style={{ fontFamily: 'Sora, sans-serif' }}>
                  Você Ainda Opera Assim?
                </h3>
              </div>
              
              <p className="text-gray-400 mb-8">
                O jeito antigo que quebra 98% dos apostadores
              </p>
              
              <div className="space-y-4">
                {oldWay.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: i * 0.1 + 0.3 }}
                    className="flex items-start gap-3 p-4 bg-red-950/20 border border-red-900/20 rounded-xl"
                  >
                    <item.icon className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300">{item.text}</span>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-8 p-4 bg-red-950/30 border border-red-900/30 rounded-xl">
                <div className="text-sm text-red-400 font-semibold mb-1">Resultado Médio:</div>
                <div className="text-3xl font-black text-red-400 font-mono">-R$ 2.847/mês</div>
              </div>
            </div>
          </motion.div>
          
          {/* Right: New Way (Green/Neon) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#33b864]/30 to-[#2ea558]/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-90 transition-opacity" />
            
            <div className="relative bg-gradient-to-br from-[#33b864]/10 via-[#0a0a0a] to-black border-2 border-[#33b864]/30 rounded-3xl p-8 backdrop-blur-xl h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#33b864]/30 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-[#33b864]" />
                </div>
                <h3 className="text-lg md:text-2xl font-bold text-[#33b864]" style={{ fontFamily: 'Sora, sans-serif' }}>
                  A Nova Era das Operações
                </h3>
              </div>
              
              <p className="text-gray-400 mb-8">
                Como os 1% operam com análise profissional
              </p>
              
              <div className="space-y-4">
                {newWay.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: i * 0.1 + 0.3 }}
                    className="flex items-start gap-3 p-4 bg-[#33b864]/5 border border-[#33b864]/20 rounded-xl hover:border-[#33b864]/40 transition-colors"
                  >
                    <item.icon className="w-5 h-5 text-[#33b864] flex-shrink-0 mt-1" />
                    <span className="text-gray-300">{item.text}</span>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-8 p-4 bg-[#33b864]/10 border border-[#33b864]/30 rounded-xl shadow-lg shadow-[#33b864]/20">
                <div className="text-sm text-[#33b864] font-semibold mb-1">Resultado Médio:</div>
                <div className="text-3xl font-black text-[#33b864] font-mono">+R$ 4.638/mês</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
