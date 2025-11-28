import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Zap, TrendingUp, Users, Scale, CheckCircle2, XCircle, Scan, ChevronRight } from 'lucide-react';
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
                <div className="h-6 bg-black rounded-b-2xl mx-auto w-28 mb-1" />
                
                {/* App Content - Central de Operações */}
                <div className="px-2.5 space-y-1.5 overflow-hidden">
                  
                  {/* Page Header */}
                  <div>
                    <h2 className="text-[10px] font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                      Central de Operações
                    </h2>
                    <p className="text-[5px] text-gray-500">Gestão de Performance em Unidades</p>
                  </div>
                  
                  {/* Top Stats Row - Gauge + Growth */}
                  <div className="flex gap-1.5">
                    {/* Circular Gauge */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                      className="flex-1 bg-[#121212] rounded-lg p-2 border border-[#33b864]/20 flex flex-col items-center justify-center"
                    >
                      <div className="relative w-12 h-12">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="24" cy="24" r="20" stroke="#1a1a1a" strokeWidth="4" fill="none" />
                          <motion.circle 
                            cx="24" cy="24" r="20" 
                            stroke="#33b864" 
                            strokeWidth="4" 
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray="125.6"
                            initial={{ strokeDashoffset: 125.6 }}
                            animate={{ strokeDashoffset: 125.6 * (1 - 0.867) }}
                            transition={{ duration: 1.5, delay: 1 }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-white font-bold text-[10px]">86.7%</span>
                        </div>
                      </div>
                      <span className="text-[5px] text-gray-500 mt-1">Média Novembro</span>
                    </motion.div>
                    
                    {/* Growth Card */}
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 1 }}
                      className="flex-1 bg-[#121212] rounded-lg p-2 border border-[#33b864]/20"
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <div className="w-0.5 h-3 bg-[#33b864] rounded-full" />
                        <span className="text-[5px] text-gray-400 uppercase tracking-wider">Crescimento</span>
                      </div>
                      <span className="text-[#33b864] font-bold text-[14px]">+118.5%</span>
                      <div className="mt-1 h-4 flex items-end gap-0.5">
                        {[40, 60, 45, 80, 70, 90, 100].map((h, i) => (
                          <motion.div 
                            key={i}
                            className="flex-1 bg-[#33b864]/30 rounded-sm"
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ duration: 0.5, delay: 1.2 + i * 0.1 }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* Middle Stats Row */}
                  <div className="flex gap-1.5">
                    {/* ODD Média */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1.2 }}
                      className="flex-1 bg-[#121212] rounded-lg p-2 border border-[#33b864]/20"
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <Scale className="w-2.5 h-2.5 text-[#33b864]" />
                        <span className="text-[5px] text-gray-400 uppercase">Odd Média</span>
                      </div>
                      <span className="text-white font-bold text-[14px]">1.85</span>
                      <p className="text-[4px] text-[#33b864]">▲ 20% acima</p>
                    </motion.div>
                    
                    {/* Usuários Online */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1.3 }}
                      className="flex-1 bg-[#121212] rounded-lg p-2 border border-[#33b864]/20"
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <Users className="w-2.5 h-2.5 text-[#33b864]" />
                        <span className="text-[5px] text-gray-400 uppercase">Online</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-white font-bold text-[14px]">330</span>
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#33b864] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#33b864]"></span>
                        </span>
                      </div>
                      <p className="text-[4px] text-gray-500">Latência: 12ms</p>
                    </motion.div>
                  </div>
                  
                  {/* Bottom Stats Row - Greens/Reds */}
                  <div className="flex gap-1.5">
                    {/* Greens */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1.4 }}
                      className="flex-1 bg-[#121212] rounded-lg p-2 border border-[#33b864]/20"
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <CheckCircle2 className="w-2.5 h-2.5 text-[#33b864]" />
                        <span className="text-[5px] text-gray-400 uppercase">Greens</span>
                      </div>
                      <span className="text-[#33b864] font-bold text-[16px]">170</span>
                      <p className="text-[4px] text-gray-500">no mês anterior</p>
                    </motion.div>
                    
                    {/* Reds */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1.5 }}
                      className="flex-1 bg-[#121212] rounded-lg p-2 border border-[#ef4444]/20"
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <XCircle className="w-2.5 h-2.5 text-[#ef4444]" />
                        <span className="text-[5px] text-gray-400 uppercase">Reds</span>
                      </div>
                      <span className="text-[#ef4444] font-bold text-[16px]">26</span>
                      <p className="text-[4px] text-gray-500">Proteção Ativa</p>
                    </motion.div>
                  </div>
                  
                  {/* Scanning Section */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.6 }}
                    className="bg-[#121212] rounded-lg p-2 border border-[#33b864]/20"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1">
                        <Scan className="w-2.5 h-2.5 text-[#33b864]" />
                        <span className="text-[6px] text-white font-semibold uppercase tracking-wider">Scanning</span>
                      </div>
                      <span className="text-[4px] text-[#33b864]">LIVE</span>
                    </div>
                    <div className="space-y-1">
                      {[
                        'Avaliando mercado Mais de 1.5 gols...',
                        'Varrendo partidas Bundesliga...',
                        'Validação cruzada com especialistas...',
                      ].map((text, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 1.8 + i * 0.2 }}
                          className="flex items-center gap-1"
                        >
                          <ChevronRight className="w-2 h-2 text-[#33b864]" />
                          <span className="text-[5px] text-gray-400 truncate">{text}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
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
