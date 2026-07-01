import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query("flags")
      .withIndex("by_resolved", (q) => q.eq("resolved", false))
      .order("desc")
      .collect();
  },
});

export const add = mutation({
  args: {
    locationId: v.id("locations"),
    reason: v.string(),
    priority: v.union(v.literal("low"), v.literal("high"), v.literal("safety")),
    flaggedBy: v.string(),
  },
  handler: async (ctx, { locationId, reason, priority, flaggedBy }) => {
    const trimmedReason = reason.trim();
    const trimmedBy = flaggedBy.trim();
    if (!trimmedReason || trimmedReason.length > 500) throw new Error("Invalid reason");
    if (!trimmedBy || trimmedBy.length > 100) throw new Error("Invalid name");
    return ctx.db.insert("flags", {
      locationId,
      reason: trimmedReason,
      priority,
      flaggedBy: trimmedBy,
      resolved: false,
      volunteers: [],
    });
  },
});

export const resolve = mutation({
  args: { id: v.id("flags") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { resolved: true });
  },
});

export const volunteer = mutation({
  args: { id: v.id("flags"), name: v.string() },
  handler: async (ctx, { id, name }) => {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 100) throw new Error("Invalid name");
    const flag = await ctx.db.get(id);
    if (!flag) throw new Error("Flag not found");
    if (flag.volunteers.includes(trimmed)) return;
    await ctx.db.patch(id, { volunteers: [...flag.volunteers, trimmed] });
  },
});
