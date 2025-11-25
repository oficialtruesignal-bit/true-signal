import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, TrendingUp, DollarSign } from "lucide-react";

const notifications = [
  { icon: CheckCircle, text: "Ricardo (SP) acabou de entrar no plano Pro", type: "join" },
  { icon: TrendingUp, text: "Nova Tip confirmada com Odd @ 2.10", type: "tip" },
  { icon: DollarSign, text: "Ana (RJ) sacou R$ 1.200,00", type: "withdraw" },
  { icon: CheckCircle, text: "Carlos (MG) garantiu +450% ROI este mês", type: "profit" },
  { icon: TrendingUp, text: "Green confirmado: Liverpool @ 1.85", type: "green" },
  { icon: DollarSign, text: "Pedro (RS) lucrou R$ 850,00 hoje", type: "withdraw" },
];

export function SalesToast() {
  const [currentNotification, setCurrentNotification] = useState<typeof notifications[0] | null>(null);

  useEffect(() => {
    const showNotification = () => {
      const randomNotif = notifications[Math.floor(Math.random() * notifications.length)];
      setCurrentNotification(randomNotif);

      setTimeout(() => {
        setCurrentNotification(null);
      }, 4000);
    };

    const initialDelay = Math.random() * 10000 + 5000;
    const initialTimer = setTimeout(showNotification, initialDelay);

    const interval = setInterval(() => {
      showNotification();
    }, Math.random() * 20000 + 15000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {currentNotification && (
        <motion.div
          initial={{ opacity: 0, x: -100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -100, scale: 0.8 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-6 left-6 z-50 pointer-events-none"
        >
          <div className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-primary/30 rounded-xl px-4 py-3 flex items-center gap-3 shadow-[0_0_30px_rgba(51,184,100,0.2)] min-w-[280px]">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
              <currentNotification.icon className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm text-white font-medium">{currentNotification.text}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
