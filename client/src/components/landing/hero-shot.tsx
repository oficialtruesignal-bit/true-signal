import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Zap } from 'lucide-react';
import { Logo } from '@/components/logo';
import { AIScanner } from '@/components/ai-scanner';

export function HeroShot() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Background gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0a0a] to-[#121212]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#33b864]/20 rounded-full blur-[150px]" />
      
      <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center lg:px-8">
        {/* Left: Copy */}
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6 flex justify-center lg:justify-start"
          >
            <Logo size="lg" showText={true} />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tighter leading-tight lg:max-w-xl"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            Terceirize sua análise. Pare de lutar contra o mercado sozinho.
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base md:text-lg text-gray-300 mt-6 max-w-2xl leading-relaxed font-light"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            Chega de perder horas filtrando jogos em aplicativos. Nosso ecossistema une{' '}
            <span className="text-[#33b864] font-bold">+ de 20 traders esportivos juntos com a Inteligência Artificial</span>{' '}
            para processar o mercado em segundos e te trazer as melhores probabilidades de acerto.
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-base md:text-lg text-gray-300 mt-4 mb-8 max-w-2xl leading-relaxed font-light"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            Nós fazemos o trabalho pesado. Você recebe a decisão pronta, validada e com até{' '}
            <span className="text-white font-bold">87% de assertividade</span> técnica.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col items-center lg:items-start gap-4"
          >
            <Link href="/auth">
              <button
                className="group relative px-8 md:px-10 py-5 md:py-6 bg-[#33b864] text-black font-black text-base md:text-lg rounded-2xl overflow-hidden shadow-2xl shadow-[#33b864]/60 hover:shadow-[#33b864]/80 transition-all duration-300 hover:scale-105 touch-manipulation"
                data-testid="button-access-ai"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#33b864] via-white/30 to-[#33b864]"
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: 'linear',
                  }}
                />
                <span className="relative z-10 flex items-center gap-3" style={{ fontFamily: 'Sora, sans-serif' }}>
                  <Zap className="w-5 h-5" />
                  COMEÇAR AGORA
                </span>
              </button>
            </Link>
            <p className="text-sm text-gray-500 font-light" style={{ fontFamily: 'Sora, sans-serif' }}>
              Acesso imediato. 15 dias de degustação gratuita.
            </p>
          </motion.div>
        </div>
        
        {/* Right: iPhone Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="relative flex justify-center lg:justify-end"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-[#33b864]/30 rounded-[60px] blur-[100px] scale-110" />
          
          {/* iPhone Frame */}
          <div className="relative">
            <motion.div
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 4,
                ease: 'easeInOut',
              }}
              className="relative w-[280px] md:w-[320px] lg:w-[360px] aspect-[9/19] bg-black rounded-[50px] p-3 shadow-2xl border-4 border-gray-900"
            >
              {/* Screen */}
              <div className="w-full h-full bg-gradient-to-b from-[#0a0a0a] to-black rounded-[42px] overflow-hidden border border-[#33b864]/20">
                {/* Notch */}
                <div className="h-8 bg-black rounded-b-3xl mx-auto w-40 mb-4" />
                
                {/* App Content */}
                <div className="px-4 space-y-4">
                  {/* Circle Gauge */}
                  <div className="flex justify-center mb-6">
                    <div className="relative w-40 h-40">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="#1a1a1a"
                          strokeWidth="12"
                          fill="none"
                        />
                        <motion.circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="#33b864"
                          strokeWidth="12"
                          fill="none"
                          strokeLinecap="round"
                          initial={{ strokeDasharray: '0 440' }}
                          animate={{ strokeDasharray: '402 440' }}
                          transition={{ duration: 2, delay: 1 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-[#33b864]">91.4%</span>
                        <span className="text-[8px] text-gray-400 text-center px-2">Melhor mês registrado</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#33b864]/10 border border-[#33b864]/30 rounded-xl p-2">
                      <div className="text-[9px] text-gray-400 mb-0.5">Lucro Mensal</div>
                      <div className="text-sm font-bold text-[#33b864]">R$ 84.755</div>
                    </div>
                    <div className="bg-[#33b864]/10 border border-[#33b864]/30 rounded-xl p-2">
                      <div className="text-[7px] text-gray-400 mb-0.5 whitespace-nowrap">Assertividade do mês</div>
                      <div className="text-sm font-bold text-[#33b864]">87%</div>
                    </div>
                  </div>
                  
                  {/* AI Scanner */}
                  <div className="mt-2">
                    <AIScanner />
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Floating particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-[#33b864] rounded-full"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3 + Math.random() * 2,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
