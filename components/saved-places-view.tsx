"use client";

import { FormEvent, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SavedPlacesView() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const places = useQuery(api.pathseeker.listSavedPlaces);
  const addSavedPlace = useMutation(api.pathseeker.addSavedPlace);
  const removeSavedPlace = useMutation(api.pathseeker.removeSavedPlace);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isAuthenticated) {
      toast.error("Authentication session is still loading. Please try again.");
      return;
    }
    setIsSaving(true);

    try {
      await addSavedPlace({
        name: name.trim(),
        address: address.trim(),
      });
      setName("");
      setAddress("");
      toast.success("Place saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save place.");
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
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="submit"
                disabled={
                  isSaving ||
                  isAuthLoading ||
                  !isAuthenticated ||
                  name.trim().length === 0 ||
                  address.trim().length === 0
                }
              >
                {isSaving ? "Saving..." : "Save Place"}
              </Button>
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
                className="flex flex-col gap-3 rounded-md border border-border/70 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{place.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {place.address}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      router.push(`/workspace?prompt=${encodeURIComponent(`Take me to ${place.name}`)}`);
                    }}
                  >
                    Use Place
                  </Button>
                  <Button
                    variant="outline"
                    disabled={isAuthLoading || !isAuthenticated}
                    onClick={() => {
                      void removeSavedPlace({ id: place._id })
                        .then(() => {
                          toast.success("Place removed.");
                        })
                        .catch((err: unknown) => {
                          toast.error(err instanceof Error ? err.message : "Could not remove place.");
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
