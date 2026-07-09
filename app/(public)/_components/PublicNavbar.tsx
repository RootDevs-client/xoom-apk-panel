import { Sparkles, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface PublicNavbarProps {
  appName: string;
  appLogo?: string | null;
}

export default function PublicNavbar({ appName, appLogo }: PublicNavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo + Name */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          {appLogo ? (
            <div className="relative h-9 w-9 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
              <Image
                src={appLogo}
                alt={appName}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary" />
            </div>
          )}
          <span className="font-urbanist font-extrabold text-gray-900 text-lg tracking-wide uppercase">
            {appName || "Xoom Sports"}
          </span>
        </Link>

        {/* Nav links */}
        {/* <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-600">
          <Link
            href="#about"
            className="hover:text-primary transition-colors hover:underline underline-offset-4 decoration-primary/40"
          >
            About
          </Link>
          <a
            href="#offer"
            className="hover:text-primary transition-colors hover:underline underline-offset-4 decoration-primary/40"
          >
            Offer
          </a>
          <a
            href="#gallery"
            className="hover:text-primary transition-colors hover:underline underline-offset-4 decoration-primary/40"
          >
            Gallery
          </a>
        </nav> */}

        {/* CTA */}
        <Link
          href="#offer"
          className="shrink-0 inline-flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-primary/90 active:scale-95 transition-all shadow-md shadow-primary/30"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Get Started
        </Link>
      </div>
    </header>
  );
}
