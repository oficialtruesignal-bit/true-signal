import { motion } from 'framer-motion';

const tickerData = [
  { label: '[LIVE] PREMIER LEAGUE', value: 'OVER 2.5 DETECTADO', confidence: '94%' },
  { label: 'LUCRO ÚLTIMA HORA', value: '+4.2u', type: 'profit' },
  { label: 'SAQUE APROVADO', value: 'R$ 4.200 (M. SILVA)', type: 'withdrawal' },
  { label: 'LA LIGA', value: 'BTTS CONFIRMADO', confidence: '91%' },
  { label: 'ROI SEMANAL', value: '+18.7%', type: 'roi' },
  { label: 'BUNDESLIGA', value: 'UNDER 3.5 @1.85', confidence: '88%' },
  { label: 'OPERAÇÃO EXECUTADA', value: 'R$ 2.850 (L. COSTA)', type: 'withdrawal' },
];

export function FinancialTicker() {
  return (
    <div className="relative w-full overflow-hidden bg-black/60 backdrop-blur-xl border-y border-[#33b864]/20 py-3">
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{
          x: [0, -2400],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: 40,
            ease: 'linear',
          },
        }}
      >
        {[...tickerData, ...tickerData, ...tickerData, ...tickerData].map((item, i) => (
          <div key={i} className="flex items-center gap-3 text-sm font-mono">
            <span className="text-gray-400">{item.label}</span>
            <span 
              className={`font-bold ${
                item.type === 'profit' || item.type === 'roi' 
                  ? 'text-[#33b864]' 
                  : item.type === 'withdrawal'
                  ? 'text-blue-400'
                  : 'text-white'
              }`}
            >
              {item.value}
            </span>
            {item.confidence && (
              <span className="text-xs text-[#33b864]/70">({item.confidence} CONFIDENCE)</span>
            )}
            <span className="text-gray-600">•</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
