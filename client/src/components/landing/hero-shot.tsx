import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Zap } from 'lucide-react';
import { Logo } from '@/components/logo';

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
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-8 tracking-tight leading-[1.15] lg:max-w-xl"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            Chega de "Achismo".<br />
            O mercado pune quem tenta adivinhar.
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl mb-8 space-y-4"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            <p className="text-base md:text-lg text-gray-300 leading-relaxed">
              Você não precisa mais quebrar a cabeça analisando.
            </p>
            <p className="text-base md:text-lg text-gray-300 leading-relaxed">
              Temos <span className="text-[#33b864] font-bold">20 Especialistas (7+ anos de mercado)</span> trabalhando lado a lado com nossa{' '}
              <span className="text-[#33b864] font-bold">IA Esportiva</span>.
            </p>
            <p className="text-base md:text-lg text-gray-300 leading-relaxed">
              A IA lê os dados, nós filtramos os riscos e entregamos apenas as melhores oportunidades{' '}
              <span className="text-[#33b864] font-bold">(assertividade acima de 83%)</span>.
            </p>
            <p className="text-base md:text-lg text-gray-300 leading-relaxed">
              Transformamos horas de estudo difícil em um sinal simples no seu celular.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col items-center lg:items-start gap-4"
          >
            <Link href="/auth">
              <motion.button
                className="group relative px-8 md:px-10 py-5 md:py-6 bg-[#33b864] text-black font-black text-base md:text-lg rounded-2xl overflow-hidden shadow-2xl shadow-[#33b864]/60 hover:shadow-[#33b864]/80 transition-all duration-300 hover:scale-105 touch-manipulation"
                data-testid="button-access-ai"
                animate={{
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    '0 25px 50px -12px rgba(51, 184, 100, 0.6)',
                    '0 25px 50px -12px rgba(51, 184, 100, 0.9)',
                    '0 25px 50px -12px rgba(51, 184, 100, 0.6)',
                  ],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: 'easeInOut',
                }}
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
                  QUERO RECEBER AS NOTIFICAÇÕES
                </span>
              </motion.button>
            </Link>
            <p className="text-sm text-gray-500 font-light" style={{ fontFamily: 'Sora, sans-serif' }}>
              Acesso imediato. 5 dias grátis para testar.
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
              {/* Screen - Dashboard Image */}
              <div className="w-full h-full rounded-[42px] overflow-hidden border border-[#33b864]/20">
                <img 
                  src="/attached_assets/image_1764341720746.png" 
                  alt="Central de Operações" 
                  className="w-full h-full object-cover object-top"
                />
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
