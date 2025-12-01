import { MatrixRain } from '@/components/landing/matrix-rain';
import { HeroShot } from '@/components/landing/hero-shot';
import { ProblemAgitation } from '@/components/landing/problem-agitation';
import { TechSolution } from '@/components/landing/tech-solution';
import { ProfitSimulator } from '@/components/landing/profit-simulator';
import { BenefitsGrid } from '@/components/landing/benefits-grid';
import { SocialProof } from '@/components/landing/social-proof';
import { OfferPack } from '@/components/landing/offer-pack';
import { FinalCTA } from '@/components/landing/final-cta';
import { Logo } from '@/components/logo';
import { Link } from 'wouter';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-clip w-full max-w-full">
      {/* Background effects */}
      <MatrixRain />
      
      {/* Content */}
      <div className="relative z-10">
        {/* 1. HERO - A Promessa */}
        <HeroShot />
        
        {/* 2. PROBLEMA & AGITAÇÃO */}
        <ProblemAgitation />
        
        {/* 3. A SOLUÇÃO - Como Funciona */}
        <TechSolution />
        
        {/* 4. PROVA - Calculadora de Potencial */}
        <SimulatorSection />
        
        {/* 5. ARSENAL - Bento Grid */}
        <BenefitsGrid />
        
        {/* 6. MURAL DA FAMA - Prova Social */}
        <SocialProof />
        
        {/* 7. OFERTA & GARANTIA */}
        <OfferPack />
        
        {/* 8. CTA FINAL */}
        <FinalCTA />
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

function SimulatorSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <section ref={ref} className="relative py-12 px-4 bg-gradient-to-b from-[#0a0a0a] via-[#121212] to-black lg:hidden">
      <div className="max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <ProfitSimulator />
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative bg-black border-t border-[#33b864]/20 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <Logo size="lg" />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Inteligência artificial aplicada ao mercado esportivo.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h5 className="text-white font-bold mb-4">Acesso Rápido</h5>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/auth?mode=register" className="hover:text-[#33b864] transition-colors">
                  Criar Conta Grátis
                </Link>
              </li>
              <li>
                <a href="https://www.truesignal.com.br" className="hover:text-[#33b864] transition-colors">
                  www.truesignal.com.br
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h5 className="text-white font-bold mb-4">Contato</h5>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="mailto:suporte@truesignal.com.br" className="hover:text-[#33b864] transition-colors">
                  suporte@truesignal.com.br
                </a>
              </li>
              <li>
                <a href="https://wa.me/5516993253866" className="hover:text-[#33b864] transition-colors">
                  +55 16 99325-3866
                </a>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h5 className="text-white font-bold mb-4">Jurídico</h5>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/terms" className="hover:text-[#33b864] transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#33b864] transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/risk-disclaimer" className="hover:text-[#33b864] transition-colors">
                  Aviso de Risco
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Security */}
          <div>
            <h5 className="text-white font-bold mb-4">Segurança</h5>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Plataforma protegida com criptografia de ponta.
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
          <div className="flex flex-col gap-6">
            {/* Responsibility Badges */}
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="text-2xl">🔞</div>
                <div className="text-sm">
                  <p className="text-yellow-400 font-bold">+18</p>
                  <p className="text-yellow-600 text-xs">Proibido para menores</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="text-2xl">🎲</div>
                <div className="text-sm">
                  <p className="text-[#33b864] font-bold">Jogo Responsável</p>
                  <p className="text-gray-500 text-xs">Aposte com moderação</p>
                </div>
              </div>
            </div>
            
            {/* Legal Disclaimer */}
            <div className="text-center text-xs text-gray-600 max-w-4xl mx-auto mb-6 px-4">
              <p className="leading-relaxed">
                <strong className="text-gray-500">AVISO LEGAL:</strong> TRUE SIGNAL é uma plataforma de análises estatísticas esportivas. NÃO somos casa de apostas. 
                Todos os percentuais são baseados em dados históricos e NÃO garantem resultados futuros. 
                Apostas esportivas envolvem risco de perda financeira. Proibido para menores de 18 anos.
              </p>
            </div>
            
            {/* Copyright */}
            <div className="text-center text-sm text-gray-500">
              <p>© 2024 TRUE SIGNAL. Todos os direitos reservados.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
