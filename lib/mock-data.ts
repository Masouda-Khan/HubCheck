import type { Location, Student, Assignment, Inspection, Flag, LocationWithData } from "./types";

export const LOCATIONS: Location[] = [
  { id: "loc-1", name: "FRC Field", isActive: true },
  { id: "loc-2", name: "Driver Stations", isActive: true },
  { id: "loc-3", name: "Workshop", isActive: true },
  { id: "loc-4", name: "Pits Area", isActive: true },
  { id: "loc-5", name: "Volleyball/Basketball Area", isActive: true },
  { id: "loc-6", name: "Computer Lab + FTC Build", isActive: true },
  { id: "loc-7", name: "Study Area & Parts/Inventory Room", isActive: true },
  { id: "loc-8", name: "FLL Area", isActive: true },
  { id: "loc-9", name: "Storage/Security & Front Desk", isActive: true },
];

export const STUDENTS: Student[] = [
  { id: "stu-1", name: "Aisha Nasser", isActive: true },
  { id: "stu-2", name: "Marco Rivera", isActive: true },
  { id: "stu-3", name: "Priya Singh", isActive: true },
  { id: "stu-4", name: "Jordan Chen", isActive: true },
  { id: "stu-5", name: "Emma Williams", isActive: true },
  { id: "stu-6", name: "Diego Morales", isActive: true },
  { id: "stu-7", name: "Sarah Kim", isActive: true },
  { id: "stu-8", name: "Liam O'Brien", isActive: true },
  { id: "stu-9", name: "Maya Patel", isActive: false },
  { id: "stu-10", name: "Alex Thompson", isActive: true },
];

export const ASSIGNMENTS: Assignment[] = [
  { locationId: "loc-1", studentId: "stu-1", isLeader: true, studentName: "Aisha Nasser" },
  { locationId: "loc-1", studentId: "stu-2", isLeader: false, studentName: "Marco Rivera" },
  { locationId: "loc-2", studentId: "stu-3", isLeader: true, studentName: "Priya Singh" },
  { locationId: "loc-2", studentId: "stu-4", isLeader: false, studentName: "Jordan Chen" },
  { locationId: "loc-3", studentId: "stu-5", isLeader: true, studentName: "Emma Williams" },
  { locationId: "loc-3", studentId: "stu-6", isLeader: false, studentName: "Diego Morales" },
  { locationId: "loc-3", studentId: "stu-7", isLeader: false, studentName: "Sarah Kim" },
  { locationId: "loc-4", studentId: "stu-8", isLeader: true, studentName: "Liam O'Brien" },
  { locationId: "loc-4", studentId: "stu-9", isLeader: false, studentName: "Maya Patel" },
  { locationId: "loc-5", studentId: "stu-10", isLeader: true, studentName: "Alex Thompson" },
  { locationId: "loc-5", studentId: "stu-1", isLeader: false, studentName: "Aisha Nasser" },
  { locationId: "loc-6", studentId: "stu-2", isLeader: true, studentName: "Marco Rivera" },
  { locationId: "loc-6", studentId: "stu-3", isLeader: false, studentName: "Priya Singh" },
  { locationId: "loc-7", studentId: "stu-4", isLeader: true, studentName: "Jordan Chen" },
  { locationId: "loc-7", studentId: "stu-5", isLeader: false, studentName: "Emma Williams" },
  { locationId: "loc-8", studentId: "stu-6", isLeader: true, studentName: "Diego Morales" },
  { locationId: "loc-8", studentId: "stu-8", isLeader: false, studentName: "Liam O'Brien" },
  { locationId: "loc-9", studentId: "stu-7", isLeader: true, studentName: "Sarah Kim" },
  { locationId: "loc-9", studentId: "stu-10", isLeader: false, studentName: "Alex Thompson" },
];

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

const RATINGS: number[][] = [
  [5, 4, 5, 4], // FRC Field       — streak 4
  [4, 4, 3, 4], // Driver Stations — streak 2
  [5, 5, 4, 5], // Workshop        — streak 4
  [3, 2, 3, 2], // Pits Area       — streak 0
  [4, 3, 4, 3], // Volleyball      — streak 1
  [4, 4, 4, 3], // Computer Lab    — streak 3
  [2, 2, 3, 2], // Study Area      — streak 0
  [5, 4, 5, 4], // FLL Area        — streak 4
  [3, 3, 4, 3], // Storage         — streak 0
];

export const INSPECTIONS: Inspection[] = LOCATIONS.flatMap((loc, locIdx) =>
  RATINGS[locIdx].map((rating, weekIdx) => ({
    id: `insp-${loc.id}-${weekIdx}`,
    locationId: loc.id,
    rating,
    date: daysAgo(weekIdx * 7),
    inspectorName: "Admin",
    notes: weekIdx === 0 && rating <= 3 ? "Needs improvement before next week." : undefined,
  }))
);

export const CHECKLIST_TEMPLATES: Record<string, string[]> = {
  "loc-1": ["Clear field of debris", "Check game pieces", "Sweep playing area", "Remove stray tools"],
  "loc-2": ["Wipe driver station surfaces", "Coil cables neatly", "Return radio equipment", "Check laptop batteries"],
  "loc-3": ["Sweep floor", "Return tools to pegboard", "Empty trash", "Wipe workbenches", "Organize materials", "Ensure power tools are off"],
  "loc-4": ["Clear aisles of pit materials", "Organize pit bins", "Sweep pit area", "Return shared tools"],
  "loc-5": ["Clear sports equipment", "Sweep floor", "Put away nets and gear", "Tidy seating area"],
  "loc-6": ["Log off all computers", "Return FTC build materials", "Wipe keyboards", "Organize cables", "Empty trash"],
  "loc-7": ["Return parts to inventory bins", "Label unlabeled parts", "Tidy study tables", "Return chairs", "Empty trash"],
  "loc-8": ["Organize FLL field", "Store robot materials", "Return FLL kits", "Clear table surfaces"],
  "loc-9": ["Organize storage shelves", "Clean front desk", "File loose papers", "Ensure storage is locked"],
};

export const SAMPLE_FLAGS: Flag[] = [
  {
    id: "flag-1",
    locationId: "loc-7",
    reason: "Wet floor near electrical outlets — needs immediate attention",
    priority: "safety",
    flaggedBy: "Jordan Chen",
    createdAt: daysAgo(1),
    resolved: false,
    volunteers: ["Marco Rivera"],
  },
  {
    id: "flag-2",
    locationId: "loc-4",
    reason: "Major cleanup needed after yesterday's practice session",
    priority: "high",
    flaggedBy: "Admin",
    createdAt: daysAgo(0),
    resolved: false,
    volunteers: [],
  },
];

export function computeLocationData(
  loc: Location,
  inspections: Inspection[]
): LocationWithData {
  const all = inspections
    .filter((i) => i.locationId === loc.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const latest = all[0] ?? null;
  const averageRating =
    all.length > 0
      ? Math.round((all.reduce((s, i) => s + i.rating, 0) / all.length) * 10) / 10
      : null;

  let streak = 0;
  for (const insp of all) {
    if (insp.rating >= 4) streak++;
    else break;
  }

  return {
    ...loc,
    latestRating: latest?.rating ?? null,
    averageRating,
    inspectionCount: all.length,
    streak,
    latestInspection: latest,
    leaders: ASSIGNMENTS.filter((a) => a.locationId === loc.id && a.isLeader),
    members: ASSIGNMENTS.filter((a) => a.locationId === loc.id && !a.isLeader),
  };
}

export const DASHBOARD_DATA: LocationWithData[] = LOCATIONS.map((loc) =>
  computeLocationData(loc, INSPECTIONS)
);
