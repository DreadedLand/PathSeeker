import Link from "next/link";
import Features4 from "@/components/features-4";

const primaryLinkClass =
  "inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90";

export default function Home() {
  return (
    <div className="min-h-svh bg-[#f8f7f4] text-[#1b1714]">
      <main className="relative overflow-hidden">
        <div className="relative mx-auto max-w-6xl">
          <section className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(32,120,70,0.13)_0%,transparent_80%)]"
            />
            <div className="px-6 py-14 md:py-20">
              <div className="mx-auto max-w-3xl text-center space-y-6">
                <h1
                  className="font-serif text-balance text-4xl font-semibold tracking-tight md:text-5xl"
                  style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
                >
                  Plan Routes with
                  <span className="text-primary"> Natural Language</span>
                </h1>
                <p className="mx-auto max-w-2xl text-base text-[#5f5a54] md:text-lg">
                  Describe your errands in plain language. PathSeeker extracts
                  stops, optimizes order, and gives traffic-aware ETAs.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link href="/workspace" className={primaryLinkClass}>
                    Start Planning
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <Features4 />
        </div>
      </main>
    </div>
  );
}
