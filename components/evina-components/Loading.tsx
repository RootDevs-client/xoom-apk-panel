export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 border-r-blue-400 animate-spin"></div>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">
        Sending Verification PIN
      </h3>
      <p className="text-blue-200 text-sm">
        Please wait while we process your request...
      </p>
    </div>
  );
}
