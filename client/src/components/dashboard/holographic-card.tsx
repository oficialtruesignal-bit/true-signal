import { ReactNode } from 'react';

interface HolographicCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: ReactNode;
  color: 'green' | 'orange' | 'white';
}

export function HolographicCard({ label, value, subValue, icon, color }: HolographicCardProps) {
  
  const theme = {
    green: {
      border: 'border-[#33b864]/30',
      bg: 'from-[#33b864]/10 to-transparent',
      text: 'text-[#33b864]',
      glow: 'shadow-[0_0_20px_rgba(51,184,100,0.1)]',
      iconColor: 'text-[#33b864]',
      barColor: 'bg-[#33b864]'
    },
    orange: {
      border: 'border-orange-500/30',
      bg: 'from-orange-500/10 to-transparent',
      text: 'text-white',
      glow: 'shadow-[0_0_20px_rgba(249,115,22,0.1)]',
      iconColor: 'text-orange-500',
      barColor: 'bg-orange-500'
    },
    white: {
      border: 'border-gray-500/30',
      bg: 'from-gray-500/10 to-transparent',
      text: 'text-white',
      glow: 'shadow-[0_0_20px_rgba(156,163,175,0.1)]',
      iconColor: 'text-gray-400',
      barColor: 'bg-gray-400'
    }
  }[color];

  return (
    <div className={`relative flex-1 overflow-hidden rounded-2xl border ${theme.border} bg-gradient-to-br ${theme.bg} p-4 backdrop-blur-md transition-all hover:scale-[1.02] ${theme.glow} group min-h-[90px]`}>
      
      {/* MARCA D'ÁGUA (ÍCONE GIGANTE NO FUNDO) */}
      <div className={`absolute -right-4 -bottom-4 opacity-10 transform rotate-[-15deg] scale-[2.5] transition-transform group-hover:scale-[3] ${theme.iconColor}`}>
        {icon}
      </div>

      {/* CONTEÚDO (FRONTAL) */}
      <div className="relative z-10 flex flex-col justify-center h-full">
        
        {/* Label com linha decorativa */}
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-1 h-3 rounded-full ${theme.barColor}`}></div>
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{label}</span>
        </div>

        {/* Valor Principal */}
        <span className={`text-3xl font-sora font-extrabold ${theme.text} drop-shadow-sm`}>
          {value}
        </span>

        {/* Sub-valor (Opcional) */}
        {subValue && (
          <span className="text-[10px] text-gray-500 font-mono mt-1 opacity-80">
            {subValue}
          </span>
        )}
      </div>

      {/* EFEITO DE BRILHO NO HOVER (OVERLAY) */}
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    </div>
  );
}
