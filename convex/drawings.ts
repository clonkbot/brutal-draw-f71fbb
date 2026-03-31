import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("drawings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("drawings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("drawings", {
      userId,
      title: args.title,
      strokes: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const addStroke = mutation({
  args: {
    id: v.id("drawings"),
    stroke: v.object({
      points: v.array(v.object({
        x: v.number(),
        y: v.number(),
      })),
      color: v.string(),
      width: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const drawing = await ctx.db.get(args.id);
    if (!drawing || drawing.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(args.id, {
      strokes: [...drawing.strokes, args.stroke],
      updatedAt: Date.now(),
    });
  },
});

export const clearStrokes = mutation({
  args: { id: v.id("drawings") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const drawing = await ctx.db.get(args.id);
    if (!drawing || drawing.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(args.id, {
      strokes: [],
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("drawings") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const drawing = await ctx.db.get(args.id);
    if (!drawing || drawing.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});
