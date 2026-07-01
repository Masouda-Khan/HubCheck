import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const add = mutation({
  args: {
    locationId: v.id("locations"),
    date: v.string(),
    completedBy: v.string(),
    checkedItems: v.array(v.string()),
    totalItems: v.number(),
  },
  handler: async (ctx, args) => {
    const trimmedBy = args.completedBy.trim();
    if (!trimmedBy || trimmedBy.length > 100) throw new Error("Invalid name");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(args.date)) throw new Error("Invalid date");
    return ctx.db.insert("checklistRuns", { ...args, completedBy: trimmedBy });
  },
});

export const getByLocation = query({
  args: { locationId: v.id("locations") },
  handler: async (ctx, { locationId }) => {
    return ctx.db
      .query("checklistRuns")
      .withIndex("by_location", (q) => q.eq("locationId", locationId))
      .order("desc")
      .take(10);
  },
});
