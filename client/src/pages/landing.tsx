import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Cpu, Users, Target, Zap, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/logo";
import { useAuth } from "@/hooks/use-auth";
import { MatrixBackground } from "@/components/matrix-background";
import { SalesToast } from "@/components/sales-toast";
import { ProfitChart } from "@/components/profit-chart";
import { StatsCircle } from "@/components/stats-circle";
import { LiveMetricsBar } from "@/components/live-metrics-bar";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const { user } = useAuth();
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    let current = 0;
    const target = 12450;
    const duration = 2000;
    const increment = target / (duration / 16);

    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setActiveUsers(target);
        clearInterval(interval);
      } else {
        setActiveUsers(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] text-white overflow-hidden font-sans relative">
      <MatrixBackground />
      <SalesToast />

      <nav className="fixed top-0 w-full z-50 border-b border-primary/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo size="md" showText={true} />
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#proof" className="text-sm font-medium text-gray-400 hover:text-primary transition-colors" data-testid="link-resultados">Resultados</a>
            <a href="#hybrid" className="text-sm font-medium text-gray-400 hover:text-primary transition-colors" data-testid="link-tecnologia">Tecnologia</a>
            <Link href="/auth">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/5"
                data-testid="button-login"
              >
                Login
              </Button>
            </Link>
            <Link href="/auth">
              <Button 
                className="bg-primary hover:bg-primary/90 text-black font-bold border border-primary shadow-[0_0_20px_rgba(51,184,100,0.3)] hover:shadow-[0_0_30px_rgba(51,184,100,0.5)] transition-all"
                data-testid="button-access"
              >
                Liberar Acesso
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="max-w-6xl mx-auto text-center space-y-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-primary/30 backdrop-blur-md bg-black/40"
          >
            <div className="relative">
              <span className="w-3 h-3 rounded-full bg-primary block animate-ping absolute" />
              <span className="w-3 h-3 rounded-full bg-primary block relative" />
            </div>
            <span className="text-sm font-bold text-primary tracking-widest uppercase">Sistema IA + 20 Especialistas Ativo</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-black text-white leading-[1.05] tracking-tight"
            style={{ textShadow: "0 0 40px rgba(51,184,100,0.2)" }}
          >
            A Única IA do Mundo<br />
            com <span className="text-primary relative inline-block">
              Validação
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8, delay: 1 }}
                className="absolute bottom-0 left-0 h-1 bg-primary/50 blur-sm"
              />
            </span> de <br/>20 Especialistas
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed"
          >
            Chegamos a <span className="text-primary font-bold">95% de assertividade</span>. 
            Pare de apostar com a sorte. <span className="text-white font-semibold">Invista com a Ciência.</span>
          </motion.p>

          {/* Live Metrics Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="pt-8"
          >
            <LiveMetricsBar />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="pt-6"
          >
            <Link href={user ? "/app" : "/auth"}>
              <Button 
                size="lg" 
                className="h-16 px-12 text-xl bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-wider relative overflow-hidden group border-2 border-primary"
                data-testid="button-cta-hero"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ["-200%", "200%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <span className="relative z-10 flex items-center gap-3">
                  Liberar Meu Acesso Agora
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-sm text-gray-500"
          >
            O mercado de apostas foi projetado para você perder.<br />
            <span className="text-primary font-semibold">O Ocean Signal foi projetado para quebrar o banco.</span>
          </motion.div>
        </div>
      </section>

      <section id="proof" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-4">
              Live Proof
            </h2>
            <p className="text-xl text-gray-400">
              Não é mágica. É <span className="text-primary font-bold">Big Data</span>.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <ProfitChart />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <StatsCircle />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-black/60 backdrop-blur-md border border-primary/20 rounded-2xl p-8 text-center"
          >
            <div className="text-5xl font-black text-primary mb-2 drop-shadow-[0_0_20px_rgba(51,184,100,0.5)]" data-testid="text-active-members">
              +{activeUsers.toLocaleString()}
            </div>
            <div className="text-lg text-gray-400 font-semibold">Membros Lucrando Agora</div>
          </motion.div>
        </div>
      </section>

      <section id="hybrid" className="py-24 px-6 bg-gradient-to-b from-transparent via-primary/5 to-transparent relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-4">
              Hybrid Intelligence
            </h2>
            <p className="text-xl text-gray-400">
              <span className="text-primary font-bold">20 Mentes Humanas</span> + <span className="text-primary font-bold">1 Cérebro Digital</span>
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-black/60 backdrop-blur-lg border border-primary/20 rounded-2xl p-8 hover:border-primary/40 transition-all hover:shadow-[0_0_40px_rgba(51,184,100,0.1)] group"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Cpu className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-3">A Máquina</h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                Processamento de <span className="text-primary font-bold">1000+ ligas/segundo</span>. 
                Nossa IA nunca dorme, nunca para, nunca falha.
              </p>
              <div className="text-xs text-gray-600 uppercase tracking-wider">Precisão Inumana</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-black/60 backdrop-blur-lg border border-primary/20 rounded-2xl p-8 hover:border-primary/40 transition-all hover:shadow-[0_0_40px_rgba(51,184,100,0.1)] group"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-3">O Humano</h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                Curadoria de <span className="text-primary font-bold">20 Traders Profissionais</span>. 
                A IA encontra o padrão. O Especialista confirma o Green.
              </p>
              <div className="text-xs text-gray-600 uppercase tracking-wider">Intuição Validada</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-black/60 backdrop-blur-lg border border-primary/20 rounded-2xl p-8 hover:border-primary/40 transition-all hover:shadow-[0_0_40px_rgba(51,184,100,0.1)] group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-3 relative z-10">O Resultado</h3>
              <p className="text-gray-400 leading-relaxed mb-4 relative z-10">
                Sinais com <span className="text-primary font-bold">95% de assertividade</span>. 
                Você recebe apenas o que passou pelo filtro duplo.
              </p>
              <div className="flex items-center gap-2 relative z-10">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-semibold">Green Confirmado ✓</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-primary/10 via-black/80 to-black/80 backdrop-blur-xl border border-primary/30 rounded-3xl p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMzNiODY0IiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />
            
            <div className="relative z-10 space-y-8">
              <h2 className="text-3xl md:text-5xl font-display font-black text-white leading-tight">
                Você tem duas escolhas
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                  <div className="text-red-400 font-bold mb-2 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    Opção 1
                  </div>
                  <p className="text-gray-300">Continuar <span className="text-white font-bold">adivinhando</span> e perdendo dinheiro nas casas de aposta</p>
                </div>

                <div className="bg-primary/10 border border-primary/30 rounded-xl p-6">
                  <div className="text-primary font-bold mb-2 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                    Opção 2
                  </div>
                  <p className="text-gray-300">Seguir a inteligência de <span className="text-white font-bold">20 especialistas apoiados por IA</span></p>
                </div>
              </div>

              <Link href="/auth">
                <Button 
                  size="lg" 
                  className="h-16 px-12 text-xl bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-wider border-2 border-primary shadow-[0_0_40px_rgba(51,184,100,0.3)]"
                  data-testid="button-cta-final"
                >
                  Escolher a Inteligência <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
              </Link>

              <p className="text-sm text-gray-500">
                A decisão mais inteligente que você tomará hoje.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-primary/10 bg-black/80">
        <div className="max-w-7xl mx-auto text-center">
          <Logo size="sm" showText={true} />
          <p className="mt-4 text-sm text-gray-600">
            © 2024 Ocean Signal. Tecnologia de ponta para investidores esportivos.
          </p>
        </div>
      </footer>
    </div>
  );
}
