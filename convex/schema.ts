import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  locations: defineTable({
    name: v.string(),
    isActive: v.boolean(),
  }),

  students: defineTable({
    name: v.string(),
    isActive: v.boolean(),
  }),

  assignments: defineTable({
    locationId: v.id("locations"),
    studentId: v.id("students"),
    isLeader: v.boolean(),
  })
    .index("by_location", ["locationId"])
    .index("by_student", ["studentId"]),

  inspections: defineTable({
    locationId: v.id("locations"),
    rating: v.number(),
    notes: v.optional(v.string()),
    date: v.string(),
    inspectorName: v.string(),
    photoUrls: v.optional(v.array(v.string())),
  }).index("by_location", ["locationId"]),

  flags: defineTable({
    locationId: v.id("locations"),
    reason: v.string(),
    priority: v.union(v.literal("low"), v.literal("high"), v.literal("safety")),
    flaggedBy: v.string(),
    resolved: v.boolean(),
    volunteers: v.array(v.string()),
  })
    .index("by_location", ["locationId"])
    .index("by_resolved", ["resolved"]),

  shoutouts: defineTable({
    locationId: v.id("locations"),
    message: v.string(),
    givenBy: v.string(),
  }).index("by_location", ["locationId"]),

  checklistTemplates: defineTable({
    locationId: v.id("locations"),
    items: v.array(v.string()),
  }).index("by_location", ["locationId"]),

  checklistRuns: defineTable({
    locationId: v.id("locations"),
    date: v.string(),
    completedBy: v.string(),
    checkedItems: v.array(v.string()),
    totalItems: v.number(),
  }).index("by_location", ["locationId"]),
});
