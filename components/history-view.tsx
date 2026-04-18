"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";

import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function formatTime(value: number) {
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function HistoryView() {
  const history = useQuery(api.pathseeker.listHistory);
  const router = useRouter();

  if (history === undefined) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl border border-border/60 bg-muted/40" />
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-16 text-center">
        <p className="text-4xl">🗺️</p>
        <p className="mt-3 font-medium">No routes yet</p>
        <p className="mt-1 text-sm text-muted-foreground">Plan your first route and it will appear here.</p>
        <Button className="mt-4" onClick={() => router.push("/workspace")}>Plan a Route</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {history.map((item) => (
        <Card key={item._id} className="group border-border/70 transition-colors hover:border-border">
          <CardContent className="flex flex-col gap-3 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <p className="font-medium">{item.totalDurationText} trip</p>
                <p className="text-xs text-muted-foreground">{formatTime(item._creationTime)}</p>
              </div>
              <div className="flex items-center gap-2">
                {item.arrivalEstimate && (
                  <Badge variant="outline">
                    ETA {new Date(item.arrivalEstimate).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  </Badge>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => router.push(`/workspace?prompt=${encodeURIComponent(item.prompt)}`)}
                >
                  Repeat →
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{item.prompt}</p>
            <div className="flex flex-wrap gap-1.5">
              {item.orderedStops.map((stop, i) => (
                <div key={`${item._id}-${stop}`} className="flex items-center gap-1">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">{i + 1}</span>
                  <span className="text-xs">{stop}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}