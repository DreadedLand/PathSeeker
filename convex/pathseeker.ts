import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const MAX_PROMPT_LENGTH = 1200;
const MAX_ADDRESS_LENGTH = 240;
const MAX_PLACE_NAME_LENGTH = 80;
const MAX_PRESET_NAME_LENGTH = 80;
const MAX_ROUTE_STOPS = 12;
const MAX_STOP_LENGTH = 160;

function normalizeBoundedString(value: string, maxLength: number) {
  return value.trim().slice(0, maxLength);
}

function normalizeOptionalBoundedString(value: string | undefined, maxLength: number) {
  if (!value) {
    return undefined;
  }
  const normalized = normalizeBoundedString(value, maxLength);
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeStops(stops: string[]) {
  return stops
    .map((stop) => normalizeBoundedString(stop, MAX_STOP_LENGTH))
    .filter((stop) => stop.length > 0)
    .slice(0, MAX_ROUTE_STOPS);
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
    const identity = await requireIdentity(ctx);
    const prompt = normalizeBoundedString(args.prompt, MAX_PROMPT_LENGTH);
    if (!prompt) throw new Error("Prompt is required.");

    const homeAddress = normalizeOptionalBoundedString(args.homeAddress, MAX_ADDRESS_LENGTH);
    const parsedStops = normalizeStops(args.parsedStops);
    const orderedStops = normalizeStops(args.orderedStops);

    if (parsedStops.length === 0 || orderedStops.length === 0) {
      throw new Error("At least one valid stop is required.");
    }

    const deadline = normalizeOptionalBoundedString(args.deadline, 80);
    const totalDurationText = normalizeBoundedString(args.totalDurationText, 80);
    const arrivalEstimate = normalizeOptionalBoundedString(args.arrivalEstimate, 120);
    const originLabel = normalizeOptionalBoundedString(args.originLabel, MAX_STOP_LENGTH);

    return await ctx.db.insert("routeHistory", {
      userToken: identity.tokenIdentifier,
      prompt,
      homeAddress,
      parsedStops,
      deadline,
      orderedStops,
      totalDurationText,
      arrivalEstimate,
      originLabel,
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
