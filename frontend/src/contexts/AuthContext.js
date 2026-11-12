'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import authService from '../services/authService';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Hydrate user on mount
  useEffect(() => {
    const hydrateUser = async () => {
      const storedToken = api.getToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      setTokenState(storedToken);
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to authenticate stored session:', error.message);
        api.setToken(null);
        setTokenState(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    hydrateUser();
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const data = await authService.login({ email, password });
      setUser(data.user);
      setTokenState(data.token);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (formData) => {
    setIsLoading(true);
    try {
      const data = await authService.register(formData);
      setUser(data.user);
      setTokenState(data.token);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setTokenState(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
