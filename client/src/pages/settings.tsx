import { Layout } from "@/components/layout";
import { Settings as SettingsIcon, Globe, Lock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/use-language";
import { Language } from "@/i18n/translations";

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();

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
    window.open('https://wa.me/5511999999999', '_blank');
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
