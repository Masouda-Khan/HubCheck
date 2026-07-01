import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const add = mutation({
  args: {
    locationId: v.id("locations"),
    rating: v.number(),
    notes: v.optional(v.string()),
    date: v.string(),
    inspectorName: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.rating < 1 || args.rating > 5 || !Number.isInteger(args.rating)) {
      throw new Error("Rating must be an integer between 1 and 5");
    }
    const trimmedInspector = args.inspectorName.trim();
    if (!trimmedInspector || trimmedInspector.length > 100) {
      throw new Error("Invalid inspector name");
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(args.date)) {
      throw new Error("Invalid date format");
    }
    const trimmedNotes = args.notes?.trim();
    return ctx.db.insert("inspections", {
      ...args,
      inspectorName: trimmedInspector,
      notes: trimmedNotes || undefined,
    });
  },
});

export const getByLocation = query({
  args: { locationId: v.id("locations") },
  handler: async (ctx, { locationId }) => {
    return ctx.db
      .query("inspections")
      .withIndex("by_location", (q) => q.eq("locationId", locationId))
      .order("desc")
      .collect();
  },
});
