"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
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

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
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
  // Auth
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  isLoading: boolean;

  // Navigation
  currentPage: string;
  navigateTo: (page: string) => void;
  selectedGroupId: string | null;

  // Data
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

  // Theme
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
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("studybuddy_token");
    const storedUser = localStorage.getItem("studybuddy_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("studybuddy_token", data.token);
      localStorage.setItem("studybuddy_user", JSON.stringify(data.user));
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  }, []);

  const register = useCallback(async (userData: RegisterData) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("studybuddy_token", data.token);
      localStorage.setItem("studybuddy_user", JSON.stringify(data.user));
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("studybuddy_token");
    localStorage.removeItem("studybuddy_user");
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => prev ? { ...prev, ...data } : prev);
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("studybuddy_user");
      if (stored) {
        localStorage.setItem("studybuddy_user", JSON.stringify({ ...JSON.parse(stored), ...data }));
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateUser, isLoading }}>
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
