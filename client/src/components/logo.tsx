interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({ className = "", showText = true, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: 'text-sm', gap: 'gap-2' },
    md: { icon: 36, text: 'text-lg', gap: 'gap-2.5' },
    lg: { icon: 48, text: 'text-2xl', gap: 'gap-3' },
    xl: { icon: 64, text: 'text-4xl', gap: 'gap-4' },
  }[size];

  return (
    <div className={`flex items-center ${sizes.gap} ${className} select-none`}>
      
      {/* PULSE PRISM LOGO - Triangular prism refracting truth */}
      <div 
        className="relative flex-shrink-0" 
        style={{ width: sizes.icon, height: sizes.icon }}
      >
        <svg 
          width={sizes.icon}
          height={sizes.icon}
          viewBox="0 0 64 64" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Primary green gradient */}
            <linearGradient id="prism-green" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="50%" stopColor="#33b864" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
            
            {/* Dark face gradient */}
            <linearGradient id="prism-dark" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1a1a1a" />
              <stop offset="100%" stopColor="#0d0d0d" />
            </linearGradient>
            
            {/* Light beam gradient */}
            <linearGradient id="beam-gradient" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#33b864" stopOpacity="0" />
              <stop offset="30%" stopColor="#33b864" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#4ade80" stopOpacity="1" />
              <stop offset="100%" stopColor="#4ade80" stopOpacity="0.6" />
            </linearGradient>
            
            {/* Outer glow */}
            <filter id="prism-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feFlood floodColor="#33b864" floodOpacity="0.4" />
              <feComposite in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            {/* Beam glow */}
            <filter id="beam-glow" x="-20%" y="-100%" width="140%" height="300%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Clip for beam animation */}
            <clipPath id="prism-clip">
              <polygon points="32,6 56,52 8,52" />
            </clipPath>
          </defs>
          
          {/* Background subtle ring */}
          <circle 
            cx="32" 
            cy="32" 
            r="30" 
            fill="none" 
            stroke="#33b864" 
            strokeWidth="0.5" 
            strokeOpacity="0.15"
          />
          
          {/* THE PRISM - 3D triangular shape */}
          {/* Back face (darkest) */}
          <polygon 
            points="32,8 54,50 32,50" 
            fill="#0a0a0a"
            opacity="0.9"
          />
          
          {/* Left face (dark with green edge) */}
          <polygon 
            points="32,8 10,50 32,50" 
            fill="url(#prism-dark)"
            stroke="url(#prism-green)"
            strokeWidth="1"
          />
          
          {/* Right face (shows the refraction) */}
          <polygon 
            points="32,8 54,50 32,50" 
            fill="none"
            stroke="url(#prism-green)"
            strokeWidth="1.5"
            filter="url(#prism-glow)"
          />
          
          {/* Top edge highlight */}
          <line 
            x1="32" y1="8" 
            x2="32" y2="8" 
            stroke="#4ade80" 
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#prism-glow)"
          />
          
          {/* REFRACTED SIGNAL BEAM - The "Truth" emerging */}
          <g filter="url(#beam-glow)">
            {/* Main beam path - stylized check/signal */}
            <path 
              d="M36,28 L42,38 L54,20" 
              stroke="url(#prism-green)" 
              strokeWidth="3" 
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            >
              <animate 
                attributeName="stroke-dasharray" 
                values="0,100;40,100" 
                dur="2s" 
                repeatCount="indefinite"
              />
            </path>
            
            {/* Signal pulse extending from check */}
            <path 
              d="M54,20 L58,24" 
              stroke="#4ade80" 
              strokeWidth="2" 
              strokeLinecap="round"
              opacity="0.8"
            >
              <animate 
                attributeName="opacity" 
                values="0.4;1;0.4" 
                dur="1.5s" 
                repeatCount="indefinite"
              />
            </path>
          </g>
          
          {/* Entry beam (noise entering) - faint */}
          <line 
            x1="6" y1="32" 
            x2="24" y2="32" 
            stroke="#33b864" 
            strokeWidth="1.5"
            strokeOpacity="0.3"
            strokeDasharray="2,3"
          >
            <animate 
              attributeName="stroke-dashoffset" 
              values="0;10" 
              dur="1s" 
              repeatCount="indefinite"
            />
          </line>
          
          {/* Inner prism glow core */}
          <circle 
            cx="32" 
            cy="36" 
            r="4" 
            fill="#33b864"
            opacity="0.3"
          >
            <animate 
              attributeName="r" 
              values="3;5;3" 
              dur="2s" 
              repeatCount="indefinite"
            />
            <animate 
              attributeName="opacity" 
              values="0.2;0.5;0.2" 
              dur="2s" 
              repeatCount="indefinite"
            />
          </circle>
          
          {/* Apex highlight */}
          <circle 
            cx="32" 
            cy="8" 
            r="2" 
            fill="#4ade80"
          >
            <animate 
              attributeName="opacity" 
              values="0.8;1;0.8" 
              dur="1.5s" 
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </div>

      {/* BRAND NAME */}
      {showText && (
        <div className="flex flex-col leading-[0.85]">
          <span 
            className={`font-black tracking-[0.25em] ${sizes.text}`}
            style={{ 
              fontFamily: 'Sora, sans-serif',
              background: 'linear-gradient(90deg, #4ade80 0%, #33b864 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            TRUE
          </span>
          <span 
            className={`font-black tracking-[0.12em] text-white/90 ${sizes.text}`}
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            SIGNAL
          </span>
        </div>
      )}
    </div>
  );
}
