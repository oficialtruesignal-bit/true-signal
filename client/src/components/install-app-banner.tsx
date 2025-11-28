import { useState, useEffect } from "react";
import { Smartphone, Download, X, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallAppBanner() {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [showAndroidInstructions, setShowAndroidInstructions] = useState(false);

  useEffect(() => {
    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;

    console.log('📱 [Install Banner] User Agent:', userAgent);
    console.log('📱 [Install Banner] iOS:', isIOSDevice, '| Android:', isAndroidDevice, '| Standalone:', isInStandaloneMode);

    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);
    setIsInstalled(isInStandaloneMode);

    // ALWAYS show banner for testing (remove this condition in production)
    // Production: if (!isInStandaloneMode && (isIOSDevice || isAndroidDevice))
    setShowBanner(true);
    console.log('📱 [Install Banner] Banner visible:', true);

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // For iOS or if prompt is not available, show instructions
      if (isIOS) {
        setShowIOSInstructions(!showIOSInstructions);
      } else if (isAndroid) {
        setShowAndroidInstructions(!showAndroidInstructions);
      }
      return;
    }

    // Android/Chrome - trigger native install prompt
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Remember dismissal in localStorage (optional - expires in 7 days)
    localStorage.setItem('pwa_banner_dismissed', Date.now().toString());
  };

  // Temporarily disabled check for testing - always show banner
  // Production: if (!showBanner || isInstalled) return null;
  if (!showBanner) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-[#121212] to-[#0a0a0a] border border-[#33b864]/20 rounded-2xl p-5 shadow-lg shadow-[#33b864]/5 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 w-1 h-full bg-[#33b864]"></div>
      
      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
        data-testid="button-dismiss-install"
      >
        <X className="w-4 h-4 text-gray-400" />
      </button>

      {/* Header */}
      <div className="flex items-start gap-4 mb-3">
        <div className="w-12 h-12 rounded-xl bg-[#33b864]/10 border border-[#33b864]/20 flex items-center justify-center flex-shrink-0">
          <Smartphone className="w-6 h-6 text-[#33b864]" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-sora font-bold text-white mb-1">
            Adicione à tela inicial!
          </h3>
          <p className="text-sm text-gray-300">
            Acesse a TRUE SIGNAL mais rápido, como se fosse um aplicativo nativo.
            {isIOS && " Disponível no Safari."}
            {isAndroid && " Instalação em um toque."}
            {!isIOS && !isAndroid && " Acesse do celular para instalar."}
          </p>
        </div>
      </div>

      {/* Install Button */}
      <button
        onClick={handleInstallClick}
        className="w-full mt-4 px-5 py-3 bg-[#33b864] hover:bg-[#2da055] text-black font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#33b864]/20"
        data-testid="button-install-app"
      >
        <Download className="w-5 h-5" />
        {isIOS ? "Ver instruções" : "Adicionar à tela inicial"}
        {isIOS && (
          showIOSInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {/* iOS Instructions */}
      {isIOS && showIOSInstructions && (
        <div className="mt-4 pt-4 border-t border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-xs font-bold text-[#33b864] mb-3 uppercase tracking-wider">
            Passo a passo para iOS
          </p>
          <ol className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="font-bold text-[#33b864] flex-shrink-0">1.</span>
              <span>Toque no botão <strong>Compartilhar</strong> (ícone quadrado com seta para cima) na parte inferior do Safari</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-[#33b864] flex-shrink-0">2.</span>
              <span>Role para baixo e selecione <strong>"Adicionar à Tela Inicial"</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-[#33b864] flex-shrink-0">3.</span>
              <span>Toque em <strong>"Adicionar"</strong>. O ícone da TRUE SIGNAL aparecerá na sua tela inicial!</span>
            </li>
          </ol>
        </div>
      )}

      {/* Android Instructions (fallback if prompt not available) */}
      {isAndroid && showAndroidInstructions && !deferredPrompt && (
        <div className="mt-4 pt-4 border-t border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-xs font-bold text-[#33b864] mb-3 uppercase tracking-wider">
            Passo a passo para Android
          </p>
          <ol className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="font-bold text-[#33b864] flex-shrink-0">1.</span>
              <span>Toque no menu (três pontos) no canto superior direito do navegador</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-[#33b864] flex-shrink-0">2.</span>
              <span>Selecione <strong>"Adicionar à tela inicial"</strong> ou <strong>"Instalar aplicativo"</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-[#33b864] flex-shrink-0">3.</span>
              <span>Confirme tocando em <strong>"Adicionar"</strong>. Pronto!</span>
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}
