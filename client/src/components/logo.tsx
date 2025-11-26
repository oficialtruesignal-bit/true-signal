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
      <svg 
        width={width}
        height={height}
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="flex-shrink-0"
      >
        <defs>
          <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path 
          d="M 10 60 L 35 60 Q 45 60 50 70 L 55 80 L 75 20" 
          stroke="#33b864" 
          strokeWidth="12" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          filter="url(#neon-glow)"
        />
        
        <circle cx="85" cy="20" r="6" fill="#33b864" filter="url(#neon-glow)" />
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
