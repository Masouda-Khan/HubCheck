import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByLocation = query({
  args: { locationId: v.id("locations") },
  handler: async (ctx, { locationId }) => {
    const tmpl = await ctx.db
      .query("checklistTemplates")
      .withIndex("by_location", (q) => q.eq("locationId", locationId))
      .first();
    return tmpl?.items ?? [];
  },
});

export const setForLocation = mutation({
  args: { locationId: v.id("locations"), items: v.array(v.string()) },
  handler: async (ctx, { locationId, items }) => {
    const clean = items.map((s) => s.trim()).filter((s) => s.length > 0 && s.length <= 200);
    const existing = await ctx.db
      .query("checklistTemplates")
      .withIndex("by_location", (q) => q.eq("locationId", locationId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { items: clean });
    } else {
      await ctx.db.insert("checklistTemplates", { locationId, items: clean });
    }
  },
});
