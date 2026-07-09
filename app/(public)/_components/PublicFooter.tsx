import { routes } from "@/config/routes";
import { ArrowRight, Mail, MapPin, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface PublicFooterProps {
  appName: string;
  appLogo?: string | null;
  companyName: string;
  aboutUs?: string;
  supportEmail?: string;
  companyAddress?: string;
}

export default function PublicFooter({
  appName,
  appLogo,
  companyName,
  aboutUs,
  supportEmail,
  companyAddress,
}: PublicFooterProps) {
  const quickLinks = [
    { label: "Terms and Conditions", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy-policy" },
  ];

  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      {/* Upper footer */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 grid md:grid-cols-3 gap-10">
        {/* Brand */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-3">
            {appLogo ? (
              <div className="relative h-9 w-9 rounded-xl overflow-hidden border border-gray-200">
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
            <span className="font-urbanist font-extrabold text-gray-900 text-base uppercase tracking-wide">
              {appName}
            </span>
          </Link>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
            {aboutUs ||
              `${appName} — your go-to destination for premium sports content.`}
          </p>
        </div>

        {/* Quick links */}
        <div className="space-y-4">
          <h4 className="font-urbanist font-bold text-gray-900 text-sm uppercase tracking-wider">
            Quick Links
          </h4>
          <ul className="space-y-2.5 text-sm text-gray-500">
            {quickLinks.map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="hover:text-primary transition-colors flex items-center gap-1.5 group"
                >
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <h4 className="font-urbanist font-bold text-gray-900 text-sm uppercase tracking-wider">
            Contact
          </h4>
          <ul className="space-y-3 text-sm text-gray-500">
            {supportEmail && (
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <a
                  href={`mailto:${supportEmail}`}
                  className="hover:text-primary transition-colors break-all"
                >
                  {supportEmail}
                </a>
              </li>
            )}
            {companyAddress && (
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="leading-relaxed">{companyAddress}</span>
              </li>
            )}
            {!supportEmail && !companyAddress && (
              <li className="text-gray-400 italic">
                Contact details coming soon.
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 font-medium">
          <p>
            &copy; {new Date().getFullYear()} {companyName}. All rights
            reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link
              href={routes.publicRoutes.privacyPolicy}
              className="hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-200">|</span>
            <Link
              href={routes.publicRoutes.terms}
              className="hover:text-primary transition-colors"
            >
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
