import { ReactNode } from 'react';

interface NeonCardProps {
  children: ReactNode;
  className?: string;
  intensity?: 'low' | 'high';
}

export function NeonCard({ children, className = "", intensity = 'high' }: NeonCardProps) {
  return (
    <div className={`relative group overflow-hidden rounded-2xl p-[1px] ${className}`}>
      
      {/* O MOTOR DE LUZ (O Gradiente que Gira no Hover) */}
      <div className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#121212_40%,#33b864_50%,#121212_60%,#000000_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Se intensity for 'high', o brilho é constante (sempre visível) */}
      {intensity === 'high' && (
         <div className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#000000_40%,#33b864_50%,#000000_60%,#000000_100%)] opacity-60" />
      )}

      {/* O CONTEÚDO (Fundo Preto por cima da Luz) */}
      <div className="relative h-full w-full bg-[#0a0a0a] rounded-2xl border border-[#33b864]/10 backdrop-blur-xl p-4 flex flex-col justify-center">
        
        {/* Brilho Ambiental Interno (Glow) */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-[#33b864] rounded-full blur-[60px] opacity-10"></div>
        
        {children}
      </div>
    </div>
  );
}
