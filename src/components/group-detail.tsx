"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useApp } from "./providers";
import { Navigation } from "./navigation";
import { Avatar } from "./Avatar";
import {
  ArrowLeft, Send, Users, MessageSquare, Calendar, BookOpen,
  X, Plus, Link as LinkIcon, Paperclip, CircleCheck, Flag, Trophy, Repeat
} from "lucide-react";

interface ChatMessage {
  id: string;
  senderId: string;
  groupId: string;
  content: string;
  createdAt: string;
}

type Tab = "chat" | "sessions" | "resources" | "checkins";

export function GroupDetailPage() {
  const { navigateTo, groups, user, addNotification } = useApp();
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<Tab>("chat");

  const [sessions, setSessions] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [checkins, setCheckins] = useState<any[]>([]);

  const [sessionForm, setSessionForm] = useState({ day: "Mon", time: "18:00", topic: "", link: "" });
  const [resourceForm, setResourceForm] = useState({ title: "", url: "", type: "link" as "link" | "file" | "note", note: "" });
  const [checkinForm, setCheckinForm] = useState({ status: "in-progress" as "done" | "in-progress" | "blocked", note: "" });

  useEffect(() => {
    const userId = user?.id;
    const userGroup = userId ? groups.find((g) => g.members?.includes(userId)) : undefined;
    if (userGroup) setSelectedGroup(userGroup);
    else if (groups.length > 0) setSelectedGroup(groups[0]);
    else setLoading(false);
  }, [groups, user]);

  const loadAll = useCallback(async () => {
    if (!selectedGroup) return;
    const gid = selectedGroup.id;
    try {
      const [msgs, sess, res, checks] = await Promise.all([
        fetch(`/api/groups/${gid}/messages`).catch(() => null),
        fetch(`/api/groups/${gid}/sessions`).catch(() => null),
        fetch(`/api/groups/${gid}/resources`).catch(() => null),
        fetch(`/api/groups/${gid}/checkins`).catch(() => null),
      ]);
      if (msgs?.ok) setMessages((await msgs.json()).messages || []);
      if (sess?.ok) setSessions((await sess.json()).sessions || []);
      if (res?.ok) setResources((await res.json()).resources || []);
      if (checks?.ok) setCheckins((await checks.json()).checkins || []);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (!selectedGroup) return;
    loadAll();
    const interval = setInterval(loadAll, 4000);
    return () => clearInterval(interval);
  }, [loadAll, selectedGroup]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, tab]);

  const api = async (method: string, url: string, body?: any) => {
    const token = localStorage.getItem("studybuddy_token");
    return fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: body ? JSON.stringify(body) : undefined,
    });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGroup) return;
    const res = await api("POST", `/api/groups/${selectedGroup.id}/messages`, { content: newMessage });
    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      setNewMessage("");
    } else {
      addNotification({ type: "error", title: "Error", message: "Failed to send message" });
    }
  };

  const addSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;
    const res = await api("POST", `/api/groups/${selectedGroup.id}/sessions`, sessionForm);
    if (res.ok) {
      setSessionForm({ day: "Mon", time: "18:00", topic: "", link: "" });
      loadAll();
      addNotification({ type: "success", title: "Session Scheduled", message: "Study session added." });
    }
  };

  const toggleRsvp = async (sessionId: string) => {
    if (!selectedGroup) return;
    const res = await api("POST", `/api/groups/${selectedGroup.id}/sessions`, { rsvp: true, sessionId });
    if (res.ok) loadAll();
  };

  const addResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || (!resourceForm.title && !resourceForm.url)) return;
    const res = await api("POST", `/api/groups/${selectedGroup.id}/resources`, resourceForm);
    if (res.ok) {
      setResourceForm({ title: "", url: "", type: "link", note: "" });
      loadAll();
      addNotification({ type: "success", title: "Resource Added", message: "Shared with the group." });
    }
  };

  const submitCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;
    const res = await api("POST", `/api/groups/${selectedGroup.id}/checkins`, checkinForm);
    if (res.ok) {
      setCheckinForm({ status: "in-progress", note: "" });
      loadAll();
      addNotification({ type: "success", title: "Check-in Logged", message: "Progress shared with the group." });
    }
  };

  const reportGroup = async () => {
    if (!selectedGroup) return;
    const reason = window.prompt("Why are you reporting this group?");
    if (!reason) return;
    const res = await api("POST", "/api/reports", {
      reportedUserId: selectedGroup.creatorId,
      reason,
      details: `Group: ${selectedGroup.name}`,
    });
    if (res.ok) addNotification({ type: "success", title: "Reported", message: "Thanks, we will review it." });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    return date.toDateString() === today.toDateString()
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  if (loading || !selectedGroup) {
    return (
      <div className="min-h-screen bg-[#0f172a]">
        <Navigation />
        <main className="pt-20 md:pt-24 pb-24 md:pb-8 px-4 md:px-6 max-w-5xl mx-auto">
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse mx-auto mb-4" />
            <p className="text-slate-400">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  const myMembership = user?.id ? selectedGroup.members?.includes(user.id) : false;
  const memberList = selectedGroup.members || [];

  const CHECKIN_STYLE: Record<string, { label: string; color: string; icon: any }> = {
    done: { label: "Done", color: "text-emerald-400", icon: CircleCheck },
    "in-progress": { label: "In progress", color: "text-amber-400", icon: Repeat },
    blocked: { label: "Blocked", color: "text-red-400", icon: X },
  };

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "sessions", label: "Sessions", icon: Calendar },
    { id: "resources", label: "Resources", icon: Paperclip },
    { id: "checkins", label: "Check-ins", icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navigation />
      <main className="pt-20 md:pt-24 pb-24 md:pb-8 px-4 md:px-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigateTo("groups")} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Groups
          </button>
          <button onClick={reportGroup} className="flex items-center gap-2 text-xs text-slate-400 hover:text-red-400 transition-colors">
            <Flag className="w-3.5 h-3.5" /> Report
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="glass rounded-2xl p-6 border border-slate-700/50 animate-slide-in-left">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">{selectedGroup.name}</h2>
              <span className="skill-tag text-xs px-2.5 py-1 rounded-full">{selectedGroup.subject}</span>
              <p className="text-sm text-slate-400 mt-3">{selectedGroup.description || "No description"}</p>
              <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>{memberList.length} members</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  <span>{messages.length} messages</span>
                </div>
              </div>
            </div>

            {/* Members */}
            <div className="glass rounded-2xl p-6 border border-slate-700/50 animate-slide-in-left stagger-1">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                Members
              </h3>
              <div className="space-y-2">
                {memberList.slice(0, 8).map((memberId: string, i: number) => (
                  <div key={memberId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <Avatar name={memberId === user?.id ? user?.name : `Member ${i + 1}`} seed={memberId} size="sm" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        {memberId === user?.id ? "You" : `Member ${i + 1}`}
                      </p>
                      <p className="text-xs text-emerald-400">Active</p>
                    </div>
                    {i === 0 && memberList.length > 1 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium">Top</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Tab bar */}
            <div className="flex gap-1 mb-4 overflow-x-auto">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    tab === t.id
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <t.icon className="w-4 h-4" />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Chat tab */}
            {tab === "chat" && (
              <div className="glass rounded-2xl border border-slate-700/50 flex flex-col h-[560px] animate-slide-in-right overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === user?.id;
                      return (
                        <div key={msg.id} className={`flex gap-3 mb-3 ${isMe ? "flex-row-reverse" : ""}`}>
                          <Avatar name={isMe ? user?.name : `User ${msg.senderId.slice(0, 4)}`} seed={msg.senderId} size="sm" />
                          <div className={`max-w-[70%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                            <div className={`px-4 py-2.5 rounded-2xl ${isMe ? "chat-bubble-sent" : "chat-bubble-received"}`}>
                              <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                            </div>
                            <span className="text-[10px] text-slate-500 mt-1 px-1">{formatTime(msg.createdAt)}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={sendMessage} className="p-4 border-t border-slate-700/50">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="input-glass flex-1 px-4 py-3 rounded-xl text-sm"
                    />
                    <button type="submit" disabled={!newMessage.trim()} className="btn-primary px-5 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Sessions tab */}
            {tab === "sessions" && (
              <div className="glass rounded-2xl border border-slate-700/50 p-6 animate-slide-in-right space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-400" /> Study Sessions
                </h3>

                {myMembership && (
                  <form onSubmit={addSession} className="glass rounded-xl p-4 border border-slate-700/50 grid sm:grid-cols-2 gap-3">
                    <select value={sessionForm.day} onChange={(e) => setSessionForm((p) => ({ ...p, day: e.target.value as any }))} className="input-glass px-3 py-2.5 rounded-lg text-sm">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <option key={d}>{d}</option>)}
                    </select>
                    <input type="time" value={sessionForm.time} onChange={(e) => setSessionForm((p) => ({ ...p, time: e.target.value }))} className="input-glass px-3 py-2.5 rounded-lg text-sm" />
                    <input value={sessionForm.topic} onChange={(e) => setSessionForm((p) => ({ ...p, topic: e.target.value }))} placeholder="Topic (e.g. Calculus)" className="input-glass px-3 py-2.5 rounded-lg text-sm" />
                    <input value={sessionForm.link} onChange={(e) => setSessionForm((p) => ({ ...p, link: e.target.value }))} placeholder="Meeting link (optional)" className="input-glass px-3 py-2.5 rounded-lg text-sm" />
                    <button type="submit" className="sm:col-span-2 btn-primary py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" /> Schedule Session
                    </button>
                  </form>
                )}

                {sessions.length === 0 ? (
                  <p className="text-sm text-slate-500 py-6 text-center">No sessions scheduled yet.</p>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((s) => {
                      const rsvps = s.rsvps || [];
                      const iAmRsvp = user?.id ? rsvps.includes(user.id) : false;
                      return (
                        <div key={s.id} className="glass rounded-xl p-4 border border-slate-700/50 flex flex-wrap items-center gap-3">
                          <div className="w-14 h-14 rounded-xl bg-indigo-500/10 flex flex-col items-center justify-center text-center">
                            <span className="text-xs text-indigo-300 font-medium">{s.day}</span>
                            <span className="text-sm text-white font-semibold">{s.time}</span>
                          </div>
                          <div className="flex-1 min-w-[120px]">
                            <p className="text-sm font-medium text-white">{s.topic || "Study session"}</p>
                            {s.link && (
                              <a href={s.link} target="_blank" rel="noreferrer" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mt-1">
                                <LinkIcon className="w-3 h-3" /> Open link
                              </a>
                            )}
                          </div>
                          <button
                            onClick={() => toggleRsvp(s.id)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                              iAmRsvp
                                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                                : "text-slate-400 border-slate-700 hover:text-white hover:border-indigo-500/30"
                            }`}
                          >
                            {iAmRsvp ? "Going" : "RSVP"} · {rsvps.length}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Resources tab */}
            {tab === "resources" && (
              <div className="glass rounded-2xl border border-slate-700/50 p-6 animate-slide-in-right space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Paperclip className="w-5 h-5 text-cyan-400" /> Shared Resources
                </h3>

                {myMembership && (
                  <form onSubmit={addResource} className="glass rounded-xl p-4 border border-slate-700/50 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <input value={resourceForm.title} onChange={(e) => setResourceForm((p) => ({ ...p, title: e.target.value }))} placeholder="Title" className="input-glass flex-1 px-3 py-2.5 rounded-lg text-sm min-w-[100px]" />
                      <select value={resourceForm.type} onChange={(e) => setResourceForm((p) => ({ ...p, type: e.target.value as any }))} className="input-glass px-3 py-2.5 rounded-lg text-sm">
                        <option value="link">Link</option>
                        <option value="note">Note</option>
                        <option value="file">File</option>
                      </select>
                    </div>
                    {resourceForm.type !== "note" ? (
                      <input value={resourceForm.url} onChange={(e) => setResourceForm((p) => ({ ...p, url: e.target.value }))} placeholder="URL" className="input-glass w-full px-3 py-2.5 rounded-lg text-sm" />
                    ) : (
                      <input value={resourceForm.note} onChange={(e) => setResourceForm((p) => ({ ...p, note: e.target.value }))} placeholder="Note text" className="input-glass w-full px-3 py-2.5 rounded-lg text-sm" />
                    )}
                    <button type="submit" className="btn-primary px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Share
                    </button>
                  </form>
                )}

                {resources.length === 0 ? (
                  <p className="text-sm text-slate-500 py-6 text-center">Nothing shared yet.</p>
                ) : (
                  <div className="space-y-2">
                    {resources.map((r) => (
                      <div key={r.id} className="glass rounded-xl p-4 border border-slate-700/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-white">{r.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 uppercase">{r.type}</span>
                        </div>
                        {r.url && (
                          <a href={r.url} target="_blank" rel="noreferrer" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                            <LinkIcon className="w-3 h-3" /> {r.url}
                          </a>
                        )}
                        {r.note && <p className="text-xs text-slate-400 mt-1">{r.note}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Check-ins tab */}
            {tab === "checkins" && (
              <div className="glass rounded-2xl border border-slate-700/50 p-6 animate-slide-in-right space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" /> Progress Check-ins
                </h3>

                {myMembership && (
                  <form onSubmit={submitCheckin} className="glass rounded-xl p-4 border border-slate-700/50 space-y-3">
                    <div className="flex gap-2">
                      {(["done", "in-progress", "blocked"] as const).map((s) => {
                        const style = CHECKIN_STYLE[s];
                        const Icon = style.icon;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setCheckinForm((p) => ({ ...p, status: s }))}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border transition-colors ${
                              checkinForm.status === s
                                ? `border-current ${style.color} bg-white/5`
                                : "border-slate-700 text-slate-400"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" /> {style.label}
                          </button>
                        );
                      })}
                    </div>
                    <input value={checkinForm.note} onChange={(e) => setCheckinForm((p) => ({ ...p, note: e.target.value }))} placeholder="What did you work on this week?" className="input-glass w-full px-3 py-2.5 rounded-lg text-sm" />
                    <button type="submit" className="btn-primary w-full py-2.5 rounded-lg text-sm font-medium">
                      Log Check-in
                    </button>
                  </form>
                )}

                {checkins.length === 0 ? (
                  <p className="text-sm text-slate-500 py-6 text-center">No check-ins yet.</p>
                ) : (
                  <div className="space-y-2">
                    {checkins.slice(0, 20).map((c) => {
                      const style = CHECKIN_STYLE[c.status] || CHECKIN_STYLE["in-progress"];
                      const Icon = style.icon;
                      return (
                        <div key={c.id} className="glass rounded-xl p-4 border border-slate-700/50 flex items-start gap-3">
                          <Avatar name={c.userId === user?.id ? user?.name : "Member"} seed={c.userId} size="sm" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className={`w-3.5 h-3.5 ${style.color}`} />
                              <span className={`text-xs font-medium ${style.color}`}>{style.label}</span>
                              <span className="text-[11px] text-slate-500">
                                {c.userId === user?.id ? "You" : "Member"} · {formatTime(c.createdAt)}
                              </span>
                            </div>
                            {c.note && <p className="text-sm text-slate-300">{c.note}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
