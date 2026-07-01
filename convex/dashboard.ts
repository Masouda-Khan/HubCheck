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
        const allInspections = await ctx.db
          .query("inspections")
          .withIndex("by_location", (q) => q.eq("locationId", location._id))
          .order("desc")
          .collect();

        const latestInspection = allInspections[0] ?? null;
        const latestRating = latestInspection?.rating ?? null;

        const averageRating =
          allInspections.length > 0
            ? Math.round(
                (allInspections.reduce((s, i) => s + i.rating, 0) / allInspections.length) * 10
              ) / 10
            : null;

        let streak = 0;
        for (const insp of allInspections) {
          if (insp.rating >= 4) streak++;
          else break;
        }

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

        return {
          _id: location._id,
          name: location.name,
          isActive: location.isActive,
          latestRating,
          averageRating,
          inspectionCount: allInspections.length,
          streak,
          latestInspection,
          leaders: assignmentsWithNames.filter((a) => a.isLeader),
          members: assignmentsWithNames.filter((a) => !a.isLeader),
        };
      })
    );
  },
});
