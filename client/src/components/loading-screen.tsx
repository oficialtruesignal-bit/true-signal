import { motion } from 'framer-motion';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center overflow-hidden">
      {/* Background Gradient Glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-[#33b864]/20 via-black to-black"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Animated Logo */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Hexagonal Radar Badge - Animated */}
        <motion.svg
          width={120}
          height={120}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: [0.8, 1, 0.8],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <defs>
            {/* Animated Glow Filter */}
            <filter id="loadingGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            {/* Gradient */}
            <linearGradient id="oceanGradientLoading" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#33b864" stopOpacity="1" />
              <stop offset="100%" stopColor="#2ea558" stopOpacity="1" />
            </linearGradient>
          </defs>
          
          {/* Background Hexagon */}
          <motion.path
            d="M32 4 L54 16 L54 40 L32 52 L10 40 L10 16 Z"
            fill="rgba(10, 10, 10, 0.9)"
            stroke="#33b864"
            strokeWidth="1.5"
            initial={{ strokeOpacity: 0.3 }}
            animate={{ strokeOpacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Inner Hexagon */}
          <motion.path
            d="M32 10 L48 20 L48 36 L32 46 L16 36 L16 20 Z"
            fill="none"
            stroke="url(#oceanGradientLoading)"
            strokeWidth="1.5"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          
          {/* Radar Waves - Pulsing */}
          <motion.circle
            cx="32"
            cy="28"
            r="4"
            fill="none"
            stroke="#33b864"
            strokeWidth="1.5"
            filter="url(#loadingGlow)"
            initial={{ opacity: 0 }}
            animate={{ 
              r: [4, 12, 4],
              opacity: [0.8, 0, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
          <motion.circle
            cx="32"
            cy="28"
            r="8"
            fill="none"
            stroke="#33b864"
            strokeWidth="1"
            initial={{ opacity: 0 }}
            animate={{ 
              r: [8, 16, 8],
              opacity: [0.4, 0, 0.4],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.3,
            }}
          />
          <motion.circle
            cx="32"
            cy="28"
            r="12"
            fill="none"
            stroke="#33b864"
            strokeWidth="0.5"
            initial={{ opacity: 0 }}
            animate={{ 
              r: [12, 20, 12],
              opacity: [0.2, 0, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.6,
            }}
          />
          
          {/* Center Signal Dot - Pulsing */}
          <motion.circle
            cx="32"
            cy="28"
            r="2"
            fill="#33b864"
            filter="url(#loadingGlow)"
            animate={{
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
          />
          
          {/* Signal Wave Line */}
          <motion.path
            d="M 20 38 Q 26 34, 32 28 T 44 20"
            stroke="#33b864"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            filter="url(#loadingGlow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Corner Accents - Blinking */}
          <motion.line
            x1="12" y1="18" x2="16" y2="20"
            stroke="#33b864"
            strokeWidth="1"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
          />
          <motion.line
            x1="52" y1="18" x2="48" y2="20"
            stroke="#33b864"
            strokeWidth="1"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
          <motion.line
            x1="12" y1="38" x2="16" y2="36"
            stroke="#33b864"
            strokeWidth="1"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
          />
          <motion.line
            x1="52" y1="38" x2="48" y2="36"
            stroke="#33b864"
            strokeWidth="1"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.9 }}
          />
        </motion.svg>

        {/* Brand Text */}
        <motion.div
          className="flex flex-col items-center leading-none gap-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.span
            className="font-extrabold tracking-[0.2em] text-white text-4xl"
            style={{ fontFamily: 'Sora, sans-serif' }}
            animate={{
              textShadow: [
                '0 0 10px rgba(51, 184, 100, 0.5)',
                '0 0 20px rgba(51, 184, 100, 0.8)',
                '0 0 10px rgba(51, 184, 100, 0.5)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            VANTAGE
          </motion.span>
        </motion.div>

        {/* Loading Dots */}
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-[#33b864] rounded-full"
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>

        {/* Loading Text */}
        <motion.p
          className="text-gray-500 text-sm font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        >
          Carregando plataforma...
        </motion.p>
      </div>

      {/* Radial Pulse Effect */}
      <motion.div
        className="absolute inset-0 bg-[#33b864]/10 rounded-full blur-[100px]"
        style={{
          width: '400px',
          height: '400px',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
