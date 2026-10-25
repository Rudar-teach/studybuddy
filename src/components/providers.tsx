"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import {
  subscribeAuth,
  firebaseSignIn,
  firebaseSignUp,
  firebaseSignOut,
  isFirebaseAuthConfigured,
  getFirebaseAuth,
} from "@/lib/firebase-auth";
import type { User, StudyGroup, CollaborationRequest, Message } from "@/types";

/**
 * Mirror the current Firebase ID token into localStorage so that API
 * route fetches made from individual page components can attach it as a
 * Bearer token without each one having to reach into the auth state.
 */
export function syncFirebaseToken() {
  if (typeof window === "undefined") return;
  try {
    const user = getFirebaseAuth().currentUser;
    if (user) {
      // Refresh the ID token lazily; store it so route fetches can attach it.
      user.getIdToken(true)
        .then((t) => window.localStorage.setItem("studybuddy_token", t))
        .catch(() => {
          window.localStorage.setItem(
            "studybuddy_token",
            user.uid
          );
        });
    } else {
      window.localStorage.removeItem("studybuddy_token");
    }
  } catch {
    /* Firebase not ready yet */
  }
}

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  creatorId: string;
  collaborators: string[];
  status: "open" | "in-progress" | "completed";
  createdAt: string;
}

function userFromFirebaseUser(u: {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}): User {
  return {
    id: u.uid,
    email: u.email || "",
    name: u.displayName || u.email?.split("@")[0] || "",
    password: "",
    bio: "",
    subjects: [],
    skills: [],
    availability: [],
    learningGoals: [],
    year: "",
    major: "",
    createdAt: new Date().toISOString(),
    avatar: u.photoURL || "",
  };
}

interface AuthContextType {
  user: User | null;
  session: any | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  isLoading: boolean;
  providerError: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface AppContextType {
  user: User | null;
  session: any | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  isLoading: boolean;
  providerError: boolean;

  currentPage: string;
  navigateTo: (page: string) => void;
  selectedGroupId: string | null;

  groups: StudyGroup[];
  setGroups: React.Dispatch<React.SetStateAction<StudyGroup[]>>;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  requests: CollaborationRequest[];
  setRequests: React.Dispatch<React.SetStateAction<CollaborationRequest[]>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  matches: any[];
  setMatches: React.Dispatch<React.SetStateAction<any[]>>;
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "timestamp">) => void;
  removeNotification: (id: string) => void;

  theme: "dark" | "light";
  toggleTheme: () => void;
}

interface Notification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  timestamp: number;
}

function applyTheme(theme: "dark" | "light") {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.setAttribute("data-theme", "dark");
  } else {
    root.setAttribute("data-theme", "light");
  }
}

const AuthContext = createContext<AuthContextType | null>(null);
const AppContext = createContext<AppContextType | null>(null);

// Hard ceiling so the app can NEVER be blocked on auth init: if the session
// lookup is still pending after this many ms, stop waiting and render the
// app as signed-out. Sign-in still works afterwards.
const AUTH_INIT_TIMEOUT_MS = 6000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [providerError, setProviderError] = useState(false);
  const settledRef = React.useRef(false);

  const settle = useCallback((hadError: boolean) => {
    if (settledRef.current) return;
    settledRef.current = true;
    setProviderError(hadError);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | null = null;

    // Safety net: no matter what happens (network hang, SDK quirk, storage
    // prompt), the loading screen can never block the app forever.
    const timeout = window.setTimeout(() => {
      if (process.env.NODE_ENV === "development") {
        console.warn("Auth init timed out; continuing without a session.");
      }
      settle(true);
    }, AUTH_INIT_TIMEOUT_MS);

    (async () => {
      try {
        if (!isFirebaseAuthConfigured()) {
          // No Firebase keys: run unsigned. The user can still browse the
          // public pages; sign-in will surface a configuration notice.
          settle(false);
          return;
        }

        // onAuthStateChanged resolves the persisted session quickly. Race
        // against the hard timeout so a stuck auth call cannot block the UI.
        let settledFromEvent = false;
        const unsub = subscribeAuth(({ user: fbUser }) => {
          if (!mounted) return;
          settledFromEvent = true;
          setSession(fbUser ? { user: fbUser } : null);
          syncFirebaseToken();
          setUser(fbUser ? userFromFirebaseUser(fbUser) : null);
        });
        unsubscribe = () => unsub();

        await Promise.race([
          new Promise<void>((resolve) => {
            // onAuthStateChanged fires its initial callback shortly after
            // subscribe; poll up to the timeout for it to settle.
            const start = Date.now();
            const tick = () => {
              if (settledFromEvent || Date.now() - start >= AUTH_INIT_TIMEOUT_MS - 500) {
                resolve();
              } else {
                setTimeout(tick, 100);
              }
            };
            tick();
          }),
          new Promise((resolve) => setTimeout(resolve, AUTH_INIT_TIMEOUT_MS - 500)),
        ]);
        settle(false);
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error("Auth init failed:", err);
        }
        if (mounted) settle(true);
      } finally {
        window.clearTimeout(timeout);
      }
    })();

    return () => {
      mounted = false;
      window.clearTimeout(timeout);
      unsubscribe?.();
    };
  }, [settle]);

  const login = useCallback(async (email: string, password: string) => {
    if (!isFirebaseAuthConfigured()) {
      return { success: false, error: "Firebase is not configured. Add your Firebase keys to .env and restart." };
    }
    try {
      await firebaseSignIn(email, password);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || "Sign-in failed" };
    }
  }, []);

  const register = useCallback(async (userData: RegisterData) => {
    if (!isFirebaseAuthConfigured()) {
      return { success: false, error: "Firebase is not configured. Add your Firebase keys to .env and restart." };
    }
    try {
      await firebaseSignUp(userData.name, userData.email, userData.password);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || "Registration failed" };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await firebaseSignOut();
    } catch {
      /* not signed in or Firebase unconfigured */
    }
    syncFirebaseToken();
    setUser(null);
    setSession(null);
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => prev ? { ...prev, ...data } : prev);
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, login, register, logout, updateUser, isLoading, providerError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AppProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  const [currentPage, setCurrentPage] = useState("landing");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [requests, setRequests] = useState<CollaborationRequest[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const navigateTo = useCallback((page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp">) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setNotifications((prev) => [newNotification, ...prev].slice(0, 10));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      applyTheme(next);
      return next;
    });
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <AppContext.Provider
      value={{
        ...auth,
        currentPage,
        navigateTo,
        selectedGroupId,
        groups,
        setGroups,
        projects,
        setProjects,
        requests,
        setRequests,
        messages,
        setMessages,
        matches,
        setMatches,
        notifications,
        addNotification,
        removeNotification,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}