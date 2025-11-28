import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface User {
  id: string;
  email: string;
  firstName: string;
  role: 'user' | 'admin';
  subscriptionStatus: 'trial' | 'active' | 'expired';
  createdAt: string;
  trialStartDate: string | null;
  subscriptionActivatedAt: string | null;
  subscriptionEndsAt: string | null;
  termsAcceptedAt: string | null;
  privacyAcceptedAt: string | null;
  riskDisclaimerAcceptedAt: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  reloadProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id, false, session.user);
      } else {
        // Check localStorage backup for offline access
        const storedUser = localStorage.getItem('vantage_user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            if (parsed.id && parsed.email) {
              console.log('🔄 [AUTH] Restoring user from localStorage backup');
              loadUserProfile(parsed.id, false, { id: parsed.id, email: parsed.email, user_metadata: { first_name: parsed.firstName } });
              return;
            }
          } catch (e) {
            console.error('Error parsing stored user:', e);
          }
        }
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user.id, false, session.user);
      } else {
        // Don't clear user immediately if we have localStorage backup
        const storedUser = localStorage.getItem('vantage_user');
        if (!storedUser) {
          setUser(null);
        }
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string, forceReload = false, supabaseUserData?: { id: string; email?: string; user_metadata?: { first_name?: string } }) => {
    const startTime = Date.now();
    
    try {
      console.log('🔄 [AUTH DEBUG] Loading profile for userId:', userId);
      console.log('🔄 [AUTH DEBUG] Force reload:', forceReload);
      
      // Use provided user data or try to fetch from Supabase
      let userEmail = supabaseUserData?.email;
      let userFirstName = supabaseUserData?.user_metadata?.first_name;
      
      if (!userEmail) {
        // Try to get from Supabase auth if not provided
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        userEmail = supabaseUser?.email;
        userFirstName = supabaseUser?.user_metadata?.first_name;
      }
      
      // If still no user data, try localStorage backup
      if (!userEmail) {
        console.log('⚠️ [AUTH DEBUG] No Supabase session, checking localStorage backup');
        
        const storedUser = localStorage.getItem('vantage_user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            if (parsed.id === userId) {
              userEmail = parsed.email;
              userFirstName = parsed.firstName;
              console.log('✅ [AUTH DEBUG] Found user in localStorage backup:', userEmail);
            }
          } catch (e) {
            console.error('Error parsing stored user:', e);
          }
        }
        
        // If still no user data, clear and stop
        if (!userEmail) {
          console.log('❌ [AUTH DEBUG] No user data found, clearing session');
          localStorage.removeItem('vantage_user');
          setUser(null);
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch('/api/profile/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userId,
          email: userEmail,
          firstName: userFirstName || userEmail?.split('@')[0],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync profile');
      }

      const { profile: data } = await response.json();

      console.log('📊 [AUTH DEBUG] Profile data from backend:', data);

      if (data) {
        const userData = {
          id: data.id,
          email: data.email,
          firstName: data.firstName,
          role: data.role as 'user' | 'admin',
          subscriptionStatus: (data.subscriptionStatus || 'trial') as 'trial' | 'active' | 'expired',
          createdAt: data.createdAt,
          trialStartDate: data.trialStartDate || null,
          subscriptionActivatedAt: data.subscriptionActivatedAt || null,
          subscriptionEndsAt: data.subscriptionEndsAt || null,
          termsAcceptedAt: data.termsAcceptedAt || null,
          privacyAcceptedAt: data.privacyAcceptedAt || null,
          riskDisclaimerAcceptedAt: data.riskDisclaimerAcceptedAt || null,
        };
        
        console.log('✅ [AUTH DEBUG] Setting user state with role:', userData.role);
        console.log('👤 [AUTH DEBUG] Full user object:', userData);
        
        // Save user to localStorage for backup/recovery
        localStorage.setItem('vantage_user', JSON.stringify(userData));
        
        setUser(userData);
      }
    } catch (error) {
      console.error('💥 [AUTH DEBUG] Error loading profile:', error);
    } finally {
      const elapsed = Date.now() - startTime;
      const minDelay = 1000;
      if (elapsed < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
      }
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await loadUserProfile(data.user.id, false, data.user);
        toast.success(`Bem-vindo de volta!`);
        setLocation("/app");
      }
    } catch (error: any) {
      console.error('🔐 [AUTH] Login error:', error);
      
      // Handle network errors gracefully
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        toast.error("Erro de conexão. Verifique sua internet e tente novamente.");
      } else if (error.message?.includes('Invalid login credentials')) {
        toast.error("Email ou senha incorretos.");
      } else {
        toast.error(error.message || "Erro ao fazer login. Tente novamente.");
      }
      throw error;
    } finally {
      // Ensure minimum 1 second loading screen
      const elapsed = Date.now() - startTime;
      const minDelay = 1000;
      if (elapsed < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
      }
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      // Step 1: Sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: name,
          },
          emailRedirectTo: window.location.origin + '/app',
        },
      });

      if (signUpError) throw signUpError;

      // Step 2: If email confirmation is disabled, immediately sign in
      if (signUpData.session) {
        // Session already established (email confirmation disabled)
        if (signUpData.user) {
          await loadUserProfile(signUpData.user.id);
          toast.success("Conta criada com sucesso! Bem-vindo.");
          setLocation("/app");
        }
      } else {
        // Email confirmation required - sign in immediately to establish session
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          // Email confirmation might be required
          toast.info("Verifique seu email para confirmar a conta.");
          setIsLoading(false);
          return;
        }

        if (signInData.user) {
          await loadUserProfile(signInData.user.id);
          toast.success("Conta criada com sucesso! Bem-vindo.");
          setLocation("/app");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar conta");
      throw error;
    } finally {
      // Ensure minimum 1 second loading screen
      const elapsed = Date.now() - startTime;
      const minDelay = 1000;
      if (elapsed < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
      }
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.info("Você saiu da conta.");
    setLocation("/auth");
  };

  const reloadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      console.log('🔄 [AUTH DEBUG] Forcing profile reload...');
      await loadUserProfile(session.user.id, true);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, reloadProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
