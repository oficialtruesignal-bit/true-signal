import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle2, Crown, Sparkles, ArrowRight, Ticket, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function ThankYouPage() {
  const [, setLocation] = useLocation();
  const { user, reloadProfile } = useAuth();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Refresh user data to get updated subscription status
    reloadProfile?.();
    
    // Hide confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#33b864]/10 via-transparent to-[#33b864]/5" />
      
      {/* Animated circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#33b864]/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#33b864]/5 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            >
              <Sparkles className="w-4 h-4 text-[#33b864]" style={{ opacity: Math.random() }} />
            </div>
          ))}
        </div>
      )}

      {/* Main Card */}
      <div className="relative z-10 max-w-lg w-full" data-testid="thank-you-card">
        <div className="bg-[#121212] border-2 border-[#33b864]/50 rounded-3xl p-8 md:p-12 text-center shadow-2xl shadow-[#33b864]/20">
          
          {/* Success Icon */}
          <div className="relative mx-auto w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-[#33b864]/20 rounded-full animate-ping" />
            <div className="relative w-full h-full bg-gradient-to-br from-[#33b864] to-[#289a54] rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-black" />
            </div>
          </div>

          {/* Crown Badge */}
          <div className="inline-flex items-center gap-2 bg-[#33b864]/10 border border-[#33b864]/30 rounded-full px-4 py-2 mb-6">
            <Crown className="w-5 h-5 text-[#33b864]" />
            <span className="text-[#33b864] font-bold text-sm uppercase tracking-wider">Vantage Prime</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
            Bem-vindo ao Prime! 🎉
          </h1>

          {/* Subtitle */}
          <p className="text-gray-400 text-lg mb-8">
            Seu pagamento foi confirmado com sucesso. Agora você tem acesso a <span className="text-[#33b864] font-semibold">todos os bilhetes</span> por 30 dias!
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-1 gap-3 mb-8">
            <div className="flex items-center gap-3 bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="p-2 bg-[#33b864]/10 rounded-lg">
                <Ticket className="w-5 h-5 text-[#33b864]" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Bilhetes Ilimitados</p>
                <p className="text-gray-500 text-sm">Acesso a todos os sinais premium</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="p-2 bg-[#33b864]/10 rounded-lg">
                <Shield className="w-5 h-5 text-[#33b864]" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Análises Validadas</p>
                <p className="text-gray-500 text-sm">Por especialistas + IA de alta performance</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="p-2 bg-[#33b864]/10 rounded-lg">
                <Zap className="w-5 h-5 text-[#33b864]" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Notificações em Tempo Real</p>
                <p className="text-gray-500 text-sm">Receba novos sinais instantaneamente</p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={() => setLocation('/tips')}
            className="w-full h-14 bg-[#33b864] hover:bg-[#289a54] text-black font-bold text-lg rounded-xl gap-2 shadow-lg shadow-[#33b864]/30 transition-all hover:scale-[1.02]"
            data-testid="button-go-to-tips"
          >
            Ver Bilhetes Premium
            <ArrowRight className="w-5 h-5" />
          </Button>

          {/* User Email */}
          {user?.email && (
            <p className="mt-6 text-gray-500 text-sm">
              Assinatura ativa para: <span className="text-gray-400">{user.email}</span>
            </p>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-center text-gray-600 text-xs mt-6">
          Um email de confirmação foi enviado para você. <br />
          Dúvidas? Fale conosco pelo WhatsApp.
        </p>
      </div>
    </div>
  );
}
