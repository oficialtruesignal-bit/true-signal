interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = "", showText = true, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { width: 24, height: 24, text: 'text-lg' },
    md: { width: 32, height: 32, text: 'text-xl' },
    lg: { width: 48, height: 48, text: 'text-3xl' },
  };

  const { width, height, text } = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Ocean Wave SVG - A Digital Wave Rising */}
      <svg
        width={width}
        height={height}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* The Wave Path: Starts left, dips down, then rises sharply at 45° */}
        <path
          d="M 2 16 Q 8 22, 14 16 T 30 4"
          stroke="#33b864"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="drop-shadow-[0_0_8px_rgba(51,184,100,0.6)]"
        />
        {/* Accent dot at the peak (signal point) */}
        <circle
          cx="30"
          cy="4"
          r="2"
          fill="#33b864"
          className="drop-shadow-[0_0_6px_rgba(51,184,100,0.8)]"
        />
      </svg>

      {showText && (
        <span className={`font-display font-bold tracking-tight text-slate-900 dark:text-white ${text}`}>
          OCEAN SIGNAL
        </span>
      )}
    </div>
  );
}
