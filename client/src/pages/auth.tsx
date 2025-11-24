import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trophy, ArrowRight, Lock, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setLocation("/app");
    }, 1500);
  };

  const handleResetPassword = () => {
    toast({
      title: "Email enviado!",
      description: `Enviamos um link de recuperação para ${resetEmail}`,
      className: "bg-card border-primary/20 text-white",
    });
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[128px]" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 mb-4 shadow-[0_0_20px_rgba(51,184,100,0.2)]">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            Bem-vindo ao <span className="text-primary">Tipster Hub</span>
          </h1>
          <p className="text-muted-foreground">
            Acesse a inteligência premium de apostas esportivas.
          </p>
        </div>

        <div className="bg-[#121212] border border-primary/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            
          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  className="pl-10 bg-black/40 border-primary/20 text-white focus-visible:ring-primary h-11 focus-visible:border-primary/50"
                  required 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white/80">Senha</Label>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <button type="button" className="text-xs text-primary hover:text-primary-dark transition-colors font-medium">
                      Esqueceu a senha?
                    </button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#121212] border-primary/20 text-white">
                    <DialogHeader>
                      <DialogTitle>Recuperar Senha</DialogTitle>
                      <DialogDescription className="text-muted-foreground">
                        Digite seu email para receber o link de redefinição.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="reset-email">Email</Label>
                        <Input 
                          id="reset-email" 
                          placeholder="seu@email.com" 
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className="bg-black/40 border-primary/20 text-white focus-visible:ring-primary"
                        />
                      </div>
                      <Button onClick={handleResetPassword} className="w-full bg-primary hover:bg-primary-dark text-black font-bold">
                        Enviar Link
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 bg-black/40 border-primary/20 text-white focus-visible:ring-primary h-11 focus-visible:border-primary/50"
                  required 
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-primary hover:bg-primary-dark text-black font-bold transition-all duration-300 shadow-[0_0_20px_rgba(51,184,100,0.3)] hover:shadow-[0_0_30px_rgba(51,184,100,0.5)] border border-primary/50"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Entrar na Plataforma <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center relative z-10">
            <p className="text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <a href="#" className="text-primary font-bold hover:underline decoration-primary underline-offset-4">
                Solicitar Acesso
              </a>
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground/50">
            © 2025 Tipster Hub. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
