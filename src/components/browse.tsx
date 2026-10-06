"use client";

import { useEffect, useState, useCallback } from "react";
import { useApp } from "./providers";
import { Navigation } from "./navigation";
import { Search, Filter, User, BookOpen, Award, Mail, Users, ChevronRight } from "lucide-react";
import Link from "next/link";

export function BrowsePage() {
  const { navigateTo, addNotification } = useApp();
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem("studybuddy_token");
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (selectedSubject) params.set("subject", selectedSubject);

      const res = await fetch(`/api/users/search?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setFilteredUsers(data.users || []);
      }
    } catch (error) {
      console.error("Browse error:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedSubject]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    let filtered = users;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.major.toLowerCase().includes(q) ||
          u.subjects.some((s: string) => s.toLowerCase().includes(q)) ||
          u.skills.some((s: any) => s.name.toLowerCase().includes(q))
      );
    }
    if (selectedSubject) {
      filtered = filtered.filter((u) =>
        u.subjects.some((s: string) => s.toLowerCase().includes(selectedSubject.toLowerCase()))
      );
    }
    setFilteredUsers(filtered);
  }, [searchQuery, selectedSubject, users]);

  const allSubjects = Array.from(new Set(users.flatMap((u) => u.subjects))).sort();

  const handleSendRequest = async (targetUser: any, type: "study-group" | "project-partner") => {
    try {
      const token = localStorage.getItem("studybuddy_token");
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          toUserId: targetUser.id,
          type,
          targetId: targetUser.id,
          message: `Hi ${targetUser.name}! I'd love to ${type === "study-group" ? "study with you" : "collaborate on a project with you"}.`,
        }),
      });

      if (res.ok) {
        addNotification({
          type: "success",
          title: "Request Sent!",
          message: `Your request has been sent to ${targetUser.name}.`,
        });
      } else {
        const data = await res.json();
        addNotification({ type: "error", title: "Error", message: data.error || "Failed to send request" });
      }
    } catch {
      addNotification({ type: "error", title: "Error", message: "Failed to send request" });
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navigation />

      <main className="pt-20 md:pt-24 pb-24 md:pb-8 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold mb-2">Browse Students</h1>
          <p className="text-slate-400">Discover and connect with fellow students</p>
        </div>

        {/* Search & Filters */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 animate-slide-up stagger-1">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, subject, or skill..."
              className="input-glass w-full pl-12 pr-4 py-3.5 rounded-xl text-sm"
            />
          </div>
          {allSubjects.length > 0 && (
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="input-glass px-4 py-3.5 rounded-xl text-sm min-w-[200px]"
            >
              <option value="">All Subjects</option>
              {allSubjects.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          )}
        </div>

        {/* Results */}
        <div className="mt-8">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass rounded-2xl p-5 border border-slate-700/50 animate-pulse">
                  <div className="skeleton h-16 w-16 rounded-full mb-4" />
                  <div className="skeleton h-5 w-3/4 mb-2" />
                  <div className="skeleton h-4 w-1/2 mb-4" />
                  <div className="flex gap-2">
                    <div className="skeleton h-6 w-16 rounded-full" />
                    <div className="skeleton h-6 w-20 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">No users found</h3>
              <p className="text-sm text-slate-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user, i) => (
                <div
                  key={user.id}
                  className="card-hover glass rounded-2xl p-5 border border-slate-700/50 animate-slide-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-14 h-14 rounded-full border-2 border-indigo-500/20"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#1e293b]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{user.name}</h3>
                      <p className="text-sm text-slate-400">{user.major || "No major"}</p>
                      <p className="text-xs text-slate-500 capitalize">{user.year?.replace("-", " ")}</p>
                    </div>
                  </div>

                  {user.bio && (
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">{user.bio}</p>
                  )}

                  {user.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {user.subjects.slice(0, 4).map((subject: string) => (
                        <span key={subject} className="skill-tag text-xs px-2.5 py-1 rounded-full">
                          {subject}
                        </span>
                      ))}
                      {user.subjects.length > 4 && (
                        <span className="text-xs text-slate-500 px-2">+{user.subjects.length - 4}</span>
                      )}
                    </div>
                  )}

                  {user.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {user.skills.slice(0, 3).map((skill: any) => (
                        <span key={skill.name} className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-3 border-t border-slate-700/50">
                    <button
                      onClick={() => handleSendRequest(user, "study-group")}
                      className="flex-1 btn-glass text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Study Together
                    </button>
                    <button
                      onClick={() => handleSendRequest(user, "project-partner")}
                      className="flex-1 btn-primary text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Collaborate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}