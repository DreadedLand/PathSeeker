import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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

    return await ctx.db.insert("routeHistory", {
      userToken: identity.tokenIdentifier,
      prompt: args.prompt,
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
    if (!name || !address) {
      throw new Error("Name and address are required");
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
