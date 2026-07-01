import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByLocation = query({
  args: { locationId: v.id("locations") },
  handler: async (ctx, { locationId }) => {
    const assignments = await ctx.db
      .query("assignments")
      .withIndex("by_location", (q) => q.eq("locationId", locationId))
      .collect();

    return Promise.all(
      assignments.map(async (a) => {
        const student = await ctx.db.get(a.studentId);
        return { ...a, studentName: student?.name ?? "Unknown" };
      })
    );
  },
});

export const setForLocation = mutation({
  args: {
    locationId: v.id("locations"),
    assignments: v.array(
      v.object({ studentId: v.id("students"), isLeader: v.boolean() })
    ),
  },
  handler: async (ctx, { locationId, assignments }) => {
    const existing = await ctx.db
      .query("assignments")
      .withIndex("by_location", (q) => q.eq("locationId", locationId))
      .collect();

    await Promise.all(existing.map((a) => ctx.db.delete(a._id)));

    const seen = new Set<string>();
    for (const { studentId, isLeader } of assignments) {
      if (seen.has(studentId)) continue;
      seen.add(studentId);
      await ctx.db.insert("assignments", { locationId, studentId, isLeader });
    }
  },
});
