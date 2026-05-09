import { createContext, useContext, useState, ReactNode } from 'react';

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    // Mock login - in production, this would call your API
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock admin user
    if (email === 'admin@vitallm.com') {
      setUser({
        id: '1',
        email,
        name: 'Admin User',
        isAdmin: true,
        tokensRemaining: 1000000,
        dailyTokenLimit: 1000000,
        isPremium: true,
        subscriptionTier: 'enterprise',
        subscriptionRenewDate: '2026-06-09',
      });
    } else {
      setUser({
        id: '2',
        email,
        name: email.split('@')[0],
        isAdmin: false,
        tokensRemaining: 1000,
        dailyTokenLimit: 1000,
        isPremium: false,
        subscriptionTier: 'free',
      });
    }
  };

  const register = async (email: string, password: string, name: string) => {
    // Mock registration
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser({
      id: Math.random().toString(),
      email,
      name,
      isAdmin: false,
      tokensRemaining: 1000,
      dailyTokenLimit: 1000,
      isPremium: false,
      subscriptionTier: 'free',
    });
  };

  const logout = () => {
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
