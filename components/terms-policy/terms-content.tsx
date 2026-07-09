"use client";

import { ArrowUp, ChevronDown, FileText } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

type TocItem = { id: string; text: string; level: number };

export default function TermsContent({
  html,
  updatedAtISO,
}: {
  html: string;
  updatedAtISO: string | null;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  const readingTime = useMemo(() => {
    const text = html.replace(/<[^>]*>/g, " ");
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  }, [html]);

  const formattedDate = updatedAtISO
    ? new Date(updatedAtISO).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  // Build TOC from rendered headings + wire up scroll-spy
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const headings = Array.from(
      container.querySelectorAll("h1, h2, h3"),
    ) as HTMLElement[];

    const used = new Set<string>();
    const items: TocItem[] = headings.map((h) => {
      let id = h.id || slugify(h.textContent || "");
      let unique = id;
      let i = 1;
      while (used.has(unique)) unique = `${id}-${i++}`;
      used.add(unique);
      h.id = unique;
      h.style.scrollMarginTop = "6rem";
      return {
        id: unique,
        text: h.textContent || "",
        level: h.tagName === "H1" ? 1 : h.tagName === "H2" ? 2 : 3,
      };
    });
    setToc(items);

    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [html]);

  // Reading progress + back-to-top visibility
  useEffect(() => {
    const onScroll = () => {
      const container = contentRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const total = container.offsetHeight - window.innerHeight;
      const scrolled = -rect.top + 96;
      const pct =
        total > 0 ? Math.min(100, Math.max(0, (scrolled / total) * 100)) : 0;
      setProgress(pct);
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToHeading = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileTocOpen(false);
  };

  return (
    <div className="bg-background min-h-[80vh]">
      {/* Reading progress rail */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-border/50 z-50">
        <div
          className="h-full bg-primary transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-14 ">
        {/* Hero */}
        <div className="max-w-2xl mx-auto text-center mb-12 md:mb-16">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-5">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <p className="nav-text-2 text-primary uppercase tracking-widest mb-3">
            Legal
          </p>
          <h1 className="h1-text text-foreground">Terms &amp; Conditions</h1>
          <div className="mt-4 flex items-center justify-center gap-3 p-text-14 text-muted-foreground">
            {formattedDate && (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Updated {formattedDate}
              </span>
            )}
            {formattedDate && <span className="text-border">•</span>}
            <span>{readingTime} min read</span>
          </div>
        </div>

        {!html ? (
          <div className="max-w-2xl mx-auto text-center py-16 px-6 space-y-4 bg-card border border-border rounded-2xl">
            <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto stroke-1" />
            <p className="p-text-16 text-muted-foreground max-w-sm mx-auto">
              The terms and conditions are currently being updated. Please check
              back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 items-start">
            {/* Mobile TOC — accordion */}
            {toc.length > 0 && (
              <div className="lg:hidden">
                <button
                  onClick={() => setMobileTocOpen((v) => !v)}
                  className="w-full flex items-center justify-between p-4 bg-card border border-border rounded-xl nav-text-2 text-foreground"
                >
                  On this page
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${
                      mobileTocOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {mobileTocOpen && (
                  <nav className="mt-2 p-2 bg-card border border-border rounded-xl">
                    {toc.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToHeading(item.id)}
                        className={`block w-full text-left px-3 py-2 rounded-lg p-text-14 ${
                          activeId === item.id
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground"
                        }`}
                        style={{
                          paddingLeft: `${12 + (item.level - 1) * 12}px`,
                        }}
                      >
                        {item.text}
                      </button>
                    ))}
                  </nav>
                )}
              </div>
            )}

            {/* Desktop TOC — sticky sidebar */}
            {toc.length > 0 && (
              <aside className="hidden lg:block sticky top-24 self-start">
                <p className="nav-text-2 text-muted-foreground uppercase tracking-wide mb-3 px-3">
                  On this page
                </p>
                <nav className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />
                  {toc.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToHeading(item.id)}
                      className={`relative block w-full text-left py-2 pr-3 p-text-14 transition-colors ${
                        activeId === item.id
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      style={{ paddingLeft: `${16 + (item.level - 1) * 14}px` }}
                    >
                      {activeId === item.id && (
                        <span className="absolute left-0 top-0 bottom-0 w-px bg-primary" />
                      )}
                      {item.text}
                    </button>
                  ))}
                </nav>
              </aside>
            )}

            {/* Content card */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-10 shadow-sm">
              <div
                ref={contentRef}
                className="rich-text-content dmSans-regular text-left"
                dangerouslySetInnerHTML={{ __html: html }}
              />

              <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="p-text-14 text-muted-foreground">
                  Questions about these terms?
                </p>
                <a
                  href="mailto:support@xoom.com"
                  className="p-text-14 dmSans-medium text-primary hover:opacity-80 transition-opacity"
                >
                  support@xoom.com
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Back to top */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
          aria-label="Back to top"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
