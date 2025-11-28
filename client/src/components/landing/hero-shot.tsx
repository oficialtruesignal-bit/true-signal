import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Zap, TrendingUp, Users, Target } from 'lucide-react';
import { Logo } from '@/components/logo';
import { AIScanner } from '@/components/ai-scanner';

// Demo bet cards for mockup
const demoBets = [
  {
    id: '1',
    homeTeam: 'Manchester City',
    awayTeam: 'Arsenal',
    homeLogo: 'https://media.api-sports.io/football/teams/50.png',
    awayLogo: 'https://media.api-sports.io/football/teams/42.png',
    market: 'Ambas Marcam - Sim',
    odd: 1.85,
    status: 'green' as const,
  },
  {
    id: '2',
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    homeLogo: 'https://media.api-sports.io/football/teams/541.png',
    awayLogo: 'https://media.api-sports.io/football/teams/529.png',
    market: 'Over 2.5 Gols',
    odd: 1.72,
    status: 'pending' as const,
  },
  {
    id: '3',
    homeTeam: 'PSG',
    awayTeam: 'Bayern',
    homeLogo: 'https://media.api-sports.io/football/teams/85.png',
    awayLogo: 'https://media.api-sports.io/football/teams/157.png',
    market: 'Casa Vence',
    odd: 2.10,
    status: 'green' as const,
  },
];

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
                <div className="h-6 bg-black rounded-b-2xl mx-auto w-28 mb-2" />
                
                {/* App Content - Dashboard Preview */}
                <div className="px-3 space-y-2 overflow-hidden">
                  {/* Mini Stats Row */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="bg-[#33b864]/10 border border-[#33b864]/30 rounded-lg p-1.5 text-center">
                      <Target className="w-3 h-3 text-[#33b864] mx-auto mb-0.5" />
                      <div className="text-[10px] font-bold text-[#33b864]">91.4%</div>
                      <div className="text-[6px] text-gray-500">Assertividade</div>
                    </div>
                    <div className="bg-[#33b864]/10 border border-[#33b864]/30 rounded-lg p-1.5 text-center">
                      <Users className="w-3 h-3 text-[#33b864] mx-auto mb-0.5" />
                      <div className="text-[10px] font-bold text-[#33b864]">1.247</div>
                      <div className="text-[6px] text-gray-500">Online</div>
                    </div>
                    <div className="bg-[#33b864]/10 border border-[#33b864]/30 rounded-lg p-1.5 text-center">
                      <TrendingUp className="w-3 h-3 text-[#33b864] mx-auto mb-0.5" />
                      <div className="text-[10px] font-bold text-[#33b864]">847</div>
                      <div className="text-[6px] text-gray-500">Sinais</div>
                    </div>
                  </div>
                  
                  {/* Section Title */}
                  <div className="flex items-center gap-1 pt-1">
                    <div className="w-1 h-3 bg-[#33b864] rounded-full" />
                    <span className="text-[8px] font-bold text-white uppercase tracking-wider">Sinais Premium</span>
                    <div className="ml-auto flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-[#33b864] rounded-full animate-pulse" />
                      <span className="text-[6px] text-[#33b864]">LIVE</span>
                    </div>
                  </div>
                  
                  {/* Demo Bet Cards */}
                  <div className="space-y-1.5">
                    {demoBets.map((bet, index) => (
                      <motion.div
                        key={bet.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 1.2 + index * 0.2 }}
                        className="relative bg-gradient-to-r from-[#0d0d0d] to-[#111] border border-[#33b864]/20 rounded-lg p-2 overflow-hidden"
                      >
                        {/* Status indicator */}
                        <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${bet.status === 'green' ? 'bg-[#33b864]' : 'bg-yellow-500'}`} />
                        
                        {/* Teams */}
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1">
                            <img src={bet.homeLogo} alt="" className="w-4 h-4 object-contain" />
                            <span className="text-[7px] text-white font-medium truncate max-w-[50px]">{bet.homeTeam}</span>
                          </div>
                          <span className="text-[6px] text-gray-500">vs</span>
                          <div className="flex items-center gap-1">
                            <span className="text-[7px] text-white font-medium truncate max-w-[50px]">{bet.awayTeam}</span>
                            <img src={bet.awayLogo} alt="" className="w-4 h-4 object-contain" />
                          </div>
                        </div>
                        
                        {/* Market & Odd */}
                        <div className="flex items-center justify-between">
                          <span className="text-[6px] text-gray-400">{bet.market}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-[8px] font-bold text-[#33b864] bg-[#33b864]/20 px-1.5 py-0.5 rounded">
                              {bet.odd.toFixed(2)}
                            </span>
                            {bet.status === 'green' && (
                              <div className="w-2.5 h-2.5 bg-[#33b864] rounded-full flex items-center justify-center">
                                <span className="text-[6px] text-black font-bold">✓</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* AI Scanner Mini */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 2 }}
                    className="bg-[#0a0a0a] border border-[#33b864]/20 rounded-lg p-2"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-1.5 h-1.5 bg-[#33b864] rounded-full animate-pulse" />
                      <span className="text-[7px] font-bold text-[#33b864] uppercase">IA Analisando</span>
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1">
                        <motion.div 
                          className="h-0.5 bg-[#33b864]/50 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: '60%' }}
                          transition={{ duration: 1.5, delay: 2.2, repeat: Infinity, repeatType: 'reverse' }}
                        />
                      </div>
                      <span className="text-[5px] text-gray-500">Processando mercados em tempo real...</span>
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
