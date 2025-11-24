import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  first_name: string;
  role: 'user' | 'admin';
  subscription_status: 'free' | 'premium';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// MOCK USER DATA
const MOCK_ADMIN: User = {
  id: "admin-123",
  email: "admin@tipster.com",
  first_name: "Admin",
  role: "admin",
  subscription_status: "premium"
};

const MOCK_USER: User = {
  id: "user-123",
  email: "user@tipster.com",
  first_name: "Jogador",
  role: "user",
  subscription_status: "free"
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Simulate session check on mount
    const storedUser = localStorage.getItem("tipster_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate API Call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (email.includes("admin")) {
      setUser(MOCK_ADMIN);
      localStorage.setItem("tipster_user", JSON.stringify(MOCK_ADMIN));
      toast.success(`Bem-vindo de volta, ${MOCK_ADMIN.first_name}!`);
      setLocation("/app");
    } else if (email.includes("error")) {
       toast.error("Credenciais inválidas");
       setIsLoading(false);
       throw new Error("Invalid credentials");
    } else {
      // Default to normal user for any other email for demo purposes
      // In production this would validate against DB
      const demoUser = { ...MOCK_USER, email, first_name: email.split('@')[0] };
      setUser(demoUser);
      localStorage.setItem("tipster_user", JSON.stringify(demoUser));
      toast.success(`Bem-vindo de volta, ${demoUser.first_name}!`);
      setLocation("/app");
    }
    setIsLoading(false);
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    // Simulate API Call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      first_name: name,
      role: "user",
      subscription_status: "free"
    };

    setUser(newUser);
    localStorage.setItem("tipster_user", JSON.stringify(newUser));
    toast.success("Conta criada com sucesso! Bem-vindo.");
    setLocation("/app");
    setIsLoading(false);
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
