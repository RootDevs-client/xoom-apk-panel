"use client";

import { ArrowUp, Shield } from "lucide-react";
import { useEffect, useState } from "react";

export default function PrivacyContent({
  html,
  updatedAtISO,
}: {
  html: string;
  updatedAtISO: string | null;
}) {
  const [progress, setProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const formattedDate = updatedAtISO
    ? new Date(updatedAtISO).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct =
        docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
      setProgress(pct);
      setShowBackToTop(scrollTop > 500);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      {/* Reading progress */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-gray-700 z-50">
        <div
          className="h-full bg-primary transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-14">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
          {formattedDate && (
            <p className="mt-4 text-sm text-gray-400">
              Updated {formattedDate}
            </p>
          )}
        </div>

        {!html ? (
          <div className="text-center py-16 px-6 space-y-4 bg-gray-800 border border-gray-700 rounded-2xl">
            <Shield className="h-10 w-10 text-gray-500 mx-auto stroke-1" />
            <p className="text-gray-400 max-w-sm mx-auto">
              The privacy policy is currently being updated. Please check back
              later.
            </p>
          </div>
        ) : (
          <div
            style={
              {
                "--color-foreground": "#e5e5e5",
                "--color-muted-foreground": "#a3a3a3",
                "--color-primary": "#ff642b",
                "--color-muted": "#262626",
              } as React.CSSProperties
            }
          >
            <div
              className="rich-text-content dmSans-regular"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        )}
      </div>

      {/* Back to top */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
          aria-label="Back to top"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
