import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useAccessControl } from '@/hooks/use-access-control';
import { Link } from 'wouter';

const PRICING_URL = '/pricing';

export function TrialBanner() {
  const [isDismissed, setIsDismissed] = useState(false);
  const { isTrial, daysRemaining, isPremium } = useAccessControl();
  
  // Não mostra para premium ou se foi dispensada
  if (!isTrial || isPremium || isDismissed) {
    return null;
  }
  
  const isUrgent = daysRemaining <= 3;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className={`relative ${isUrgent ? 'bg-gradient-to-r from-red-600 to-red-500' : 'bg-gradient-to-r from-yellow-600 to-yellow-500'} text-white px-3 py-2 shadow-lg z-50`}
        data-testid="banner-trial-countdown"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full ${isUrgent ? 'bg-red-700' : 'bg-yellow-700'} flex items-center justify-center flex-shrink-0`}>
              <Clock className="w-4 h-4" />
            </div>
            
            <div className="flex-1">
              <p className="font-bold text-xs md:text-sm">
                {isUrgent ? (
                  <>⚠️ URGENTE: Apenas {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'} restante{daysRemaining !== 1 && 's'} de acesso gratuito!</>
                ) : (
                  <>Restam {daysRemaining} dias de acesso gratuito. Garanta sua vaga no Prime.</>
                )}
              </p>
              <p className="text-xs opacity-90 hidden md:block">
                Desbloqueie sinais ilimitados e recursos exclusivos por R$ 99,87/mês
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            <Link href={PRICING_URL}>
              <button className="px-3 md:px-4 py-1.5 bg-white text-black font-bold rounded-lg hover:bg-gray-100 transition-colors text-xs md:text-sm whitespace-nowrap flex items-center gap-1.5" data-testid="button-trial-banner-subscribe">
                <Sparkles className="w-3 h-3" />
                Assinar Agora
              </button>
            </Link>
            
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Fechar banner"
              data-testid="button-trial-banner-dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
