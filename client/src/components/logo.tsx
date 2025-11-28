interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({ className = "", showText = true, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { h: 'h-6', w: 'w-6', text: 'text-lg' },
    md: { h: 'h-8', w: 'w-8', text: 'text-2xl' },
    lg: { h: 'h-12', w: 'w-12', text: 'text-4xl' },
    xl: { h: 'h-16', w: 'w-16', text: 'text-5xl' },
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className} select-none`}>
      
      {/* O SÍMBOLO "DIAMOND V-SHIELD" */}
      <svg 
        className={`${sizes.h} ${sizes.w} text-[#33b864] flex-shrink-0`} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="shield-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#33b864" stopOpacity="1" />
            <stop offset="100%" stopColor="#2a9d54" stopOpacity="0.8" />
          </linearGradient>
          <filter id="shield-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Caminho externo (O Escudo/Diamante) */}
        <path 
          d="M50 5L85 25V75L50 95L15 75V25L50 5Z" 
          stroke="url(#shield-gradient)" 
          strokeWidth="6" 
          strokeLinejoin="round"
          fill="none"
          filter="url(#shield-glow)"
        />
        
        {/* Faceta superior esquerda (volume 3D) */}
        <path 
          d="M50 5L15 25V40L50 20L85 40V25L50 5Z" 
          fill="#33b864"
          fillOpacity="0.15"
        />
        
        {/* O V Interno (O "Core") */}
        <path 
          d="M30 38L50 68L70 38" 
          stroke="currentColor" 
          strokeWidth="7" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          filter="url(#shield-glow)"
        />
        
        {/* O Ponto de Poder (topo) */}
        <circle cx="50" cy="22" r="4" fill="currentColor" filter="url(#shield-glow)" />
      </svg>

      {/* O NOME */}
      {showText && (
        <span 
          className={`font-extrabold text-white tracking-[0.2em] ${sizes.text}`}
          style={{ fontFamily: 'Sora, sans-serif' }}
        >
          VANTAGE
        </span>
      )}
    </div>
  );
}
