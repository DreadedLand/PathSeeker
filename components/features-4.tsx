import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiChat01Icon,
  LocationCheck02Icon,
  LocationFavourite02Icon,
  Route02Icon,
  SecurityCheckIcon,
  TimeQuarterPassIcon,
} from "@hugeicons/core-free-icons";

export default function Features() {
  const items = [
    {
      title: "Natural Language Input",
      description: "Type errands naturally. PathSeeker parses intent into actionable stops.",
      icon: AiChat01Icon,
    },
    {
      title: "Smart Route Ordering",
      description: "Stop sequence optimized to reduce travel time and unnecessary detours.",
      icon: Route02Icon,
    },
    {
      title: "Traffic-Aware ETAs",
      description: "Arrival estimates update against current traffic patterns and timing.",
      icon: TimeQuarterPassIcon,
    },
    {
      title: "Place Resolution",
      description: "Ambiguous destinations resolved against saved places and map context.",
      icon: LocationCheck02Icon,
    },
    {
      title: "Saved Place Reuse",
      description: "Frequently used destinations available instantly across planning sessions.",
      icon: LocationFavourite02Icon,
    },
    {
      title: "Safe Defaults",
      description: "Conservative behavior and validated inputs reduce risky route output.",
      icon: SecurityCheckIcon,
    },
  ];

  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
        <div className="relative z-10 mx-auto max-w-2xl space-y-6 text-center md:space-y-8">
          <h2 className="text-balance text-4xl font-medium lg:text-5xl">Built for daily multi-stop planning</h2>
          <p className="text-muted-foreground">
            Everything needed for reliable route execution &bull; from natural language to optimized stop ordering and
            realistic ETAs.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.title}
              className="space-y-2 rounded-xl border border-border/70 bg-card/60 p-6 transition-colors hover:bg-card"
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={item.icon} strokeWidth={2} className="size-4" />
                <h3 className="text-sm font-medium">{item.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
