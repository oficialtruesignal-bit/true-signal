import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useAccessControl } from '@/hooks/use-access-control';
import { Link } from 'wouter';

const CHECKOUT_URL = '/checkout';

export function TrialBanner() {
  const [isDismissed, setIsDismissed] = useState(false);
  const { isTrial, daysRemaining, isPremium } = useAccessControl();
  
  if (!isTrial || isPremium || isDismissed) {
    return null;
  }
  
  const isUrgent = daysRemaining <= 3;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className={`relative ${isUrgent ? 'bg-gradient-to-r from-red-600 to-red-500' : 'bg-gradient-to-r from-amber-500 to-yellow-500'} text-black px-4 py-1 shadow-md z-50`}
        data-testid="banner-trial-countdown"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <p className="font-semibold text-sm flex-1">
            {isUrgent ? (
              <span className="text-white">⚠️ {daysRemaining} {daysRemaining === 1 ? 'dia restante' : 'dias restantes'}!</span>
            ) : (
              <span>{daysRemaining} dias grátis restantes</span>
            )}
          </p>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href={CHECKOUT_URL}>
              <button 
                className="px-3 py-1 bg-black text-white font-bold rounded hover:bg-gray-800 transition-colors text-sm whitespace-nowrap shadow-md" 
                data-testid="button-trial-banner-subscribe"
              >
                Assinar Prime
              </button>
            </Link>
            
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 hover:bg-black/10 rounded-full transition-colors"
              aria-label="Fechar"
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
