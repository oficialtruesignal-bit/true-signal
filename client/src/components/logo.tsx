interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({ className = "", showText = true, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { h: 'h-6', w: 'w-8', text: 'text-base', gap: 'gap-2' },
    md: { h: 'h-8', w: 'w-12', text: 'text-xl', gap: 'gap-2' },
    lg: { h: 'h-10', w: 'w-14', text: 'text-2xl', gap: 'gap-3' },
    xl: { h: 'h-14', w: 'w-20', text: 'text-4xl', gap: 'gap-4' },
  }[size];

  return (
    <div className={`flex items-center ${sizes.gap} ${className} select-none`}>
      
      {/* THE "VERIFIED PULSE" ICON */}
      {/* Concept: A stylized Check (✓) where the long leg transforms into a heartbeat/digital signal line */}
      <svg 
        className={`${sizes.h} ${sizes.w} flex-shrink-0`} 
        viewBox="0 0 120 60" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="pulse-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#33b864" stopOpacity="1" />
            <stop offset="100%" stopColor="#2dd970" stopOpacity="1" />
          </linearGradient>
          <filter id="pulse-glow" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* The Verified Pulse Path:
            - Starts descending (short leg of check)
            - Goes up to form the check peak
            - Continues horizontally with a signal pulse
        */}
        <path 
          d="M5 35 L20 50 L45 15 L55 35 L65 25 L75 35 L85 30 L95 35 L105 32 L115 35" 
          stroke="url(#pulse-gradient)" 
          strokeWidth="6" 
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter="url(#pulse-glow)"
        />
        
        {/* Subtle animated dot at the end (signal alive indicator) */}
        <circle 
          cx="115" 
          cy="35" 
          r="4" 
          fill="#33b864"
          filter="url(#pulse-glow)"
        >
          <animate 
            attributeName="opacity" 
            values="1;0.4;1" 
            dur="1.5s" 
            repeatCount="indefinite" 
          />
        </circle>
      </svg>

      {/* THE BRAND NAME - TRUE SIGNAL */}
      {showText && (
        <span 
          className={`font-black text-white tracking-wide ${sizes.text}`}
          style={{ fontFamily: 'Sora, sans-serif' }}
        >
          TRUE<span className="text-white"> SIGNAL</span>
        </span>
      )}
    </div>
  );
}
