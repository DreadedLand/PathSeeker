"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SavedPlacesView() {
  const places = useQuery(api.pathseeker.listSavedPlaces);
  const addSavedPlace = useMutation(api.pathseeker.addSavedPlace);
  const removeSavedPlace = useMutation(api.pathseeker.removeSavedPlace);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      await addSavedPlace({
        name: name.trim(),
        address: address.trim(),
      });
      setName("");
      setAddress("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save place.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Add Place</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3" onSubmit={onSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="place-name">Label</Label>
              <Input
                id="place-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Gym"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="place-address">Address</Label>
              <Input
                id="place-address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="123 Main St, Evanston, IL"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                disabled={
                  isSaving ||
                  name.trim().length === 0 ||
                  address.trim().length === 0
                }
              >
                {isSaving ? "Saving..." : "Save Place"}
              </Button>
              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Saved Places</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {places === undefined ? (
            <p className="text-sm text-muted-foreground">Loading places...</p>
          ) : places.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No saved places yet. Add one above.
            </p>
          ) : (
            places.map((place) => (
              <div
                key={place._id}
                className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{place.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {place.address}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void removeSavedPlace({ id: place._id });
                  }}
                >
                  Remove
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
