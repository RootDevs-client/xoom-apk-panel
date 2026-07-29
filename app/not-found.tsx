import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#F0F0F0] px-4">
      {/* Ambient background texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.08) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-[100px]" />

      <div className="relative flex flex-col items-center text-center">
        {/* 404 mark */}
        <div className="mb-8 flex items-center gap-1">
          <span className="font-urbanist text-[6rem] font-black leading-none tracking-tight text-foreground sm:text-[8rem]">
            4
          </span>
          <div className="relative mx-1 flex h-20 w-20 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30 sm:h-28 sm:w-28">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-90"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2 2-2 3.5" />
              <path d="M12 17h.01" />
            </svg>
          </div>
          <span className="font-urbanist text-[6rem] font-black leading-none tracking-tight text-foreground sm:text-[8rem]">
            4
          </span>
        </div>

        <h1 className="font-urbanist mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Page not found
        </h1>

        <p className="font-dm-sans mb-9 max-w-sm text-balance text-base leading-relaxed text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved
          somewhere else.
        </p>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="font-dm-sans inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 active:translate-y-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
