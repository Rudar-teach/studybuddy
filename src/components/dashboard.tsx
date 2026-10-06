"use client";

import { useEffect, useState } from "react";
import { useApp } from "./providers";
import { Navigation } from "./navigation";
import {
  Users, BookOpen, FolderOpen, TrendingUp, Clock, Award,
  ChevronRight, Sparkles, MessageSquare, Calendar,
  ArrowRight, Plus, Search, Star, Zap
} from "lucide-react";
import Link from "next/link";

export function Dashboard() {
  const { user, navigateTo, groups, setGroups, projects, setProjects, requests, addNotification } = useApp();
  const [stats, setStats] = useState({ groups: 0, projects: 0, matches: 0, requests: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [groupsRes, projectsRes, requestsRes] = await Promise.all([
        fetch("/api/groups"),
        fetch("/api/projects"),
        fetch("/api/requests", {
          headers: { Authorization: `Bearer ${localStorage.getItem("studybuddy_token")}` },
        }),
      ]);

      if (groupsRes.ok) {
        const data = await groupsRes.json();
        setGroups(data.groups || []);
      }
      if (projectsRes.ok) {
        const data = await projectsRes.json();
        setProjects(data.projects || []);
      }
      if (requestsRes.ok) {
        const data = await requestsRes.json();
        // requests state is managed differently
      }
    } catch (error) {
      console.error("Dashboard data load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Study Groups",
      value: groups.length,
      icon: Users,
      color: "from-indigo-500 to-blue-600",
      bgColor: "bg-indigo-500/10",
      action: () => navigateTo("groups"),
    },
    {
      title: "Projects",
      value: projects.length,
      icon: FolderOpen,
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-500/10",
      action: () => navigateTo("projects"),
    },
    {
      title: "Subjects",
      value: user?.subjects?.length || 0,
      icon: BookOpen,
      color: "from-cyan-500 to-blue-600",
      bgColor: "bg-cyan-500/10",
      action: () => navigateTo("profile"),
    },
    {
      title: "Skills",
      value: user?.skills?.length || 0,
      icon: Award,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-500/10",
      action: () => navigateTo("profile"),
    },
  ];

  const quickActions = [
    { title: "Find Study Partners", desc: "Browse and match with students", icon: Users, action: "browse", color: "from-indigo-500 to-blue-600" },
    { title: "Create Study Group", desc: "Start a new group", icon: Plus, action: "groups", color: "from-purple-500 to-pink-600" },
    { title: "Post a Project", desc: "Find collaborators", icon: FolderOpen, action: "projects", color: "from-cyan-500 to-teal-600" },
    { title: "View Matches", desc: "Your top compatibility matches", icon: Sparkles, action: "matches", color: "from-amber-500 to-orange-600" },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navigation />

      <main className="pt-20 md:pt-24 pb-24 md:pb-8 px-4 md:px-6 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Hello,{" "}
            <span className="gradient-text">{user?.name?.split(" ")[0]}</span>
            ! 👋
          </h1>
          <p className="text-slate-400 text-lg">
            Ready to find your next study partner?
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-32 rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statsCards.map((stat, i) => (
                <button
                  key={stat.title}
                  onClick={stat.action}
                  className="card-hover glass rounded-2xl p-5 border border-slate-700/50 text-left animate-slide-up group"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.title}</div>
                </button>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <div className="lg:col-span-2 space-y-6">
                <div className="animate-slide-up stagger-1">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    Quick Actions
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {quickActions.map((action, i) => (
                      <button
                        key={action.title}
                        onClick={() => navigateTo(action.action)}
                        className="card-3d glass rounded-2xl p-5 border border-slate-700/50 text-left group"
                        style={{ animationDelay: `${i * 0.1 + 0.2}s` }}
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                          <action.icon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-semibold text-white mb-1">{action.title}</h3>
                        <p className="text-sm text-slate-400">{action.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* My Groups */}
                {groups.length > 0 && (
                  <div className="animate-slide-up stagger-2">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-400" />
                        My Study Groups
                      </h2>
                      <button
                        onClick={() => navigateTo("groups")}
                        className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        View All <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {groups.slice(0, 3).map((group, i) => (
                        <div
                          key={group.id}
                          onClick={() => { navigateTo("group-detail"); }}
                          className="card-hover glass rounded-2xl p-5 border border-slate-700/50 cursor-pointer"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-white mb-1">{group.name}</h3>
                              <p className="text-sm text-slate-400 line-clamp-2">{group.description}</p>
                              <div className="flex items-center gap-3 mt-3">
                                <span className="skill-tag text-xs px-3 py-1 rounded-full">{group.subject}</span>
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {group.members?.length || 0}/{group.maxMembers}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Profile Card */}
                <div className="glass rounded-2xl p-6 border border-slate-700/50 animate-slide-in-right">
                  <h3 className="text-lg font-semibold text-white mb-4">Your Profile</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={user?.avatar}
                      alt={user?.name}
                      className="w-14 h-14 rounded-full border-2 border-indigo-500/30"
                    />
                    <div>
                      <h4 className="font-medium text-white">{user?.name}</h4>
                      <p className="text-sm text-slate-400">{user?.major || "No major set"}</p>
                      <p className="text-xs text-slate-500 capitalize">{user?.year?.replace("-", " ")}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigateTo("profile")}
                    className="btn-glass w-full py-2.5 rounded-xl text-sm font-medium"
                  >
                    Edit Profile
                  </button>
                </div>

                {/* Subjects */}
                {user?.subjects && user.subjects.length > 0 && (
                  <div className="glass rounded-2xl p-6 border border-slate-700/50 animate-slide-in-right stagger-1">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-cyan-400" />
                      Your Subjects
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {user.subjects.slice(0, 6).map((subject) => (
                        <span key={subject} className="skill-tag text-xs px-3 py-1.5 rounded-full">
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {user?.skills && user.skills.length > 0 && (
                  <div className="glass rounded-2xl p-6 border border-slate-700/50 animate-slide-in-right stagger-2">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-400" />
                      Skills
                    </h3>
                    <div className="space-y-2">
                      {user.skills.slice(0, 5).map((skill) => (
                        <div key={skill.name} className="flex items-center justify-between">
                          <span className="text-sm text-slate-300">{skill.name}</span>
                          <span className="text-xs text-slate-500 capitalize bg-white/5 px-2 py-0.5 rounded-full">
                            {skill.level}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Getting Started Tips */}
                <div className="glass rounded-2xl p-6 border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5 animate-slide-in-right stagger-3">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    Tips
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-400">
                    {(!user?.subjects || user.subjects.length === 0) && (
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>
                        Add subjects to your profile to get better matches
                      </li>
                    )}
                    {(!user?.skills || user.skills.length === 0) && (
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>
                        Add skills to find complementary partners
                      </li>
                    )}
                    {(!user?.availability || user.availability.length === 0) && (
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>
                        Set your availability for better scheduling
                      </li>
                    )}
                    {user?.subjects && user.subjects.length > 0 && (
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5">✓</span>
                        Browse matches to find study partners
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
            </>
          )}
        </main>
    </div>
  );
}