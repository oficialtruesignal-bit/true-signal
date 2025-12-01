import { Link, useLocation } from "wouter";
import { Home, LayoutDashboard, Settings, LogOut, Bell, Ticket, Play, Calendar, Plus, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useEffect } from "react";
import OneSignal from 'react-onesignal';
import { Button } from "./ui/button";
import { Logo } from "./logo";
import { useQuery } from "@tanstack/react-query";
import { tipsService } from "@/lib/tips-service";
import { useUnreadTips } from "@/hooks/use-unread-tips";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  // Get tips for unread count
  const { data: tips = [] } = useQuery({
    queryKey: ['tips'],
    queryFn: tipsService.getAll,
    refetchInterval: 30000,
  });

  const tipIds = tips.map(tip => tip.id);
  const { unreadCount } = useUnreadTips(tipIds);

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
    { icon: Home, label: t.nav.home, path: "/app" },
    { icon: Ticket, label: t.nav.tips, path: "/tips" },
    { icon: Play, label: t.nav.live, path: "/live" },
    { icon: Calendar, label: t.nav.pregame, path: "/pregame" },
    { icon: Wallet, label: t.nav.bankroll || "Gestão", path: "/gestao" },
    { icon: Settings, label: t.nav.settings, path: "/settings" },
    { icon: LayoutDashboard, label: t.nav.admin, path: "/admin", hidden: !(user?.role === 'admin' || user?.email === 'kwillianferreira@gmail.com') },
  ];

  // Mobile Nav Items (6 icons, no Admin)
  const mobileNavItems = [
    { icon: Home, label: t.nav.home, path: "/app" },
    { icon: Ticket, label: t.nav.tips, path: "/tips" },
    { icon: Play, label: t.nav.live, path: "/live" },
    { icon: Calendar, label: t.nav.pregame, path: "/pregame" },
    { icon: Wallet, label: t.nav.bankroll || "Gestão", path: "/gestao" },
    { icon: Settings, label: t.nav.settings, path: "/settings" },
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
                <span className="text-xs text-muted-foreground">{t.nav.welcome}</span>
                <span className="text-sm font-bold text-foreground truncate">{user?.firstName || "..."}</span>
              </div>
           </div>
        </div>

        <nav className="space-y-2 flex-1">
          {desktopNavItems.filter(item => !item.hidden).map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group border border-transparent relative",
                location === item.path
                  ? "bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(51,184,100,0.1)]"
                  : "text-muted-foreground hover:text-primary dark:hover:text-white hover:bg-primary/5 dark:hover:bg-white/5"
              )}
            >
              <div className="relative">
                <item.icon
                  className={cn(
                    "w-5 h-5 transition-colors",
                    location === item.path ? "text-primary" : "text-muted-foreground group-hover:text-primary dark:group-hover:text-white"
                  )}
                />
                {item.path === "/tips" && unreadCount > 0 && (
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                )}
              </div>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-2">
          <div className="bg-white/60 dark:bg-black/40 border-gray-200 dark:border-white/5 rounded-xl p-4 border">
            <div className="flex items-center gap-2 text-foreground text-sm font-bold mb-2">
              <Bell className="w-4 h-4 text-primary" /> {t.nav.notifications}
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {t.nav.notificationsDesc}
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
              {t.nav.activateNow}
            </Button>
          </div>

          <div className="flex items-center gap-2 px-2">
            <button 
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-red-400 transition-colors flex-1 text-left rounded-lg hover:bg-destructive/10"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">{t.nav.logout}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-gray-200 dark:border-primary/20 z-50 flex items-center justify-between px-4">
        <Logo size="sm" showText={true} />
        <div className="flex items-center gap-2">
           <span className="text-sm font-bold text-foreground mr-2">{t.nav.hello} {user?.firstName?.split(' ')[0] || user?.firstName}</span>
           <button onClick={logout} className="p-2 text-muted-foreground hover:text-red-400">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 md:pt-6 px-4 md:px-8 max-w-7xl mx-auto animate-in fade-in duration-500 pb-24">
        {children}
      </main>

      {/* Mobile Bottom Nav - 6 Icons */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-card/95 backdrop-blur-md border-t border-primary/20 z-50 flex items-center justify-evenly px-1">
        {mobileNavItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            data-testid={`nav-${item.label.toLowerCase()}`}
            className={cn(
              "flex flex-col items-center justify-center h-full gap-0.5 transition-all relative px-1",
              location === item.path ? "text-primary" : "text-muted-foreground"
            )}
          >
            <div className="relative">
              <item.icon
                className={cn(
                  "w-[18px] h-[18px] transition-all",
                  location === item.path ? "scale-110 drop-shadow-[0_0_8px_rgba(51,184,100,0.6)]" : ""
                )}
              />
              {item.path === "/tips" && unreadCount > 0 && (
                <div className="absolute -top-1 -right-1.5 w-3 h-3 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </div>
            <span className={cn(
              "text-[8px] font-medium transition-all text-center leading-tight truncate max-w-[50px]",
              location === item.path ? "font-bold" : ""
            )}>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Admin FAB (Floating Action Button) */}
      {(user?.role === 'admin' || user?.email === 'kwillianferreira@gmail.com') && (
        <Link href="/admin">
          <button
            data-testid="fab-create-tip"
            className="fixed bottom-20 right-4 md:bottom-8 md:right-8 w-14 h-14 bg-primary hover:bg-primary/90 text-black rounded-full shadow-[0_0_30px_rgba(51,184,100,0.4)] hover:shadow-[0_0_40px_rgba(51,184,100,0.6)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 z-40 border-2 border-primary/50"
            aria-label="Criar Novo Sinal"
          >
            <Plus className="w-6 h-6" strokeWidth={3} />
          </button>
        </Link>
      )}

    </div>
  );
}
