"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { createSupabaseClient } from "@/lib/supabase";
import type { User, StudyGroup, CollaborationRequest, Message } from "@/types";

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

function userFromSession(session: any): User {
  return {
    id: session.user.id,
    email: session.user.email || "",
    name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "",
    password: "",
    bio: session.user.user_metadata?.bio || "",
    subjects: session.user.user_metadata?.subjects || [],
    skills: session.user.user_metadata?.skills || [],
    availability: session.user.user_metadata?.availability || [],
    learningGoals: session.user.user_metadata?.learning_goals || [],
    year: session.user.user_metadata?.year || "",
    major: session.user.user_metadata?.major || "",
    createdAt: session.user.created_at || new Date().toISOString(),
    avatar: session.user.user_metadata?.avatar_url || "",
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

const AuthContext = createContext<AuthContextType | null>(null);
const AppContext = createContext<AppContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | null = null;

    (async () => {
      const supabase = createSupabaseClient();
      if (!supabase) {
        if (mounted) setIsLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(session);
      if (session?.user) setUser(userFromSession(session));
      setIsLoading(false);

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return;
        setSession(session);
        if (session?.user) setUser(userFromSession(session));
        else setUser(null);
      });
      unsubscribe = () => data.subscription.unsubscribe();
    })();

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const supabase = createSupabaseClient();
      if (!supabase) return { success: false, error: "Supabase not configured" };
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  }, []);

  const register = useCallback(async (userData: RegisterData) => {
    try {
      const supabase = createSupabaseClient();
      if (!supabase) return { success: false, error: "Supabase not configured" };
      const { error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: { data: { full_name: userData.name } },
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  }, []);

  const logout = useCallback(async () => {
    const supabase = createSupabaseClient();
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => prev ? { ...prev, ...data } : prev);
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, login, register, logout, updateUser, isLoading }}>
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
    setTheme((prev) => prev === "dark" ? "light" : "dark");
  }, []);

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