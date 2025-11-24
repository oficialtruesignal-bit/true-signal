import { Layout } from "@/components/layout";
import { Settings as SettingsIcon, Globe, Moon, Sun, Lock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function SettingsPage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [language, setLanguage] = useState('pt');

  const languages = [
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'cn', name: '中文', flag: '🇨🇳' },
  ];

  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    toast.success(`Tema alterado para ${newTheme === 'dark' ? 'Escuro' : 'Claro'}`);
    // TODO: Implement actual theme switching
  };

  const handleLanguageChange = (code: string) => {
    setLanguage(code);
    toast.success(`Idioma alterado para ${languages.find(l => l.code === code)?.name}`);
    // TODO: Implement i18n
  };

  const handlePasswordChange = () => {
    toast.info('Funcionalidade de alteração de senha em breve!');
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
          <h1 className="text-2xl font-display font-bold text-white">Configurações</h1>
        </div>
        <p className="text-muted-foreground">Personalize sua experiência</p>
      </div>

      <div className="space-y-6">
        {/* Language Selector */}
        <div className="bg-card border border-primary/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-white">Idioma</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
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

        {/* Theme Switcher */}
        <div className="bg-card border border-primary/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 text-primary" />
            ) : (
              <Sun className="w-5 h-5 text-primary" />
            )}
            <h3 className="font-bold text-white">Tema</h3>
          </div>
          <button
            onClick={handleThemeToggle}
            data-testid="theme-toggle"
            className="w-full p-4 rounded-lg bg-black/20 border border-white/10 hover:border-primary/30 transition-all flex items-center justify-between group"
          >
            <span className="text-white font-medium">
              {theme === 'dark' ? 'Modo Escuro' : 'Modo Claro'}
            </span>
            <div className={`w-12 h-6 rounded-full transition-all ${
              theme === 'dark' ? 'bg-primary' : 'bg-gray-400'
            } relative`}>
              <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${
                theme === 'dark' ? 'right-0.5' : 'left-0.5'
              }`} />
            </div>
          </button>
        </div>

        {/* Change Password */}
        <div className="bg-card border border-primary/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-white">Alterar Senha</h3>
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="current-password" className="text-sm text-muted-foreground">Senha Atual</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="••••••••"
                data-testid="input-current-password"
                className="mt-1 bg-black/20 border-white/10"
              />
            </div>
            <div>
              <Label htmlFor="new-password" className="text-sm text-muted-foreground">Nova Senha</Label>
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
              Atualizar Senha
            </Button>
          </div>
        </div>

        {/* Support */}
        <div className="bg-card border border-primary/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-white">Suporte</h3>
          </div>
          <Button
            onClick={handleSupport}
            data-testid="button-support"
            variant="outline"
            className="w-full border-primary/30 hover:bg-primary/10"
          >
            Falar com Suporte via WhatsApp
          </Button>
        </div>
      </div>
    </Layout>
  );
}
