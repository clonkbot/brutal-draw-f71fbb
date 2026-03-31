import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  drawings: defineTable({
    userId: v.id("users"),
    title: v.string(),
    strokes: v.array(v.object({
      points: v.array(v.object({
        x: v.number(),
        y: v.number(),
      })),
      color: v.string(),
      width: v.number(),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]).index("by_created", ["createdAt"]),

  gallery: defineTable({
    drawingId: v.id("drawings"),
    userId: v.id("users"),
    title: v.string(),
    imageData: v.string(),
    likes: v.number(),
    createdAt: v.number(),
  }).index("by_likes", ["likes"]).index("by_created", ["createdAt"]),
});
