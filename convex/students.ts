import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("students").collect();
  },
});

export const add = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 100) throw new Error("Invalid student name");
    return ctx.db.insert("students", { name: trimmed, isActive: true });
  },
});

export const update = mutation({
  args: { id: v.id("students"), name: v.string() },
  handler: async (ctx, { id, name }) => {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 100) throw new Error("Invalid student name");
    await ctx.db.patch(id, { name: trimmed });
  },
});

export const setActive = mutation({
  args: { id: v.id("students"), isActive: v.boolean() },
  handler: async (ctx, { id, isActive }) => {
    await ctx.db.patch(id, { isActive });
  },
});
