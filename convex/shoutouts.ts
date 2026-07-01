import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("shoutouts").order("desc").take(20);
  },
});

export const add = mutation({
  args: {
    locationId: v.id("locations"),
    message: v.string(),
    givenBy: v.string(),
  },
  handler: async (ctx, { locationId, message, givenBy }) => {
    const trimmedMsg = message.trim();
    const trimmedBy = givenBy.trim();
    if (!trimmedMsg || trimmedMsg.length > 500) throw new Error("Invalid message");
    if (!trimmedBy || trimmedBy.length > 100) throw new Error("Invalid name");
    return ctx.db.insert("shoutouts", {
      locationId,
      message: trimmedMsg,
      givenBy: trimmedBy,
    });
  },
});
