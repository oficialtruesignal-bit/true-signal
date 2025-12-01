import { Layout } from "@/components/layout";
import { Settings as SettingsIcon, Globe, Lock, MessageCircle, Crown, Clock, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/use-language";
import { Language } from "@/i18n/translations";
import { useAccessControl } from "@/hooks/use-access-control";
import { Link } from "wouter";

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const { isTrial, isPremium, daysRemaining } = useAccessControl();

  const languages = [
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'cn', name: '中文', flag: '🇨🇳' },
  ];

  const handleLanguageChange = (code: Language) => {
    setLanguage(code);
    toast.success(`${languages.find(l => l.code === code)?.name}`);
  };

  const handlePasswordChange = () => {
    toast.info(t.settings.updatePassword);
    // TODO: Implement password change
  };

  const handleSupport = () => {
    window.open('https://wa.me/5516993253866?text=Olá! Preciso de ajuda com o True Signal.', '_blank');
  };

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-purple-500" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white">{t.settings.title}</h1>
        </div>
        <p className="text-muted-foreground">{t.settings.subtitle}</p>
      </div>

      <div className="space-y-6">
        {/* Subscription Plan */}
        <div className="bg-card border border-primary/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-white">Plano e assinatura</h3>
          </div>
          
          <div className="space-y-4">
            {/* Current Plan Status */}
            <div className="p-4 bg-black/30 border border-white/10 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {isPremium ? (
                    <>
                      <Crown className="w-5 h-5 text-[#33b864]" />
                      <span className="font-bold text-white">True Signal Pro</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-5 h-5 text-yellow-500" />
                      <span className="font-bold text-white">Período gratuito</span>
                    </>
                  )}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isPremium 
                    ? 'bg-[#33b864]/10 text-[#33b864] border border-[#33b864]/20'
                    : isTrial
                    ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                    : 'bg-red-500/10 text-red-500 border border-red-500/20'
                }`}>
                  {isPremium ? 'Ativo' : isTrial ? `${daysRemaining} dias restantes` : 'Expirado'}
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-400">
                {isPremium && (
                  <>
                    <p>✓ Acesso ilimitado</p>
                    <p>✓ Sinais ilimitados no dia</p>
                    <p>✓ Alertas push em tempo real</p>
                    <p>✓ IA sempre atualizada</p>
                  </>
                )}
                {isTrial && (
                  <>
                    <p>⚠️ Apenas 1 sinal por dia</p>
                    <p>⚠️ Recursos limitados</p>
                    <p className="text-yellow-500 font-semibold mt-2">
                      Assine o True Signal Pro para acesso completo!
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 pt-2">
              {!isPremium && (
                <Link href="/checkout">
                  <Button
                    className="w-full h-12 bg-gradient-to-r from-[#33b864] to-[#2ea558] hover:from-[#2ea558] hover:to-[#33b864] text-black font-bold shadow-xl shadow-[#33b864]/50"
                    data-testid="button-subscribe"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Assinar True Signal Pro
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
              
              <Link href="/assinatura" className="block mt-4">
                <Button
                  variant="outline"
                  className="w-full h-12 border-white/20 hover:bg-white/5 text-white"
                  data-testid="button-manage-subscription"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  {isPremium ? 'Gerenciar minha assinatura' : 'Ver detalhes da assinatura'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Language Selector */}
        <div className="bg-card border border-primary/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-white">{t.settings.language}</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code as Language)}
                data-testid={`language-${lang.code}`}
                className={`p-3 rounded-lg border transition-all ${
                  language === lang.code
                    ? 'bg-primary/20 border-primary text-primary font-bold'
                    : 'bg-black/20 border-white/10 text-muted-foreground hover:border-primary/30'
                }`}
              >
                <span className="text-2xl mb-1 block">{lang.flag}</span>
                <span className="text-xs">{lang.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-card border border-primary/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-white">{t.settings.password}</h3>
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="current-password" className="text-sm text-muted-foreground">{t.settings.currentPassword}</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="••••••••"
                data-testid="input-current-password"
                className="mt-1 bg-black/20 border-white/10"
              />
            </div>
            <div>
              <Label htmlFor="new-password" className="text-sm text-muted-foreground">{t.settings.newPassword}</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                data-testid="input-new-password"
                className="mt-1 bg-black/20 border-white/10"
              />
            </div>
            <Button
              onClick={handlePasswordChange}
              data-testid="button-change-password"
              className="w-full bg-primary hover:bg-primary/90"
            >
              {t.settings.updatePassword}
            </Button>
          </div>
        </div>

        {/* Support */}
        <div className="bg-card border border-primary/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-white">{t.settings.support}</h3>
          </div>
          <Button
            onClick={handleSupport}
            data-testid="button-support"
            variant="outline"
            className="w-full border-primary/30 hover:bg-primary/10"
          >
            {t.settings.contactSupport}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
