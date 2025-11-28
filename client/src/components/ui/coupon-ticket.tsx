import { motion } from 'framer-motion';
import { Ticket, Scissors, Copy, Check, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CouponTicketProps {
  code: string;
  discount: string;
  description?: string;
  validUntil?: string;
  onApply?: (code: string) => void;
}

export function CouponTicket({ 
  code, 
  discount, 
  description = "em qualquer plano",
  validUntil,
  onApply 
}: CouponTicketProps) {
  const [copied, setCopied] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Cupom copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    setIsApplied(true);
    onApply?.(code);
    toast.success(`Cupom ${code} aplicado com sucesso!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotateX: -10 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="relative max-w-md mx-auto"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#33b864]/30 via-[#33b864]/20 to-[#33b864]/30 rounded-2xl blur-xl opacity-60" />
      
      {/* Main ticket container */}
      <div className="relative flex">
        {/* Left side - Discount badge */}
        <div className="relative bg-gradient-to-br from-[#33b864] via-[#2ea558] to-[#259b4a] rounded-l-2xl p-6 flex flex-col items-center justify-center min-w-[120px]">
          {/* Decorative circles (ticket holes) */}
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-black rounded-full" />
          <div className="absolute -right-3 top-4 w-3 h-3 bg-black/50 rounded-full" />
          <div className="absolute -right-3 bottom-4 w-3 h-3 bg-black/50 rounded-full" />
          
          {/* Vertical text */}
          <div className="flex flex-col items-center">
            <Ticket className="w-8 h-8 text-black/80 mb-2 rotate-90" />
            <span 
              className="text-black font-black text-lg tracking-wider"
              style={{ 
                writingMode: 'vertical-rl', 
                textOrientation: 'mixed',
                transform: 'rotate(180deg)',
                fontFamily: 'Sora, sans-serif'
              }}
            >
              CUPOM
            </span>
          </div>
          
          {/* Discount percentage - big */}
          <div className="mt-4 text-center">
            <span className="text-4xl font-black text-black" style={{ fontFamily: 'Sora, sans-serif' }}>
              {discount}
            </span>
          </div>
        </div>

        {/* Dashed divider line */}
        <div className="absolute left-[120px] top-0 bottom-0 w-0 border-l-2 border-dashed border-[#33b864]/30 z-10" />
        
        {/* Scissors icon */}
        <div className="absolute left-[108px] top-1/2 -translate-y-1/2 z-20">
          <div className="bg-black p-1 rounded-full">
            <Scissors className="w-4 h-4 text-[#33b864]" />
          </div>
        </div>

        {/* Right side - Code and details */}
        <div className="flex-1 bg-gradient-to-br from-[#0f0f0f] via-[#0a0a0a] to-black border-2 border-l-0 border-[#33b864]/40 rounded-r-2xl p-6 pl-8">
          {/* Header badge */}
          <div className="flex items-center gap-2 mb-4">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
            >
              <Sparkles className="w-4 h-4 text-[#33b864]" />
            </motion.div>
            <span className="text-xs font-bold text-[#33b864] uppercase tracking-widest">
              Cupom de Desconto
            </span>
          </div>

          {/* Discount description */}
          <p className="text-white font-bold text-lg mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
            {discount} OFF
          </p>
          <p className="text-gray-400 text-sm mb-4">
            {description}
          </p>

          {/* Code display */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 bg-[#33b864]/10 border border-[#33b864]/30 rounded-lg px-4 py-3">
              <code className="text-[#33b864] font-mono font-bold text-lg tracking-wider">
                {code}
              </code>
            </div>
            <button
              onClick={handleCopy}
              className="p-3 bg-[#33b864]/10 hover:bg-[#33b864]/20 border border-[#33b864]/30 rounded-lg transition-all"
              data-testid="button-copy-coupon"
            >
              {copied ? (
                <Check className="w-5 h-5 text-[#33b864]" />
              ) : (
                <Copy className="w-5 h-5 text-[#33b864]" />
              )}
            </button>
          </div>

          {/* Apply button */}
          {onApply && (
            <button
              onClick={handleApply}
              disabled={isApplied}
              className={`w-full py-3 font-bold rounded-lg transition-all ${
                isApplied 
                  ? 'bg-[#33b864]/20 text-[#33b864] cursor-default'
                  : 'bg-[#33b864] hover:bg-[#2ea558] text-black'
              }`}
              data-testid="button-apply-coupon"
            >
              {isApplied ? '✓ Cupom Aplicado' : 'Aplicar Cupom'}
            </button>
          )}

          {/* Validity */}
          {validUntil && (
            <p className="text-xs text-gray-500 mt-3 text-center">
              Válido até {validUntil}
            </p>
          )}
        </div>
      </div>

      {/* Bottom serrated edge effect */}
      <div className="absolute -bottom-2 left-4 right-4 h-4 flex justify-between">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="w-2 h-2 bg-black rounded-full"
            style={{ marginTop: i % 2 === 0 ? '0' : '4px' }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export function CouponBanner({ 
  code, 
  discount, 
  onApply 
}: { 
  code: string; 
  discount: string;
  onApply?: (code: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Cupom copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden"
    >
      {/* Animated background gradient */}
      <motion.div
        animate={{ 
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
        }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute inset-0 bg-gradient-to-r from-[#33b864] via-[#2ea558] to-[#33b864] bg-[length:200%_100%]"
      />
      
      {/* Pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.4'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative flex items-center justify-center gap-4 py-3 px-4">
        <Ticket className="w-5 h-5 text-black hidden sm:block" />
        
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <span className="text-black font-bold text-sm sm:text-base">
            🎉 Use o cupom
          </span>
          
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 bg-black/20 hover:bg-black/30 px-3 py-1.5 rounded-lg transition-all border border-black/20"
            data-testid="button-copy-banner-coupon"
          >
            <code className="text-white font-mono font-bold tracking-wider">
              {code}
            </code>
            {copied ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <Copy className="w-4 h-4 text-white/70" />
            )}
          </button>
          
          <span className="text-black font-bold text-sm sm:text-base">
            e ganhe <span className="text-white font-black">{discount} OFF</span>
          </span>
        </div>
        
        <Sparkles className="w-5 h-5 text-black hidden sm:block" />
      </div>
    </motion.div>
  );
}
