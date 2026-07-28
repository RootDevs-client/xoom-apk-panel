"use client";

interface SessionExpiredScreenProps {
  message: string;
}

export function SessionExpiredScreen({ message }: SessionExpiredScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Phone frame */}
      <div className="relative w-90 h-185 rounded-[3rem] border-[3px] border-gray-700 bg-[#181715] shadow-2xl shadow-black/60 overflow-hidden flex flex-col">
        {/* Dynamic Island */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
          <div className="w-28 h-7 bg-black rounded-b-2xl flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-800" />
          </div>
        </div>

        {/* Status bar */}
        <div className="pt-10 px-6 pb-2 flex items-center justify-between text-xs text-gray-400">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
            </svg>
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-full max-w-xs">
            <div className="bg-slate-900/70 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700/50">
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 mb-6">
                  <div className="absolute inset-0 rounded-full bg-linear-to-br from-amber-500/30 to-amber-600/20 animate-pulse" />
                  <div className="relative w-full h-full rounded-full bg-amber-500/20 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-amber-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4v.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                      />
                    </svg>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  Session Expired
                </h3>
                <p className="text-amber-400/80 text-sm text-center leading-relaxed">
                  {message}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Home indicator */}
        <div className="pb-4 flex justify-center">
          <div className="w-32 h-1 rounded-full bg-gray-600" />
        </div>
      </div>
    </div>
  );
}
