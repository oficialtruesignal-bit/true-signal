import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { TrendingDown, XCircle, CheckCircle, Shield } from 'lucide-react';
import { Logo } from '@/components/logo';

export function ProblemAgitation() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  const painPoints = [
    { 
      title: 'A Ilusão do Bingo', 
      text: 'Você queima dinheiro em múltiplas impossíveis ("Bingos") vendidas por gurus que apagam os Reds e só mostram os Greens. Você é a liquidez deles.' 
    },
    { 
      title: 'O Custo do Tempo', 
      text: 'Horas do seu dia jogadas no lixo analisando gráficos, achando que encontrou um padrão, só para ver o gol sair do outro lado aos 90min.' 
    },
    { 
      title: 'O Descontrole', 
      text: 'Tentando recuperar o prejuízo na emoção. A cada aposta impulsiva, você cava um buraco mais fundo na sua banca.' 
    },
    { 
      title: 'O Resultado', 
      text: 'Ansiedade, frustração e a sensação de que "quase" ganhou. Mas o saldo continua zero.' 
    },
  ];
  
  const solutionPoints = [
    { 
      title: 'Probabilidade Real', 
      text: 'Sem achismos. Operamos apenas onde a matemática diz que a chance de Green é superior a 87%.' 
    },
    { 
      title: 'Zero Esforço', 
      text: 'Nós gastamos as horas analisando. Você gasta 30 segundos copiando. Seu tempo volta a ser seu.' 
    },
    { 
      title: 'Gestão Profissional', 
      text: 'Não buscamos o milagre de ficar rico em um dia. Buscamos a consistência de fechar o mês positivo, mês após mês.' 
    },
    { 
      title: 'O Resultado', 
      text: 'Dormir tranquilo sabendo que sua operação está nas mãos de 20 especialistas e uma IA de ponta.' 
    },
  ];
  
  return (
    <section ref={ref} className="relative py-20 px-4 bg-gradient-to-b from-[#121212] via-[#0a0a0a] to-black overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Left: The Pain (Red Side) */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative group"
          >
            {/* Noise texture overlay */}
            <div className="absolute inset-0 opacity-20 rounded-3xl" style={{ 
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
            }} />
            
            <div className="absolute inset-0 bg-gradient-to-b from-red-900/20 via-[#1a0505] to-transparent rounded-3xl" />
            
            <div className="relative bg-gradient-to-br from-red-950/40 via-[#0a0505] to-black border border-red-900/30 rounded-3xl p-6 md:p-8 backdrop-blur-xl h-full">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-900/40 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-red-400" style={{ fontFamily: 'Sora, sans-serif' }}>
                    O Caminho Padrão
                  </h3>
                  <p className="text-xs md:text-sm text-red-400/60">(98% das Pessoas)</p>
                </div>
              </div>
              
              {/* Headline */}
              <p className="text-base md:text-lg text-red-300 font-semibold mb-6 border-l-2 border-red-500/50 pl-4" style={{ fontFamily: 'Sora, sans-serif' }}>
                "Você financia a casa e os gurus."
              </p>
              
              {/* Pain Points */}
              <div className="space-y-4">
                {painPoints.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: i * 0.1 + 0.3 }}
                    className="flex items-start gap-3"
                  >
                    <XCircle className="w-5 h-5 text-red-500/70 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-red-400 font-semibold text-sm">{item.title}:</span>
                      <p className="text-gray-400 text-sm leading-relaxed">{item.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
          
          {/* Right: The Solution (Green Side) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-[#33b864]/20 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />
            
            <div className="relative bg-gradient-to-br from-[#33b864]/10 via-[#0a0a0a] to-black border-2 border-[#33b864]/40 rounded-3xl p-6 md:p-8 backdrop-blur-xl h-full shadow-lg shadow-[#33b864]/10">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#33b864]/30 flex items-center justify-center">
                  <Shield className="w-5 h-5 md:w-6 md:h-6 text-[#33b864]" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-[#33b864]" style={{ fontFamily: 'Sora, sans-serif' }}>
                    A Inteligência Ocean Signal
                  </h3>
                  <p className="text-xs md:text-sm text-[#33b864]/60">(O 1% que Lucra)</p>
                </div>
              </div>
              
              {/* Headline */}
              <p className="text-base md:text-lg text-[#33b864] font-semibold mb-6 border-l-2 border-[#33b864]/50 pl-4" style={{ fontFamily: 'Sora, sans-serif' }}>
                "Frieza Matemática e Execução."
              </p>
              
              {/* Solution Points */}
              <div className="space-y-4">
                {solutionPoints.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: i * 0.1 + 0.3 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-[#33b864] flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[#33b864] font-semibold text-sm">{item.title}:</span>
                      <p className="text-gray-300 text-sm leading-relaxed">{item.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
