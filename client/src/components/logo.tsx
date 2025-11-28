interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({ className = "", showText = true, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: 'text-sm', gap: 'gap-2' },
    md: { icon: 32, text: 'text-lg', gap: 'gap-2' },
    lg: { icon: 44, text: 'text-2xl', gap: 'gap-3' },
    xl: { icon: 60, text: 'text-4xl', gap: 'gap-4' },
  }[size];

  return (
    <div className={`flex items-center ${sizes.gap} ${className} select-none`}>
      
      {/* MODERN LOGO - Hexagonal Signal Beacon */}
      <div className="relative" style={{ width: sizes.icon, height: sizes.icon }}>
        <svg 
          width={sizes.icon}
          height={sizes.icon}
          viewBox="0 0 80 80" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_0_12px_rgba(51,184,100,0.6)]"
        >
          <defs>
            {/* Main gradient */}
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="50%" stopColor="#33b864" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
            
            {/* Dark gradient for depth */}
            <linearGradient id="dark-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1a1a1a" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </linearGradient>
            
            {/* Glow filter */}
            <filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            {/* Inner shadow */}
            <filter id="inner-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feOffset dx="0" dy="2" />
              <feGaussianBlur stdDeviation="2" result="shadow" />
              <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff" />
              <feFlood floodColor="#000000" floodOpacity="0.5" />
              <feComposite in2="shadowDiff" operator="in" />
              <feComposite in2="SourceGraphic" operator="over" />
            </filter>
          </defs>
          
          {/* Outer hexagonal ring with glow */}
          <path 
            d="M40 4 L70 20 L70 55 L40 71 L10 55 L10 20 Z" 
            fill="none"
            stroke="url(#logo-gradient)"
            strokeWidth="2.5"
            filter="url(#logo-glow)"
          />
          
          {/* Inner dark hexagon */}
          <path 
            d="M40 10 L64 23 L64 52 L40 65 L16 52 L16 23 Z" 
            fill="url(#dark-gradient)"
            stroke="#33b864"
            strokeWidth="0.5"
            strokeOpacity="0.3"
          />
          
          {/* Central "TS" monogram with signal waves */}
          <g filter="url(#logo-glow)">
            {/* Signal wave arcs - left side */}
            <path 
              d="M22 40 Q22 30, 28 25" 
              stroke="#33b864" 
              strokeWidth="2" 
              strokeLinecap="round"
              fill="none"
              opacity="0.4"
            >
              <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
            </path>
            <path 
              d="M17 40 Q17 26, 26 19" 
              stroke="#33b864" 
              strokeWidth="2" 
              strokeLinecap="round"
              fill="none"
              opacity="0.25"
            >
              <animate attributeName="opacity" values="0.25;0.6;0.25" dur="2s" repeatCount="indefinite" begin="0.3s" />
            </path>
            
            {/* Signal wave arcs - right side */}
            <path 
              d="M58 40 Q58 30, 52 25" 
              stroke="#33b864" 
              strokeWidth="2" 
              strokeLinecap="round"
              fill="none"
              opacity="0.4"
            >
              <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
            </path>
            <path 
              d="M63 40 Q63 26, 54 19" 
              stroke="#33b864" 
              strokeWidth="2" 
              strokeLinecap="round"
              fill="none"
              opacity="0.25"
            >
              <animate attributeName="opacity" values="0.25;0.6;0.25" dur="2s" repeatCount="indefinite" begin="0.3s" />
            </path>
            
            {/* Central beacon/antenna shape */}
            <path 
              d="M40 28 L40 52" 
              stroke="url(#logo-gradient)" 
              strokeWidth="4" 
              strokeLinecap="round"
            />
            
            {/* Horizontal bar (T crossbar) */}
            <path 
              d="M32 32 L48 32" 
              stroke="url(#logo-gradient)" 
              strokeWidth="4" 
              strokeLinecap="round"
            />
            
            {/* Signal dot at top */}
            <circle 
              cx="40" 
              cy="22" 
              r="4" 
              fill="#33b864"
            >
              <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0.6;1" dur="1.5s" repeatCount="indefinite" />
            </circle>
            
            {/* Bottom triangular point */}
            <path 
              d="M36 52 L40 58 L44 52" 
              fill="url(#logo-gradient)"
            />
          </g>
          
          {/* Corner accent dots */}
          <circle cx="40" cy="4" r="1.5" fill="#33b864" opacity="0.6" />
          <circle cx="70" cy="20" r="1.5" fill="#33b864" opacity="0.6" />
          <circle cx="70" cy="55" r="1.5" fill="#33b864" opacity="0.6" />
          <circle cx="40" cy="71" r="1.5" fill="#33b864" opacity="0.6" />
          <circle cx="10" cy="55" r="1.5" fill="#33b864" opacity="0.6" />
          <circle cx="10" cy="20" r="1.5" fill="#33b864" opacity="0.6" />
        </svg>
      </div>

      {/* THE BRAND NAME - TRUE SIGNAL */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span 
            className={`font-black tracking-[0.2em] ${sizes.text}`}
            style={{ 
              fontFamily: 'Sora, sans-serif',
              background: 'linear-gradient(135deg, #4ade80 0%, #33b864 50%, #22c55e 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            TRUE
          </span>
          <span 
            className={`font-black tracking-[0.15em] text-white ${sizes.text}`}
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            SIGNAL
          </span>
        </div>
      )}
    </div>
  );
}
