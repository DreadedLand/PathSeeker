import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const primaryLinkClass =
  "inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90";
const outlineLinkClass =
  "inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted";

export default function Home() {
  return (
    <div className="bg-background">
      <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col items-center justify-center px-4 py-10">
        <Card className="w-full max-w-2xl border-border/70 bg-card text-foreground">
          <CardHeader className="flex flex-col gap-3">
            <CardTitle className="text-3xl">PathSeeker</CardTitle>
            <p className="text-sm text-muted-foreground">
              Plan multi-stop routes with natural language, traffic-aware timing,
              and one clean workspace.
            </p>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link href="/workspace" className={primaryLinkClass}>
              Open Workspace
            </Link>
            <Link href="/sign-in" className={outlineLinkClass}>
              Sign in
            </Link>
            <Link href="/sign-up" className={outlineLinkClass}>
              Create account
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
