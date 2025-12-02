import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Lock, Mail, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/logo";
import { Link } from "wouter";
import { analytics } from "@/lib/analytics";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Validation Schemas
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  acceptTerms: z.union([z.boolean(), z.string()]).transform((val) => val === true || val === "on").refine((val) => val === true, {
    message: "Você precisa aceitar os termos para continuar",
  }),
});

export default function AuthPage() {
  const searchParams = new URLSearchParams(window.location.search);
  const mode = searchParams.get('mode');
  const [isLogin, setIsLogin] = useState(mode !== 'register');
  const { login, register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  // Forms
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });

  const handleLoginSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      analytics.trackLogin();
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (data: z.infer<typeof registerSchema>) => {
    setIsLoading(true);
    try {
      await register(data.name, data.email, data.password);
      analytics.trackRegistration(data.email);
      analytics.trackTrialStart();
    } catch (error) {
      toast.error("Erro ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = () => {
    if (!resetEmail || !resetEmail.includes('@')) {
      toast.error("Digite um email válido");
      return;
    }
    toast.success(`Enviamos um link de recuperação para ${resetEmail}`);
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[128px]" />

      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8 space-y-4">
          <div className="flex justify-center mb-6">
            <Logo size="lg" showText={true} />
          </div>
          <h2 className="text-xl font-medium text-muted-foreground">
            {isLogin ? "Acesse a plataforma de sinais premium." : "Crie sua conta gratuita."}
          </h2>
        </div>

        <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-primary/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            
          {isLogin ? (
            /* LOGIN FORM */
            <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-900 dark:text-white/80">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    {...loginForm.register("email")}
                    placeholder="seu@email.com" 
                    className="pl-10 h-11"
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <span className="text-xs text-red-500">{loginForm.formState.errors.email.message}</span>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-900 dark:text-white/80">Senha</Label>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <button type="button" className="text-xs text-primary hover:text-primary-dark transition-colors font-medium">
                        Esqueceu a senha?
                      </button>
                    </DialogTrigger>
                    <DialogContent>
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
                          />
                        </div>
                        <Button onClick={handleResetPassword} className="w-full bg-primary hover:bg-primary-dark text-primary-foreground font-bold">
                          Enviar Link
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="password"
                    {...loginForm.register("password")}
                    placeholder="••••••••" 
                    className="pl-10 h-11"
                  />
                </div>
                {loginForm.formState.errors.password && (
                  <span className="text-xs text-red-500">{loginForm.formState.errors.password.message}</span>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-primary hover:bg-primary-dark text-primary-foreground font-bold btn-glow border border-primary/50"
                disabled={isLoading}
              >
                {isLoading ? (
                   <Loader2 className="w-5 h-5 animate-spin text-primary-foreground" />
                ) : (
                  <>
                    Entrar na Plataforma <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-900 dark:text-white/80">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    {...registerForm.register("name")}
                    placeholder="Seu nome" 
                    className="pl-10 h-11"
                  />
                </div>
                {registerForm.formState.errors.name && (
                  <span className="text-xs text-red-500">{registerForm.formState.errors.name.message}</span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email" className="text-slate-900 dark:text-white/80">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    {...registerForm.register("email")}
                    placeholder="seu@email.com" 
                    className="pl-10 h-11"
                  />
                </div>
                {registerForm.formState.errors.email && (
                  <span className="text-xs text-red-500">{registerForm.formState.errors.email.message}</span>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-password" className="text-slate-900 dark:text-white/80">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="password"
                    {...registerForm.register("password")}
                    placeholder="••••••••" 
                    className="pl-10 h-11"
                  />
                </div>
                {registerForm.formState.errors.password && (
                  <span className="text-xs text-red-500">{registerForm.formState.errors.password.message}</span>
                )}
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="terms"
                  {...registerForm.register("acceptTerms")}
                  className="mt-0.5"
                  data-testid="checkbox-terms"
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                >
                  Li e aceito os{" "}
                  <Link href="/terms" className="text-primary hover:underline font-medium">
                    Termos de Uso
                  </Link>
                  ,{" "}
                  <Link href="/privacy" className="text-primary hover:underline font-medium">
                    Política de Privacidade
                  </Link>
                  {" "}e{" "}
                  <Link href="/risk-disclaimer" className="text-primary hover:underline font-medium">
                    Aviso de Risco
                  </Link>
                  .
                </label>
              </div>
              {registerForm.formState.errors.acceptTerms && (
                <span className="text-xs text-red-500">{registerForm.formState.errors.acceptTerms.message}</span>
              )}

              <Button 
                type="submit" 
                className="w-full h-11 bg-primary hover:bg-primary-dark text-primary-foreground font-bold btn-glow border border-primary/50"
                disabled={isLoading}
              >
                {isLoading ? (
                   <Loader2 className="w-5 h-5 animate-spin text-primary-foreground" />
                ) : (
                  <>
                    Criar Conta Grátis <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center relative z-10">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-bold hover:underline decoration-primary underline-offset-4"
              >
                {isLogin ? "Criar Conta" : "Fazer Login"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
