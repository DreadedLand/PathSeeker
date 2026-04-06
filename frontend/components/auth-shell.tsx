import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type AuthShellProps = {
  title: string;
  description: string;
  alternateHref: string;
  alternateLabel: string;
  children: React.ReactNode;
};

export function AuthShell({
  title,
  description,
  alternateHref,
  alternateLabel,
  children,
}: AuthShellProps) {
  return (
    <main className="grid min-h-svh grid-cols-1 bg-background text-foreground lg:grid-cols-[1fr_440px]">
      <section className="hidden border-r border-border/60 p-8 lg:flex lg:flex-col lg:justify-between">
        <div className="flex flex-col gap-3">
          <Badge variant="outline" className="w-fit">
            PathSeeker
          </Badge>
          <h1 className="max-w-sm text-2xl font-semibold tracking-tight">
            Plan multi-stop routes with fewer decisions.
          </h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Voice or text input, AI stop extraction, optimized ordering, and
            traffic-aware arrival times.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Minimal workspace. Focused output.
        </p>
      </section>

      <section className="flex items-center justify-center p-5">
        <div className="w-full max-w-sm rounded-lg border border-border/70 bg-card p-5">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Separator className="my-4" />
          {children}
          <p className="mt-4 text-xs text-muted-foreground">
            {alternateLabel}{" "}
            <Link href={alternateHref} className="text-foreground underline">
              Continue
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
