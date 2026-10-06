"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useApp } from "./providers";
import { Navigation } from "./navigation";
import { ArrowLeft, Send, Users, MessageSquare, Calendar, BookOpen, Sparkles, Heart, Smile, Settings, MoreVertical, X } from "lucide-react";

interface ChatMessage {
  id: string;
  senderId: string;
  groupId: string;
  content: string;
  createdAt: string;
}

export function GroupDetailPage() {
  const { navigateTo, groups, user, addNotification } = useApp();
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [typing, setTyping] = useState<string[]>([]);

  useEffect(() => {
    // Select first group user is a member of
    const userId = user?.id;
    const userGroup = userId ? groups.find((g) => g.members?.includes(userId)) : undefined;
    if (userGroup) {
      setSelectedGroup(userGroup);
    } else if (groups.length > 0) {
      setSelectedGroup(groups[0]);
    } else {
      setLoading(false);
    }
  }, [groups, user]);

  const loadMessages = useCallback(async () => {
    if (!selectedGroup) return;
    try {
      const res = await fetch(`/api/groups/${selectedGroup.id}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Messages error:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedGroup]);

  useEffect(() => {
    loadMessages();
    // Poll for new messages every 3 seconds
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGroup) return;

    try {
      const token = localStorage.getItem("studybuddy_token");
      const res = await fetch(`/api/groups/${selectedGroup.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newMessage }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
      }
    } catch {
      addNotification({ type: "error", title: "Error", message: "Failed to send message" });
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const groupedMessages = messages.reduce((acc, msg) => {
    const date = new Date(msg.createdAt).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {} as Record<string, ChatMessage[]>);

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

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navigation />

      <main className="pt-20 md:pt-24 pb-24 md:pb-8 px-4 md:px-6 max-w-5xl mx-auto">
        <button
          onClick={() => navigateTo("groups")}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Groups
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Group Info Sidebar */}
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
                  <span>{selectedGroup.members?.length || 0} members</span>
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
                <Users className="w-4 h-4" />
                Members
              </h3>
              <div className="space-y-2">
                {selectedGroup.members?.slice(0, 8).map((memberId: string, i: number) => {
                  const initials = memberId.substring(0, 2).toUpperCase();
                  return (
                    <div key={memberId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-medium text-white">
                        {initials}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">
                          {memberId === user?.id ? "You" : `Member ${i + 1}`}
                        </p>
                        <p className="text-xs text-emerald-400">Active</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <div className="glass rounded-2xl border border-slate-700/50 flex flex-col h-[600px] animate-slide-in-right overflow-hidden">
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{selectedGroup.name}</h3>
                    <p className="text-xs text-slate-400">{selectedGroup.members?.length || 0} members</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1 text-xs text-emerald-400">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 status-online" />
                    Online
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  Object.entries(groupedMessages).map(([date, dayMessages]) => (
                    <div key={date}>
                      <div className="text-center mb-4">
                        <span className="text-xs text-slate-500 bg-white/5 px-3 py-1 rounded-full">
                          {date}
                        </span>
                      </div>
                      {dayMessages.map((msg, idx) => {
                        const isMe = msg.senderId === user?.id;
                        const showAvatar = idx === 0 || dayMessages[idx - 1]?.senderId !== msg.senderId;
                        return (
                          <div
                            key={msg.id}
                            className={`flex gap-3 mb-3 ${isMe ? "flex-row-reverse" : ""} animate-slide-up`}
                            style={{ animationDelay: `${idx * 0.05}s` }}
                          >
                            {showAvatar ? (
                              <div className={`w-8 h-8 rounded-full ${isMe ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-emerald-500 to-cyan-500'} flex items-center justify-center text-xs font-medium text-white flex-shrink-0`}>
                                {isMe ? user?.name?.charAt(0).toUpperCase() : msg.senderId.substring(0, 2).toUpperCase()}
                              </div>
                            ) : (
                              <div className="w-8 flex-shrink-0" />
                            )}
                            <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                              {showAvatar && (
                                <span className="text-xs text-slate-500 mb-1 px-1">
                                  {isMe ? "You" : `User ${msg.senderId.substring(0, 4)}`}
                                </span>
                              )}
                              <div className={`px-4 py-2.5 ${
                                isMe
                                  ? "chat-bubble-sent text-white"
                                  : "chat-bubble-received text-slate-200"
                              }`}>
                                <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                              </div>
                              <span className="text-[10px] text-slate-500 mt-1 px-1">
                                {formatTime(msg.createdAt)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="p-4 border-t border-slate-700/50">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="input-glass flex-1 px-4 py-3 rounded-xl text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="btn-primary px-5 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}