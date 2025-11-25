import { Link, useLocation } from "wouter";
import { Home, LayoutDashboard, Settings, LogOut, Bell, Target, Play, Calendar, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import OneSignal from 'react-onesignal';
import { Button } from "./ui/button";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  // Initial OneSignal Init
  useEffect(() => {
    const initOneSignal = async () => {
      const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
      
      if (!appId) {
        console.log("OneSignal: No APP_ID configured (notifications disabled)");
        return;
      }

      try {
        await OneSignal.init({
          appId,
          allowLocalhostAsSecureOrigin: true,
        });
        
        console.log("OneSignal initialized successfully");
      } catch (error) {
        console.error("OneSignal init error:", error);
      }
    };

    initOneSignal();
  }, [user]);

  // Force reload profile (clear cache)
  const reloadProfile = async () => {
    if (user) {
      const { data } = await (await import("@/lib/supabase")).supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) {
        console.log('🔄 Profile reloaded:', data);
        window.location.reload(); // Force full reload
      }
    }
  };

  // Desktop Nav Items (with Admin)
  const desktopNavItems = [
    { icon: Home, label: "Home", path: "/app" },
    { icon: Target, label: "Tips", path: "/tips" },
    { icon: Play, label: "Ao Vivo", path: "/live" },
    { icon: Calendar, label: "Pré-Jogo", path: "/pregame" },
    { icon: Settings, label: "Config", path: "/settings" },
    { icon: LayoutDashboard, label: "Admin", path: "/admin", hidden: !(user?.role === 'admin' || user?.email === 'kwillianferreira@gmail.com') },
  ];

  // Mobile Nav Items (5 icons only, no Admin)
  const mobileNavItems = [
    { icon: Home, label: "Home", path: "/app" },
    { icon: Target, label: "Tips", path: "/tips" },
    { icon: Play, label: "Ao Vivo", path: "/live" },
    { icon: Calendar, label: "Pré", path: "/pregame" },
    { icon: Settings, label: "Config", path: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 md:pb-0 md:pl-64 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-primary/20 p-6 z-50">
        <Link href="/app" className="mb-10 px-2 block">
          <Logo size="md" showText={true} />
        </Link>

        <div className="mb-6 px-2">
           <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                {user?.firstName?.charAt(0) || "U"}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs text-muted-foreground">Bem-vindo,</span>
                <span className="text-sm font-bold text-white truncate">{user?.firstName || "Convidado"}</span>
              </div>
           </div>
        </div>

        <nav className="space-y-2 flex-1">
          {desktopNavItems.filter(item => !item.hidden).map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group border border-transparent",
                location === item.path
                  ? "bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(51,184,100,0.1)]"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  location === item.path ? "text-primary" : "text-muted-foreground group-hover:text-white"
                )}
              />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-2">
          <div className="bg-black/40 dark:bg-black/40 bg-white/60 dark:border-white/5 border-gray-200 rounded-xl p-4 border">
            <div className="flex items-center gap-2 text-foreground text-sm font-bold mb-2">
              <Bell className="w-4 h-4 text-primary" /> Notificações
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Ative para receber alertas de novas tips.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={async () => {
                const { notificationService } = await import("@/lib/notification-service");
                await notificationService.requestPermission();
              }}
              className="w-full text-xs h-7 border-primary/20 text-primary hover:bg-primary/10"
            >
              Ativar Agora
            </Button>
          </div>

          <div className="flex items-center gap-2 px-2">
            <ThemeToggle />
            <button 
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-red-400 transition-colors flex-1 text-left rounded-lg hover:bg-destructive/10"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-primary/20 dark:border-primary/20 border-gray-200 z-50 flex items-center justify-between px-4">
        <Logo size="sm" showText={true} />
        <div className="flex items-center gap-2">
           <span className="text-sm font-bold text-foreground mr-2">Olá, {user?.firstName}</span>
           <ThemeToggle />
           <button onClick={logout} className="p-2 text-muted-foreground hover:text-red-400">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 md:pt-6 px-4 md:px-8 max-w-7xl mx-auto animate-in fade-in duration-500 pb-24">
        {children}
      </main>

      {/* Mobile Bottom Nav - 5 Icons */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/95 backdrop-blur-md border-t border-primary/20 z-50 flex items-center justify-around px-2">
        {mobileNavItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            data-testid={`nav-${item.label.toLowerCase()}`}
            className={cn(
              "flex flex-col items-center justify-center w-16 h-full gap-1 transition-all",
              location === item.path ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon
              className={cn(
                "w-5 h-5 transition-all",
                location === item.path ? "scale-110 drop-shadow-[0_0_8px_rgba(51,184,100,0.6)]" : ""
              )}
            />
            <span className={cn(
              "text-[10px] font-medium transition-all",
              location === item.path ? "font-bold" : ""
            )}>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Admin FAB (Floating Action Button) */}
      {(user?.role === 'admin' || user?.email === 'kwillianferreira@gmail.com') && (
        <Link href="/admin/create">
          <button
            data-testid="fab-create-tip"
            className="fixed bottom-20 right-4 md:bottom-8 md:right-8 w-14 h-14 bg-primary hover:bg-primary/90 text-black rounded-full shadow-[0_0_30px_rgba(51,184,100,0.4)] hover:shadow-[0_0_40px_rgba(51,184,100,0.6)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 z-40 border-2 border-primary/50"
            aria-label="Criar Nova Tip"
          >
            <Plus className="w-6 h-6" strokeWidth={3} />
          </button>
        </Link>
      )}

    </div>
  );
}
