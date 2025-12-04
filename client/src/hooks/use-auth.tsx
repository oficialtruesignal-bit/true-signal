import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

// Definição dos tipos de dados do usuário
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
    // Timeout de segurança para não ficar carregando infinitamente
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 8000);

    // Verifica a sessão atual no Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(loadingTimeout);
      if (session?.user) {
        // Se tem sessão, carrega o perfil
        loadUserProfile(session.user.id, false, session.user);
      } else {
        // Se não tem sessão, tenta recuperar do cache local (backup)
        const storedUser = localStorage.getItem('vantage_user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            // Validação básica para ignorar lixo
            if (parsed.id && parsed.email) {
              console.log('🔄 [AUTH] Recuperando usuário do cache local');
              // Carrega estado visualmente enquanto tenta validar no fundo
              setUser(parsed);
              // Tenta revalidar silenciosamente
              loadUserProfile(parsed.id, false);
              return;
            }
          } catch (e) {
            console.error('Erro ao ler cache:', e);
            localStorage.removeItem('vantage_user');
          }
        }
        setIsLoading(false);
      }
    });

    // Escuta mudanças na autenticação (Login/Logout em outras abas)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user.id, false, session.user);
      } else {
        setUser(null);
        localStorage.removeItem('vantage_user');
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- FUNÇÃO CRÍTICA CORRIGIDA: CARREGAR PERFIL ---
  // Agora acessa o Supabase DIRETO, sem passar por /api/profile/sync
  const loadUserProfile = async (userId: string, forceReload = false, supabaseUserData?: { id: string; email?: string; user_metadata?: { first_name?: string } }) => {
    const startTime = Date.now();
    
    try {
      console.log('🔄 [AUTH] Carregando perfil direto do Supabase:', userId);
      
      // Dados básicos do usuário (do Auth)
      let userEmail = supabaseUserData?.email;
      let userFirstName = supabaseUserData?.user_metadata?.first_name;
      
      if (!userEmail) {
        const { data: { user: sbUser } } = await supabase.auth.getUser();
        userEmail = sbUser?.email;
        userFirstName = sbUser?.user_metadata?.first_name;
      }

      // 1. BUSCA DIRETA NA TABELA PROFILES (Bypass API)
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // 2. AUTO-FIX: Se o perfil não existir (falha no trigger), cria agora
      if (!data && userEmail) {
        console.log('⚠️ [AUTH] Perfil não encontrado, criando manualmente...');
        const { data: newData, error: createError } = await supabase
          .from('profiles')
          .insert([{
            id: userId,
            email: userEmail,
            first_name: userFirstName || userEmail.split('@')[0],
            role: 'user' // Padrão
          }])
          .select()
          .single();
        
        if (!createError) {
          data = newData;
        } else {
          console.error('Erro ao criar perfil fallback:', createError);
        }
      }

      // 3. ATUALIZA O ESTADO DO REACT
      if (data) {
        const userData: User = {
          id: data.id,
          email: data.email || userEmail || '',
          firstName: data.first_name || userFirstName || 'Usuário',
          role: (data.role as 'user' | 'admin') || 'user',
          subscriptionStatus: (data.subscription_status || 'trial') as any,
          createdAt: data.created_at,
          trialStartDate: data.trial_start_date || null,
          subscriptionActivatedAt: data.subscription_activated_at || null,
          subscriptionEndsAt: data.subscription_ends_at || null,
          termsAcceptedAt: data.terms_accepted_at || null,
          privacyAcceptedAt: data.privacy_accepted_at || null,
          riskDisclaimerAcceptedAt: data.risk_disclaimer_accepted_at || null,
        };
        
        console.log('✅ [AUTH] Perfil carregado:', userData.role);
        localStorage.setItem('vantage_user', JSON.stringify(userData));
        setUser(userData);
      }
    } catch (error) {
      console.error('💥 [AUTH] Erro fatal ao carregar perfil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIN SIMPLIFICADO (DIRETO SUPABASE) ---
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Removida a tentativa de server-side login (/api/auth/login) que causava erro 404
      console.log('🔐 [AUTH] Iniciando login direto Supabase...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        await loadUserProfile(data.user.id, false, data.user);
        toast.success(`Bem-vindo de volta!`);
        // Redirecionamento é tratado no componente de UI, mas atualizamos o estado aqui
      }
    } catch (error: any) {
      console.error('🔐 [AUTH] Erro no login:', error);
      
      if (error.message === 'Failed to fetch') {
        toast.error("Erro de conexão. Verifique sua internet.");
      } else if (error.message?.includes('Invalid login')) {
        toast.error("Email ou senha incorretos.");
      } else {
        toast.error("Erro ao entrar. Tente novamente.");
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Registro direto no Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: name,
          },
          // Redirecionamento correto para o Dashboard (não /app)
          emailRedirectTo: window.location.origin + '/dashboard',
        },
      });

      if (error) throw error;

      if (data.session) {
        if (data.user) {
          await loadUserProfile(data.user.id);
          toast.success("Conta criada com sucesso!");
        }
      } else {
        // Caso exija confirmação de email
        if (data.user) {
          await loadUserProfile(data.user.id); 
          toast.success("Conta criada! Bem-vindo.");
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
    localStorage.removeItem('vantage_user');
    toast.info("Você saiu da conta.");
    setLocation("/auth");
  };

  const reloadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
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