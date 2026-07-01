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
    rating: v.number(), // 1–5
    notes: v.optional(v.string()),
    date: v.string(), // YYYY-MM-DD
    inspectorName: v.string(),
  }).index("by_location", ["locationId"]),
});
