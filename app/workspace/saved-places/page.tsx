import { SavedPlacesView } from "@/components/saved-places-view";

export default function WorkspaceSavedPlacesPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="relative overflow-hidden rounded-xl border border-border/60 bg-primary px-6 py-8 text-primary-foreground">
        <div className="relative z-10">
          <h1 className="text-3xl font-semibold tracking-tight">Saved Places</h1>
          <p className="mt-1 text-sm opacity-80">Keep frequently used addresses for faster planning. Type the label in any trip request.</p>
        </div>
      </div>
      <SavedPlacesView />
    </main>
  );
}