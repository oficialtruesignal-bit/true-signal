import { motion } from 'framer-motion';

const results = [
  'LUCRO HOJE: +12%',
  'GREEN ARSENAL ✅',
  'GREEN FLAMENGO ✅',
  'ROI MENSAL: 102%',
  'GREEN BARCELONA ✅',
  '+R$ 15.420 ESTA SEMANA',
  'ASSERTIVIDADE: 83%',
  'GREEN REAL MADRID ✅',
];

export function InfiniteMarquee() {
  return (
    <div className="relative w-full overflow-hidden bg-[#33b864]/10 border-y border-[#33b864]/30 py-4">
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{
          x: [0, -1920],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: 30,
            ease: 'linear',
          },
        }}
      >
        {[...results, ...results, ...results].map((result, i) => (
          <span
            key={i}
            className="text-lg font-bold text-[#33b864] font-sora tracking-wider"
          >
            {result}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
