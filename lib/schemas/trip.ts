import { z } from "zod";

const savedPlaceSchema = z.object({
  name: z.string(),
  address: z.string(),
});

export const planRouteRequestSchema = z.object({
  prompt: z.string().min(1),
  homeAddress: z.string().optional(),
  locationBias: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  savedPlaces: z.array(savedPlaceSchema).optional(),
});
export const tripParseResultSchema = z.object({
  stops: z.array(z.string().trim().min(1)).min(2, "At least two stops are required."),
  deadline: z.string().trim().min(1).optional(),
  notes: z.array(z.string().trim().min(1)).optional(),
});

export type TripParseResultInput = z.infer<typeof tripParseResultSchema>;
