import { HistoryView } from "@/components/history-view";

export default function WorkspaceHistoryPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="relative overflow-hidden rounded-xl border border-border/60 bg-primary px-6 py-8 text-primary-foreground">
        <div className="relative z-10">
          <h1 className="text-3xl font-semibold tracking-tight">History</h1>
          <p className="mt-1 text-sm opacity-80">Your recent planned routes. Hover over any to repeat it.</p>
        </div>
      </div>
      <HistoryView />
    </main>
  );
}