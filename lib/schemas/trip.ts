import { z } from "zod";

const savedPlaceSchema = z.object({
  name: z.string().trim().min(1).max(80),
  address: z.string().trim().min(1).max(240),
});

export const locationBiasSchema = z.object({
  latitude: z.number().gte(-90).lte(90),
  longitude: z.number().gte(-180).lte(180),
});

export const planRouteRequestSchema = z.object({
  prompt: z.string().trim().min(1).max(1200),
  homeAddress: z.string().trim().min(1).max(240).optional(),
  locationBias: locationBiasSchema.optional(),
  savedPlaces: z.array(savedPlaceSchema).max(50).optional(),
});
export const tripParseResultSchema = z.object({
  stops: z.array(z.string().trim().min(1).max(160)).min(2, "At least two stops are required.").max(12),
  deadline: z.string().trim().min(1).max(80).optional(),
  notes: z.array(z.string().trim().min(1).max(200)).max(10).optional(),
});

export type TripParseResultInput = z.infer<typeof tripParseResultSchema>;
