interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({ className = "", showText = true, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { icon: 20, text: 'text-sm', gap: 'gap-1.5' },
    md: { icon: 26, text: 'text-base', gap: 'gap-2' },
    lg: { icon: 34, text: 'text-xl', gap: 'gap-2.5' },
    xl: { icon: 48, text: 'text-3xl', gap: 'gap-3' },
  }[size];

  return (
    <div className={`flex items-center ${sizes.gap} ${className} select-none`}>
      
      {/* SIGNAL MONOLITH - Minimal shield with pulse cut */}
      <div className="relative flex-shrink-0" style={{ width: sizes.icon, height: sizes.icon * 1.2 }}>
        <svg 
          width={sizes.icon}
          height={sizes.icon * 1.2}
          viewBox="0 0 40 48" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="monolith-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#33b864" />
            </linearGradient>
            <filter id="monolith-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          {/* Shield monolith shape */}
          <path 
            d="M4 6 L4 32 Q4 40 20 46 Q36 40 36 32 L36 6 Q36 2 32 2 L8 2 Q4 2 4 6 Z" 
            fill="none"
            stroke="url(#monolith-gradient)"
            strokeWidth="2.5"
            filter="url(#monolith-glow)"
          />
          
          {/* Precision pulse/signal line cutting through */}
          <path 
            d="M8 24 L14 24 L17 18 L20 30 L23 22 L26 26 L32 26" 
            stroke="#33b864" 
            strokeWidth="2.5" 
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            <animate 
              attributeName="stroke-dasharray" 
              values="0,100;50,100" 
              dur="2s" 
              repeatCount="indefinite"
            />
          </path>
          
          {/* Active signal dot */}
          <circle cx="32" cy="26" r="2" fill="#33b864">
            <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>

      {/* WORDMARK */}
      {showText && (
        <div className="flex items-baseline gap-1">
          <span 
            className={`font-semibold tracking-tight text-white/70 ${sizes.text}`}
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            TRUE
          </span>
          <span 
            className={`font-bold tracking-tight text-white ${sizes.text}`}
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            SIGNAL
          </span>
        </div>
      )}
    </div>
  );
}
