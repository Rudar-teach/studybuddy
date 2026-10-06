"use client";

import { useApp } from "./providers";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: "from-emerald-500/20 to-emerald-600/20 border-emerald-500/30",
  error: "from-red-500/20 to-red-600/20 border-red-500/30",
  info: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
  warning: "from-amber-500/20 to-amber-600/20 border-amber-500/30",
};

const iconColors = {
  success: "text-emerald-400",
  error: "text-red-400",
  info: "text-blue-400",
  warning: "text-amber-400",
};

export function ToastContainer() {
  const { notifications, removeNotification } = useApp();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full">
      {notifications.map((notification, index) => {
        const Icon = icons[notification.type];
        return (
          <div
            key={notification.id}
            className={`animate-toast-in glass rounded-xl p-4 border bg-gradient-to-r ${colors[notification.type]} backdrop-blur-xl`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-start gap-3">
              <Icon className={`w-5 h-5 mt-0.5 ${iconColors[notification.type]}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{notification.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{notification.message}</p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
