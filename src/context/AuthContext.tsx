import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
  walletAddress?: string | null;
  role: 'patient' | 'doctor';
  name: string;
}

interface AuthContextType {
  user: User | null;
  userAddress: string | null;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children, initialUser }: { children: React.ReactNode, initialUser: User | null }) {
  const [user, setUser] = useState<User | null>(initialUser);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      userAddress: user?.walletAddress || null,
      setUser 
    }}>
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
