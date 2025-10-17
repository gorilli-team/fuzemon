"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { usePrivy, useLogout, useLogin, type User } from "@privy-io/react-auth";

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  user: User | null;
  address: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if Privy is available
  const hasPrivyAppId = !!process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  const privy = usePrivy();
  const { logout: privyLogout } = useLogout();
  const { login: privyLogin } = useLogin({
    onComplete: () => {
      handlePrivyLogin();
    },
  });

  const logout = useCallback(async () => {
    try {
      setIsAuthenticated(false);
      setToken(null);
      await privyLogout();
    } catch (error) {
      console.error("Error during logout:", error);
      setIsAuthenticated(false);
      setToken(null);
    }
  }, [privyLogout]);

  const login = useCallback(() => {
    if (!hasPrivyAppId) {
      console.warn("Privy App ID not configured. Wallet connection disabled.");
      return;
    }
    privyLogin();
  }, [privyLogin, hasPrivyAppId]);

  const handlePrivyLogin = useCallback(async () => {
    if (!privy.ready || !privy.authenticated || !privy.user?.wallet?.address) {
      return;
    }

    setIsLoading(true);

    // For now, we'll just set authenticated to true
    // In a real app, you'd verify with your backend
    setToken("mock-token");
    setIsAuthenticated(true);
    setIsLoading(false);
  }, [privy]);

  useEffect(() => {
    // If Privy is not available, set loading to false
    if (!hasPrivyAppId) {
      setIsLoading(false);
      return;
    }

    if (!privy.ready) return;

    if (privy.authenticated && privy.user?.wallet?.address) {
      setToken("mock-token");
      setIsAuthenticated(true);
      setIsLoading(false);
    } else {
      setIsAuthenticated(false);
      setToken(null);
      setIsLoading(false);
    }
  }, [privy.ready, privy.authenticated, privy.user, hasPrivyAppId]);

  const contextValue = {
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    user: privy.user,
    address: privy.user?.wallet?.address || null,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
