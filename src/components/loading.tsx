export function LoadingScreen({ failed = false }: { failed?: boolean }) {
  return (
    <div className="fixed inset-0 bg-[#082336] flex items-center justify-center z-50">
      <div className="text-center px-6">
        {!failed && (
          <>
            <div className="relative w-20 h-20 mx-auto mb-5">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-teal-500 via-cyan-500 to-cyan-500 animate-spin-slow" style={{ mask: "radial-gradient(farthest-side, transparent calc(100% - 6px), #fff calc(100% - 6px))", WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 6px), #fff calc(100% - 6px))" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold gradient-text">SB</span>
              </div>
            </div>
            <p className="text-sm text-slate-400">Loading...</p>
          </>
        )}
        {failed && (
          <>
            <p className="text-slate-200 font-medium mb-2">
              Loading failed
            </p>
            <p className="text-sm text-slate-400 mb-6">
              Something went wrong while starting the app. Check the browser
              console and your Supabase / Firebase environment variables, then
              refresh.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary px-6 py-3 rounded-xl text-sm font-medium"
            >
              Reload
            </button>
          </>
        )}
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
