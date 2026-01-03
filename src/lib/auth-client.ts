"use client";

import { useState, useEffect } from "react";

export type User = {
  id: number;
  name: string;
  email: string;
  userType: "EMPLOYEE" | "ADMIN";
  phone?: string | null;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    
    // Also check auth when window gains focus (user comes back to tab)
    const handleFocus = () => {
      checkAuth();
    };
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  async function checkAuth() {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/me", {
        cache: 'no-store',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isEmployee: user?.userType === "EMPLOYEE",
    isAdmin: user?.userType === "ADMIN",
    logout,
    refresh: checkAuth,
  };
}

