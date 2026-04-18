import { NextResponse } from "next/server";
import { z } from "zod";

import { ApiRouteError, handleRouteError } from "@/lib/api-response";
import { reverseGeocodeLocation } from "@/lib/providers/geocoding";
import { enforceRateLimit } from "@/lib/rate-limit";
import {
  enforceMaxContentLength,
  enforceSameOrigin,
  requireAuthenticatedRequest,
} from "@/lib/request-security";

const reverseGeocodeLocationBiasSchema = z.object({
  latitude: z.number().gte(-90).lte(90),
  longitude: z.number().gte(-180).lte(180),
});

export async function handleReverseGeocodeRequest(input: unknown) {
  const parsed = reverseGeocodeLocationBiasSchema.safeParse(input);

  if (!parsed.success) {
    throw new ApiRouteError(400, "BAD_REQUEST", "A valid location is required.");
  }

  const address = await reverseGeocodeLocation(parsed.data);
  return { address };
}

export async function POST(request: Request) {
  try {
    const userId = await requireAuthenticatedRequest();
    enforceSameOrigin(request);
    enforceRateLimit({
      key: `reverse-geocode:${userId}`,
      maxRequests: 60,
      windowMs: 60_000,
    });
    enforceMaxContentLength(request, 8 * 1024);

    const body = await request.json();
    const data = await handleReverseGeocodeRequest(body);

    return NextResponse.json(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
