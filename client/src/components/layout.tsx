import { Link, useLocation } from "wouter";
import { Home, LayoutDashboard, Settings, LogOut, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: LayoutDashboard, label: "Admin", path: "/admin" },
    // { icon: Trophy, label: "Results", path: "/results" },
    // { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const handleLogout = () => {
    setLocation("/auth");
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 md:pb-0 md:pl-64">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-white/5 p-6 z-50">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl tracking-tight text-white">
            TYLTY<span className="text-primary">HUB</span>
          </h1>
        </div>

        <nav className="space-y-2 flex-1">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  location === item.path
                    ? "bg-primary/10 text-primary border border-primary/20"
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

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-white transition-colors mt-auto w-full text-left"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-white/5 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
             <Trophy className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-display font-bold text-xl tracking-tight text-white">
            TYLTY<span className="text-primary">HUB</span>
          </h1>
        </div>
        <button onClick={handleLogout} className="p-2 text-muted-foreground hover:text-white">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="pt-20 md:pt-6 px-4 md:px-8 max-w-7xl mx-auto animate-in fade-in duration-500">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-white/5 z-50 flex items-center justify-around px-2">
        {navItems.map((item) => (
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
