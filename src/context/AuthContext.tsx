"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Role = "kei" | "cass" | null;

interface AuthContextType {
  role: Role;
  loading: boolean;
  loginWithPasscode: (passcode: string) => boolean;
  selectProfile: (selectedRole: "kei" | "cass") => void;
  switchProfile: () => void;
  claimProfile: (selectedRole: "kei" | "cass") => void; // Alias for backward compatibility
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Sync data-role attribute on document root whenever role changes
  useEffect(() => {
    if (role) {
      document.documentElement.setAttribute("data-role", role);
    } else {
      document.documentElement.removeAttribute("data-role");
    }
  }, [role]);

  // Load role and auth status from localStorage on mount
  useEffect(() => {
    const isAuthStored = localStorage.getItem("mock_authenticated") === "true";
    const storedRole = localStorage.getItem("mock_role") as Role;

    if (isAuthStored || storedRole) {
      setIsAuthenticated(true);
    }

    if (storedRole) {
      setRole(storedRole);
      document.documentElement.setAttribute("data-role", storedRole);
    }

    setLoading(false);
  }, []);

  const loginWithPasscode = (passcode: string) => {
    if (passcode === "021426") {
      localStorage.setItem("mock_authenticated", "true");
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const selectProfile = (selectedRole: "kei" | "cass") => {
    localStorage.setItem("mock_role", selectedRole);
    setRole(selectedRole);
    document.documentElement.setAttribute("data-role", selectedRole);
  };

  const switchProfile = () => {
    localStorage.removeItem("mock_role");
    setRole(null);
    document.documentElement.removeAttribute("data-role");
  };

  return (
    <AuthContext.Provider value={{
      role,
      loading,
      loginWithPasscode,
      selectProfile,
      switchProfile,
      claimProfile: selectProfile,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
