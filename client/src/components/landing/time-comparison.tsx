import { Zap } from 'lucide-react';

export function TimeComparison() {
  return (
    <div className="w-full max-w-3xl mx-auto mt-12 mb-4 lg:mb-0">
      
      <div className="relative bg-[#121212] border border-[#33b864]/20 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center gap-4 shadow-[0_0_40px_rgba(51,184,100,0.05)]">
        
        <div className="flex flex-col items-center text-center relative">
          <div className="absolute -inset-4 bg-[#33b864]/10 blur-xl rounded-full opacity-50 pointer-events-none"></div>
          
          <div className="flex items-center gap-2 mb-2 text-[#33b864]">
            <span className="font-bold text-xs uppercase tracking-wider" style={{ fontFamily: 'Sora, sans-serif' }}>Com TRUE SIGNAL</span>
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <span className="text-3xl md:text-5xl font-black text-white drop-shadow-[0_0_10px_rgba(51,184,100,0.5)]" style={{ fontFamily: 'Sora, sans-serif' }}>
            30 Segundos
          </span>
          <p className="text-xs text-gray-400 mt-2 max-w-[200px]">
            Recebeu a notificação?<br />
            <span className="text-white font-bold">Copiou. Colou.</span>
          </p>
        </div>

      </div>
    </div>
  );
}
