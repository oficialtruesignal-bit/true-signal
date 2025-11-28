import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { TrendingUp, Banknote, Target, Flame } from 'lucide-react';

export function SocialProof() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  const notifications = [
    { name: 'Rafael S.', initials: 'RS', action: 'bateu ROI de', value: '+146%', detail: '12 Greens seguidos', icon: Target },
    { name: 'Ana C.', initials: 'AC', action: 'lucrou', value: '+R$ 5.120', detail: 'em 3 semanas', icon: TrendingUp },
    { name: 'Carlos M.', initials: 'CM', action: 'dobrou a banca:', value: '+R$ 4.523', detail: '15 dias de operação', icon: Flame },
    { name: 'Juliana F.', initials: 'JF', action: 'fechou o mês com', value: '+R$ 2.156', detail: 'sequência de 9 greens', icon: Target },
    { name: 'Pedro H.', initials: 'PH', action: 'multiplicou banca por', value: '3.2x', detail: 'começou com R$500', icon: TrendingUp },
    { name: 'Mariana L.', initials: 'ML', action: 'bateu meta semanal:', value: '+R$ 1.890', detail: 'primeira semana', icon: Target },
    { name: 'Lucas B.', initials: 'LB', action: 'atingiu ROI de', value: '+187%', detail: '18 Greens no mês', icon: Flame },
    { name: 'Fernanda R.', initials: 'FR', action: 'lucrou', value: '+R$ 3.890', detail: 'resultado mensal', icon: TrendingUp },
  ];
  
  const NotificationCard = ({ notification, index }: { notification: typeof notifications[0], index: number }) => {
    const IconComponent = notification.icon;
    return (
      <div 
        className="flex items-center gap-4 px-5 py-4 bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 rounded-2xl hover:border-[#33b864]/30 transition-all"
        data-testid={`notification-${index}`}
      >
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#33b864] to-[#2ea558] flex items-center justify-center text-sm font-black text-black flex-shrink-0">
          {notification.initials}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-white">{notification.name}</span>
            <span className="text-gray-500">{notification.action}:</span>
            <span className="font-bold text-[#33b864]">{notification.value}</span>
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <IconComponent className="w-3 h-3" />
            {notification.detail}
          </div>
        </div>
        
        {/* Status indicator */}
        <div className="w-2 h-2 rounded-full bg-[#33b864] animate-pulse flex-shrink-0" />
      </div>
    );
  };
  
  return (
    <section ref={ref} className="relative py-20 px-4 bg-gradient-to-b from-black via-[#0a0a0a] to-[#121212] overflow-hidden">
      <div className="max-w-5xl mx-auto lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
            Usuários{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#33b864] to-[#2ea558]">
              VANTAGE
            </span>
          </h2>
          <p className="text-sm md:text-base text-gray-400 mb-3">
            Veja quem está lucrando agora
          </p>
          <div className="inline-flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#33b864] animate-pulse" />
            <span className="text-sm text-[#33b864] font-medium">Atualizando em tempo real</span>
          </div>
        </motion.div>
        
        {/* Animated Notification Feed - Marquee vertical */}
        <div className="relative h-[400px] overflow-hidden">
          {/* Gradient overlays for smooth fade */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
          
          {/* Scrolling container */}
          <div className="animate-marquee-vertical space-y-4">
            {/* First set */}
            {notifications.map((notification, i) => (
              <motion.div
                key={`first-${i}`}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <NotificationCard notification={notification} index={i} />
              </motion.div>
            ))}
            {/* Duplicate for seamless loop */}
            {notifications.map((notification, i) => (
              <div key={`second-${i}`}>
                <NotificationCard notification={notification} index={i + 8} />
              </div>
            ))}
          </div>
        </div>
        
        </div>
      
      {/* Add keyframes for marquee animation */}
      <style>{`
        @keyframes marquee-vertical {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        .animate-marquee-vertical {
          animation: marquee-vertical 30s linear infinite;
        }
        .animate-marquee-vertical:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
