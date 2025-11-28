import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { TrendingDown, XCircle, Cpu, ShieldCheck, Smartphone, ArrowRight, ArrowDown } from 'lucide-react';

export function ProblemAgitation() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  const painPoints = [
    { 
      title: 'Exposição à Variância Negativa', 
      text: 'Operar múltiplas alongadas sem validação estatística não é investimento, é loteria. Você assume um risco desproporcional buscando retornos que a matemática do mercado não sustenta a longo prazo.' 
    },
    { 
      title: 'Ineficiência Operacional', 
      text: 'Você está competindo manualmente contra supercomputadores. Passar horas analisando dados dispersos gera fadiga mental e erros de julgamento. O tempo gasto na análise não se paga no retorno.' 
    },
    { 
      title: 'Trading Emocional (Viés Psicológico)', 
      text: 'Sem um sistema validado, suas decisões são reféns do "feeling". A tentativa impulsiva de recuperar perdas (Revenge Trading) é a causa técnica nº 1 da quebra de bancas no mundo.' 
    },
    { 
      title: 'Erosão de Capital', 
      text: 'A falta de gestão de risco profissional transforma o mercado em um passivo. O resultado é a estagnação: ganhos pequenos devolvidos em perdas grandes. Um modelo matematicamente insustentável.' 
    },
  ];

  const steps = [
    {
      icon: Cpu,
      step: '1',
      title: 'Scanner Global',
      text: 'Nossos algoritmos monitoram 1.000+ ligas simultaneamente, identificando padrões estatísticos invisíveis ao olho humano em tempo real.'
    },
    {
      icon: ShieldCheck,
      step: '2',
      title: 'Filtro de Elite',
      text: 'A IA detecta a oportunidade, mas nossos 20 Traders Profissionais validam. Se houver risco de lesão, clima ou desfalque, o sinal é descartado. Só passa o filé.'
    },
    {
      icon: Smartphone,
      step: '3',
      title: 'Execução Simples',
      text: 'Você recebe o bilhete pronto no seu celular. Basta clicar em "Copiar", colar na sua casa de aposta e aguardar o resultado.'
    },
  ];
  
  return (
    <section ref={ref} className="relative py-12 px-4 bg-gradient-to-b from-[#121212] via-[#0a0a0a] to-black overflow-hidden">
      <div className="max-w-7xl mx-auto lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
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
                    O Ciclo da Operação Amadora
                  </h3>
                  <p className="text-xs md:text-sm text-red-400/60">(98% do Mercado)</p>
                </div>
              </div>
              
              {/* Headline */}
              <p className="text-base md:text-lg text-red-300 font-semibold mb-6 border-l-2 border-red-500/50 pl-4" style={{ fontFamily: 'Sora, sans-serif' }}>
                Por que a conta nunca fecha no final do mês.
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
                      <span className="text-red-400 font-bold text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>{item.title}:</span>
                      <p className="text-gray-400 text-sm leading-relaxed font-light" style={{ fontFamily: 'Sora, sans-serif' }}>{item.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
          
          {/* Right: The Engine (Green Side - How It Works) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-[#33b864]/10 rounded-3xl blur-2xl opacity-40" />
            
            <div className="relative bg-gradient-to-br from-[#121212]/90 via-[#0a0a0a] to-black border-2 border-[#33b864]/30 rounded-3xl p-6 md:p-8 backdrop-blur-xl h-full">
              {/* Header */}
              <div className="mb-6 text-center">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
                  AQUI NÃO É SORTE
                </h3>
                <h4 className="text-lg md:text-xl font-bold text-[#33b864] mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
                  É ENGENHARIA DE DADOS
                </h4>
                <p className="text-sm text-gray-400">
                  Enquanto você dorme ou trabalha, nossa infraestrutura processa milhões de dados para encontrar a entrada perfeita.
                </p>
              </div>
              
              {/* Steps */}
              <div className="space-y-4">
                {steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: i * 0.15 + 0.4 }}
                  >
                    <div className="relative bg-[#121212]/80 backdrop-blur border border-[#33b864]/20 rounded-xl p-4">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className="w-12 h-12 rounded-xl bg-[#33b864]/20 flex items-center justify-center flex-shrink-0" style={{ filter: 'drop-shadow(0 0 10px rgba(51, 184, 100, 0.4))' }}>
                          <step.icon className="w-6 h-6 text-[#33b864]" />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[#33b864] font-bold text-xs">{step.step}.</span>
                            <h4 className="text-white font-semibold text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>
                              {step.title}
                            </h4>
                          </div>
                          <p className="text-gray-400 text-xs leading-relaxed">
                            {step.text}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Connector Arrow */}
                    {i < steps.length - 1 && (
                      <div className="flex justify-center py-2">
                        <motion.div
                          animate={{ y: [0, 5, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          <ArrowDown className="w-5 h-5 text-[#33b864]/50" />
                        </motion.div>
                      </div>
                    )}
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
