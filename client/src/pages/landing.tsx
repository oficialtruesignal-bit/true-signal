import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Zap, Shield, BarChart3, Cpu, Target } from "lucide-react";
import generatedImage from '@assets/generated_images/dark_green_neon_tech_money_background.png';
import { Logo } from "@/components/logo";
import { useAuth } from "@/hooks/use-auth";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-primary/20 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo size="md" showText={true} />
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">Metodologia</a>
            <a href="#results" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">Resultados</a>
            <Link href="/auth">
              <Button variant="ghost" className="text-white hover:bg-white/5">Login</Button>
            </Link>
            <Link href="/auth">
              <Button className="bg-primary hover:bg-primary-dark text-black font-bold btn-glow border border-primary/50">
                Acessar Ocean Signal
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-20 opacity-40">
           <img src={generatedImage} className="w-full h-full object-cover" alt="Background" />
           <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        </div>
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-primary/10 blur-[120px] -z-10 rounded-full opacity-30" />
        
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#33b864]" />
            <span className="text-sm font-bold text-primary tracking-wide uppercase">Sistema IA Ativo</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white leading-[1.1] tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Navegue no oceano de dados.<br/>
            Encontre o <span className="text-primary drop-shadow-[0_0_15px_rgba(51,184,100,0.5)]">sinal de lucro</span>.
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Análise preditiva de IA + curadoria de especialistas. Identifique oportunidades lucrativas em tempo real.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Link href={user ? "/app" : "/auth"}>
              <Button size="lg" className="h-14 px-8 text-lg bg-primary hover:bg-primary-dark text-black font-bold btn-glow rounded-xl w-full md:w-auto border border-primary/50">
                {user ? "Acessar Dashboard" : "Começar Agora"} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 px-6 bg-gradient-to-b from-background to-black/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* AI Intelligence */}
            <div className="p-8 rounded-2xl bg-card/40 border border-primary/10 hover:border-primary/30 transition-all duration-300 group backdrop-blur-sm">
              <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-glow">
                <Cpu className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-3">Inteligência Artificial</h3>
              <p className="text-muted-foreground leading-relaxed">
                Algoritmos que varrem 1000+ ligas em tempo real, identificando padrões invisíveis ao olho humano.
              </p>
            </div>

            {/* Accuracy */}
            <div className="p-8 rounded-2xl bg-card/40 border border-primary/10 hover:border-primary/30 transition-all duration-300 group backdrop-blur-sm">
              <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-glow">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-3">Assertividade</h3>
              <p className="text-muted-foreground leading-relaxed">
                Histórico comprovado de 80%+ de acerto. Cada sinal passa por dupla validação: IA + Especialista.
              </p>
            </div>

            {/* Speed */}
            <div className="p-8 rounded-2xl bg-card/40 border border-primary/10 hover:border-primary/30 transition-all duration-300 group backdrop-blur-sm">
              <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-glow">
                <Zap className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-3">Velocidade</h3>
              <p className="text-muted-foreground leading-relaxed">
                Receba sinais antes das casas de aposta ajustarem as odds. Timing é tudo no mercado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Ticker - Recent Greens */}
      <section className="py-4 bg-primary/5 border-y border-primary/20 overflow-hidden">
        <div className="flex items-center gap-8 animate-marquee whitespace-nowrap">
          {[
            "✅ Flamengo vencer @ 1.80",
            "✅ Real Madrid Over 2.5 @ 1.65", 
            "✅ Liverpool BTTS @ 1.90",
            "✅ Bayern Under 3.5 @ 1.75",
            "✅ PSG -1 AH @ 2.10",
            "✅ Barcelona Ambas Marcam @ 1.85",
          ].map((green, i) => (
            <div key={i} className="flex items-center gap-3 px-6">
              <span className="text-primary font-bold text-sm">{green}</span>
              <span className="text-primary/30">•</span>
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {[
            "✅ Flamengo vencer @ 1.80",
            "✅ Real Madrid Over 2.5 @ 1.65", 
            "✅ Liverpool BTTS @ 1.90",
            "✅ Bayern Under 3.5 @ 1.75",
            "✅ PSG -1 AH @ 2.10",
            "✅ Barcelona Ambas Marcam @ 1.85",
          ].map((green, i) => (
            <div key={`dup-${i}`} className="flex items-center gap-3 px-6">
              <span className="text-primary font-bold text-sm">{green}</span>
              <span className="text-primary/30">•</span>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof / Results */}
      <section id="results" className="py-24 bg-card/30 border-y border-primary/10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2 space-y-6">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
                Resultados Verificados.
              </h2>
              <p className="text-muted-foreground text-lg">
                Transparência total. Acompanhe nosso histórico de Greens e veja por que somos a escolha #1 dos investidores esportivos.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-black/40 border border-primary/20 shadow-[0_0_15px_rgba(51,184,100,0.05)]">
                  <div className="text-3xl font-bold text-primary mb-1 shadow-glow">94%</div>
                  <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Taxa de Acerto</div>
                </div>
                <div className="p-4 rounded-xl bg-black/40 border border-primary/20 shadow-[0_0_15px_rgba(51,184,100,0.05)]">
                  <div className="text-3xl font-bold text-white mb-1">+2.5K</div>
                  <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Membros Ativos</div>
                </div>
              </div>
            </div>
            
            {/* Mockup of Results */}
            <div className="md:w-1/2 relative">
              <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full" />
              <div className="relative grid gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-[#0f0f0f] border border-primary/20 rounded-xl p-4 flex items-center justify-between shadow-lg transform hover:-translate-y-1 transition-transform duration-300" style={{ opacity: 1 - (i * 0.15), transform: `scale(${1 - (i * 0.05)}) translateY(${i * 10}px)` }}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-bold text-white">Green Confirmado</div>
                        <div className="text-sm text-muted-foreground">Man City vs Arsenal • Over 2.5 Goals</div>
                      </div>
                    </div>
                    <div className="text-primary font-bold font-mono text-lg drop-shadow-[0_0_5px_rgba(51,184,100,0.5)]">+R$ 450,00</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Tecnologia de Ponta
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              O ecossistema completo para quem leva apostas a sério.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-card border border-primary/10 hover:border-primary/40 transition-all duration-300 group hover:shadow-[0_0_30px_rgba(51,184,100,0.1)]">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Sinais Instantâneos</h3>
              <p className="text-muted-foreground">
                Nossa IA monitora milhares de jogos simultaneamente para encontrar valor onde ninguém mais vê.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-card border border-primary/10 hover:border-primary/40 transition-all duration-300 group hover:shadow-[0_0_30px_rgba(51,184,100,0.1)]">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Validação Humana</h3>
              <p className="text-muted-foreground">
                A tecnologia sugere, mas nossos especialistas validam. Dupla camada de segurança para seu investimento.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-card border border-primary/10 hover:border-primary/40 transition-all duration-300 group hover:shadow-[0_0_30px_rgba(51,184,100,0.1)]">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Dashboard Pro</h3>
              <p className="text-muted-foreground">
                Acompanhe jogos ao vivo, estatísticas e gerencie sua banca em um só lugar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 px-6 border-t border-primary/20 bg-gradient-to-b from-background to-black relative">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[300px] bg-primary/10 blur-[100px] -z-10 rounded-full opacity-20" />
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white">
            Pare de apostar, comece a investir.
          </h2>
          <p className="text-xl text-muted-foreground">
            Junte-se à elite dos investidores esportivos hoje mesmo.
          </p>
          <Link href="/auth">
            <Button size="lg" className="h-14 px-12 text-lg bg-primary hover:bg-primary-dark text-black font-bold btn-glow rounded-xl border border-primary/50">
              Acessar Ocean Signal
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
