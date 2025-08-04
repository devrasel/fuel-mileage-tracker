'use client';

import { useState, useEffect } from 'react';
import { UserPayload } from '@/lib/auth';

interface AuthState {
  user: UserPayload | null;
  loading: boolean;
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    loading: true
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const user = await response.json();
        setAuth({ user, loading: false });
      } else {
        setAuth({ user: null, loading: false });
      }
    } catch {
      setAuth({ user: null, loading: false });
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      const data = await response.json();
      setAuth({ user: data.user, loading: false });
      return { success: true };
    } else {
      const error = await response.json();
      return { success: false, error: error.error };
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, user: data.user };
    } else {
      const error = await response.json();
      return { success: false, error: error.error };
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setAuth({ user: null, loading: false });
  };

  return {
    ...auth,
    login,
    register,
    logout,
    checkAuth
  };
}