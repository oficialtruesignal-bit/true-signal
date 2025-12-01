import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/use-pwa-install";

export function PWAInstallPrompt() {
  const { showPrompt, install, dismiss, isInstalled } = usePWAInstall();

  if (isInstalled) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-[360px] z-[90]"
        >
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-2xl border border-[#33b864]/30 shadow-2xl shadow-[#33b864]/20 overflow-hidden">
            {/* Header */}
            <div className="relative p-4 pb-0">
              <button
                onClick={dismiss}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                data-testid="button-dismiss-pwa"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
              
              <div className="flex items-start gap-4">
                {/* App Icon */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#33b864] to-[#1a8f4a] flex items-center justify-center shadow-lg shadow-[#33b864]/30 flex-shrink-0">
                  <Smartphone className="w-7 h-7 text-white" />
                </div>
                
                <div className="flex-1 pr-6">
                  <h3 className="text-white font-bold text-base mb-1" style={{ fontFamily: "Sora, sans-serif" }}>
                    Instalar True Signal
                  </h3>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Adicione na sua tela inicial para acesso rápido aos sinais
                  </p>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="px-4 py-3">
              <div className="flex gap-2 text-[10px] text-gray-500">
                <span className="px-2 py-1 rounded-full bg-white/5">Acesso rápido</span>
                <span className="px-2 py-1 rounded-full bg-white/5">Notificações</span>
                <span className="px-2 py-1 rounded-full bg-white/5">Tela cheia</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="p-4 pt-0">
              <Button
                onClick={install}
                className="w-full h-12 bg-[#33b864] hover:bg-[#2ea558] text-black font-bold text-sm"
                data-testid="button-install-pwa"
              >
                <Download className="w-5 h-5 mr-2" />
                Instalar Agora
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
