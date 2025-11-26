import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Zap, Sparkles } from 'lucide-react';

export function HeroShot() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Background gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0a0a] to-[#121212]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#33b864]/20 rounded-full blur-[150px]" />
      
      <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Copy */}
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#33b864]/10 border border-[#33b864]/30 rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4 text-[#33b864]" />
            <span className="text-sm text-[#33b864] font-semibold">Tecnologia Proprietária</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.1]"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            A Primeira IA de Apostas que{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#33b864] to-[#2ea558]">
              Realmente Funciona
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed"
          >
            Pare de Jogar, Comece a <span className="text-white font-bold">Operar</span>.
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg text-gray-400 mb-10 leading-relaxed"
          >
            Esqueça grupos viciados e análises manuais. O Ocean Signal escaneia{' '}
            <span className="text-[#33b864] font-semibold">milhares de jogos em tempo real</span> e te entrega apenas as oportunidades com{' '}
            <span className="text-white font-semibold">+90% de chance matemática de Green</span>.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link href="/auth">
              <button
                className="group relative px-8 md:px-12 py-5 md:py-6 bg-[#33b864] text-black font-black text-lg md:text-xl rounded-2xl overflow-hidden shadow-2xl shadow-[#33b864]/60 hover:shadow-[#33b864]/80 transition-all duration-300 hover:scale-105 touch-manipulation"
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
                <span className="relative z-10 flex items-center gap-3" style={{ fontFamily: 'Syne, sans-serif' }}>
                  <Zap className="w-6 h-6" />
                  QUERO ACESSO À INTELIGÊNCIA ARTIFICIAL
                </span>
              </button>
            </Link>
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
                          animate={{ strokeDasharray: '418 440' }}
                          transition={{ duration: 2, delay: 1 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-[#33b864]">94.8%</span>
                        <span className="text-xs text-gray-500">Assertividade</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#33b864]/10 border border-[#33b864]/30 rounded-xl p-3">
                      <div className="text-xs text-gray-400 mb-1">Lucro Hoje</div>
                      <div className="text-lg font-bold text-[#33b864]">+R$ 842</div>
                    </div>
                    <div className="bg-[#33b864]/10 border border-[#33b864]/30 rounded-xl p-3">
                      <div className="text-xs text-gray-400 mb-1">Sequência</div>
                      <div className="text-lg font-bold text-[#33b864]">7 Greens</div>
                    </div>
                  </div>
                  
                  {/* Chart placeholder */}
                  <div className="bg-[#1a1a1a] border border-[#33b864]/20 rounded-xl p-3 h-24 flex items-end justify-between gap-1">
                    {[40, 65, 45, 80, 55, 90, 75].map((height, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 0.5, delay: 1.2 + i * 0.1 }}
                        className="flex-1 bg-gradient-to-t from-[#33b864] to-[#2ea558] rounded-t"
                      />
                    ))}
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
