import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem("tipster_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem("tipster_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      const userProfile: User = {
        id: data.profile.id,
        email: data.profile.email,
        firstName: data.profile.firstName,
        role: data.profile.role,
        subscriptionStatus: data.profile.subscriptionStatus,
      };

      setUser(userProfile);
      localStorage.setItem("tipster_user", JSON.stringify(userProfile));
      toast.success(`Bem-vindo de volta, ${userProfile.firstName}!`);
      setLocation("/app");
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
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: name,
          email,
          password,
          role: "user",
          subscriptionStatus: "free",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      const userProfile: User = {
        id: data.profile.id,
        email: data.profile.email,
        firstName: data.profile.firstName,
        role: data.profile.role,
        subscriptionStatus: data.profile.subscriptionStatus,
      };

      setUser(userProfile);
      localStorage.setItem("tipster_user", JSON.stringify(userProfile));
      toast.success("Conta criada com sucesso! Bem-vindo.");
      setLocation("/app");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar conta");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("tipster_user");
    toast.info("Você saiu da conta.");
    setLocation("/auth");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
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
