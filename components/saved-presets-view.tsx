"use client";

import { FormEvent, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

export function SavedPresetsView() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const presets = useQuery(api.pathseeker.listSavedPresets);
  const addSavedPreset = useMutation(api.pathseeker.addSavedPreset);
  const removeSavedPreset = useMutation(api.pathseeker.removeSavedPreset);

  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isAuthenticated) {
      toast.error("Authentication session is still loading. Please try again.");
      return;
    }
    setIsSaving(true);

    try {
      await addSavedPreset({
        name: name.trim(),
        prompt: prompt.trim(),
      });
      setName("");
      setPrompt("");
      toast.success("Preset saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save preset.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Add Preset</CardTitle>
          <CardDescription>Save a trip prompt you use often.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3" onSubmit={onSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="preset-name">Preset name</Label>
              <Input
                id="preset-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Saturday errands"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="preset-prompt">Prompt</Label>
              <Textarea
                id="preset-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Go to Target, the gym, and Whole Foods before 5 PM."
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                disabled={
                  isSaving ||
                  isAuthLoading ||
                  !isAuthenticated ||
                  name.trim().length === 0 ||
                  prompt.trim().length === 0
                }
              >
                {isSaving ? "Saving..." : "Save Preset"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Saved Presets</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {presets === undefined ? (
            <p className="text-sm text-muted-foreground">Loading presets...</p>
          ) : presets.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No saved presets yet. Add one above.
            </p>
          ) : (
            presets.map((preset) => (
              <div
                key={preset._id}
                className="flex flex-col gap-2 rounded-md border border-border/70 px-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{preset.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {preset.prompt}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => router.push(`/workspace?prompt=${encodeURIComponent(preset.prompt)}`)}
                  >
                    Start Trip
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isAuthLoading || !isAuthenticated}
                    onClick={() => {
                      void removeSavedPreset({ id: preset._id })
                        .then(() => {
                          toast.success("Preset removed.");
                        })
                        .catch((err: unknown) => {
                          toast.error(err instanceof Error ? err.message : "Could not remove preset.");
                        });
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
