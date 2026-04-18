import { NextResponse } from "next/server";

import { ApiRouteError, handleRouteError } from "@/lib/api-response";
import { getAiGatewayConfig } from "@/lib/env";
import { computeOptimizedRoute } from "@/lib/providers/google-routes";
import { resolveRouteStops } from "@/lib/providers/stop-resolver";
import { extractTripDetails } from "@/lib/providers/trip-parser";
import { enforceRateLimit } from "@/lib/rate-limit";
import {
  enforceMaxContentLength,
  enforceSameOrigin,
  requireAuthenticatedRequest,
} from "@/lib/request-security";
import { planRouteRequestSchema } from "@/lib/schemas/trip";
import type { RoutePlanResponse } from "@/lib/types";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function handlePlanRouteRequest(input: unknown) {
  const parsedRequest = planRouteRequestSchema.safeParse(input);

  if (!parsedRequest.success) {
    throw new ApiRouteError(400, "BAD_REQUEST", "A valid prompt is required.");
  }
  let prompt = parsedRequest.data.prompt;

  if (parsedRequest.data.savedPlaces?.length) {
    for (const place of parsedRequest.data.savedPlaces) {
      const escapedName = escapeRegExp(place.name.trim());
      if (!escapedName) continue;
      const pattern = new RegExp(escapedName, "gi");
      prompt = prompt.replace(pattern, `${place.name} (${place.address})`);
    }
  }
  const parsed = await extractTripDetails(prompt);

  if (parsed.stops.length < 2) {
    throw new ApiRouteError(400, "VALIDATION_ERROR", "At least two stops are required.");
  }

  const resolved = await resolveRouteStops(parsed.stops, {
    homeAddress: parsedRequest.data.homeAddress,
    locationBias: parsedRequest.data.locationBias,
  });

  const route = await computeOptimizedRoute(resolved.stops, {
    ...(parsedRequest.data.locationBias
      ? {
          origin: {
            input: "current-location",
            label: "Current location",
            location: parsedRequest.data.locationBias,
          },
        }
      : {}),
  });
  const config = getAiGatewayConfig();
  const notes = [...(parsed.notes ?? []), ...resolved.notes];

  const response: RoutePlanResponse = {
    parsed: {
      ...parsed,
      ...(notes.length > 0 ? { notes } : {}),
    },
    route,
    meta: {
      provider: "google-routes",
      model: config.model,
    },
  };

  return response;
}

export async function POST(request: Request) {
  try {
    const userId = await requireAuthenticatedRequest();
    enforceSameOrigin(request);
    enforceRateLimit({
      key: `plan-route:${userId}`,
      maxRequests: 20,
      windowMs: 60_000,
    });
    enforceMaxContentLength(request, 64 * 1024);

    const body = await request.json();
    const data = await handlePlanRouteRequest(body);

    return NextResponse.json(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
