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
  })
});