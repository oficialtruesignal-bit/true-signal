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
  subscriptionStatus: 'free' | 'premium';
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
        loadUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string, forceReload = false) => {
    try {
      console.log('🔄 [AUTH DEBUG] Loading profile for userId:', userId);
      console.log('🔄 [AUTH DEBUG] Force reload:', forceReload);
      
      // Force fresh data by adding timestamp or using maybeSingle instead of single
      const query = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId);
      
      // Disable caching for admin checks
      const { data, error } = forceReload 
        ? await query.maybeSingle()
        : await query.single();

      console.log('📊 [AUTH DEBUG] Profile data from database:', data);
      console.log('❌ [AUTH DEBUG] Profile error:', error);

      if (error) throw error;

      if (data) {
        const userData = {
          id: data.id,
          email: data.email,
          firstName: data.first_name,
          role: data.role as 'user' | 'admin',
          subscriptionStatus: 'free' as 'free' | 'premium',
        };
        
        console.log('✅ [AUTH DEBUG] Setting user state with role:', userData.role);
        console.log('👤 [AUTH DEBUG] Full user object:', userData);
        
        setUser(userData);
      }
    } catch (error) {
      console.error('💥 [AUTH DEBUG] Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await loadUserProfile(data.user.id);
        toast.success(`Bem-vindo de volta!`);
        setLocation("/app");
      }
    } catch (error: any) {
      toast.error(error.message || "Credenciais inválidas");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
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
