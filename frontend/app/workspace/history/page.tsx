import { HistoryView } from "@/components/history-view";

export default function WorkspaceHistoryPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">History</h1>
        <p className="text-sm text-muted-foreground">
          Your recent planned routes.
        </p>
      </header>
      <HistoryView />
    </main>
  );
}
