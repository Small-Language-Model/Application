import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getCurrentUser, loginUser, registerUser, UserPublic } from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  tokensRemaining: number;
  dailyTokenLimit: number;
  isPremium: boolean;
  subscriptionTier: 'free' | 'starter' | 'pro' | 'enterprise';
  subscriptionRenewDate?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateTokens: (amount: number) => void;
  purchaseTokens: (amount: number) => void;
  subscribe: (tier: 'starter' | 'pro' | 'enterprise') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_TOKEN_KEY = 'auth_token';
const DEFAULT_TOKENS = 1000;

function toClientUser(apiUser: UserPublic): User {
  const isAdmin = apiUser.email === 'admin@vitallm.com';
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.full_name,
    isAdmin,
    tokensRemaining: isAdmin ? 1000000 : DEFAULT_TOKENS,
    dailyTokenLimit: isAdmin ? 1000000 : DEFAULT_TOKENS,
    isPremium: isAdmin,
    subscriptionTier: isAdmin ? 'enterprise' : 'free',
    subscriptionRenewDate: isAdmin ? '2026-06-09' : undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const bootstrapSession = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        return;
      }

      try {
        const currentUser = await getCurrentUser(token);
        setUser(toClientUser(currentUser));
      } catch {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setUser(null);
      }
    };

    void bootstrapSession();
  }, []);

  const login = async (email: string, password: string) => {
    const token = await loginUser({ email, password });
    localStorage.setItem(AUTH_TOKEN_KEY, token.access_token);
    const currentUser = await getCurrentUser(token.access_token);
    setUser(toClientUser(currentUser));
  };

  const register = async (email: string, password: string, name: string) => {
    await registerUser({
      full_name: name,
      email,
      password,
    });
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setUser(null);
  };

  const updateTokens = (amount: number) => {
    if (user) {
      setUser({
        ...user,
        tokensRemaining: Math.max(0, user.tokensRemaining + amount),
      });
    }
  };

  const purchaseTokens = (amount: number) => {
    if (user) {
      setUser({
        ...user,
        tokensRemaining: user.tokensRemaining + amount,
        isPremium: true,
      });
    }
  };

  const subscribe = (tier: 'starter' | 'pro' | 'enterprise') => {
    if (!user) return;

    const tokenLimits = {
      starter: 50000,
      pro: 200000,
      enterprise: 1000000,
    };

    const renewDate = new Date();
    renewDate.setMonth(renewDate.getMonth() + 1);

    setUser({
      ...user,
      subscriptionTier: tier,
      isPremium: true,
      tokensRemaining: tokenLimits[tier],
      dailyTokenLimit: tokenLimits[tier],
      subscriptionRenewDate: renewDate.toISOString().split('T')[0],
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateTokens, purchaseTokens, subscribe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
