import { Link } from 'wouter';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { 
  Brain, 
  Users, 
  Smartphone, 
  MousePointerClick, 
  Check, 
  X, 
  Sparkles, 
  TrendingUp, 
  Shield, 
  Zap,
  Target,
  BarChart3,
  Clock
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* SEÇÃO 1: HERO */}
      <HeroSection />
      
      {/* SEÇÃO 2: COMO FUNCIONA */}
      <HowItWorksSection />
      
      {/* SEÇÃO 3: MODELO FREEMIUM */}
      <FreemiumSection />
      
      {/* SEÇÃO 4: POR QUE FUNCIONA */}
      <WhyItWorksSection />
      
      {/* SEÇÃO 5: PROVA SOCIAL */}
      <SocialProofSection />
      
      {/* SEÇÃO 6: FOOTER */}
      <FooterSection />
    </div>
  );
}

// SEÇÃO 1: HERO
function HeroSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0f1f16] to-[#0a0a0a]"></div>
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#33b864] rounded-full filter blur-[128px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#33b864] rounded-full filter blur-[128px]"></div>
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#33b864]/10 border border-[#33b864]/30 rounded-full mb-6" data-testid="badge-hybrid-intel">
            <Sparkles className="w-4 h-4 text-[#33b864]" />
            <span className="text-sm font-semibold text-[#33b864]">Inteligência Híbrida</span>
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight" data-testid="heading-hero">
            A Fusão Perfeita:<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#33b864] to-[#2ea558]">
              Inteligência Artificial<br />+ Curadoria Humana
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed" data-testid="text-hero-subtitle">
            Nossa IA varre o mercado. Nossos 20 Especialistas filtram.<br />
            <span className="text-white font-semibold">Você apenas copia e cola.</span>
          </p>
          
          {/* CTA Button */}
          <Link href="/auth">
            <button className="group relative px-8 md:px-12 py-4 md:py-5 bg-[#33b864] text-black text-lg md:text-xl font-bold rounded-xl hover:bg-[#2ea558] transition-all duration-300 shadow-xl shadow-[#33b864]/50 hover:shadow-[#33b864]/70 hover:scale-105 mb-4" data-testid="button-cta-hero">
              <span className="relative z-10">COMEÇAR MEUS 15 DIAS GRÁTIS</span>
              <div className="absolute inset-0 bg-[#33b864] rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
            </button>
          </Link>
          
          {/* Tagline */}
          <p className="text-sm text-gray-400" data-testid="text-no-credit-card">
            Sem cartão de crédito. Sem compromisso inicial.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// SEÇÃO 2: COMO FUNCIONA
function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  const steps = [
    {
      icon: Brain,
      title: 'O Scanner (IA)',
      description: 'O algoritmo analisa 1.000+ jogos em segundos.',
      color: '#33b864'
    },
    {
      icon: Users,
      title: 'O Refino (Humanos)',
      description: 'Nossa equipe de 20 traders valida as melhores oportunidades.',
      color: '#33b864'
    },
    {
      icon: Smartphone,
      title: 'A Entrega (App)',
      description: 'O bilhete chega pronto no seu celular.',
      color: '#33b864'
    },
    {
      icon: MousePointerClick,
      title: 'A Ação (Você)',
      description: 'Você clica em "Pegar Bilhete" e faz a aposta na sua casa favorita (Bet365, etc).',
      color: '#33b864'
    }
  ];
  
  return (
    <section ref={ref} className="relative py-20 px-4 bg-black">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4" data-testid="heading-how-it-works">
            Como Funciona
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            <span className="text-[#33b864] font-semibold">Não somos uma casa de apostas.</span> Somos sua ferramenta de inteligência para tomar decisões melhores.
          </p>
        </motion.div>
        
        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
                className="relative p-8 bg-gradient-to-br from-[#121212] to-[#0a0a0a] border border-[#33b864]/20 rounded-2xl hover:border-[#33b864]/40 transition-all"
                data-testid={`step-card-${index}`}
              >
                {/* Step number */}
                <div className="absolute top-4 right-4 w-12 h-12 bg-[#33b864]/10 border border-[#33b864]/30 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-black text-[#33b864]">{index + 1}</span>
                </div>
                
                <div className="w-16 h-16 bg-[#33b864]/10 border-2 border-[#33b864] rounded-xl flex items-center justify-center mb-6">
                  <Icon className="w-8 h-8 text-[#33b864]" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-300 leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// SEÇÃO 3: MODELO FREEMIUM
function FreemiumSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <section ref={ref} className="relative py-20 px-4 bg-gradient-to-b from-black via-[#0f1f16] to-black">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4" data-testid="heading-freemium">
            Prove a Assertividade<br />Antes de Assinar
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Não queremos seu dinheiro agora.<br />
            <span className="text-[#33b864] font-bold">Queremos sua confiança.</span>
          </p>
        </motion.div>
        
        {/* Comparison Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="relative p-8 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-2 border-gray-700 rounded-2xl"
            data-testid="plan-card-free"
          >
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Plano Gratuito</h3>
              <p className="text-gray-400 text-sm">15 Dias de Teste</p>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#33b864] flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">1 Bilhete Selecionado/Dia</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#33b864] flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">Acesso ao Painel</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-500">Suporte VIP</span>
              </li>
            </ul>
            
            <div className="text-center">
              <div className="text-4xl font-black text-white mb-4">
                Grátis
                <span className="text-lg text-gray-400 ml-2">/ 15 dias</span>
              </div>
            </div>
          </motion.div>
          
          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="relative p-8 bg-gradient-to-br from-[#33b864]/20 to-[#0a0a0a] border-2 border-[#33b864] rounded-2xl"
            data-testid="plan-card-premium"
          >
            {/* Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#33b864] text-black text-sm font-bold rounded-full">
              RECOMENDADO
            </div>
            
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Ocean Prime</h3>
              <p className="text-gray-300 text-sm">Assinatura Mensal</p>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#33b864] flex-shrink-0 mt-0.5" />
                <span className="text-white font-semibold">Bilhetes Ilimitados</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#33b864] flex-shrink-0 mt-0.5" />
                <span className="text-white font-semibold">Melhores Odds</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#33b864] flex-shrink-0 mt-0.5" />
                <span className="text-white font-semibold">Análises Ao Vivo</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#33b864] flex-shrink-0 mt-0.5" />
                <span className="text-white font-semibold">Suporte VIP</span>
              </li>
            </ul>
            
            <div className="text-center mb-6">
              <div className="text-4xl font-black text-white mb-1">
                R$ 99,87
                <span className="text-lg text-gray-300 ml-2">/ mês</span>
              </div>
            </div>
            
            <Link href="/auth">
              <button className="w-full py-4 bg-[#33b864] text-black font-bold rounded-xl hover:bg-[#2ea558] transition-all hover:scale-105 shadow-xl shadow-[#33b864]/30" data-testid="button-cta-premium">
                Liberar Acesso Gratuito Agora
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// SEÇÃO 4: POR QUE FUNCIONA
function WhyItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  const features = [
    {
      icon: Target,
      title: 'Curadoria Especializada',
      description: '20 traders profissionais validam cada oportunidade antes de chegar até você.'
    },
    {
      icon: Zap,
      title: 'Velocidade de Análise',
      description: 'Nossa IA processa 1.000+ jogos em segundos, encontrando padrões invisíveis.'
    },
    {
      icon: BarChart3,
      title: 'Dados em Tempo Real',
      description: 'Estatísticas atualizadas ao vivo para decisões precisas no momento certo.'
    },
    {
      icon: Clock,
      title: 'Economia de Tempo',
      description: 'Pare de analisar planilhas. Receba bilhetes prontos e focados.'
    }
  ];
  
  return (
    <section ref={ref} className="relative py-20 px-4 bg-black">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4" data-testid="heading-why-it-works">
            Por Que Funciona?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Facilitamos a vida de quem quer <span className="text-[#33b864] font-bold">viver de renda variável</span>.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-gradient-to-br from-[#121212] to-[#0a0a0a] border border-[#33b864]/20 rounded-xl hover:border-[#33b864]/40 transition-all"
                data-testid={`feature-card-${index}`}
              >
                <div className="w-12 h-12 bg-[#33b864]/10 border border-[#33b864]/30 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-[#33b864]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
        
        {/* Floating Ticket Card Example */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="max-w-md mx-auto p-6 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-2 border-[#33b864] rounded-2xl shadow-2xl shadow-[#33b864]/20"
          data-testid="example-ticket-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#33b864] rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-400 uppercase font-semibold">Sinal Ao Vivo</span>
            </div>
            <span className="px-3 py-1 bg-[#33b864]/20 text-[#33b864] text-xs font-bold rounded-full">
              ODDS 2.5
            </span>
          </div>
          
          <div className="mb-4">
            <h4 className="text-white font-bold mb-1">Flamengo vs Palmeiras</h4>
            <p className="text-sm text-gray-400">Brasileirão Série A</p>
          </div>
          
          <div className="p-3 bg-black/50 border border-[#33b864]/30 rounded-lg mb-4">
            <p className="text-sm text-gray-300">
              <span className="text-[#33b864] font-semibold">Mercado:</span> Ambas Marcam
            </p>
          </div>
          
          <button className="w-full py-3 bg-[#33b864] text-black font-bold rounded-lg hover:bg-[#2ea558] transition-all flex items-center justify-center gap-2" data-testid="button-copy-ticket">
            <MousePointerClick className="w-4 h-4" />
            Pegar Bilhete
          </button>
        </motion.div>
      </div>
    </section>
  );
}

// SEÇÃO 5: PROVA SOCIAL
function SocialProofSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  const results = [
    { match: 'Barcelona 3 x 1 Real Madrid', market: 'Over 2.5', status: 'green', odds: '1.85' },
    { match: 'PSG 2 x 0 Bayern', market: 'Casa Vence', status: 'green', odds: '2.10' },
    { match: 'Liverpool 4 x 2 Arsenal', market: 'Ambas Marcam', status: 'green', odds: '1.70' },
  ];
  
  return (
    <section ref={ref} className="relative py-20 px-4 bg-gradient-to-b from-black via-[#0f1f16] to-black">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4" data-testid="heading-social-proof">
            Resultados Reais
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Bilhetes vencedores de membros que seguem nossa inteligência.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {results.map((result, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1 }}
              className="p-6 bg-gradient-to-br from-[#121212] to-[#0a0a0a] border-2 border-[#33b864] rounded-xl"
              data-testid={`result-card-${index}`}
            >
              {/* Green Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#33b864]/20 border border-[#33b864] rounded-full mb-4">
                <div className="w-2 h-2 bg-[#33b864] rounded-full"></div>
                <span className="text-xs text-[#33b864] font-bold uppercase">Green</span>
              </div>
              
              <h4 className="text-white font-bold mb-2">{result.match}</h4>
              <p className="text-sm text-gray-400 mb-4">{result.market}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-[#33b864]">{result.odds}x</span>
                <TrendingUp className="w-6 h-6 text-[#33b864]" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// SEÇÃO 6: FOOTER
function FooterSection() {
  return (
    <footer className="relative bg-black border-t border-[#33b864]/20 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <h4 className="text-[#33b864] font-black text-2xl mb-4">Ocean Signal</h4>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Inteligência artificial aplicada ao mercado esportivo.
            </p>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#33b864]" />
              <span className="text-xs text-gray-500">Plataforma Segura</span>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h5 className="text-white font-bold mb-4">Links Rápidos</h5>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/" className="hover:text-[#33b864] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/auth" className="hover:text-[#33b864] transition-colors">
                  Bilhetes
                </Link>
              </li>
              <li>
                <Link href="/auth" className="hover:text-[#33b864] transition-colors">
                  Planos
                </Link>
              </li>
              <li>
                <Link href="/auth" className="hover:text-[#33b864] transition-colors">
                  Login
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h5 className="text-white font-bold mb-4">Jurídico</h5>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/termos" className="hover:text-[#33b864] transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="hover:text-[#33b864] transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/risco" className="hover:text-[#33b864] transition-colors">
                  Aviso Legal
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Disclaimer */}
          <div>
            <h5 className="text-white font-bold mb-4">Importante</h5>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              <span className="text-[#33b864] font-semibold">O Ocean Signal é uma ferramenta de análise estatística.</span> Não somos uma casa de apostas e não retemos valores de usuários.
            </p>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
            {/* Age Restriction & Responsible Gaming */}
            <div className="flex items-center gap-4">
              {/* +18 Badge */}
              <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border-2 border-red-500 rounded-lg" data-testid="badge-age-restriction">
                <div className="w-10 h-10 bg-red-500/20 border border-red-500 rounded-full flex items-center justify-center">
                  <span className="text-lg font-black text-red-400">+18</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-red-400 uppercase">Proibido</p>
                  <p className="text-xs text-gray-400">Menores de Idade</p>
                </div>
              </div>
              
              {/* Responsible Gaming Badge */}
              <div className="flex items-center gap-2 px-4 py-2 bg-[#33b864]/10 border border-[#33b864]/30 rounded-lg" data-testid="badge-responsible-gaming">
                <Shield className="w-6 h-6 text-[#33b864]" />
                <div>
                  <p className="text-xs font-bold text-[#33b864]">Jogo</p>
                  <p className="text-xs text-gray-400">Responsável</p>
                </div>
              </div>
            </div>
            
            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-500">
                © 2024 Ocean Signal. Todos os direitos reservados.
              </p>
              <p className="text-xs text-gray-600 mt-1">
                CNPJ: 00.000.000/0001-00
              </p>
            </div>
          </div>
          
          {/* Final Disclaimer */}
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-400 leading-relaxed">
              <strong className="text-yellow-400">AVISO:</strong> Apostas esportivas envolvem risco financeiro. O Ocean Signal fornece análises estatísticas, mas não garante lucros. Jogue com responsabilidade e dentro de suas possibilidades.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
