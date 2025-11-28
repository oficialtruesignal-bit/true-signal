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
        {/* Signal Monolith Logo - Animated */}
        <motion.svg
          width={100}
          height={120}
          viewBox="0 0 40 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: [0.9, 1, 0.9],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <defs>
            <linearGradient id="loading-monolith-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#33b864" />
            </linearGradient>
            <filter id="loading-monolith-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          {/* Shield monolith shape */}
          <motion.path 
            d="M4 6 L4 32 Q4 40 20 46 Q36 40 36 32 L36 6 Q36 2 32 2 L8 2 Q4 2 4 6 Z" 
            fill="none"
            stroke="url(#loading-monolith-gradient)"
            strokeWidth="2.5"
            filter="url(#loading-monolith-glow)"
            animate={{ strokeOpacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Precision pulse/signal line cutting through */}
          <motion.path 
            d="M8 24 L14 24 L17 18 L20 30 L23 22 L26 26 L32 26" 
            stroke="#33b864" 
            strokeWidth="2.5" 
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Active signal dot */}
          <motion.circle 
            cx="32" 
            cy="26" 
            r="3" 
            fill="#33b864"
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.svg>

        {/* Brand Text */}
        <motion.div
          className="flex items-baseline gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.span
            className="font-semibold tracking-tight text-white/70 text-3xl"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            TRUE
          </motion.span>
          <motion.span
            className="font-bold tracking-tight text-white text-3xl"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            animate={{
              textShadow: [
                '0 0 10px rgba(51, 184, 100, 0.3)',
                '0 0 20px rgba(51, 184, 100, 0.6)',
                '0 0 10px rgba(51, 184, 100, 0.3)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            SIGNAL
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
