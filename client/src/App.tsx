import React, { Suspense, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { LanguageProvider } from "@/hooks/use-language";
import { ThemeProvider } from "@/hooks/use-theme";
import { Loader2 } from "lucide-react";

// Lazy Load Pages for Performance
const LandingPage = React.lazy(() => import("@/pages/landing"));
const Dashboard = React.lazy(() => import("@/pages/dashboard"));
const TipsPage = React.lazy(() => import("@/pages/tips"));
const LivePage = React.lazy(() => import("@/pages/live"));
const PreGamePage = React.lazy(() => import("@/pages/pregame"));
const SettingsPage = React.lazy(() => import("@/pages/settings"));
const Admin = React.lazy(() => import("@/pages/admin"));
const AdminCreate = React.lazy(() => import("@/pages/admin-create"));
const AuthPage = React.lazy(() => import("@/pages/auth"));
const NotFound = React.lazy(() => import("@/pages/not-found"));

function ProtectedRoute({ component: Component, adminOnly = false }: { component: React.ComponentType<any>, adminOnly?: boolean }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/auth");
    } else if (!isLoading && user && adminOnly && user.role !== 'admin' && user.email !== 'kwillianferreira@gmail.com') {
      setLocation("/app");
    }
  }, [user, isLoading, adminOnly, setLocation]);

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (adminOnly && user.role !== 'admin' && user.email !== 'kwillianferreira@gmail.com') {
    return null; // Will redirect in useEffect
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected Routes */}
      <Route path="/app">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/tips">
        {() => <ProtectedRoute component={TipsPage} />}
      </Route>
      <Route path="/live">
        {() => <ProtectedRoute component={LivePage} />}
      </Route>
      <Route path="/pregame">
        {() => <ProtectedRoute component={PreGamePage} />}
      </Route>
      <Route path="/settings">
        {() => <ProtectedRoute component={SettingsPage} />}
      </Route>
      <Route path="/admin">
        {() => <ProtectedRoute component={Admin} adminOnly={true} />}
      </Route>
      <Route path="/admin/create">
        {() => <ProtectedRoute component={AdminCreate} adminOnly={true} />}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
                <Router />
                <Toaster position="top-right" closeButton richColors />
              </Suspense>
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
