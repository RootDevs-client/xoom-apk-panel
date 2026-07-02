export default function ShowError({ error }: any) {
  return (
    <div className="bg-slate-900/70 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700/50">
      <div className="flex flex-col items-center">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 rounded-full bg-linear-to-br from-red-500/30 to-red-600/20 animate-pulse"></div>
          <div className="relative w-full h-full rounded-full bg-red-500/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-white mb-2 text-center">
          Something Went Wrong
        </h3>
        <p className="text-red-500 text-sm text-center mb-8 leading-relaxed">
          {error}
        </p>

        {/* <div className="w-full flex flex-col gap-3">
                  <button
                    onClick={() => setScreen("phone")}
                    className="w-full px-6 py-3 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => {
                      setScreen("phone");
                      setError(null);
                    }}
                    className="w-full px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-gray-200 font-semibold rounded-xl transition-colors duration-200"
                  >
                    Go Back
                  </button>
                </div> */}
      </div>
    </div>
  );
}
