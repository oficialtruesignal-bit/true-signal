import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Clock, TrendingUp, Crown } from 'lucide-react';

export function BenefitsGrid() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  const benefits = [
    {
      icon: Clock,
      title: 'Liberdade de Tempo',
      subtitle: 'Sua vida de volta',
      description: 'Não passe horas analisando estatísticas e assistindo pré-jogos. Receba tudo pronto em segundos e foque no que realmente importa.',
      stats: '3 minutos/dia',
    },
    {
      icon: TrendingUp,
      title: 'Consistência Financeira',
      subtitle: 'Renda previsível',
      description: 'Transforme apostas em uma fonte de renda variável previsível. Resultados matemáticos, não sorte. Crescimento exponencial da banca.',
      stats: '+287% ao ano',
    },
    {
      icon: Crown,
      title: 'Acesso à Elite',
      subtitle: 'Vantagem injusta',
      description: 'Opere com as mesmas ferramentas que os 1% usam para bater as casas. Tecnologia de hedge funds aplicada ao esporte.',
      stats: 'Top 1%',
    },
  ];
  
  return (
    <section ref={ref} className="relative py-20 px-4 bg-gradient-to-b from-[#121212] via-black to-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
            Transformação{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#33b864] to-[#2ea558]">
              Completa
            </span>
          </h2>
          <p className="text-xl text-gray-400">
            O que muda quando você entra para o Ocean Signal
          </p>
        </motion.div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {benefits.map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: i * 0.2 }}
              className="relative group"
            >
              {/* Holographic glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#33b864]/20 via-[#2ea558]/10 to-transparent rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative h-full bg-gradient-to-br from-white/5 via-black/50 to-black backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-[#33b864]/40 transition-all duration-300">
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#33b864] to-[#2ea558] flex items-center justify-center mb-6 shadow-lg shadow-[#33b864]/50 group-hover:scale-110 transition-transform">
                  <benefit.icon className="w-8 h-8 text-black" />
                </div>
                
                {/* Content */}
                <div className="mb-6">
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-[#33b864] font-semibold uppercase tracking-wider">
                    {benefit.subtitle}
                  </p>
                </div>
                
                <p className="text-gray-300 leading-relaxed mb-6">
                  {benefit.description}
                </p>
                
                {/* Stats badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#33b864]/10 border border-[#33b864]/30 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-[#33b864] animate-pulse" />
                  <span className="text-sm font-bold text-[#33b864]">{benefit.stats}</span>
                </div>
                
                {/* Holographic corner accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#33b864]/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
