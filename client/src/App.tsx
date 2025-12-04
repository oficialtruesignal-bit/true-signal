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
const Dashboard = React.lazy(() => import("@/pages/dashboard-crm"));
const TipsPage = React.lazy(() => import("@/pages/tips"));
const LivePage = React.lazy(() => import("@/pages/live"));
const PreGamePage = React.lazy(() => import("@/pages/pregame"));
const SettingsPage = React.lazy(() => import("@/pages/settings"));
const Admin = React.lazy(() => import("@/pages/admin"));
const AuthPage = React.lazy(() => import("@/pages/auth"));
const TermsPage = React.lazy(() => import("@/pages/terms"));
const PrivacyPage = React.lazy(() => import("@/pages/privacy"));
const RiskDisclaimerPage = React.lazy(() => import("@/pages/risk-disclaimer"));
const PricingPage = React.lazy(() => import("@/pages/pricing"));
const CheckoutPage = React.lazy(() => import("@/pages/checkout"));
const ThankYouPage = React.lazy(() => import("@/pages/thank-you"));
const SubscriptionPage = React.lazy(() => import("@/pages/subscription"));
const ComingSoonPage = React.lazy(() => import("@/pages/coming-soon"));
const GestaoPage = React.lazy(() => import("@/pages/gestao"));
const HotMatchesPage = React.lazy(() => import("@/pages/hot-matches"));
const VideoPromoPage = React.lazy(() => import("@/pages/video-promo"));
const NotFound = React.lazy(() => import("@/pages/not-found"));

// Import access control and paywall
import { useAccessControl } from "@/hooks/use-access-control";
import { LockedScreen } from "@/components/paywall/locked-screen";
import { LoadingScreen } from "@/components/loading-screen";

function ProtectedRoute({ component: Component, adminOnly = false }: { component: React.ComponentType<any>, adminOnly?: boolean }) {
  const { user, isLoading } = useAuth();
  const { isLocked } = useAccessControl();
  const [, setLocation] = useLocation();

  // Check if there's a user in localStorage (backup during state transitions)
  const hasLocalStorageUser = () => {
    try {
      const stored = localStorage.getItem('vantage_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        return !!(parsed.id && parsed.email);
      }
    } catch {
      return false;
    }
    return false;
  };

  useEffect(() => {
    // Only redirect if not loading, no user, AND no localStorage backup
    if (!isLoading && !user && !hasLocalStorageUser()) {
      setLocation("/auth");
    } else if (!isLoading && user && adminOnly && user.role !== 'admin' && user.email !== 'kwillianferreira@gmail.com') {
      setLocation("/app");
    }
  }, [user, isLoading, adminOnly, setLocation]);

  // Show loading if still loading OR if we have a localStorage user (recovery in progress)
  if (isLoading || (!user && hasLocalStorageUser())) {
    return <LoadingScreen />;
  }

  // No user and no localStorage backup - redirect will happen in useEffect
  if (!user) {
    return <LoadingScreen />;
  }

  // Show paywall if user's trial has expired (admins bypass)
  if (isLocked && user.role !== 'admin') {
    return <LockedScreen />;
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
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/risk-disclaimer" component={RiskDisclaimerPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/video-promo" component={VideoPromoPage} />
      
      {/* Protected Routes */}
      <Route path="/app">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/dashboard" component={Dashboard} />
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
      <Route path="/checkout">
        {() => <ProtectedRoute component={CheckoutPage} />}
      </Route>
      <Route path="/obrigado">
        {() => <ProtectedRoute component={ThankYouPage} />}
      </Route>
      <Route path="/assinatura">
        {() => <ProtectedRoute component={SubscriptionPage} />}
      </Route>
      <Route path="/coming-soon">
        {() => <ProtectedRoute component={ComingSoonPage} />}
      </Route>
      <Route path="/gestao">
        {() => <ProtectedRoute component={GestaoPage} />}
      </Route>
      <Route path="/hot-matches">
        {() => <ProtectedRoute component={HotMatchesPage} />}
      </Route>
      <Route path="/admin">
        {() => <ProtectedRoute component={Admin} adminOnly={true} />}
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
              <Suspense fallback={<LoadingScreen />}>
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
