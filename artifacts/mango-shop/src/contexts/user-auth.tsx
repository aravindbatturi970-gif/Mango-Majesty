import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface UserProfile {
  name: string;
  phone: string;
}

interface UserAuthContextValue {
  user: UserProfile | null;
  login: (profile: UserProfile) => void;
  logout: () => void;
  showLoginModal: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const UserAuthContext = createContext<UserAuthContextValue | null>(null);

const STORAGE_KEY = "aamras_user";

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored) as UserProfile);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  function login(profile: UserProfile) {
    setUser(profile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    setShowLoginModal(false);
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  function openLoginModal() {
    setShowLoginModal(true);
  }

  function closeLoginModal() {
    setShowLoginModal(false);
  }

  return (
    <UserAuthContext.Provider
      value={{ user, login, logout, showLoginModal, openLoginModal, closeLoginModal }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error("useUserAuth must be used inside UserAuthProvider");
  return ctx;
}
