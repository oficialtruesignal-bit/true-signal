import { Link } from "wouter";
import { Construction, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto bg-[#33b864]/10 rounded-full flex items-center justify-center border border-[#33b864]/30 animate-pulse">
            <Construction className="w-12 h-12 text-[#33b864]" />
          </div>
          <div className="absolute -top-2 -right-8 animate-bounce">
            <Sparkles className="w-6 h-6 text-yellow-500" />
          </div>
        </div>

        <h1 
          className="text-3xl font-bold text-white mb-4"
          style={{ fontFamily: 'Sora, sans-serif' }}
        >
          Em Desenvolvimento
        </h1>
        
        <p className="text-gray-400 mb-8 leading-relaxed">
          Estamos trabalhando para trazer essa funcionalidade para você em breve. 
          Fique ligado nas novidades!
        </p>

        <div className="bg-[#121212] border border-[#33b864]/20 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-2 h-2 bg-[#33b864] rounded-full animate-pulse"></div>
            <span className="text-sm text-[#33b864] font-medium">Previsão de lançamento</span>
          </div>
          <p className="text-2xl font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
            Em breve
          </p>
        </div>

        <Link href="/app">
          <Button 
            variant="outline" 
            className="border-[#33b864]/30 text-[#33b864] hover:bg-[#33b864]/10 hover:border-[#33b864]/50"
            data-testid="button-back-home"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Home
          </Button>
        </Link>

      </div>
    </div>
  );
}
