import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Zap, Shield, BarChart3, Trophy } from "lucide-react";
import generatedImage from '@assets/generated_images/dark_purple_neon_abstract_sports_background.png';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-white">
              TYLTY<span className="text-primary">HUB</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">Metodologia</a>
            <a href="#results" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">Resultados</a>
            <Link href="/auth">
              <Button variant="ghost" className="text-white hover:bg-white/5">Login</Button>
            </Link>
            <Link href="/auth">
              <Button className="bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/25">
                Começar Agora
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-primary/20 blur-[120px] -z-10 rounded-full opacity-50" />
        
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-white">Novos sinais liberados hoje</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white leading-[1.1] tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Lucro com <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Inteligência Artificial</span> <br/>
            + 20 Especialistas
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Acesse a plataforma de inteligência esportiva mais completa do mercado. 
            Sinais validados, análise de dados em tempo real e curadoria profissional.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Link href="/auth">
              <Button size="lg" className="h-14 px-8 text-lg bg-primary hover:bg-primary-dark text-white shadow-xl shadow-primary/25 rounded-xl w-full md:w-auto">
                Quero Lucrar Agora <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-white/10 hover:bg-white/5 hover:text-white rounded-xl w-full md:w-auto">
                Ver Demonstração
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof / Results */}
      <section id="results" className="py-24 bg-card/50 border-y border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2 space-y-6">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
                Resultados que falam por si só.
              </h2>
              <p className="text-muted-foreground text-lg">
                Nossa comunidade já gerou mais de R$ 2.5M em lucro nos últimos 6 meses.
                Transparência total com histórico verificado.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-3xl font-bold text-primary mb-1">92%</div>
                  <div className="text-sm text-muted-foreground">Taxa de Acerto (VIP)</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-3xl font-bold text-green-500 mb-1">+1250</div>
                  <div className="text-sm text-muted-foreground">Greens no Mês</div>
                </div>
              </div>
            </div>
            
            {/* Mockup of Results */}
            <div className="md:w-1/2 relative">
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
              <div className="relative grid gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-xl transform hover:-translate-y-1 transition-transform duration-300" style={{ opacity: 1 - (i * 0.15), transform: `scale(${1 - (i * 0.05)}) translateY(${i * 10}px)` }}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <div className="font-bold text-white">Green Confirmado</div>
                        <div className="text-sm text-muted-foreground">Man City vs Arsenal • Over 2.5 Goals</div>
                      </div>
                    </div>
                    <div className="text-green-500 font-bold font-mono">+R$ 450,00</div>
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
              Por que escolher a TyltyHub?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Unimos o poder de processamento da IA com a experiência de punters profissionais.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-card border border-white/5 hover:border-primary/30 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Sinais em Tempo Real</h3>
              <p className="text-muted-foreground">
                Receba notificações instantâneas quando nossa IA detecta uma oportunidade de valor no mercado.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-card border border-white/5 hover:border-primary/30 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Curadoria Humana</h3>
              <p className="text-muted-foreground">
                Nenhum sinal é enviado sem a aprovação final de um dos nossos 20 especialistas.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-card border border-white/5 hover:border-primary/30 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Gestão de Banca</h3>
              <p className="text-muted-foreground">
                Ferramentas integradas para você gerenciar seus lucros e controlar seus investimentos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 px-6 border-t border-white/5 bg-gradient-to-b from-background to-black">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white">
            Pronto para elevar seu nível?
          </h2>
          <p className="text-xl text-muted-foreground">
            Junte-se a mais de 10.000 assinantes lucrando diariamente.
          </p>
          <Link href="/auth">
            <Button size="lg" className="h-14 px-12 text-lg bg-primary hover:bg-primary-dark text-white shadow-xl shadow-primary/25 rounded-xl">
              Começar Agora
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
