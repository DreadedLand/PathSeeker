import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const primaryLinkClass =
  "inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90";
const outlineLinkClass =
  "inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted";

export default function Home() {
  return (
    <div className="min-h-svh bg-background">
      {/* Hero Section */}
      <main className="mx-auto flex w-full flex-col items-center justify-center px-4 py-16 md:py-24 rounded-t-2xl bg-card border border-border/70 border-b-0">
        {/* Hero Content */}
        <div className="w-full max-w-3xl text-center space-y-8 mb-12">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">
              Plan Routes with
              <span className="text-primary"> Natural Language</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Describe your errands in plain language. PathSeeker extracts stops, optimizes your route, and gives you a traffic-aware ETA.
            </p>
          </div>
          
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/workspace" className={primaryLinkClass}>
              Start Planning →
            </Link>
            <Link href="/workspace" className={outlineLinkClass}>
              Learn More
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {[
            {
              title: "Natural Language Input",
              description: "Just describe your errands in plain language - no addresses needed."
            },
            {
              title: "AI-Powered Extraction",
              description: "Automatically extracts stops and resolves saved places."
            },
            {
              title: "Smart Route Optimization",
              description: "Optimizes order for efficiency while considering traffic patterns."
            },
            {
              title: "Real-Time ETAs",
              description: "Get accurate arrival times and traffic-aware duration estimates."
            }
          ].map((feature, idx) => (
            <Card key={idx} className="border-border/70 bg-card/50 hover:bg-card/70 transition-colors">
              <CardHeader>
                <CardTitle className="text-base">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Card */}
        <Card className="w-full max-w-2xl border-border/70 bg-card rounded-t-2xl rounded-b-none">
          <CardHeader>
            <CardTitle>Ready to optimize your routes?</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2 flex-wrap">
            <Link href="/workspace" className={primaryLinkClass}>
              Open Workspace
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
