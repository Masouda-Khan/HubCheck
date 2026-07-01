import { query } from "./_generated/server";

export const getData = query({
  args: {},
  handler: async (ctx) => {
    const locations = await ctx.db
      .query("locations")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return Promise.all(
      locations.map(async (location) => {
        const recentInspections = await ctx.db
          .query("inspections")
          .withIndex("by_location", (q) => q.eq("locationId", location._id))
          .order("desc")
          .take(3);

        const assignments = await ctx.db
          .query("assignments")
          .withIndex("by_location", (q) => q.eq("locationId", location._id))
          .collect();

        const assignmentsWithNames = await Promise.all(
          assignments.map(async (a) => {
            const student = await ctx.db.get(a.studentId);
            return { ...a, studentName: student?.name ?? "Unknown" };
          })
        );

        const score =
          recentInspections.length > 0
            ? Math.round(
                (recentInspections.reduce((sum, i) => sum + i.rating, 0) /
                  recentInspections.length) *
                  20
              )
            : null;

        return {
          ...location,
          score,
          latestInspection: recentInspections[0] ?? null,
          leaders: assignmentsWithNames.filter((a) => a.isLeader),
          members: assignmentsWithNames.filter((a) => !a.isLeader),
        };
      })
    );
  },
});
