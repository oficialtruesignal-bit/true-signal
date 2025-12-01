import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { useState, useEffect } from "react";

export function PWAInstallPrompt() {
  const { showPrompt, install, dismiss, isInstalled, isInstallable } = usePWAInstall();
  const [showManualPrompt, setShowManualPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsIOS(iOS);
    setIsMobile(mobile);

    if (mobile && !isInstalled) {
      const dismissed = localStorage.getItem('pwa-manual-dismissed');
      if (!dismissed || Date.now() - parseInt(dismissed) > 24 * 60 * 60 * 1000) {
        const timer = setTimeout(() => {
          if (!showPrompt) {
            setShowManualPrompt(true);
          }
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [isInstalled, showPrompt]);

  const dismissManual = () => {
    setShowManualPrompt(false);
    localStorage.setItem('pwa-manual-dismissed', Date.now().toString());
  };

  if (isInstalled) return null;

  if (showPrompt && isInstallable) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-[360px] z-[90]"
        >
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-2xl border border-[#33b864]/30 shadow-2xl shadow-[#33b864]/20 overflow-hidden">
            <div className="relative p-4 pb-0">
              <button
                onClick={dismiss}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                data-testid="button-dismiss-pwa"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
              
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#33b864] to-[#1a8f4a] flex items-center justify-center shadow-lg shadow-[#33b864]/30 flex-shrink-0">
                  <Smartphone className="w-7 h-7 text-white" />
                </div>
                
                <div className="flex-1 pr-6">
                  <h3 className="text-white font-bold text-base mb-1" style={{ fontFamily: "Sora, sans-serif" }}>
                    Instalar True Signal
                  </h3>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Adicione na sua tela inicial para acesso rápido
                  </p>
                </div>
              </div>
            </div>

            <div className="px-4 py-3">
              <div className="flex gap-2 text-[10px] text-gray-500">
                <span className="px-2 py-1 rounded-full bg-white/5">Acesso rápido</span>
                <span className="px-2 py-1 rounded-full bg-white/5">Notificações</span>
                <span className="px-2 py-1 rounded-full bg-white/5">Tela cheia</span>
              </div>
            </div>

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
      </AnimatePresence>
    );
  }

  if (showManualPrompt && isMobile) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-[360px] z-[90]"
        >
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-2xl border border-[#33b864]/30 shadow-2xl shadow-[#33b864]/20 overflow-hidden">
            <div className="relative p-4 pb-0">
              <button
                onClick={dismissManual}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                data-testid="button-dismiss-pwa-manual"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
              
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#33b864] to-[#1a8f4a] flex items-center justify-center shadow-lg shadow-[#33b864]/30 flex-shrink-0">
                  <Smartphone className="w-7 h-7 text-white" />
                </div>
                
                <div className="flex-1 pr-6">
                  <h3 className="text-white font-bold text-base mb-1" style={{ fontFamily: "Sora, sans-serif" }}>
                    Instalar True Signal
                  </h3>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Tenha acesso rápido direto da sua tela inicial
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 pt-3">
              {isIOS ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <div className="w-6 h-6 rounded-full bg-[#33b864]/20 flex items-center justify-center text-xs font-bold text-[#33b864]">1</div>
                    <span>Toque em <Share className="w-4 h-4 inline mx-1" /> (compartilhar)</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <div className="w-6 h-6 rounded-full bg-[#33b864]/20 flex items-center justify-center text-xs font-bold text-[#33b864]">2</div>
                    <span>Escolha "Adicionar à Tela de Início"</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <div className="w-6 h-6 rounded-full bg-[#33b864]/20 flex items-center justify-center text-xs font-bold text-[#33b864]">3</div>
                    <span>Toque em "Adicionar"</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <div className="w-6 h-6 rounded-full bg-[#33b864]/20 flex items-center justify-center text-xs font-bold text-[#33b864]">1</div>
                    <span>Toque no menu (⋮) do navegador</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <div className="w-6 h-6 rounded-full bg-[#33b864]/20 flex items-center justify-center text-xs font-bold text-[#33b864]">2</div>
                    <span>Escolha "Adicionar à tela inicial"</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <div className="w-6 h-6 rounded-full bg-[#33b864]/20 flex items-center justify-center text-xs font-bold text-[#33b864]">3</div>
                    <span>Confirme a instalação</span>
                  </div>
                </div>
              )}
            </div>

            <div className="px-4 pb-4">
              <Button
                onClick={dismissManual}
                variant="outline"
                className="w-full h-10 border-[#33b864]/30 text-[#33b864] hover:bg-[#33b864]/10"
                data-testid="button-dismiss-pwa-manual-ok"
              >
                Entendi
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return null;
}
