"use client";

import { useApp } from "./providers";
import { BookOpen, Users, FolderOpen, User, Home, Menu, X, Bell, LogOut, Sparkles, Search } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "browse", label: "Browse", icon: Search },
  { id: "matches", label: "Matches", icon: Sparkles },
  { id: "groups", label: "Study Groups", icon: Users },
  { id: "projects", label: "Projects", icon: FolderOpen },
  { id: "profile", label: "Profile", icon: User },
];

export function Navigation() {
  const { user, currentPage, navigateTo, logout, notifications } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.length;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 glass-strong border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => navigateTo("dashboard")}
              className="flex items-center gap-3 group cursor-pointer"
            >
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl rotate-6 group-hover:rotate-12 transition-transform duration-300 opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-indigo-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold gradient-text hidden lg:block">StudyBuddy</span>
            </button>

            {/* Nav Links */}
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.id)}
                    className={`nav-link relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "text-indigo-300 bg-indigo-500/10"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
                      <span className="hidden xl:inline">{item.label}</span>
                    </div>
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-indigo-400 to-cyan-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigateTo("requests")}
                className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-r from-pink-500 to-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center notification-badge">
                    {unreadCount}
                  </span>
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-all"
                >
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <span className="text-sm font-medium text-slate-300 hidden lg:block">
                    {user?.name?.split(" ")[0]}
                  </span>
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 glass rounded-xl border border-slate-700/50 shadow-2xl py-2 animate-menu z-50">
                      <div className="px-4 py-3 border-b border-slate-700/50">
                        <p className="text-sm font-medium text-white">{user?.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
                      </div>
                      <button
                        onClick={() => { navigateTo("profile"); setShowUserMenu(false); }}
                        className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
                      >
                        <User className="w-4 h-4" /> Profile
                      </button>
                      <button
                        onClick={() => { logout(); setShowUserMenu(false); }}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-slate-700/50">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.slice(0, 5).map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-all ${
                  isActive
                    ? "text-indigo-300"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 glass-strong border-b border-slate-700/50 px-4 h-14 flex items-center justify-between">
        <button
          onClick={() => navigateTo("dashboard")}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold gradient-text">StudyBuddy</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo("requests")}
            className="relative p-2 rounded-lg text-slate-400"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-r from-pink-500 to-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <button onClick={logout} className="p-2 rounded-lg text-slate-400 hover:text-red-400">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
}
