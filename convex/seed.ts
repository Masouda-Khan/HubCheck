import { mutation } from "./_generated/server";

const DEFAULT_LOCATIONS = [
  "FRC Field",
  "Driver Stations",
  "Workshop",
  "Pits Area",
  "Volleyball/Basketball Area",
  "Computer Lab + FTC Build",
  "Study Area & Parts/Inventory Room",
  "FLL Area",
  "Storage/Security & Front Desk",
];

const SAMPLE_STUDENTS = [
  "Aisha Nasser",
  "Marco Rivera",
  "Priya Singh",
  "Jordan Chen",
  "Emma Williams",
  "Diego Morales",
  "Sarah Kim",
  "Liam O'Brien",
  "Maya Patel",
  "Alex Thompson",
];

// ratings per location for weeks 0–3 (most recent first)
const INSPECTION_RATINGS = [
  [5, 4, 5, 4], // FRC Field
  [4, 4, 3, 4], // Driver Stations
  [5, 5, 4, 5], // Workshop
  [3, 2, 3, 2], // Pits Area
  [4, 3, 4, 3], // Volleyball
  [4, 4, 4, 3], // Computer Lab
  [2, 2, 3, 2], // Study Area
  [5, 4, 5, 4], // FLL Area
  [3, 3, 4, 3], // Storage
];

const ASSIGNMENT_MAP = [
  { locIdx: 0, stuIdx: 0, isLeader: true },
  { locIdx: 0, stuIdx: 1, isLeader: false },
  { locIdx: 1, stuIdx: 2, isLeader: true },
  { locIdx: 1, stuIdx: 3, isLeader: false },
  { locIdx: 2, stuIdx: 4, isLeader: true },
  { locIdx: 2, stuIdx: 5, isLeader: false },
  { locIdx: 2, stuIdx: 6, isLeader: false },
  { locIdx: 3, stuIdx: 7, isLeader: true },
  { locIdx: 3, stuIdx: 8, isLeader: false },
  { locIdx: 4, stuIdx: 9, isLeader: true },
  { locIdx: 4, stuIdx: 0, isLeader: false },
  { locIdx: 5, stuIdx: 1, isLeader: true },
  { locIdx: 5, stuIdx: 2, isLeader: false },
  { locIdx: 6, stuIdx: 3, isLeader: true },
  { locIdx: 6, stuIdx: 4, isLeader: false },
  { locIdx: 7, stuIdx: 5, isLeader: true },
  { locIdx: 7, stuIdx: 7, isLeader: false },
  { locIdx: 8, stuIdx: 6, isLeader: true },
  { locIdx: 8, stuIdx: 9, isLeader: false },
];

export const seedData = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("locations").first();
    if (existing) return { alreadySeeded: true };

    const locationIds = await Promise.all(
      DEFAULT_LOCATIONS.map((name) =>
        ctx.db.insert("locations", { name, isActive: true })
      )
    );

    const studentIds = await Promise.all(
      SAMPLE_STUDENTS.map((name) =>
        ctx.db.insert("students", { name, isActive: true })
      )
    );

    await Promise.all(
      ASSIGNMENT_MAP.map(({ locIdx, stuIdx, isLeader }) =>
        ctx.db.insert("assignments", {
          locationId: locationIds[locIdx],
          studentId: studentIds[stuIdx],
          isLeader,
        })
      )
    );

    const today = new Date();
    const inspectionInserts = [];
    for (let locIdx = 0; locIdx < locationIds.length; locIdx++) {
      for (let week = 0; week < 4; week++) {
        const d = new Date(today);
        d.setDate(d.getDate() - week * 7);
        const date = d.toISOString().split("T")[0];
        inspectionInserts.push(
          ctx.db.insert("inspections", {
            locationId: locationIds[locIdx],
            rating: INSPECTION_RATINGS[locIdx][week],
            date,
            inspectorName: "Admin",
          })
        );
      }
    }
    await Promise.all(inspectionInserts);

    return { seeded: true };
  },
});
