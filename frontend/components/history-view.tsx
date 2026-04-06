"use client";

import { useQuery } from "convex/react";

import { api } from "@convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  if (history === undefined) {
    return (
      <Card className="border-border/70">
        <CardContent className="py-6 text-sm text-muted-foreground">
          Loading history...
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>No routes yet</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Plan your first route and it will appear here automatically.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {history.map((item) => (
        <Card key={item._id} className="border-border/70">
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-base">{item.totalDurationText}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {formatTime(item._creationTime)}
              </p>
            </div>
            {item.arrivalEstimate ? (
              <Badge variant="outline">
                ETA {new Date(item.arrivalEstimate).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
              </Badge>
            ) : null}
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <p className="text-muted-foreground">{item.prompt}</p>
            <div className="flex flex-wrap gap-2">
              {item.orderedStops.map((stop) => (
                <Badge key={`${item._id}-${stop}`} variant="outline">
                  {stop}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
