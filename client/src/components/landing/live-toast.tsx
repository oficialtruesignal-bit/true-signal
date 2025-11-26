import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, TrendingUp, UserPlus } from 'lucide-react';

interface Notification {
  id: number;
  type: 'green' | 'member';
  message: string;
  icon: typeof Check;
}

const notifications: Omit<Notification, 'id'>[] = [
  { type: 'green', message: 'Green confirmado: Over 2.5 @1.90 ✅', icon: Check },
  { type: 'member', message: 'Ricardo M. entrou no plano Pro', icon: UserPlus },
  { type: 'green', message: 'Green confirmado: BTTS @2.15 ✅', icon: Check },
  { type: 'member', message: 'Ana P. ativou acesso vitalício', icon: UserPlus },
  { type: 'green', message: 'Lucro realizado: +R$ 1.250', icon: TrendingUp },
  { type: 'member', message: 'Carlos S. entrou no plano Pro', icon: UserPlus },
];

export function LiveToast() {
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const showNotification = () => {
      const notification = {
        ...notifications[index % notifications.length],
        id: Date.now(),
      };
      setActiveNotification(notification);
      setIndex(prev => prev + 1);

      setTimeout(() => {
        setActiveNotification(null);
      }, 4000);
    };

    const interval = setInterval(showNotification, 20000);
    showNotification();

    return () => clearInterval(interval);
  }, [index]);

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {activeNotification && (
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="bg-black/80 backdrop-blur-xl border border-[#33b864]/30 rounded-xl p-4 shadow-2xl shadow-[#33b864]/20 min-w-[300px]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#33b864]/20 flex items-center justify-center">
                <activeNotification.icon className="w-5 h-5 text-[#33b864]" />
              </div>
              <p className="text-sm text-white font-medium">{activeNotification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
