"use client";

import { useEffect, useState, useCallback } from "react";
import { useApp } from "./providers";
import { Navigation } from "./navigation";
import { Mail, CheckCircle, XCircle, Clock, Users, BookOpen, ChevronRight } from "lucide-react";

const STATUS_CONFIG = {
  pending: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", icon: Clock, label: "Pending" },
  accepted: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", icon: CheckCircle, label: "Accepted" },
  rejected: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", icon: XCircle, label: "Rejected" },
};

export function RequestsPage() {
  const { requests, setRequests, addNotification, user } = useApp();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");

  const loadRequests = useCallback(async () => {
    try {
      const token = localStorage.getItem("studybuddy_token");
      const res = await fetch("/api/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setRequests(data.received || []);
      }
    } catch (error) {
      console.error("Requests error:", error);
    } finally {
      setLoading(false);
    }
  }, [setRequests]);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  const handleAccept = async (requestId: string) => {
    try {
      const token = localStorage.getItem("studybuddy_token");
      const res = await fetch(`/api/requests/${requestId}/accept`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setRequests((prev) => prev.map((r) => r.id === requestId ? { ...r, status: "accepted" as const } : r));
        addNotification({ type: "success", title: "Request Accepted!", message: "You accepted the request." });
        loadRequests();
      }
    } catch {
      addNotification({ type: "error", title: "Error", message: "Failed to accept request" });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const token = localStorage.getItem("studybuddy_token");
      const res = await fetch(`/api/requests/${requestId}/reject`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setRequests((prev) => prev.map((r) => r.id === requestId ? { ...r, status: "rejected" as const } : r));
        addNotification({ type: "info", title: "Request Rejected", message: "You declined the request." });
        loadRequests();
      }
    } catch {
      addNotification({ type: "error", title: "Error", message: "Failed to reject request" });
    }
  };

  const receivedRequests = requests.filter((r) => r.status === "pending");
  const acceptedRequests = requests.filter((r) => r.status === "accepted");
  const rejectedRequests = requests.filter((r) => r.status === "rejected");

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navigation />

      <main className="pt-20 md:pt-24 pb-24 md:pb-8 px-4 md:px-6 max-w-4xl mx-auto">
        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold mb-1">Requests</h1>
          <p className="text-slate-400">Manage your collaboration requests</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-8 animate-slide-up stagger-1">
          {([
            { id: "received", label: "Received", count: receivedRequests.length },
            { id: "sent", label: "Accepted", count: acceptedRequests.length },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Requests List */}
        <div className="mt-8">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass rounded-2xl p-5 border border-slate-700/50 animate-pulse">
                  <div className="skeleton h-5 w-1/2 mb-2" />
                  <div className="skeleton h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : activeTab === "received" && receivedRequests.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <Mail className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">No new requests</h3>
              <p className="text-sm text-slate-500">When someone sends you a request, it will appear here.</p>
            </div>
          ) : activeTab === "sent" && acceptedRequests.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <CheckCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">No accepted requests yet</h3>
              <p className="text-sm text-slate-500">Browse users and send collaboration requests.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeTab === "received" && receivedRequests.map((req, i) => (
                <RequestCard
                  key={req.id}
                  request={req}
                  onAccept={() => handleAccept(req.id)}
                  onReject={() => handleReject(req.id)}
                  index={i}
                />
              ))}
              {activeTab === "sent" && acceptedRequests.map((req, i) => (
                <RequestCard key={req.id} request={req} index={i} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function RequestCard({ request, onAccept, onReject, index }: {
  request: any;
  onAccept?: () => void;
  onReject?: () => void;
  index: number;
}) {
  const statusStyle = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG];
  const StatusIcon = statusStyle?.icon || Clock;
  const isStudyGroup = request.type === "study-group";

  return (
    <div
      className="card-hover glass rounded-2xl p-5 border border-slate-700/50 animate-slide-up"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl ${isStudyGroup ? 'bg-gradient-to-br from-indigo-500 to-blue-600' : 'bg-gradient-to-br from-purple-500 to-pink-600'} flex items-center justify-center flex-shrink-0`}>
            {isStudyGroup ? <Users className="w-5 h-5 text-white" /> : <BookOpen className="w-5 h-5 text-white" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-white">
                {isStudyGroup ? "Study Group Request" : "Project Collaboration Request"}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border} flex items-center gap-1`}>
                <StatusIcon className="w-3 h-3" />
                {statusStyle?.label}
              </span>
            </div>
            <p className="text-sm text-slate-400">{request.message || "No message provided"}</p>
            <p className="text-xs text-slate-500 mt-2">
              {new Date(request.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {request.status === "pending" && (
          <div className="flex gap-2">
            <button
              onClick={onAccept}
              className="p-2 rounded-xl text-emerald-400 hover:bg-emerald-500/10 transition-colors"
              title="Accept"
            >
              <CheckCircle className="w-5 h-5" />
            </button>
            <button
              onClick={onReject}
              className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
              title="Reject"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}