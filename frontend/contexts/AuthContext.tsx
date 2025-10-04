import React, { createContext, useContext, useState, useCallback } from "react";
import api from "../services/api";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (
    name: string,
    email: string,
    password: string,
    country: string
  ) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await api.auth.login(email, password);
      setUser(response.user);
      localStorage.setItem("token", response.access_token);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string, country: string) => {
      try {
        const response = await api.auth.signup(name, email, password, country);
        setUser(response.user);
        localStorage.setItem("token", response.access_token);
        return true;
      } catch (error) {
        console.error("Signup failed:", error);
        return false;
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("token");
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      await api.auth.resetPassword(email);
    } catch (error) {
      console.error("Reset password failed:", error);
      throw error;
    }
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
