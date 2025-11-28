import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Link } from 'wouter';
import { Zap, Shield, CheckCircle2, Sparkles, Ticket, Scissors, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

function ProCouponTicket() {
  const [copied, setCopied] = useState(false);
  const code = "TRUESIGNAL50";
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Cupom copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateY: -5 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="relative max-w-sm mx-auto mt-8"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#33b864]/20 to-[#33b864]/20 rounded-2xl blur-lg" />
      
      {/* Ticket container */}
      <div className="relative flex overflow-hidden rounded-2xl border border-[#33b864]/30 bg-gradient-to-r from-[#0a0a0a] to-black">
        
        {/* Left side - Vertical strip */}
        <div className="relative bg-gradient-to-b from-[#33b864] via-[#2ea558] to-[#1f8a42] w-20 flex flex-col items-center justify-center py-4">
          {/* Serrated edge effect - circles */}
          <div className="absolute -right-2 top-0 bottom-0 flex flex-col justify-around">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-black rounded-full" />
            ))}
          </div>
          
          {/* Ticket icon */}
          <div className="mb-2">
            <Ticket className="w-6 h-6 text-black/70 rotate-90" />
          </div>
          
          {/* Vertical CUPOM text */}
          <div 
            className="text-black font-black text-xs tracking-[0.2em] uppercase"
            style={{ 
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              fontFamily: 'Sora, sans-serif'
            }}
          >
            CUPOM
          </div>
          
          {/* Discount badge */}
          <div className="mt-3 bg-black/20 rounded-lg px-2 py-1">
            <span className="text-white font-black text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>
              50%
            </span>
          </div>
        </div>

        {/* Scissors divider */}
        <div className="absolute left-[68px] top-1/2 -translate-y-1/2 z-10 bg-black rounded-full p-1">
          <Scissors className="w-3 h-3 text-[#33b864]" />
        </div>

        {/* Right side - Content */}
        <div className="flex-1 p-5 pl-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3 h-3 text-[#33b864]" />
            <span className="text-[10px] font-bold text-[#33b864] uppercase tracking-widest">
              Cupom de Desconto
            </span>
          </div>

          {/* Main text */}
          <p className="text-white font-bold text-base mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
            50% OFF
          </p>
          <p className="text-gray-500 text-xs mb-3">
            De R$ 99,87 por apenas <span className="text-[#33b864] font-bold">R$ 49,93</span>
          </p>

          {/* Code box with copy */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-[#33b864]/10 border border-[#33b864]/30 border-dashed rounded-lg px-3 py-2 flex items-center justify-between">
              <code className="text-[#33b864] font-mono font-bold text-sm tracking-widest">
                {code}
              </code>
            </div>
            <button
              onClick={handleCopy}
              className="p-2 bg-[#33b864] hover:bg-[#2ea558] rounded-lg transition-all group"
              data-testid="button-copy-coupon-offer"
            >
              {copied ? (
                <Check className="w-4 h-4 text-black" />
              ) : (
                <Copy className="w-4 h-4 text-black group-hover:scale-110 transition-transform" />
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function OfferPack() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <section ref={ref} className="relative py-20 px-4 bg-gradient-to-b from-[#0a0a0a] via-black to-[#121212] overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#33b864]/10 rounded-full blur-[200px]" />
      
      <div className="relative z-10 max-w-3xl mx-auto lg:max-w-4xl lg:px-8">
        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Glow ring */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#33b864]/30 to-[#33b864]/30 rounded-3xl blur-xl" />
          
          {/* Black Friday Badge */}
          <motion.div 
            className="absolute -top-3 -right-3 md:-top-4 md:-right-4 z-20"
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={isInView ? { 
              opacity: 1, 
              scale: 1,
              rotate: 0
            } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div 
              className="bg-gradient-to-br from-red-600 to-red-800 px-4 py-2 md:px-5 md:py-3 rounded-lg shadow-2xl border border-red-500/50"
              style={{ 
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.5), 0 10px 30px rgba(0,0,0,0.6)',
                fontFamily: 'Sora, sans-serif'
              }}
            >
              <span className="text-white font-black text-sm md:text-base tracking-wide">
                -52% OFF
              </span>
            </div>
          </motion.div>
          
          <div className="relative bg-gradient-to-br from-[#33b864]/10 via-black to-[#33b864]/5 border-2 border-[#33b864]/40 rounded-3xl p-8 md:p-12 lg:p-16 backdrop-blur-xl">
            <div className="text-center">
              {/* Plan name */}
              <h3 className="text-2xl md:text-3xl font-black text-white mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
                Plano True Signal Pro
              </h3>
              
              {/* Price */}
              <div className="mb-8">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <span className="text-gray-500 line-through text-xl">R$ 99,87</span>
                </div>
                <div className="flex items-end justify-center gap-2">
                  <span className="text-5xl md:text-7xl font-black text-[#33b864]" style={{ fontFamily: 'Sora, sans-serif' }}>
                    R$ 47,90
                  </span>
                  <span className="text-gray-400 text-xl pb-3">/mês</span>
                </div>
              </div>
              
              {/* CTA Button - Pulsing */}
              <div className="flex justify-center">
                <Link href="/auth">
                  <motion.button
                    animate={{ 
                      boxShadow: [
                        '0 0 20px rgba(51, 184, 100, 0.4)',
                        '0 0 40px rgba(51, 184, 100, 0.8)',
                        '0 0 20px rgba(51, 184, 100, 0.4)',
                      ]
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-full md:w-auto px-12 py-5 bg-[#33b864] text-black font-black text-xl rounded-2xl hover:bg-[#2ea558] transition-colors flex items-center justify-center gap-3"
                    data-testid="button-offer-cta"
                  >
                    <Zap className="w-6 h-6" />
                    QUERO ACESSO PRO
                  </motion.button>
                </Link>
              </div>
              
              <p className="text-sm text-gray-400 mt-4">
                💡 <span className="text-white font-medium">Menos que 1 green paga o mês inteiro</span>
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Cancele quando quiser. Sem multas.
              </p>
              
              {/* Professional Coupon Ticket */}
              <ProCouponTicket />
            </div>
          </div>
        </motion.div>
        
        {/* Guarantee Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 text-center"
        >
          {/* Shield icon centered */}
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#33b864]/20 to-[#33b864]/5 border border-[#33b864]/30 flex items-center justify-center mb-6">
            <Shield className="w-8 h-8 text-[#33b864]" />
          </div>
          
          <h4 className="text-2xl font-black text-white mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
            O risco é 100% nosso
          </h4>
          
          <p className="text-gray-400 text-base leading-relaxed max-w-lg mx-auto mb-8">
            Você tem <span className="text-[#33b864] font-bold">15 DIAS</span> de teste. Se não lucrar, se não gostar ou mudar de ideia, devolvemos cada centavo. <span className="text-white font-semibold">Sem perguntas. Sem burocracia.</span>
          </p>
          
          {/* Guarantee badges - 2x2 grid with more spacing */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {['15 dias de teste', 'Reembolso total', 'Sem perguntas', 'Risco zero'].map((text, i) => (
              <div key={i} className="flex items-center justify-center gap-2 py-3">
                <CheckCircle2 className="w-5 h-5 text-[#33b864]" />
                <span className="text-sm text-gray-300">{text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
