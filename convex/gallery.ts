import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("gallery")
      .withIndex("by_created")
      .order("desc")
      .take(50);
  },
});

export const publish = mutation({
  args: {
    drawingId: v.id("drawings"),
    title: v.string(),
    imageData: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const drawing = await ctx.db.get(args.drawingId);
    if (!drawing || drawing.userId !== userId) throw new Error("Not found");
    return await ctx.db.insert("gallery", {
      drawingId: args.drawingId,
      userId,
      title: args.title,
      imageData: args.imageData,
      likes: 0,
      createdAt: Date.now(),
    });
  },
});

export const like = mutation({
  args: { id: v.id("gallery") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Not found");
    await ctx.db.patch(args.id, {
      likes: item.likes + 1,
    });
  },
});
