import dbConnect from "@/config/database";
import { prependAwsBaseUrl } from "@/lib/server.utils";
import Settings from "@/model/Settings";
import { Shield, Star, Zap } from "lucide-react";
import Image from "next/image";

export async function generateMetadata() {
  try {
    await dbConnect();
    const settings = await Settings.findOne({}).select("general").lean();
    const appName = settings?.general?.appName || "Xoom Sports";
    return {
      title: appName,
      description:
        settings?.general?.aboutUs ||
        `Welcome to ${appName} — your premium sports experience.`,
    };
  } catch {
    return { title: "Xoom Sports" };
  }
}

export default async function HomePage() {
  await dbConnect();
  const doc = await Settings.findOne({}).select("general").lean();

  const appName = doc?.general?.appName || "Xoom Sports";
  const rawBg = doc?.general?.backgroundImage;
  const bgImage = rawBg ? prependAwsBaseUrl(rawBg) : null;
  const aboutUs = doc?.general?.aboutUs || "";
  const rawGalleries: { title: string; url: string }[] =
    doc?.general?.galleries || [];
  const galleries = rawGalleries
    .map((g) => ({ ...g, url: prependAwsBaseUrl(g.url) || g.url }))
    .filter((g) => g.url);

  return (
    <>
      {/* ═══ SECTION 1 — HERO ═════════════════════════════════════════════════ */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-linear-to-br from-gray-50 via-white to-orange-50/30">
        {/* Background image */}
        {bgImage && (
          <div className="absolute inset-0">
            <Image
              src={bgImage}
              alt="Background"
              fill
              className="object-cover opacity-70"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-r from-white via-white/90 to-white/50" />
          </div>
        )}

        {/* Decorative circles */}
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 grid md:grid-cols-2 items-center gap-12">
          {/* Text */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase">
              <Star className="h-3 w-3 fill-primary" />
              Premium Sports Experience
            </div>

            <h1 className="font-urbanist text-5xl md:text-6xl font-extrabold text-gray-900 leading-[1.08] tracking-tight">
              Welcome to{" "}
              <span className="text-primary relative">
                {appName}
                <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-primary/30 rounded-full" />
              </span>
            </h1>

            <p className="text-gray-500 text-lg leading-relaxed max-w-md">
              {aboutUs ||
                `Experience ${appName} — the best in sports entertainment, scores, highlights, and live action, all in one place.`}
            </p>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 2 — ABOUT / FEATURES ════════════════════════════════════ */}
      <section id="about" className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Heading */}
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase">
              <Shield className="h-3 w-3" />
              About Us
            </div>
            <h2 className="font-urbanist text-4xl font-extrabold text-gray-900 tracking-tight">
              What is {appName}?
            </h2>
            {aboutUs && (
              <p className="text-gray-500 text-base leading-relaxed">
                {aboutUs}
              </p>
            )}
          </div>

          {/* Feature cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Instant Access",
                desc: "Get real-time updates, scores, and highlights delivered instantly to your device.",
                accent: "from-yellow-50 to-orange-50",
                iconColor: "text-orange-500",
                iconBg: "bg-orange-100",
              },
              {
                icon: Star,
                title: "Premium Content",
                desc: "Enjoy exclusive sports content curated by experts. Your ultimate sports companion.",
                accent: "from-primary/5 to-orange-50/50",
                iconColor: "text-primary",
                iconBg: "bg-primary/10",
              },
              {
                icon: Shield,
                title: "Secure & Private",
                desc: "Your data is always protected. We are fully committed to your privacy and security.",
                accent: "from-green-50 to-emerald-50",
                iconColor: "text-emerald-600",
                iconBg: "bg-emerald-100",
              },
            ].map(({ icon: Icon, title, desc, accent, iconColor, iconBg }) => (
              <div
                key={title}
                className={`group relative bg-linear-to-br ${accent} border border-gray-100 rounded-2xl p-8 space-y-5 hover:shadow-lg hover:shadow-gray-100 hover:-translate-y-1 transition-all duration-300`}
              >
                <div
                  className={`inline-flex items-center justify-center h-12 w-12 rounded-2xl ${iconBg}`}
                >
                  <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-urbanist font-bold text-gray-900 text-xl">
                    {title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 3 — OFFER & GALLERY ══════════════════════════════════════ */}
      <section
        id="offer"
        className="py-24 bg-linear-to-b from-gray-50 to-white border-t border-gray-100"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-20">
          {/* Gallery */}
          {galleries.length > 0 && (
            <div id="gallery" className="space-y-10">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase">
                  <Star className="h-3 w-3" />
                  Gallery
                </div>
                <h2 className="font-urbanist text-4xl font-extrabold text-gray-900 tracking-tight">
                  Our Highlights
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleries.map((g, i) => (
                  <div
                    key={i}
                    className="group relative aspect-video rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50"
                  >
                    <Image
                      src={g.url}
                      alt={g.title || `Gallery ${i + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {g.title && (
                      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-sm font-semibold truncate">
                          {g.title}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
