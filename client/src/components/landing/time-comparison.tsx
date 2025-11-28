import { Clock, Zap, ArrowRight } from 'lucide-react';

export function TimeComparison() {
  return (
    <div className="w-full max-w-3xl mx-auto mt-12 mb-4 lg:mb-0">
      
      <h3 className="text-center text-gray-400 text-sm uppercase tracking-widest mb-6 font-semibold" style={{ fontFamily: 'Sora, sans-serif' }}>
        A MATEMÁTICA DA EFICIÊNCIA
      </h3>

      <div className="relative bg-[#121212] border border-[#33b864]/20 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_40px_rgba(51,184,100,0.05)]">
        
        <div className="flex flex-col items-center md:items-start text-center md:text-left opacity-50 grayscale transition-all hover:grayscale-0 hover:opacity-80">
          <div className="flex items-center gap-2 mb-2 text-red-500">
            <Clock className="w-5 h-5" />
            <span className="font-bold text-xs uppercase tracking-wider" style={{ fontFamily: 'Sora, sans-serif' }}>Jeito Amador</span>
          </div>
          <span className="text-2xl md:text-3xl font-bold text-gray-300 line-through decoration-red-500/50 decoration-2" style={{ fontFamily: 'Sora, sans-serif' }}>
            4 Horas / dia
          </span>
          <p className="text-xs text-gray-500 mt-1 max-w-[200px]">
            Analisando tabelas, lendo notícias e sofrendo com dúvidas.
          </p>
        </div>

        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#33b864]/10 border border-[#33b864]/30 text-[#33b864] animate-pulse">
          <ArrowRight className="w-6 h-6" />
        </div>

        <div className="flex flex-col items-center md:items-end text-center md:text-right relative">
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
