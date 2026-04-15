import { SavedPlacesView } from "@/components/saved-places-view";

export default function WorkspaceSavedPlacesPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Saved Places</h1>
        <p className="text-sm text-muted-foreground">
          Keep frequently used addresses for faster planning.
        </p>
      </header>
      <SavedPlacesView />
    </main>
  );
}
