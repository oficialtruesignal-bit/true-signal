import { MatrixRain } from '@/components/landing/matrix-rain';
import { LiveToast } from '@/components/landing/live-toast';
import { HeroShot } from '@/components/landing/hero-shot';
import { FinancialTicker } from '@/components/landing/financial-ticker';
import { ProblemAgitation } from '@/components/landing/problem-agitation';
import { TechSolution } from '@/components/landing/tech-solution';
import { ProfitSimulator } from '@/components/landing/profit-simulator';
import { SystemTerminal } from '@/components/landing/system-terminal';
import { BenefitsGrid } from '@/components/landing/benefits-grid';
import { OfferPack } from '@/components/landing/offer-pack';
import { SocialProof } from '@/components/landing/social-proof';
import { GuaranteeSeal } from '@/components/landing/guarantee-seal';
import { FinalCTA } from '@/components/landing/final-cta';
import { Link } from 'wouter';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background effects */}
      <MatrixRain />
      <LiveToast />
      
      {/* Content */}
      <div className="relative z-10">
        {/* 1. HERO SECTION (A PROMESSA IMPACTANTE) */}
        <HeroShot />
        
        {/* 1.5. FINANCIAL TICKER (Bloomberg-style live data) */}
        <FinancialTicker />
        
        {/* 2. PROBLEMA & AGITAÇÃO (O "INFERNO") */}
        <ProblemAgitation />
        
        {/* 3. A SOLUÇÃO TÉCNICA (O "COMO FUNCIONA") */}
        <TechSolution />
        
        {/* 3.5. PROOF OF CONCEPT (Simulador Interativo + Terminal) */}
        <ProofOfConceptSection />
        
        {/* 4. BENEFÍCIOS TRANSFORMAIS (O "CÉU") */}
        <BenefitsGrid />
        
        {/* 5. DETALHAMENTO DA OFERTA (O "PACK") */}
        <OfferPack />
        
        {/* 6. PROVA SOCIAL (OS "RESULTADOS") */}
        <SocialProof />
        
        {/* 7. GARANTIA (RISCO ZERO) */}
        <GuaranteeSeal />
        
        {/* 8. CTA FINAL (O FECHAMENTO) */}
        <FinalCTA />
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

function ProofOfConceptSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <section ref={ref} className="relative py-20 px-4 bg-gradient-to-b from-[#0a0a0a] via-[#121212] to-black">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
            Veja o{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#33b864] to-[#2ea558]">
              Algoritmo em Ação
            </span>
          </h2>
          <p className="text-xl text-gray-400">
            Simule seus lucros e veja o sistema operando em tempo real
          </p>
        </motion.div>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Profit Simulator */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <ProfitSimulator />
          </motion.div>
          
          {/* Right: System Terminal */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Sistema Operacional</h3>
              <p className="text-gray-400">Status em tempo real do scanner de oportunidades</p>
            </div>
            <SystemTerminal />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative bg-black border-t border-[#33b864]/20 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <h4 className="text-[#33b864] font-black text-2xl mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
              Ocean Signal
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              A primeira IA de apostas esportivas que realmente funciona. Tecnologia proprietária para operadores profissionais.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h5 className="text-white font-bold mb-4">Acesso Rápido</h5>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/auth" className="hover:text-[#33b864] transition-colors">
                  Acessar Plataforma
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-[#33b864] transition-colors">
                  Como Funciona
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#33b864] transition-colors">
                  Garantia
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#33b864] transition-colors">
                  Suporte
                </a>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h5 className="text-white font-bold mb-4">Legal</h5>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-[#33b864] transition-colors">
                  Termos de Serviço
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#33b864] transition-colors">
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#33b864] transition-colors">
                  Política de Reembolso
                </a>
              </li>
            </ul>
          </div>
          
          {/* Security */}
          <div>
            <h5 className="text-white font-bold mb-4">Segurança</h5>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Plataforma protegida com criptografia de ponta. Servidores certificados com uptime de 99.9%.
            </p>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-[#33b864]/10 border border-[#33b864]/30 rounded text-xs text-[#33b864] font-bold">
                SSL
              </div>
              <div className="px-3 py-1 bg-[#33b864]/10 border border-[#33b864]/30 rounded text-xs text-[#33b864] font-bold">
                PCI DSS
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left text-sm text-gray-500">
              <p>© 2024 Ocean Signal. Todos os direitos reservados.</p>
              <p className="mt-1">CNPJ: 00.000.000/0001-00</p>
            </div>
            
            <div className="text-sm text-gray-500 text-center md:text-right">
              <p className="mb-1">Tecnologia de ponta para operadores profissionais</p>
              <p className="text-xs">
                <span className="text-[#33b864] font-semibold">94.8%</span> de assertividade comprovada
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
