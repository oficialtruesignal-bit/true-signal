import { Link, useLocation } from "wouter";
import { Home, LayoutDashboard, Settings, LogOut, Trophy, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import OneSignal from 'react-onesignal';
import { Button } from "./ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  // Initial OneSignal Init (Mock or Real)
  useEffect(() => {
    const initOneSignal = async () => {
      try {
        await OneSignal.init({
          appId: "YOUR-ONESIGNAL-APP-ID", // In production this comes from env
          allowLocalhostAsSecureOrigin: true,
        });
        // OneSignal.showSlidedownPrompt(); // Request permission
      } catch (error) {
        console.log("OneSignal init skipped (Mock Mode)");
      }
    };

    initOneSignal();
  }, []);

  const navItems = [
    { icon: Home, label: "Home", path: "/app" },
    { icon: LayoutDashboard, label: "Admin", path: "/admin", hidden: user?.role !== 'admin' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 md:pb-0 md:pl-64 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-primary/20 p-6 z-50">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_10px_rgba(51,184,100,0.1)]">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-display font-bold text-xl tracking-tight text-white">
            TIPSTER <span className="text-primary">HUB</span>
          </h1>
        </div>

        <div className="mb-6 px-2">
           <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                {user?.first_name?.charAt(0) || "U"}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs text-muted-foreground">Bem-vindo,</span>
                <span className="text-sm font-bold text-white truncate">{user?.first_name || "Convidado"}</span>
              </div>
           </div>
        </div>

        <nav className="space-y-2 flex-1">
          {navItems.filter(item => !item.hidden).map((item) => (
            <Link key={item.path} href={item.path}>
              <a
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
              </a>
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-2">
          <div className="bg-black/40 rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 text-white text-sm font-bold mb-2">
              <Bell className="w-4 h-4 text-primary" /> Notificações
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Ative para não perder nenhuma tip.
            </p>
            <Button variant="outline" size="sm" className="w-full text-xs h-7 border-primary/20 text-primary hover:bg-primary/10">
              Ativar Agora
            </Button>
          </div>

          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-red-400 transition-colors w-full text-left mt-2"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair da Conta</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-primary/20 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
             <Trophy className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-display font-bold text-lg tracking-tight text-white">
            TIPSTER <span className="text-primary">HUB</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-sm font-bold text-white mr-2">Olá, {user?.first_name}</span>
           <button onClick={logout} className="p-2 text-muted-foreground hover:text-white">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 md:pt-6 px-4 md:px-8 max-w-7xl mx-auto animate-in fade-in duration-500 pb-24">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-primary/20 z-50 flex items-center justify-around px-2 pb-safe">
        {navItems.filter(item => !item.hidden).map((item) => (
          <Link key={item.path} href={item.path}>
            <a
              className={cn(
                "flex flex-col items-center justify-center w-16 h-full gap-1",
                location === item.path ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-all",
                  location === item.path ? "scale-110" : ""
                )}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </a>
          </Link>
        ))}
      </nav>
    </div>
  );
}
