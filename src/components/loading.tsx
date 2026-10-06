export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[#0f172a] flex items-center justify-center z-50">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 animate-spin-slow" style={{ mask: "radial-gradient(farthest-side, transparent calc(100% - 6px), #fff calc(100% - 6px))", WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 6px), #fff calc(100% - 6px))" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold gradient-text">SB</span>
        </div>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass rounded-xl p-4 space-y-3 animate-fade-in">
      <div className="skeleton h-12 w-12 rounded-full" />
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-4 w-1/2" />
      <div className="flex gap-2">
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}
