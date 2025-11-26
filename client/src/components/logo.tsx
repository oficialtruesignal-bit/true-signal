interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = "", showText = true, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { width: 32, height: 32, text: 'text-base' },
    md: { width: 48, height: 48, text: 'text-xl' },
    lg: { width: 64, height: 64, text: 'text-3xl' },
  };

  const { width, height, text } = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Ocean Signal Logo - Hexagonal Radar Badge */}
      <svg
        width={width}
        height={height}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <defs>
          {/* Glow Filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          {/* Gradient */}
          <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#33b864" stopOpacity="1" />
            <stop offset="100%" stopColor="#2ea558" stopOpacity="1" />
          </linearGradient>
        </defs>
        
        {/* Background Hexagon (dark) */}
        <path
          d="M32 4 L54 16 L54 40 L32 52 L10 40 L10 16 Z"
          fill="rgba(10, 10, 10, 0.9)"
          stroke="#33b864"
          strokeWidth="1.5"
          strokeOpacity="0.3"
        />
        
        {/* Inner Hexagon */}
        <path
          d="M32 10 L48 20 L48 36 L32 46 L16 36 L16 20 Z"
          fill="none"
          stroke="url(#oceanGradient)"
          strokeWidth="1.5"
          opacity="0.5"
        />
        
        {/* Radar Waves (3 concentric circles) */}
        <circle
          cx="32"
          cy="28"
          r="4"
          fill="none"
          stroke="#33b864"
          strokeWidth="1.5"
          opacity="0.8"
          filter="url(#glow)"
        />
        <circle
          cx="32"
          cy="28"
          r="8"
          fill="none"
          stroke="#33b864"
          strokeWidth="1"
          opacity="0.4"
        />
        <circle
          cx="32"
          cy="28"
          r="12"
          fill="none"
          stroke="#33b864"
          strokeWidth="0.5"
          opacity="0.2"
        />
        
        {/* Center Signal Dot */}
        <circle
          cx="32"
          cy="28"
          r="2"
          fill="#33b864"
          filter="url(#glow)"
        />
        
        {/* Signal Wave Line (ascending) */}
        <path
          d="M 20 38 Q 26 34, 32 28 T 44 20"
          stroke="#33b864"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          filter="url(#glow)"
        />
        
        {/* Corner Accents (tech lines) */}
        <line x1="12" y1="18" x2="16" y2="20" stroke="#33b864" strokeWidth="1" opacity="0.6" />
        <line x1="52" y1="18" x2="48" y2="20" stroke="#33b864" strokeWidth="1" opacity="0.6" />
        <line x1="12" y1="38" x2="16" y2="36" stroke="#33b864" strokeWidth="1" opacity="0.6" />
        <line x1="52" y1="38" x2="48" y2="36" stroke="#33b864" strokeWidth="1" opacity="0.6" />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-black tracking-tight text-[#33b864] ${text}`} style={{ fontFamily: 'Sora, sans-serif' }}>
            OCEAN
          </span>
          <span className={`font-bold tracking-wider text-gray-400 ${size === 'sm' ? 'text-[10px]' : size === 'md' ? 'text-xs' : 'text-sm'}`} style={{ fontFamily: 'Sora, sans-serif', letterSpacing: '0.15em' }}>
            SIGNAL
          </span>
        </div>
      )}
    </div>
  );
}
