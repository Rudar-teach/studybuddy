"use client";

import { useEffect, useState, useCallback } from "react";
import { useApp } from "./providers";
import { Navigation } from "./navigation";
import { Sparkles, TrendingUp, Users, Mail, BookOpen, Award, ChevronRight, Star, Zap, ArrowRight, Clock, Heart, Flag } from "lucide-react";

export function MatchesPage() {
  const { navigateTo, user, addNotification, setMatches, logout } = useApp();
  const [matches, setLocalMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "mutual" | "high" | "available">("all");
  const [reported, setReported] = useState<Record<string, boolean>>({});

  const loadMatches = useCallback(async () => {
    try {
      const token = localStorage.getItem("studybuddy_token");
      const res = await fetch("/api/users/matches", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const list = data.matches || [];
        setLocalMatches(list);
        setMatches(list);
      }
    } catch (error) {
      console.error("Matches error:", error);
    } finally {
      setLoading(false);
    }
  }, [setMatches]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const filtered = matches.filter((m) => {
    if (filter === "mutual") return m.mutual;
    if (filter === "high") return m.score >= 80;
    if (filter === "available") return m.user?.activeThisWeek;
    return true;
  });

  const mutualCount = matches.filter((m) => m.mutual).length;

  const handleReport = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const reason = window.prompt(
      "Why are you reporting this user?\n(spam, harassment, fake, other)"
    );
    if (!reason) return;
    const details = window.prompt("Add details (optional)") || "";
    const block = window.confirm("Block this user so they stop appearing in your matches?") ? "yes" : "no";
    try {
      const token = localStorage.getItem("studybuddy_token");
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reportedUserId: userId, reason, details, block: block === "yes" }),
      });
      if (res.ok) {
        setReported((prev) => ({ ...prev, [userId]: true }));
        addNotification({
          type: "success",
          title: "Reported",
          message: block === "yes" ? "User reported and blocked." : "User reported. Thank you.",
        });
        // Reload to hide blocked users
        loadMatches();
      }
    } catch {
      addNotification({ type: "error", title: "Error", message: "Failed to report user" });
    }
  };

  const handleSendRequest = async (targetUser: any) => {
    try {
      const token = localStorage.getItem("studybuddy_token");
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          toUserId: targetUser.user.id,
          type: "study-group",
          targetId: targetUser.user.id,
          message: `Hi ${targetUser.user.name}! We have a ${targetUser.score}% match. Let's connect!`,
        }),
      });

      if (res.ok) {
        addNotification({
          type: "success",
          title: "Request Sent!",
          message: `Connection request sent to ${targetUser.user.name}`,
        });
      }
    } catch {
      addNotification({ type: "error", title: "Error", message: "Failed to send request" });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "from-emerald-500 to-green-500";
    if (score >= 60) return "from-amber-500 to-orange-500";
    if (score >= 40) return "from-cyan-500 to-cyan-500";
    return "from-slate-500 to-slate-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Fair Match";
    return "Low Match";
  };

  return (
    <div className="min-h-screen bg-[#082336]">
      <Navigation />

      <main className="pt-20 md:pt-24 pb-24 md:pb-8 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="animate-slide-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Your Matches</h1>
              <p className="text-slate-400">Students ranked by compatibility with your profile</p>
            </div>
          </div>
        </div>

        {/* How matching works */}
        <div className="mt-8 glass rounded-2xl p-6 border border-teal-500/10 bg-gradient-to-r from-teal-500/5 to-cyan-500/5 animate-slide-up stagger-1">
          <h3 className="text-sm font-semibold text-teal-300 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            How Matching Works
          </h3>
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { label: "Shared Subjects", weight: "30%", icon: BookOpen },
              { label: "Complementary Skills", weight: "25%", icon: Award },
              { label: "Schedule Overlap", weight: "25%", icon: Clock },
              { label: "Learning Goals", weight: "20%", icon: Star },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-teal-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-300">{item.label}</p>
                  <p className="text-xs text-teal-400">{item.weight}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters (feature 2) */}
        <div className="mt-8 flex flex-wrap gap-3 animate-slide-up stagger-2">
          {(
            [
              { id: "all", label: "All Matches" },
              { id: "mutual", label: `Mutual (${mutualCount})` },
              { id: "high", label: "80%+" },
              { id: "available", label: "Active This Week" },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f.id
                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Matches Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass rounded-2xl p-6 border border-slate-700/50">
                  <div className="skeleton h-16 w-16 rounded-full mb-4" />
                  <div className="skeleton h-5 w-3/4 mb-2" />
                  <div className="skeleton h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-20">
              <Sparkles className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">No matches yet</h3>
              <p className="text-sm text-slate-500 mb-6">Complete your profile to get personalized matches</p>
              <button onClick={() => navigateTo("profile")} className="btn-primary px-6 py-3 rounded-xl text-sm font-medium">
                Complete Profile
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Sparkles className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">No matches in this view</h3>
              <p className="text-sm text-slate-500">Try a different filter.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((match, i) => {
                const matchUser = match.user;
                return (
                  <div
                    key={matchUser.id}
                    className="card-3d glass rounded-2xl p-6 border border-slate-700/50 animate-slide-up"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    {/* Score Ring */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getScoreColor(match.score)} flex items-center justify-center`}>
                          <span className="text-xl font-bold text-white">{match.score}%</span>
                        </div>
                        {matchUser.activeThisWeek && (
                          <span
                            title="Active this week"
                            className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#082336]"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white truncate">{matchUser.name}</h3>
                          {match.mutual && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              Mutual
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400">{matchUser.major || "Student"}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${getScoreColor(match.score)} text-white font-medium`}>
                            {getScoreLabel(match.score)}
                          </span>
                          {matchUser.lastActiveLabel && (
                            <span className="text-[11px] text-slate-500">{matchUser.lastActiveLabel}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Match Reasons */}
                    <div className="space-y-1.5 mb-4">
                      {match.reasons.map((reason: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-400">
                          <Star className="w-3 h-3 text-amber-400 flex-shrink-0" />
                          {reason}
                        </div>
                      ))}
                    </div>

                    {/* Shared Items Preview */}
                    {matchUser.subjects.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {matchUser.subjects.slice(0, 3).map((subject: string) => (
                          <span key={subject} className="skill-tag text-xs px-2 py-0.5 rounded-full">
                            {subject}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSendRequest(match)}
                        className="btn-primary flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        Connect
                      </button>
                      <button
                        onClick={(e) => handleReport(matchUser.id, e)}
                        title="Report this user"
                        className="px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-slate-700/50 transition-colors"
                      >
                        <Flag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}