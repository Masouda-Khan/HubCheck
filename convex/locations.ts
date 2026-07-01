import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query("locations")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const add = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 100) throw new Error("Invalid location name");
    return ctx.db.insert("locations", { name: trimmed, isActive: true });
  },
});

export const update = mutation({
  args: { id: v.id("locations"), name: v.string() },
  handler: async (ctx, { id, name }) => {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 100) throw new Error("Invalid location name");
    await ctx.db.patch(id, { name: trimmed });
  },
});

export const remove = mutation({
  args: { id: v.id("locations") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { isActive: false });
  },
});
