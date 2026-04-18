import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  Navigation03Icon,
} from "@hugeicons/core-free-icons";
import Features4 from "@/components/features-4";

const primaryLinkClass =
  "inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90";
const outlineLinkClass =
  "inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted";

export default function Home() {
  return (
    <div className="min-h-svh bg-background">
      <main className="relative overflow-hidden">
        <section className="relative border-b border-border/60 bg-card">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(60%_100%_at_50%_0%,color-mix(in_oklab,var(--color-primary)_16%,transparent)_0%,transparent_80%)]"
          />
          <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
            <div className="mx-auto max-w-3xl text-center space-y-7">
              <h1 className="text-balance text-5xl font-semibold tracking-tight text-foreground md:text-6xl">
                Plan Routes with
                <span className="text-primary"> Natural Language</span>
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl">
                Describe your errands in plain language. PathSeeker extracts stops &bull; optimizes order &bull; gives
                traffic-aware ETAs.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href="/workspace" className={primaryLinkClass}>
                  Start Planning
                  <HugeiconsIcon icon={Navigation03Icon} strokeWidth={2} className="ml-1 size-4" />
                </Link>
                <Link href="/workspace" className={outlineLinkClass}>
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="mr-1 size-4" />
                  Open Workspace
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Features4 />
      </main>
    </div>
  );
}
