import { TripPlanner } from "@/components/trip-planner";

export default function WorkspacePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="relative overflow-hidden rounded-xl border border-border/60 bg-primary px-6 py-8 text-primary-foreground">
        <div className="relative z-10">
          <h1 className="text-3xl font-semibold tracking-tight text-primary-foreground">
            Plan a Route
          </h1>
          <p className="mt-1 text-sm opacity-80">
            Describe your errands in plain language and get a traffic-aware
            route in seconds.
          </p>
        </div>
      </div>
      <TripPlanner />
    </main>
  );
}
