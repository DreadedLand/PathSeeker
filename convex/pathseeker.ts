import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const MAX_PROMPT_LENGTH = 1200;
const MAX_ADDRESS_LENGTH = 240;
const MAX_PLACE_NAME_LENGTH = 80;
const MAX_PRESET_NAME_LENGTH = 80;
const MAX_ROUTE_STOPS = 12;
const MAX_STOP_LENGTH = 160;

function hasInvalidStops(stops: string[]) {
  return (
    stops.length === 0 ||
    stops.length > MAX_ROUTE_STOPS ||
    stops.some((stop) => stop.trim().length === 0 || stop.length > MAX_STOP_LENGTH)
  );
}

async function requireIdentity(ctx: { auth: { getUserIdentity: () => Promise<{ tokenIdentifier: string } | null> } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity;
}

export const listHistory = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    const rows = await ctx.db
      .query("routeHistory")
      .withIndex("by_user", (q) => q.eq("userToken", identity.tokenIdentifier))
      .collect();

    return rows.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const addHistory = mutation({
  args: {
    prompt: v.string(),
    homeAddress: v.optional(v.string()),
    parsedStops: v.array(v.string()),
    deadline: v.optional(v.string()),
    orderedStops: v.array(v.string()),
    totalDurationText: v.string(),
    arrivalEstimate: v.optional(v.string()),
    originLabel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    const prompt = args.prompt.trim();

    if (!prompt || prompt.length > MAX_PROMPT_LENGTH) {
      throw new Error("Prompt is required and must be at most 1200 characters.");
    }
    if (args.homeAddress && args.homeAddress.length > MAX_ADDRESS_LENGTH) {
      throw new Error("Home address must be at most 240 characters.");
    }
    if (hasInvalidStops(args.parsedStops) || hasInvalidStops(args.orderedStops)) {
      throw new Error("Stops must be non-empty and within length limits.");
    }
    if (args.deadline && args.deadline.length > 80) {
      throw new Error("Deadline must be at most 80 characters.");
    }
    if (args.totalDurationText.length > 80) {
      throw new Error("Duration text must be at most 80 characters.");
    }
    if (args.arrivalEstimate && args.arrivalEstimate.length > 120) {
      throw new Error("Arrival estimate must be at most 120 characters.");
    }
    if (args.originLabel && args.originLabel.length > MAX_STOP_LENGTH) {
      throw new Error("Origin label must be at most 160 characters.");
    }

    return await ctx.db.insert("routeHistory", {
      userToken: identity.tokenIdentifier,
      prompt,
      homeAddress: args.homeAddress,
      parsedStops: args.parsedStops,
      deadline: args.deadline,
      orderedStops: args.orderedStops,
      totalDurationText: args.totalDurationText,
      arrivalEstimate: args.arrivalEstimate,
      originLabel: args.originLabel,
    });
  },
});

export const listSavedPlaces = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    const rows = await ctx.db
      .query("savedPlaces")
      .withIndex("by_user", (q) => q.eq("userToken", identity.tokenIdentifier))
      .collect();

    return rows.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const addSavedPlace = mutation({
  args: {
    name: v.string(),
    address: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);

    const name = args.name.trim();
    const address = args.address.trim();
    if (!name || !address || name.length > MAX_PLACE_NAME_LENGTH || address.length > MAX_ADDRESS_LENGTH) {
      throw new Error("Name and address are required and must be within length limits.");
    }

    return await ctx.db.insert("savedPlaces", {
      userToken: identity.tokenIdentifier,
      name,
      address,
    });
  },
});

export const removeSavedPlace = mutation({
  args: {
    id: v.id("savedPlaces"),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const place = await ctx.db.get(args.id);

    if (!place || place.userToken !== identity.tokenIdentifier) {
      throw new Error("Not found");
    }

    await ctx.db.delete(args.id);
  },
});

export const listSavedPresets = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    const rows = await ctx.db
      .query("savedPresets")
      .withIndex("by_user", (q) => q.eq("userToken", identity.tokenIdentifier))
      .collect();

    return rows.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const addSavedPreset = mutation({
  args: {
    name: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);

    const name = args.name.trim();
    const prompt = args.prompt.trim();
    if (!name || !prompt || name.length > MAX_PRESET_NAME_LENGTH || prompt.length > MAX_PROMPT_LENGTH) {
      throw new Error("Name and prompt are required and must be within length limits.");
    }

    return await ctx.db.insert("savedPresets", {
      userToken: identity.tokenIdentifier,
      name,
      prompt,
    });
  },
});

export const removeSavedPreset = mutation({
  args: {
    id: v.id("savedPresets"),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const preset = await ctx.db.get(args.id);

    if (!preset || preset.userToken !== identity.tokenIdentifier) {
      throw new Error("Not found");
    }

    await ctx.db.delete(args.id);
  },
});
