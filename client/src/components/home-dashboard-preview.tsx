import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function HomeDashboardPreview() {
  return (
    <section className="relative py-24 overflow-hidden bg-[#0a0a0a]">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(51,184,100,0.05)_0%,_transparent_70%)]" />
      
      <div className="container relative z-10 mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Seu Painel de Controle{" "}
            <span className="text-gradient">Profissional</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Interface projetada para clareza e execução precisa.
            <br />
            Clique para ver o que te espera.
          </p>
        </motion.div>

        {/* Dashboard Preview Card - Clickable */}
        <Link href="/app">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative max-w-5xl mx-auto cursor-pointer group"
            style={{ 
              perspective: '2000px',
            }}
          >
            <div 
              className="relative bg-[#121212]/80 backdrop-blur-md border border-primary/30 rounded-2xl p-8 md:p-12 shadow-[0_0_60px_rgba(51,184,100,0.15)] transition-all duration-300 group-hover:shadow-[0_0_80px_rgba(51,184,100,0.25)] group-hover:border-primary/50"
              style={{
                transform: 'rotateX(2deg)',
                transformStyle: 'preserve-3d',
              }}
              data-testid="dashboard-preview-card"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
              
              {/* Content */}
              <div className="relative z-10 text-center space-y-6">
                {/* Icon/Visual Indicator */}
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <svg 
                      className="w-10 h-10 text-primary"
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                      />
                    </svg>
                  </div>
                </div>

                {/* Text */}
                <div>
                  <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-3">
                    Dashboard Completo
                  </h3>
                  <p className="text-gray-400 text-sm md:text-base max-w-md mx-auto">
                    Sinais ao vivo, análise técnica, estatísticas em tempo real e muito mais.
                  </p>
                </div>

                {/* CTA Button */}
                <div className="pt-4">
                  <Button 
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-black font-bold"
                    data-testid="button-view-dashboard"
                  >
                    <span className="flex items-center gap-2">
                      Ver Dashboard Completo
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </div>

                {/* Badge */}
                <div className="pt-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-full">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-xs text-primary font-medium">
                      Dados em tempo real • Sistema 24/7
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </Link>

        {/* Bottom Text */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-8"
        >
          <p className="text-muted-foreground text-sm">
            Tecnologia profissional ao alcance dos seus dedos.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
