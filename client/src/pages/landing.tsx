import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, useState, useEffect, MouseEvent } from 'react';
import { Link } from 'wouter';
import { Check, TrendingUp, Shield, Zap, Users, Target, Brain, Lock } from 'lucide-react';
import { MatrixRain } from '@/components/landing/matrix-rain';
import { LiveToast } from '@/components/landing/live-toast';
import { InfiniteMarquee } from '@/components/landing/infinite-marquee';
import { TiltCard } from '@/components/landing/tilt-card';

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <MatrixRain />
      <LiveToast />
      
      <div className="relative z-10">
        <HeroSection />
        <InfiniteMarquee />
        <ProblemSolutionSection />
        <ProductPreviewSection />
        <ScarcitySection />
        <PricingSection />
        <Footer />
      </div>
    </div>
  );
}

function HeroSection() {
  const [userCount] = useState(1420);
  const headline = "Não jogue com a Sorte. Invista com a Ciência.";
  
  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-20 relative">
      <div className="max-w-5xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          {headline.split('').map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
              className="inline-block"
              style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
            >
              {char}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          A única plataforma que une <span className="text-[#33b864] font-bold">Big Data</span>,{' '}
          <span className="text-[#33b864] font-bold">IA</span> e{' '}
          <span className="text-[#33b864] font-bold">20 Especialistas</span> para encontrar erros
          matemáticos nas Odds em tempo real.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <Link href="/auth">
            <button
              className="group relative px-12 py-6 bg-[#33b864] text-black font-bold text-xl rounded-2xl overflow-hidden shadow-2xl shadow-[#33b864]/50 hover:shadow-[#33b864]/80 transition-all duration-300 hover:scale-105"
              data-testid="button-access-system"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#33b864] via-[#2ea558] to-[#33b864]"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: 'linear',
                }}
              />
              <span className="relative z-10 flex items-center gap-3">
                <Zap className="w-6 h-6" />
                LIBERAR ACESSO AO SISTEMA
              </span>
            </button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="mt-8 flex items-center justify-center gap-3 text-gray-400"
        >
          <div className="flex -space-x-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#33b864] to-[#2ea558] border-2 border-black flex items-center justify-center text-xs font-bold"
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <span className="text-sm">
            <span className="text-[#33b864] font-bold font-sora">{userCount.toLocaleString()}</span> traders operando agora
          </span>
        </motion.div>
      </div>
    </section>
  );
}

function ProblemSolutionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-4xl md:text-5xl font-bold text-center mb-16"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          A Diferença entre <span className="text-red-500">Perder</span> e{' '}
          <span className="text-[#33b864]">Lucrar</span>
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Card Amador */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            style={{ perspective: '1000px' }}
          >
            <TiltCard className="bg-gradient-to-br from-gray-900 to-gray-800 border border-red-500/30 rounded-3xl p-8 shadow-2xl h-full"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-red-500">O Amador</h3>
            </div>
            <ul className="space-y-4">
              {['Aposta por emoção e palpite', 'Sem gestão de banca', 'Persegue prejuízos', 'Quebra em 3 meses'].map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: i * 0.1 + 0.3 }}
                  className="flex items-center gap-3 text-gray-300"
                >
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-red-500 text-xl">✕</span>
                  </div>
                  {item}
                </motion.li>
              ))}
            </ul>
            </TiltCard>
          </motion.div>

          {/* Card Ocean Signal */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            style={{ perspective: '1000px' }}
          >
            <TiltCard className="bg-gradient-to-br from-[#0a0a0a] to-black border-2 border-[#33b864] rounded-3xl p-8 shadow-2xl shadow-[#33b864]/30 relative overflow-hidden h-full"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#33b864]/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#33b864]/20 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-[#33b864]" />
                </div>
                <h3 className="text-2xl font-bold text-[#33b864]">Ocean Signal</h3>
              </div>
              <ul className="space-y-4">
                {[
                  'Análise de 1000+ pontos de dados',
                  'Gestão automática de banca',
                  'Lucro consistente e previsível',
                  'ROI médio de 102% ao mês',
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: i * 0.1 + 0.3 }}
                    className="flex items-center gap-3 text-white"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#33b864]/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-[#33b864]" />
                    </div>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
            </TiltCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ProductPreviewSection() {
  const ref = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [10, -10]), {
    stiffness: 100,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-10, 10]), {
    stiffness: 100,
    damping: 30,
  });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  useEffect(() => {
    if (!isInView || count >= 91.9) return;
    
    const timer = setTimeout(() => {
      setCount(prev => {
        const next = prev + 2.3;
        return next >= 91.9 ? 91.9 : next;
      });
    }, 30);
    
    return () => clearTimeout(timer);
  }, [isInView, count]);

  return (
    <section ref={ref} className="py-20 px-4 bg-gradient-to-b from-black via-[#0a0a0a] to-black">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-4xl md:text-5xl font-bold text-center mb-4"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          Veja o Sistema em Ação
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-400 text-center mb-16"
        >
          Dashboard de controle total das suas operações
        </motion.p>

        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, type: 'spring' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
          }}
          className="relative mx-auto max-w-4xl"
        >
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl p-8 border border-[#33b864]/30 shadow-2xl shadow-[#33b864]/20">
            <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-[#33b864]/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-[#33b864]">Central de Operações</h3>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#33b864] animate-pulse" />
                  <span className="text-sm text-gray-400">Live</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-black/50 rounded-xl p-4 border border-[#33b864]/20">
                  <div className="text-xs text-gray-400 mb-1">Assertividade</div>
                  <div className="text-3xl font-bold text-[#33b864] font-sora">
                    {count.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-black/50 rounded-xl p-4 border border-[#33b864]/20">
                  <div className="text-xs text-gray-400 mb-1">Online Agora</div>
                  <div className="text-3xl font-bold text-white font-sora">487</div>
                </div>
                <div className="bg-black/50 rounded-xl p-4 border border-[#33b864]/20">
                  <div className="text-xs text-gray-400 mb-1">Sinais Hoje</div>
                  <div className="text-3xl font-bold text-white font-sora">12</div>
                </div>
              </div>

              <div className="h-40 bg-black/30 rounded-xl flex items-end gap-2 p-4">
                {[30, 45, 60, 75, 85, 70, 90].map((height, i) => (
                  <motion.div
                    key={i}
                    initial={{ scaleY: 0 }}
                    animate={isInView ? { scaleY: 1 } : {}}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="flex-1 bg-gradient-to-t from-[#33b864] to-[#33b864]/50 rounded-t-lg origin-bottom"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ScarcitySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isInView || progress >= 87) return;
    
    const timer = setTimeout(() => {
      setProgress(prev => {
        const next = prev + 2;
        return next >= 87 ? 87 : next;
      });
    }, 30);
    
    return () => clearTimeout(timer);
  }, [isInView, progress]);

  return (
    <section ref={ref} className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="bg-gradient-to-br from-[#0a0a0a] to-black border border-[#33b864]/30 rounded-3xl p-8 md:p-12 text-center"
        >
          <Lock className="w-16 h-16 text-[#33b864] mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
            Acesso Limitado por Design
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Para manter a liquidez das entradas e evitar queda das Odds, limitamos o acesso a{' '}
            <span className="text-[#33b864] font-bold">500 membros</span> por ciclo.
          </p>

          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Vagas preenchidas</span>
              <span className="text-[#33b864] font-bold font-sora">{progress}%</span>
            </div>
            <div className="h-4 bg-black/50 rounded-full overflow-hidden border border-[#33b864]/20">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 2, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-[#33b864] to-[#2ea558] shadow-lg shadow-[#33b864]/50"
              />
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Restam apenas <span className="text-[#33b864] font-bold">{500 - Math.floor((progress / 100) * 500)}</span> vagas neste ciclo
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const benefits = [
    'Acesso ilimitado aos sinais premium',
    'Dashboard analytics em tempo real',
    'Notificações push instantâneas',
    'Suporte prioritário 24/7',
    'Gestão automatizada de banca',
    'Histórico completo de operações',
    'Análise preditiva com IA',
    'Comunidade exclusiva de traders',
  ];

  return (
    <section ref={ref} className="py-20 px-4">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50, rotateX: 20 }}
          animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative group"
          style={{ perspective: '1500px' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#33b864] via-[#2ea558] to-[#33b864] rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
          
          <div className="relative bg-gradient-to-br from-black via-[#0a0a0a] to-black border-2 border-[#33b864] rounded-3xl p-8 backdrop-blur-xl">
            <div className="text-center mb-8">
              <h3 className="text-sm text-[#33b864] font-bold uppercase tracking-wider mb-2">Plano Profissional</h3>
              <div className="flex items-baseline justify-center gap-2 mb-4">
                <span className="text-5xl font-bold font-sora">R$ 497</span>
                <span className="text-gray-400">/mês</span>
              </div>
              <p className="text-gray-400 text-sm">ROI médio de 5x o investimento</p>
            </div>

            <ul className="space-y-3 mb-8">
              {benefits.map((benefit, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: i * 0.05 + 0.2 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-[#33b864]/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-[#33b864]" />
                  </div>
                  <span className="text-sm text-gray-300">{benefit}</span>
                </motion.li>
              ))}
            </ul>

            <Link href="/auth">
              <button className="w-full bg-[#33b864] hover:bg-[#2ea558] text-black font-bold py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-xl shadow-[#33b864]/30">
                COMEÇAR AGORA
              </button>
            </Link>

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
              <Shield className="w-4 h-4 text-[#33b864]" />
              <span>Garantia de 7 dias • Risco Zero</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-black border-t border-[#33b864]/20 py-12 px-4 mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h4 className="text-[#33b864] font-bold text-xl mb-4">Ocean Signal</h4>
            <p className="text-gray-400 text-sm">
              Inteligência artificial aplicada a trading esportivo de alta frequência.
            </p>
          </div>
          <div>
            <h5 className="text-white font-bold mb-4">Links Rápidos</h5>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/auth" className="hover:text-[#33b864] transition-colors">Login</Link></li>
              <li><a href="#" className="hover:text-[#33b864] transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-[#33b864] transition-colors">Política de Privacidade</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold mb-4">Segurança</h5>
            <p className="text-gray-400 text-sm">
              Tecnologia protegida por criptografia de ponta-a-ponta. Dados armazenados em servidores certificados.
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
          <p>© 2024 Ocean Signal. Todos os direitos reservados.</p>
          <p className="mt-2">CNPJ: 00.000.000/0001-00</p>
        </div>
      </div>
    </footer>
  );
}
