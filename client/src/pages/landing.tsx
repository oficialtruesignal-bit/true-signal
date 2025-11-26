import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Check, Shield, Cpu, Zap, Database, Clock, Users2 } from 'lucide-react';
import { MatrixRain } from '@/components/landing/matrix-rain';
import { LiveToast } from '@/components/landing/live-toast';
import { FinancialTicker } from '@/components/landing/financial-ticker';
import { ProfitSimulator } from '@/components/landing/profit-simulator';
import { SystemTerminal } from '@/components/landing/system-terminal';

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <MatrixRain />
      <LiveToast />
      
      <div className="relative z-10">
        <HeroSection />
        <FinancialTicker />
        <SimulatorSection />
        <MechanismSection />
        <ProofSection />
        <PricingSection />
        <Footer />
      </div>
      
      <StickyButton />
    </div>
  );
}

function HeroSection() {
  const headline = "Você está do lado errado da matemática.";
  
  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-20 relative">
      <div className="max-w-5xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-8 leading-tight text-white"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          {headline.split('').map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02, duration: 0.3 }}
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
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed px-4"
        >
          Enquanto você opera com emoção, o Ocean Signal explora{' '}
          <span className="text-[#33b864] font-bold">ineficiências de mercado</span>. 
          A primeira IA que prevê movimentos de Odds{' '}
          <span className="text-white font-semibold">antes das casas ajustarem</span>.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <Link href="/auth">
            <button
              className="group relative px-10 md:px-16 py-5 md:py-6 bg-[#33b864] text-black font-black text-lg md:text-2xl rounded-2xl overflow-hidden shadow-2xl shadow-[#33b864]/60 hover:shadow-[#33b864]/80 transition-all duration-300 hover:scale-105 touch-manipulation"
              data-testid="button-unlock-algorithm"
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
              <span className="relative z-10 flex items-center gap-3" style={{ fontFamily: 'Syne, sans-serif' }}>
                <Zap className="w-6 h-6 md:w-7 md:h-7" />
                DESBLOQUEAR O ALGORITMO
              </span>
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function SimulatorSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <section ref={ref} className="py-16 md:py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <ProfitSimulator />
        </motion.div>
      </div>
    </section>
  );
}

function MechanismSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  const mechanisms = [
    {
      icon: Database,
      title: 'Big Data',
      subtitle: 'Varredura de 1.400 ligas por segundo',
      description: 'Nenhum humano consegue fazer isso. Nossa infraestrutura processa milhões de dados em tempo real.',
    },
    {
      icon: Clock,
      title: 'Velocidade',
      subtitle: 'Timing cirúrgico de entrada',
      description: 'Entramos no mercado 3 segundos antes da Odd derreter. Precisão matemática.',
    },
    {
      icon: Users2,
      title: 'Validação Híbrida',
      subtitle: '20 analistas confirmam cada sinal',
      description: 'A IA filtra o ruído. Nossos especialistas confirmam. Dupla barreira de segurança.',
    },
  ];
  
  return (
    <section ref={ref} className="py-16 md:py-24 px-4 bg-gradient-to-b from-transparent via-[#0a0a0a] to-transparent">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
            O Mecanismo Único
          </h2>
          <p className="text-lg md:text-xl text-gray-400">
            Por que funciona quando tudo mais falha
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {mechanisms.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="bg-gradient-to-br from-black/80 to-[#0a0a0a]/60 backdrop-blur-xl border border-[#33b864]/20 rounded-2xl p-6 md:p-8 hover:border-[#33b864]/40 transition-all duration-300 hover:shadow-[0_0_40px_rgba(51,184,100,0.15)] group"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#33b864]/10 border border-[#33b864]/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <item.icon className="w-7 h-7 md:w-8 md:h-8 text-[#33b864]" />
              </div>
              
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                {item.title}
              </h3>
              
              <p className="text-sm md:text-base text-[#33b864] font-semibold mb-3">
                {item.subtitle}
              </p>
              
              <p className="text-sm md:text-base text-gray-400 leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProofSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  const withdrawals = [
    { name: 'M. Silva', amount: 4200, bank: 'Nubank' },
    { name: 'L. Costa', amount: 2850, bank: 'Inter' },
    { name: 'R. Santos', amount: 5600, bank: 'Nubank' },
    { name: 'A. Oliveira', amount: 3200, bank: 'C6 Bank' },
  ];
  
  return (
    <section ref={ref} className="py-16 md:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
            Prova Social Discreta
          </h2>
          <p className="text-lg md:text-xl text-gray-400">
            Operações estruturadas, resultados reais
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-xl font-bold text-white mb-4">Saques Aprovados Hoje</h3>
            <div className="space-y-3">
              {withdrawals.map((withdrawal, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: i * 0.1 + 0.2 }}
                  className="bg-black/60 backdrop-blur-xl border border-gray-800 rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#33b864] to-[#2ea558] flex items-center justify-center text-sm font-bold">
                      {withdrawal.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{withdrawal.name}</div>
                      <div className="text-xs text-gray-500">{withdrawal.bank}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#33b864] font-mono">
                      R$ {withdrawal.amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">Aprovado</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-xl font-bold text-white mb-4">Status do Sistema</h3>
            <SystemTerminal />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  const benefits = [
    'Acesso à infraestrutura completa',
    'Sinais probabilísticos em tempo real',
    'Dashboard analytics profissional',
    'Notificações instantâneas',
    'Ecossistema Ocean exclusivo',
    'Gestão automatizada de capital',
    'Suporte prioritário 24/7',
    'Protocolo de reembolso automático',
  ];
  
  return (
    <section ref={ref} className="py-16 md:py-24 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
            A Oferta
          </h2>
          <p className="text-lg md:text-xl text-gray-400">
            Não vendemos curso. Vendemos acesso à nossa infraestrutura.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#33b864] via-[#2ea558] to-[#33b864] rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
          
          <div className="relative bg-gradient-to-br from-black via-[#0a0a0a] to-black border-2 border-[#33b864] rounded-3xl p-8 md:p-10">
            <div className="text-center mb-8">
              <div className="inline-block px-4 py-1 bg-[#33b864]/20 border border-[#33b864]/40 rounded-full text-sm text-[#33b864] font-bold uppercase tracking-wider mb-4">
                Acesso Profissional
              </div>
              
              <div className="flex items-baseline justify-center gap-2 mb-4">
                <span className="text-5xl md:text-6xl font-extrabold font-mono">R$ 497</span>
                <span className="text-gray-400 text-lg">/mês</span>
              </div>
              
              <p className="text-gray-400 text-sm md:text-base">
                ROI médio de 5x o investimento mensal
              </p>
            </div>
            
            <ul className="space-y-3 mb-8">
              {benefits.map((benefit, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: i * 0.05 + 0.4 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-[#33b864]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#33b864]" />
                  </div>
                  <span className="text-sm md:text-base text-gray-300">{benefit}</span>
                </motion.li>
              ))}
            </ul>
            
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Capacidade do Servidor</span>
                <span className="text-[#33b864] font-bold font-mono">94%</span>
              </div>
              <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-[#33b864]/20">
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: '94%' } : {}}
                  transition={{ duration: 2, ease: 'easeOut', delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-[#33b864] to-[#2ea558] shadow-lg shadow-[#33b864]/50"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Restam poucas conexões disponíveis
              </p>
            </div>
            
            <Link href="/auth">
              <button className="w-full bg-[#33b864] hover:bg-[#2ea558] text-black font-black py-5 rounded-xl transition-all duration-300 hover:scale-105 shadow-xl shadow-[#33b864]/40 text-lg md:text-xl touch-manipulation">
                ACESSAR AGORA
              </button>
            </Link>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
              <Shield className="w-4 h-4 text-[#33b864]" />
              <span>Risco Zero • Protocolo de Reembolso Automático</span>
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
            <h4 className="text-[#33b864] font-bold text-xl mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Ocean Signal</h4>
            <p className="text-gray-400 text-sm">
              Algoritmo preditivo aplicado a operações estruturadas de alto retorno.
            </p>
          </div>
          <div>
            <h5 className="text-white font-bold mb-4">Acesso Rápido</h5>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/auth" className="hover:text-[#33b864] transition-colors">Acessar Plataforma</Link></li>
              <li><a href="#" className="hover:text-[#33b864] transition-colors">Termos de Serviço</a></li>
              <li><a href="#" className="hover:text-[#33b864] transition-colors">Política de Privacidade</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold mb-4">Infraestrutura</h5>
            <p className="text-gray-400 text-sm">
              Tecnologia protegida por criptografia de ponta. Servidores certificados com uptime de 99.9%.
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
          <p>© 2024 Ocean Signal. Sistema de inteligência para investidores esportivos.</p>
          <p className="mt-2">CNPJ: 00.000.000/0001-00</p>
        </div>
      </div>
    </footer>
  );
}

function StickyButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      if (currentScrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      
      if (currentScrollY + windowHeight >= documentHeight - 600) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
      
      lastScrollY = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div className={`md:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black via-black to-transparent transition-all duration-300 ${
      !isVisible || isHidden ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
    }`}>
      <Link href="/auth">
        <button
          className="w-full bg-[#33b864] hover:bg-[#2ea558] text-black font-black py-4 rounded-xl shadow-2xl shadow-[#33b864]/60 text-lg touch-manipulation flex items-center justify-center gap-2"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          <Zap className="w-5 h-5" />
          ACESSAR AGORA
        </button>
      </Link>
    </div>
  );
}
