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
    <section className="pt-2 pb-12 md:pb-16">
      <div className="px-6 md:px-10">
        <div className="mx-auto max-w-2xl space-y-5 py-4 text-center md:space-y-6 md:py-6">
          <h2
            className="font-serif text-balance text-3xl font-medium lg:text-4xl"
            style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
          >
            Built for daily multi-stop planning
          </h2>
          <p className="text-sm text-[#69635d] md:text-base">
            Everything needed for reliable route execution, from natural language to optimized stop ordering and
            realistic ETAs.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#d9d4cb] bg-[#d9d4cb]">
          <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.title}
              className="space-y-2.5 bg-[#f8f7f4] p-5 transition-colors hover:bg-[#f3f0ea] md:p-6"
            >
              <div className="flex items-center gap-2 text-[#25201c]">
                <HugeiconsIcon icon={item.icon} strokeWidth={2} className="size-4" />
                <h3
                  className="font-serif text-[13px] font-medium tracking-tight md:text-sm"
                  style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
                >
                  {item.title}
                </h3>
              </div>
              <p className="text-[13px] leading-relaxed text-[#69635d] md:text-sm">{item.description}</p>
            </article>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}
