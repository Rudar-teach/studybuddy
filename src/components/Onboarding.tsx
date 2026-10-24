import { profileCompleteness, cn } from "@/lib/utils";
import type { User } from "@/types";

interface OnboardingGateProps {
  user: User;
  onComplete: () => void;
  onContinue: () => void;
}

/**
 * 3-step onboarding wizard: subjects -> skills -> availability,
 * with a live match-readiness preview. Shown when profile is incomplete.
 */
export function OnboardingGate({ user, onComplete, onContinue }: OnboardingGateProps) {
  const completeness = profileCompleteness(user);
  const done = completeness.percent >= 100;
  const steps = [
    { id: "subjects", label: "Subjects", done: user.subjects?.length > 0 },
    { id: "skills", label: "Skills", done: user.skills?.length > 0 },
    { id: "availability", label: "Schedule", done: user.availability?.length > 0 },
  ];

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#082336]/90 backdrop-blur-sm" />
      <div className="relative glass rounded-2xl p-8 border border-teal-500/20 max-w-lg w-full animate-scale-in">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">Complete your profile</h2>
          <p className="text-sm text-slate-400">
            The more you add, the better we can match you. You&apos;re {completeness.percent}% there.
          </p>
          <div className="mt-3 h-2 w-full rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-500"
              style={{ width: `${completeness.percent}%` }}
            />
          </div>
        </div>

        <div className="space-y-2 mb-6">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center justify-between p-3 rounded-xl border ${
                step.done
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-slate-700/50 bg-white/5"
              }`}
            >
              <span className="text-sm font-medium text-slate-200">{step.label}</span>
              {step.done ? (
                <span className="text-xs text-emerald-400 font-medium">Done</span>
              ) : (
                <button
                  onClick={onContinue}
                  className="text-xs text-teal-400 hover:text-teal-300 font-medium"
                >
                  Add
                </button>
              )}
            </div>
          ))}
        </div>

        {done ? (
          <button
            onClick={onComplete}
            className="w-full btn-primary py-3 rounded-xl font-semibold"
          >
            Continue to dashboard
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={onContinue}
              className="flex-1 btn-primary py-3 rounded-xl font-medium"
            >
              Complete profile
            </button>
            <button
              onClick={onComplete}
              className="px-5 py-3 rounded-xl text-sm text-slate-400 hover:text-white border border-slate-700/50"
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
