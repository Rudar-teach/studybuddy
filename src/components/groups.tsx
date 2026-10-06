"use client";

import { useEffect, useState, useCallback } from "react";
import { useApp } from "./providers";
import { Navigation } from "./navigation";
import { Plus, Users, BookOpen, Calendar, ChevronRight, MessageSquare, LogOut, Search, Clock } from "lucide-react";
import Link from "next/link";

const SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science",
  "Data Science", "Machine Learning", "Web Development", "Mobile Development",
  "Artificial Intelligence", "Statistics", "Economics", "Psychology",
  "English Literature", "History", "Philosophy", "Engineering",
  "Medicine", "Law", "Business", "Design", "Music",
];

export function GroupsPage() {
  const { navigateTo, groups, setGroups, addNotification, user } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    subject: "",
    maxMembers: 10,
  });

  const loadGroups = useCallback(async () => {
    try {
      const res = await fetch("/api/groups");
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups || []);
      }
    } catch (error) {
      console.error("Groups error:", error);
    } finally {
      setLoading(false);
    }
  }, [setGroups]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("studybuddy_token");
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newGroup),
      });

      if (res.ok) {
        const data = await res.json();
        setGroups((prev) => [...prev, data.group]);
        setShowCreateModal(false);
        setNewGroup({ name: "", description: "", subject: "", maxMembers: 10 });
        addNotification({ type: "success", title: "Group Created!", message: "Your study group has been created." });
        loadGroups();
      } else {
        const data = await res.json();
        addNotification({ type: "error", title: "Error", message: data.error });
      }
    } catch {
      addNotification({ type: "error", title: "Error", message: "Failed to create group" });
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const token = localStorage.getItem("studybuddy_token");
      const res = await fetch(`/api/groups/${groupId}/join`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setGroups((prev) => prev.map((g) => g.id === groupId ? data.group : g));
        addNotification({ type: "success", title: "Joined!", message: "You've joined the group." });
      } else {
        const data = await res.json();
        addNotification({ type: "error", title: "Error", message: data.error });
      }
    } catch {
      addNotification({ type: "error", title: "Error", message: "Failed to join group" });
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      const token = localStorage.getItem("studybuddy_token");
      const res = await fetch(`/api/groups/${groupId}/leave`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setGroups((prev) => prev.map((g) => g.id === groupId ? data.group : g));
        addNotification({ type: "success", title: "Left Group", message: "You've left the group." });
      }
    } catch {
      addNotification({ type: "error", title: "Error", message: "Failed to leave group" });
    }
  };

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navigation />

      <main className="pt-20 md:pt-24 pb-24 md:pb-8 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up">
          <div>
            <h1 className="text-3xl font-bold mb-1">Study Groups</h1>
            <p className="text-slate-400">Join or create study groups</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium"
          >
            <Plus className="w-5 h-5" />
            Create Group
          </button>
        </div>

        {/* Search */}
        <div className="mt-6 animate-slide-up stagger-1">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groups..."
              className="input-glass w-full pl-12 pr-4 py-3 rounded-xl text-sm"
            />
          </div>
        </div>

        {/* Groups Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass rounded-2xl p-6 border border-slate-700/50 animate-pulse">
                  <div className="skeleton h-6 w-3/4 mb-3" />
                  <div className="skeleton h-4 w-full mb-2" />
                  <div className="skeleton h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">No groups yet</h3>
              <p className="text-sm text-slate-500 mb-6">Be the first to create a study group!</p>
              <button onClick={() => setShowCreateModal(true)} className="btn-primary px-6 py-3 rounded-xl text-sm font-medium">
                Create First Group
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGroups.map((group, i) => {
                const userId = user?.id;
                const isMember = userId ? group.members?.includes(userId) : false;
                const isCreator = userId ? group.creatorId === userId : false;
                const isFull = (group.members?.length || 0) >= group.maxMembers;

                return (
                  <div
                    key={group.id}
                    className="card-hover glass rounded-2xl p-6 border border-slate-700/50 animate-slide-up"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${isCreator ? 'from-amber-500 to-orange-600' : 'from-indigo-500 to-purple-600'} flex items-center justify-center`}>
                        {isCreator ? <BookOpen className="w-5 h-5 text-white" /> : <Users className="w-5 h-5 text-white" />}
                      </div>
                      <span className="skill-tag text-xs px-2.5 py-1 rounded-full">{group.subject}</span>
                    </div>

                    <h3 className="font-semibold text-white mb-2">{group.name}</h3>
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">{group.description || "No description"}</p>

                    <div className="flex items-center gap-4 mb-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {group.members?.length || 0}/{group.maxMembers} members
                      </span>
                      {isCreator && (
                        <span className="text-amber-400 font-medium">Creator</span>
                      )}
                      {isMember && (
                        <span className="text-emerald-400 font-medium">Joined</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {isMember && !isCreator ? (
                        <button
                          onClick={() => handleLeaveGroup(group.id)}
                          className="flex-1 py-2.5 rounded-xl text-sm font-medium text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-1"
                        >
                          <LogOut className="w-4 h-4" />
                          Leave
                        </button>
                      ) : !isMember && !isFull ? (
                        <button
                          onClick={() => handleJoinGroup(group.id)}
                          className="flex-1 btn-primary py-2.5 rounded-xl text-sm font-medium"
                        >
                          Join Group
                        </button>
                      ) : isFull && !isMember ? (
                        <button disabled className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-500 bg-white/5 cursor-not-allowed">
                          Group Full
                        </button>
                      ) : null}
                      {isMember && (
                        <button
                          onClick={() => navigateTo("group-detail")}
                          className="flex-1 btn-glass py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Chat
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Group Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="modal-backdrop absolute inset-0" onClick={() => setShowCreateModal(false)} />
            <div className="relative glass rounded-2xl p-8 border border-slate-700/50 max-w-lg w-full animate-scale-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Create Study Group</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                  <LogOut className="w-5 h-5 rotate-180" />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Group Name</label>
                  <input
                    type="text"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Data Science Study Group"
                    className="input-glass w-full px-4 py-3 rounded-xl text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                  <select
                    value={newGroup.subject}
                    onChange={(e) => setNewGroup((prev) => ({ ...prev, subject: e.target.value }))}
                    className="input-glass w-full px-4 py-3 rounded-xl text-sm"
                    required
                  >
                    <option value="">Select a subject</option>
                    {SUBJECTS.map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <textarea
                    value={newGroup.description}
                    onChange={(e) => setNewGroup((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this group is about..."
                    rows={3}
                    className="input-glass w-full px-4 py-3 rounded-xl text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Max Members</label>
                  <input
                    type="number"
                    value={newGroup.maxMembers}
                    onChange={(e) => setNewGroup((prev) => ({ ...prev, maxMembers: parseInt(e.target.value) || 10 }))}
                    min={2}
                    max={50}
                    className="input-glass w-full px-4 py-3 rounded-xl text-sm"
                  />
                </div>

                <button type="submit" className="btn-primary w-full py-3.5 rounded-xl font-semibold">
                  Create Group
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}