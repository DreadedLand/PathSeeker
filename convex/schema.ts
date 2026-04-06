// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    author: v.string(),
    body: v.string(),
    email: v.string(),  
    user: v.id("users"),
  }).index("by_author", ["author"]),

  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.string(),
  }).index("by_token", ["tokenIdentifier"]),

  tasks: defineTable({
    title: v.string(),
    description: v.string(),
  }),

  routeHistory: defineTable({
    userToken: v.string(),
    prompt: v.string(),
    homeAddress: v.optional(v.string()),
    parsedStops: v.array(v.string()),
    deadline: v.optional(v.string()),
    orderedStops: v.array(v.string()),
    totalDurationText: v.string(),
    arrivalEstimate: v.optional(v.string()),
    originLabel: v.optional(v.string()),
  }).index("by_user", ["userToken"]),

  savedPlaces: defineTable({
    userToken: v.string(),
    name: v.string(),
    address: v.string(),
  }).index("by_user", ["userToken"]),
});
